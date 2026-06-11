/* ============================================================
   Claude & Claude Code — Field Guide · FLASHCARDS
   Click/Enter/Space to flip; Shuffle (unknowns first); per-card
   known/unknown persisted to localStorage["claude-cards"] keyed by
   deck name + index. Both faces live in the DOM (searchable, and
   readable with JS off). Embed: <div class="flashdeck" data-deck="…">.
   ============================================================ */
(function () {
  "use strict";
  var KEY = "claude-cards";
  function read() { try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch (e) { return {}; } }
  function write(o) { try { localStorage.setItem(KEY, JSON.stringify(o)); } catch (e) {} }
  function onReady(fn) { if (document.readyState !== "loading") fn(); else document.addEventListener("DOMContentLoaded", fn); }

  onReady(function () {
    var store = read();
    document.querySelectorAll(".flashdeck").forEach(function (deck) {
      var name = deck.getAttribute("data-deck") || "deck";
      store[name] = store[name] || {};
      var list = deck.querySelector(".fd-cards");
      var cards = [].slice.call(deck.querySelectorAll(".flashcard"));
      var totalEl = deck.querySelector(".fd-total"), knownEl = deck.querySelector(".fd-progress b");
      if (totalEl) totalEl.textContent = cards.length;

      function paintCount() { if (knownEl) knownEl.textContent = Object.keys(store[name]).length; }

      cards.forEach(function (card, i) {
        if (store[name][i]) card.classList.add("known");
        card.addEventListener("click", function (e) { if (e.target.closest(".fc-mark")) return; card.classList.toggle("flipped"); });
        card.addEventListener("keydown", function (e) { if (e.key === " " || e.key === "Enter") { e.preventDefault(); card.classList.toggle("flipped"); } });
        var kb = card.querySelector(".fc-known"), ub = card.querySelector(".fc-unknown");
        if (kb) kb.addEventListener("click", function (e) { e.stopPropagation(); store[name][i] = 1; card.classList.add("known"); write(store); paintCount(); });
        if (ub) ub.addEventListener("click", function (e) { e.stopPropagation(); delete store[name][i]; card.classList.remove("known"); write(store); paintCount(); });
      });
      paintCount();

      var sh = deck.querySelector(".fd-shuffle"), rs = deck.querySelector(".fd-reset");
      if (sh && list) sh.addEventListener("click", function () {
        var arr = [].slice.call(list.children);
        for (var i = arr.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)), t = arr[i]; arr[i] = arr[j]; arr[j] = t; }
        arr.sort(function (a, b) { return (a.classList.contains("known") ? 1 : 0) - (b.classList.contains("known") ? 1 : 0); }); // unknowns first
        arr.forEach(function (c) { list.appendChild(c); });
      });
      if (rs) rs.addEventListener("click", function () {
        store[name] = {}; write(store);
        cards.forEach(function (c) { c.classList.remove("known", "flipped"); });
        paintCount();
      });
    });
  });
})();
