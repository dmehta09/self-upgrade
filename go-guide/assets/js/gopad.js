/* ============================================================
   Go — a visual guide · GOPAD
   An editable Go snippet with hand-authored expected output.
   Real Go can't compile in the browser, and the Go Playground
   /compile API sends no CORS header (so it's unreachable from a
   file:// page) — so gopad is offline-first: read the code,
   predict the result, press Run to reveal the authored output.

   Authoring (code + output live in text/plain scripts, so raw
   <, <-, <= need no escaping and the verifier's <code> check is
   never triggered):

     <div class="gopad" data-gopad data-file="main.go">
       <script type="text/plain" class="gp-code">package main
   import "fmt"
   func main() { fmt.Println("hi, gophers") }</script>
       <script type="text/plain" class="gp-output">hi, gophers</script>
     </div>
   ============================================================ */
(function () {
  "use strict";

  function dedent(s) { return String(s == null ? "" : s).replace(/^\n/, "").replace(/\s+$/, ""); }
  function el(tag, cls, txt) { var e = document.createElement(tag); if (cls) e.className = cls; if (txt != null) e.textContent = txt; return e; }

  function wire(pad) {
    var codeEl = pad.querySelector(".gp-code");
    if (!codeEl) return;
    var outEl = pad.querySelector(".gp-output");
    var code = dedent(codeEl.textContent);
    var output = dedent(outEl ? outEl.textContent : "");
    var file = pad.getAttribute("data-file") || "main.go";
    pad.innerHTML = "";

    /* head: dot · filename · Reset · Run */
    var head = el("div", "gp-head");
    head.appendChild(el("span", "gp-dot"));
    head.appendChild(el("span", "gp-file", file));
    head.appendChild(el("span", "gp-spacer"));
    var resetBtn = el("button", "gp-btn gp-reset", "Reset");
    var runBtn = el("button", "gp-btn gp-run", "▶ Run");
    resetBtn.type = runBtn.type = "button";
    head.appendChild(resetBtn);
    head.appendChild(runBtn);
    pad.appendChild(head);

    /* editor */
    var editor = el("textarea", "gp-editor");
    editor.value = code;
    editor.setAttribute("spellcheck", "false");
    editor.setAttribute("autocapitalize", "off");
    editor.setAttribute("autocomplete", "off");
    editor.setAttribute("aria-label", "Editable Go code — " + file);
    // grow to fit initial content
    editor.rows = Math.min(26, Math.max(4, code.split("\n").length + 1));
    pad.appendChild(editor);

    /* output (hidden until Run — predict, then reveal) */
    var outWrap = el("div", "gp-out");
    outWrap.appendChild(el("div", "gp-out-head", "output"));
    var pre = el("pre");
    pre.appendChild(el("span", "gp-ok", output === "" ? "(no output)" : output));
    outWrap.appendChild(pre);
    outWrap.appendChild(el("div", "gp-note", "Authored output — Go compiles on your machine (go run main.go), not in the browser."));
    pad.appendChild(outWrap);

    runBtn.addEventListener("click", function () { outWrap.classList.add("show"); });
    resetBtn.addEventListener("click", function () { editor.value = code; outWrap.classList.remove("show"); });
  }

  function onReady(fn) { if (document.readyState !== "loading") fn(); else document.addEventListener("DOMContentLoaded", fn); }
  onReady(function () { document.querySelectorAll("[data-gopad]").forEach(wire); });
})();
