/* ============================================================
   CKA Field Guide — request-flow player (.reqflow)
   A tiny, dependency-free, data-driven engine that draws an
   architecture as labelled boxes on a column/row grid and then
   walks a request through it edge by edge, with a plain-English
   caption at every hop. Offline, theme-aware (reads --accent via
   CSS), keyboard-driven, and honors prefers-reduced-motion.

   Authoring:
     <figure class="reqflow" data-reqflow> … controls …
       <script type="application/json" class="rf-config">
       {
         "title": "Reading a short URL",
         "nodes": [ { "id":"client","label":"Client","type":"user","col":0,"row":1 }, … ],
         "edges": [ { "from":"client","to":"lb","label":"GET /abc" }, … ],
         "steps": [ { "edge":["client","lb"], "caption":"…", "latency":"~1 ms" },
                    { "node":"cache", "caption":"Cache hit!", "status":"hit" }, … ]
       }
       </script>
     </figure>

   status ∈ "hit" | "miss" tints the target node green / red.
   ============================================================ */
(function () {
  "use strict";
  var SVGNS = "http://www.w3.org/2000/svg";
  var REDUCED = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  var W = 138, H = 52, GAPX = 60, GAPY = 38, PAD = 22, HW = W / 2, HH = H / 2;

  function svg(tag, attrs) {
    var e = document.createElementNS(SVGNS, tag);
    if (attrs) for (var k in attrs) e.setAttribute(k, attrs[k]);
    return e;
  }
  function cls(node, name, on) { node.classList.toggle(name, !!on); }

  /* boundary point on a box (cx,cy) heading toward (tx,ty) */
  function boundary(cx, cy, tx, ty) {
    var dx = tx - cx, dy = ty - cy;
    if (dx === 0 && dy === 0) return { x: cx, y: cy };
    var sx = dx !== 0 ? HW / Math.abs(dx) : Infinity;
    var sy = dy !== 0 ? HH / Math.abs(dy) : Infinity;
    var s = Math.min(sx, sy);
    return { x: cx + dx * s, y: cy + dy * s };
  }

  function Engine(fig) {
    var confEl = fig.querySelector(".rf-config");
    if (!confEl) return;
    var cfg; try { cfg = JSON.parse(confEl.textContent); } catch (e) { return; }
    var nodes = cfg.nodes || [], edges = cfg.edges || [], steps = cfg.steps || [];
    if (!nodes.length || !steps.length) return;

    var stage = fig.querySelector(".rf-stage");
    var capEl = fig.querySelector(".rf-caption");
    var fill = fig.querySelector(".rf-progress-fill");
    var stepEl = fig.querySelector(".rf-step");
    var playBtn = fig.querySelector(".rf-play");
    var speedEl = fig.querySelector(".rf-speed-sel");

    /* ---- layout ---- */
    var maxCol = 0, maxRow = 0, pos = {};
    nodes.forEach(function (n) { maxCol = Math.max(maxCol, n.col || 0); maxRow = Math.max(maxRow, n.row || 0); });
    var cols = maxCol + 1, rows = maxRow + 1;
    var width = PAD * 2 + cols * W + (cols - 1) * GAPX;
    var height = PAD * 2 + rows * H + (rows - 1) * GAPY;
    nodes.forEach(function (n) {
      pos[n.id] = { x: PAD + HW + (n.col || 0) * (W + GAPX), y: PAD + HH + (n.row || 0) * (H + GAPY) };
    });

    var s = svg("svg", { class: "rf-svg", viewBox: "0 0 " + width + " " + height });
    stage.innerHTML = ""; stage.appendChild(s);

    /* ---- edges (path + arrowhead + optional label) ---- */
    var edgeEls = {};
    edges.forEach(function (e) {
      var a = pos[e.from], b = pos[e.to]; if (!a || !b) return;
      var p1 = boundary(a.x, a.y, b.x, b.y), p2 = boundary(b.x, b.y, a.x, a.y);
      var dx = p2.x - p1.x, dy = p2.y - p1.y, L = Math.sqrt(dx * dx + dy * dy) || 1, ux = dx / L, uy = dy / L;
      var tipX = p2.x - ux * 3, tipY = p2.y - uy * 3;          // pull tip back a touch
      var bx = tipX - ux * 9, by = tipY - uy * 9, px = -uy * 5, py = ux * 5;
      var path = svg("path", { class: "rf-edge", d: "M" + p1.x + " " + p1.y + " L" + (tipX - ux * 5) + " " + (tipY - uy * 5) });
      var ahead = svg("polygon", { class: "rf-ahead", points: tipX + "," + tipY + " " + (bx + px) + "," + (by + py) + " " + (bx - px) + "," + (by - py) });
      s.appendChild(path); s.appendChild(ahead);
      var label = null;
      if (e.label) {
        label = svg("text", { class: "rf-elabel", x: (p1.x + p2.x) / 2, y: (p1.y + p2.y) / 2 - 7 });
        label.textContent = e.label; s.appendChild(label);
      }
      edgeEls[e.from + "|" + e.to] = { path: path, ahead: ahead, label: label, p1: p1, p2: p2 };
    });

    /* ---- nodes (rect + type tag + label) ---- */
    var nodeEls = {};
    nodes.forEach(function (n) {
      var c = pos[n.id];
      var g = svg("g", { class: "rf-node", "data-id": n.id });
      g.appendChild(svg("rect", { class: "rf-nrect", x: c.x - HW, y: c.y - HH, width: W, height: H, rx: 11 }));
      if (n.type) {
        var tt = svg("text", { class: "rf-ntype", x: c.x, y: c.y - 9 }); tt.textContent = n.type; g.appendChild(tt);
      }
      var lt = svg("text", { class: "rf-nlabel", x: c.x, y: c.y + (n.type ? 8 : 1) }); lt.textContent = n.label || n.id; g.appendChild(lt);
      s.appendChild(g); nodeEls[n.id] = g;
    });

    /* ---- playback ---- */
    var i = 0, timer = null, raf = 0, delay = speedEl ? +speedEl.value : 1100;

    function clearPacket() { if (raf) { cancelAnimationFrame(raf); raf = 0; } var old = s.querySelector(".rf-packet"); if (old) old.remove(); }

    function animatePacket(ed) {
      clearPacket();
      if (REDUCED) return;
      var dot = svg("circle", { class: "rf-packet", r: 5, cx: ed.p1.x, cy: ed.p1.y });
      s.appendChild(dot);
      var dur = Math.min(delay * 0.72, 760), t0 = 0;
      function frame(ts) {
        if (!t0) t0 = ts;
        var k = Math.min(1, (ts - t0) / dur);
        var e = k < .5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2;   // easeInOutQuad
        dot.setAttribute("cx", ed.p1.x + (ed.p2.x - ed.p1.x) * e);
        dot.setAttribute("cy", ed.p1.y + (ed.p2.y - ed.p1.y) * e);
        if (k < 1) raf = requestAnimationFrame(frame); else { raf = 0; dot.remove(); }
      }
      raf = requestAnimationFrame(frame);
    }

    function render() {
      // reset all
      for (var key in edgeEls) { var ee = edgeEls[key]; ["on", "seen"].forEach(function (c) { ee.path.classList.remove(c); ee.ahead.classList.remove(c); if (ee.label) ee.label.classList.remove(c); }); }
      Object.keys(nodeEls).forEach(function (id) { nodeEls[id].classList.remove("active", "hit", "miss"); });

      // cumulative trail from earlier edge steps
      for (var k = 0; k < i; k++) {
        var st = steps[k];
        if (st.edge) { var t = edgeEls[st.edge[0] + "|" + st.edge[1]]; if (t) { t.path.classList.add("seen"); t.ahead.classList.add("seen"); } }
      }

      var cur = steps[i];
      if (cur.edge) {
        var ed = edgeEls[cur.edge[0] + "|" + cur.edge[1]];
        if (ed) {
          ed.path.classList.add("on"); ed.ahead.classList.add("on"); if (ed.label) ed.label.classList.add("on");
          animatePacket(ed);
        }
        var tgt = nodeEls[cur.edge[1]];
        if (tgt) { cls(tgt, "active", true); if (cur.status) cls(tgt, cur.status, true); }
      } else if (cur.node && nodeEls[cur.node]) {
        cls(nodeEls[cur.node], "active", true);
        if (cur.status) cls(nodeEls[cur.node], cur.status, true);
      }

      if (capEl) capEl.textContent = (cur.caption || "") + (cur.latency ? "  ·  " + cur.latency : "");
      if (fill) fill.style.width = (steps.length < 2 ? 100 : (i / (steps.length - 1)) * 100) + "%";
      if (stepEl) stepEl.textContent = (i + 1) + " / " + steps.length;
    }

    function go(n) { i = Math.max(0, Math.min(steps.length - 1, n)); render(); }
    function setPlay(g, l) { if (playBtn) { playBtn.textContent = g; playBtn.setAttribute("aria-label", l); } }
    function stop() { if (timer) { clearInterval(timer); timer = null; } setPlay("▶", "Play"); fig.classList.remove("is-playing"); }
    function play() {
      if (i >= steps.length - 1) i = -1;
      setPlay("⏸", "Pause"); fig.classList.add("is-playing");
      timer = setInterval(function () { if (i >= steps.length - 1) { stop(); return; } go(i + 1); }, delay);
    }

    var prev = fig.querySelector(".rf-prev"), next = fig.querySelector(".rf-next"), reset = fig.querySelector(".rf-reset");
    if (prev) prev.addEventListener("click", function () { stop(); go(i - 1); });
    if (next) next.addEventListener("click", function () { stop(); go(i + 1); });
    if (reset) reset.addEventListener("click", function () { stop(); go(0); });
    if (playBtn) playBtn.addEventListener("click", function () { timer ? stop() : play(); });
    if (speedEl) speedEl.addEventListener("change", function () { delay = +speedEl.value; if (timer) { stop(); play(); } });

    fig.setAttribute("tabindex", "0");
    fig.addEventListener("keydown", function (e) {
      if (e.key === "ArrowRight") { stop(); go(i + 1); e.preventDefault(); }
      else if (e.key === "ArrowLeft") { stop(); go(i - 1); e.preventDefault(); }
      else if (e.key === " " || e.key === "Spacebar") { timer ? stop() : play(); e.preventDefault(); }
      else if (e.key === "Home") { stop(); go(0); }
      else if (e.key === "End") { stop(); go(steps.length - 1); }
    });

    if (REDUCED && playBtn) playBtn.style.display = "none";
    go(0);
  }

  function onReady(fn) { if (document.readyState !== "loading") fn(); else document.addEventListener("DOMContentLoaded", fn); }
  onReady(function () { document.querySelectorAll(".reqflow").forEach(Engine); });
})();
