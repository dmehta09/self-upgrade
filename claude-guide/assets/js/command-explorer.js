/* ============================================================
   Claude & Claude Code — Field Guide · COMMAND EXPLORER
   A searchable / filterable reference of slash commands,
   settings.json keys, CLI flags, hooks and env vars. Data lives
   in commands-data.js (window.CLAUDE_COMMANDS = [ {name, kind,
   category, summary, detail, example} ]). Each .cmd-explorer
   builds its own UI; add data-kinds="slash,flag" to restrict it
   to certain kinds. Free-text filter + kind chips + click to
   expand. Offline, no deps.
   ============================================================ */
(function () {
  "use strict";

  var KIND_LABEL = { slash: "/ commands", setting: "settings", flag: "CLI flags", hook: "hooks", env: "env vars" };

  function esc(s) { return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"); }

  function build(root) {
    var DATA = (window.CLAUDE_COMMANDS || []).slice();
    if (!DATA.length) { root.innerHTML = '<div class="cx-empty">Command data not loaded.</div>'; return; }

    var only = (root.getAttribute("data-kinds") || "").split(",").map(function (s) { return s.trim(); }).filter(Boolean);
    if (only.length) DATA = DATA.filter(function (d) { return only.indexOf(d.kind) !== -1; });

    // distinct kinds present, in canonical order
    var order = ["slash", "setting", "flag", "hook", "env"];
    var kinds = order.filter(function (k) { return DATA.some(function (d) { return d.kind === k; }); });

    var chipsHTML = '<button class="cx-chip active" data-k="" type="button">all</button>' +
      kinds.map(function (k) { return '<button class="cx-chip" data-k="' + k + '" type="button">' + esc(KIND_LABEL[k] || k) + "</button>"; }).join("");

    root.innerHTML =
      '<div class="cx-bar">' +
        '<label class="cx-search"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/></svg>' +
        '<input type="text" placeholder="Filter commands, settings, flags…" aria-label="Filter" autocomplete="off" spellcheck="false" /></label>' +
        '<div class="cx-chips">' + chipsHTML + "</div>" +
        '<span class="cx-count"></span>' +
      "</div>" +
      '<ul class="cx-list" role="list"></ul>';

    var input = root.querySelector(".cx-search input");
    var chips = root.querySelectorAll(".cx-chip");
    var list = root.querySelector(".cx-list");
    var countEl = root.querySelector(".cx-count");
    var activeKind = "", query = "";

    function matches(d) {
      if (activeKind && d.kind !== activeKind) return false;
      if (!query) return true;
      var hay = (d.name + " " + (d.summary || "") + " " + (d.detail || "") + " " + (d.category || "")).toLowerCase();
      return query.split(/\s+/).every(function (t) { return hay.indexOf(t) !== -1; });
    }

    function render() {
      var rows = DATA.filter(matches);
      countEl.textContent = rows.length + " of " + DATA.length;
      if (!rows.length) { list.innerHTML = '<li class="cx-empty">No matches.</li>'; return; }
      list.innerHTML = rows.map(function (d, i) {
        return '<li class="cx-row" data-i="' + i + '">' +
          '<button class="cx-rowhead" type="button">' +
            '<span class="cx-name">' + esc(d.name) + "</span>" +
            '<span class="cx-kind ' + d.kind + '">' + esc(d.kind) + "</span>" +
            '<span class="cx-summary">' + esc(d.summary || "") + "</span>" +
            '<svg class="cx-chev" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>' +
          "</button>" +
          '<div class="cx-detail">' +
            (d.detail ? "<p>" + esc(d.detail) + "</p>" : "") +
            (d.example ? '<div class="cx-ex">' + esc(d.example) + "</div>" : "") +
          "</div>" +
        "</li>";
      }).join("");
      list.querySelectorAll(".cx-row").forEach(function (row) {
        row.querySelector(".cx-rowhead").addEventListener("click", function () { row.classList.toggle("open"); });
      });
    }

    input.addEventListener("input", function () { query = input.value.trim().toLowerCase(); render(); });
    chips.forEach(function (c) {
      c.addEventListener("click", function () {
        chips.forEach(function (x) { x.classList.remove("active"); });
        c.classList.add("active");
        activeKind = c.getAttribute("data-k");
        render();
      });
    });

    render();
  }

  function onReady(fn) { if (document.readyState !== "loading") fn(); else document.addEventListener("DOMContentLoaded", fn); }
  onReady(function () { document.querySelectorAll(".cmd-explorer").forEach(build); });
})();
