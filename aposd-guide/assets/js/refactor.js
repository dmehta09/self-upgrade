/* ============================================================
   A Philosophy of Software Design — before→after refactor viewer
   For each <div class="refactor" data-refactor> with an .rf-before
   and .rf-after pane: inserts a Before|After toggle (shown only on
   narrow screens via CSS) and wires it. On wide screens both panes
   stay side-by-side. Both panes always live in the DOM, so the
   comparison is searchable, printable, and readable with JS off.
   ============================================================ */
(function () {
  "use strict";
  function onReady(fn) {
    if (document.readyState !== "loading") fn();
    else document.addEventListener("DOMContentLoaded", fn);
  }
  function shortLabel(el, fallback) {
    var h = el.querySelector(".rf-h");
    var t = (h ? h.textContent : "") || fallback;
    return t.split("·")[0].trim() || fallback;   // "Before · shallow" -> "Before"
  }

  onReady(function () {
    document.querySelectorAll(".refactor[data-refactor]").forEach(function (rf) {
      var before = rf.querySelector(".rf-before");
      var after = rf.querySelector(".rf-after");
      if (!before || !after) return;

      var bar = document.createElement("div");
      bar.className = "rf-toggle";
      bar.setAttribute("role", "tablist");

      var bBtn = document.createElement("button");
      bBtn.type = "button"; bBtn.className = "rf-tab active";
      bBtn.textContent = shortLabel(before, "Before");

      var aBtn = document.createElement("button");
      aBtn.type = "button"; aBtn.className = "rf-tab";
      aBtn.textContent = shortLabel(after, "After");

      bar.appendChild(bBtn);
      bar.appendChild(aBtn);
      rf.insertBefore(bar, rf.firstChild);
      rf.classList.add("js-on", "rf-view-before");

      function show(view) {
        rf.classList.remove("rf-view-before", "rf-view-after");
        rf.classList.add("rf-view-" + view);
        bBtn.classList.toggle("active", view === "before");
        aBtn.classList.toggle("active", view === "after");
      }
      bBtn.addEventListener("click", function () { show("before"); });
      aBtn.addEventListener("click", function () { show("after"); });
    });
  });
})();
