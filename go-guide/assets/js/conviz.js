/* ============================================================
   Go — a visual guide · CONVIZ
   Steps two goroutines through a read-modify-write on a shared
   variable, register by register, so a DATA RACE becomes visible:
   both read the same old value, both write back, and one update is
   lost. Re-run the same logic guarded by a sync.Mutex and the lock
   forces the operations to serialise — the verdict flips to correct.

   Frame-stepper contract: ←/→ step · Space play/pause · Home/End.
   Each frame fully specifies state (no deltas). Offline,
   theme-aware, reduced-motion aware.

   Authoring:
     <figure class="conviz reveal" data-conviz aria-label="…">
       <script type="application/json" class="cv-config">
       { "frames": [
         { "caption": "Both goroutines read count = 0 into a register.",
           "shared": { "name":"count", "val":0 },
           "goroutines": [
             { "id":"g1", "label":"G1", "reg":0, "op":"read count → 0", "state":"running" },
             { "id":"g2", "label":"G2", "reg":0, "op":"read count → 0", "state":"running" } ] },
         { "caption": "Both write reg+1 = 1. One increment is LOST.",
           "shared": { "name":"count", "val":1 },
           "goroutines": [
             { "id":"g1", "label":"G1", "reg":1, "op":"write 1", "state":"done" },
             { "id":"g2", "label":"G2", "reg":1, "op":"write 1", "state":"done" } ],
           "verdict": { "got":1, "want":2, "ok":false } }
       ] }
       </script>
     </figure>
   shared = { name, val }. Optional lock = { name, owner } draws a
   mutex whose owner goroutine is highlighted (others show "blocked").
   Per goroutine: reg = its local copy (null = none), op = the line
   it's on, state = running | blocked | done. verdict = { got, want,
   ok } draws the final correctness banner. ============================================================ */
(function () {
  "use strict";
  var REDUCED = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  function el(tag, cls, txt) { var e = document.createElement(tag); if (cls) e.className = cls; if (txt != null) e.textContent = txt; return e; }

  function build(fig) {
    var confEl = fig.querySelector(".cv-config");
    if (!confEl) return;
    var cfg; try { cfg = JSON.parse(confEl.textContent); } catch (e) { return; }
    var frames = cfg.frames || [];
    if (!frames.length) return;

    var stage = el("div", "cv-stage");
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

      /* shared memory + optional lock */
      var memrow = el("div", "cv-memrow");
      var sh = f.shared || {};
      var mem = el("div", "cv-mem");
      mem.appendChild(el("div", "cv-memlabel", "shared memory"));
      var cellWrap = el("div", "cv-memcell");
      cellWrap.appendChild(el("span", "cv-memname", (sh.name || "x") + " ="));
      cellWrap.appendChild(el("span", "cv-memval", String(sh.val)));
      mem.appendChild(cellWrap);
      memrow.appendChild(mem);

      if (f.lock) {
        var lk = el("div", "cv-lock" + (f.lock.owner ? " held" : ""));
        lk.appendChild(el("div", "cv-memlabel", "mutex"));
        var lw = el("div", "cv-lockbody");
        lw.appendChild(el("span", "cv-lockname", f.lock.name || "mu"));
        lw.appendChild(el("span", "cv-lockstate", f.lock.owner ? "🔒 held by " + f.lock.owner : "🔓 free"));
        lk.appendChild(lw);
        memrow.appendChild(lk);
      }
      stage.appendChild(memrow);

      /* goroutine lanes */
      var lanes = el("div", "cv-lanes");
      (f.goroutines || []).forEach(function (g) {
        var st = g.state === "blocked" ? " blocked" : (g.state === "done" ? " done" : " running");
        var owns = f.lock && f.lock.owner === g.id;
        var card = el("div", "cv-g" + st + (owns ? " owns" : ""));
        var hd = el("div", "cv-ghead");
        hd.appendChild(el("span", "cv-gid", g.label || g.id));
        var badge = g.state === "blocked" ? "blocked on lock" : (g.state === "done" ? "done" : "running");
        hd.appendChild(el("span", "cv-gstate", badge));
        card.appendChild(hd);

        var regrow = el("div", "cv-reg");
        regrow.appendChild(el("span", "cv-reglabel", "register"));
        regrow.appendChild(el("span", "cv-regval", g.reg == null ? "—" : String(g.reg)));
        card.appendChild(regrow);

        card.appendChild(el("div", "cv-op", g.op || ""));
        lanes.appendChild(card);
      });
      stage.appendChild(lanes);

      /* verdict */
      if (f.verdict) {
        var v = el("div", "cv-verdict " + (f.verdict.ok ? "ok" : "bad"));
        v.innerHTML = (f.verdict.ok ? "✓ correct — " : "✗ data race — ") +
          "got <b>" + f.verdict.got + "</b>, wanted <b>" + f.verdict.want + "</b>";
        stage.appendChild(v);
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
  onReady(function () { document.querySelectorAll("[data-conviz]").forEach(build); });
})();
