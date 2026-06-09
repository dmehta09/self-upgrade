/* ============================================================
   DSA Field Guide — client-side full-text search (no deps)
   Reads window.SEARCH_INDEX (loaded as a <script>, so it works at
   file:// where fetch() of local JSON is blocked). Builds its own
   overlay so each page only needs a .search-trigger button.
   Open with the trigger, "/" or Cmd/Ctrl-K · navigate up/down · Enter.
   ============================================================ */
(function () {
  "use strict";
  var BASE = window.SITE_BASE || "./";
  var INDEX = window.SEARCH_INDEX || [];

  var overlay, input, list, results = [], active = -1;

  function esc(s) { return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"); }
  function reEscape(t) { return t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); }

  function build() {
    overlay = document.createElement("div");
    overlay.className = "search-overlay";
    overlay.innerHTML =
      '<div class="search-modal" role="dialog" aria-label="Search">' +
        '<div class="search-head">' +
          '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/></svg>' +
          '<input class="search-input" type="text" placeholder="Search the guide - try 422, Annotated, session, async" aria-label="Search query" autocomplete="off" spellcheck="false" />' +
        '</div>' +
        '<ul class="search-results" role="listbox"></ul>' +
        '<div class="search-foot"><span><kbd>up</kbd><kbd>dn</kbd> navigate</span><span><kbd>enter</kbd> open</span><span><kbd>esc</kbd> close</span></div>' +
      '</div>';
    document.body.appendChild(overlay);
    input = overlay.querySelector(".search-input");
    list = overlay.querySelector(".search-results");

    overlay.addEventListener("click", function (e) { if (e.target === overlay) close(); });
    input.addEventListener("input", function () { run(input.value); });
    input.addEventListener("keydown", onKey);
  }

  function open() {
    if (!overlay) build();
    overlay.classList.add("open");
    input.value = ""; run("");
    setTimeout(function () { input.focus(); }, 20);
  }
  function close() { if (overlay) overlay.classList.remove("open"); }
  function isOpen() { return overlay && overlay.classList.contains("open"); }

  function tokenize(s) { return (s || "").toLowerCase().split(/[^a-z0-9_]+/).filter(Boolean); }

  function score(rec, qtokens) {
    var s = 0, all = true;
    var keys = (rec.keywords || []).map(function (k) { return String(k).toLowerCase(); });
    var section = (rec.section || "").toLowerCase();
    var text = (rec.text || "").toLowerCase();
    qtokens.forEach(function (t) {
      var hit = 0;
      if (keys.indexOf(t) !== -1) hit += 8;
      else if (keys.some(function (k) { return k.indexOf(t) === 0; })) hit += 4;
      if (section.indexOf(t) !== -1) hit += 2;
      if (text.indexOf(t) !== -1) hit += 1;
      if (!hit) all = false;
      s += hit;
    });
    if (all && qtokens.length > 1) s += 4; // reward records matching every term
    return s;
  }

  // Build snippet with <mark> around matches. Escapes as it walks, so no sentinels needed.
  function snippet(rec, qtokens) {
    var text = rec.text || "";
    var low = text.toLowerCase(), pos = -1;
    for (var i = 0; i < qtokens.length && pos < 0; i++) pos = low.indexOf(qtokens[i]);
    var start = pos > 60 ? pos - 50 : 0;
    var frag = text.slice(start, start + 150);
    if (start > 0) frag = "..." + frag;
    var pats = qtokens.filter(Boolean).map(reEscape);
    if (!pats.length) return esc(frag);
    var re = new RegExp("(" + pats.join("|") + ")", "ig");
    var out = "", lastIdx = 0, m;
    while ((m = re.exec(frag)) !== null) {
      out += esc(frag.slice(lastIdx, m.index)) + "<mark>" + esc(m[0]) + "</mark>";
      lastIdx = re.lastIndex;
      if (m.index === re.lastIndex) re.lastIndex++; // guard against zero-length matches
    }
    out += esc(frag.slice(lastIdx));
    return out;
  }

  function run(q) {
    var qt = tokenize(q);
    results = [];
    if (qt.length) {
      INDEX.forEach(function (rec) { var s = score(rec, qt); if (s > 0) results.push({ rec: rec, s: s }); });
      results.sort(function (a, b) { return b.s - a.s; });
      results = results.slice(0, 8);
    }
    active = results.length ? 0 : -1;
    render(qt, q);
  }

  function render(qt, q) {
    if (!q) { list.innerHTML = '<li class="search-empty">Type to search across every page.</li>'; return; }
    if (!INDEX.length) { list.innerHTML = '<li class="search-empty">Search index not built yet.</li>'; return; }
    if (!results.length) { list.innerHTML = '<li class="search-empty">No matches for &ldquo;' + esc(q) + '&rdquo;.</li>'; return; }
    list.innerHTML = results.map(function (r, i) {
      var rec = r.rec;
      return '<li class="search-result' + (i === active ? " active" : "") + '" data-i="' + i + '">' +
        '<a href="' + BASE + rec.url + '">' +
          '<span class="sr-top"><span class="sr-dot t-' + (rec.tool || "home") + '"></span>' +
          '<span class="sr-section">' + esc(rec.section || rec.page) + '</span>' +
          '<span class="sr-page">' + esc(rec.page) + '</span></span>' +
          '<span class="sr-snip">' + snippet(rec, qt) + '</span>' +
        '</a></li>';
    }).join("");
    [].forEach.call(list.querySelectorAll(".search-result"), function (li) {
      li.addEventListener("mousemove", function () { active = +li.getAttribute("data-i"); paintActive(); });
      li.querySelector("a").addEventListener("click", function () { close(); });
    });
  }

  function paintActive() {
    [].forEach.call(list.querySelectorAll(".search-result"), function (li) {
      li.classList.toggle("active", +li.getAttribute("data-i") === active);
    });
  }

  function go() {
    if (active < 0 || !results[active]) return;
    var a = list.querySelector('.search-result[data-i="' + active + '"] a');
    if (a) { close(); location.href = a.getAttribute("href"); }
  }

  function scrollActive() { var li = list.querySelector(".search-result.active"); if (li && li.scrollIntoView) li.scrollIntoView({ block: "nearest" }); }

  function onKey(e) {
    if (e.key === "ArrowDown") { e.preventDefault(); if (results.length) { active = (active + 1) % results.length; paintActive(); scrollActive(); } }
    else if (e.key === "ArrowUp") { e.preventDefault(); if (results.length) { active = (active - 1 + results.length) % results.length; paintActive(); scrollActive(); } }
    else if (e.key === "Enter") { e.preventDefault(); go(); }
    else if (e.key === "Escape") { e.preventDefault(); close(); }
  }

  function typingInField(t) { return t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.isContentEditable); }

  function onReady(fn) { if (document.readyState !== "loading") fn(); else document.addEventListener("DOMContentLoaded", fn); }

  onReady(function () {
    var trig = document.querySelector(".search-trigger");
    if (trig) trig.addEventListener("click", open);
    document.addEventListener("keydown", function (e) {
      var meta = e.metaKey || e.ctrlKey;
      if (meta && (e.key === "k" || e.key === "K")) { e.preventDefault(); isOpen() ? close() : open(); return; }
      if (e.key === "/" && !isOpen() && !typingInField(e.target)) { e.preventDefault(); open(); }
    });
  });
})();
