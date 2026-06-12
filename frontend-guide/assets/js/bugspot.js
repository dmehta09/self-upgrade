/* ============================================================
   Frontend Field Guide — bug spotter
   For each <figure class="viz bugspot" data-bugspot>: reads the JSON
   in its .bs-config and renders rounds of TSX/TS snippets in which
   ONE region is buggy. Click the buggy line (or ↑/↓ + Enter) to name
   the bug and see why + the fix. After two misses the hint appears.
   ←/→ moves between rounds once solved; builds its own controls.

   Authoring (the page author writes ONLY this):
     <figure class="viz bugspot" data-bugspot>
       <figcaption class="viz-title">…</figcaption>
       <script type="application/json" class="bs-config">{…}</script>
       <p class="viz-fallback">Static fallback text for no-JS.</p>
     </figure>

   Config: { rounds:[{ title, code:[lines…], hot:[from,to] (1-based),
             flag, why, fix, hint? }] }
   ============================================================ */
(function () {
  "use strict";
  function el(tag, cls, txt) { var e = document.createElement(tag); if (cls) e.className = cls; if (txt != null) e.textContent = txt; return e; }
  function onReady(fn) { if (document.readyState !== "loading") fn(); else document.addEventListener("DOMContentLoaded", fn); }

  function build(fig) {
    var cfgEl = fig.querySelector(".bs-config");
    if (!cfgEl) return;
    var cfg; try { cfg = JSON.parse(cfgEl.textContent); } catch (e) { return; }  // bad JSON → static fallback stays
    var rounds = cfg.rounds || [];
    if (!rounds.length) return;

    var fallback = fig.querySelector(".viz-fallback");
    if (fallback) fallback.style.display = "none";

    var stage = el("div", "bs-stage");
    var status = el("p", "bs-status");
    var controls = el("div", "viz-controls");
    var revealBtn = el("button", "viz-btn bs-reveal", "Reveal"); revealBtn.type = "button";
    var nextBtn = el("button", "viz-btn bs-next", "Next round ›"); nextBtn.type = "button";
    var resetBtn = el("button", "viz-btn bs-reset", "Reset"); resetBtn.type = "button";
    controls.appendChild(revealBtn); controls.appendChild(nextBtn); controls.appendChild(resetBtn);
    fig.appendChild(stage); fig.appendChild(status); fig.appendChild(controls);

    var r = 0, found = 0, misses = 0, solved = false, cur = -1, lineEls = [];

    function setStatus(html, cls) { status.innerHTML = html; status.className = "bs-status" + (cls ? " " + cls : ""); }
    function isHot(i) { var h = rounds[r].hot; return i + 1 >= h[0] && i + 1 <= h[1]; }

    function renderRound() {
      var round = rounds[r];
      misses = 0; solved = false; cur = -1; lineEls = [];
      stage.innerHTML = "";

      var head = el("div", "bs-head");
      head.appendChild(el("span", "bs-rtitle", round.title || "Find the bug"));
      head.appendChild(el("span", "bs-rnum", "round " + (r + 1) + " / " + rounds.length));
      stage.appendChild(head);

      var codeWrap = el("div", "bs-code");
      round.code.forEach(function (line, i) {
        var b = el("button", "bs-line"); b.type = "button";
        b.appendChild(el("span", "bs-ln", String(i + 1)));
        b.appendChild(el("span", "bs-lt", line === "" ? " " : line));
        b.addEventListener("click", function () { pick(i); });
        codeWrap.appendChild(b);
        lineEls.push(b);
      });
      stage.appendChild(codeWrap);

      var card = el("div", "bs-card");
      var flagRow = el("div", "bs-flag"); flagRow.appendChild(el("span", "bs-badge"));
      card.appendChild(flagRow);
      card.appendChild(el("p", "bs-why"));
      var fixP = el("p", "bs-fix"); var fb = el("b", null, "Fix: "); fixP.appendChild(fb); fixP.appendChild(el("span"));
      card.appendChild(fixP);
      stage.appendChild(card);

      setStatus("Click the buggy line &mdash; or use &uarr;/&darr; + Enter.");
      nextBtn.disabled = r >= rounds.length - 1;
      nextBtn.classList.remove("pulse");
      revealBtn.disabled = false;
    }

    function solve(earned) {
      if (solved) return;
      solved = true;
      if (earned) found++;
      var round = rounds[r];
      lineEls.forEach(function (l, i) {
        l.classList.remove("miss", "cur");
        l.classList.toggle("hit", isHot(i));
        l.disabled = true;
      });
      var card = stage.querySelector(".bs-card");
      card.querySelector(".bs-badge").textContent = "⚠ " + round.flag;
      card.querySelector(".bs-why").textContent = round.why;
      card.querySelector(".bs-fix span").textContent = round.fix;
      card.classList.add("open");
      revealBtn.disabled = true;
      var last = r >= rounds.length - 1;
      setStatus(
        (earned ? "&#10003; Found it" : "Revealed") +
        (last ? " &mdash; " + found + " of " + rounds.length + " spotted unaided." : ""),
        earned ? "ok" : "");
      if (!last) nextBtn.classList.add("pulse");
    }

    function pick(i) {
      if (solved) return;
      if (isHot(i)) { solve(true); return; }
      misses++;
      var l = lineEls[i];
      l.classList.add("miss");
      setTimeout(function () { l.classList.remove("miss"); }, 450);
      if (misses >= 2 && rounds[r].hint) setStatus("Not there. Hint: " + rounds[r].hint, "warn");
      else setStatus("Not that line &mdash; keep looking.", "warn");
    }

    function move(d) {
      if (solved || !lineEls.length) return;
      cur = cur < 0 ? (d > 0 ? 0 : lineEls.length - 1)
                    : Math.min(lineEls.length - 1, Math.max(0, cur + d));
      lineEls.forEach(function (l, i) { l.classList.toggle("cur", i === cur); });
      lineEls[cur].focus();
    }

    revealBtn.addEventListener("click", function () { solve(false); });
    nextBtn.addEventListener("click", function () { if (r < rounds.length - 1) { r++; renderRound(); } });
    resetBtn.addEventListener("click", function () { r = 0; found = 0; renderRound(); });

    fig.setAttribute("tabindex", "0");
    fig.addEventListener("keydown", function (e) {
      if (e.key === "ArrowDown") { e.preventDefault(); move(1); }
      else if (e.key === "ArrowUp") { e.preventDefault(); move(-1); }
      else if (e.key === "Enter" && cur >= 0 && !solved) { e.preventDefault(); pick(cur); }
      else if (e.key === "ArrowRight" && solved && r < rounds.length - 1) { e.preventDefault(); r++; renderRound(); }
      else if (e.key === "ArrowLeft" && r > 0) { e.preventDefault(); r--; renderRound(); }
    });

    renderRound();
  }

  onReady(function () { document.querySelectorAll(".bugspot[data-bugspot]").forEach(build); });
})();
