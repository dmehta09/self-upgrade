/* ============================================================
   The Design Field Guide — machine-coding drill engine (.drill)
   A timed 45-minute LLD interview simulator. Pick a question from
   window.LLD_DRILLS, run the five phases (requirements → entities
   & API → UML & patterns → core code → extensions) against the
   clock with interviewer-style nudges and reveal-on-demand hints,
   then grade yourself against a senior-written rubric and compare
   with the model answer. History persists to localStorage["lld-drill"].
   Offline, no deps, theme-aware, honors prefers-reduced-motion.

   Authoring (the bank ships in drill-bank.js):
     <div class="drill" data-drill>
       <script type="application/json" class="drill-config">
       { "levels": ["warm","core","advanced","expert"] }   // optional filter
       </script>
     </div>
   ============================================================ */
(function () {
  "use strict";
  var STORE = "lld-drill";
  function readStore() {
    try { var o = JSON.parse(localStorage.getItem(STORE)); return (o && o.v === 1) ? o : { v: 1, drills: {} }; }
    catch (e) { return { v: 1, drills: {} }; }
  }
  function writeStore(o) { try { localStorage.setItem(STORE, JSON.stringify(o)); } catch (e) {} }
  function el(t, c, html) { var e = document.createElement(t); if (c) e.className = c; if (html != null) e.innerHTML = html; return e; }
  function onReady(fn) { if (document.readyState !== "loading") fn(); else document.addEventListener("DOMContentLoaded", fn); }
  function fmtTime(s) { s = Math.max(0, Math.round(s)); var m = Math.floor(s / 60), ss = s % 60; return m + ":" + (ss < 10 ? "0" : "") + ss; }

  var LEVELS = [
    { key: "warm",     label: "Warm-up" },
    { key: "core",     label: "Core" },
    { key: "advanced", label: "Advanced" },
    { key: "expert",   label: "Expert" }
  ];

  function lessonFor(id) {
    var L = window.LESSONS || [];
    for (var i = 0; i < L.length; i++) if (L[i].id === id) return L[i];
    return null;
  }

  function init(host) {
    var cfgEl = host.querySelector(".drill-config") || host.querySelector("script[type='application/json']");
    var cfg = {};
    if (cfgEl) { try { cfg = JSON.parse(cfgEl.textContent) || {}; } catch (e) { cfg = {}; } }

    var PHASES = window.LLD_DRILL_PHASES || [];
    var LEVEL_ORDER = { warm: 0, core: 1, advanced: 2, expert: 3 };
    var BANK = (window.LLD_DRILLS || []).filter(function (d) {
      return !cfg.levels || cfg.levels.indexOf(d.level) !== -1;
    }).sort(function (a, b) { return (LEVEL_ORDER[a.level] || 0) - (LEVEL_ORDER[b.level] || 0); });
    if (!PHASES.length || !BANK.length) return;
    var TOTAL = PHASES.reduce(function (a, p) { return a + p.min * 60; }, 0);

    var store = readStore();
    var levelFilter = "all";
    var drill = null, phase = 0, timer = null, runStart = 0, phaseStart = 0, phaseUsed = [], checked = [];
    var timerEl = null, phaseTimerEl = null;

    host.innerHTML = "";
    host.setAttribute("tabindex", "0");

    /* ---------- intro: question picker ---------- */
    function renderIntro() {
      stopTimer(); host.innerHTML = "";
      var head = el("div", "dr-head");
      head.appendChild(el("span", "dr-title", "Machine-coding drills"));
      head.appendChild(el("span", "dr-best", BANK.length + " questions &middot; " + fmtTime(TOTAL) + " each"));
      host.appendChild(head);

      var row = el("div", "dr-row");
      row.appendChild(el("span", "dr-lbl", "Level"));
      [{ key: "all", label: "All" }].concat(LEVELS).forEach(function (lv) {
        if (lv.key !== "all" && !BANK.some(function (d) { return d.level === lv.key; })) return;
        var b = el("button", "dr-chip" + (levelFilter === lv.key ? " active" : ""), lv.label); b.type = "button";
        b.addEventListener("click", function () { levelFilter = lv.key; renderIntro(); });
        row.appendChild(b);
      });
      host.appendChild(row);

      var list = el("div", "drill-list");
      BANK.forEach(function (d) {
        if (levelFilter !== "all" && d.level !== levelFilter) return;
        var rec = store.drills[d.id];
        var card = el("button", "drill-card is-" + d.level); card.type = "button";
        var top = el("div", "dc-top");
        top.appendChild(el("span", "dc-level", d.level));
        if (rec) top.appendChild(el("span", "dc-best", "best <b>" + rec.best + "%</b> · " + rec.runs.length + " run" + (rec.runs.length === 1 ? "" : "s")));
        else top.appendChild(el("span", "dc-best dc-new", "not attempted"));
        card.appendChild(top);
        card.appendChild(el("div", "dc-title", d.title));
        card.appendChild(el("div", "dc-prompt", d.prompt));
        card.addEventListener("click", function () { begin(d); });
        list.appendChild(card);
      });
      host.appendChild(list);
    }

    /* ---------- run: the 45-minute loop ---------- */
    function begin(d) {
      drill = d; phase = 0; phaseUsed = PHASES.map(function () { return 0; });
      checked = (d.rubric || []).map(function () { return false; });
      runStart = Date.now(); phaseStart = runStart;
      startTimer();
      renderPhase();
    }

    function startTimer() {
      stopTimer();
      timer = setInterval(function () {
        var now = Date.now();
        var totalRem = TOTAL - (now - runStart) / 1000;
        var phaseRem = PHASES[phase].min * 60 - (now - phaseStart) / 1000;
        paintTimers(totalRem, phaseRem);
        if (phaseRem <= 0) nextPhase(true);
      }, 250);
    }
    function stopTimer() { if (timer) { clearInterval(timer); timer = null; } }
    function paintTimers(totalRem, phaseRem) {
      if (timerEl) {
        timerEl.textContent = "◷ " + fmtTime(totalRem);
        timerEl.classList.toggle("warn", totalRem <= TOTAL * 0.25 && totalRem > 60);
        timerEl.classList.toggle("danger", totalRem <= 60);
      }
      if (phaseTimerEl) {
        phaseTimerEl.textContent = fmtTime(phaseRem) + " left in phase";
        phaseTimerEl.classList.toggle("danger", phaseRem <= 30);
      }
    }

    function notes(key) { return (drill.phaseNotes && drill.phaseNotes[key]) || {}; }

    function renderPhase() {
      host.innerHTML = "";
      var p = PHASES[phase];

      var head = el("div", "dr-head");
      head.appendChild(el("span", "dr-title", drill.title));
      timerEl = el("span", "dr-timer", "◷ " + fmtTime(TOTAL));
      head.appendChild(timerEl);
      host.appendChild(head);

      /* phase rail: segments sized by minutes */
      var rail = el("div", "drill-rail");
      PHASES.forEach(function (ph, k) {
        var seg = el("div", "drill-seg" + (k < phase ? " done" : k === phase ? " now" : ""));
        seg.style.flexGrow = ph.min;
        seg.appendChild(el("span", "ds-label", ph.label));
        seg.appendChild(el("span", "ds-min", ph.min + "m"));
        rail.appendChild(seg);
      });
      host.appendChild(rail);

      var panel = el("div", "drill-panel");
      if (phase === 0) panel.appendChild(el("p", "drill-prompt", "<b>Interviewer:</b> “" + drill.prompt + "”"));
      panel.appendChild(el("p", "drill-doing", p.doing));

      var n = notes(p.key);
      if (n.prompts && n.prompts.length) {
        var ul = el("ul", "drill-prompts");
        n.prompts.forEach(function (q) { ul.appendChild(el("li", null, q)); });
        panel.appendChild(ul);
      }
      (n.hints || []).forEach(function (hText) {
        var det = el("details", "drill-hint");
        det.appendChild(el("summary", null, "Reveal a hint"));
        det.appendChild(el("p", null, hText));
        panel.appendChild(det);
      });
      host.appendChild(panel);

      var actions = el("div", "dr-actions drill-actions");
      phaseTimerEl = el("span", "drill-ptime", "");
      actions.appendChild(phaseTimerEl);
      var quit = el("button", "dr-btn", "✕ Abandon"); quit.type = "button";
      quit.addEventListener("click", function () { if (confirm("Abandon this run?")) renderIntro(); });
      var next = el("button", "dr-btn primary", phase === PHASES.length - 1 ? "Finish → grade yourself ▸" : "Next phase ▸"); next.type = "button";
      next.addEventListener("click", function () { nextPhase(false); });
      actions.appendChild(quit); actions.appendChild(next);
      host.appendChild(actions);

      paintTimers(TOTAL - (Date.now() - runStart) / 1000, PHASES[phase].min * 60 - (Date.now() - phaseStart) / 1000);
    }

    function nextPhase(timedOut) {
      phaseUsed[phase] = (Date.now() - phaseStart) / 1000;
      if (phase < PHASES.length - 1) {
        phase++; phaseStart = Date.now();
        renderPhase();
      } else {
        stopTimer();
        renderGrade(timedOut);
      }
    }

    /* ---------- self-grade ---------- */
    function renderGrade(timedOut) {
      host.innerHTML = "";
      var head = el("div", "dr-head");
      head.appendChild(el("span", "dr-title", "Grade yourself — " + drill.title));
      host.appendChild(head);
      var intro = el("p", "drill-doing", (timedOut ? "Time's up. " : "") + "Be honest — tick only what you actually wrote or said out loud. The rubric is what a senior interviewer checks for in a machine-coding round.");
      host.appendChild(intro);

      var byPhase = el("div", "drill-rubric");
      PHASES.forEach(function (p) {
        var items = [];
        (drill.rubric || []).forEach(function (rb, k) { if (rb.phase === p.key) items.push(k); });
        if (!items.length) return;
        byPhase.appendChild(el("div", "drill-rb-phase", p.label));
        items.forEach(function (k) {
          var lab = el("label", "drill-rb-item");
          var cb = document.createElement("input"); cb.type = "checkbox"; cb.checked = checked[k];
          cb.addEventListener("change", function () { checked[k] = cb.checked; });
          lab.appendChild(cb);
          lab.appendChild(el("span", null, drill.rubric[k].text));
          byPhase.appendChild(lab);
        });
      });
      host.appendChild(byPhase);

      var actions = el("div", "dr-actions-end");
      var done = el("button", "dr-btn primary", "See results ▸"); done.type = "button";
      done.addEventListener("click", renderResult);
      actions.appendChild(done);
      host.appendChild(actions);
    }

    /* ---------- result ---------- */
    function verdict(p) {
      return p >= 85 ? "Hire signal — clean entities, named patterns, working core code." : p >= 65 ? "Strong, with gaps — reread the unticked lines before your next run."
        : p >= 40 ? "The skeleton is there; the core-code phase needs real reps." : "Study the lesson, code it once for real, then rerun this drill cold.";
    }
    function renderResult() {
      var total = (drill.rubric || []).length;
      var score = checked.filter(Boolean).length;
      var pct = total ? Math.round(score / total * 100) : 0;

      var rec = store.drills[drill.id] || { best: 0, runs: [] };
      rec.runs.push({ ts: Date.now(), score: pct, timeUsed: Math.round(phaseUsed.reduce(function (a, b) { return a + b; }, 0)) });
      if (rec.runs.length > 20) rec.runs = rec.runs.slice(-20);
      rec.best = Math.max(rec.best, pct);
      store.drills[drill.id] = rec; writeStore(store);

      host.innerHTML = "";
      var head = el("div", "dr-head");
      head.appendChild(el("span", "dr-title", "Results — " + drill.title));
      host.appendChild(head);

      var res = el("div", "dr-result");
      var sc = el("div", "dr-score");
      sc.appendChild(el("div", "dr-pct", pct + "%"));
      sc.appendChild(el("div", "dr-verdict", verdict(pct) + " &middot; " + score + "/" + total + " rubric lines &middot; best " + rec.best + "%"));
      res.appendChild(sc);

      /* time spent vs budget per phase */
      var tbl = el("div", "drill-times");
      tbl.appendChild(el("div", "dt-row dt-head", "<span>Phase</span><span>You</span><span>Budget</span>"));
      PHASES.forEach(function (p, k) {
        var used = phaseUsed[k] || 0, over = used > p.min * 60 * 1.15;
        tbl.appendChild(el("div", "dt-row" + (over ? " over" : ""),
          "<span>" + p.label + "</span><span>" + fmtTime(used) + "</span><span>" + p.min + ":00</span>"));
      });
      res.appendChild(tbl);

      if (drill.model) {
        var det = el("details", "drill-model");
        det.appendChild(el("summary", null, "Show the model answer"));
        var body = el("div", "drill-model-body"); body.innerHTML = drill.model;
        det.appendChild(body);
        res.appendChild(det);
      }

      var les = lessonFor(drill.lesson);
      if (les) {
        var base = window.SITE_BASE || "./";
        res.appendChild(el("p", "drill-study", "Study this: <a href=\"" + base + les.url + "\">" + les.title + " →</a>"));
      }

      var ae = el("div", "dr-actions-end");
      var again = el("button", "dr-btn primary", "↻ Run it again"); again.type = "button";
      again.addEventListener("click", function () { begin(drill); });
      var back = el("button", "dr-btn", "‹ All questions"); back.type = "button";
      back.addEventListener("click", renderIntro);
      ae.appendChild(again); ae.appendChild(back);
      res.appendChild(ae);
      host.appendChild(res);
    }

    renderIntro();
  }

  onReady(function () { document.querySelectorAll(".drill").forEach(init); });
})();
