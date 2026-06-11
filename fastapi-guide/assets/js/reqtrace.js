/* ============================================================
   FastAPI Field Guide · REQTRACE
   A tiny, dependency-free engine that walks an HTTP request
   through FastAPI's pipeline: middleware in, router match,
   dependency resolution, Pydantic validation, your handler,
   response_model filtering, middleware out. The same engine
   powers the overview lesson (happy path + 422), the DI lesson
   (sub-deps, caching, yield cleanup) and the middleware section
   (wrapping + CORS short-circuit) — the stage list comes from
   config. Sized purely from config (safe inside .reveal);
   offline, theme-aware, reduced-motion aware.

   Authoring:
     <figure class="reqtrace reveal" data-reqtrace aria-label="…">
       <script type="application/json" class="rt-config">
         { "stages": [ { "id": "mw", "label": "middleware", "kind": "client|middleware|router|dep|validate|handler|respond" }, … ],
           "frames": [
             { "call": "GET /items/42",            // the request on the card
               "at": "mw",                          // stage the request is at
               "verdict": "pass|reject|run|return|cached|cleanup",  // optional badge
               "badge": "✕ 422",                    // optional badge text override
               "detail": "item_id=42 parses as int",// line under the call
               "caption": "…" }                     // HTML allowed
           ] }
       </script>
       …stage / caption / controls markup (see embeds)…
     </figure>

   Keys (host focused): ←/→ step · Space play/pause · Home/End.
   ============================================================ */
(function () {
  "use strict";
  var REDUCED = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var BADGE = { pass: "✓ pass", reject: "✕ rejected", run: "▸ runs", return: "← returns", cached: "✓ cached", cleanup: "✓ cleanup" };

  function el(tag, cls, txt) { var e = document.createElement(tag); if (cls) e.className = cls; if (txt != null) e.textContent = txt; return e; }

  function Engine(fig) {
    var confEl = fig.querySelector(".rt-config");
    if (!confEl) return;
    var cfg; try { cfg = JSON.parse(confEl.textContent); } catch (e) { return; }
    var stages = cfg.stages || [], frames = cfg.frames || [];
    if (!stages.length || !frames.length) return;

    var stage = fig.querySelector('[data-role="stage"]');
    var capEl = fig.querySelector('[data-role="caption"]');
    var stepEl = fig.querySelector(".rt-step");
    var playBtn = fig.querySelector(".rt-play");
    if (!stage) return;

    /* ---- static scaffold: request card + pipeline ---- */
    stage.innerHTML = "";
    var card = el("div", "rt-card");
    var callEl = el("code", "rt-call", "");
    var badgeEl = el("span", "rt-badge", ""); badgeEl.style.display = "none";
    var detailEl = el("div", "rt-detail", "");
    var top = el("div", "rt-card-top");
    top.appendChild(callEl); top.appendChild(badgeEl);
    card.appendChild(top); card.appendChild(detailEl);
    var pipe = el("div", "rt-pipe");
    var nodeByid = {};
    stages.forEach(function (s, k) {
      if (k) pipe.appendChild(el("span", "rt-link"));
      var n = el("div", "rt-stage rt-" + (s.kind || "handler"));
      n.appendChild(el("span", "rt-stage-label", s.label));
      pipe.appendChild(n); nodeByid[s.id] = n;
    });
    stage.appendChild(card); stage.appendChild(pipe);

    var i = 0, timer = null;

    function paint(n) {
      n = Math.max(0, Math.min(frames.length - 1, n));
      var f = frames[n];
      callEl.textContent = f.call || "";
      detailEl.textContent = f.detail || "";
      if (f.verdict && (f.badge || BADGE[f.verdict])) {
        badgeEl.style.display = "";
        badgeEl.textContent = f.badge || BADGE[f.verdict];
        badgeEl.className = "rt-badge v-" + f.verdict;
      } else badgeEl.style.display = "none";
      stages.forEach(function (s) {
        var node = nodeByid[s.id];
        node.classList.toggle("active", s.id === f.at);
        node.classList.remove("ok", "bad");
      });
      var cur = nodeByid[f.at];
      if (cur && f.verdict) cur.classList.add(f.verdict === "reject" ? "bad" : "ok");
      if (!REDUCED) { card.classList.remove("hop"); void card.offsetWidth; card.classList.add("hop"); }
      if (capEl) capEl.innerHTML = f.caption || "";
      if (stepEl) stepEl.textContent = (n + 1) + " / " + frames.length;
      i = n;
    }

    function setPlay(g, l) { if (playBtn) { playBtn.textContent = g; playBtn.setAttribute("aria-label", l); } }
    function stop() { if (timer) { clearInterval(timer); timer = null; } setPlay("▶", "Play"); }
    function play() {
      if (i >= frames.length - 1) paint(0);
      setPlay("⏸", "Pause");
      timer = setInterval(function () { if (i >= frames.length - 1) { stop(); return; } paint(i + 1); }, 2400);
    }

    var prev = fig.querySelector(".rt-prev"), next = fig.querySelector(".rt-next"), reset = fig.querySelector(".rt-reset");
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
  onReady(function () { document.querySelectorAll("[data-reqtrace]").forEach(Engine); });
})();
