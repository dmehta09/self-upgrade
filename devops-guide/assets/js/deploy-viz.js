/* ============================================================
   DevOps Field Guide — deployment-strategy player (.deployviz)
   Animates how a release shifts live traffic from the OLD version to
   the NEW one under different strategies (recreate / rolling /
   blue-green / canary). Pure pre-computed data; offline; theme-aware;
   honors prefers-reduced-motion. Builds its own controls, so the
   author writes only the host div + a JSON config (+ a fallback line).

   Authoring:
     <div class="deployviz" data-deployviz>
       <script type="application/json" class="dv-config">
       { "title": "Release strategies, side by side",
         "strategies": [
           { "name": "Rolling",
             "frames": [
               { "pods": ["old","old","old","old"], "traffic": 0, "status": "ok",
                 "caption": "4 pods on v1 — 100% of traffic." },
               { "pods": ["new","old","old","old"], "traffic": 25, "status": "ok",
                 "caption": "Replace one pod with v2; 25% of traffic now on v2." }
             ] } ] }
       </script>
       <p class="viz-fallback">Rolling: pods flip from v1 to v2 one batch at a time…</p>
     </div>

   pod ∈ "old" | "new" | "canary" | "down".   traffic = % served by the NEW version.
   status ∈ "ok" | "risk" | "down"  (tints the caption strip).
   ============================================================ */
(function () {
  "use strict";
  var REDUCED = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  function el(t, c, x) { var e = document.createElement(t); if (c) e.className = c; if (x != null) e.textContent = x; return e; }

  function init(host) {
    var sEl = host.querySelector(".dv-config") || host.querySelector("script[type='application/json']");
    if (!sEl) return;
    var cfg; try { cfg = JSON.parse(sEl.textContent); } catch (e) { return; }   // leave fallback in place
    var strategies = cfg.strategies || [];
    if (!strategies.length) return;

    host.innerHTML = "";
    var head = el("div", "dv-head");
    head.appendChild(el("span", "dv-title", cfg.title || "Deployment strategy"));
    host.appendChild(head);

    var seg = el("div", "dv-seg"); host.appendChild(seg);
    var fleet = el("div", "dv-fleet"); host.appendChild(fleet);

    /* traffic split bar (old vs new) */
    var traffic = el("div", "dv-traffic");
    var tOld = el("span", "dv-tr-old"); var tNew = el("span", "dv-tr-new");
    traffic.appendChild(tOld); traffic.appendChild(tNew);
    host.appendChild(traffic);
    var labels = el("div", "dv-tr-labels");
    var lOld = el("span", "dv-tl dv-tl-old"); var lNew = el("span", "dv-tl dv-tl-new");
    labels.appendChild(lOld); labels.appendChild(lNew);
    host.appendChild(labels);

    var cap = el("div", "dv-caption"); cap.setAttribute("aria-live", "polite"); host.appendChild(cap);

    /* controls */
    var ctr = el("div", "dv-controls");
    var bReset = el("button", "dv-btn dv-reset", "⏮"); bReset.type = "button"; bReset.setAttribute("aria-label", "Restart");
    var bPrev = el("button", "dv-btn dv-prev", "‹"); bPrev.type = "button"; bPrev.setAttribute("aria-label", "Previous step");
    var bPlay = el("button", "dv-btn dv-play", "▶"); bPlay.type = "button"; bPlay.setAttribute("aria-label", "Play");
    var bNext = el("button", "dv-btn dv-next", "›"); bNext.type = "button"; bNext.setAttribute("aria-label", "Next step");
    var prog = el("div", "dv-progress"); var progFill = el("div", "dv-progress-fill"); prog.appendChild(progFill);
    var stepEl = el("span", "dv-step", "1 / 1");
    var speed = document.createElement("select"); speed.className = "dv-speed-sel"; speed.setAttribute("aria-label", "Speed");
    speed.innerHTML = '<option value="1700">0.5×</option><option value="1100" selected>1×</option><option value="650">2×</option>';
    [bReset, bPrev, bPlay, bNext, prog, stepEl, speed].forEach(function (n) { ctr.appendChild(n); });
    host.appendChild(ctr);

    var si = 0, fi = 0, timer = null, delay = 1100;

    /* strategy segmented control (only when >1 strategy) */
    var segBtns = [];
    if (strategies.length > 1) {
      strategies.forEach(function (st, idx) {
        var b = el("button", "dv-seg-btn", st.name || ("Option " + (idx + 1))); b.type = "button";
        b.addEventListener("click", function () { stop(); si = idx; fi = 0; buildFleet(); markSeg(); render(); });
        seg.appendChild(b); segBtns.push(b);
      });
    } else { seg.style.display = "none"; }
    function markSeg() { segBtns.forEach(function (b, k) { b.classList.toggle("active", k === si); }); }

    function frames() { return strategies[si].frames || []; }
    function maxPods() { var m = 0; frames().forEach(function (f) { m = Math.max(m, (f.pods || []).length); }); return m || 1; }

    function buildFleet() {
      fleet.innerHTML = "";
      var n = maxPods();
      for (var k = 0; k < n; k++) fleet.appendChild(el("div", "dv-pod"));
    }

    function render() {
      var F = frames(), f = F[fi] || {};
      var pods = f.pods || [];
      var cells = fleet.querySelectorAll(".dv-pod");
      [].forEach.call(cells, function (cell, k) {
        var v = pods[k];
        cell.className = "dv-pod" + (v ? " is-" + v : " is-empty");
        cell.textContent = (v === "old") ? "v1" : (v === "new" || v === "canary") ? "v2" : "";
      });
      var tn = Math.max(0, Math.min(100, f.traffic == null ? 0 : f.traffic));
      tNew.style.width = tn + "%"; tOld.style.width = (100 - tn) + "%";
      lOld.textContent = "v1 · " + (100 - tn) + "%"; lNew.textContent = "v2 · " + tn + "%";
      host.setAttribute("data-status", f.status || "ok");
      cap.textContent = f.caption || "";
      progFill.style.width = (F.length < 2 ? 100 : (fi / (F.length - 1)) * 100) + "%";
      stepEl.textContent = (fi + 1) + " / " + F.length;
    }

    function go(n) { var F = frames(); fi = Math.max(0, Math.min(F.length - 1, n)); render(); }
    function setPlay(g, l) { bPlay.textContent = g; bPlay.setAttribute("aria-label", l); }
    function stop() { if (timer) { clearInterval(timer); timer = null; } setPlay("▶", "Play"); host.classList.remove("is-playing"); }
    function play() {
      var F = frames(); if (fi >= F.length - 1) fi = -1;
      setPlay("⏸", "Pause"); host.classList.add("is-playing");
      timer = setInterval(function () { if (fi >= frames().length - 1) { stop(); return; } go(fi + 1); }, delay);
    }

    bReset.addEventListener("click", function () { stop(); go(0); });
    bPrev.addEventListener("click", function () { stop(); go(fi - 1); });
    bNext.addEventListener("click", function () { stop(); go(fi + 1); });
    bPlay.addEventListener("click", function () { timer ? stop() : play(); });
    speed.addEventListener("change", function () { delay = +speed.value; if (timer) { stop(); play(); } });

    host.setAttribute("tabindex", "0");
    host.addEventListener("keydown", function (e) {
      if (e.key === "ArrowRight") { stop(); go(fi + 1); e.preventDefault(); }
      else if (e.key === "ArrowLeft") { stop(); go(fi - 1); e.preventDefault(); }
      else if (e.key === " " || e.key === "Spacebar") { timer ? stop() : play(); e.preventDefault(); }
      else if (e.key === "Home") { stop(); go(0); }
      else if (e.key === "End") { stop(); go(frames().length - 1); }
    });

    if (REDUCED) bPlay.style.display = "none";
    markSeg(); buildFleet(); go(0);
  }

  function onReady(fn) { if (document.readyState !== "loading") fn(); else document.addEventListener("DOMContentLoaded", fn); }
  onReady(function () { document.querySelectorAll(".deployviz").forEach(init); });
})();
