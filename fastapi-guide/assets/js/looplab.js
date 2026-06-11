/* ============================================================
   FastAPI Field Guide · LOOPLAB
   A tiny, dependency-free event-loop timeline. Each lane is a
   task (or the threadpool); each frame is one tick of the story.
   The grid builds up column by column, so you can SEE awaits
   overlap under gather, and a blocking call freeze every lane.
   Sized purely from config (safe inside .reveal); offline,
   theme-aware, reduced-motion aware.

   Authoring:
     <figure class="looplab reveal" data-looplab aria-label="…">
       <script type="application/json" class="ll-config">
         { "lanes":  [ { "id": "a", "label": "task A" }, … ],
           "frames": [
             { "caption": "…",                      // HTML allowed
               "marks": { "a": "run",               // lane id → state
                          "b": "await" } }          // run|await|blocked|done|idle
           ] }
       </script>
       …stage / caption / controls markup (see embeds)…
     </figure>

   States: run = on the loop · await = parked, waiting on I/O ·
   blocked = frozen by a sync call · done = finished · idle = not
   started. Omitted lanes default to idle.
   Keys (host focused): ←/→ step · Space play/pause · Home/End.
   ============================================================ */
(function () {
  "use strict";
  var REDUCED = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var STATES = ["run", "await", "blocked", "done", "idle"];

  function el(tag, cls, txt) { var e = document.createElement(tag); if (cls) e.className = cls; if (txt != null) e.textContent = txt; return e; }

  function Engine(fig) {
    var confEl = fig.querySelector(".ll-config");
    if (!confEl) return;
    var cfg; try { cfg = JSON.parse(confEl.textContent); } catch (e) { return; }
    var lanes = cfg.lanes || [], frames = cfg.frames || [];
    if (!lanes.length || !frames.length) return;

    var stage = fig.querySelector('[data-role="stage"]');
    var capEl = fig.querySelector('[data-role="caption"]');
    var stepEl = fig.querySelector(".ll-step");
    var playBtn = fig.querySelector(".ll-play");
    if (!stage) return;

    /* ---- static scaffold: one row per lane, one cell per frame ---- */
    stage.innerHTML = "";
    var grid = el("div", "ll-grid");
    grid.style.setProperty("--cols", frames.length);
    var cells = []; // cells[laneIndex][frameIndex]
    lanes.forEach(function (lane) {
      var row = el("div", "ll-row");
      row.appendChild(el("span", "ll-lane", lane.label));
      var track = el("div", "ll-track");
      var rowCells = [];
      frames.forEach(function (f) {
        var st = (f.marks && f.marks[lane.id]) || "idle";
        if (STATES.indexOf(st) === -1) st = "idle";
        var c = el("span", "ll-cell s-" + st);
        c.title = lane.label + ": " + st;
        track.appendChild(c); rowCells.push(c);
      });
      row.appendChild(track);
      grid.appendChild(row); cells.push(rowCells);
    });
    stage.appendChild(grid);

    var i = 0, timer = null;

    function paint(n) {
      n = Math.max(0, Math.min(frames.length - 1, n));
      var f = frames[n];
      cells.forEach(function (rowCells) {
        rowCells.forEach(function (c, k) {
          c.classList.toggle("shown", k <= n);
          c.classList.toggle("now", k === n);
        });
      });
      if (capEl) capEl.innerHTML = f.caption || "";
      if (stepEl) stepEl.textContent = (n + 1) + " / " + frames.length;
      i = n;
    }

    function setPlay(g, l) { if (playBtn) { playBtn.textContent = g; playBtn.setAttribute("aria-label", l); } }
    function stop() { if (timer) { clearInterval(timer); timer = null; } setPlay("▶", "Play"); }
    function play() {
      if (i >= frames.length - 1) paint(0);
      setPlay("⏸", "Pause");
      timer = setInterval(function () { if (i >= frames.length - 1) { stop(); return; } paint(i + 1); }, 2000);
    }

    var prev = fig.querySelector(".ll-prev"), next = fig.querySelector(".ll-next"), reset = fig.querySelector(".ll-reset");
    if (prev) prev.addEventListener("click", function () { stop(); paint(i - 1); });
    if (next) next.addEventListener("click", function () { stop(); paint(i + 1); });
    if (reset) reset.addEventListener("click", function () { stop(); paint(0); });
    if (playBtn) playBtn.addEventListener("click", function () { timer ? stop() : play(); });

    fig.setAttribute("tabindex", "0");
    fig.addEventListener("keydown", function (e) {
      if (e.key === "ArrowRight") { stop(); paint(i + 1); e.preventDefault(); }
      else if (e.key === "ArrowLeft") { stop(); paint(i - 1); e.preventDefault(); }
      else if (e.key === " " || e.key === "Spacebar") { timer ? stop() : play(); e.preventDefault(); }
      else if (e.key === "Home") { stop(); paint(0); }
      else if (e.key === "End") { stop(); paint(frames.length - 1); }
    });

    if (REDUCED && playBtn) playBtn.style.display = "none";
    paint(0);
  }

  function onReady(fn) { if (document.readyState !== "loading") fn(); else document.addEventListener("DOMContentLoaded", fn); }
  onReady(function () { document.querySelectorAll("[data-looplab]").forEach(Engine); });
})();
