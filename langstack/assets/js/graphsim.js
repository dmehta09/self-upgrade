/* ============================================================
   THE LANG STACK — graphsim: a StateGraph execution stepper
   Animates how LangGraph runs a graph: which node fires, what
   partial update it returns, how the state merges, which edge
   a router takes, and where an interrupt pauses the run.

   Markup:
     <figure class="graphsim reveal" data-graphsim>
       <script type="application/json" class="graphsim-config">{...}</script>
     </figure>

   Config:
     nodes:  [{id, label, x, y, kind: "start"|"end"|"node"|"tool"}]
     edges:  [{from, to, cond}]            cond = label on a dashed router edge
     frames: [{active, caption, state:{k:v}, diff:[k], branch:{taken:[...], skipped:[...]},
               interrupt: true}]
       • state is the FULL state at that moment (no carry-over math —
         scrubbing recomputes nothing, every frame stands alone)
       • diff lists the channels this step changed (they flash)
       • branch edges are "from->to" strings
   Sized purely from config (safe inside .reveal). ← → Space keys.
   ============================================================ */
(function () {
  "use strict";
  var NS = "http://www.w3.org/2000/svg";
  var NODE_W = 118, NODE_H = 40, PILL_W = 84, PILL_H = 30;

  function el(tag, cls, html) {
    var d = document.createElement(tag);
    if (cls) d.className = cls;
    if (html != null) d.innerHTML = html;
    return d;
  }
  function svgEl(tag, attrs) {
    var s = document.createElementNS(NS, tag);
    for (var k in attrs) s.setAttribute(k, attrs[k]);
    return s;
  }
  function esc(s) { return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"); }

  function init(host) {
    var cfgEl = host.querySelector(".graphsim-config");
    if (!cfgEl) return;
    var cfg;
    try { cfg = JSON.parse(cfgEl.textContent); } catch (e) { return; }
    var nodes = cfg.nodes || [], edges = cfg.edges || [], frames = cfg.frames || [];
    if (!nodes.length || !frames.length) return;

    var byId = {};
    nodes.forEach(function (n) { byId[n.id] = n; });

    /* ---- bounds (from config only) ---- */
    var minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    nodes.forEach(function (n) {
      var w = n.kind === "start" || n.kind === "end" ? PILL_W : NODE_W;
      var h = n.kind === "start" || n.kind === "end" ? PILL_H : NODE_H;
      minX = Math.min(minX, n.x - w / 2); maxX = Math.max(maxX, n.x + w / 2);
      minY = Math.min(minY, n.y - h / 2); maxY = Math.max(maxY, n.y + h / 2);
    });
    var PAD = 26;
    var vb = [minX - PAD, minY - PAD, (maxX - minX) + PAD * 2, (maxY - minY) + PAD * 2];

    /* ---- skeleton ---- */
    var stage = el("div", "gs-stage");
    var svg = svgEl("svg", { viewBox: vb.join(" "), role: "img" });
    svg.setAttribute("aria-label", "State graph diagram");
    stage.appendChild(svg);

    var defs = svgEl("defs", {});
    var mk = svgEl("marker", { id: "gs-arrow-" + Math.floor(Math.random() * 1e6), viewBox: "0 0 10 10", refX: "9", refY: "5", markerWidth: "7", markerHeight: "7", orient: "auto-start-reverse" });
    mk.appendChild(svgEl("path", { d: "M 0 0 L 10 5 L 0 10 z", fill: "currentColor" }));
    defs.appendChild(mk);
    svg.appendChild(defs);
    var arrowRef = "url(#" + mk.getAttribute("id") + ")";

    /* ---- edges ---- */
    var edgeEls = {};
    var hasReverse = {};
    edges.forEach(function (e) { hasReverse[e.from + "->" + e.to] = edges.some(function (o) { return o.from === e.to && o.to === e.from; }); });

    function anchor(n) { return { x: n.x, y: n.y, w: (n.kind === "start" || n.kind === "end") ? PILL_W : NODE_W, h: (n.kind === "start" || n.kind === "end") ? PILL_H : NODE_H }; }

    // trim the line so it starts/ends at the node boundary, not the center
    function trim(a, b) {
      var dx = b.x - a.x, dy = b.y - a.y, len = Math.sqrt(dx * dx + dy * dy) || 1;
      var ux = dx / len, uy = dy / len;
      var aEdge = Math.min(a.w / 2 / Math.abs(ux || 1e-9), a.h / 2 / Math.abs(uy || 1e-9));
      var bEdge = Math.min(b.w / 2 / Math.abs(ux || 1e-9), b.h / 2 / Math.abs(uy || 1e-9));
      return {
        x1: a.x + ux * Math.min(aEdge, len / 2 - 2), y1: a.y + uy * Math.min(aEdge, len / 2 - 2),
        x2: b.x - ux * Math.min(bEdge, len / 2 - 2), y2: b.y - uy * Math.min(bEdge, len / 2 - 2)
      };
    }

    edges.forEach(function (e) {
      var a = anchor(byId[e.from]), b = anchor(byId[e.to]);
      var t = trim(a, b);
      var g = svgEl("g", { "class": "gs-edge" + (e.cond ? " is-cond" : "") });
      var d;
      if (hasReverse[e.from + "->" + e.to]) {
        // curve paired edges apart so A->B and B->A don't overlap
        var mx = (t.x1 + t.x2) / 2, my = (t.y1 + t.y2) / 2;
        var dx = t.x2 - t.x1, dy = t.y2 - t.y1, len = Math.sqrt(dx * dx + dy * dy) || 1;
        var ox = -dy / len * 22, oy = dx / len * 22;
        d = "M " + t.x1 + " " + t.y1 + " Q " + (mx + ox) + " " + (my + oy) + " " + t.x2 + " " + t.y2;
      } else {
        d = "M " + t.x1 + " " + t.y1 + " L " + t.x2 + " " + t.y2;
      }
      var p = svgEl("path", { d: d, fill: "none", "marker-end": arrowRef });
      g.appendChild(p);
      if (e.cond) {
        var lx = (t.x1 + t.x2) / 2, ly = (t.y1 + t.y2) / 2;
        if (hasReverse[e.from + "->" + e.to]) { var ddx = t.x2 - t.x1, ddy = t.y2 - t.y1, l2 = Math.sqrt(ddx * ddx + ddy * ddy) || 1; lx += -ddy / l2 * 16; ly += ddx / l2 * 16; }
        var tl = svgEl("text", { x: lx, y: ly - 5, "class": "gs-elabel", "text-anchor": "middle" });
        tl.textContent = e.cond;
        g.appendChild(tl);
      }
      svg.appendChild(g);
      edgeEls[e.from + "->" + e.to] = g;
    });

    /* ---- nodes ---- */
    var nodeEls = {};
    nodes.forEach(function (n) {
      var pill = n.kind === "start" || n.kind === "end";
      var w = pill ? PILL_W : NODE_W, h = pill ? PILL_H : NODE_H;
      var g = svgEl("g", { "class": "gs-node kind-" + (n.kind || "node") });
      g.appendChild(svgEl("rect", { x: n.x - w / 2, y: n.y - h / 2, width: w, height: h, rx: pill ? h / 2 : 10 }));
      var t = svgEl("text", { x: n.x, y: n.y + 4.5, "text-anchor": "middle" });
      t.textContent = n.label || n.id;
      g.appendChild(t);
      svg.appendChild(g);
      nodeEls[n.id] = g;
    });

    /* ---- state panel + caption + controls ---- */
    var panel = el("div", "gs-panel");
    var panelTitle = el("div", "gs-panel-title", "state");
    var chans = el("dl", "gs-chans");
    panel.appendChild(panelTitle); panel.appendChild(chans);

    var caption = el("figcaption", "sim-caption");
    var controls = el("div", "sim-controls");
    var btnReset = el("button", "sim-btn", "⟲");  btnReset.type = "button"; btnReset.setAttribute("aria-label", "Restart");
    var btnPrev = el("button", "sim-btn", "‹");   btnPrev.type = "button";  btnPrev.setAttribute("aria-label", "Previous step");
    var btnPlay = el("button", "sim-btn sim-play", "Play"); btnPlay.type = "button";
    var btnNext = el("button", "sim-btn", "›");   btnNext.type = "button";  btnNext.setAttribute("aria-label", "Next step");
    var count = el("span", "sim-count");
    [btnReset, btnPrev, btnPlay, btnNext, count].forEach(function (b) { controls.appendChild(b); });

    var body = el("div", "gs-body");
    body.appendChild(stage); body.appendChild(panel);
    host.appendChild(body); host.appendChild(caption); host.appendChild(controls);
    host.setAttribute("tabindex", "0");

    /* ---- frame painting (every frame is self-contained) ---- */
    var i = 0, timer = null;
    var reduced = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    function paint() {
      var fr = frames[i];
      // visited = every node that has been active up to now
      var visited = {};
      for (var k = 0; k <= i; k++) if (frames[k].active) visited[frames[k].active] = 1;

      Object.keys(nodeEls).forEach(function (id) {
        nodeEls[id].classList.toggle("is-active", fr.active === id);
        nodeEls[id].classList.toggle("is-visited", !!visited[id] && fr.active !== id);
      });
      Object.keys(edgeEls).forEach(function (key) {
        var taken = fr.branch && (fr.branch.taken || []).indexOf(key) !== -1;
        var skipped = fr.branch && (fr.branch.skipped || []).indexOf(key) !== -1;
        edgeEls[key].classList.toggle("is-taken", !!taken);
        edgeEls[key].classList.toggle("is-skipped", !!skipped);
      });

      var st = fr.state || {};
      var diff = fr.diff || [];
      chans.innerHTML = Object.keys(st).map(function (key) {
        return '<div class="gs-chan' + (diff.indexOf(key) !== -1 ? " is-changed" : "") + '">' +
          "<dt>" + esc(key) + "</dt><dd>" + esc(st[key]) + "</dd></div>";
      }).join("") || '<div class="gs-chan"><dd class="gs-empty">— state not created yet —</dd></div>';

      caption.innerHTML = (fr.interrupt ? '<span class="gs-interrupt">⏸ interrupted</span> ' : "") + esc(fr.caption || "");
      count.textContent = (i + 1) + " / " + frames.length;
      btnPrev.disabled = i === 0;
      btnNext.disabled = i === frames.length - 1;
      if (fr.interrupt) stop(); // an interrupt pauses autoplay, like the real thing
    }

    function go(n) { i = Math.max(0, Math.min(frames.length - 1, n)); paint(); }
    function stop() { if (timer) { clearInterval(timer); timer = null; btnPlay.textContent = "Play"; btnPlay.classList.remove("on"); } }
    function play() {
      if (timer) { stop(); return; }
      if (i >= frames.length - 1) i = -1;
      btnPlay.textContent = "Pause"; btnPlay.classList.add("on");
      timer = setInterval(function () {
        if (i >= frames.length - 1) { stop(); return; }
        go(i + 1);
      }, reduced ? 2400 : 1500);
      go(i + 1);
    }

    btnReset.addEventListener("click", function () { stop(); go(0); });
    btnPrev.addEventListener("click", function () { stop(); go(i - 1); });
    btnNext.addEventListener("click", function () { stop(); go(i + 1); });
    btnPlay.addEventListener("click", play);
    host.addEventListener("keydown", function (e) {
      if (e.key === "ArrowRight") { e.preventDefault(); stop(); go(i + 1); }
      else if (e.key === "ArrowLeft") { e.preventDefault(); stop(); go(i - 1); }
      else if (e.key === " ") { e.preventDefault(); play(); }
    });

    paint();
  }

  function onReady(fn) { if (document.readyState !== "loading") fn(); else document.addEventListener("DOMContentLoaded", fn); }
  onReady(function () {
    document.querySelectorAll("[data-graphsim]").forEach(init);
  });
})();
