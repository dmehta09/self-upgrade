/* ============================================================
   Claude & Claude Code — Field Guide · SESSION PLAYER
   A tiny, dependency-free, data-driven engine that "plays" a
   Claude Code session step-by-step in a faux terminal. A session
   is pure data the author writes; the engine just reveals each
   step (cumulatively), captions it, and animates the newest block.
   Offline, theme-aware (reads --accent etc. via CSS), honors
   prefers-reduced-motion.

   Authoring:
     <figure class="splayer" data-splayer> …controls…
       <script type="application/json" class="sp-config">
         { "title":"claude — ~/app",
           "steps":[ { "type":"user|think|tool|diff|plan|subagent|assistant|commit",
                       …fields…, "mode":"default|plan|auto", "caption":"…" } ] }
       </script>
     </figure>

   Step shapes:
     user      { text }
     think     { text }
     tool      { kind:"Read|Edit|Write|Bash|Grep|Glob|…", arg, result?, status?:"ok|bad" }
     diff      { file, lines:[ ["add|del|ctx","text"], … ] }
     plan      { items:[ "…", … ] , title? }
     subagent  { name, text }
     assistant { text }
     commit    { msg }
   ============================================================ */
(function () {
  "use strict";
  var REDUCED = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function el(tag, cls, txt) { var e = document.createElement(tag); if (cls) e.className = cls; if (txt != null) e.textContent = txt; return e; }

  /* ---------------- block renderers (one per step type) ---------------- */
  function blockUser(s) {
    var b = el("div", "sp-block");
    var r = el("div", "sp-user");
    r.appendChild(el("span", "sp-caret", ">"));
    r.appendChild(el("span", "sp-utext", s.text || ""));
    b.appendChild(r); return b;
  }
  function blockThink(s) {
    var b = el("div", "sp-block");
    var r = el("div", "sp-think");
    r.appendChild(el("span", "sp-bead"));
    r.appendChild(el("span", "sp-bead"));
    r.appendChild(el("span", "sp-bead"));
    r.appendChild(el("span", null, s.text || "Thinking…"));
    b.appendChild(r); return b;
  }
  function blockTool(s) {
    var b = el("div", "sp-block");
    var r = el("div", "sp-tool");
    r.setAttribute("data-tool-kind", s.kind || "Tool");
    r.appendChild(el("span", "sp-tname", s.kind || "Tool"));
    r.appendChild(el("span", "sp-targ", s.arg || ""));
    if (s.result != null) {
      var res = el("span", "sp-tres");
      if (s.status === "ok") res.appendChild(el("span", "sp-ok", "✓"));
      else if (s.status === "bad") res.appendChild(el("span", "sp-bad", "✕"));
      res.appendChild(el("span", null, s.result));
      r.appendChild(res);
    }
    b.appendChild(r); return b;
  }
  function blockDiff(s) {
    var b = el("div", "sp-block");
    var d = el("div", "sp-diff");
    if (s.file) d.appendChild(el("div", "sp-dfile", s.file));
    (s.lines || []).forEach(function (ln) {
      var kind = ln[0] || "ctx", text = ln[1] != null ? ln[1] : "";
      var row = el("div", "sp-dline " + kind);
      var sign = kind === "add" ? "+" : kind === "del" ? "-" : " ";
      row.appendChild(el("span", "sp-sign", sign));
      row.appendChild(el("span", null, text));
      d.appendChild(row);
    });
    b.appendChild(d); return b;
  }
  function blockPlan(s) {
    var b = el("div", "sp-block");
    var p = el("div", "sp-plan");
    var t = el("div", "sp-ptitle"); t.appendChild(el("span", null, "▣")); t.appendChild(el("span", null, s.title || "Plan"));
    p.appendChild(t);
    var ul = el("ul");
    (s.items || []).forEach(function (it) { ul.appendChild(el("li", null, it)); });
    p.appendChild(ul); b.appendChild(p); return b;
  }
  function blockSub(s) {
    var b = el("div", "sp-block");
    var r = el("div", "sp-sub");
    r.appendChild(el("span", "sp-sname", s.name || "subagent"));
    r.appendChild(el("span", "sp-stext", s.text || ""));
    b.appendChild(r); return b;
  }
  function blockAssistant(s) {
    var b = el("div", "sp-block");
    var r = el("div", "sp-assistant");
    r.appendChild(el("span", "sp-mark", "✦"));
    r.appendChild(el("span", "sp-atext", s.text || ""));
    b.appendChild(r); return b;
  }
  function blockCommit(s) {
    var b = el("div", "sp-block");
    var r = el("div", "sp-commit");
    r.appendChild(el("span", "sp-git", "✓ commit"));
    r.appendChild(el("span", "sp-cmsg", s.msg || ""));
    b.appendChild(r); return b;
  }
  var RENDER = {
    user: blockUser, think: blockThink, tool: blockTool, diff: blockDiff,
    plan: blockPlan, subagent: blockSub, assistant: blockAssistant, commit: blockCommit
  };

  function Engine(fig) {
    var confEl = fig.querySelector(".sp-config");
    if (!confEl) return;
    var cfg; try { cfg = JSON.parse(confEl.textContent); } catch (e) { return; }   // static fallback stays
    var steps = (cfg.steps || []).filter(function (s) { return s && RENDER[s.type]; });
    if (!steps.length) return;

    var body = fig.querySelector('[data-role="body"]') || fig.querySelector(".sp-body");
    var capEl = fig.querySelector('[data-role="caption"]') || fig.querySelector(".sp-caption");
    var modeEl = fig.querySelector('[data-role="mode"]');
    var titleEl = fig.querySelector(".sp-title");
    var fill = fig.querySelector(".sp-progress-fill");
    var stepEl = fig.querySelector(".sp-step");
    var playBtn = fig.querySelector(".sp-play");
    var speedEl = fig.querySelector(".sp-speed-sel");
    if (!body) return;

    if (titleEl && cfg.title) titleEl.textContent = cfg.title;
    body.innerHTML = "";
    var nodes = [];           // realized block elements (index-aligned with steps shown)
    var i = -1, timer = null, delay = speedEl ? +speedEl.value : 1400;

    function latestMode(n) { var m = "default"; for (var k = 0; k <= n; k++) if (steps[k].mode) m = steps[k].mode; return m; }

    function paintMeta() {
      if (capEl) capEl.innerHTML = (steps[i] && steps[i].caption) || "";
      if (fill) fill.style.width = (steps.length < 2 ? 100 : (i / (steps.length - 1)) * 100) + "%";
      if (stepEl) stepEl.textContent = (i + 1) + " / " + steps.length;
      if (modeEl) {
        var m = latestMode(i);
        modeEl.textContent = m === "plan" ? "plan mode" : m === "auto" ? "auto-accept" : "default";
        modeEl.className = "sp-mode" + (m === "plan" ? " plan" : m === "auto" ? " auto" : "");
      }
      nodes.forEach(function (n, k) { n.classList.toggle("is-last", k === nodes.length - 1); });
      body.scrollTop = body.scrollHeight;
    }

    function show(n) {
      n = Math.max(0, Math.min(steps.length - 1, n));
      // grow
      while (nodes.length < n + 1) {
        var idx = nodes.length;
        var node = RENDER[steps[idx].type](steps[idx]);
        if (REDUCED) node.style.animation = "none";
        body.appendChild(node); nodes.push(node);
      }
      // shrink
      while (nodes.length > n + 1) { body.removeChild(nodes.pop()); }
      i = n; paintMeta();
    }

    function setPlay(glyph, label) { if (playBtn) { playBtn.textContent = glyph; playBtn.setAttribute("aria-label", label); } }
    function stop() { if (timer) { clearInterval(timer); timer = null; } setPlay("▶", "Play"); }
    function play() {
      if (i >= steps.length - 1) { body.innerHTML = ""; nodes = []; i = -1; }   // replay from start
      setPlay("⏸", "Pause");
      timer = setInterval(function () { if (i >= steps.length - 1) { stop(); return; } show(i + 1); }, delay);
      show(i + 1);
    }

    var prev = fig.querySelector(".sp-prev"), next = fig.querySelector(".sp-next"), reset = fig.querySelector(".sp-reset");
    if (prev) prev.addEventListener("click", function () { stop(); show(i - 1); });
    if (next) next.addEventListener("click", function () { stop(); show(i + 1); });
    if (reset) reset.addEventListener("click", function () { stop(); body.innerHTML = ""; nodes = []; i = -1; show(0); });
    if (playBtn) playBtn.addEventListener("click", function () { timer ? stop() : play(); });
    if (speedEl) speedEl.addEventListener("change", function () { delay = +speedEl.value; if (timer) { stop(); play(); } });

    fig.setAttribute("tabindex", "0");
    fig.addEventListener("keydown", function (e) {
      if (e.key === "ArrowRight") { stop(); show(i + 1); e.preventDefault(); }
      else if (e.key === "ArrowLeft") { stop(); show(i - 1); e.preventDefault(); }
      else if (e.key === " " || e.key === "Spacebar") { timer ? stop() : play(); e.preventDefault(); }
      else if (e.key === "Home") { stop(); body.innerHTML = ""; nodes = []; i = -1; show(0); }
      else if (e.key === "End") { stop(); show(steps.length - 1); }
    });

    if (REDUCED && playBtn) playBtn.style.display = "none";   // no autoplay under reduced motion
    show(0);
  }

  function onReady(fn) { if (document.readyState !== "loading") fn(); else document.addEventListener("DOMContentLoaded", fn); }
  onReady(function () { document.querySelectorAll(".splayer").forEach(Engine); });
})();
