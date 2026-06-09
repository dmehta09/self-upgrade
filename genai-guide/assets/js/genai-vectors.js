/* ============================================================
   GenAI Field Guide — vector space explorer
   Offline, no deps. An illustrative 2-D "embedding space": items sit in
   directions by meaning so cosine similarity is intuitive, and k-NN shows
   what a vector database returns. Two modes via data-mode:
     similarity — pick two items → cosine score + a line
     ann        — pick a query + k → highlight the k nearest (what ANN/HNSW
                  finds by hopping a graph instead of scanning everything)
   Embed: <div class="genai-vectors" data-mode="similarity|ann"></div>
   ============================================================ */
(function () {
  "use strict";
  var SVGNS = "http://www.w3.org/2000/svg";
  function el(t, c, x) { var e = document.createElement(t); if (c) e.className = c; if (x != null) e.textContent = x; return e; }
  function svg(t) { return document.createElementNS(SVGNS, t); }
  function cfg(host) { var s = host.querySelector("script[type='application/json']"); if (!s) return {}; try { return JSON.parse(s.textContent) || {}; } catch (e) { return {}; } }

  // Illustrative 2-D embeddings: cluster direction = meaning. v = [x, y] in ~[-1,1].
  var ITEMS = [
    { label: "cat", v: [0.30, 0.95] }, { label: "dog", v: [0.46, 0.90] }, { label: "kitten", v: [0.26, 0.86] }, { label: "puppy", v: [0.40, 0.80] }, { label: "horse", v: [0.58, 0.78] },
    { label: "king", v: [-0.80, 0.66] }, { label: "queen", v: [-0.68, 0.74] }, { label: "man", v: [-0.92, 0.46] }, { label: "woman", v: [-0.80, 0.56] }, { label: "prince", v: [-0.60, 0.62] },
    { label: "car", v: [0.98, 0.16] }, { label: "truck", v: [1.00, 0.00] }, { label: "bus", v: [0.90, 0.26] }, { label: "bicycle", v: [0.84, -0.12] },
    { label: "apple", v: [-0.10, -0.92] }, { label: "bread", v: [0.06, -1.00] }, { label: "cheese", v: [-0.22, -0.86] }, { label: "pizza", v: [0.12, -0.94] },
    { label: "laptop", v: [0.92, -0.48] }, { label: "phone", v: [0.80, -0.62] }, { label: "server", v: [0.96, -0.40] }
  ];
  function cos(a, b) { var d = a[0] * b[0] + a[1] * b[1], ma = Math.sqrt(a[0] * a[0] + a[1] * a[1]), mb = Math.sqrt(b[0] * b[0] + b[1] * b[1]); return d / ((ma * mb) || 1); }
  function dist(a, b) { var dx = a[0] - b[0], dy = a[1] - b[1]; return Math.sqrt(dx * dx + dy * dy); }
  var W = 340, H = 300, PAD = 26;
  function px(v) { return PAD + (v[0] + 1) / 2 * (W - 2 * PAD); }
  function py(v) { return (H - PAD) - (v[1] + 1) / 2 * (H - 2 * PAD); }

  function init(host) {
    var c = cfg(host);
    var items = c.items || ITEMS;
    var mode = host.getAttribute("data-mode") || "similarity";
    host.innerHTML = "";
    var head = el("div", "gl-head"); head.appendChild(el("span", "gl-title", c.title || (mode === "ann" ? "Nearest-neighbour search" : "Vector similarity"))); host.appendChild(head);

    var ctrls = el("div", "gv-ctrls"); host.appendChild(ctrls);
    function sel(initial) { var s = el("select", "gv-sel"); items.forEach(function (it, i) { var o = el("option", null, it.label); o.value = i; s.appendChild(o); }); s.value = initial; return s; }

    var stage = el("div", "gv-stage"); host.appendChild(stage);
    var out = el("div", "gv-out"); host.appendChild(out);

    var selA, selB, qSel, kInp, kOut;
    if (mode === "ann") {
      ctrls.appendChild(label("query", qSel = sel(14)));               // "apple"
      var krow = el("label", "gl-srow"); krow.appendChild(el("span", "gl-slabel", "neighbours (k)"));
      kInp = document.createElement("input"); kInp.type = "range"; kInp.min = 1; kInp.max = 6; kInp.value = 3; kInp.className = "gl-slider";
      kOut = el("span", "gl-sval", "3"); krow.appendChild(kInp); krow.appendChild(kOut); ctrls.appendChild(krow);
      qSel.addEventListener("change", render); kInp.addEventListener("input", render);
    } else {
      ctrls.appendChild(label("item A", selA = sel(0)));               // "cat"
      ctrls.appendChild(label("item B", selB = sel(1)));               // "dog"
      selA.addEventListener("change", render); selB.addEventListener("change", render);
    }
    function label(text, control) { var w = el("label", "gv-field"); w.appendChild(el("span", "gl-slabel", text)); w.appendChild(control); return w; }

    function render() {
      var hot = {}, lines = [];
      if (mode === "ann") {
        var qi = +qSel.value, k = +kInp.value; kOut.textContent = k;
        var ranked = items.map(function (it, i) { return { i: i, d: dist(it.v, items[qi].v) }; })
          .filter(function (r) { return r.i !== qi; }).sort(function (a, b) { return a.d - b.d; });
        ranked.slice(0, k).forEach(function (r) { hot[r.i] = "near"; lines.push([qi, r.i]); });
        hot[qi] = "query";
        out.innerHTML = "";
        out.appendChild(el("p", "gv-note", "The " + k + " nearest items to “" + items[qi].label + "” are highlighted. A vector database finds these with an ANN index like HNSW — hopping through a navigable graph instead of measuring the distance to every point."));
      } else {
        var ai = +selA.value, bi = +selB.value;
        hot[ai] = "query"; hot[bi] = "near"; if (ai !== bi) lines.push([ai, bi]);
        var score = cos(items[ai].v, items[bi].v);
        out.innerHTML = "";
        var bar = el("div", "gv-score");
        bar.appendChild(el("span", "gv-score-label", "cosine similarity"));
        var track = el("span", "gv-score-track"); var fill = el("span", "gv-score-fill"); fill.style.width = Math.max(2, ((score + 1) / 2) * 100) + "%"; track.appendChild(fill); bar.appendChild(track);
        bar.appendChild(el("b", "gv-score-val", score.toFixed(2)));
        out.appendChild(bar);
        out.appendChild(el("p", "gv-note", score > 0.8 ? "Close in meaning — they point the same way, so cosine is near 1." : score > 0.3 ? "Loosely related — a moderate angle between them." : score > -0.2 ? "Different topics — roughly perpendicular, cosine near 0." : "Opposite directions in this toy space."));
      }
      draw(hot, lines);
    }

    function draw(hot, lines) {
      stage.innerHTML = "";
      var s = svg("svg"); s.setAttribute("class", "gv-svg"); s.setAttribute("viewBox", "0 0 " + W + " " + H);
      lines.forEach(function (e) {
        var ln = svg("line"); ln.setAttribute("class", "gv-line");
        ln.setAttribute("x1", px(items[e[0]].v)); ln.setAttribute("y1", py(items[e[0]].v));
        ln.setAttribute("x2", px(items[e[1]].v)); ln.setAttribute("y2", py(items[e[1]].v));
        s.appendChild(ln);
      });
      items.forEach(function (it, i) {
        var g = svg("g"); g.setAttribute("class", "gv-pt" + (hot[i] ? " " + hot[i] : ""));
        var cc = svg("circle"); cc.setAttribute("cx", px(it.v)); cc.setAttribute("cy", py(it.v)); cc.setAttribute("r", hot[i] ? 7 : 5);
        var tx = svg("text"); tx.setAttribute("x", px(it.v)); tx.setAttribute("y", py(it.v) - 10); tx.setAttribute("class", "gv-lbl"); tx.textContent = it.label;
        g.appendChild(cc); g.appendChild(tx); s.appendChild(g);
      });
      stage.appendChild(s);
    }
    render();
  }

  function onReady(fn) { if (document.readyState !== "loading") fn(); else document.addEventListener("DOMContentLoaded", fn); }
  onReady(function () { document.querySelectorAll(".genai-vectors").forEach(init); });
})();
