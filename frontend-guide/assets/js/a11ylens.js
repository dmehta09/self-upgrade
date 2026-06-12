/* ============================================================
   Frontend Field Guide — a11y lens
   Shows what assistive tech actually "sees": tab between markup
   variants (div-soup vs semantic) and compare the markup with the
   accessibility tree it produces — role + accessible name per node,
   with nameless/generic nodes flagged. Tabs are built by the engine;
   ←/→ cycles variants. Theme-aware, offline, no dependencies.

   Authoring (the page author writes ONLY this):
     <figure class="viz a11ylens" data-a11ylens>
       <figcaption class="viz-title">…</figcaption>
       <script type="application/json" class="al-config">{…}</script>
       <p class="viz-fallback">Static fallback text for no-JS.</p>
     </figure>

   Config: { views:[{ id, label, verdict:"ok"|"bad", note,
     code:[lines…],                          — the markup, pre-escaped text
     tree:[{ role, name?, depth, flag? }] }] — the computed a11y tree;
                                               flag = short problem text
   ============================================================ */
(function () {
  "use strict";
  function el(tag, cls, txt) { var e = document.createElement(tag); if (cls) e.className = cls; if (txt != null) e.textContent = txt; return e; }
  function onReady(fn) { if (document.readyState !== "loading") fn(); else document.addEventListener("DOMContentLoaded", fn); }

  function build(fig) {
    var confEl = fig.querySelector(".al-config");
    if (!confEl) return;
    var cfg; try { cfg = JSON.parse(confEl.textContent); } catch (e) { return; }  // bad JSON → static fallback stays
    var views = cfg.views || [];
    if (!views.length) return;

    var fallback = fig.querySelector(".viz-fallback");
    if (fallback) fallback.style.display = "none";

    /* ---- tabs ---- */
    var tabs = el("div", "al-tabs");
    var tabEls = views.map(function (v, k) {
      var b = el("button", "al-tab", v.label); b.type = "button";
      b.addEventListener("click", function () { go(k); });
      tabs.appendChild(b);
      return b;
    });

    /* ---- stage: markup pane + a11y-tree pane ---- */
    var stage = el("div", "viz-stage al-stage");
    var panes = el("div", "al-panes");
    var codePane = el("div", "al-pane");
    codePane.appendChild(el("div", "al-pane-h", "markup"));
    var codeBody = el("div", "al-code"); codePane.appendChild(codeBody);
    var treePane = el("div", "al-pane");
    treePane.appendChild(el("div", "al-pane-h", "accessibility tree"));
    var treeBody = el("div", "al-tree"); treePane.appendChild(treeBody);
    panes.appendChild(codePane); panes.appendChild(treePane);
    stage.appendChild(panes);

    var foot = el("div", "al-foot");
    var verdict = el("span", "al-verdict");
    var note = el("span", "viz-caption al-note");
    foot.appendChild(verdict); foot.appendChild(note);

    fig.appendChild(tabs); fig.appendChild(stage); fig.appendChild(foot);

    var cur = 0;

    function paint() {
      var v = views[cur];
      tabEls.forEach(function (t, k) { t.classList.toggle("on", k === cur); });

      codeBody.innerHTML = "";
      (v.code || []).forEach(function (line, i) {
        var row = el("div", "al-line");
        row.appendChild(el("span", "al-ln", String(i + 1)));
        row.appendChild(el("span", "al-lt", line === "" ? " " : line));
        codeBody.appendChild(row);
      });

      treeBody.innerHTML = "";
      (v.tree || []).forEach(function (n) {
        var row = el("div", "al-node" + (n.flag ? " bad" : ""));
        row.style.paddingLeft = (10 + (n.depth || 0) * 18) + "px";
        row.appendChild(el("span", "al-role", n.role));
        if (n.name) row.appendChild(el("span", "al-name", "“" + n.name + "”"));
        if (n.flag) row.appendChild(el("span", "al-flag", "⚠ " + n.flag));
        treeBody.appendChild(row);
      });

      verdict.textContent = v.verdict === "ok" ? "✓ screen-reader friendly" : "✗ invisible to assistive tech";
      verdict.className = "al-verdict " + (v.verdict === "ok" ? "ok" : "bad");
      note.textContent = v.note || "";
    }
    function go(n) { cur = (n + views.length) % views.length; paint(); }

    fig.setAttribute("tabindex", "0");
    fig.addEventListener("keydown", function (e) {
      if (e.key === "ArrowRight") { e.preventDefault(); go(cur + 1); }
      else if (e.key === "ArrowLeft") { e.preventDefault(); go(cur - 1); }
    });

    paint();
  }

  onReady(function () { document.querySelectorAll(".a11ylens[data-a11ylens]").forEach(build); });
})();
