/* ============================================================
   Go — a visual guide · ESCAPEVIEW
   Shows the compiler's escape analysis: a local variable starts
   life on its function's STACK frame, but if a pointer to it
   outlives the call (returned, captured by a closure, boxed in an
   interface), the compiler MOVES it to the HEAP so it stays valid.
   Makes "why did this allocate?" visible.

   Frame-stepper contract: ←/→ step · Space play/pause · Home/End.
   Each frame fully specifies the stack + heap (no deltas). Offline,
   theme-aware, reduced-motion aware.

   Authoring:
     <figure class="escapeview reveal" data-escapeview aria-label="…">
       <script type="application/json" class="ev-config">
       { "frames": [
         { "caption": "n is a normal local on the stack.",
           "stack": [ { "frame":"newCounter()", "vars":[ {"name":"n","val":"0","state":"normal"} ] } ],
           "heap": [] },
         { "caption": "&n is returned → n is moved to the heap.",
           "stack": [ { "frame":"newCounter()", "vars":[ {"name":"n","state":"moved"} ] } ],
           "heap": [ { "name":"n", "val":"0", "reason":"address returned" } ],
           "note": "./main.go:2:6: moved to heap: n" }
       ] }
       </script>
     </figure>
   var.state: normal | escaping (about to move) | moved (now a heap ref).
   note = a line of `go build -gcflags=-m` style output. ============================================================ */
(function () {
  "use strict";
  var REDUCED = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  function el(tag, cls, txt) { var e = document.createElement(tag); if (cls) e.className = cls; if (txt != null) e.textContent = txt; return e; }

  function build(fig) {
    var confEl = fig.querySelector(".ev-config");
    if (!confEl) return;
    var cfg; try { cfg = JSON.parse(confEl.textContent); } catch (e) { return; }
    var frames = cfg.frames || [];
    if (!frames.length) return;

    var stage = el("div", "ev-stage");
    var colL = el("div", "ev-col ev-stack"); colL.appendChild(el("div", "ev-coltitle", "Stack — per-call frames (free)"));
    var stackWrap = el("div", "ev-frames"); colL.appendChild(stackWrap);
    var colR = el("div", "ev-col ev-heap"); colR.appendChild(el("div", "ev-coltitle", "Heap — escaped, GC-managed"));
    var heapWrap = el("div", "ev-objs"); colR.appendChild(heapWrap);
    stage.appendChild(colL); stage.appendChild(colR);

    var note = el("div", "ev-note-line");
    var cap = el("div", "viz-cap");
    var controls = el("div", "viz-controls");
    var resetB = el("button", "viz-reset", "⏮"), prevB = el("button", "viz-prev", "‹"),
        playB = el("button", "viz-play", "▶ Play"), nextB = el("button", "viz-next", "›"),
        stepEl = el("span", "viz-step", "");
    [resetB, prevB, playB, nextB].forEach(function (b) { b.type = "button"; });
    controls.appendChild(resetB); controls.appendChild(prevB); controls.appendChild(playB); controls.appendChild(nextB); controls.appendChild(stepEl);
    fig.appendChild(stage); fig.appendChild(note); fig.appendChild(cap); fig.appendChild(controls);

    function render(n) {
      var f = frames[n];
      stackWrap.innerHTML = "";
      var st = f.stack || [];
      if (!st.length) stackWrap.appendChild(el("span", "ev-empty", "(frame returned — locals freed)"));
      st.forEach(function (fr) {
        var box = el("div", "ev-frame");
        box.appendChild(el("div", "ev-fname", fr.frame));
        (fr.vars || []).forEach(function (v) {
          var cls = "ev-var" + (v.state === "escaping" ? " escaping" : (v.state === "moved" ? " moved" : ""));
          var row = el("div", cls);
          row.appendChild(el("span", "ev-vname", v.name));
          if (v.state === "moved") row.appendChild(el("span", "ev-vref", "→ heap"));
          else row.appendChild(el("span", "ev-vval", v.val != null ? String(v.val) : ""));
          box.appendChild(row);
        });
        stackWrap.appendChild(box);
      });

      heapWrap.innerHTML = "";
      var hp = f.heap || [];
      if (!hp.length) heapWrap.appendChild(el("span", "ev-empty", "(nothing escaped — zero heap allocs)"));
      hp.forEach(function (o) {
        var box = el("div", "ev-obj");
        var hd = el("div", "ev-ohead");
        hd.appendChild(el("span", "ev-oname", o.name));
        hd.appendChild(el("span", "ev-oval", o.val != null ? String(o.val) : ""));
        box.appendChild(hd);
        if (o.reason) box.appendChild(el("span", "ev-oreason", o.reason));
        heapWrap.appendChild(box);
      });

      note.style.display = f.note ? "" : "none";
      note.textContent = f.note ? "$ " + f.note : "";
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
  onReady(function () { document.querySelectorAll("[data-escapeview]").forEach(build); });
})();
