/* ============================================================
   GenAI Field Guide — sampling visualizer
   Sliders (temperature / top-k / top-p / repetition penalty) reshape a
   fixed next-token logits distribution, drawn as a bar chart. Offline,
   no deps. Embed as: <div class="genai-sampling"></div> (optional inline
   <script type="application/json"> with {candidates, logits, seen, defaults}).
   ============================================================ */
(function () {
  "use strict";
  function el(t, c, x) { var e = document.createElement(t); if (c) e.className = c; if (x != null) e.textContent = x; return e; }
  function parseCfg(host) { var s = host.querySelector("script[type='application/json']"); if (!s) return {}; try { return JSON.parse(s.textContent) || {}; } catch (e) { return {}; } }

  function softmax(z) { var m = Math.max.apply(null, z), ex = z.map(function (x) { return Math.exp(x - m); }), s = ex.reduce(function (a, b) { return a + b; }, 0); return ex.map(function (x) { return x / s; }); }

  function init(host) {
    var cfg = parseCfg(host);
    var cands = cfg.candidates || ["cat", "sat", "mat", "ran", "slept", "quietly", "dog", "the"];
    var logits = cfg.logits || [3.1, 2.4, 1.6, 1.4, 0.7, 0.2, -0.2, -0.7];
    var seen = cfg.seen || ["the"];
    var d = cfg.defaults || {};
    var state = { temp: d.temp != null ? d.temp : 0.8, topk: d.topk != null ? d.topk : 0, topp: d.topp != null ? d.topp : 1.0, rep: d.rep != null ? d.rep : 1.0 };

    host.innerHTML = "";
    var head = el("div", "gl-head"); head.appendChild(el("span", "gl-title", cfg.title || "Sampling playground")); host.appendChild(head);
    var ctrls = el("div", "gs-ctrls"); host.appendChild(ctrls);
    function row(key, label, min, max, step, fmt) {
      var r = el("label", "gl-srow"); r.appendChild(el("span", "gl-slabel", label));
      var inp = document.createElement("input"); inp.type = "range"; inp.min = min; inp.max = max; inp.step = step; inp.value = state[key]; inp.className = "gl-slider";
      var out = el("span", "gl-sval", fmt(state[key]));
      inp.addEventListener("input", function () { state[key] = +inp.value; out.textContent = fmt(state[key]); render(); });
      r.appendChild(inp); r.appendChild(out); ctrls.appendChild(r);
    }
    row("temp", "temperature", 0, 2, 0.05, function (v) { return (+v).toFixed(2); });
    row("topk", "top-k", 0, cands.length, 1, function (v) { return +v === 0 ? "off" : String(v); });
    row("topp", "top-p (nucleus)", 0.05, 1, 0.05, function (v) { return (+v).toFixed(2) + (+v >= 1 ? " (off)" : ""); });
    row("rep", "repetition penalty", 1, 2, 0.05, function (v) { return (+v).toFixed(2) + (+v <= 1 ? " (off)" : ""); });

    var bars = el("div", "gs-bars"); host.appendChild(bars);
    var cap = el("div", "gs-cap"); host.appendChild(cap);

    function render() {
      var t = Math.max(state.temp, 0.01);
      var adj = logits.map(function (x, i) {
        if (seen.indexOf(cands[i]) !== -1) return x > 0 ? x / state.rep : x * state.rep;   // repetition penalty
        return x;
      });
      var probs = softmax(adj.map(function (x) { return x / t; }));
      var items = cands.map(function (tok, i) { return { tok: tok, p: probs[i], i: i }; });
      items.sort(function (a, b) { return b.p - a.p; });

      // top-k mask
      var keep = {};
      items.forEach(function (it, rank) { keep[it.i] = (state.topk === 0 || rank < state.topk); });
      // top-p (nucleus) mask over the already-sorted list
      var cum = 0, hitP = false;
      items.forEach(function (it) {
        if (!keep[it.i]) return;
        if (hitP) { keep[it.i] = false; return; }
        cum += it.p;
        if (cum >= state.topp) hitP = true;   // this one is the last kept
      });

      bars.innerHTML = "";
      var maxP = items[0].p || 1;
      items.forEach(function (it) {
        var kept = keep[it.i];
        var rowEl = el("div", "gs-bar" + (kept ? "" : " gs-cut"));
        rowEl.appendChild(el("span", "gs-tok", it.tok));
        var track = el("span", "gs-track");
        var fill = el("span", "gs-fill"); fill.style.width = Math.max(2, (it.p / maxP) * 100) + "%";
        track.appendChild(fill); rowEl.appendChild(track);
        rowEl.appendChild(el("span", "gs-pct", (it.p * 100).toFixed(1) + "%"));
        bars.appendChild(rowEl);
      });
      var cut = items.filter(function (it) { return !keep[it.i]; }).length;
      cap.textContent = state.temp < 0.4 ? "Low temperature → the model almost always picks the top token (predictable)."
        : state.temp > 1.2 ? "High temperature → the bars flatten, so unlikely tokens get a real chance (creative, riskier)."
        : (cut ? cut + " unlikely token(s) greyed out — top-k/top-p cut the tail before sampling." : "Balanced: the model samples mostly from the leading tokens.");
    }
    render();
  }

  function onReady(fn) { if (document.readyState !== "loading") fn(); else document.addEventListener("DOMContentLoaded", fn); }
  onReady(function () { document.querySelectorAll(".genai-sampling").forEach(init); });
})();
