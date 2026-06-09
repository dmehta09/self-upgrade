/* ============================================================
   Observability Field Guide — distributed-trace waterfall
   A tiny, dependency-free, data-driven engine that stacks the SPANS
   of one distributed trace on a shared time scale, so you can see the
   parent/child nesting, where the time actually goes, and the
   critical path. Static (no playback) — it positions each span bar
   (left/width as a % of scaleMs), indents by depth, colors by span
   kind, and rings the critical-path spans. Offline, theme-aware,
   honors prefers-reduced-motion (no reveal animation).

   Authoring (the page author writes ONLY this):
     <figure class="viz tracewf" data-tracewf>
       <figcaption class="viz-title">…</figcaption>
       <script type="application/json" class="twf-config">{…}</script>
       <p class="viz-fallback">Static fallback text for no-JS.</p>
     </figure>

   Config: { title?, scaleMs, unit?, legend?, caption?, spans:[
       { service, name, t:[start,end], kind, depth?, critical? } ] }
   kind ∈ server|client|http|db|cache|queue|compute|error  → .twf-bar.k-<kind>
   ============================================================ */
(function () {
  "use strict";
  var REDUCED = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  var KIND_BG = {
    server: "#818cf8", client: "#38bdf8", http: "#22d3ee", db: "#34d399",
    cache: "#2dd4bf", queue: "#fbbf24", compute: "#a78bfa", error: "#fb7185"
  };
  var KIND_LABEL = {
    server: "server", client: "client", http: "http call", db: "db query",
    cache: "cache", queue: "queue", compute: "compute", error: "error"
  };

  function el(tag, cls, txt) { var e = document.createElement(tag); if (cls) e.className = cls; if (txt != null) e.textContent = txt; return e; }
  function pct(v, scale) { return (v / scale) * 100; }
  function reveal(node, ms) {
    if (REDUCED) return;
    node.style.opacity = "0"; node.style.transform = "translateX(-4px)";
    node.style.transition = "opacity .4s ease " + ms + "ms, transform .4s ease " + ms + "ms";
    requestAnimationFrame(function () { node.style.opacity = "1"; node.style.transform = "translateX(0)"; });
  }

  function buildRow(span, scaleMs, unit, seen, i) {
    var row = el("div", "twf-row" + (span.critical ? " is-critical" : ""));
    var depth = +span.depth || 0;

    var lab = el("div", "twf-lab");
    lab.style.paddingLeft = (depth * 16) + "px";
    lab.appendChild(el("span", "twf-op", span.name || ""));
    lab.appendChild(el("span", "twf-svc", span.service || ""));
    row.appendChild(lab);

    var track = el("div", "twf-track");
    var t = span.t || [0, 0], start = +t[0] || 0, end = +t[1] || 0;
    var dur = Math.max(0, end - start);
    var kind = span.kind || "compute";
    if (seen) seen[kind] = true;
    var bar = el("div", "twf-bar k-" + kind + (span.critical ? " is-critical" : ""));
    var w = pct(dur, scaleMs);
    bar.style.left = pct(start, scaleMs) + "%";
    bar.style.width = Math.max(1.2, w) + "%";
    bar.title = (span.service ? span.service + " · " : "") + (span.name || "") + " — " + dur + (unit || "ms");
    var durTxt = dur + (unit || "ms");
    if (w >= 14) { bar.appendChild(el("span", "twf-dur in", durTxt)); }
    track.appendChild(bar);
    if (w < 14) { var ext = el("span", "twf-dur out", durTxt); ext.style.left = (pct(start, scaleMs) + Math.max(1.2, w)) + "%"; track.appendChild(ext); }
    row.appendChild(track);
    reveal(row, i * 55);
    return row;
  }

  function buildAxis(scaleMs, unit) {
    var ax = el("div", "twf-axis");
    [0, 0.25, 0.5, 0.75, 1].forEach(function (f) {
      var tick = el("span", "twf-tick", Math.round(scaleMs * f) + (unit || "ms"));
      tick.style.left = (f * 100) + "%";
      ax.appendChild(tick);
    });
    return ax;
  }

  function buildLegend(seen) {
    var legend = el("div", "twf-legend");
    Object.keys(KIND_LABEL).forEach(function (kind) {
      if (!seen[kind]) return;
      var span = el("span");
      var i = el("i"); i.style.background = KIND_BG[kind];
      span.appendChild(i); span.appendChild(el("span", null, KIND_LABEL[kind]));
      legend.appendChild(span);
    });
    return legend;
  }

  function build(fig) {
    var confEl = fig.querySelector(".twf-config");
    if (!confEl) return;
    var cfg; try { cfg = JSON.parse(confEl.textContent); } catch (e) { return; }
    var spans = cfg.spans || [];
    var scaleMs = +cfg.scaleMs;
    if (!spans.length || !(scaleMs > 0)) return;

    var titleEl = fig.querySelector(".viz-title");
    if (titleEl && cfg.title) titleEl.textContent = cfg.title;

    var stage = el("div", "twf-stage");
    var seen = {};
    spans.forEach(function (s, i) { stage.appendChild(buildRow(s, scaleMs, cfg.unit, seen, i)); });
    stage.appendChild(buildAxis(scaleMs, cfg.unit));
    fig.appendChild(stage);

    if (cfg.legend !== false) fig.appendChild(buildLegend(seen));
    if (cfg.caption) fig.appendChild(el("div", "viz-caption", cfg.caption));

    var fallback = fig.querySelector(".viz-fallback");
    if (fallback) fallback.style.display = "none";
  }

  function onReady(fn) { if (document.readyState !== "loading") fn(); else document.addEventListener("DOMContentLoaded", fn); }
  onReady(function () { document.querySelectorAll(".tracewf").forEach(build); });
})();
