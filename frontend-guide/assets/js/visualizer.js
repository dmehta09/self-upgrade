/* ============================================================
   DSA Field Guide — step-through algorithm visualizer
   A tiny, dependency-free, data-driven "frames" engine. A
   visualization is pure data the author pre-computes; the engine
   just projects each frame. Offline, theme-aware (reads --accent
   etc. via CSS), and honors prefers-reduced-motion.

   Authoring:
     <figure class="viz" data-viz> … controls …
       <script type="application/json" class="viz-config">
         { "type":"array|grid|tree|graph", "meta":{…}, "frames":[ {…,"caption":"…"} ] }
       </script>
     </figure>

   Carry-over: for array/grid, the "values"/"grid" you don't repeat
   in a frame are inherited from the previous frame (so you only
   write what changed). Highlight states (active/compare/swap/done/
   visited/…) are per-frame — declare them fresh each frame.
   ============================================================ */
(function () {
  "use strict";
  var SVGNS = "http://www.w3.org/2000/svg";
  var REDUCED = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function el(tag, cls, txt) { var e = document.createElement(tag); if (cls) e.className = cls; if (txt != null) e.textContent = txt; return e; }
  function svgEl(tag) { return document.createElementNS(SVGNS, tag); }
  function has(a, v) { return !!a && a.indexOf(v) !== -1; }

  /* ---------------- array / list renderer ---------------- */
  function mountArray(stage, meta) {
    stage.innerHTML = "";
    var base = meta.values || [];
    var wrap = el("div", "viz-array");
    base.forEach(function (v, i) {
      var col = el("div", "viz-col");
      col.appendChild(el("div", "viz-ptrs"));
      col.appendChild(el("div", "viz-cell", v));
      col.appendChild(el("div", "viz-idx", i));
      wrap.appendChild(col);
    });
    stage.appendChild(wrap);
  }
  function paintArray(stage, f) {
    var vals = f.values || [];
    var cols = stage.querySelectorAll(".viz-col");
    cols.forEach(function (col, i) {
      var cell = col.querySelector(".viz-cell");
      if (vals[i] !== undefined) cell.textContent = vals[i];
      cell.className = "viz-cell";
      if (has(f.active, i)) cell.classList.add("active");
      if (has(f.compare, i)) cell.classList.add("compare");
      if (has(f.swap, i)) cell.classList.add("swap");
      if (has(f.match, i)) cell.classList.add("match");
      if (has(f.done, i)) cell.classList.add("done");
      if (has(f.reject, i)) cell.classList.add("reject");
      if (has(f.dim, i)) cell.classList.add("dim");
      if (f.win && i >= f.win[0] && i <= f.win[1]) cell.classList.add("win");
      var ptrs = col.querySelector(".viz-ptrs"); ptrs.innerHTML = "";
      (f.pointers || []).forEach(function (p) { if (p.at === i) ptrs.appendChild(el("span", "viz-ptr", p.name)); });
    });
  }

  /* ---------------- grid / matrix renderer ---------------- */
  function key(r, c) { return r + ":" + c; }
  function setOf(pairs) { var s = {}; (pairs || []).forEach(function (p) { s[key(p[0], p[1])] = 1; }); return s; }
  function mountGrid(stage, meta) {
    stage.innerHTML = "";
    var rows = meta.rows || (meta.grid ? meta.grid.length : 0);
    var cols = meta.cols || (meta.grid && meta.grid[0] ? meta.grid[0].length : 0);
    var g = el("div", "viz-grid"); g.style.gridTemplateColumns = "repeat(" + cols + ", auto)";
    for (var r = 0; r < rows; r++) for (var c = 0; c < cols; c++) {
      var cell = el("div", "viz-gcell"); cell.setAttribute("data-r", r); cell.setAttribute("data-c", c);
      if (meta.grid && meta.grid[r] && meta.grid[r][c] != null) cell.textContent = meta.grid[r][c];
      g.appendChild(cell);
    }
    stage.appendChild(g);
  }
  function paintGrid(stage, f) {
    var act = setOf(f.active), don = setOf(f.done || f.match), rej = setOf(f.reject), wall = setOf(f.wall), dim = setOf(f.dim);
    stage.querySelectorAll(".viz-gcell").forEach(function (cell) {
      var r = +cell.getAttribute("data-r"), c = +cell.getAttribute("data-c"), k = key(r, c);
      if (f.grid && f.grid[r] && f.grid[r][c] != null) cell.textContent = f.grid[r][c];
      cell.className = "viz-gcell";
      if (act[k]) cell.classList.add("active");
      if (don[k]) cell.classList.add("done");
      if (rej[k]) cell.classList.add("reject");
      if (wall[k]) cell.classList.add("wall");
      if (dim[k]) cell.classList.add("dim");
    });
  }

  /* ---------------- shared node drawing (tree + graph) ---------------- */
  var R = 20;
  function drawModel(stage, model, directed) {
    stage.innerHTML = "";
    var svg = svgEl("svg"); svg.setAttribute("class", "viz-svg");
    svg.setAttribute("viewBox", "0 0 " + model.width + " " + model.height);
    if (directed) {
      var defs = svgEl("defs"), mk = svgEl("marker");
      mk.setAttribute("id", "viz-arrow"); mk.setAttribute("viewBox", "0 0 10 10");
      mk.setAttribute("refX", "9"); mk.setAttribute("refY", "5");
      mk.setAttribute("markerWidth", "7"); mk.setAttribute("markerHeight", "7"); mk.setAttribute("orient", "auto");
      var ap = svgEl("path"); ap.setAttribute("d", "M0 0 L10 5 L0 10 z"); ap.setAttribute("fill", "#8a93a8");
      mk.appendChild(ap); defs.appendChild(mk); svg.appendChild(defs);
    }
    var pos = {}; model.nodes.forEach(function (n) { pos[String(n.id)] = { x: n.x, y: n.y }; });
    (model.edges || []).forEach(function (e) {
      var a = pos[String(e[0])], b = pos[String(e[1])]; if (!a || !b) return;
      var dx = b.x - a.x, dy = b.y - a.y, L = Math.sqrt(dx * dx + dy * dy) || 1, ux = dx / L, uy = dy / L;
      var ln = svgEl("path"); ln.setAttribute("class", "viz-edge");
      ln.setAttribute("d", "M" + (a.x + ux * R) + " " + (a.y + uy * R) + " L" + (b.x - ux * R) + " " + (b.y - uy * R));
      ln.setAttribute("data-a", String(e[0])); ln.setAttribute("data-b", String(e[1]));
      if (directed) ln.setAttribute("marker-end", "url(#viz-arrow)");
      svg.appendChild(ln);
    });
    model.nodes.forEach(function (n) {
      var g = svgEl("g"); g.setAttribute("class", "viz-node"); g.setAttribute("data-id", String(n.id));
      var c = svgEl("circle"); c.setAttribute("class", "viz-node-c"); c.setAttribute("cx", n.x); c.setAttribute("cy", n.y); c.setAttribute("r", R);
      var t = svgEl("text"); t.setAttribute("class", "viz-node-t"); t.setAttribute("x", n.x); t.setAttribute("y", n.y);
      t.textContent = (n.label != null ? n.label : n.id);
      g.appendChild(c); g.appendChild(t); svg.appendChild(g);
    });
    stage.appendChild(svg);
  }
  function paintNodes(stage, f) {
    var A = (f.active || []).map(String), V = (f.visited || []).map(String), Fr = (f.frontier || []).map(String), D = (f.dim || []).map(String);
    stage.querySelectorAll(".viz-node").forEach(function (g) {
      var id = g.getAttribute("data-id"); g.setAttribute("class", "viz-node");
      if (V.indexOf(id) !== -1) g.classList.add("visited");
      if (Fr.indexOf(id) !== -1) g.classList.add("frontier");
      if (A.indexOf(id) !== -1) g.classList.add("active");
      if (D.indexOf(id) !== -1) g.classList.add("dim");
    });
    var on = {}; (f.edgesOn || []).forEach(function (e) { on[e[0] + "|" + e[1]] = 1; on[e[1] + "|" + e[0]] = 1; });
    stage.querySelectorAll(".viz-edge").forEach(function (ed) {
      ed.classList.toggle("on", !!on[ed.getAttribute("data-a") + "|" + ed.getAttribute("data-b")]);
    });
  }

  /* heap-style array -> tidy binary-tree model (x by in-order, y by depth) */
  function buildTree(arr) {
    var nodes = [], edges = [], order = {}, depth = {}, ctr = { n: 0 };
    (function inorder(i, d) {
      if (i >= arr.length || arr[i] == null) return;
      inorder(2 * i + 1, d + 1);
      order[i] = ctr.n++; depth[i] = d;
      inorder(2 * i + 2, d + 1);
    })(0, 0);
    var maxD = 0; Object.keys(depth).forEach(function (k) { maxD = Math.max(maxD, depth[k]); });
    var gapX = 66, gapY = 74, m = 28;
    for (var i = 0; i < arr.length; i++) {
      if (arr[i] == null) continue;
      nodes.push({ id: arr[i], x: m + order[i] * gapX, y: m + depth[i] * gapY });
      var l = 2 * i + 1, r = 2 * i + 2;
      if (l < arr.length && arr[l] != null) edges.push([arr[i], arr[l]]);
      if (r < arr.length && arr[r] != null) edges.push([arr[i], arr[r]]);
    }
    return { nodes: nodes, edges: edges, width: Math.max(m * 2 + (ctr.n - 1) * gapX, 120), height: Math.max(m * 2 + maxD * gapY, 80) };
  }

  var Renderers = {
    array: { mount: mountArray, paint: paintArray },
    grid: { mount: mountGrid, paint: paintGrid },
    tree: { mount: function (stage, meta) { drawModel(stage, buildTree(meta.tree || []), false); }, paint: paintNodes },
    graph: { mount: function (stage, meta) { drawModel(stage, { nodes: meta.nodes || [], edges: meta.edges || [], width: meta.width || 520, height: meta.height || 300 }, !!meta.directed); }, paint: paintNodes }
  };

  function carry(frames, field) {
    var last = null;
    frames.forEach(function (f) { if (f[field] != null) last = f[field]; else if (last != null) f[field] = last; });
  }

  function Engine(fig) {
    var confEl = fig.querySelector(".viz-config");
    if (!confEl) return;
    var cfg; try { cfg = JSON.parse(confEl.textContent); } catch (e) { return; }  // static fallback stays in place
    var rend = Renderers[cfg.type]; if (!rend) return;
    var meta = cfg.meta || {};
    var frames = (cfg.frames || []).slice();
    if (!frames.length) return;
    if (cfg.type === "array") {
      if (!meta.values) for (var k = 0; k < frames.length; k++) { if (frames[k].values) { meta.values = frames[k].values; break; } }
      carry(frames, "values");
    }
    if (cfg.type === "grid") carry(frames, "grid");

    var stage = fig.querySelector(".viz-stage");
    var capEl = fig.querySelector(".viz-caption");
    var fill = fig.querySelector(".viz-progress-fill");
    var stepEl = fig.querySelector(".viz-step");
    var playBtn = fig.querySelector(".viz-play");
    var speedEl = fig.querySelector(".viz-speed-sel");

    rend.mount(stage, meta);
    var i = 0, timer = null, delay = speedEl ? +speedEl.value : 1100;

    function render() {
      rend.paint(stage, frames[i], meta);
      if (capEl) capEl.textContent = frames[i].caption || "";
      if (fill) fill.style.width = (frames.length < 2 ? 100 : (i / (frames.length - 1)) * 100) + "%";
      if (stepEl) stepEl.textContent = (i + 1) + " / " + frames.length;
    }
    function go(n) { i = Math.max(0, Math.min(frames.length - 1, n)); render(); }
    function setPlay(glyph, label) { if (playBtn) { playBtn.textContent = glyph; playBtn.setAttribute("aria-label", label); } }
    function stop() { if (timer) { clearInterval(timer); timer = null; } setPlay("▶", "Play"); fig.classList.remove("is-playing"); }
    function play() {
      if (i >= frames.length - 1) i = -1;            // replay from start
      setPlay("⏸", "Pause"); fig.classList.add("is-playing");
      timer = setInterval(function () { if (i >= frames.length - 1) { stop(); return; } go(i + 1); }, delay);
    }

    var prev = fig.querySelector(".viz-prev"), next = fig.querySelector(".viz-next"), reset = fig.querySelector(".viz-reset");
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
      else if (e.key === "End") { stop(); go(frames.length - 1); }
    });

    if (REDUCED && playBtn) playBtn.style.display = "none";  // no autoplay under reduced motion
    go(0);
  }

  function onReady(fn) { if (document.readyState !== "loading") fn(); else document.addEventListener("DOMContentLoaded", fn); }
  onReady(function () { document.querySelectorAll(".viz").forEach(Engine); });
})();
