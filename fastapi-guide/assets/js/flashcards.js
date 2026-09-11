/* ============================================================
   FastAPI Field Guide — flashcards (Leitner-lite)
   Click/Enter/Space to flip; Shuffle (due / low-box first); per-card
   known/unknown persisted to localStorage["fa-cards"] keyed by
   deck name + index. Values: legacy `1` or `{ box:1-5, due:"ISO" }`.
   Embed: <div class="flashdeck" data-deck="…">.
   ============================================================ */
(function () {
  "use strict";
  var KEY = "fa-cards";
  var INTERVALS = [0, 1, 3, 7, 14, 30]; // days by box 1..5

  function read() { try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch (e) { return {}; } }
  function write(o) { try { localStorage.setItem(KEY, JSON.stringify(o)); } catch (e) {} }
  function onReady(fn) { if (document.readyState !== "loading") fn(); else document.addEventListener("DOMContentLoaded", fn); }
  function todayISO() { return new Date().toISOString().slice(0, 10); }
  function addDays(iso, n) {
    var d = new Date(iso + "T12:00:00");
    d.setDate(d.getDate() + n);
    return d.toISOString().slice(0, 10);
  }
  function normalize(v) {
    if (!v) return null;
    if (v === 1 || v === true) return { box: 3, due: todayISO() };
    if (typeof v === "object" && v.box) return { box: Math.max(1, Math.min(5, +v.box || 1)), due: v.due || todayISO() };
    return null;
  }
  function isDue(rec) {
    if (!rec) return true;
    return (rec.due || todayISO()) <= todayISO();
  }
  function promote(rec) {
    var box = rec ? Math.min(5, (rec.box || 1) + 1) : 2;
    return { box: box, due: addDays(todayISO(), INTERVALS[box] || 30) };
  }
  function demote() {
    return { box: 1, due: todayISO() };
  }

  onReady(function () {
    var store = read();
    document.querySelectorAll(".flashdeck").forEach(function (deck) {
      var name = deck.getAttribute("data-deck") || "deck";
      store[name] = store[name] || {};
      var list = deck.querySelector(".fd-cards");
      var cards = [].slice.call(deck.querySelectorAll(".flashcard"));
      var totalEl = deck.querySelector(".fd-total"), knownEl = deck.querySelector(".fd-progress b");
      if (totalEl) totalEl.textContent = cards.length;

      function paintCount() {
        if (!knownEl) return;
        var due = 0, mastered = 0;
        cards.forEach(function (_, i) {
          var r = normalize(store[name][i]);
          if (!r || isDue(r)) due++;
          if (r && r.box >= 4 && !isDue(r)) mastered++;
        });
        knownEl.textContent = mastered + " m · " + due + " due";
      }

      cards.forEach(function (card, i) {
        var rec = normalize(store[name][i]);
        if (rec && store[name][i] === 1) store[name][i] = rec;
        if (rec && rec.box >= 3 && !isDue(rec)) card.classList.add("known");
        card.addEventListener("click", function (e) { if (e.target.closest(".fc-mark")) return; card.classList.toggle("flipped"); });
        card.addEventListener("keydown", function (e) { if (e.key === " " || e.key === "Enter") { e.preventDefault(); card.classList.toggle("flipped"); } });
        var kb = card.querySelector(".fc-known"), ub = card.querySelector(".fc-unknown");
        if (kb) kb.addEventListener("click", function (e) {
          e.stopPropagation();
          store[name][i] = promote(normalize(store[name][i]));
          if (store[name][i].box >= 3) card.classList.add("known");
          write(store); paintCount();
        });
        if (ub) ub.addEventListener("click", function (e) {
          e.stopPropagation();
          store[name][i] = demote();
          card.classList.remove("known");
          write(store); paintCount();
        });
      });
      write(store);
      paintCount();

      var sh = deck.querySelector(".fd-shuffle"), rs = deck.querySelector(".fd-reset");
      if (sh && list) sh.addEventListener("click", function () {
        var arr = [].slice.call(list.children);
        for (var i = arr.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)), t = arr[i]; arr[i] = arr[j]; arr[j] = t; }
        arr.sort(function (a, b) {
          var ia = cards.indexOf(a), ib = cards.indexOf(b);
          var ra = normalize(store[name][ia]), rb = normalize(store[name][ib]);
          var da = !ra || isDue(ra) ? 0 : 1;
          var db = !rb || isDue(rb) ? 0 : 1;
          if (da !== db) return da - db;
          return ((ra && ra.box) || 0) - ((rb && rb.box) || 0);
        });
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
