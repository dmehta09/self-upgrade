/* ============================================================
   Go — a visual guide · DEFERSTACK
   Steps through a call stack as deferred calls pile up (LIFO),
   a panic unwinds the stack running those defers, and a recover
   stops the unwind. Makes "defer runs B then A" and "recover only
   works inside a deferred func" visible.

   Frame-stepper contract: ←/→ step · Space play/pause · Home/End.
   Each frame fully specifies the stack + accumulated output.
   Offline, theme-aware, reduced-motion aware.

   Authoring:
     <figure class="deferstack reveal" data-deferstack aria-label="…">
       <script type="application/json" class="ds-config">
       { "frames": [
         { "caption": "f registers two defers (LIFO order)",
           "stack": [ { "name": "main()" },
                      { "name": "f()", "state": "active",
                        "defers": ["fmt.Println(\"A\")", "fmt.Println(\"B\")"] } ],
           "output": "" },
         { "caption": "f panics — defers run B then A while unwinding",
           "stack": [ { "name": "main()" },
                      { "name": "f()", "state": "panicking", "running": 1,
                        "defers": ["fmt.Println(\"A\")", "fmt.Println(\"B\")"] } ],
           "output": "B" }
       ] }
       </script>
     </figure>
   frame state: active | panicking | recovered. running = index of
   the defer currently executing (LIFO: highest index first). ============================================================ */
(function () {
  "use strict";
  var REDUCED = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  function el(tag, cls, txt) { var e = document.createElement(tag); if (cls) e.className = cls; if (txt != null) e.textContent = txt; return e; }

  function build(fig) {
    var confEl = fig.querySelector(".ds-config");
    if (!confEl) return;
    var cfg; try { cfg = JSON.parse(confEl.textContent); } catch (e) { return; }
    var frames = cfg.frames || [];
    if (!frames.length) return;

    var stage = el("div", "ds-stage");
    var colL = el("div", "ds-col"); colL.appendChild(el("div", "ds-coltitle", "Call stack — top = running"));
    var framesWrap = el("div", "ds-frames"); colL.appendChild(framesWrap);
    var colR = el("div", "ds-col"); colR.appendChild(el("div", "ds-coltitle", "Output (stdout)"));
    var outWrap = el("div", "ds-out"); colR.appendChild(outWrap);
    stage.appendChild(colL); stage.appendChild(colR);

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
      framesWrap.innerHTML = "";
      (f.stack || []).forEach(function (fr) {
        var st = fr.state === "panicking" ? " panicking" : (fr.state === "recovered" ? " recovered" : (fr.state === "active" ? " active" : ""));
        var box = el("div", "ds-frame" + st);
        var nm = el("div", "ds-fname"); nm.appendChild(el("b", null, fr.name)); box.appendChild(nm);
        if (fr.defers && fr.defers.length) {
          var dwrap = el("div", "ds-fdefers");
          fr.defers.forEach(function (d, di) { dwrap.appendChild(el("div", "ds-defer" + (fr.running === di ? " running" : ""), d)); });
          box.appendChild(dwrap);
        }
        framesWrap.appendChild(box);
      });
      outWrap.innerHTML = "";
      var out = f.output != null ? String(f.output) : "";
      if (out === "") outWrap.appendChild(el("span", "ds-emit", "(no output yet)"));
      else out.split("\n").forEach(function (line) { outWrap.appendChild(el("span", "ds-emit", line)); });
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
  onReady(function () { document.querySelectorAll("[data-deferstack]").forEach(build); });
})();
