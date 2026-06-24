/* ============================================================
   Go — a visual guide · GOROUTINELAB
   Visualises the G-M-P scheduler: logical processors (P) each
   bound to an OS thread (M) running one goroutine (G), with a
   per-P local run queue, a shared global run queue, work-stealing
   between Ps, and the syscall handoff (M detaches, P picks a new M).
   Makes "thousands of Gs over a handful of Ms" concrete.

   Frame-stepper contract: ←/→ step · Space play/pause · Home/End.
   Each frame fully specifies state (no deltas) so configs stay
   obvious. Offline, theme-aware, reduced-motion aware.

   Authoring:
     <figure class="goroutinelab reveal" data-goroutinelab aria-label="…">
       <script type="application/json" class="gl-config">
       { "frames": [
         { "caption": "Two Ps, each running a G; g3 waits in P0's local queue.",
           "global": ["g5","g6"],
           "ps": [
             { "id":"P0", "m":"M0", "run":"g1", "local":["g3"] },
             { "id":"P1", "m":"M1", "run":"g2", "local":[] }
           ] },
         { "caption": "P1's queue is empty → it STEALS g3 from P0 (work-stealing).",
           "global": ["g5","g6"],
           "ps": [
             { "id":"P0", "m":"M0", "run":"g1", "local":[] },
             { "id":"P1", "m":"M1", "run":"g2", "local":["g3"] }
           ],
           "steal": { "from":"P0", "to":"P1", "g":"g3" } }
       ] }
       </script>
     </figure>
   Per P: run = the G currently executing (omit/null = idle P),
   local = ids in its run queue, m = the OS thread bound to it
   (state "syscall" detaches it). Top-level: global = the global
   run queue, steal = annotate a work-steal, blocked = ids parked
   off-CPU (waiting on a channel/lock/timer). ============================================================ */
(function () {
  "use strict";
  var REDUCED = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  function el(tag, cls, txt) { var e = document.createElement(tag); if (cls) e.className = cls; if (txt != null) e.textContent = txt; return e; }
  function gchip(id, extra) { var c = el("span", "gl-g" + (extra ? " " + extra : ""), id); return c; }

  function build(fig) {
    var confEl = fig.querySelector(".gl-config");
    if (!confEl) return;
    var cfg; try { cfg = JSON.parse(confEl.textContent); } catch (e) { return; }
    var frames = cfg.frames || [];
    if (!frames.length) return;

    var stage = el("div", "gl-stage");
    var cap = el("div", "viz-cap");
    var controls = el("div", "viz-controls");
    var resetB = el("button", "viz-reset", "⏮"), prevB = el("button", "viz-prev", "‹"),
        playB = el("button", "viz-play", "▶ Play"), nextB = el("button", "viz-next", "›"),
        stepEl = el("span", "viz-step", "");
    [resetB, prevB, playB, nextB].forEach(function (b) { b.type = "button"; });
    controls.appendChild(resetB); controls.appendChild(prevB); controls.appendChild(playB); controls.appendChild(nextB); controls.appendChild(stepEl);
    fig.appendChild(stage); fig.appendChild(cap); fig.appendChild(controls);

    function render(n) {
      var f = frames[n];
      stage.innerHTML = "";

      /* global run queue */
      var grq = el("div", "gl-grq");
      grq.appendChild(el("div", "gl-qlabel", "Global run queue"));
      var grow = el("div", "gl-qrow");
      var gl = f.global || [];
      if (!gl.length) grow.appendChild(el("span", "gl-empty", "empty"));
      else gl.forEach(function (id) { grow.appendChild(gchip(id)); });
      grq.appendChild(grow);
      stage.appendChild(grq);

      /* P lanes */
      var lanes = el("div", "gl-ps");
      (f.ps || []).forEach(function (p) {
        var card = el("div", "gl-p" + (p.run ? "" : " idle"));
        var hd = el("div", "gl-phead");
        hd.appendChild(el("span", "gl-pid", p.id));
        var mst = p.state === "syscall" ? " syscall" : "";
        var mtag = el("span", "gl-m" + mst, p.m + (p.state === "syscall" ? " · syscall" : ""));
        hd.appendChild(mtag);
        card.appendChild(hd);

        var slot = el("div", "gl-run");
        slot.appendChild(el("div", "gl-slotlabel", "running"));
        if (p.run) {
          var stealIn = f.steal && f.steal.to === p.id && f.steal.g === p.run;
          slot.appendChild(gchip(p.run, "running" + (stealIn ? " stolen" : "")));
        } else {
          slot.appendChild(el("span", "gl-empty", "idle"));
        }
        card.appendChild(slot);

        var lq = el("div", "gl-lrq");
        lq.appendChild(el("div", "gl-slotlabel", "local queue"));
        var lrow = el("div", "gl-qrow");
        var loc = p.local || [];
        if (!loc.length) lrow.appendChild(el("span", "gl-empty", "empty"));
        else loc.forEach(function (id) {
          var stolen = f.steal && f.steal.to === p.id && f.steal.g === id;
          lrow.appendChild(gchip(id, stolen ? "stolen" : ""));
        });
        lq.appendChild(lrow);
        card.appendChild(lq);
        lanes.appendChild(card);
      });
      stage.appendChild(lanes);

      /* parked / blocked goroutines */
      if (f.blocked && f.blocked.length) {
        var bk = el("div", "gl-blocked");
        bk.appendChild(el("div", "gl-qlabel", "Parked — waiting on channel / lock / timer (off-CPU)"));
        var brow = el("div", "gl-qrow");
        f.blocked.forEach(function (id) { brow.appendChild(gchip(id, "parked")); });
        bk.appendChild(brow);
        stage.appendChild(bk);
      }

      /* steal annotation */
      if (f.steal) {
        var note = el("div", "gl-steal", "");
        note.innerHTML = "⤷ <b>" + f.steal.to + "</b> steals <code>" + f.steal.g + "</code> from <b>" + f.steal.from + "</b>";
        stage.appendChild(note);
      }

      cap.innerHTML = f.caption || "";
      stepEl.textContent = (n + 1) + " / " + frames.length;
      i = n;
    }

    var i = 0, timer = null;
    function stop() { if (timer) { clearInterval(timer); timer = null; } playB.textContent = "▶ Play"; }
    function play() { if (i >= frames.length - 1) render(0); playB.textContent = "⏸ Pause"; timer = setInterval(function () { if (i >= frames.length - 1) { stop(); return; } render(i + 1); }, 2400); }
    function go(n) { stop(); render(Math.max(0, Math.min(frames.length - 1, n))); }
    resetB.addEventListener("click", function () { go(0); });
    prevB.addEventListener("click", function () { go(i - 1); });
    nextB.addEventListener("click", function () { go(i + 1); });
    playB.addEventListener("click", function () { timer ? stop() : play(); });
    fig.setAttribute("tabindex", "0");
    fig.addEventListener("keydown", function (e) {
      if (e.key === "ArrowRight") { go(i + 1); e.preventDefault(); }
      else if (e.key === "ArrowLeft") { go(i - 1); e.preventDefault(); }
      else if (e.key === " " || e.key === "Spacebar") { timer ? stop() : play(); e.preventDefault(); }
      else if (e.key === "Home") { go(0); }
      else if (e.key === "End") { go(frames.length - 1); }
    });
    if (REDUCED) playB.style.display = "none";
    render(0);
  }

  function onReady(fn) { if (document.readyState !== "loading") fn(); else document.addEventListener("DOMContentLoaded", fn); }
  onReady(function () { document.querySelectorAll("[data-goroutinelab]").forEach(build); });
})();
