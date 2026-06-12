/* ============================================================
   Frontend Field Guide — cachelab (TanStack Query lifecycle)
   Steps a single query through its cache lifecycle: mount → fresh
   (within staleTime) → stale → background refetch on a trigger →
   unmount → inactive → garbage-collected (gcTime). The event rail
   is built from the frames themselves; a data-age meter shows how
   close the entry is to its current threshold. Builds its own
   controls (same row as the other engines); theme-aware; honors
   prefers-reduced-motion (no autoplay).

   Authoring (the page author writes ONLY this):
     <figure class="viz cachelab" data-cachelab>
       <figcaption class="viz-title">…</figcaption>
       <script type="application/json" class="cl-config">{…}</script>
       <p class="viz-fallback">Static fallback text for no-JS.</p>
     </figure>

   Config: { staleTime:"60s", gcTime:"5min", frames:[
     { label,                 — event chip on the rail ("mount", "focus"…)
       state,                 — fresh | stale | fetching | inactive | gone
       observers,             — # of mounted components using the query
       meter: 0–100,          — fill of the age meter
       meterKind,             — "stale" (age vs staleTime) | "gc" (vs gcTime)
       caption } ] }
   ============================================================ */
(function () {
  "use strict";
  var REDUCED = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var STATE_LABEL = { fresh: "fresh", stale: "stale", fetching: "fetching", inactive: "inactive", gone: "gone" };

  function el(tag, cls, txt) { var e = document.createElement(tag); if (cls) e.className = cls; if (txt != null) e.textContent = txt; return e; }
  function onReady(fn) { if (document.readyState !== "loading") fn(); else document.addEventListener("DOMContentLoaded", fn); }

  function build(fig) {
    var confEl = fig.querySelector(".cl-config");
    if (!confEl) return;
    var cfg; try { cfg = JSON.parse(confEl.textContent); } catch (e) { return; }  // bad JSON → static fallback stays
    var frames = cfg.frames || [];
    if (!frames.length) return;

    var fallback = fig.querySelector(".viz-fallback");
    if (fallback) fallback.style.display = "none";

    /* ---- dials: the two knobs + live state + observers ---- */
    var dials = el("div", "cl-dials");
    var stChip = el("span", "cl-dial"); stChip.appendChild(el("b", null, "staleTime")); stChip.appendChild(el("span", null, cfg.staleTime || "0"));
    var gcChip = el("span", "cl-dial"); gcChip.appendChild(el("b", null, "gcTime")); gcChip.appendChild(el("span", null, cfg.gcTime || "5min"));
    var stateChip = el("span", "cl-state");
    var obsChip = el("span", "cl-obs");
    dials.appendChild(stChip); dials.appendChild(gcChip); dials.appendChild(stateChip); dials.appendChild(obsChip);

    /* ---- stage: event rail + age meter ---- */
    var stage = el("div", "viz-stage cl-stage");
    var rail = el("div", "cl-rail");
    var evEls = frames.map(function (f) { var c = el("span", "cl-ev", f.label); rail.appendChild(c); return c; });
    stage.appendChild(rail);

    var meterRow = el("div", "cl-meter-row");
    var meterLab = el("span", "cl-meter-lab");
    var meter = el("div", "cl-meter");
    var fillEl = el("div", "cl-meter-fill"); meter.appendChild(fillEl);
    meterRow.appendChild(meterLab); meterRow.appendChild(meter);
    stage.appendChild(meterRow);

    var capEl = el("div", "viz-caption");

    /* ---- controls (same row as the other engines) ---- */
    var controls = el("div", "viz-controls");
    var resetBtn = el("button", "viz-btn", "⏮"); resetBtn.setAttribute("aria-label", "Reset");
    var prevBtn = el("button", "viz-btn", "‹"); prevBtn.setAttribute("aria-label", "Previous");
    var playBtn = el("button", "viz-btn viz-play", "▶"); playBtn.setAttribute("aria-label", "Play");
    var nextBtn = el("button", "viz-btn", "›"); nextBtn.setAttribute("aria-label", "Next");
    var prog = el("div", "viz-progress"); var fill = el("div", "viz-progress-fill"); prog.appendChild(fill);
    var stepEl = el("div", "viz-step");
    controls.appendChild(resetBtn); controls.appendChild(prevBtn); controls.appendChild(playBtn);
    controls.appendChild(nextBtn); controls.appendChild(prog); controls.appendChild(stepEl);

    fig.appendChild(dials); fig.appendChild(stage); fig.appendChild(capEl); fig.appendChild(controls);

    var i = 0, timer = null, delay = 1500;

    function paint() {
      var f = frames[i];
      evEls.forEach(function (c, k) {
        c.className = "cl-ev" + (k === i ? " on" : (k < i ? " done" : ""));
      });
      stateChip.textContent = STATE_LABEL[f.state] || f.state;
      stateChip.setAttribute("data-state", f.state);
      obsChip.textContent = f.observers === 1 ? "1 observer" : (f.observers || 0) + " observers";
      obsChip.classList.toggle("none", !f.observers);
      var kind = f.meterKind || "stale";
      meterLab.textContent = kind === "gc" ? "time unused vs gcTime" : "data age vs staleTime";
      meter.setAttribute("data-kind", kind);
      fillEl.style.width = Math.max(0, Math.min(100, f.meter || 0)) + "%";
      capEl.textContent = f.caption || "";
      fill.style.width = (frames.length < 2 ? 100 : (i / (frames.length - 1)) * 100) + "%";
      stepEl.textContent = (i + 1) + " / " + frames.length;
    }
    function go(n) { i = Math.max(0, Math.min(frames.length - 1, n)); paint(); }
    function setPlay(glyph, label) { playBtn.textContent = glyph; playBtn.setAttribute("aria-label", label); }
    function stop() { if (timer) { clearInterval(timer); timer = null; } setPlay("▶", "Play"); }
    function play() {
      if (i >= frames.length - 1) i = -1;            // replay from start
      setPlay("⏸", "Pause");
      timer = setInterval(function () { if (i >= frames.length - 1) { stop(); return; } go(i + 1); }, delay);
    }

    resetBtn.addEventListener("click", function () { stop(); go(0); });
    prevBtn.addEventListener("click", function () { stop(); go(i - 1); });
    nextBtn.addEventListener("click", function () { stop(); go(i + 1); });
    playBtn.addEventListener("click", function () { timer ? stop() : play(); });

    fig.setAttribute("tabindex", "0");
    fig.addEventListener("keydown", function (e) {
      if (e.key === "ArrowRight") { stop(); go(i + 1); e.preventDefault(); }
      else if (e.key === "ArrowLeft") { stop(); go(i - 1); e.preventDefault(); }
      else if (e.key === " " || e.key === "Spacebar") { timer ? stop() : play(); e.preventDefault(); }
      else if (e.key === "Home") { stop(); go(0); }
      else if (e.key === "End") { stop(); go(frames.length - 1); }
    });

    if (REDUCED) playBtn.style.display = "none";   // no autoplay under reduced motion
    go(0);
  }

  onReady(function () { document.querySelectorAll(".cachelab[data-cachelab]").forEach(build); });
})();
