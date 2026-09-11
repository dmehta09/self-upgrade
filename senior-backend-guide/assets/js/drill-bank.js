/* Drill UI for Senior Backend Scenario Q&A — uses window.SBE_DRILL from sbe-bank.js */
(function () {
  "use strict";
  function $(sel, root) { return (root || document).querySelector(sel); }
  function onReady(fn) {
    if (document.readyState !== "loading") fn();
    else document.addEventListener("DOMContentLoaded", fn);
  }

  onReady(function () {
    var mount = $("#sbe-drill");
    if (!mount || !window.SBE_DRILL || !window.SBE_DRILL.length) return;

    var all = window.SBE_DRILL.slice();
    var domain = "";
    var i = 0;
    var revealed = false;
    var order = all.map(function (_, idx) { return idx; });

    function shuffle(a) {
      for (var n = a.length - 1; n > 0; n--) {
        var j = Math.floor(Math.random() * (n + 1));
        var t = a[n]; a[n] = a[j]; a[j] = t;
      }
      return a;
    }

    function pool() {
      if (!domain) return all;
      return all.filter(function (q) { return q.domain === domain; });
    }

    function reset() {
      var p = pool();
      order = shuffle(p.map(function (_, idx) { return idx; }));
      i = 0;
      revealed = false;
      render();
    }

    function current() {
      var p = pool();
      if (!p.length) return null;
      return p[order[i % order.length]];
    }

    function render() {
      var q = current();
      if (!q) {
        mount.innerHTML = "<p class='muted'>No questions in this filter.</p>";
        return;
      }
      var ans = revealed
        ? "<div class='sac-label'>First 30s</div><div class='sac-first'>" + escapeHtml(q.first30s || "") + "</div>" +
          (q.modelAnswer && q.modelAnswer.length
            ? "<div class='sac-label'>Model steps</div><ol class='steps'>" + q.modelAnswer.map(function (s) { return "<li>" + escapeHtml(s) + "</li>"; }).join("") + "</ol>"
            : "") +
          "<div class='sac-label'>Say it</div><p>" + escapeHtml(q.sayIt || "") + "</p>" +
          (q.traps && q.traps.length ? "<div class='sac-label'>Traps</div><ul class='sac-traps'>" + q.traps.map(function (t) { return "<li>" + escapeHtml(t) + "</li>"; }).join("") + "</ul>" : "")
        : "<p class='muted'>Speak your structure for 60–90s, then reveal (First 30s → model steps → say it → traps).</p>";

      mount.innerHTML =
        "<div class='drill-meta'><span class='dm-k'>" + escapeHtml(q.id) + "</span> · " + escapeHtml(q.domainTitle) +
        " · " + (i + 1) + " / " + pool().length + "</div>" +
        "<h3 class='drill-q'>" + escapeHtml(q.q) + "</h3>" +
        "<div class='drill-ans'>" + ans + "</div>" +
        "<div class='drill-actions'>" +
        "<button type='button' class='btn' data-act='reveal'>" + (revealed ? "Hide" : "Reveal") + "</button>" +
        "<button type='button' class='btn primary' data-act='next'>Next</button>" +
        "</div>";
    }

    function escapeHtml(s) {
      return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    }

    var filter = $("#sbe-domain-filter");
    if (filter) {
      var domains = {};
      all.forEach(function (q) { domains[q.domain] = q.domainTitle; });
      filter.innerHTML = "<option value=''>All domains</option>" +
        Object.keys(domains).sort().map(function (d) {
          return "<option value='" + d + "'>" + domains[d] + "</option>";
        }).join("");
      filter.addEventListener("change", function () {
        domain = filter.value;
        reset();
      });
    }

    mount.addEventListener("click", function (e) {
      var btn = e.target.closest("[data-act]");
      if (!btn) return;
      var act = btn.getAttribute("data-act");
      if (act === "reveal") { revealed = !revealed; render(); }
      if (act === "next") { i = (i + 1) % Math.max(pool().length, 1); revealed = false; render(); }
    });

    var reshuffle = $("#sbe-reshuffle");
    if (reshuffle) reshuffle.addEventListener("click", reset);

    reset();
  });
})();
