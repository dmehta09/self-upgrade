/* ============================================================
   DSA Field Guide — recursion-tree explorer (.rtree)
   Steps through the CALL TREE of a recursive algorithm: nodes
   appear when called, turn green when they return, leaves can
   emit outputs, and memoization hits glow amber with a dashed
   link back to the original computation — the picture that makes
   backtracking and memoized DP click.
   Layout and viewBox are computed purely from the config (tidy
   tree: leaves take slots, parents center over children), so it
   renders correctly inside .reveal-hidden sections.
   Offline, no deps, theme-aware, honors prefers-reduced-motion.

   Authoring:
     <figure class="rtree reveal" data-rtree>
       <figcaption class="viz-title">subsets([1,2]) — the choice tree</figcaption>
       <div class="rt-stage"></div>
       <div class="rt-caption" aria-live="polite"></div>
       <div class="viz-controls" role="group">…reset/prev/play/next/progress/step…</div>
       <script type="application/json" class="rtree-config">
       { "nodes": [ {"id":"r","label":"f(0,[])","parent":null}, … ],
         "frames": [ {"call":"r","caption":"…"},
                     {"call":"a","caption":"…"},
                     {"emit":"a","value":"[1,2]"},
                     {"return":"a"},
                     {"memo":"b","of":"a","caption":"already computed!"} ] }
       </script>
     </figure>
   Frame ops: call / return (opt. value) / emit (opt. value) /
   memo (+ "of" node) — plus caption on any frame.
   ============================================================ */
(function () {
  "use strict";
  var NS = "http://www.w3.org/2000/svg";
  var REDUCED = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function onReady(fn) { if (document.readyState !== "loading") fn(); else document.addEventListener("DOMContentLoaded", fn); }
  function svgEl(t, attrs) { var e = document.createElementNS(NS, t); for (var k in attrs) e.setAttribute(k, attrs[k]); return e; }

  function init(fig) {
    var cfgEl = fig.querySelector(".rtree-config") || fig.querySelector("script[type='application/json']");
    var cfg = null;
    if (cfgEl) { try { cfg = JSON.parse(cfgEl.textContent); } catch (e) { cfg = null; } }
    if (!cfg || !cfg.nodes || !cfg.nodes.length || !cfg.frames || !cfg.frames.length) return;

    var NW = cfg.nodeW || 96, NH = cfg.nodeH || 34, GX = cfg.gapX || 14, GY = cfg.gapY || 46, PAD = 12;

    /* ---------- build the tree + tidy layout ---------- */
    var byId = {}, roots = [];
    cfg.nodes.forEach(function (n) { byId[n.id] = { cfg: n, children: [], x: 0, depth: 0 }; });
    cfg.nodes.forEach(function (n) {
      if (n.parent != null && byId[n.parent]) byId[n.parent].children.push(byId[n.id]);
      else roots.push(byId[n.id]);
    });
    var slot = 0, maxDepth = 0;
    (function layout(nodes, depth) {
      nodes.forEach(function (nd) {
        nd.depth = depth; if (depth > maxDepth) maxDepth = depth;
        if (!nd.children.length) { nd.x = slot++; }
        else {
          layout(nd.children, depth + 1);
          nd.x = (nd.children[0].x + nd.children[nd.children.length - 1].x) / 2;
        }
      });
    })(roots, 0);
    var W = PAD * 2 + slot * NW + (slot - 1) * GX;
    var H = PAD * 2 + (maxDepth + 1) * NH + maxDepth * GY + 16; /* +16 for value badges */
    function cx(nd) { return PAD + nd.x * (NW + GX) + NW / 2; }
    function cy(nd) { return PAD + nd.depth * (NH + GY) + NH / 2; }

    /* ---------- render the full (hidden) tree once ---------- */
    var stage = fig.querySelector(".rt-stage");
    if (!stage) return;
    stage.innerHTML = "";
    var svg = svgEl("svg", { viewBox: "0 0 " + W + " " + H, "class": "rt-svg", role: "img" });
    var edgeLayer = svgEl("g", {}), memoLayer = svgEl("g", {}), nodeLayer = svgEl("g", {});
    svg.appendChild(edgeLayer); svg.appendChild(memoLayer); svg.appendChild(nodeLayer);

    var edges = {};   /* childId -> path */
    var gs = {};      /* nodeId  -> {g, rect, badge} */
    cfg.nodes.forEach(function (n) {
      var nd = byId[n.id];
      if (n.parent != null && byId[n.parent]) {
        var p = byId[n.parent];
        var path = svgEl("path", {
          d: "M " + cx(p) + " " + (cy(p) + NH / 2) + " C " + cx(p) + " " + (cy(p) + NH / 2 + GY / 2) + ", " +
             cx(nd) + " " + (cy(nd) - NH / 2 - GY / 2) + ", " + cx(nd) + " " + (cy(nd) - NH / 2),
          "class": "rt-edge"
        });
        edgeLayer.appendChild(path);
        edges[n.id] = path;
      }
      var g = svgEl("g", { "class": "rt-node" });
      var rect = svgEl("rect", { x: cx(nd) - NW / 2, y: cy(nd) - NH / 2, width: NW, height: NH, rx: 9, "class": "rt-rect" });
      var label = svgEl("text", { x: cx(nd), y: cy(nd), "class": "rt-label" });
      label.textContent = n.label;
      var badge = svgEl("text", { x: cx(nd), y: cy(nd) + NH / 2 + 13, "class": "rt-badge" });
      g.appendChild(rect); g.appendChild(label); g.appendChild(badge);
      nodeLayer.appendChild(g);
      gs[n.id] = { g: g, badge: badge, node: nd };
    });
    stage.appendChild(svg);

    /* ---------- frame state machine (recompute 0..k → scrubbable) ---------- */
    var frames = cfg.frames, total = frames.length, cur = -1, playTimer = null;
    var captionEl = fig.querySelector(".rt-caption");
    var btnReset = fig.querySelector(".viz-reset"), btnPrev = fig.querySelector(".viz-prev"),
        btnPlay = fig.querySelector(".viz-play"), btnNext = fig.querySelector(".viz-next"),
        fillEl = fig.querySelector(".viz-progress-fill"), stepEl = fig.querySelector(".viz-step"),
        speedSel = fig.querySelector(".viz-speed-sel");

    function apply(k) {
      cur = Math.max(0, Math.min(k, total - 1));
      /* recompute cumulative state from frame 0..cur */
      var visible = {}, done = {}, emit = {}, memo = {}, values = {}, active = null, caption = "";
      var memoLinks = [];
      for (var i = 0; i <= cur; i++) {
        var f = frames[i];
        if (f.call != null)   { visible[f.call] = true; active = f.call; }
        if (f.return != null) { done[f.return] = true; if (f.value != null) values[f.return] = f.value; active = byId[f.return] && byId[f.return].cfg.parent; }
        if (f.emit != null)   { visible[f.emit] = true; emit[f.emit] = true; if (f.value != null) values[f.emit] = f.value; active = f.emit; }
        if (f.memo != null)   { visible[f.memo] = true; memo[f.memo] = true; active = f.memo; if (f.value != null) values[f.memo] = f.value; if (f.of != null) memoLinks.push([f.memo, f.of]); }
        if (f.caption) caption = f.caption;
      }
      /* paint nodes + edges */
      Object.keys(gs).forEach(function (id) {
        var entry = gs[id], cls = "rt-node";
        if (!visible[id]) cls += " hide";
        else {
          if (memo[id]) cls += " is-memo";
          else if (done[id]) cls += " is-done";   /* returned wins: the "undo" moment */
          else if (emit[id]) cls += " is-emit";
          if (id === active) cls += " is-active";
        }
        entry.g.setAttribute("class", cls);
        entry.badge.textContent = (visible[id] && values[id] != null) ? values[id] : "";
        if (edges[id]) edges[id].setAttribute("class", "rt-edge" + (visible[id] ? " on" : ""));
      });
      /* memo back-links */
      memoLayer.innerHTML = "";
      memoLinks.forEach(function (pair) {
        var a = byId[pair[0]], b = byId[pair[1]];
        if (!a || !b) return;
        memoLayer.appendChild(svgEl("path", {
          d: "M " + cx(a) + " " + cy(a) + " Q " + ((cx(a) + cx(b)) / 2) + " " + (Math.min(cy(a), cy(b)) - 26) + " " + cx(b) + " " + cy(b),
          "class": "rt-memolink"
        }));
      });
      if (captionEl) captionEl.textContent = caption;
      if (fillEl) fillEl.style.width = (total > 1 ? (cur / (total - 1)) * 100 : 100) + "%";
      if (stepEl) stepEl.textContent = (cur + 1) + " / " + total;
    }

    function stopPlay() {
      if (playTimer) { clearInterval(playTimer); playTimer = null; }
      if (btnPlay) { btnPlay.textContent = "▶"; btnPlay.setAttribute("aria-label", "Play"); }
    }
    function step(d) { stopPlay(); apply(cur + d); }
    function play() {
      if (playTimer) { stopPlay(); return; }
      if (REDUCED) { apply(total - 1); return; }
      if (cur >= total - 1) apply(0);
      btnPlay.textContent = "⏸"; btnPlay.setAttribute("aria-label", "Pause");
      var delay = speedSel ? +speedSel.value || 1000 : 1000;
      playTimer = setInterval(function () {
        if (cur >= total - 1) stopPlay();
        else apply(cur + 1);
      }, delay);
    }

    if (btnReset) btnReset.addEventListener("click", function () { stopPlay(); apply(0); });
    if (btnPrev)  btnPrev.addEventListener("click", function () { step(-1); });
    if (btnNext)  btnNext.addEventListener("click", function () { step(1); });
    if (btnPlay)  btnPlay.addEventListener("click", play);
    if (speedSel) speedSel.addEventListener("change", function () { if (playTimer) { stopPlay(); play(); } });

    fig.addEventListener("keydown", function (ev) {
      if (ev.key === "ArrowRight") { step(1); ev.preventDefault(); }
      else if (ev.key === "ArrowLeft") { step(-1); ev.preventDefault(); }
      else if (ev.key === " ") { play(); ev.preventDefault(); }
      else if (ev.key === "Home") { stopPlay(); apply(0); ev.preventDefault(); }
    });
    if (!fig.hasAttribute("tabindex")) fig.setAttribute("tabindex", "0");

    apply(0);
  }

  onReady(function () { document.querySelectorAll(".rtree").forEach(init); });
})();
