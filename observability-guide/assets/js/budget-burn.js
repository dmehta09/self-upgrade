/* ============================================================
   Observability Field Guide — error-budget engine (SLO teaching)
   Dependency-free, theme-aware. Two modes via inline JSON "mode":
     • "burndown" — pick a steady error rate; watch the 30-day error
       budget deplete and read "days to exhaustion".
     • "burnrate" — pick an error rate; see the burn-rate multiple and
       which multi-window alert tier fires (the Google SRE table).

   Author:
     <figure class="viz budgetburn" data-budgetburn>
       <figcaption class="viz-title">…</figcaption>
       <script type="application/json" class="bb-config">{ "mode":"…", "slo":99.9 }</script>
       <p class="viz-fallback">…</p>
     </figure>
   ============================================================ */
(function () {
  "use strict";
  var SVGNS = "http://www.w3.org/2000/svg";
  function el(t, c, x) { var e = document.createElement(t); if (c) e.className = c; if (x != null) e.textContent = x; return e; }
  function svg(t, a) { var e = document.createElementNS(SVGNS, t); if (a) for (var k in a) e.setAttribute(k, a[k]); return e; }

  function slider(host, label, min, max, step, val, fmt, onin) {
    var r = el("label", "bb-srow"); r.appendChild(el("span", "bb-slabel", label));
    var inp = document.createElement("input"); inp.type = "range"; inp.min = min; inp.max = max; inp.step = step; inp.value = val; inp.className = "sl-slider";
    var out = el("span", "bb-sval", fmt(val));
    inp.addEventListener("input", function () { out.textContent = fmt(+inp.value); onin(+inp.value); });
    r.appendChild(inp); r.appendChild(out); host.appendChild(r);
    return inp;
  }

  /* ---------------- mode: burndown ---------------- */
  function modeBurndown(host, cfg) {
    var slo = cfg.slo != null ? cfg.slo : 99.9;
    var days = cfg.windowDays || 30;
    var B = 1 - slo / 100;               // budget as a fraction of requests
    var state = { e: cfg.errPct != null ? cfg.errPct : 0.05 };  // current error rate, %

    slider(host, "current error rate", 0, Math.max(0.5, B * 100 * 4), 0.01, state.e,
      function (v) { return (+v).toFixed(2) + "%"; }, function (v) { state.e = v; paint(); });

    var chart = el("div", "bb-chart"); host.appendChild(chart);
    var read = el("div", "bb-read"); host.appendChild(read);
    var cap = el("div", "viz-caption"); host.appendChild(cap);

    function paint() {
      var e = state.e / 100;
      var rate = B > 0 ? e / B : 0;                 // burn-rate multiple
      var dExh = e > 0 ? days * B / e : Infinity;   // days to exhaust
      chart.innerHTML = "";
      var W = 460, H = 150, pad = 22;
      var s = svg("svg", { viewBox: "0 0 " + W + " " + H, class: "bb-svg", preserveAspectRatio: "none" });
      // axes
      s.appendChild(svg("line", { x1: pad, y1: H - pad, x2: W - 6, y2: H - pad, stroke: "var(--border-strong)", "stroke-width": 1 }));
      s.appendChild(svg("line", { x1: pad, y1: 6, x2: pad, y2: H - pad, stroke: "var(--border-strong)", "stroke-width": 1 }));
      // budget line: remaining(d) = 1 - rate*(d/days)
      var x0 = pad, x1 = W - 6, y100 = 6, y0 = H - pad;
      function X(d) { return x0 + (d / days) * (x1 - x0); }
      function Y(f) { return y0 + f * (y100 - y0); }  // f=1 → top (100% budget), f=0 → bottom (empty)
      var dHit = rate > 0 ? Math.min(days, days / rate) : days;
      var endF = Math.max(0, 1 - rate);
      var path = "M" + X(0) + "," + Y(1) + " L" + X(dHit) + "," + Y(Math.max(0, 1 - rate * (dHit / days)));
      if (dHit < days) path += " L" + X(days) + "," + Y(0);
      var col = rate <= 1 ? "#34d399" : rate <= 2 ? "#fbbf24" : "#fb7185";
      // area
      var area = path + " L" + X(days) + "," + y0 + " L" + X(0) + "," + y0 + " Z";
      s.appendChild(svg("path", { d: area, fill: col, opacity: 0.12 }));
      s.appendChild(svg("path", { d: path, fill: "none", stroke: col, "stroke-width": 2.6, "stroke-linejoin": "round" }));
      if (dHit < days) s.appendChild(svg("circle", { cx: X(dHit), cy: Y(0), r: 4, fill: "#fb7185" }));
      [["0", 0], [days + "d", days]].forEach(function (t) { var tx = svg("text", { x: X(t[1]), y: H - 6, "text-anchor": "middle", class: "bb-ax" }); tx.textContent = t[0]; s.appendChild(tx); });
      var yl = svg("text", { x: 3, y: 12, class: "bb-ax" }); yl.textContent = "100%"; s.appendChild(yl);
      chart.appendChild(s);
      var life = dExh === Infinity ? "<b style='color:#34d399'>budget never burns</b>"
        : rate <= 1 ? "lasts the full <b style='color:#34d399'>" + days + "-day</b> window"
        : "exhausts in <b style='color:" + col + "'>" + (dExh < 1 ? (dExh * 24).toFixed(1) + "h" : dExh.toFixed(1) + " days") + "</b>";
      read.innerHTML = "SLO <b>" + slo + "%</b> &rarr; budget <b>" + (B * 100).toFixed(2) + "%</b> of requests &middot; burn rate <b style='color:" + col + "'>" + rate.toFixed(1) + "&times;</b> &middot; " + life;
      cap.innerHTML = "Error budget = <b>100% &minus; SLO</b>. Spend it slowly and you ship features; burn it fast (rate &gt; 1&times;) and the budget runs out before the window resets — the signal to <b>stop shipping and fix reliability</b>.";
    }
    paint();
  }

  /* ---------------- mode: burn rate / alert tiers ---------------- */
  function modeBurnrate(host, cfg) {
    var slo = cfg.slo != null ? cfg.slo : 99.9;
    var B = 1 - slo / 100;
    var TIERS = [
      { rate: 14.4, win: "1h + 5m", act: "Page", budget: "2% in 1h", c: "#fb7185" },
      { rate: 6, win: "6h + 30m", act: "Page", budget: "5% in 6h", c: "#fb923c" },
      { rate: 3, win: "1d + 2h", act: "Ticket", budget: "10% in 1d", c: "#fbbf24" },
      { rate: 1, win: "3d + 6h", act: "Ticket", budget: "10% in 3d", c: "#60a5fa" }
    ];
    var state = { e: cfg.errPct != null ? cfg.errPct : 1.5 };
    slider(host, "current error rate", 0, Math.max(2, B * 100 * 20), 0.05, state.e,
      function (v) { return (+v).toFixed(2) + "%"; }, function (v) { state.e = v; paint(); });

    var bar = el("div", "bb-ratebar"); var fill = el("div", "bb-ratefill"); bar.appendChild(fill);
    var ticks = el("div", "bb-ticks"); host.appendChild(bar); host.appendChild(ticks);
    [1, 3, 6, 14.4].forEach(function (r) { var t = el("span", "bb-tk", r + "×"); t.style.left = Math.min(100, (r / 20) * 100) + "%"; ticks.appendChild(t); });
    var rows = el("div", "bb-tiers"); host.appendChild(rows);
    TIERS.forEach(function (T, i) {
      var r = el("div", "bb-tier"); r.setAttribute("data-i", i);
      r.innerHTML = '<span class="bb-th" style="--tc:' + T.c + '">' + T.rate + '×</span>' +
        '<span class="bb-tw">' + T.win + '</span><span class="bb-ta">' + T.act + '</span><span class="bb-tb">' + T.budget + '</span>';
      rows.appendChild(r);
    });
    var read = el("div", "bb-read"); host.appendChild(read);
    var cap = el("div", "viz-caption"); host.appendChild(cap);

    function paint() {
      var rate = B > 0 ? (state.e / 100) / B : 0;
      fill.style.width = Math.min(100, (rate / 20) * 100) + "%";
      var active = -1, col = "#34d399", act = "Healthy — no alert";
      for (var i = 0; i < TIERS.length; i++) { if (rate >= TIERS[i].rate) { active = i; col = TIERS[i].c; act = TIERS[i].act + " (" + TIERS[i].win + " window)"; break; } }
      fill.style.background = col;
      [].forEach.call(rows.children, function (r, i) { r.classList.toggle("on", i === active); });
      read.innerHTML = "burn rate <b style='color:" + col + "'>" + rate.toFixed(1) + "&times;</b> &rarr; <b style='color:" + col + "'>" + act + "</b>";
      cap.innerHTML = "Multi-window, multi-burn-rate alerting: a <b>fast</b> burn (14.4&times; = 2% of the budget in an hour) <b>pages</b>; a slow burn just files a <b>ticket</b>. Pairing a long + short window kills false alarms and alerts on <em>symptoms</em>, not causes.";
    }
    paint();
  }

  function init(fig) {
    var confEl = fig.querySelector(".bb-config");
    var cfg = {}; if (confEl) { try { cfg = JSON.parse(confEl.textContent) || {}; } catch (e) { return; } }
    var host = el("div", "bb-host"); fig.appendChild(host);
    var titleEl = fig.querySelector(".viz-title"); if (titleEl && cfg.title) titleEl.textContent = cfg.title;
    if (cfg.mode === "burnrate") modeBurnrate(host, cfg);
    else modeBurndown(host, cfg);
    var fb = fig.querySelector(".viz-fallback"); if (fb) fb.style.display = "none";
  }

  function onReady(fn) { if (document.readyState !== "loading") fn(); else document.addEventListener("DOMContentLoaded", fn); }
  onReady(function () { document.querySelectorAll(".budgetburn").forEach(init); });
})();
