/* ============================================================
   Observability Field Guide — series lab (metrics teaching widget)
   One dependency-free, theme-aware engine with three modes, chosen by
   the inline JSON "mode":
     • "types"       — flip between counter / gauge / histogram and see
                       the shape each produces + how you query it.
     • "cardinality" — sliders for each label's distinct-value count;
                       live total time-series = product (the cost bomb).
     • "histogram"   — a latency histogram with a "tail weight" slider;
                       recomputes p50/p95/p99 to show why averages lie.

   Author:
     <figure class="viz serieslab" data-serieslab>
       <figcaption class="viz-title">…</figcaption>
       <script type="application/json" class="sl-config">{ "mode":"…", … }</script>
       <p class="viz-fallback">…</p>
     </figure>
   ============================================================ */
(function () {
  "use strict";
  var SVGNS = "http://www.w3.org/2000/svg";
  function el(t, c, x) { var e = document.createElement(t); if (c) e.className = c; if (x != null) e.textContent = x; return e; }
  function svg(t, a) { var e = document.createElementNS(SVGNS, t); if (a) for (var k in a) e.setAttribute(k, a[k]); return e; }
  function fmt(n) { n = Math.round(n); if (n >= 1e9) return (n / 1e9).toFixed(n % 1e9 ? 1 : 0) + "B"; if (n >= 1e6) return (n / 1e6).toFixed(n % 1e6 ? 1 : 0) + "M"; if (n >= 1e3) return (n / 1e3).toFixed(n % 1e3 ? 1 : 0) + "k"; return String(n); }

  /* ---------------- mode: metric types ---------------- */
  function modeTypes(host, cfg) {
    var TYPES = {
      counter: { label: "Counter", pts: [2, 5, 5, 9, 14, 14, 20, 27, 27, 31, 0, 4, 9], reset: true,
        desc: "Only ever goes up, then resets to 0 on restart. You never read the raw number — you read its <b>rate()</b>: “requests per second.”", q: "rate(http_requests_total[5m])" },
      gauge: { label: "Gauge", pts: [12, 15, 11, 18, 22, 17, 14, 20, 25, 19, 16, 21, 13],
        desc: "A snapshot that moves <b>up and down</b> — temperature, queue depth, memory in use, threads. Read the current value.", q: "node_memory_used_bytes" },
      histogram: { label: "Histogram", bars: [3, 7, 14, 22, 17, 9, 5, 2], hist: true,
        desc: "Counts observations into <b>buckets</b> (latency, payload size). You compute quantiles like <b>p95</b> from the buckets, server-side.", q: "histogram_quantile(0.95, sum by (le) (rate(http_request_duration_seconds_bucket[5m])))" }
    };
    var state = { t: "counter" };
    host.innerHTML = "";
    var tabs = el("div", "sl-tabs");
    Object.keys(TYPES).forEach(function (k) {
      var b = el("button", "sl-tab" + (k === state.t ? " on" : ""), TYPES[k].label);
      b.type = "button";
      b.addEventListener("click", function () { state.t = k; paint(); });
      tabs.appendChild(b);
    });
    host.appendChild(tabs);
    var chart = el("div", "sl-chart"); host.appendChild(chart);
    var q = el("div", "sl-query"); host.appendChild(q);
    var cap = el("div", "viz-caption"); host.appendChild(cap);

    function paint() {
      [].forEach.call(tabs.children, function (b, i) { b.classList.toggle("on", Object.keys(TYPES)[i] === state.t); });
      var d = TYPES[state.t];
      chart.innerHTML = "";
      var W = 460, H = 150, pad = 10;
      var s = svg("svg", { viewBox: "0 0 " + W + " " + H, class: "sl-svg", preserveAspectRatio: "none" });
      if (d.hist) {
        var bars = d.bars, bw = (W - pad * 2) / bars.length, max = Math.max.apply(null, bars);
        bars.forEach(function (v, i) {
          var h = (v / max) * (H - pad * 2);
          s.appendChild(svg("rect", { x: pad + i * bw + 3, y: H - pad - h, width: bw - 6, height: h, rx: 3, fill: "var(--accent)", opacity: 0.85 }));
        });
      } else {
        var pts = d.pts, n = pts.length, max2 = Math.max.apply(null, pts) || 1, bw2 = (W - pad * 2) / (n - 1);
        var dstr = "";
        pts.forEach(function (v, i) { dstr += (i ? "L" : "M") + (pad + i * bw2).toFixed(1) + "," + (H - pad - (v / max2) * (H - pad * 2)).toFixed(1) + " "; });
        var path = svg("path", { d: dstr, fill: "none", stroke: "var(--accent)", "stroke-width": 2.5, "stroke-linejoin": "round", "stroke-linecap": "round" });
        s.appendChild(path);
        pts.forEach(function (v, i) { s.appendChild(svg("circle", { cx: pad + i * bw2, cy: H - pad - (v / max2) * (H - pad * 2), r: 2.6, fill: "var(--accent-2)" })); });
      }
      chart.appendChild(s);
      q.innerHTML = "PromQL: <code>" + d.q.replace(/</g, "&lt;") + "</code>";
      cap.innerHTML = d.desc;
    }
    paint();
  }

  /* ---------------- mode: cardinality ---------------- */
  function modeCardinality(host, cfg) {
    var labels = (cfg.labels && cfg.labels.length) ? cfg.labels : [
      { name: "endpoint", values: 20, max: 80 },
      { name: "status_code", values: 5, max: 12 },
      { name: "region", values: 4, max: 12 },
      { name: "user_id", values: 1, max: 100000 }
    ];
    var metric = cfg.metric || "http_requests_total";
    host.innerHTML = "";
    var rows = el("div", "sl-cards"); host.appendChild(rows);
    var read = el("div", "sl-read"); host.appendChild(read);
    var meter = el("div", "sl-meter"); var mfill = el("div", "sl-meter-fill"); meter.appendChild(mfill); host.appendChild(meter);
    var cap = el("div", "viz-caption"); host.appendChild(cap);

    labels.forEach(function (L) {
      var r = el("label", "sl-crow");
      r.appendChild(el("span", "sl-cname", L.name));
      var inp = document.createElement("input"); inp.type = "range"; inp.min = 1; inp.max = L.max || 100; inp.step = 1; inp.value = L.values; inp.className = "sl-slider";
      var out = el("span", "sl-cval", fmt(L.values));
      inp.addEventListener("input", function () { L.values = +inp.value; out.textContent = fmt(L.values); paint(); });
      r.appendChild(inp); r.appendChild(out); rows.appendChild(r);
    });

    function paint() {
      var total = labels.reduce(function (a, L) { return a * Math.max(1, L.values); }, 1);
      var risk = total < 1000 ? { c: "#34d399", t: "comfortable" } : total < 100000 ? { c: "#fbbf24", t: "watch this" } : { c: "#fb7185", t: "cardinality bomb 💣" };
      read.innerHTML = "<code>" + metric + "</code> &times; labels = <b style='color:" + risk.c + "'>" + fmt(total) + "</b> time series";
      var frac = Math.min(1, Math.log10(total + 1) / 7); // log scale, 10^7 fills the bar
      mfill.style.width = (frac * 100) + "%"; mfill.style.background = risk.c;
      cap.innerHTML = "Every unique <em>combination</em> of label values is its own stored time series (<b>" + risk.t + "</b>). One high-cardinality label like <code>user_id</code> multiplies everything — that’s why IDs, emails and URLs must never be metric labels.";
    }
    paint();
  }

  /* ---------------- mode: histogram / percentiles ---------------- */
  function modeHistogram(host, cfg) {
    var bounds = cfg.bounds || [5, 10, 25, 50, 100, 250, 500, 1000, 2500]; // ms upper bounds
    var base = cfg.base || [40, 120, 240, 180, 90, 40, 18, 8, 4];
    host.innerHTML = "";
    var ctrls = el("div", "sl-ctrls");
    var lab = el("label", "sl-srow"); lab.appendChild(el("span", "sl-slabel", "tail weight"));
    var inp = document.createElement("input"); inp.type = "range"; inp.min = 0; inp.max = 100; inp.step = 1; inp.value = cfg.skew != null ? cfg.skew : 25; inp.className = "sl-slider";
    var out = el("span", "sl-sval", inp.value + "%");
    lab.appendChild(inp); lab.appendChild(out); ctrls.appendChild(lab); host.appendChild(ctrls);
    var chart = el("div", "sl-chart"); host.appendChild(chart);
    var read = el("div", "sl-read"); host.appendChild(read);
    var cap = el("div", "viz-caption"); host.appendChild(cap);

    function counts() {
      var k = (+inp.value) / 100;
      return base.map(function (c, i) { return Math.max(0, Math.round(c * (1 - k) + c * k * (i / (base.length - 1)) * 6)); });
    }
    function quantile(cs, p) {
      var total = cs.reduce(function (a, b) { return a + b; }, 0), want = total * p, cum = 0;
      for (var i = 0; i < cs.length; i++) {
        if (cum + cs[i] >= want) {
          var lo = i === 0 ? 0 : bounds[i - 1], hi = bounds[i];
          var frac = cs[i] ? (want - cum) / cs[i] : 0;
          return lo + (hi - lo) * frac;
        }
        cum += cs[i];
      }
      return bounds[bounds.length - 1];
    }
    function mean(cs) {
      var num = 0, den = 0;
      cs.forEach(function (c, i) { var lo = i === 0 ? 0 : bounds[i - 1], mid = (lo + bounds[i]) / 2; num += mid * c; den += c; });
      return den ? num / den : 0;
    }
    function paint() {
      out.textContent = inp.value + "%";
      var cs = counts(), max = Math.max.apply(null, cs) || 1;
      chart.innerHTML = "";
      var W = 460, H = 160, pad = 12, bw = (W - pad * 2) / cs.length;
      var s = svg("svg", { viewBox: "0 0 " + W + " " + H, class: "sl-svg", preserveAspectRatio: "none" });
      cs.forEach(function (v, i) {
        var h = (v / max) * (H - pad * 2 - 14);
        s.appendChild(svg("rect", { x: pad + i * bw + 2, y: H - pad - h, width: bw - 4, height: h, rx: 2, fill: "var(--accent)", opacity: 0.8 }));
        var tx = svg("text", { x: pad + i * bw + bw / 2, y: H - 2, "text-anchor": "middle", class: "sl-blab" });
        tx.textContent = bounds[i]; s.appendChild(tx);
      });
      var p50 = quantile(cs, 0.5), p95 = quantile(cs, 0.95), p99 = quantile(cs, 0.99), mu = mean(cs);
      [["p50", p50, "#34d399"], ["avg", mu, "#94a3b8"], ["p95", p95, "#fbbf24"], ["p99", p99, "#fb7185"]].forEach(function (mk) {
        var x = pad + Math.min(1, mk[1] / bounds[bounds.length - 1]) * (W - pad * 2);
        s.appendChild(svg("line", { x1: x, y1: pad, x2: x, y2: H - pad - 14, stroke: mk[2], "stroke-width": 2, "stroke-dasharray": "4 3" }));
        var t = svg("text", { x: Math.min(W - 18, x + 3), y: pad + 10, class: "sl-mk", fill: mk[2] }); t.textContent = mk[0]; s.appendChild(t);
      });
      chart.appendChild(s);
      read.innerHTML = "avg <b style='color:#94a3b8'>" + Math.round(mu) + "ms</b> &middot; p50 <b style='color:#34d399'>" + Math.round(p50) + "ms</b> &middot; p95 <b style='color:#fbbf24'>" + Math.round(p95) + "ms</b> &middot; p99 <b style='color:#fb7185'>" + Math.round(p99) + "ms</b>";
      cap.innerHTML = "Drag the tail. The <b>average barely moves</b> while <b>p99 explodes</b> — that’s the slow experience real users feel. Alert and design to percentiles, never the mean.";
    }
    inp.addEventListener("input", paint);
    paint();
  }

  function init(fig) {
    var confEl = fig.querySelector(".sl-config");
    var cfg = {}; if (confEl) { try { cfg = JSON.parse(confEl.textContent) || {}; } catch (e) { return; } }
    var host = el("div", "sl-host"); fig.appendChild(host);
    var titleEl = fig.querySelector(".viz-title"); if (titleEl && cfg.title) titleEl.textContent = cfg.title;
    if (cfg.mode === "cardinality") modeCardinality(host, cfg);
    else if (cfg.mode === "histogram") modeHistogram(host, cfg);
    else modeTypes(host, cfg);
    var fb = fig.querySelector(".viz-fallback"); if (fb) fb.style.display = "none";
  }

  function onReady(fn) { if (document.readyState !== "loading") fn(); else document.addEventListener("DOMContentLoaded", fn); }
  onReady(function () { document.querySelectorAll(".serieslab").forEach(init); });
})();
