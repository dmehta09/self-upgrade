/* ============================================================
   Claude & Claude Code — Field Guide · CONTEXT METER
   A tiny, dependency-free engine that animates a context window
   filling up (and being compacted) as a session proceeds. Pure
   data in, stacked bar out — each frame is the FULL set of
   segments (no carry-over math), so frames can be stepped in any
   direction. Sized purely from config (safe inside .reveal).
   Offline, theme-aware, honors prefers-reduced-motion.

   Authoring:
     <figure class="ctxmeter reveal" data-ctxmeter aria-label="…">
       <script type="application/json" class="cm-config">
         { "capacity": 200000,
           "frames": [
             { "label": "Session start",
               "segments": [ { "kind": "system|claude-md|files|tools|chat|summary",
                               "label": "…", "tokens": 3400 }, … ],
               "caption": "…",                  // HTML allowed
               "event": "compact" }             // optional badge
           ] }
       </script>
       …stage / caption / controls markup (see embeds)…
     </figure>

   Keys (host focused): ←/→ step · Space play/pause · Home/End.
   ============================================================ */
(function () {
  "use strict";
  var REDUCED = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var KINDS = ["system", "claude-md", "files", "tools", "chat", "summary"];

  function el(tag, cls, txt) { var e = document.createElement(tag); if (cls) e.className = cls; if (txt != null) e.textContent = txt; return e; }
  function fmtK(n) { return n >= 1000 ? (Math.round(n / 100) / 10) + "k" : String(n); }

  function Engine(fig) {
    var confEl = fig.querySelector(".cm-config");
    if (!confEl) return;
    var cfg; try { cfg = JSON.parse(confEl.textContent); } catch (e) { return; }
    var frames = cfg.frames || [], cap = cfg.capacity || 200000;
    if (!frames.length) return;

    var stage = fig.querySelector('[data-role="stage"]');
    var capEl = fig.querySelector('[data-role="caption"]');
    var stepEl = fig.querySelector(".cm-step");
    var playBtn = fig.querySelector(".cm-play");
    if (!stage) return;

    /* ---- static scaffold: header, bar, legend ---- */
    stage.innerHTML = "";
    var head = el("div", "cm-head");
    var hLabel = el("span", "cm-flabel", "");
    var hBadge = el("span", "cm-event", ""); hBadge.style.display = "none";
    var hPct = el("span", "cm-pct", "");
    head.appendChild(hLabel); head.appendChild(hBadge); head.appendChild(hPct);
    var bar = el("div", "cm-bar");
    bar.setAttribute("role", "img");
    var legend = el("ul", "cm-legend");
    stage.appendChild(head); stage.appendChild(bar); stage.appendChild(legend);

    var i = 0, timer = null;

    function paint(n) {
      n = Math.max(0, Math.min(frames.length - 1, n));
      var prevSegs = {};
      if (n > 0) (frames[n - 1].segments || []).forEach(function (s) { prevSegs[s.kind + "|" + s.label] = s.tokens; });
      var f = frames[n];
      var total = 0;
      bar.innerHTML = ""; legend.innerHTML = "";
      (f.segments || []).forEach(function (s) {
        total += s.tokens || 0;
        var changed = i !== n && prevSegs[s.kind + "|" + s.label] !== s.tokens;
        var seg = el("div", "cm-seg cm-k-" + (KINDS.indexOf(s.kind) >= 0 ? s.kind : "files"));
        seg.style.width = Math.max(0.6, (s.tokens / cap) * 100) + "%";
        seg.title = s.label + " — " + fmtK(s.tokens) + " tokens";
        if (changed && !REDUCED) seg.classList.add("flash");
        bar.appendChild(seg);
        var li = el("li", "cm-leg" + (changed ? " changed" : ""));
        li.appendChild(el("i", "cm-dot cm-k-" + s.kind));
        li.appendChild(el("span", "cm-leg-name", s.label));
        li.appendChild(el("span", "cm-leg-tok", fmtK(s.tokens)));
        legend.appendChild(li);
      });
      var pct = Math.round((total / cap) * 100);
      hLabel.textContent = f.label || "";
      hPct.textContent = fmtK(total) + " / " + fmtK(cap) + " · " + pct + "%";
      hPct.className = "cm-pct" + (pct >= 85 ? " hot" : pct >= 60 ? " warm" : "");
      if (f.event) { hBadge.style.display = ""; hBadge.textContent = f.event === "compact" ? "⚡ compacted" : "✦ " + f.event; }
      else hBadge.style.display = "none";
      bar.setAttribute("aria-label", (f.label || "") + " — " + pct + "% of the context window used");
      if (capEl) capEl.innerHTML = f.caption || "";
      if (stepEl) stepEl.textContent = (n + 1) + " / " + frames.length;
      i = n;
    }

    function setPlay(g, l) { if (playBtn) { playBtn.textContent = g; playBtn.setAttribute("aria-label", l); } }
    function stop() { if (timer) { clearInterval(timer); timer = null; } setPlay("▶", "Play"); }
    function play() {
      if (i >= frames.length - 1) paint(0);
      setPlay("⏸", "Pause");
      timer = setInterval(function () { if (i >= frames.length - 1) { stop(); return; } paint(i + 1); }, 2200);
    }

    var prev = fig.querySelector(".cm-prev"), next = fig.querySelector(".cm-next"), reset = fig.querySelector(".cm-reset");
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
  onReady(function () { document.querySelectorAll("[data-ctxmeter]").forEach(Engine); });
})();
