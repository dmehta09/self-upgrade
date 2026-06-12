/* ============================================================
   A Philosophy of Software Design — investment-curve stepper
   For each <figure class="decay" data-decay>: reads the JSON in its
   .dc-config and animates the SAME stream of change requests hitting
   two codebases — one tactical, one strategic. Each lane shows the
   features shipped so far (chip width = days that feature cost) and
   a complexity meter. The story's pivot is the crossover frame where
   the strategic lane overtakes for good.
   Controls (.dc-prev/.dc-next/.dc-play/.dc-reset/.dc-step) live in
   the page markup. Keys: ←/→ step · Space play · Home/End jump.
   Config: { frames:[{ label, caption, badge?,
             t:{cost,mess,note}, s:{cost,mess,note} }] }   cost = days,
             mess = 0–100 complexity.
   ============================================================ */
(function () {
  "use strict";
  function onReady(fn) {
    if (document.readyState !== "loading") fn();
    else document.addEventListener("DOMContentLoaded", fn);
  }
  var reduced = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  onReady(function () {
    document.querySelectorAll(".decay[data-decay]").forEach(function (host) {
      var cfgEl = host.querySelector(".dc-config");
      var stage = host.querySelector(".dc-stage");
      if (!cfgEl || !stage) return;
      var cfg;
      try { cfg = JSON.parse(cfgEl.textContent); } catch (e) { return; }
      var frames = cfg.frames || [];
      if (!frames.length) return;

      var prevBtn = host.querySelector(".dc-prev");
      var nextBtn = host.querySelector(".dc-next");
      var playBtn = host.querySelector(".dc-play");
      var resetBtn = host.querySelector(".dc-reset");
      var stepEl = host.querySelector(".dc-step");

      /* build the two lanes once */
      stage.innerHTML = "";
      var lanes = {};
      [["t", "Tactical", "the fastest fix, every time"], ["s", "Strategic", "~15% invested in design"]].forEach(function (d) {
        var lane = document.createElement("div");
        lane.className = "dc-lane dc-" + d[0];
        lane.innerHTML =
          "<div class=\"dc-lh\"><span class=\"dc-name\">" + d[1] + "</span><span class=\"dc-sub\">" + d[2] + "</span></div>" +
          "<div class=\"dc-chips\"></div>" +
          "<div class=\"dc-meter\"><span class=\"dc-mlabel\">complexity</span><span class=\"dc-mtrack\"><span class=\"dc-mfill\"></span></span><span class=\"dc-mval\"></span></div>" +
          "<p class=\"dc-note\"></p>";
        stage.appendChild(lane);
        lanes[d[0]] = lane;
      });
      var capWrap = document.createElement("div");
      capWrap.className = "dc-capwrap";
      capWrap.innerHTML = "<span class=\"dc-badge\"></span><p class=\"dc-cap\" aria-live=\"polite\"></p>";
      stage.appendChild(capWrap);

      var i = 0, timer = null;

      function paintLane(key) {
        var lane = lanes[key];
        var chips = lane.querySelector(".dc-chips");
        chips.innerHTML = "";
        var f, n;
        for (n = 0; n <= i; n++) {
          f = frames[n][key];
          if (!f || !f.cost) continue;
          var c = document.createElement("span");
          c.className = "dc-chip" + (n === i ? " now" : "");
          c.style.flexGrow = f.cost;
          c.innerHTML = "<i>" + f.cost + "d</i>";
          c.title = frames[n].label + " — " + f.cost + " days";
          chips.appendChild(c);
        }
        f = frames[i][key] || {};
        var mess = f.mess || 0;
        var fill = lane.querySelector(".dc-mfill");
        fill.style.width = mess + "%";
        fill.className = "dc-mfill" + (mess >= 70 ? " hot" : mess >= 40 ? " warm" : "");
        lane.querySelector(".dc-mval").textContent = mess;
        lane.querySelector(".dc-note").textContent = f.note || "";
      }

      function paint() {
        paintLane("t"); paintLane("s");
        var f = frames[i];
        capWrap.querySelector(".dc-cap").textContent = f.caption || "";
        var badge = capWrap.querySelector(".dc-badge");
        badge.textContent = f.badge || "";
        badge.style.display = f.badge ? "" : "none";
        if (stepEl) stepEl.textContent = f.label + " · " + (i + 1) + "/" + frames.length;
        if (prevBtn) prevBtn.disabled = i === 0;
        if (nextBtn) nextBtn.disabled = i === frames.length - 1;
      }

      function go(n) {
        i = Math.max(0, Math.min(frames.length - 1, n));
        paint();
      }
      function stop() {
        if (timer) { clearInterval(timer); timer = null; }
        if (playBtn) playBtn.textContent = "▶ Play";
      }
      function play() {
        if (timer) { stop(); return; }
        if (reduced) { go(frames.length - 1); return; }
        if (i === frames.length - 1) go(0);
        playBtn.textContent = "❚❚ Pause";
        timer = setInterval(function () {
          if (i >= frames.length - 1) { stop(); return; }
          go(i + 1);
        }, 1900);
      }

      if (prevBtn) prevBtn.addEventListener("click", function () { stop(); go(i - 1); });
      if (nextBtn) nextBtn.addEventListener("click", function () { stop(); go(i + 1); });
      if (resetBtn) resetBtn.addEventListener("click", function () { stop(); go(0); });
      if (playBtn) playBtn.addEventListener("click", play);

      host.addEventListener("keydown", function (e) {
        if (e.key === "ArrowRight") { e.preventDefault(); stop(); go(i + 1); }
        else if (e.key === "ArrowLeft") { e.preventDefault(); stop(); go(i - 1); }
        else if (e.key === " ") { e.preventDefault(); play(); }
        else if (e.key === "Home") { e.preventDefault(); stop(); go(0); }
        else if (e.key === "End") { e.preventDefault(); stop(); go(frames.length - 1); }
      });

      paint();
    });
  });
})();
