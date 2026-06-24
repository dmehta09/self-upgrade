/* ============================================================
   Go — a visual guide · SLICELAB
   Shows the slice header { ptr, len, cap } sitting over a backing
   array — so you can SEE that a re-slice aliases the same memory,
   that len ≤ cap, and that appending past cap copies into a NEW
   array. The #1 source of Go slice bugs, made visible.

   Frame-stepper contract: ←/→ step · Space play/pause · Home/End.
   Each frame fully specifies its arrays + headers (no deltas), so
   configs stay obvious. Offline, theme-aware, reduced-motion aware.

   Authoring:
     <figure class="slicelab reveal" data-slicelab aria-label="…">
       <script type="application/json" class="sl-config">
       { "frames": [
         { "caption": "s := make([]int, 0, 4)",
           "arrays":  [ { "id": "A0", "cells": [0,0,0,0] } ],
           "headers": [ { "name": "s", "array": "A0", "start": 0, "len": 0, "cap": 4 } ] },
         { "caption": "t := s[1:3] — SAME array, aliases s",
           "arrays":  [ { "id": "A0", "cells": [1,2,3,0] } ],
           "headers": [ { "name": "s", "array": "A0", "start": 0, "len": 3, "cap": 4 },
                        { "name": "t", "array": "A0", "start": 1, "len": 2, "cap": 3 } ],
           "alias":   ["s","t"],
           "changed": { "A0": [1] } }
       ] }
       </script>
     </figure>
   A cell is "used" if any header covers [start, start+len), "spare"
   if covered by [start+len, start+cap). "changed" pulses a write.
   "realloc": { "to": "A1" } tags the new array. ============================================================ */
(function () {
  "use strict";
  var REDUCED = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  function el(tag, cls, txt) { var e = document.createElement(tag); if (cls) e.className = cls; if (txt != null) e.textContent = txt; return e; }

  function build(fig) {
    var confEl = fig.querySelector(".sl-config");
    if (!confEl) return;
    var cfg; try { cfg = JSON.parse(confEl.textContent); } catch (e) { return; }
    var frames = cfg.frames || [];
    if (!frames.length) return;

    var stage = el("div", "sl-stage");
    var cap = el("div", "viz-cap");
    var controls = el("div", "viz-controls");
    var resetB = el("button", "viz-reset", "⏮"), prevB = el("button", "viz-prev", "‹"),
        playB = el("button", "viz-play", "▶ Play"), nextB = el("button", "viz-next", "›"),
        stepEl = el("span", "viz-step", "");
    [resetB, prevB, playB, nextB].forEach(function (b) { b.type = "button"; });
    controls.appendChild(resetB); controls.appendChild(prevB); controls.appendChild(playB); controls.appendChild(nextB); controls.appendChild(stepEl);
    fig.appendChild(stage); fig.appendChild(cap); fig.appendChild(controls);

    function coverage(arrId, headers) {
      var used = {}, spare = {}, j, k;
      headers.forEach(function (h) {
        if (h.array !== arrId) return;
        for (j = h.start; j < h.start + h.len; j++) used[j] = 1;
        for (k = h.start + h.len; k < h.start + h.cap; k++) spare[k] = 1;
      });
      return { used: used, spare: spare };
    }

    function render(n) {
      var f = frames[n], headers = f.headers || [];
      stage.innerHTML = "";
      (f.arrays || []).forEach(function (arr) {
        var box = el("div", "sl-array");
        box.appendChild(el("div", "sl-alabel", arr.label || ("backing array " + arr.id)));
        var row = el("div", "sl-cells");
        var cov = coverage(arr.id, headers);
        var changed = (f.changed && f.changed[arr.id]) || [];
        arr.cells.forEach(function (val, j) {
          var c = el("span", "sl-cell" + (cov.used[j] ? " used" : (cov.spare[j] ? " spare" : "")) + (changed.indexOf(j) !== -1 ? " changed" : ""), String(val));
          c.appendChild(el("span", "sl-idx", String(j)));
          row.appendChild(c);
        });
        box.appendChild(row);
        stage.appendChild(box);
      });
      if (headers.length) {
        var hbox = el("div", "sl-headers");
        headers.forEach(function (h) {
          var r = el("div", "sl-hdr");
          r.appendChild(el("span", "sl-hname", h.name));
          r.appendChild(el("span", "sl-hmeta", "→ " + h.array + "[" + h.start + ":" + (h.start + h.len) + "]   len " + h.len + " · cap " + h.cap));
          if (f.alias && f.alias.indexOf(h.name) !== -1) r.appendChild(el("span", "sl-hbadge", "aliases"));
          if (f.realloc && f.realloc.to === h.array) r.appendChild(el("span", "sl-hbadge realloc", "new array"));
          hbox.appendChild(r);
        });
        stage.appendChild(hbox);
      }
      cap.innerHTML = f.caption || "";
      stepEl.textContent = (n + 1) + " / " + frames.length;
      i = n;
    }

    var i = 0, timer = null;
    function stop() { if (timer) { clearInterval(timer); timer = null; } playB.textContent = "▶ Play"; }
    function play() { if (i >= frames.length - 1) render(0); playB.textContent = "⏸ Pause"; timer = setInterval(function () { if (i >= frames.length - 1) { stop(); return; } render(i + 1); }, 2200); }
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
  onReady(function () { document.querySelectorAll("[data-slicelab]").forEach(build); });
})();
