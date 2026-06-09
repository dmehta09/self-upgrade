/* ============================================================
   Frontend Field Guide — waterfall engine
   A tiny, dependency-free, data-driven engine that stacks several
   request/hydration TIMELINES on a shared time scale so CSR, SSR,
   streaming and SSG/ISR can be compared side by side. It is static:
   no playback — it just positions each bar (left/width as a % of
   scaleMs) and drops an FCP marker per row, plus an optional legend.
   Offline, theme-aware (bar colors come from the .wf-bar.k-* CSS),
   honors prefers-reduced-motion (no reveal animation).

   Authoring (the page author writes ONLY this):
     <figure class="viz waterfall" data-waterfall>
       <figcaption class="viz-title">…</figcaption>
       <script type="application/json" class="wf-config">{…}</script>
       <p class="viz-fallback">Static fallback text for no-JS.</p>
     </figure>

   Config: { title?, caption?, scaleMs, legend?, strategies:[
       { name, fcp, bars:[ { label, t:[start,end], kind } ] } ] }
   kind ∈ html|js|data|server|stream|hydrate|static  → .wf-bar.k-<kind>
   ============================================================ */
(function () {
  "use strict";
  var REDUCED = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* kind → swatch color, mirroring the .wf-bar.k-* rules in frontend.css */
  var KIND_BG = {
    server: "#818cf8", html: "#7dd3fc", static: "#7dd3fc", js: "#fbbf24",
    data: "#fbbf24", stream: "#34d399", hydrate: "#fb7185"
  };
  /* human label per kind for the legend */
  var KIND_LABEL = {
    server: "server render", html: "HTML", static: "static (CDN)", js: "JS",
    data: "data fetch", stream: "stream", hydrate: "hydrate"
  };

  function el(tag, cls, txt) { var e = document.createElement(tag); if (cls) e.className = cls; if (txt != null) e.textContent = txt; return e; }
  function pct(v, scale) { return (v / scale) * 100; }

  /* subtle inline reveal — no CSS keyframes needed; fully skipped under REDUCED */
  function reveal(node, ms) {
    node.style.opacity = "0";
    node.style.transform = "translateY(3px)";
    node.style.transition = "opacity .4s ease " + ms + "ms, transform .4s ease " + ms + "ms";
    requestAnimationFrame(function () { node.style.opacity = "1"; node.style.transform = "translateY(0)"; });
  }

  function buildRow(strat, scaleMs, seen, ri) {
    var row = el("div", "wf-row");
    row.appendChild(el("div", "wf-name", strat.name || ""));
    var track = el("div", "wf-track");
    (strat.bars || []).forEach(function (bar) {
      var t = bar.t || [0, 0], start = +t[0] || 0, end = +t[1] || 0;
      var kind = bar.kind || "html";
      if (seen) seen[kind] = true;
      var w = pct(end - start, scaleMs);
      var b = el("div", "wf-bar k-" + kind);
      b.style.left = pct(start, scaleMs) + "%";
      b.style.width = w + "%";
      if (w >= 9 && bar.label) b.textContent = bar.label;   // hide labels on narrow bars
      track.appendChild(b);
      if (!REDUCED) reveal(b, ri * 60);                     // gentle staggered reveal per row
    });
    if (strat.fcp != null) {
      var fcp = el("div", "wf-fcp");
      fcp.style.left = pct(+strat.fcp, scaleMs) + "%";
      track.appendChild(fcp);
    }
    row.appendChild(track);
    return row;
  }

  function buildLegend(seen) {
    var legend = el("div", "wf-legend");
    var order = ["html", "static", "server", "js", "data", "stream", "hydrate"];
    order.forEach(function (kind) {
      if (!seen[kind]) return;
      var span = el("span");
      var i = el("i", "k-" + kind);
      i.style.background = KIND_BG[kind] || "var(--accent)";   // self-contained; CSS only colors .wf-bar.k-*
      span.appendChild(i);
      span.appendChild(el("span", null, KIND_LABEL[kind] || kind));
      legend.appendChild(span);
    });
    return legend;
  }

  function build(fig) {
    var confEl = fig.querySelector(".wf-config");
    if (!confEl) return;
    var cfg; try { cfg = JSON.parse(confEl.textContent); } catch (e) { return; }   // bad JSON → static fallback stays
    var strategies = cfg.strategies || [];
    var scaleMs = +cfg.scaleMs;
    if (!strategies.length || !(scaleMs > 0)) return;

    var titleEl = fig.querySelector(".viz-title");
    if (titleEl && cfg.title) titleEl.textContent = cfg.title;

    var stage = el("div", "viz-stage");
    var rows = el("div", "wf-rows");
    var seen = {};
    strategies.forEach(function (s, ri) { rows.appendChild(buildRow(s, scaleMs, seen, ri)); });
    stage.appendChild(rows);
    fig.appendChild(stage);

    if (cfg.legend) fig.appendChild(buildLegend(seen));
    if (cfg.caption) fig.appendChild(el("div", "viz-caption", cfg.caption));

    var fallback = fig.querySelector(".viz-fallback");      // success → drop the no-JS fallback
    if (fallback) fallback.style.display = "none";
  }

  function onReady(fn) { if (document.readyState !== "loading") fn(); else document.addEventListener("DOMContentLoaded", fn); }
  onReady(function () { document.querySelectorAll(".waterfall").forEach(build); });
})();
