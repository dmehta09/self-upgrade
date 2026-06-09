/* ============================================================
   Observability Field Guide — PromQL query explorer
   Dependency-free, theme-aware. A filterable list of PromQL queries;
   pick one to see a plain-English explanation and a tiny rendered
   sample result. Teaches "how do I actually ask this?" without a live
   Prometheus. Ships with a default essentials deck; override via JSON.

   Author:
     <figure class="viz queryexp" data-queryexp>
       <figcaption class="viz-title">…</figcaption>
       <script type="application/json" class="qe-config">{ "queries":[ … ] }</script>
       <p class="viz-fallback">…</p>
     </figure>
   query = { q, explain, kind?, result?("series"|"scalar"), preview?[…] }
   ============================================================ */
(function () {
  "use strict";
  var SVGNS = "http://www.w3.org/2000/svg";
  function el(t, c, x) { var e = document.createElement(t); if (c) e.className = c; if (x != null) e.textContent = x; return e; }
  function svg(t, a) { var e = document.createElementNS(SVGNS, t); if (a) for (var k in a) e.setAttribute(k, a[k]); return e; }
  function esc(s) { return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"); }

  var DEFAULT = [
    { q: "up", result: "scalar", preview: 1, explain: "<b>1</b> if a target is being scraped successfully, <b>0</b> if it is down. The simplest possible health signal — alert on <code>up == 0</code>." },
    { q: "rate(http_requests_total[5m])", result: "series", preview: [5, 6, 8, 7, 9, 11, 10, 12], explain: "Per-second average increase of a <b>counter</b> over a 5-minute window. You almost never graph a raw <code>_total</code> — you graph its <code>rate()</code>." },
    { q: "sum by (status) (rate(http_requests_total[5m]))", result: "series", preview: [9, 10, 11, 10, 12, 13, 12, 14], explain: "Take the per-second rate, then <b>aggregate</b> it grouped by the <code>status</code> label — requests/sec split into 2xx / 4xx / 5xx lines." },
    { q: "histogram_quantile(0.95, sum by (le) (rate(http_request_duration_seconds_bucket[5m])))", result: "series", preview: [180, 190, 210, 230, 205, 240, 260, 235], explain: "<b>p95 latency</b> computed from a histogram's bucket counts (<code>le</code> = “less-or-equal” bucket). The canonical latency query." },
    { q: "100 * sum(rate(http_requests_total{status=~\"5..\"}[5m])) / sum(rate(http_requests_total[5m]))", result: "scalar", preview: 0.8, explain: "<b>Error rate %</b>: 5xx requests over all requests. The <code>=~</code> is a regex match. This is your classic SLI." },
    { q: "node_memory_used_bytes / node_memory_total_bytes", result: "series", preview: [0.55, 0.58, 0.6, 0.63, 0.62, 0.66, 0.69, 0.71], explain: "Divide two <b>gauges</b> element-wise to get a 0–1 <b>utilization</b> ratio — the U in the USE method." }
  ];

  function init(fig) {
    var confEl = fig.querySelector(".qe-config");
    var cfg = {}; if (confEl) { try { cfg = JSON.parse(confEl.textContent) || {}; } catch (e) { return; } }
    var queries = (cfg.queries && cfg.queries.length) ? cfg.queries : DEFAULT;
    var titleEl = fig.querySelector(".viz-title"); if (titleEl && cfg.title) titleEl.textContent = cfg.title;

    var host = el("div", "qe-host"); fig.appendChild(host);
    var filt = document.createElement("input"); filt.type = "text"; filt.className = "qe-filter"; filt.placeholder = "filter queries… (rate, histogram, error)"; filt.setAttribute("aria-label", "Filter PromQL queries");
    host.appendChild(filt);
    var chips = el("div", "qe-chips"); host.appendChild(chips);
    var panel = el("div", "qe-panel"); host.appendChild(panel);

    var state = { sel: 0 };

    function renderChips() {
      var f = filt.value.toLowerCase();
      chips.innerHTML = "";
      queries.forEach(function (qd, i) {
        if (f && (qd.q + " " + (qd.explain || "")).toLowerCase().indexOf(f) === -1) return;
        var c = el("button", "qe-chip" + (i === state.sel ? " on" : ""), qd.q); c.type = "button"; c.setAttribute("data-i", i);
        c.addEventListener("click", function () { state.sel = i; renderChips(); renderPanel(); });
        chips.appendChild(c);
      });
      if (!chips.children.length) chips.appendChild(el("div", "qe-none", "No queries match."));
    }

    function renderPanel() {
      var qd = queries[state.sel]; if (!qd) { panel.innerHTML = ""; return; }
      panel.innerHTML = "";
      var qe = el("div", "qe-q"); qe.innerHTML = "<code>" + esc(qd.q) + "</code>"; panel.appendChild(qe);
      var ex = el("div", "qe-explain"); ex.innerHTML = qd.explain || ""; panel.appendChild(ex);
      var prev = el("div", "qe-preview");
      var lab = el("span", "qe-plabel", "result"); prev.appendChild(lab);
      if (Array.isArray(qd.preview)) {
        var W = 220, H = 46, pad = 3, pts = qd.preview, max = Math.max.apply(null, pts) || 1, min = Math.min.apply(null, pts), bw = (W - pad * 2) / (pts.length - 1);
        var s = svg("svg", { viewBox: "0 0 " + W + " " + H, class: "qe-spark", preserveAspectRatio: "none" });
        var dstr = "";
        pts.forEach(function (v, i) { var y = H - pad - ((v - min) / (max - min || 1)) * (H - pad * 2); dstr += (i ? "L" : "M") + (pad + i * bw).toFixed(1) + "," + y.toFixed(1) + " "; });
        s.appendChild(svg("path", { d: dstr, fill: "none", stroke: "var(--accent)", "stroke-width": 2, "stroke-linejoin": "round", "stroke-linecap": "round" }));
        prev.appendChild(s);
        prev.appendChild(el("span", "qe-pkind", (qd.result || "series") + " · " + pts.length + " points"));
      } else {
        prev.appendChild(el("span", "qe-pval", String(qd.preview != null ? qd.preview : "—")));
        prev.appendChild(el("span", "qe-pkind", (qd.result || "scalar")));
      }
      panel.appendChild(prev);
    }

    filt.addEventListener("input", renderChips);
    renderChips(); renderPanel();
    var fb = fig.querySelector(".viz-fallback"); if (fb) fb.style.display = "none";
  }

  function onReady(fn) { if (document.readyState !== "loading") fn(); else document.addEventListener("DOMContentLoaded", fn); }
  onReady(function () { document.querySelectorAll(".queryexp").forEach(init); });
})();
