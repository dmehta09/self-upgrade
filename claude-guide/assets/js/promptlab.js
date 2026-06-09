/* ============================================================
   Claude & Claude Code — Field Guide · PROMPT LAB
   A mock, offline "prompt playground". Each .promptlab holds a
   <script type="application/json" class="pl-config"> describing a
   few prompt variants and their *simulated* Claude replies + a
   short "why" note. Switch variants, optionally edit the prompt,
   press "Ask Claude" and read the (illustrative) reply. No network,
   no API key — the replies are authored, not generated, so the
   lesson is reproducible. Runs at file://.
   ============================================================ */
(function () {
  "use strict";

  var QLABEL = { good: "strong", ok: "so-so", poor: "weak" };
  var REDUCED = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function escHtml(s) { return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"); }
  function escAttr(s) { return escHtml(s).replace(/"/g, "&quot;"); }

  function build(pad) {
    var confEl = pad.querySelector(".pl-config");
    if (!confEl) return;
    var cfg; try { cfg = JSON.parse(confEl.textContent); } catch (e) { return; }
    var variants = (cfg.variants || []).filter(Boolean);
    if (!variants.length) return;

    var idx = 0;

    var variantsHTML = variants.map(function (v, i) {
      return '<button class="pl-variant' + (i === 0 ? " active" : "") + '" data-i="' + i + '" type="button">' + escHtml(v.label || ("Variant " + (i + 1))) + "</button>";
    }).join("");

    pad.innerHTML =
      '<div class="pl-head">' + escHtml(cfg.title || "Prompt lab") + "</div>" +
      '<div class="pl-variants">' + variantsHTML + "</div>" +
      '<div class="pl-grid">' +
        '<div class="pl-col">' +
          '<div class="pl-col-label">✎ Your prompt</div>' +
          '<textarea class="pl-prompt" spellcheck="false" aria-label="Prompt"></textarea>' +
          '<div class="pl-ask"><button class="btn btn-primary pl-askbtn" type="button">Ask Claude (simulated)</button><span class="pl-edited" hidden>edited — reply is illustrative</span></div>' +
        "</div>" +
        '<div class="pl-col">' +
          '<div class="pl-col-label">✦ Claude\'s reply</div>' +
          '<div class="pl-reply">' +
            '<div class="pl-reply-head"><span class="pl-mark">✦</span><span class="pl-who">Claude</span><span class="pl-quality" hidden></span></div>' +
            '<div class="pl-reply-body placeholder">Pick a prompt above, then press “Ask Claude”.</div>' +
          "</div>" +
        "</div>" +
      "</div>" +
      '<div class="pl-notes"></div>' +
      confEl.outerHTML; // keep config inert in the DOM

    var variantBtns = pad.querySelectorAll(".pl-variant");
    var promptEl = pad.querySelector(".pl-prompt");
    var askBtn = pad.querySelector(".pl-askbtn");
    var editedEl = pad.querySelector(".pl-edited");
    var qualityEl = pad.querySelector(".pl-quality");
    var bodyEl = pad.querySelector(".pl-reply-body");
    var notesEl = pad.querySelector(".pl-notes");

    function loadVariant(i) {
      idx = i;
      variantBtns.forEach(function (b) { b.classList.toggle("active", +b.getAttribute("data-i") === i); });
      promptEl.value = variants[i].prompt || "";
      editedEl.hidden = true;
      bodyEl.className = "pl-reply-body placeholder";
      bodyEl.textContent = "Press “Ask Claude” to see the reply for this prompt.";
      qualityEl.hidden = true;
      notesEl.classList.remove("show");
    }

    function ask() {
      var v = variants[idx];
      var edited = promptEl.value.trim() !== (v.prompt || "").trim();
      editedEl.hidden = !edited;
      // simulate a brief think, then reveal the authored reply
      bodyEl.className = "pl-reply-body placeholder";
      bodyEl.textContent = "…";
      askBtn.disabled = true;
      var reveal = function () {
        bodyEl.className = "pl-reply-body";
        bodyEl.textContent = v.response || "";
        if (v.quality) { qualityEl.hidden = false; qualityEl.className = "pl-quality " + v.quality; qualityEl.textContent = QLABEL[v.quality] || v.quality; }
        if (v.notes) { notesEl.innerHTML = '<span class="pl-ntag">why</span>' + escHtml(v.notes).replace(/\n/g, "<br>"); notesEl.classList.add("show"); }
        askBtn.disabled = false;
      };
      if (REDUCED) reveal(); else setTimeout(reveal, 380);
    }

    variantBtns.forEach(function (b) { b.addEventListener("click", function () { loadVariant(+b.getAttribute("data-i")); }); });
    askBtn.addEventListener("click", ask);
    promptEl.addEventListener("input", function () { editedEl.hidden = promptEl.value.trim() === (variants[idx].prompt || "").trim(); });

    loadVariant(0);
  }

  function onReady(fn) { if (document.readyState !== "loading") fn(); else document.addEventListener("DOMContentLoaded", fn); }
  onReady(function () { document.querySelectorAll(".promptlab").forEach(build); });
})();
