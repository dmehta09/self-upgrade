/* ============================================================
   Frontend Field Guide — progress tracking (offline, no deps)
   • "Mark as learned" toggle per page (reads <body data-lesson>)
   • live sidebar checkmarks
   • home progress dashboard (overall + per-module bars)
   localStorage key: cert-mocks-progress = { "<lesson-id>": { done: true, ts } }
   ============================================================ */
(function () {
  "use strict";
  var KEY = "cert-mocks-progress";
  var BASE = window.SITE_BASE || "./";
  var LESSONS = window.LESSONS || [];

  function read() { try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch (e) { return {}; } }
  function write(o) { try { localStorage.setItem(KEY, JSON.stringify(o)); } catch (e) {} }

  var state = read();

  var Progress = {
    isDone: function (id) { return !!(state[id] && state[id].done); },
    setDone: function (id, done) {
      if (done) state[id] = { done: true, ts: Date.now() };
      else delete state[id];
      write(state);
      document.dispatchEvent(new CustomEvent("progresschange", { detail: { id: id, done: done } }));
    },
    toggle: function (id) { this.setDone(id, !this.isDone(id)); },
    count: function () { var n = 0; LESSONS.forEach(function (l) { if (state[l.id] && state[l.id].done) n++; }); return n; },
    reset: function () { state = {}; write(state); document.dispatchEvent(new CustomEvent("progresschange", { detail: { reset: true } })); }
  };
  window.Progress = Progress;

  // resolve a registry url (root-relative) to an absolute pathname for comparison
  function abs(url) { try { return new URL(BASE + url, location.href).pathname; } catch (e) { return url; } }
  function absHref(href) { try { return new URL(href, location.href).pathname; } catch (e) { return href; } }

  function lessonForHref(href) {
    if (!href || href.charAt(0) === "#") return null;
    var p = absHref(href.split("#")[0]);
    for (var i = 0; i < LESSONS.length; i++) { if (abs(LESSONS[i].url) === p) return LESSONS[i]; }
    return null;
  }

  function onReady(fn) {
    if (document.readyState !== "loading") fn();
    else document.addEventListener("DOMContentLoaded", fn);
  }

  onReady(function () {
    /* ---- per-page "mark as learned" toggle ---- */
    var pageLesson = document.body.getAttribute("data-lesson");
    var btn = document.querySelector(".lesson-complete");
    if (btn && pageLesson) {
      var sync = function () { btn.classList.toggle("done", Progress.isDone(pageLesson)); };
      sync();
      btn.addEventListener("click", function () { Progress.toggle(pageLesson); });
      document.addEventListener("progresschange", sync);
    }

    /* ---- sidebar checkmarks ---- */
    function paintSidebar() {
      document.querySelectorAll(".sidebar .nav-link").forEach(function (a) {
        var lesson = lessonForHref(a.getAttribute("href"));
        if (!lesson) return;
        var done = Progress.isDone(lesson.id);
        a.classList.toggle("done", done);
        if (done && !a.querySelector(".nav-check")) {
          var s = document.createElement("span");
          s.className = "nav-check"; s.textContent = "✓";
          a.appendChild(s);
        }
      });
    }
    paintSidebar();
    document.addEventListener("progresschange", paintSidebar);

    /* ---- home dashboard ---- */
    var dash = document.querySelector(".progress-dash");
    if (dash) {
      var MODULES = window.LESSON_MODULES || [];
      var fillEl = dash.querySelector(".pd-fill");
      var countEl = dash.querySelector(".pd-count");
      var modsEl = dash.querySelector(".pd-modules");
      var resetBtn = dash.querySelector(".pd-reset");

      // build module rows once
      if (modsEl && !modsEl.children.length) {
        MODULES.forEach(function (m) {
          var total = LESSONS.filter(function (l) { return l.module === m.key; }).length;
          if (!total) return;
          var row = document.createElement("div");
          row.className = "pd-mod"; row.setAttribute("data-m", m.key);
          row.innerHTML =
            '<div class="pdm-top"><span class="pdm-name"><i></i>' + m.label + '</span>' +
            '<span class="pdm-frac">0/' + total + '</span></div>' +
            '<div class="pdm-track"><div class="pdm-fill"></div></div>';
          modsEl.appendChild(row);
        });
      }

      function paintDash() {
        var total = LESSONS.length, done = Progress.count();
        if (fillEl) fillEl.style.width = (total ? Math.round(done / total * 100) : 0) + "%";
        if (countEl) countEl.innerHTML = "<b>" + done + "</b> of " + total + " lessons complete";
        if (modsEl) {
          MODULES.forEach(function (m) {
            var row = modsEl.querySelector('.pd-mod[data-m="' + m.key + '"]');
            if (!row) return;
            var ls = LESSONS.filter(function (l) { return l.module === m.key; });
            var d = ls.filter(function (l) { return Progress.isDone(l.id); }).length;
            row.querySelector(".pdm-frac").textContent = d + "/" + ls.length;
            row.querySelector(".pdm-fill").style.width = (ls.length ? Math.round(d / ls.length * 100) : 0) + "%";
          });
        }
      }
      paintDash();
      document.addEventListener("progresschange", paintDash);
      if (resetBtn) resetBtn.addEventListener("click", function () {
        if (confirm("Clear your saved progress?")) Progress.reset();
      });
    }
  });
})();
