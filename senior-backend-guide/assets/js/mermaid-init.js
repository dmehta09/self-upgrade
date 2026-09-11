/* ============================================================
   DSA Field Guide — Mermaid init (theme-aware, CDN once)
   Renders <pre class="mermaid"> inside .mermaid-wrap.
   Offline: no-ops if the CDN script failed to load.
   ============================================================ */
(function () {
  var CDN = "https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.min.js";
  var loading = null;

  function theme() {
    return document.documentElement.getAttribute("data-theme") === "light" ? "neutral" : "dark";
  }

  function stash() {
    document.querySelectorAll("pre.mermaid").forEach(function (el) {
      if (!el.getAttribute("data-original")) el.setAttribute("data-original", el.textContent.trim());
    });
  }

  function restore() {
    document.querySelectorAll("pre.mermaid").forEach(function (el) {
      var src = el.getAttribute("data-original");
      if (src) el.textContent = src;
      el.removeAttribute("data-processed");
      el.removeAttribute("data-mermaid-processed");
    });
  }

  function render() {
    if (!window.mermaid || !document.querySelector("pre.mermaid")) return;
    stash();
    restore();
    try {
      mermaid.initialize({
        startOnLoad: false,
        theme: theme(),
        securityLevel: "loose",
        flowchart: { curve: "basis", htmlLabels: true },
      });
      mermaid.run({ querySelector: "pre.mermaid" });
    } catch (e) {
      /* leave source text visible if render fails */
    }
  }

  function loadThenRender() {
    if (window.mermaid) {
      render();
      return;
    }
    if (!document.querySelector("pre.mermaid")) return;
    if (loading) {
      loading.then(render).catch(function () {});
      return;
    }
    loading = new Promise(function (resolve, reject) {
      var s = document.createElement("script");
      s.src = CDN;
      s.async = true;
      s.onload = function () { resolve(); };
      s.onerror = function () { reject(new Error("mermaid CDN")); };
      document.head.appendChild(s);
    });
    loading.then(render).catch(function () {});
  }

  function onReady(fn) {
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", fn);
    else fn();
  }

  onReady(function () {
    loadThenRender();
    /* Re-render when a walkthrough <details> opens (diagrams sized when hidden fail) */
    document.addEventListener("toggle", function (ev) {
      var t = ev.target;
      if (t && t.matches && t.matches("details.sac, details.deeper.walkthrough") && t.open) {
        setTimeout(render, 40);
      }
    }, true);
    var btn = document.getElementById("themeToggle");
    if (btn) btn.addEventListener("click", function () { setTimeout(render, 60); });
  });
})();
