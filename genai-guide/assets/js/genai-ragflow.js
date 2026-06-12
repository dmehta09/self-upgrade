/* ============================================================
   GenAI Field Guide · RAGFLOW
   A tiny, dependency-free engine that walks a query through a
   retrieval pipeline: query (rewrite) → retrieve → fuse →
   rerank → assemble → generate → verify. The same engine powers
   the naive-RAG lesson (happy path + a vector-only miss), the
   hybrid lesson (BM25 + vector → RRF → cross-encoder) and the
   agentic / GraphRAG lessons — the stage list comes from config.
   Sized purely from config (safe inside .reveal); offline,
   theme-aware, reduced-motion aware.

   Authoring:
     <figure class="ragflow reveal" data-ragflow aria-label="…">
       <script type="application/json" class="rf-config">
         { "stages": [ { "id": "emb", "label": "embed", "kind": "query|retrieve|fuse|rerank|assemble|generate|verify" }, … ],
           "frames": [
             { "query": "what is our refund window?",   // the text on the card
               "at": "emb",                              // stage the card is at
               "verdict": "pass|miss|run|return|loop",   // optional badge
               "badge": "✕ wrong chunks",                // optional badge text override
               "detail": "top-3 chunks by cosine",       // line under the query
               "caption": "…" }                          // HTML allowed
           ] }
       </script>
       …stage / caption / controls markup (see embeds)…
     </figure>

   Keys (host focused): ←/→ step · Space play/pause · Home/End.
   ============================================================ */
(function () {
  "use strict";
  var REDUCED = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var BADGE = { pass: "✓ pass", miss: "✕ miss", run: "▸ runs", return: "← returns", loop: "↻ retry" };

  function el(tag, cls, txt) { var e = document.createElement(tag); if (cls) e.className = cls; if (txt != null) e.textContent = txt; return e; }

  function Engine(fig) {
    var confEl = fig.querySelector(".rf-config");
    if (!confEl) return;
    var cfg; try { cfg = JSON.parse(confEl.textContent); } catch (e) { return; }
    var stages = cfg.stages || [], frames = cfg.frames || [];
    if (!stages.length || !frames.length) return;

    var stage = fig.querySelector('[data-role="stage"]');
    var capEl = fig.querySelector('[data-role="caption"]');
    var stepEl = fig.querySelector(".rf-step");
    var playBtn = fig.querySelector(".rf-play");
    if (!stage) return;

    /* ---- static scaffold: query card + pipeline ---- */
    stage.innerHTML = "";
    var card = el("div", "rf-card");
    var queryEl = el("code", "rf-query", "");
    var badgeEl = el("span", "rf-badge", ""); badgeEl.style.display = "none";
    var detailEl = el("div", "rf-detail", "");
    var top = el("div", "rf-card-top");
    top.appendChild(queryEl); top.appendChild(badgeEl);
    card.appendChild(top); card.appendChild(detailEl);
    var pipe = el("div", "rf-pipe");
    var nodeByid = {};
    stages.forEach(function (s, k) {
      if (k) pipe.appendChild(el("span", "rf-link"));
      var n = el("div", "rf-stage rf-" + (s.kind || "retrieve"));
      n.appendChild(el("span", "rf-stage-label", s.label));
      pipe.appendChild(n); nodeByid[s.id] = n;
    });
    stage.appendChild(card); stage.appendChild(pipe);

    var i = 0, timer = null;

    function paint(n) {
      n = Math.max(0, Math.min(frames.length - 1, n));
      var f = frames[n];
      queryEl.textContent = f.query || "";
      detailEl.textContent = f.detail || "";
      if (f.verdict && (f.badge || BADGE[f.verdict])) {
        badgeEl.style.display = "";
        badgeEl.textContent = f.badge || BADGE[f.verdict];
        badgeEl.className = "rf-badge v-" + f.verdict;
      } else badgeEl.style.display = "none";
      stages.forEach(function (s) {
        var node = nodeByid[s.id];
        node.classList.toggle("active", s.id === f.at);
        node.classList.remove("ok", "bad");
      });
      var cur = nodeByid[f.at];
      if (cur && f.verdict) cur.classList.add(f.verdict === "miss" ? "bad" : "ok");
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

    var prev = fig.querySelector(".rf-prev"), next = fig.querySelector(".rf-next"), reset = fig.querySelector(".rf-reset");
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
  onReady(function () { document.querySelectorAll("[data-ragflow]").forEach(Engine); });
})();
