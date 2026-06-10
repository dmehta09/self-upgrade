/* ============================================================
   System Design Field Guide — scale journey (.journey)
   The "1 user → 100M users" story as an animated stepper: each
   stage shows the architecture at that scale, highlights the
   component about to buckle, and names the fix that becomes the
   next stage. Nodes keep stable ids across stages, so a node that
   survives morphs to its new position instead of redrawing.
   Offline, theme-aware, keyboard-driven, honors reduced motion.

   Authoring:
     <figure class="journey" data-journey> … controls …
       <script type="application/json" class="jy-config">
       {
         "title": "One server to planet scale",
         "stages": [
           { "label": "1–1K",
             "nodes": [ { "id":"u","label":"Users","type":"user","col":0,"row":0 },
                        { "id":"all","label":"One server","type":"app+db","col":1,"row":0 } ],
             "edges": [ { "from":"u","to":"all" } ],
             "bottleneck": { "node":"all", "text":"App and DB fight for the same CPU" },
             "fix": "Split the web tier from the database.",
             "caption": "Everything on one box. Fine — until it isn't.",
             "stats": [ { "k":"QPS","v":"~10" }, { "k":"Servers","v":"1" } ] }, …
         ]
       }
       </script>
     </figure>
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

  function boundary(cx, cy, tx, ty) {
    var dx = tx - cx, dy = ty - cy;
    if (dx === 0 && dy === 0) return { x: cx, y: cy };
    var sx = dx !== 0 ? HW / Math.abs(dx) : Infinity;
    var sy = dy !== 0 ? HH / Math.abs(dy) : Infinity;
    var s = Math.min(sx, sy);
    return { x: cx + dx * s, y: cy + dy * s };
  }

  function center(col, row) {
    return { x: PAD + HW + (col || 0) * (W + GAPX), y: PAD + HH + (row || 0) * (H + GAPY) };
  }

  function Engine(fig) {
    var confEl = fig.querySelector(".jy-config");
    if (!confEl) return;
    var cfg; try { cfg = JSON.parse(confEl.textContent); } catch (e) { return; }
    var stages = cfg.stages || [];
    if (!stages.length) return;

    var stageEl = fig.querySelector(".jy-stage");
    var capEl = fig.querySelector(".jy-caption");
    var stopsEl = fig.querySelector(".jy-stops");
    var statsEl = fig.querySelector(".jy-stats");

    /* SVG sized to the union grid across ALL stages so the viewBox never jumps */
    var maxCol = 0, maxRow = 0;
    stages.forEach(function (st) {
      (st.nodes || []).forEach(function (n) { maxCol = Math.max(maxCol, n.col || 0); maxRow = Math.max(maxRow, n.row || 0); });
    });
    var width = PAD * 2 + (maxCol + 1) * W + maxCol * GAPX;
    var height = PAD * 2 + (maxRow + 1) * H + maxRow * GAPY;

    var s = svg("svg", { class: "jy-svg", viewBox: "0 0 " + width + " " + height });
    stageEl.innerHTML = ""; stageEl.appendChild(s);
    var edgeLayer = svg("g"); s.appendChild(edgeLayer);
    var nodeLayer = svg("g"); s.appendChild(nodeLayer);

    /* persistent node elements keyed by id — they morph between stages */
    var nodeEls = {};   // id -> { g, rect, type, label, status }
    function ensureNode(id) {
      if (nodeEls[id]) return nodeEls[id];
      var g = svg("g", { class: "jy-node entering" });
      var rect = svg("rect", { class: "jy-nrect", x: -HW, y: -HH, width: W, height: H, rx: 11 });
      var type = svg("text", { class: "jy-ntype", x: 0, y: -9 });
      var label = svg("text", { class: "jy-nlabel", x: 0, y: 8 });
      g.appendChild(rect); g.appendChild(type); g.appendChild(label);
      nodeLayer.appendChild(g);
      nodeEls[id] = { g: g, type: type, label: label };
      return nodeEls[id];
    }

    /* stage chips */
    var chipBtns = [];
    if (stopsEl) {
      stopsEl.innerHTML = "";
      stages.forEach(function (st, k) {
        var b = document.createElement("button");
        b.type = "button"; b.className = "jy-stop"; b.textContent = st.label || "Stage " + (k + 1);
        b.addEventListener("click", function () { go(k); });
        stopsEl.appendChild(b); chipBtns.push(b);
      });
    }

    var i = 0;

    function render() {
      var st = stages[i];
      var present = {};

      (st.nodes || []).forEach(function (n) {
        present[n.id] = true;
        var ne = ensureNode(n.id);
        var c = center(n.col, n.row);
        var isNew = ne.g.classList.contains("entering");
        ne.g.setAttribute("transform", "translate(" + c.x + " " + c.y + ")");
        ne.type.textContent = n.type || "";
        ne.label.textContent = n.label || n.id;
        ne.label.setAttribute("y", n.type ? 8 : 1);
        ne.g.classList.remove("exiting");
        ne.g.classList.toggle("jy-bneck", !!(st.bottleneck && st.bottleneck.node === n.id));
        if (isNew) {
          /* enter on the next frame so the fade-in transition runs */
          if (REDUCED) ne.g.classList.remove("entering");
          else requestAnimationFrame(function () { requestAnimationFrame(function () { ne.g.classList.remove("entering"); }); });
        }
      });

      Object.keys(nodeEls).forEach(function (id) {
        if (!present[id]) nodeEls[id].g.classList.add("exiting");
      });

      /* edges are cheap — redraw per stage with a brief fade-in */
      edgeLayer.innerHTML = "";
      var pos = {};
      (st.nodes || []).forEach(function (n) { pos[n.id] = center(n.col, n.row); });
      (st.edges || []).forEach(function (e) {
        var a = pos[e.from], b = pos[e.to]; if (!a || !b) return;
        var p1 = boundary(a.x, a.y, b.x, b.y), p2 = boundary(b.x, b.y, a.x, a.y);
        var dx = p2.x - p1.x, dy = p2.y - p1.y, L = Math.sqrt(dx * dx + dy * dy) || 1, ux = dx / L, uy = dy / L;
        var tipX = p2.x - ux * 3, tipY = p2.y - uy * 3;
        var bx = tipX - ux * 9, by = tipY - uy * 9, px = -uy * 5, py = ux * 5;
        edgeLayer.appendChild(svg("path", { class: "jy-edge", d: "M" + p1.x + " " + p1.y + " L" + (tipX - ux * 5) + " " + (tipY - uy * 5) }));
        edgeLayer.appendChild(svg("polygon", { class: "jy-ahead", points: tipX + "," + tipY + " " + (bx + px) + "," + (by + py) + " " + (bx - px) + "," + (by - py) }));
        if (e.label) {
          var lb = svg("text", { class: "jy-elabel", x: (p1.x + p2.x) / 2, y: (p1.y + p2.y) / 2 - 7 });
          lb.textContent = e.label; edgeLayer.appendChild(lb);
        }
      });

      if (capEl) {
        var h = "<span class='jy-cap-main'>" + (st.caption || "") + "</span>";
        if (st.bottleneck && st.bottleneck.text) h += "<span class='jy-bn'><b>Bottleneck:</b> " + st.bottleneck.text + "</span>";
        if (st.fix) h += "<span class='jy-fix'><b>The fix:</b> " + st.fix + "</span>";
        capEl.innerHTML = h;
      }
      if (statsEl) {
        statsEl.innerHTML = "";
        (st.stats || []).forEach(function (x) {
          var d = document.createElement("span"); d.className = "jy-stat";
          d.innerHTML = "<b>" + x.v + "</b> " + x.k;
          statsEl.appendChild(d);
        });
      }
      chipBtns.forEach(function (b, bi) { b.classList.toggle("active", bi === i); });

      var prev = fig.querySelector(".jy-prev"), next = fig.querySelector(".jy-next");
      if (prev) prev.disabled = i === 0;
      if (next) next.disabled = i === stages.length - 1;
    }

    function go(n) { i = Math.max(0, Math.min(stages.length - 1, n)); render(); }

    var prev = fig.querySelector(".jy-prev"), next = fig.querySelector(".jy-next");
    if (prev) prev.addEventListener("click", function () { go(i - 1); });
    if (next) next.addEventListener("click", function () { go(i + 1); });

    fig.setAttribute("tabindex", "0");
    fig.addEventListener("keydown", function (e) {
      if (e.key === "ArrowRight") { go(i + 1); e.preventDefault(); }
      else if (e.key === "ArrowLeft") { go(i - 1); e.preventDefault(); }
      else if (e.key === "Home") { go(0); }
      else if (e.key === "End") { go(stages.length - 1); }
    });

    go(0);
  }

  function onReady(fn) { if (document.readyState !== "loading") fn(); else document.addEventListener("DOMContentLoaded", fn); }
  onReady(function () { document.querySelectorAll(".journey").forEach(Engine); });
})();
