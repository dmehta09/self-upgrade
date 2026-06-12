/* ============================================================
   A Philosophy of Software Design — depth gauge
   For each <figure class="depthgauge" data-depthgauge>: reads the
   JSON in its .dg-config and renders a set of module designs you can
   flip between. Each design shows its interface (the methods a caller
   must learn), two bars — interface cost vs functionality delivered —
   a depth readout (benefit ÷ cost), and a deep/shallow verdict.
   The tab chips are built by this script; keys ←/→ cycle designs.
   Config: { designs:[{ id, label, iface:[names…], cost (0–100),
             power (0–100), verdict:"deep"|"shallow", note }] }
   ============================================================ */
(function () {
  "use strict";
  function onReady(fn) {
    if (document.readyState !== "loading") fn();
    else document.addEventListener("DOMContentLoaded", fn);
  }

  onReady(function () {
    document.querySelectorAll(".depthgauge[data-depthgauge]").forEach(function (host) {
      var cfgEl = host.querySelector(".dg-config");
      var stage = host.querySelector(".dg-stage");
      if (!cfgEl || !stage) return;
      var cfg;
      try { cfg = JSON.parse(cfgEl.textContent); } catch (e) { return; }
      var designs = cfg.designs || [];
      if (!designs.length) return;

      var tabs = document.createElement("div");
      tabs.className = "dg-tabs";
      tabs.setAttribute("role", "tablist");
      host.insertBefore(tabs, stage);

      stage.innerHTML =
        "<div class=\"dg-iface\"><span class=\"dg-klabel\">interface — what a caller must learn</span><div class=\"dg-methods\"></div></div>" +
        "<div class=\"dg-bars\">" +
        "  <div class=\"dg-row\"><span class=\"dg-blabel\">interface cost</span><span class=\"dg-track\"><span class=\"dg-fill dg-cost\"></span></span></div>" +
        "  <div class=\"dg-row\"><span class=\"dg-blabel\">functionality</span><span class=\"dg-track\"><span class=\"dg-fill dg-power\"></span></span></div>" +
        "</div>" +
        "<div class=\"dg-readout\"><span class=\"dg-depth\"></span><span class=\"dg-verdict\"></span></div>" +
        "<p class=\"dg-note\" aria-live=\"polite\"></p>";

      var tabEls = [];
      designs.forEach(function (d, idx) {
        var b = document.createElement("button");
        b.type = "button";
        b.className = "dg-tab";
        b.textContent = d.label;
        b.addEventListener("click", function () { show(idx); });
        tabs.appendChild(b);
        tabEls.push(b);
      });

      var cur = 0;
      function show(idx) {
        cur = (idx + designs.length) % designs.length;
        var d = designs[cur];
        tabEls.forEach(function (t, j) { t.classList.toggle("active", j === cur); });

        var methods = stage.querySelector(".dg-methods");
        methods.innerHTML = "";
        d.iface.forEach(function (m) {
          var s = document.createElement("span");
          s.className = "dg-m";
          s.textContent = m;
          methods.appendChild(s);
        });

        stage.querySelector(".dg-cost").style.width = d.cost + "%";
        stage.querySelector(".dg-power").style.width = d.power + "%";

        var ratio = d.cost ? (d.power / d.cost) : 0;
        stage.querySelector(".dg-depth").textContent = "depth ≈ ×" + (Math.round(ratio * 10) / 10);
        var v = stage.querySelector(".dg-verdict");
        v.textContent = d.verdict === "deep" ? "✓ deep" : "✕ shallow";
        v.className = "dg-verdict " + (d.verdict === "deep" ? "ok" : "bad");
        stage.querySelector(".dg-note").textContent = d.note || "";
      }

      host.addEventListener("keydown", function (e) {
        if (e.key === "ArrowRight") { e.preventDefault(); show(cur + 1); }
        else if (e.key === "ArrowLeft") { e.preventDefault(); show(cur - 1); }
      });

      show(0);
    });
  });
})();
