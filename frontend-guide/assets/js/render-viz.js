/* ============================================================
   Frontend Field Guide — render-viz engine
   A tiny, dependency-free, data-driven engine that walks React's
   render → reconcile → commit pipeline and shows how memo prunes a
   subtree. The component tree + the per-phase "frames" are pure data
   the author writes; the engine just paints each frame onto the tree.
   Offline, theme-aware (all colors come from CSS vars), and honors
   prefers-reduced-motion (no autoplay). Builds its own UI in JS.

   Authoring (the page author writes ONLY this):
     <figure class="viz renderviz" data-renderviz>
       <figcaption class="viz-title">…</figcaption>
       <script type="application/json" class="rv-config">{…}</script>
       <p class="viz-fallback">Static fallback text for no-JS.</p>
     </figure>

   Config: { title?, phases:[…], tree:{id,memo?,children?}, frames:[
       { phase, caption, rerender?:[id…], skipped?:[id…], committed?:[id…] } ] }
   ============================================================ */
(function () {
  "use strict";
  var REDUCED = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function el(tag, cls, txt) { var e = document.createElement(tag); if (cls) e.className = cls; if (txt != null) e.textContent = txt; return e; }
  function has(a, v) { return !!a && a.indexOf(v) !== -1; }

  /* recursively build a node's DOM from the config tree */
  function buildNode(node) {
    var wrap = el("div", "rv-node");
    wrap.setAttribute("data-id", node.id);
    var box = el("div", "rv-box");
    box.appendChild(el("span", "rv-name", node.id));
    if (node.memo) box.appendChild(el("span", "rv-chip", "memo"));
    wrap.appendChild(box);
    var kids = node.children || [];
    if (kids.length) {
      var holder = el("div", "rv-kids");
      kids.forEach(function (c) { holder.appendChild(buildNode(c)); });
      wrap.appendChild(holder);
    }
    return wrap;
  }

  function build(fig) {
    var confEl = fig.querySelector(".rv-config");
    if (!confEl) return;
    var cfg; try { cfg = JSON.parse(confEl.textContent); } catch (e) { return; }  // bad JSON → static fallback stays
    if (!cfg.tree || !(cfg.frames && cfg.frames.length)) return;
    var phases = cfg.phases || [];
    var frames = cfg.frames;

    var fallback = fig.querySelector(".viz-fallback");
    if (fallback) fallback.style.display = "none";

    var titleEl = fig.querySelector(".viz-title");
    if (titleEl && cfg.title) titleEl.textContent = cfg.title;

    /* ---- phase pills ---- */
    var phaseRow = el("div", "rv-phases");
    var phaseEls = {};
    phases.forEach(function (p) { var pe = el("div", "rv-phase", p); phaseEls[p] = pe; phaseRow.appendChild(pe); });

    /* ---- stage + tree ---- */
    var stage = el("div", "viz-stage");
    var tree = el("div", "rv-tree");
    tree.appendChild(buildNode(cfg.tree));
    stage.appendChild(tree);

    /* ---- caption ---- */
    var capEl = el("div", "viz-caption");

    /* ---- controls ---- */
    var controls = el("div", "viz-controls");
    var resetBtn = el("button", "viz-btn viz-reset", "⏮"); resetBtn.setAttribute("aria-label", "Reset");
    var prevBtn = el("button", "viz-btn viz-prev", "‹"); prevBtn.setAttribute("aria-label", "Previous");
    var playBtn = el("button", "viz-btn viz-play", "▶"); playBtn.setAttribute("aria-label", "Play");
    var nextBtn = el("button", "viz-btn viz-next", "›"); nextBtn.setAttribute("aria-label", "Next");
    var prog = el("div", "viz-progress"); var fill = el("div", "viz-progress-fill"); prog.appendChild(fill);
    var stepEl = el("div", "viz-step");
    var speedWrap = el("span", "viz-speed");
    var speedEl = el("select", "viz-speed-sel"); speedEl.setAttribute("aria-label", "Speed");
    [["1700", "0.5×", false], ["1000", "1×", true], ["500", "2×", false]].forEach(function (o) {
      var opt = el("option", null, o[1]); opt.value = o[0]; if (o[2]) opt.selected = true; speedEl.appendChild(opt);
    });
    speedWrap.appendChild(speedEl);
    controls.appendChild(resetBtn); controls.appendChild(prevBtn); controls.appendChild(playBtn);
    controls.appendChild(nextBtn); controls.appendChild(prog); controls.appendChild(stepEl); controls.appendChild(speedWrap);

    /* ---- legend ---- */
    var legend = el("div", "rv-legend");
    function legItem(cls, label) { var s = el("span", cls); s.appendChild(el("i")); s.appendChild(el("span", null, label)); return s; }
    legend.appendChild(legItem("lg-re", "re-render"));
    legend.appendChild(legItem("lg-skip", "skipped (memo)"));
    legend.appendChild(legItem("lg-commit", "committed"));

    fig.appendChild(phaseRow);
    fig.appendChild(stage);
    fig.appendChild(capEl);
    fig.appendChild(controls);
    fig.appendChild(legend);

    /* ---- frame engine ---- */
    var boxes = tree.querySelectorAll(".rv-box");   // index-aligned by data-id on parent
    var i = 0, timer = null, delay = +speedEl.value;

    function paint() {
      var f = frames[i];
      boxes.forEach(function (box) {
        var id = box.parentNode.getAttribute("data-id");
        box.className = "rv-box";
        if (has(f.rerender, id)) box.classList.add("rerender");
        if (has(f.skipped, id)) box.classList.add("skipped");
        if (has(f.committed, id)) box.classList.add("committed");
      });
      phases.forEach(function (p) { phaseEls[p].classList.toggle("on", p === f.phase); });
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
    speedEl.addEventListener("change", function () { delay = +speedEl.value; if (timer) { stop(); play(); } });

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

  function onReady(fn) { if (document.readyState !== "loading") fn(); else document.addEventListener("DOMContentLoaded", fn); }
  onReady(function () { document.querySelectorAll(".renderviz").forEach(build); });
})();
