/* ============================================================
   A Philosophy of Software Design — red-flag spotter
   For each <figure class="flagspot" data-flagspot>: reads the JSON
   in its .fs-config and renders rounds of Python snippets in which
   ONE region smells. Click the smelly line (or ↑/↓ + Enter) to name
   the red flag and see why + the fix. Controls (.fs-reveal, .fs-next,
   .fs-reset) and the status line live in the page markup.
   Config: { rounds:[{ title, code:[lines…], hot:[from,to] (1-based),
             flag, why, fix, hint? }] }
   ============================================================ */
(function () {
  "use strict";
  function onReady(fn) {
    if (document.readyState !== "loading") fn();
    else document.addEventListener("DOMContentLoaded", fn);
  }

  onReady(function () {
    document.querySelectorAll(".flagspot[data-flagspot]").forEach(function (host) {
      var cfgEl = host.querySelector(".fs-config");
      var stage = host.querySelector(".fs-stage");
      if (!cfgEl || !stage) return;
      var cfg;
      try { cfg = JSON.parse(cfgEl.textContent); } catch (e) { return; }
      var rounds = cfg.rounds || [];
      if (!rounds.length) return;

      var revealBtn = host.querySelector(".fs-reveal");
      var nextBtn = host.querySelector(".fs-next");
      var resetBtn = host.querySelector(".fs-reset");
      var status = host.querySelector(".fs-status");

      var r = 0, found = 0, misses = 0, solved = false, cur = -1;
      var lineEls = [];

      function setStatus(html, cls) {
        if (!status) return;
        status.innerHTML = html;
        status.className = "fs-status" + (cls ? " " + cls : "");
      }

      function renderRound() {
        var round = rounds[r];
        misses = 0; solved = false; cur = -1; lineEls = [];
        stage.innerHTML = "";

        var head = document.createElement("div");
        head.className = "fs-head";
        head.innerHTML = "<span class=\"fs-rtitle\"></span><span class=\"fs-rnum\">round " + (r + 1) + " / " + rounds.length + "</span>";
        head.querySelector(".fs-rtitle").textContent = round.title || "Find the red flag";
        stage.appendChild(head);

        var codeWrap = document.createElement("div");
        codeWrap.className = "fs-code";
        round.code.forEach(function (line, i) {
          var b = document.createElement("button");
          b.type = "button";
          b.className = "fs-line";
          b.innerHTML = "<span class=\"fs-ln\">" + (i + 1) + "</span><span class=\"fs-lt\"></span>";
          b.querySelector(".fs-lt").textContent = line === "" ? " " : line;
          b.addEventListener("click", function () { pick(i); });
          codeWrap.appendChild(b);
          lineEls.push(b);
        });
        stage.appendChild(codeWrap);

        var card = document.createElement("div");
        card.className = "fs-card";
        card.innerHTML = "<div class=\"fs-flag\"><span class=\"fs-badge\"></span></div>" +
          "<p class=\"fs-why\"></p><p class=\"fs-fix\"><b>Fix:</b> <span></span></p>";
        stage.appendChild(card);

        setStatus("Click the line that smells &mdash; or use &uarr;/&darr; + Enter.");
        if (nextBtn) { nextBtn.disabled = r >= rounds.length - 1; nextBtn.classList.remove("pulse"); }
        if (revealBtn) revealBtn.disabled = false;
      }

      function isHot(i) {
        var h = rounds[r].hot;
        return i + 1 >= h[0] && i + 1 <= h[1];
      }

      function solve(earned) {
        if (solved) return;
        solved = true;
        if (earned) found++;
        var round = rounds[r];
        lineEls.forEach(function (el, i) {
          el.classList.remove("miss", "cur");
          el.classList.toggle("hit", isHot(i));
          el.disabled = true;
        });
        var card = stage.querySelector(".fs-card");
        card.querySelector(".fs-badge").textContent = "⚠ " + round.flag;
        card.querySelector(".fs-why").textContent = round.why;
        card.querySelector(".fs-fix span").textContent = round.fix;
        card.classList.add("open");
        if (revealBtn) revealBtn.disabled = true;
        var last = r >= rounds.length - 1;
        setStatus(
          (earned ? "&#10003; Found it" : "Revealed") +
          (last ? " &mdash; " + found + " of " + rounds.length + " spotted unaided." : "") ,
          earned ? "ok" : "");
        if (nextBtn && !last) nextBtn.classList.add("pulse");
      }

      function pick(i) {
        if (solved) return;
        if (isHot(i)) { solve(true); return; }
        misses++;
        var el = lineEls[i];
        el.classList.add("miss");
        setTimeout(function () { el.classList.remove("miss"); }, 450);
        var round = rounds[r];
        if (misses >= 2 && round.hint) setStatus("Not there. Hint: " + round.hint, "warn");
        else setStatus("Not that line &mdash; keep sniffing.", "warn");
      }

      function move(d) {
        if (solved || !lineEls.length) return;
        cur = cur < 0 ? (d > 0 ? 0 : lineEls.length - 1)
                      : Math.min(lineEls.length - 1, Math.max(0, cur + d));
        lineEls.forEach(function (el, i) { el.classList.toggle("cur", i === cur); });
        lineEls[cur].focus();
      }

      if (revealBtn) revealBtn.addEventListener("click", function () { solve(false); });
      if (nextBtn) nextBtn.addEventListener("click", function () { if (r < rounds.length - 1) { r++; renderRound(); } });
      if (resetBtn) resetBtn.addEventListener("click", function () { r = 0; found = 0; renderRound(); });

      host.addEventListener("keydown", function (e) {
        if (e.key === "ArrowDown") { e.preventDefault(); move(1); }
        else if (e.key === "ArrowUp") { e.preventDefault(); move(-1); }
        else if (e.key === "Enter" && cur >= 0 && !solved) { e.preventDefault(); pick(cur); }
        else if (e.key === "ArrowRight" && solved && r < rounds.length - 1) { e.preventDefault(); r++; renderRound(); }
        else if (e.key === "ArrowLeft" && r > 0) { e.preventDefault(); r--; renderRound(); }
      });

      renderRound();
    });
  });
})();
