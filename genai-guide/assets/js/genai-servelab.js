/* ============================================================
   GenAI Field Guide · SERVELAB
   A tiny, dependency-free GPU-serving timeline. Each lane is a
   request (a batch slot); each frame is one tick of the story.
   The grid builds up column by column, so you can SEE static
   batching waste idle slots, continuous batching refill them,
   and the KV cache fill up until something gets evicted. An
   optional meter row tracks KV-cache blocks per frame.
   Sized purely from config (safe inside .reveal); offline,
   theme-aware, reduced-motion aware.

   Authoring:
     <figure class="servelab reveal" data-servelab aria-label="…">
       <script type="application/json" class="sl-config">
         { "lanes":  [ { "id": "a", "label": "req A (12 tok)" }, … ],
           "kv": { "label": "KV blocks", "max": 16 },   // optional meter
           "frames": [
             { "caption": "…",                          // HTML allowed
               "kv": 6,                                 // optional, needs cfg.kv
               "marks": { "a": "prefill",               // lane id → state
                          "b": "queue" } }              // queue|prefill|decode|done|evict
           ] }
       </script>
       …stage / caption / controls markup (see embeds)…
     </figure>

   States: queue = waiting for a slot · prefill = prompt pass
   (compute-bound) · decode = one token per tick (memory-bound) ·
   done = finished · evict = preempted, KV freed · idle = not
   arrived. Omitted lanes default to idle.
   Keys (host focused): ←/→ step · Space play/pause · Home/End.
   ============================================================ */
(function () {
  "use strict";
  var REDUCED = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var STATES = ["queue", "prefill", "decode", "done", "evict", "idle"];

  function el(tag, cls, txt) { var e = document.createElement(tag); if (cls) e.className = cls; if (txt != null) e.textContent = txt; return e; }

  function Engine(fig) {
    var confEl = fig.querySelector(".sl-config");
    if (!confEl) return;
    var cfg; try { cfg = JSON.parse(confEl.textContent); } catch (e) { return; }
    var lanes = cfg.lanes || [], frames = cfg.frames || [];
    if (!lanes.length || !frames.length) return;

    var stage = fig.querySelector('[data-role="stage"]');
    var capEl = fig.querySelector('[data-role="caption"]');
    var stepEl = fig.querySelector(".sl-step");
    var playBtn = fig.querySelector(".sl-play");
    if (!stage) return;

    /* ---- static scaffold: one row per lane, one cell per frame ---- */
    stage.innerHTML = "";
    var grid = el("div", "sl-grid");
    grid.style.setProperty("--cols", frames.length);
    var cells = []; // cells[laneIndex][frameIndex]
    lanes.forEach(function (lane) {
      var row = el("div", "sl-row");
      row.appendChild(el("span", "sl-lane", lane.label));
      var track = el("div", "sl-track");
      var rowCells = [];
      frames.forEach(function (f) {
        var st = (f.marks && f.marks[lane.id]) || "idle";
        if (STATES.indexOf(st) === -1) st = "idle";
        var c = el("span", "sl-cell s-" + st);
        c.title = lane.label + ": " + st;
        track.appendChild(c); rowCells.push(c);
      });
      row.appendChild(track);
      grid.appendChild(row); cells.push(rowCells);
    });
    stage.appendChild(grid);

    /* ---- optional KV-blocks meter ---- */
    var kvFill = null, kvText = null, kvMax = 0;
    if (cfg.kv && frames.some(function (f) { return f.kv != null; })) {
      kvMax = cfg.kv.max || 16;
      var meter = el("div", "sl-kv");
      meter.appendChild(el("span", "sl-lane", cfg.kv.label || "KV blocks"));
      var bar = el("div", "sl-kv-bar");
      kvFill = el("span", "sl-kv-fill");
      bar.appendChild(kvFill);
      kvText = el("span", "sl-kv-text", "");
      meter.appendChild(bar); meter.appendChild(kvText);
      stage.appendChild(meter);
    }

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
      if (kvFill) {
        var kv = f.kv != null ? f.kv : 0;
        var pct = Math.max(0, Math.min(100, (kv / kvMax) * 100));
        kvFill.style.width = pct + "%";
        kvFill.classList.toggle("hot", pct >= 90);
        kvText.textContent = kv + " / " + kvMax;
      }
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

    var prev = fig.querySelector(".sl-prev"), next = fig.querySelector(".sl-next"), reset = fig.querySelector(".sl-reset");
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
  onReady(function () { document.querySelectorAll("[data-servelab]").forEach(Engine); });
})();
