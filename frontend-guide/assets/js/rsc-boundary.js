/* ============================================================
   Frontend Field Guide — RSC BOUNDARY
   A tiny, dependency-free, INTERACTIVE engine that draws a React
   component tree and lets you flip a node's "use client" directive.
   The engine recomputes which components stay on the server and
   which ship to the browser bundle — a client parent forces its
   whole subtree to be client — then repaints two meters.
   Offline, theme-aware (reads --accent etc. via CSS). No playback.

   Authoring:
     <figure class="viz rscviz" data-rscviz>
       <figcaption class="viz-title">…</figcaption>
       <script type="application/json" class="rsc-config">
         { "title":"…",
           "tree": { "id":"Page","kind":"server","children":[
              { "id":"AddToCart","kind":"client","toggle":true,
                "children":[ { "id":"QtyStepper","kind":"client" } ] } ] },
           "kb": 14, "note":"…" }
       </script>
       <p class="viz-fallback">Static fallback for no-JS.</p>
     </figure>

   kb = approx KB of JS each client component contributes (default 12).
   ============================================================ */
(function () {
  "use strict";

  function el(tag, cls, txt) { var e = document.createElement(tag); if (cls) e.className = cls; if (txt != null) e.textContent = txt; return e; }

  /* recursively set node._eff = effective kind ("server"|"client").
     A client parent forces every descendant to be client. */
  function classify(node, parentClient) {
    var isClient = parentClient || node.kind === "client";
    node._eff = isClient ? "client" : "server";
    (node.children || []).forEach(function (c) { classify(c, isClient); });
  }

  /* walk the tree, tallying effective server/client/total counts */
  function tally(node, acc) {
    acc.total++;
    if (node._eff === "client") acc.client++; else acc.server++;
    (node.children || []).forEach(function (c) { tally(c, acc); });
  }

  function Engine(fig) {
    var confEl = fig.querySelector(".rsc-config");
    if (!confEl) return;
    var cfg; try { cfg = JSON.parse(confEl.textContent); } catch (e) { return; }   // static fallback stays
    var root = cfg.tree;
    if (!root || !root.id) return;
    var kb = typeof cfg.kb === "number" ? cfg.kb : 12;
    var initial = {};   // id -> original stored kind, for reset

    var titleEl = fig.querySelector(".viz-title");
    if (titleEl && cfg.title) titleEl.textContent = cfg.title;

    /* ---- stage scaffold ---- */
    var stage = el("div", "viz-stage");
    var tree = el("div", "rsc-tree");
    stage.appendChild(tree);

    /* server + client meters */
    var meters = el("div", "rsc-meters");
    function meter(kind, label) {
      var m = el("div", "rsc-meter " + kind);
      var lab = el("div", "rsc-mlabel");
      lab.appendChild(el("span", null, label));
      var val = el("span", "rsc-val");
      lab.appendChild(val);
      var bar = el("div", "rsc-bar");
      var fill = el("div", "rsc-fill");
      bar.appendChild(fill);
      m.appendChild(lab); m.appendChild(bar);
      meters.appendChild(m);
      return { val: val, fill: fill };
    }
    var mServer = meter("server", "Runs on server");
    var mClient = meter("client", "Ships to browser");
    stage.appendChild(meters);

    /* note: a .callout.note, falling back to .viz-note */
    if (cfg.note) {
      var co = el("div", "callout note");
      var ic = el("div", "co-ic");
      ic.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 8h.01"/><path d="M11 12h1v4h1"/></svg>';
      var body = el("div", "co-body");
      body.appendChild(el("div", "co-title", "Heads up"));
      body.appendChild(el("p", null, cfg.note));
      co.appendChild(ic); co.appendChild(body);
      stage.appendChild(co);
    }

    /* ---- build node DOM once; keep refs for cheap repaint ---- */
    var entries = [];   // { node, wrap (.rsc-node), kindEl }

    function buildNode(node) {
      initial[node.id] = node.kind;
      var wrap = el("div", "rsc-node");
      wrap.setAttribute("data-id", node.id);
      var box = el("div", "rsc-box");
      box.appendChild(el("span", "rsc-name", node.id));
      var kindEl = el("span", "rsc-kind");
      box.appendChild(kindEl);
      wrap.appendChild(box);
      entries.push({ node: node, wrap: wrap, kindEl: kindEl });

      if (node.toggle) {
        box.classList.add("can-toggle");
        box.addEventListener("click", function () {
          node.kind = node.kind === "client" ? "server" : "client";
          repaint();
        });
      }
      if (node.children && node.children.length) {
        var kids = el("div", "rsc-kids");
        node.children.forEach(function (c) { kids.appendChild(buildNode(c)); });
        wrap.appendChild(kids);
      }
      return wrap;
    }
    tree.appendChild(buildNode(root));

    /* ---- recompute effective kinds + repaint classes & meters ---- */
    function repaint() {
      classify(root, false);
      entries.forEach(function (en) {
        var eff = en.node._eff;
        en.wrap.classList.toggle("is-server", eff === "server");
        en.wrap.classList.toggle("is-client", eff === "client");
        en.kindEl.textContent = eff;
      });
      var acc = { total: 0, server: 0, client: 0 };
      tally(root, acc);
      var t = acc.total || 1;
      mServer.fill.style.width = (acc.server / t * 100) + "%";
      mClient.fill.style.width = (acc.client / t * 100) + "%";
      var noun = function (n) { return n + (n === 1 ? " component" : " components"); };
      mServer.val.textContent = noun(acc.server);
      mClient.val.textContent = noun(acc.client) + " · ~" + (acc.client * kb) + " KB JS";
    }

    /* optional reset: restore each node's originally-authored kind */
    fig.reset = function () {
      entries.forEach(function (en) { en.node.kind = initial[en.node.id]; });
      repaint();
    };

    repaint();
    fig.appendChild(stage);
    var fb = fig.querySelector(".viz-fallback");
    if (fb) fb.style.display = "none";
  }

  function onReady(fn) { if (document.readyState !== "loading") fn(); else document.addEventListener("DOMContentLoaded", fn); }
  onReady(function () { document.querySelectorAll(".rscviz").forEach(Engine); });
})();
