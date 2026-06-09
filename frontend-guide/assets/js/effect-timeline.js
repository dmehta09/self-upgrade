/* ============================================================
   Frontend Field Guide · EFFECT TIMELINE
   A tiny, dependency-free, data-driven engine that teaches the
   useEffect lifecycle across renders: render → commit → effect →
   cleanup, including the "cleanup runs before the effect re-runs"
   ordering. The author writes lanes/passes/frames as JSON; the
   engine lays out a grid (lanes × passes) and lights cells
   cumulatively as you step. Offline, theme-aware (reads --accent
   etc. via CSS), honors prefers-reduced-motion.

   Authoring:
     <figure class="viz efftimeline" data-efftimeline>
       <figcaption class="viz-title">…</figcaption>
       <script type="application/json" class="et-config">
         { "title":"…", "lanes":["render","commit (DOM)","effect","cleanup"],
           "passes":["mount","count: 0→1","unmount"],
           "frames":[ { "col":0, "lane":"effect", "note":"run", "caption":"…" } ] }
       </script>
       <p class="viz-fallback">Static fallback for no-JS.</p>
     </figure>
   ============================================================ */
(function () {
  "use strict";
  var REDUCED = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function el(tag, cls, txt) { var e = document.createElement(tag); if (cls) e.className = cls; if (txt != null) e.textContent = txt; return e; }

  function build(fig) {
    var confEl = fig.querySelector(".et-config");
    if (!confEl) return;
    var cfg; try { cfg = JSON.parse(confEl.textContent); } catch (e) { return; }   // static fallback stays
    var lanes = cfg.lanes || [], passes = cfg.passes || [];
    var frames = (cfg.frames || []).filter(function (f) { return f && f.lane != null && f.col != null; });
    if (!lanes.length || !passes.length || !frames.length) return;

    var titleEl = fig.querySelector(".viz-title");
    if (titleEl && cfg.title) titleEl.textContent = cfg.title;

    /* ---- stage: the lanes × passes grid ---- */
    var stage = el("div", "viz-stage");
    var grid = el("div", "et-grid");
    grid.style.setProperty("--cols", passes.length);

    // header row: empty corner, then one head per pass
    grid.appendChild(el("div", "et-corner"));
    passes.forEach(function (p) { grid.appendChild(el("div", "et-col-head", p)); });

    // one row per lane: label, then a cell per pass (column-major grid → emit row by row)
    var cells = {};   // key "lane|col" → cell element
    lanes.forEach(function (lane, r) {
      grid.appendChild(el("div", "et-lane-label", lane));
      var isCleanup = /cleanup/i.test(lane);
      for (var c = 0; c < passes.length; c++) {
        var cell = el("div", "et-cell" + (isCleanup ? " cleanup" : ""));
        cell.setAttribute("data-lane", lane);
        cell.setAttribute("data-col", c);
        cell.appendChild(el("span", "et-note"));
        cells[lane + "|" + c] = cell;
        grid.appendChild(cell);
      }
    });
    stage.appendChild(grid);

    /* ---- caption + controls ---- */
    var capEl = el("div", "viz-caption");

    var controls = el("div", "viz-controls");
    var resetBtn = el("button", "viz-btn viz-reset", "↺");
    var prevBtn = el("button", "viz-btn viz-prev", "‹");
    var playBtn = el("button", "viz-btn viz-play", "▶");
    var nextBtn = el("button", "viz-btn viz-next", "›");
    resetBtn.setAttribute("aria-label", "Reset");
    prevBtn.setAttribute("aria-label", "Previous");
    playBtn.setAttribute("aria-label", "Play");
    nextBtn.setAttribute("aria-label", "Next");
    var prog = el("div", "viz-progress"); var fill = el("div", "viz-progress-fill"); prog.appendChild(fill);
    var stepEl = el("div", "viz-step");
    var speedWrap = el("div", "viz-speed");
    var speedEl = el("select", "viz-speed-sel");
    [["0.5×", "2400"], ["1×", "1300"], ["2×", "650"]].forEach(function (o, k) {
      var opt = el("option", null, o[0]); opt.value = o[1]; if (k === 1) opt.selected = true; speedEl.appendChild(opt);
    });
    speedEl.setAttribute("aria-label", "Speed");
    speedWrap.appendChild(speedEl);
    controls.appendChild(resetBtn); controls.appendChild(prevBtn); controls.appendChild(playBtn);
    controls.appendChild(nextBtn); controls.appendChild(prog); controls.appendChild(stepEl); controls.appendChild(speedWrap);

    fig.appendChild(stage); fig.appendChild(capEl); fig.appendChild(controls);

    var fallback = fig.querySelector(".viz-fallback");
    if (fallback) fallback.style.display = "none";

    /* ---- playback: cumulative lighting ---- */
    var i = 0, timer = null, delay = +speedEl.value;

    function cellFor(f) {
      var ci = typeof f.col === "number" ? f.col : passes.indexOf(f.col);
      return cells[f.lane + "|" + ci];
    }

    function render() {
      // light frames 0..i, clear the rest (so stepping back un-lights)
      frames.forEach(function (f, k) {
        var cell = cellFor(f); if (!cell) return;
        var on = k <= i;
        cell.classList.toggle("on", on);
        var note = cell.querySelector(".et-note");
        if (note) note.textContent = on && f.note != null ? f.note : "";
      });
      if (capEl) capEl.textContent = (frames[i] && frames[i].caption) || "";
      if (fill) fill.style.width = (frames.length < 2 ? 100 : (i / (frames.length - 1)) * 100) + "%";
      if (stepEl) stepEl.textContent = (i + 1) + " / " + frames.length;
    }

    function show(n) { i = Math.max(0, Math.min(frames.length - 1, n)); render(); }
    function setPlay(glyph, label) { playBtn.textContent = glyph; playBtn.setAttribute("aria-label", label); }
    function stop() { if (timer) { clearInterval(timer); timer = null; } setPlay("▶", "Play"); }
    function play() {
      if (i >= frames.length - 1) show(0);   // replay from start
      setPlay("⏸", "Pause");
      timer = setInterval(function () { if (i >= frames.length - 1) { stop(); return; } show(i + 1); }, delay);
    }

    resetBtn.addEventListener("click", function () { stop(); show(0); });
    prevBtn.addEventListener("click", function () { stop(); show(i - 1); });
    nextBtn.addEventListener("click", function () { stop(); show(i + 1); });
    playBtn.addEventListener("click", function () { timer ? stop() : play(); });
    speedEl.addEventListener("change", function () { delay = +speedEl.value; if (timer) { stop(); play(); } });

    fig.setAttribute("tabindex", "0");
    fig.addEventListener("keydown", function (e) {
      if (e.key === "ArrowRight") { stop(); show(i + 1); e.preventDefault(); }
      else if (e.key === "ArrowLeft") { stop(); show(i - 1); e.preventDefault(); }
      else if (e.key === " " || e.key === "Spacebar") { timer ? stop() : play(); e.preventDefault(); }
      else if (e.key === "Home") { stop(); show(0); }
      else if (e.key === "End") { stop(); show(frames.length - 1); }
    });

    if (REDUCED) playBtn.style.display = "none";   // no autoplay under reduced motion
    show(0);
  }

  function onReady(fn) { if (document.readyState !== "loading") fn(); else document.addEventListener("DOMContentLoaded", fn); }
  onReady(function () { document.querySelectorAll(".efftimeline").forEach(build); });
})();
