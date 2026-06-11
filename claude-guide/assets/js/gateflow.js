/* ============================================================
   Claude & Claude Code — Field Guide · GATE FLOW
   A tiny, dependency-free engine that walks a tool call through
   Claude Code's gates: permission rules, the ask prompt, hooks,
   and execution. The same engine powers the permissions lesson
   (rule resolution) and the hooks lesson (hooks can veto) — the
   stage list comes from config. Sized purely from config (safe
   inside .reveal); offline, theme-aware, reduced-motion aware.

   Authoring:
     <figure class="gateflow reveal" data-gateflow aria-label="…">
       <script type="application/json" class="gf-config">
         { "stages": [ { "id": "deny", "label": "deny rules", "kind": "rule|ask|hook|exec" }, … ],
           "frames": [
             { "call": "Bash(npm test)",          // the tool call on the card
               "at": "deny",                      // stage the call is at
               "verdict": "allow|deny|ask|block|run|pass",  // optional badge
               "detail": "no deny rule matches",  // line under the call
               "caption": "…" }                   // HTML allowed
           ] }
       </script>
       …stage / caption / controls markup (see embeds)…
     </figure>

   Keys (host focused): ←/→ step · Space play/pause · Home/End.
   ============================================================ */
(function () {
  "use strict";
  var REDUCED = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var BADGE = { allow: "✓ allow", deny: "✕ deny", ask: "? ask", block: "✕ blocked", run: "▸ runs", pass: "✓ pass" };

  function el(tag, cls, txt) { var e = document.createElement(tag); if (cls) e.className = cls; if (txt != null) e.textContent = txt; return e; }

  function Engine(fig) {
    var confEl = fig.querySelector(".gf-config");
    if (!confEl) return;
    var cfg; try { cfg = JSON.parse(confEl.textContent); } catch (e) { return; }
    var stages = cfg.stages || [], frames = cfg.frames || [];
    if (!stages.length || !frames.length) return;

    var stage = fig.querySelector('[data-role="stage"]');
    var capEl = fig.querySelector('[data-role="caption"]');
    var stepEl = fig.querySelector(".gf-step");
    var playBtn = fig.querySelector(".gf-play");
    if (!stage) return;

    /* ---- static scaffold: call card + pipeline ---- */
    stage.innerHTML = "";
    var card = el("div", "gf-card");
    var callEl = el("code", "gf-call", "");
    var badgeEl = el("span", "gf-badge", ""); badgeEl.style.display = "none";
    var detailEl = el("div", "gf-detail", "");
    var top = el("div", "gf-card-top");
    top.appendChild(callEl); top.appendChild(badgeEl);
    card.appendChild(top); card.appendChild(detailEl);
    var pipe = el("div", "gf-pipe");
    var nodeByid = {};
    stages.forEach(function (s, k) {
      if (k) pipe.appendChild(el("span", "gf-link"));
      var n = el("div", "gf-stage gf-" + (s.kind || "rule"));
      n.appendChild(el("span", "gf-stage-label", s.label));
      pipe.appendChild(n); nodeByid[s.id] = n;
    });
    stage.appendChild(card); stage.appendChild(pipe);

    var i = 0, timer = null;

    function paint(n) {
      n = Math.max(0, Math.min(frames.length - 1, n));
      var f = frames[n];
      callEl.textContent = f.call || "";
      detailEl.textContent = f.detail || "";
      if (f.verdict && BADGE[f.verdict]) {
        badgeEl.style.display = "";
        badgeEl.textContent = BADGE[f.verdict];
        badgeEl.className = "gf-badge v-" + f.verdict;
      } else badgeEl.style.display = "none";
      stages.forEach(function (s) {
        var node = nodeByid[s.id];
        node.classList.toggle("active", s.id === f.at);
        node.classList.remove("ok", "bad");
      });
      var cur = nodeByid[f.at];
      if (cur && f.verdict) cur.classList.add(f.verdict === "deny" || f.verdict === "block" ? "bad" : "ok");
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

    var prev = fig.querySelector(".gf-prev"), next = fig.querySelector(".gf-next"), reset = fig.querySelector(".gf-reset");
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
  onReady(function () { document.querySelectorAll("[data-gateflow]").forEach(Engine); });
})();
