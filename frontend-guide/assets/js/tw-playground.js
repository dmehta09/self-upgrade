/* ============================================================
   Frontend Field Guide — TAILWIND PLAYGROUND
   A tiny, dependency-free, INTERACTIVE engine: the user types
   Tailwind utility classes into an input and a live preview box
   updates by simply receiving them as its className. It does NOT
   compile Tailwind — a curated utility subset is precompiled in
   frontend.css, scoped to `.twplay`. The engine just sets
   `.tw-preview`'s class string; the CSS does the rest. Presets
   are one-click starting points. Offline, theme-aware. No build.

   Authoring:
     <figure class="viz twplay" data-twplay>
       <figcaption class="viz-title">…</figcaption>
       <script type="application/json" class="tw-config">
         { "title":"…",
           "start":"flex items-center justify-center gap-3 p-4 …",
           "preview":"<div class=\"twp-box\">A</div>…",
           "presets":[ { "label":"Card","classes":"flex flex-col …" } ],
           "note":"Illustrative subset — …" }
       </script>
       <p class="viz-fallback">Static fallback for no-JS.</p>
     </figure>

   config.preview is trusted, authored HTML (innerHTML is fine).
   ============================================================ */
(function () {
  "use strict";

  function el(tag, cls, txt) { var e = document.createElement(tag); if (cls) e.className = cls; if (txt != null) e.textContent = txt; return e; }

  function build(fig) {
    var confEl = fig.querySelector(".tw-config");
    if (!confEl) return;
    var cfg; try { cfg = JSON.parse(confEl.textContent); } catch (e) { return; }   // static fallback stays
    if (!cfg.preview) return;

    var titleEl = fig.querySelector(".viz-title");
    if (titleEl && cfg.title) titleEl.textContent = cfg.title;

    /* ---- control bar: input (seeded with config.start) + one button per preset ---- */
    var bar = el("div", "tw-bar");
    var input = el("input", "tw-input");
    input.type = "text";
    input.value = cfg.start || "";
    input.setAttribute("spellcheck", "false");
    input.setAttribute("aria-label", "Tailwind utility classes");
    bar.appendChild(input);

    (cfg.presets || []).forEach(function (p) {
      var btn = el("button", "tw-preset", p.label || "");
      btn.type = "button";
      btn.setAttribute("data-classes", p.classes || "");
      btn.addEventListener("click", function () { input.value = btn.getAttribute("data-classes"); apply(); });
      bar.appendChild(btn);
    });

    /* ---- stage holding the live preview node (authored inner HTML) ---- */
    var stage = el("div", "tw-stage");
    var preview = el("div", "tw-preview");
    preview.innerHTML = cfg.preview;   // trusted authored markup
    stage.appendChild(preview);

    /* ---- the one job: hand the typed string to .tw-preview as its className ---- */
    function apply() { preview.className = "tw-preview " + input.value; }
    input.addEventListener("input", apply);

    fig.appendChild(bar);
    fig.appendChild(stage);

    /* ---- note: a .callout.note, falling back to a plain .tw-note paragraph ---- */
    if (cfg.note) {
      var co = el("div", "callout note");
      var ic = el("div", "co-ic");
      ic.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 8h.01"/><path d="M11 12h1v4h1"/></svg>';
      var body = el("div", "co-body");
      body.appendChild(el("div", "co-title", "Illustrative only"));
      body.appendChild(el("p", null, cfg.note));
      co.appendChild(ic); co.appendChild(body);
      fig.appendChild(co);
    }

    apply();   // paint config.start immediately
    var fb = fig.querySelector(".viz-fallback");
    if (fb) fb.style.display = "none";
  }

  function onReady(fn) { if (document.readyState !== "loading") fn(); else document.addEventListener("DOMContentLoaded", fn); }
  onReady(function () { document.querySelectorAll(".twplay").forEach(build); });
})();
