/* ============================================================
   DSA Field Guide — whiteboard strip (static SVG templates)
   Mount: <div class="whiteboard" data-whiteboard></div>
   Optional: data-boards="array,tree,venn,bars" (default all)
   ============================================================ */
(function () {
  "use strict";
  var BOARDS = {
    array:
      '<svg viewBox="0 0 320 72" xmlns="http://www.w3.org/2000/svg" aria-label="Array with pointers">' +
      '<rect x="8" y="20" width="36" height="36" rx="4" fill="none" stroke="currentColor" stroke-width="1.5"/>' +
      '<rect x="48" y="20" width="36" height="36" rx="4" fill="none" stroke="currentColor" stroke-width="1.5"/>' +
      '<rect x="88" y="20" width="36" height="36" rx="4" fill="none" stroke="currentColor" stroke-width="1.5"/>' +
      '<rect x="128" y="20" width="36" height="36" rx="4" fill="none" stroke="currentColor" stroke-width="1.5"/>' +
      '<rect x="168" y="20" width="36" height="36" rx="4" fill="none" stroke="currentColor" stroke-width="1.5"/>' +
      '<rect x="208" y="20" width="36" height="36" rx="4" fill="none" stroke="currentColor" stroke-width="1.5"/>' +
      '<text x="26" y="14" text-anchor="middle" font-size="10" fill="currentColor">L</text>' +
      '<text x="146" y="14" text-anchor="middle" font-size="10" fill="currentColor">R</text>' +
      '<path d="M26 18v2M146 18v2" stroke="currentColor" stroke-width="1.5"/>' +
      '<text x="280" y="42" font-size="11" fill="currentColor" opacity=".7">array</text></svg>',
    tree:
      '<svg viewBox="0 0 280 120" xmlns="http://www.w3.org/2000/svg" aria-label="Binary tree">' +
      '<circle cx="140" cy="22" r="14" fill="none" stroke="currentColor" stroke-width="1.5"/>' +
      '<circle cx="80" cy="70" r="14" fill="none" stroke="currentColor" stroke-width="1.5"/>' +
      '<circle cx="200" cy="70" r="14" fill="none" stroke="currentColor" stroke-width="1.5"/>' +
      '<circle cx="50" cy="110" r="10" fill="none" stroke="currentColor" stroke-width="1.2" opacity=".5"/>' +
      '<circle cx="110" cy="110" r="10" fill="none" stroke="currentColor" stroke-width="1.2" opacity=".5"/>' +
      '<path d="M128 34 90 58M152 34 190 58M70 82 55 100M90 82 105 100" stroke="currentColor" stroke-width="1.2" fill="none"/>' +
      '<text x="230" y="24" font-size="11" fill="currentColor" opacity=".7">tree</text></svg>',
    venn:
      '<svg viewBox="0 0 260 100" xmlns="http://www.w3.org/2000/svg" aria-label="Two-set Venn">' +
      '<circle cx="100" cy="50" r="36" fill="none" stroke="currentColor" stroke-width="1.5"/>' +
      '<circle cx="150" cy="50" r="36" fill="none" stroke="currentColor" stroke-width="1.5"/>' +
      '<text x="78" y="54" font-size="11" fill="currentColor">A</text>' +
      '<text x="168" y="54" font-size="11" fill="currentColor">B</text>' +
      '<text x="210" y="24" font-size="11" fill="currentColor" opacity=".7">venn</text></svg>',
    bars:
      '<svg viewBox="0 0 280 90" xmlns="http://www.w3.org/2000/svg" aria-label="Bar chart skeleton">' +
      '<line x1="30" y1="10" x2="30" y2="75" stroke="currentColor" stroke-width="1.2"/>' +
      '<line x1="30" y1="75" x2="260" y2="75" stroke="currentColor" stroke-width="1.2"/>' +
      '<rect x="50" y="40" width="28" height="35" fill="none" stroke="currentColor" stroke-width="1.2"/>' +
      '<rect x="95" y="25" width="28" height="50" fill="none" stroke="currentColor" stroke-width="1.2"/>' +
      '<rect x="140" y="48" width="28" height="27" fill="none" stroke="currentColor" stroke-width="1.2"/>' +
      '<rect x="185" y="18" width="28" height="57" fill="none" stroke="currentColor" stroke-width="1.2"/>' +
      '<text x="230" y="20" font-size="11" fill="currentColor" opacity=".7">bars</text></svg>'
  };

  function onReady(fn) {
    if (document.readyState !== "loading") fn();
    else document.addEventListener("DOMContentLoaded", fn);
  }

  onReady(function () {
    document.querySelectorAll("[data-whiteboard]").forEach(function (host) {
      if (host.getAttribute("data-wb-ready")) return;
      host.setAttribute("data-wb-ready", "1");
      var keys = (host.getAttribute("data-boards") || "array,tree,venn,bars").split(",").map(function (s) { return s.trim(); }).filter(Boolean);
      var title = document.createElement("div");
      title.className = "wb-title";
      title.textContent = "Whiteboard · screenshot & narrate";
      host.appendChild(title);
      var row = document.createElement("div");
      row.className = "wb-row";
      keys.forEach(function (k) {
        if (!BOARDS[k]) return;
        var cell = document.createElement("div");
        cell.className = "wb-cell";
        cell.innerHTML = BOARDS[k];
        row.appendChild(cell);
      });
      host.appendChild(row);
    });
  });
})();
