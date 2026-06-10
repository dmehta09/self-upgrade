/* ============================================================
   The Design Field Guide — concurrency visualizer (.conviz)
   Shows two (or more) threads interleaving over shared state.
   The whole execution is SIMULATED up front from a deterministic
   schedule, then the reader scrubs through it micro-op by micro-op
   and watches a read–modify–write race corrupt the result — then
   replays the *same* interleaving with a lock and sees it heal.
   Pure DOM (no SVG), offline, theme-aware, honors reduced motion.

   Authoring:
     <figure class="conviz" data-conviz>
       <figcaption class="cv-title">Two threads, one counter</figcaption>
       <script type="application/json" class="cv-config">
       {
         "shared": [ { "id":"sold", "label":"tickets_sold", "init":0 } ],
         "threads": [
           { "id":"a", "label":"Thread A", "ops":[
             { "op":"lock" },
             { "op":"read",  "var":"sold", "into":"tmp", "text":"tmp = tickets_sold" },
             { "op":"calc",  "reg":"tmp", "add":1,       "text":"tmp = tmp + 1" },
             { "op":"write", "var":"sold", "from":"tmp", "text":"tickets_sold = tmp" },
             { "op":"unlock" } ] },
           { "id":"b", "label":"Thread B", "ops":"same" }
         ],
         "schedules": [
           { "id":"racy",   "label":"Unlucky interleaving · no lock", "lock":false,
             "order":["a","b","a","b","a","b"], "expect":2 },
           { "id":"locked", "label":"Same interleaving · with Lock",  "lock":true,
             "order":["a","b","a","b","a","b"], "expect":2 }
         ],
         "verdictVar": "sold"
       }
       </script>
     </figure>

   A thread with "ops":"same" copies the previous thread's ops.
   Semantics: read → reg[into] = shared[var] · calc → reg += add ·
   write → shared[var] = reg[from] · lock/unlock — with lock:false
   they're skipped (struck through); with lock:true a thread whose
   scheduled op can't acquire shows "blocked" and the slot is burned
   (that's the cost of safety). order lists which thread runs next;
   if it runs out before threads finish, round-robin completes them.
   ============================================================ */
(function () {
  "use strict";
  var REDUCED = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function el(t, c, html) { var e = document.createElement(t); if (c) e.className = c; if (html != null) e.innerHTML = html; return e; }
  function clone(o) { return JSON.parse(JSON.stringify(o)); }

  function opText(op) {
    if (op.text) return op.text;
    if (op.op === "lock") return "lock.acquire()";
    if (op.op === "unlock") return "lock.release()";
    return op.op;
  }

  /* ---- deterministic simulator: returns a list of trace frames ---- */
  function simulate(cfg, sched) {
    var shared = {}, regs = {}, pc = {}, threads = cfg.threads;
    (cfg.shared || []).forEach(function (v) { shared[v.id] = v.init || 0; });
    threads.forEach(function (t) { regs[t.id] = {}; pc[t.id] = 0; });
    var lockOwner = null, seq = 0;
    var frames = [{ shared: clone(shared), regs: clone(regs), hot: null, blocked: null, lockOwner: null, seqs: {}, note: "Initial state. Scrub → to run the schedule." }];
    var seqs = {};

    function effectiveOps(t) {
      return t.ops.filter(function (o) {
        return sched.lock || (o.op !== "lock" && o.op !== "unlock");
      });
    }
    function done(t) { return pc[t.id] >= effectiveOps(t).length; }
    function allDone() { return threads.every(done); }

    var order = (sched.order || []).slice();
    var guard = 0, oi = 0;
    while (!allDone() && guard++ < 400) {
      var tid;
      if (oi < order.length) tid = order[oi++];
      else {                                     /* schedule exhausted: finish with runnable threads */
        tid = null;
        for (var r = 0; r < threads.length; r++) {
          var tr = threads[r];
          if (done(tr)) continue;
          var nop = effectiveOps(tr)[pc[tr.id]];
          var wouldBlock = nop && nop.op === "lock" && lockOwner !== null && lockOwner !== tr.id;
          if (!wouldBlock) { tid = tr.id; break; }
          if (tid === null) tid = tr.id;          // fall back to the blocked one if no one can run
        }
      }
      var t = threads.filter(function (x) { return x.id === tid; })[0];
      if (!t || done(t)) continue;
      var ops = effectiveOps(t);
      var op = ops[pc[t.id]];
      var realIdx = t.ops.indexOf(op);
      var note, blocked = null;

      if (op.op === "lock") {
        if (lockOwner === null) {
          lockOwner = t.id; pc[t.id]++;
          seqs[t.id + ":" + realIdx] = ++seq;
          note = t.label + " acquires the lock.";
        } else {
          blocked = t.id;
          note = t.label + " wants the lock — held by " + (threads.filter(function (x) { return x.id === lockOwner; })[0] || {}).label + ". Blocked; the slot is lost.";
        }
      } else if (op.op === "unlock") {
        lockOwner = null; pc[t.id]++;
        seqs[t.id + ":" + realIdx] = ++seq;
        note = t.label + " releases the lock.";
      } else if (op.op === "read") {
        regs[t.id][op.into] = shared[op.var]; pc[t.id]++;
        seqs[t.id + ":" + realIdx] = ++seq;
        note = t.label + ": " + opText(op) + "  →  " + op.into + " = " + regs[t.id][op.into];
      } else if (op.op === "calc") {
        regs[t.id][op.reg] = (regs[t.id][op.reg] || 0) + (op.add || 0); pc[t.id]++;
        seqs[t.id + ":" + realIdx] = ++seq;
        note = t.label + ": " + opText(op) + "  →  " + op.reg + " = " + regs[t.id][op.reg];
      } else if (op.op === "write") {
        shared[op.var] = regs[t.id][op.from]; pc[t.id]++;
        seqs[t.id + ":" + realIdx] = ++seq;
        note = t.label + ": " + opText(op) + "  →  " + op.var.replace(/_/g, " ") + " = " + shared[op.var];
      } else { pc[t.id]++; note = ""; }

      frames.push({
        shared: clone(shared), regs: clone(regs),
        hot: { t: t.id, i: realIdx }, blocked: blocked,
        lockOwner: lockOwner, seqs: clone(seqs), note: note
      });
    }
    return frames;
  }

  function Engine(fig) {
    var confEl = fig.querySelector(".cv-config");
    if (!confEl) return;
    var cfg; try { cfg = JSON.parse(confEl.textContent); } catch (e) { return; }
    var threads = cfg.threads || [], scheds = cfg.schedules || [];
    if (threads.length < 2 || !scheds.length || !(cfg.shared || []).length) return;
    /* "ops":"same" copies the previous thread's program */
    threads.forEach(function (t, k) { if (t.ops === "same" && k > 0) t.ops = clone(threads[k - 1].ops); });

    /* ---- chrome ---- */
    var chips = el("div", "cv-chips");
    var grid = el("div", "cv-grid");
    var note = el("div", "cv-note"); note.setAttribute("aria-live", "polite");
    var verdict = el("div", "cv-verdict");
    var bar = el("div", "cv-bar");
    fig.appendChild(chips); fig.appendChild(grid); fig.appendChild(note); fig.appendChild(verdict); fig.appendChild(bar);

    var prev = el("button", "cv-btn", "‹"); prev.type = "button"; prev.setAttribute("aria-label", "Previous step");
    var play = el("button", "cv-btn cv-play", "▶"); play.type = "button"; play.setAttribute("aria-label", "Play");
    var next = el("button", "cv-btn", "›"); next.type = "button"; next.setAttribute("aria-label", "Next step");
    var range = document.createElement("input");
    range.type = "range"; range.className = "cv-range"; range.min = 0; range.value = 0;
    range.setAttribute("aria-label", "Scrub through the interleaving");
    var stepLbl = el("span", "cv-step", "");
    bar.appendChild(prev); bar.appendChild(play); bar.appendChild(next); bar.appendChild(range); bar.appendChild(stepLbl);

    /* thread columns + shared-state panel built once; repainted per frame */
    var opEls = {};   // "tid:idx" -> {row, badge}
    var colFor = {};
    function buildGrid(useLock) {
      grid.innerHTML = ""; opEls = {};
      var colA = el("div", "cv-col");
      var mid = el("div", "cv-mid");
      var colB = el("div", "cv-col");
      threads.forEach(function (t, k) {
        var col = k === 0 ? colA : colB;
        col.appendChild(el("div", "cv-thead", t.label));
        t.ops.forEach(function (op, i) {
          var skip = !useLock && (op.op === "lock" || op.op === "unlock");
          var row = el("div", "cv-op" + (skip ? " skip" : ""));
          var badge = el("span", "cv-seq", "");
          row.appendChild(badge);
          row.appendChild(el("span", "cv-optext", opText(op)));
          col.appendChild(row);
          opEls[t.id + ":" + i] = { row: row, badge: badge };
        });
        colFor[t.id] = col;
      });
      var shbox = el("div", "cv-shared");
      shbox.appendChild(el("div", "cv-shead", "shared state"));
      (cfg.shared || []).forEach(function (v) {
        var d = el("div", "cv-var");
        d.appendChild(el("span", "cv-vlabel", v.label || v.id));
        var val = el("span", "cv-vval", String(v.init || 0));
        val.setAttribute("data-var", v.id);
        d.appendChild(val);
        shbox.appendChild(d);
      });
      var lockRow = el("div", "cv-lock");
      lockRow.innerHTML = "🔒 <span class='cv-lockwho'>—</span>";
      if (useLock) shbox.appendChild(lockRow);
      var regbox = el("div", "cv-regs");
      threads.forEach(function (t) {
        var d = el("div", "cv-reg");
        d.appendChild(el("span", "cv-vlabel", t.label + " · local"));
        var val = el("span", "cv-vval cv-regval", "–");
        val.setAttribute("data-thread", t.id);
        d.appendChild(val);
        regbox.appendChild(d);
      });
      mid.appendChild(shbox); mid.appendChild(regbox);
      grid.appendChild(colA); grid.appendChild(mid); grid.appendChild(colB);
    }

    /* ---- schedules ---- */
    var frames = [], fi = 0, timer = null, cur = 0;
    var chipBtns = [];
    scheds.forEach(function (sc, k) {
      var b = el("button", "cv-chip", sc.label || sc.id);
      b.type = "button";
      b.addEventListener("click", function () { select(k); });
      chips.appendChild(b); chipBtns.push(b);
    });

    function select(k) {
      stop();
      cur = k;
      chipBtns.forEach(function (b, i) { b.classList.toggle("active", i === k); });
      buildGrid(scheds[k].lock);
      frames = simulate(cfg, scheds[k]);
      fi = 0;
      range.max = frames.length - 1; range.value = 0;
      render();
    }

    function render() {
      var f = frames[fi];
      if (!f) return;
      /* values */
      [].forEach.call(grid.querySelectorAll(".cv-vval[data-var]"), function (e2) {
        var id = e2.getAttribute("data-var");
        var nv = String(f.shared[id]);
        if (e2.textContent !== nv) { e2.textContent = nv; if (!REDUCED) { e2.classList.remove("tick"); void e2.offsetWidth; e2.classList.add("tick"); } }
      });
      [].forEach.call(grid.querySelectorAll(".cv-regval"), function (e2) {
        var tid = e2.getAttribute("data-thread"), rg = f.regs[tid] || {};
        var parts = [];
        for (var k in rg) parts.push(k + " = " + rg[k]);
        e2.textContent = parts.length ? parts.join(" · ") : "–";
      });
      var who = grid.querySelector(".cv-lockwho");
      if (who) {
        var owner = threads.filter(function (t) { return t.id === f.lockOwner; })[0];
        who.textContent = owner ? "held by " + owner.label : "free";
      }
      /* op chips */
      for (var key in opEls) {
        var oe = opEls[key];
        var isHot = !!f.hot && (f.hot.t + ":" + f.hot.i) === key;
        oe.row.classList.toggle("hot", isHot);
        oe.row.classList.toggle("blocked", isHot && !!f.blocked);
        var sq = f.seqs[key];
        oe.badge.textContent = sq ? sq : "";
        oe.row.classList.toggle("done2", !!sq);
      }
      note.textContent = f.note || "";
      stepLbl.textContent = fi + " / " + (frames.length - 1);
      range.value = fi;
      /* verdict only at the end */
      if (fi === frames.length - 1) {
        var sc = scheds[cur], v = cfg.verdictVar || (cfg.shared[0] && cfg.shared[0].id);
        var got = f.shared[v], want = sc.expect;
        if (want != null) {
          var ok = got === want;
          verdict.className = "cv-verdict show " + (ok ? "ok" : "bad");
          verdict.innerHTML = ok
            ? "✓ final " + vLabel(v) + " = <b>" + got + "</b> — correct. Same interleaving, but the lock made read→modify→write atomic."
            : "✕ expected " + vLabel(v) + " = " + want + ", got <b>" + got + "</b> — a lost update. One thread's write overwrote the other's.";
        }
      } else verdict.className = "cv-verdict";
    }
    function vLabel(id) {
      var v = (cfg.shared || []).filter(function (x) { return x.id === id; })[0];
      return (v && v.label) || id;
    }
    function go(n) { fi = Math.max(0, Math.min(frames.length - 1, n)); render(); }
    function stop() { if (timer) { clearInterval(timer); timer = null; } play.textContent = "▶"; play.setAttribute("aria-label", "Play"); }
    function start() {
      if (fi >= frames.length - 1) fi = 0;
      play.textContent = "⏸"; play.setAttribute("aria-label", "Pause");
      timer = setInterval(function () {
        if (fi >= frames.length - 1) { stop(); return; }
        go(fi + 1);
      }, 1000);
    }

    prev.addEventListener("click", function () { stop(); go(fi - 1); });
    next.addEventListener("click", function () { stop(); go(fi + 1); });
    play.addEventListener("click", function () { timer ? stop() : start(); });
    range.addEventListener("input", function () { stop(); go(parseInt(range.value, 10) || 0); });
    if (REDUCED) play.style.display = "none";

    fig.setAttribute("tabindex", "0");
    fig.addEventListener("keydown", function (e) {
      if (e.target !== fig) return;
      if (e.key === "ArrowRight") { stop(); go(fi + 1); e.preventDefault(); }
      else if (e.key === "ArrowLeft") { stop(); go(fi - 1); e.preventDefault(); }
      else if (e.key === " " || e.key === "Spacebar") { timer ? stop() : start(); e.preventDefault(); }
      else if (e.key === "Home") { stop(); go(0); }
      else if (e.key === "End") { stop(); go(frames.length - 1); }
    });

    select(0);
  }

  function onReady(fn) { if (document.readyState !== "loading") fn(); else document.addEventListener("DOMContentLoaded", fn); }
  onReady(function () { document.querySelectorAll(".conviz").forEach(Engine); });
})();
