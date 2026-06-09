/* ============================================================
   Observability Field Guide — trace sampling explorer
   Dependency-free, theme-aware. A fixed set of traces (some slow, some
   errored); pick a sampling strategy + rate and watch which traces are
   KEPT vs dropped, and what it costs you in visibility.
     • head  — decide up front, blind to the outcome (keep ~rate%).
     • tail  — decide after the trace finishes: keep slow + errors.
     • error — keep every error + a small baseline.
     • off   — keep everything (100%).

   Author:
     <figure class="viz samplingviz" data-samplingviz>
       <figcaption class="viz-title">…</figcaption>
       <script type="application/json" class="sv-config">{ "defaults":{"strategy":"tail","rate":0.1} }</script>
       <p class="viz-fallback">…</p>
     </figure>
   ============================================================ */
(function () {
  "use strict";
  function el(t, c, x) { var e = document.createElement(t); if (c) e.className = c; if (x != null) e.textContent = x; return e; }

  // deterministic sample set: 28 traces, a handful slow, a few errored
  var DEFAULT = [
    40, 55, 60, 38, 52, 47, 1200, 63, 58, 44, 70, 49,
    51, 980, 42, 66, 57, 39, 61, 760, 53, 48, 62, 45, 1500, 50, 59, 41
  ].map(function (ms, i) { return { ms: ms, error: (i === 6 || i === 19 || i === 24) }; });

  function init(fig) {
    var confEl = fig.querySelector(".sv-config");
    var cfg = {}; if (confEl) { try { cfg = JSON.parse(confEl.textContent) || {}; } catch (e) { return; } }
    var traces = (cfg.traces && cfg.traces.length) ? cfg.traces : DEFAULT;
    var d = cfg.defaults || {};
    var state = { strat: d.strategy || "tail", rate: d.rate != null ? d.rate : 0.1 };
    var titleEl = fig.querySelector(".viz-title"); if (titleEl && cfg.title) titleEl.textContent = cfg.title;

    var slowCut = (function () { var arr = traces.map(function (t) { return t.ms; }).slice().sort(function (a, b) { return a - b; }); return arr[Math.floor(arr.length * 0.8)]; })();
    function isSlow(t) { return t.ms >= slowCut; }

    var host = el("div", "sv-host"); fig.appendChild(host);

    // strategy buttons
    var segs = el("div", "sv-segs");
    [["head", "Head"], ["tail", "Tail"], ["error", "Error-only"], ["off", "Keep all"]].forEach(function (s) {
      var b = el("button", "sv-seg" + (s[0] === state.strat ? " on" : ""), s[1]); b.type = "button";
      b.addEventListener("click", function () { state.strat = s[0]; paint(); });
      segs.appendChild(b);
    });
    host.appendChild(segs);

    // rate slider
    var r = el("label", "bb-srow"); r.appendChild(el("span", "bb-slabel", "base sample rate"));
    var inp = document.createElement("input"); inp.type = "range"; inp.min = 1; inp.max = 100; inp.step = 1; inp.value = Math.round(state.rate * 100); inp.className = "sl-slider";
    var out = el("span", "bb-sval", inp.value + "%");
    inp.addEventListener("input", function () { state.rate = (+inp.value) / 100; out.textContent = inp.value + "%"; paint(); });
    r.appendChild(inp); r.appendChild(out); host.appendChild(r);

    var grid = el("div", "sv-grid"); host.appendChild(grid);
    var read = el("div", "sv-read"); host.appendChild(read);
    var cap = el("div", "viz-caption"); host.appendChild(cap);

    function kept(t, i) {
      var base = (i % Math.max(1, Math.round(1 / Math.max(0.01, state.rate)))) === 0; // deterministic ~rate%
      if (state.strat === "off") return true;
      if (state.strat === "head") return base;
      if (state.strat === "tail") return isSlow(t) || t.error || base;
      if (state.strat === "error") return t.error || base;
      return base;
    }

    function paint() {
      [].forEach.call(segs.children, function (b, i) { b.classList.toggle("on", ["head", "tail", "error", "off"][i] === state.strat); });
      grid.innerHTML = "";
      var keepN = 0, totErr = 0, keptErr = 0, totSlow = 0, keptSlow = 0;
      traces.forEach(function (t, i) {
        var k = kept(t, i);
        var cls = "sv-pill " + (t.error ? "is-error" : isSlow(t) ? "is-slow" : "is-ok") + (k ? "" : " dropped");
        var p = el("div", cls); p.title = t.ms + "ms" + (t.error ? " · error" : isSlow(t) ? " · slow" : "");
        grid.appendChild(p);
        if (k) keepN++;
        if (t.error) { totErr++; if (k) keptErr++; }
        if (isSlow(t)) { totSlow++; if (k) keptSlow++; }
      });
      var pctKept = Math.round(keepN / traces.length * 100);
      read.innerHTML = "kept <b>" + keepN + "/" + traces.length + "</b> (" + pctKept + "%) &middot; storage saved <b>" + (100 - pctKept) + "%</b> &middot; " +
        "errors kept <b style='color:#fb7185'>" + (totErr ? Math.round(keptErr / totErr * 100) : 100) + "%</b> &middot; slow kept <b style='color:#fbbf24'>" + (totSlow ? Math.round(keptSlow / totSlow * 100) : 100) + "%</b>";
      var msg = {
        head: "Head sampling is cheap and simple but <b>blind</b>: it decides before the trace finishes, so it drops most errors and slow outliers — exactly what you wanted to see.",
        tail: "Tail sampling keeps the <b>interesting</b> traces (slow + errors) and samples the boring ones — best signal per byte, but needs a buffer in the Collector.",
        error: "Error-only keeps every failure plus a baseline — great for debugging incidents, but you lose the latency picture of healthy requests.",
        off: "Keeping 100% gives perfect fidelity and the <b>biggest bill</b> — fine at low volume, unaffordable at scale."
      };
      cap.innerHTML = msg[state.strat];
    }
    paint();
    var fb = fig.querySelector(".viz-fallback"); if (fb) fb.style.display = "none";
  }

  function onReady(fn) { if (document.readyState !== "loading") fn(); else document.addEventListener("DOMContentLoaded", fn); }
  onReady(function () { document.querySelectorAll(".samplingviz").forEach(init); });
})();
