/* ============================================================
   THE LANG STACK — pipeviz: an LCEL pipe stepper
   Shows what the data LOOKS LIKE between each stage of a chain:
   dict → PromptValue → AIMessage → str. Step through the pipe and
   watch the payload card change shape at every hop.

   Markup:
     <figure class="pipeviz reveal" data-pipeviz>
       <script type="application/json" class="pipeviz-config">{...}</script>
     </figure>

   Config:
     stages: [{id, label, kind: "prompt"|"model"|"parser"|"retriever"|"custom"}]
     frames: [{at, payload, caption}]
       • at = "in" (the raw input, nothing lit) or a stage id
         (that stage just ran; payload is what it produced)
       • payload = short mono string (escaped by the engine)
   ← → Space keys. Sized from config (safe inside .reveal).
   ============================================================ */
(function () {
  "use strict";

  function el(tag, cls, html) {
    var d = document.createElement(tag);
    if (cls) d.className = cls;
    if (html != null) d.innerHTML = html;
    return d;
  }
  function esc(s) { return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"); }

  function init(host) {
    var cfgEl = host.querySelector(".pipeviz-config");
    if (!cfgEl) return;
    var cfg;
    try { cfg = JSON.parse(cfgEl.textContent); } catch (e) { return; }
    var stages = cfg.stages || [], frames = cfg.frames || [];
    if (!stages.length || !frames.length) return;

    /* ---- rail: input ▸ stage | stage | stage ---- */
    var rail = el("div", "pv-rail");
    var inChip = el("span", "pv-stage pv-in", "input");
    rail.appendChild(inChip);
    var stageEls = {};
    stages.forEach(function (s) {
      rail.appendChild(el("span", "pv-pipe", "|"));
      var c = el("span", "pv-stage kind-" + (s.kind || "custom"), esc(s.label || s.id));
      rail.appendChild(c);
      stageEls[s.id] = c;
    });

    var payload = el("pre", "pv-payload");
    var caption = el("figcaption", "sim-caption");
    var controls = el("div", "sim-controls");
    var btnReset = el("button", "sim-btn", "⟲");  btnReset.type = "button"; btnReset.setAttribute("aria-label", "Restart");
    var btnPrev = el("button", "sim-btn", "‹");   btnPrev.type = "button";  btnPrev.setAttribute("aria-label", "Previous step");
    var btnPlay = el("button", "sim-btn sim-play", "Play"); btnPlay.type = "button";
    var btnNext = el("button", "sim-btn", "›");   btnNext.type = "button";  btnNext.setAttribute("aria-label", "Next step");
    var count = el("span", "sim-count");
    [btnReset, btnPrev, btnPlay, btnNext, count].forEach(function (b) { controls.appendChild(b); });

    host.appendChild(rail);
    host.appendChild(payload);
    host.appendChild(caption);
    host.appendChild(controls);
    host.setAttribute("tabindex", "0");

    var order = stages.map(function (s) { return s.id; });
    var i = 0, timer = null;
    var reduced = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    function paint() {
      var fr = frames[i];
      var pos = fr.at === "in" ? -1 : order.indexOf(fr.at);
      inChip.classList.toggle("is-active", fr.at === "in");
      order.forEach(function (id, idx) {
        stageEls[id].classList.toggle("is-active", idx === pos);
        stageEls[id].classList.toggle("is-done", idx < pos);
      });
      payload.textContent = fr.payload || "";
      payload.classList.remove("flash");
      void payload.offsetWidth; // restart the flash animation
      payload.classList.add("flash");
      caption.innerHTML = esc(fr.caption || "");
      count.textContent = (i + 1) + " / " + frames.length;
      btnPrev.disabled = i === 0;
      btnNext.disabled = i === frames.length - 1;
    }

    function go(n) { i = Math.max(0, Math.min(frames.length - 1, n)); paint(); }
    function stop() { if (timer) { clearInterval(timer); timer = null; btnPlay.textContent = "Play"; btnPlay.classList.remove("on"); } }
    function play() {
      if (timer) { stop(); return; }
      if (i >= frames.length - 1) i = -1;
      btnPlay.textContent = "Pause"; btnPlay.classList.add("on");
      timer = setInterval(function () {
        if (i >= frames.length - 1) { stop(); return; }
        go(i + 1);
      }, reduced ? 2600 : 1700);
      go(i + 1);
    }

    btnReset.addEventListener("click", function () { stop(); go(0); });
    btnPrev.addEventListener("click", function () { stop(); go(i - 1); });
    btnNext.addEventListener("click", function () { stop(); go(i + 1); });
    btnPlay.addEventListener("click", play);
    host.addEventListener("keydown", function (e) {
      if (e.key === "ArrowRight") { e.preventDefault(); stop(); go(i + 1); }
      else if (e.key === "ArrowLeft") { e.preventDefault(); stop(); go(i - 1); }
      else if (e.key === " ") { e.preventDefault(); play(); }
    });

    paint();
  }

  function onReady(fn) { if (document.readyState !== "loading") fn(); else document.addEventListener("DOMContentLoaded", fn); }
  onReady(function () {
    document.querySelectorAll("[data-pipeviz]").forEach(init);
  });
})();
