/* ============================================================
   THE LANG STACK — tracelab: a LangSmith run-tree waterfall
   A read-only replica of the trace view: nested runs as indented
   rows, proportional waterfall bars, click a row for its
   input/output/latency/tokens. No network — data lives in config.

   Markup:
     <figure class="tracelab reveal" data-tracelab>
       <script type="application/json" class="tracelab-config">{...}</script>
     </figure>

   Config:
     total_ms: number              the full trace duration
     runs: [{id, parent, name, type: "chain"|"llm"|"tool"|"retriever",
             start, dur,           ms offsets within total_ms
             tokens, cost, error,  optional
             input, output}]       short strings for the drawer
   Rows are keyboard-focusable (Enter/Space opens the drawer).
   ============================================================ */
(function () {
  "use strict";

  function el(tag, cls, html) {
    var d = document.createElement(tag);
    if (cls) d.className = cls;
    if (html != null) d.innerHTML = html;
    return d;
  }
  function esc(s) { return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"); }
  function fmtMs(n) { return n >= 1000 ? (n / 1000).toFixed(2).replace(/\.?0+$/, "") + " s" : n + " ms"; }

  function init(host) {
    var cfgEl = host.querySelector(".tracelab-config");
    if (!cfgEl) return;
    var cfg;
    try { cfg = JSON.parse(cfgEl.textContent); } catch (e) { return; }
    var runs = cfg.runs || [];
    var total = cfg.total_ms || Math.max.apply(null, runs.map(function (r) { return r.start + r.dur; }).concat([1]));
    if (!runs.length) return;

    /* depth from parent chain */
    var byId = {};
    runs.forEach(function (r) { byId[r.id] = r; });
    function depth(r) { var d = 0, p = r.parent; while (p && byId[p]) { d++; p = byId[p].parent; } return d; }

    /* totals for the header */
    var sumTokens = 0, sumCost = 0, hasErr = false;
    runs.forEach(function (r) { sumTokens += r.tokens || 0; sumCost += r.cost || 0; if (r.error) hasErr = true; });

    var head = el("div", "tl-head",
      '<span class="tl-title">' + esc(runs[0].name || "trace") + "</span>" +
      '<span class="tl-totals">' +
        '<span class="tl-tot">⏱ ' + fmtMs(total) + "</span>" +
        (sumTokens ? '<span class="tl-tot">⛁ ' + sumTokens.toLocaleString() + " tok</span>" : "") +
        (sumCost ? '<span class="tl-tot">$ ' + sumCost.toFixed(4) + "</span>" : "") +
        (hasErr ? '<span class="tl-tot is-err">⚠ error</span>' : "") +
      "</span>");

    var rowsEl = el("div", "tl-rows");
    rowsEl.setAttribute("role", "list");
    var detail = el("div", "tl-detail");
    detail.hidden = true;

    var selected = null;
    function select(r, rowEl) {
      if (selected === rowEl) { rowEl.classList.remove("is-sel"); selected = null; detail.hidden = true; return; }
      rowsEl.querySelectorAll(".tl-row.is-sel").forEach(function (x) { x.classList.remove("is-sel"); });
      rowEl.classList.add("is-sel");
      selected = rowEl;
      detail.hidden = false;
      detail.innerHTML =
        '<div class="tld-top"><span class="tl-chip t-' + (r.type || "chain") + '">' + esc(r.type || "chain") + "</span>" +
        "<b>" + esc(r.name) + "</b>" +
        '<span class="tld-ms">' + fmtMs(r.dur) + (r.tokens ? " · " + r.tokens.toLocaleString() + " tok" : "") + (r.cost ? " · $" + r.cost.toFixed(4) : "") + "</span></div>" +
        (r.error ? '<div class="tld-err">⚠ ' + esc(r.error) + "</div>" : "") +
        '<div class="tld-io"><div class="tld-col"><h6>input</h6><pre>' + esc(r.input || "—") + "</pre></div>" +
        '<div class="tld-col"><h6>output</h6><pre>' + esc(r.output || "—") + "</pre></div></div>";
    }

    runs.forEach(function (r) {
      var d = depth(r);
      var row = el("div", "tl-row" + (r.error ? " is-err" : ""));
      row.setAttribute("role", "listitem");
      row.setAttribute("tabindex", "0");
      var left = (r.start / total * 100).toFixed(2), width = Math.max(r.dur / total * 100, 0.8).toFixed(2);
      row.innerHTML =
        '<span class="tl-name" style="padding-left:' + (d * 18) + 'px">' +
          '<span class="tl-chip t-' + (r.type || "chain") + '">' + esc(r.type || "chain") + "</span>" +
          esc(r.name) + (r.error ? " ⚠" : "") + "</span>" +
        '<span class="tl-track"><i class="tl-bar t-' + (r.type || "chain") + '" style="left:' + left + "%;width:" + width + '%"></i></span>' +
        '<span class="tl-ms">' + fmtMs(r.dur) + "</span>";
      row.addEventListener("click", function () { select(r, row); });
      row.addEventListener("keydown", function (e) {
        if (e.key === "Enter" || e.key === " ") { e.preventDefault(); select(r, row); }
      });
      rowsEl.appendChild(row);
    });

    host.appendChild(head);
    host.appendChild(rowsEl);
    host.appendChild(detail);
    var hint = el("div", "tl-hint", "Click any run to inspect its input and output — exactly how you debug in LangSmith.");
    host.appendChild(hint);
  }

  function onReady(fn) { if (document.readyState !== "loading") fn(); else document.addEventListener("DOMContentLoaded", fn); }
  onReady(function () {
    document.querySelectorAll("[data-tracelab]").forEach(init);
  });
})();
