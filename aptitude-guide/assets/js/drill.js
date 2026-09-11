/* ============================================================
   Aptitude & Reasoning Field Guide — timed drill engine (.drill)
   Builds an MCQ practice player from an inline .drill-config JSON.
   Pulls questions from window.APTI_QUESTIONS (filtered by section/
   topic) or from cfg.questions. Flow: intro → question card (live
   countdown) → score + per-question review. Best score per drill
   persists to localStorage["apti-drill"]. Offline, no deps,
   theme-aware, honors prefers-reduced-motion. With JS off the
   author's fallback markup stays visible (we only take over on init).

   .drill-config fields (all optional except a source of questions):
     title       label shown on the card
     blurb        one-line intro description
     sections    ["quant", ...]  filter the global bank by section key
     topics      ["qa-percent", ...] filter by topic id (= lesson id)
     diffs       ["stretch", ...] filter by difficulty (warm|core|stretch)
     count        questions per run (default 5)
     counts       [10,20,30] → show selectable count chips
     timerSec     total seconds (fixed)        | secPerQ → timer = count×secPerQ
     chips        [{label, sections?, topics?, diffs?}] → topic filter chips (center mode)
     shuffle      default true
     questions    inline [{q, options, answer, explain, topic?}] (self-contained)
   ============================================================ */
(function () {
  "use strict";
  var STORE = "apti-drill";
  function readStore() { try { return JSON.parse(localStorage.getItem(STORE)) || {}; } catch (e) { return {}; } }
  function writeStore(o) { try { localStorage.setItem(STORE, JSON.stringify(o)); } catch (e) {} }
  function el(t, c, html) { var e = document.createElement(t); if (c) e.className = c; if (html != null) e.innerHTML = html; return e; }
  function onReady(fn) { if (document.readyState !== "loading") fn(); else document.addEventListener("DOMContentLoaded", fn); }
  function shuffle(a) { for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)), t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
  function fmtTime(s) { s = Math.max(0, Math.round(s)); var m = Math.floor(s / 60), ss = s % 60; return m + ":" + (ss < 10 ? "0" : "") + ss; }
  var LETTERS = ["A", "B", "C", "D", "E", "F"];

  function init(host) {
    var cfgEl = host.querySelector(".drill-config") || host.querySelector("script[type='application/json']");
    if (!cfgEl) return;
    var cfg; try { cfg = JSON.parse(cfgEl.textContent); } catch (e) { return; } // leave fallback in place

    var drillKey = cfg.id || cfg.title || ((cfg.sections || []).join("+") + "|" + (cfg.topics || []).join("+"));
    var store = readStore();
    var filter = {
      sections: (cfg.sections || []).slice(),
      topics: (cfg.topics || []).slice(),
      diffs: (cfg.diffs || []).slice()
    };
    var chosenCount = cfg.count || 5;
    var shuffleOn = cfg.shuffle !== false;

    function pool() {
      if (cfg.questions && cfg.questions.length) return cfg.questions.slice();
      return (window.APTI_QUESTIONS || []).filter(function (q) {
        var okS = !filter.sections.length || filter.sections.indexOf(q.section) !== -1;
        var okT = !filter.topics.length || filter.topics.indexOf(q.topic) !== -1;
        var okD = !filter.diffs.length || filter.diffs.indexOf(q.diff) !== -1;
        return okS && okT && okD;
      });
    }
    function timerFor(n) { return cfg.secPerQ ? n * cfg.secPerQ : (cfg.timerSec || 0); }
    function topicName(t) { return (cfg.topicNames && cfg.topicNames[t]) || (window.APTI_TOPIC_NAMES && window.APTI_TOPIC_NAMES[t]) || (t || "").toString(); }
    function stripTags(h) { var d = document.createElement("div"); d.innerHTML = h || ""; var s = (d.textContent || "").replace(/\s+/g, " ").trim(); return s.length > 92 ? s.slice(0, 92) + "…" : s; }

    host.innerHTML = "";
    host.setAttribute("tabindex", "0");

    var qs = [], idx = 0, answers = [], timer = null, startMs = 0, total = 0, timed = 0, timerEl = null;

    /* ---------- intro ---------- */
    function sameFilter(ch) {
      return (ch.sections || []).join(",") === filter.sections.join(",") &&
             (ch.topics || []).join(",") === filter.topics.join(",") &&
             (ch.diffs || []).join(",") === filter.diffs.join(",");
    }
    function renderIntro() {
      stopTimer(); host.innerHTML = "";
      var head = el("div", "dr-head");
      head.appendChild(el("span", "dr-title", cfg.title || "Practice drill"));
      var rec = store[drillKey];
      if (rec) head.appendChild(el("span", "dr-best", "Best: <b>" + rec.best + "%</b> &middot; " + rec.score + "/" + rec.total));
      host.appendChild(head);

      var intro = el("div", "dr-intro");
      var avail = pool().length;
      intro.appendChild(el("p", null, cfg.blurb || ("Answer under the clock, then read the worked explanations. " + avail + " questions in this pool.")));

      if (cfg.chips && cfg.chips.length) {
        var row = el("div", "dr-row"); row.appendChild(el("span", "dr-lbl", "Topic"));
        cfg.chips.forEach(function (ch) {
          var b = el("button", "dr-chip" + (sameFilter(ch) ? " active" : ""), ch.label); b.type = "button";
          b.addEventListener("click", function () {
            filter = { sections: ch.sections || [], topics: ch.topics || [], diffs: ch.diffs || [] };
            renderIntro();
          });
          row.appendChild(b);
        });
        intro.appendChild(row);
      }
      if (cfg.counts && cfg.counts.length) {
        var row2 = el("div", "dr-row"); row2.appendChild(el("span", "dr-lbl", "Questions"));
        cfg.counts.forEach(function (n) {
          var b = el("button", "dr-chip" + (n === chosenCount ? " active" : ""), String(n)); b.type = "button";
          b.addEventListener("click", function () { chosenCount = n; renderIntro(); });
          row2.appendChild(b);
        });
        intro.appendChild(row2);
      }
      var n = Math.min(chosenCount, avail || chosenCount), t = timerFor(n);
      intro.appendChild(el("p", null, "<span class='dr-lbl'>This run</span> " + n + " question" + (n === 1 ? "" : "s") + (t ? (" &middot; " + fmtTime(t) + " on the clock") : " &middot; untimed")));

      var start = el("button", "dr-start", avail ? "Start drill ▸" : "No questions yet"); start.type = "button";
      if (!avail) start.disabled = true;
      start.addEventListener("click", begin);
      intro.appendChild(start);
      host.appendChild(intro);
    }

    /* ---------- run ---------- */
    function begin() {
      var p = pool(); if (shuffleOn) shuffle(p);
      total = Math.min(chosenCount, p.length);
      qs = p.slice(0, total).map(function (q) {           // shuffle option ORDER too (bank stores answer first)
        var order = q.options.map(function (_, i) { return i; });
        if (shuffleOn) shuffle(order);
        return { q: q.q, topic: q.topic, explain: q.explain,
          options: order.map(function (i) { return q.options[i]; }),
          answer: order.indexOf(q.answer) };
      });
      answers = []; idx = 0;
      startMs = Date.now(); timed = timerFor(total);
      if (timed > 0) startTimer();
      renderQ();
    }
    function startTimer() {
      stopTimer();
      timer = setInterval(function () {
        var rem = timed - (Date.now() - startMs) / 1000;
        paintTimer(rem);
        if (rem <= 0) { stopTimer(); finish(true); }
      }, 250);
    }
    function stopTimer() { if (timer) { clearInterval(timer); timer = null; } }
    function paintTimer(rem) {
      if (!timerEl) return;
      timerEl.textContent = "◷ " + fmtTime(rem);
      timerEl.classList.toggle("warn", rem <= timed * 0.25 && rem > 10);
      timerEl.classList.toggle("danger", rem <= 10);
    }

    function renderQ() {
      host.innerHTML = "";
      var q = qs[idx];
      var head = el("div", "dr-head"); head.appendChild(el("span", "dr-title", cfg.title || "Practice drill")); host.appendChild(head);

      var quiz = el("div", "dr-quiz");
      var bar = el("div", "dr-bar"); var fill = el("div", "dr-bar-fill"); fill.style.width = (idx / total * 100) + "%"; bar.appendChild(fill); quiz.appendChild(bar);

      var meta = el("div", "dr-meta");
      meta.appendChild(el("span", "dr-count", "Q " + (idx + 1) + " / " + total));
      timerEl = null;
      if (timed > 0) { timerEl = el("span", "dr-timer", "◷ " + fmtTime(timed - (Date.now() - startMs) / 1000)); meta.appendChild(timerEl); }
      else if (q.topic) meta.appendChild(el("span", "dr-count", topicName(q.topic)));
      quiz.appendChild(meta);

      var stem = el("div", "dr-q");
      if (q.topic && timed > 0) stem.appendChild(el("span", "dr-qtag", topicName(q.topic)));
      stem.appendChild(el("div", null, q.q));
      quiz.appendChild(stem);

      var opts = el("div", "dr-opts");
      q.options.forEach(function (o, oi) {
        var b = el("button", "dr-opt"); b.type = "button";
        b.appendChild(el("span", "dr-key", LETTERS[oi]));
        b.appendChild(el("span", "dr-otext", o));
        b.addEventListener("click", function () { choose(oi); });
        opts.appendChild(b);
      });
      quiz.appendChild(opts);
      quiz.appendChild(el("div", "dr-explain"));

      var actions = el("div", "dr-actions");
      var next = el("button", "dr-btn primary", idx === total - 1 ? "See results ▸" : "Next ▸"); next.type = "button";
      next.style.display = "none"; next.addEventListener("click", advance);
      actions.appendChild(next); quiz.appendChild(actions);
      host.appendChild(quiz);
      paintTimer(timed - (Date.now() - startMs) / 1000);
    }

    function choose(oi) {
      var q = qs[idx];
      if (answers[idx] != null) return;
      answers[idx] = oi;
      [].forEach.call(host.querySelectorAll(".dr-opt"), function (b, bi) {
        b.disabled = true;
        if (bi === q.answer) b.classList.add("correct");
        if (bi === oi && oi !== q.answer) b.classList.add("wrong");
      });
      var ex = host.querySelector(".dr-explain");
      if (ex) { ex.innerHTML = "<b>" + (oi === q.answer ? "Correct." : "Answer: " + LETTERS[q.answer] + ".") + "</b> " + (q.explain || ""); ex.classList.add("show"); }
      var nx = host.querySelector(".dr-actions .dr-btn"); if (nx) nx.style.display = "";
      var fill = host.querySelector(".dr-bar-fill"); if (fill) fill.style.width = ((idx + 1) / total * 100) + "%";
    }
    function advance() { if (idx < total - 1) { idx++; renderQ(); } else finish(false); }

    /* ---------- result ---------- */
    function stat(b, s) { var d = el("div", "dr-stat"); d.appendChild(el("b", null, b)); d.appendChild(el("span", null, s)); return d; }
    function verdict(p) {
      return p >= 90 ? "Excellent — exam-ready pace." : p >= 70 ? "Solid. Tighten the misses below."
        : p >= 50 ? "Getting there — study the explanations." : "Early days — read the worked answers, then retry.";
    }
    function finish(timedOut) {
      stopTimer();
      var score = 0; qs.forEach(function (q, i) { if (answers[i] === q.answer) score++; });
      var pct = total ? Math.round(score / total * 100) : 0;
      var used = Math.min((Date.now() - startMs) / 1000, timed || 9e9);
      var rec = store[drillKey];
      if (!rec || pct > rec.best) { store[drillKey] = { best: pct, score: score, total: total, ts: Date.now() }; writeStore(store); }

      host.innerHTML = "";
      host.appendChild((function () { var h = el("div", "dr-head"); h.appendChild(el("span", "dr-title", "Results")); return h; })());
      var res = el("div", "dr-result");
      var sc = el("div", "dr-score");
      sc.appendChild(el("div", "dr-pct", pct + "%"));
      sc.appendChild(el("div", "dr-verdict", verdict(pct) + (timedOut ? " &middot; time's up — blanks marked wrong" : "")));
      res.appendChild(sc);

      var sum = el("div", "dr-summary");
      sum.appendChild(stat(score + "/" + total, "correct"));
      sum.appendChild(stat(fmtTime(used), "time"));
      sum.appendChild(stat((total ? Math.round(used / total) : 0) + "s", "per Q"));
      res.appendChild(sum);

      var rev = el("div", "dr-review");
      qs.forEach(function (q, i) {
        var ok = answers[i] === q.answer;
        var d = el("details", "dr-rev " + (ok ? "ok" : "no"));
        var sm = el("summary");
        sm.appendChild(el("span", "dr-ic", ok ? "✓" : "✕"));
        sm.appendChild(el("span", "dr-rev-q", "Q" + (i + 1) + ". " + stripTags(q.q)));
        d.appendChild(sm);
        var yours = answers[i] == null ? "—" : LETTERS[answers[i]];
        d.appendChild(el("div", "dr-rev-body", "<b>You:</b> " + yours + " &nbsp;&middot;&nbsp; <b>Correct:</b> " + LETTERS[q.answer] + " (" + q.options[q.answer] + ")<br>" + (q.explain || "")));
        rev.appendChild(d);
      });
      res.appendChild(rev);

      var ae = el("div", "dr-actions-end");
      var again = el("button", "dr-btn primary", "↻ Try again"); again.type = "button"; again.addEventListener("click", begin);
      var back = el("button", "dr-btn", "‹ Change set"); back.type = "button"; back.addEventListener("click", renderIntro);
      ae.appendChild(again); ae.appendChild(back); res.appendChild(ae);
      host.appendChild(res);
    }

    /* ---------- keyboard ---------- */
    host.addEventListener("keydown", function (e) {
      if (!host.querySelector(".dr-quiz")) return;
      if (/^[1-6]$/.test(e.key)) { var b = host.querySelectorAll(".dr-opt")[+e.key - 1]; if (b && !b.disabled) { b.click(); e.preventDefault(); } }
      else if (e.key === "Enter" || e.key === "ArrowRight") { var nx = host.querySelector(".dr-actions .dr-btn"); if (nx && nx.style.display !== "none") { advance(); e.preventDefault(); } }
    });

    renderIntro();
  }

  onReady(function () { document.querySelectorAll(".drill").forEach(init); });
})();
