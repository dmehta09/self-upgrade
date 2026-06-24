/* ============================================================
   Go — a visual guide · GCLAB
   Walks Go's concurrent tricolor mark-sweep over a small object
   graph. WHITE = candidate garbage, GREY = reachable but not yet
   scanned, BLACK = reachable and scanned. Marking greys the roots'
   targets and blackens them as it scans; whatever is still white at
   the end is swept. Makes "what does the GC keep?" visible.

   Frame-stepper contract: ←/→ step · Space play/pause · Home/End.
   The graph (nodes + edges) is fixed; each frame just recolors the
   nodes. Offline, theme-aware, reduced-motion aware.

   Authoring (positions are SVG coords; pick a viewBox big enough):
     <figure class="gclab reveal" data-gclab aria-label="…">
       <script type="application/json" class="gc-config">
       { "w": 380, "h": 270,
         "nodes": [ {"id":"root","cx":70,"cy":95,"label":"roots","root":true},
                    {"id":"a","cx":200,"cy":55,"label":"a"},
                    {"id":"x","cx":200,"cy":210,"label":"x"} ],
         "edges": [ ["root","a"], ["x","y"] ],
         "frames": [
           { "caption":"All white at the start.",
             "colors": {"root":"black","a":"white","x":"white"}, "phase":"mark" },
           { "caption":"Sweep the white objects.",
             "colors": {"root":"black","a":"black","x":"white"}, "phase":"sweep", "collected":["x"] }
         ] }
       </script>
     </figure>
   color ∈ white | grey | black. phase ∈ mark | sweep | done.
   collected = ids being reclaimed (drawn faded). ============================================================ */
(function () {
  "use strict";
  var SVGNS = "http://www.w3.org/2000/svg";
  var REDUCED = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  function el(tag, cls, txt) { var e = document.createElement(tag); if (cls) e.className = cls; if (txt != null) e.textContent = txt; return e; }
  function svg(tag, attrs) { var e = document.createElementNS(SVGNS, tag); for (var k in attrs) e.setAttribute(k, attrs[k]); return e; }

  function build(fig) {
    var confEl = fig.querySelector(".gc-config");
    if (!confEl) return;
    var cfg; try { cfg = JSON.parse(confEl.textContent); } catch (e) { return; }
    var frames = cfg.frames || [], nodes = cfg.nodes || [], edges = cfg.edges || [];
    if (!frames.length || !nodes.length) return;
    var W = cfg.w || 380, H = cfg.h || 270;
    var byId = {}; nodes.forEach(function (n) { byId[n.id] = n; });

    var stage = el("div", "gc-stage");
    var s = svg("svg", { viewBox: "0 0 " + W + " " + H, class: "gc-svg" });
    s.setAttribute("role", "img");
    // defs: arrowhead
    var defs = svg("defs", {});
    var marker = svg("marker", { id: "gc-arrow-" + Math.floor(W * H) % 9973, markerWidth: "8", markerHeight: "8", refX: "7", refY: "4", orient: "auto" });
    marker.appendChild(svg("path", { d: "M0,0 L8,4 L0,8 z", class: "gc-arrowhead" }));
    defs.appendChild(marker); s.appendChild(defs);
    var arrowId = marker.getAttribute("id");

    // edges (static)
    edges.forEach(function (e) {
      var a = byId[e[0]], b = byId[e[1]];
      if (!a || !b) return;
      var dx = b.cx - a.cx, dy = b.cy - a.cy, len = Math.sqrt(dx * dx + dy * dy) || 1;
      var r = 22, ox = dx / len * r, oy = dy / len * r;
      s.appendChild(svg("line", { x1: a.cx + ox, y1: a.cy + oy, x2: b.cx - ox, y2: b.cy - oy, class: "gc-edge", "marker-end": "url(#" + arrowId + ")" }));
    });

    // nodes (circles + labels), kept by id for recolor
    var circ = {}, label = {}, grp = {};
    nodes.forEach(function (n) {
      var g = svg("g", { class: "gc-node" });
      var c = svg("circle", { cx: n.cx, cy: n.cy, r: "20", class: "gc-c" });
      var t = svg("text", { x: n.cx, y: n.cy + 4, class: "gc-label", "text-anchor": "middle" });
      t.textContent = n.label != null ? n.label : n.id;
      g.appendChild(c); g.appendChild(t);
      if (n.root) {
        g.appendChild(svg("circle", { cx: n.cx, cy: n.cy, r: "25", class: "gc-rootring" }));
        var rt = svg("text", { x: n.cx, y: n.cy - 30, class: "gc-roottag", "text-anchor": "middle" });
        rt.textContent = "root"; g.appendChild(rt);
      }
      s.appendChild(g); circ[n.id] = c; label[n.id] = t; grp[n.id] = g;
    });
    stage.appendChild(s);

    var legend = el("div", "gc-legend");
    [["white", "white · garbage?"], ["grey", "grey · reachable, unscanned"], ["black", "black · kept"]].forEach(function (p) {
      var item = el("span", "gc-leg");
      item.appendChild(el("i", "gc-sw gc-" + p[0]));
      item.appendChild(el("span", null, p[1]));
      legend.appendChild(item);
    });

    var phaseEl = el("div", "gc-phase");
    var cap = el("div", "viz-cap");
    var controls = el("div", "viz-controls");
    var resetB = el("button", "viz-reset", "⏮"), prevB = el("button", "viz-prev", "‹"),
        playB = el("button", "viz-play", "▶ Play"), nextB = el("button", "viz-next", "›"),
        stepEl = el("span", "viz-step", "");
    [resetB, prevB, playB, nextB].forEach(function (b) { b.type = "button"; });
    controls.appendChild(resetB); controls.appendChild(prevB); controls.appendChild(playB); controls.appendChild(nextB); controls.appendChild(stepEl);
    fig.appendChild(stage); fig.appendChild(legend); fig.appendChild(phaseEl); fig.appendChild(cap); fig.appendChild(controls);

    function render(n) {
      var f = frames[n], colors = f.colors || {}, collected = f.collected || [];
      nodes.forEach(function (nd) {
        var col = colors[nd.id] || "white";
        var c = circ[nd.id];
        c.setAttribute("class", "gc-c gc-" + col + (collected.indexOf(nd.id) !== -1 ? " gc-swept" : ""));
        grp[nd.id].setAttribute("class", "gc-node" + (collected.indexOf(nd.id) !== -1 ? " swept" : ""));
      });
      var ph = f.phase || "mark";
      phaseEl.className = "gc-phase ph-" + ph;
      phaseEl.textContent = ph === "sweep" ? "Phase: SWEEP — reclaim white" : (ph === "done" ? "Phase: DONE" : "Phase: MARK — trace from roots");
      cap.innerHTML = f.caption || "";
      stepEl.textContent = (n + 1) + " / " + frames.length;
      i = n;
    }

    var i = 0, timer = null;
    function stop() { if (timer) { clearInterval(timer); timer = null; } playB.textContent = "▶ Play"; }
    function play() { if (i >= frames.length - 1) render(0); playB.textContent = "⏸ Pause"; timer = setInterval(function () { if (i >= frames.length - 1) { stop(); return; } render(i + 1); }, 2400); }
    function go(n) { stop(); render(Math.max(0, Math.min(frames.length - 1, n))); }
    resetB.addEventListener("click", function () { go(0); });
    prevB.addEventListener("click", function () { go(i - 1); });
    nextB.addEventListener("click", function () { go(i + 1); });
    playB.addEventListener("click", function () { timer ? stop() : play(); });
    fig.setAttribute("tabindex", "0");
    fig.addEventListener("keydown", function (e) {
      if (e.key === "ArrowRight") { go(i + 1); e.preventDefault(); }
      else if (e.key === "ArrowLeft") { go(i - 1); e.preventDefault(); }
      else if (e.key === " " || e.key === "Spacebar") { timer ? stop() : play(); e.preventDefault(); }
      else if (e.key === "Home") { go(0); }
      else if (e.key === "End") { go(frames.length - 1); }
    });
    if (REDUCED) playB.style.display = "none";
    render(0);
  }

  function onReady(fn) { if (document.readyState !== "loading") fn(); else document.addEventListener("DOMContentLoaded", fn); }
  onReady(function () { document.querySelectorAll("[data-gclab]").forEach(build); });
})();
