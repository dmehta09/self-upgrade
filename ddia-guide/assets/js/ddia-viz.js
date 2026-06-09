/* ============================================================
   Designing Data-Intensive Applications — ddia-viz (the guide's own engine)
   A small multi-scene visualizer. Each instance is a
     <figure class="ddiaviz" data-ddiaviz>
       <figcaption class="dv-title">…</figcaption>
       <div class="dv-body"><p class="viz-fallback">… static fallback …</p></div>
       <script type="application/json" class="dv-config">{ "scene": "…", … }</script>
     </figure>
   The config's "scene" picks the renderer. Phase 1 ships two:
     • "datamodel"   — the SAME entity shown as relational ⇄ document ⇄ graph
     • "percentiles" — a latency sample with p50/p95/p99 + tail-latency
                       amplification as a request fans out to N backends
   Both faces/views stay reachable; everything reads CSS vars, so light/dark
   + per-module accents work for free. Honors prefers-reduced-motion via CSS.
   Phase 2 adds "storage" (LSM↔B-tree); Phase 3 adds "ring" (consistent
   hashing — keys and nodes on a circle, owner = first node clockwise, with
   a slider that shows only a fraction of keys move when the cluster grows).
   (A future "quorum" w+r>n scene slots in the same way — new case in init().)
   ============================================================ */
(function () {
  "use strict";
  var SVGNS = "http://www.w3.org/2000/svg";
  function el(t, c, x) { var e = document.createElement(t); if (c) e.className = c; if (x != null) e.textContent = x; return e; }
  function svg(t, attrs) { var e = document.createElementNS(SVGNS, t); for (var k in attrs) e.setAttribute(k, attrs[k]); return e; }
  function esc(s) { return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"); }

  /* ---------- scene: data models ---------- */
  function renderDataModel(body, cfg) {
    var views = cfg.views || {};
    var caps = cfg.captions || {};
    var order = ["relational", "document", "graph"];
    var labels = { relational: "Relational", document: "Document", graph: "Graph" };

    var tabs = el("div", "dv-tabs");
    var stage = el("div", "dv-stage");
    var cap = el("div", "dv-caption");
    var btns = {};

    function show(which) {
      order.forEach(function (k) { if (btns[k]) btns[k].classList.toggle("active", k === which); });
      stage.innerHTML = "";
      if (which === "relational") stage.appendChild(renderRelational(views.relational || {}));
      else if (which === "document") stage.appendChild(renderDocument(views.document || {}));
      else stage.appendChild(renderGraph(views.graph || {}));
      cap.innerHTML = "<b>" + esc(labels[which]) + ".</b> " + (caps[which] || "");
    }

    order.forEach(function (k) {
      if (!views[k]) return;
      var b = el("button", "dv-tab", labels[k]); b.type = "button";
      b.addEventListener("click", function () { show(k); });
      tabs.appendChild(b); btns[k] = b;
    });

    body.appendChild(tabs);
    body.appendChild(stage);
    body.appendChild(cap);
    show(order.find(function (k) { return views[k]; }) || "relational");
  }

  function renderRelational(rel) {
    var wrap = el("div", "dv-tables");
    (rel.tables || []).forEach(function (t) {
      var card = el("div", "dv-table");
      card.appendChild(el("div", "dv-tname", t.name));
      var table = el("table");
      var thead = el("thead"), htr = el("tr");
      (t.cols || []).forEach(function (c) {
        var th = el("th", /_id$|^id$/.test(c) ? "dv-fk" : null, c);
        htr.appendChild(th);
      });
      thead.appendChild(htr); table.appendChild(thead);
      var tb = el("tbody");
      (t.rows || []).forEach(function (r) {
        var tr = el("tr");
        r.forEach(function (cell, ci) {
          var col = (t.cols || [])[ci] || "";
          tr.appendChild(el("td", /_id$|^id$/.test(col) ? "dv-fk" : null, cell));
        });
        tb.appendChild(tr);
      });
      table.appendChild(tb); card.appendChild(table);
      wrap.appendChild(card);
    });
    return wrap;
  }

  function renderDocument(doc) {
    var pre = el("pre", "dv-json");
    pre.innerHTML = jsonHTML(doc, 0);
    var box = el("div", "dv-docbox");
    box.appendChild(pre);
    return box;
  }
  // tiny JSON pretty-printer with token spans (keys/strings/numbers)
  function jsonHTML(v, depth) {
    var pad = "  ".repeat(depth), pad1 = "  ".repeat(depth + 1);
    if (Array.isArray(v)) {
      if (!v.length) return "[]";
      var items = v.map(function (x) { return pad1 + jsonHTML(x, depth + 1); });
      return "[\n" + items.join(",\n") + "\n" + pad + "]";
    }
    if (v && typeof v === "object") {
      var keys = Object.keys(v);
      if (!keys.length) return "{}";
      var rows = keys.map(function (k) {
        return pad1 + '<span class="j-k">"' + esc(k) + '"</span>: ' + jsonHTML(v[k], depth + 1);
      });
      return "{\n" + rows.join(",\n") + "\n" + pad + "}";
    }
    if (typeof v === "number") return '<span class="j-n">' + v + "</span>";
    if (typeof v === "boolean" || v === null) return '<span class="j-n">' + v + "</span>";
    return '<span class="j-s">"' + esc(v) + '"</span>';
  }

  function renderGraph(g) {
    var nodes = g.nodes || [], edges = g.edges || [];
    var W = 160, H = Math.max(78, nodes.length * 20);
    var s = svg("svg", { viewBox: "0 0 " + W + " " + H, class: "dv-graph", role: "img" });
    // person nodes on the left, everything else stacked on the right
    var people = nodes.filter(function (n) { return n.kind === "person"; });
    var others = nodes.filter(function (n) { return n.kind !== "person"; });
    var pos = {};
    people.forEach(function (n, i) { pos[n.id] = { x: 30, y: H * (i + 1) / (people.length + 1) }; });
    others.forEach(function (n, i) { pos[n.id] = { x: 126, y: H * (i + 1) / (others.length + 1) }; });

    edges.forEach(function (e) {
      var a = pos[e.from], b = pos[e.to];
      if (!a || !b) return;
      s.appendChild(svg("line", { x1: a.x, y1: a.y, x2: b.x, y2: b.y, class: "dv-gedge" }));
      if (e.label) {
        var t = svg("text", { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 - 2, class: "dv-gelabel", "text-anchor": "middle" });
        t.textContent = e.label;
        s.appendChild(t);
      }
    });
    nodes.forEach(function (n) {
      var p = pos[n.id]; if (!p) return;
      var gnode = svg("g", { class: "dv-gnode k-" + (n.kind || "node") });
      gnode.appendChild(svg("circle", { cx: p.x, cy: p.y, r: 4.4 }));
      var t = svg("text", { x: p.x, y: p.y - 6.5, "text-anchor": "middle", class: "dv-gtext" });
      t.textContent = n.label;
      gnode.appendChild(t);
      s.appendChild(gnode);
    });
    var box = el("div", "dv-graphbox");
    box.appendChild(s);
    return box;
  }

  /* ---------- scene: percentiles + tail-latency amplification ---------- */
  function quantile(sorted, q) {
    if (!sorted.length) return 0;
    var idx = q * (sorted.length - 1);
    var lo = Math.floor(idx), hi = Math.ceil(idx);
    if (lo === hi) return sorted[lo];
    return sorted[lo] + (sorted[hi] - sorted[lo]) * (idx - lo);
  }

  function renderPercentiles(body, cfg) {
    var samples = (cfg.samples || []).slice().sort(function (a, b) { return a - b; });
    if (!samples.length) { body.appendChild(el("p", "viz-fallback", "No samples.")); return; }
    var unit = cfg.unit || "ms";
    var maxV = samples[samples.length - 1];
    var mean = samples.reduce(function (a, b) { return a + b; }, 0) / samples.length;
    var p50 = quantile(samples, 0.50), p95 = quantile(samples, 0.95), p99 = quantile(samples, 0.99);
    var maxFan = cfg.maxFanout || 100;

    var W = 100, H = 34;
    var s = svg("svg", { viewBox: "0 0 " + W + " " + H, class: "dv-strip", role: "img" });
    function X(v) { return 3 + (v / maxV) * 94; }
    // sample ticks
    samples.forEach(function (v) {
      s.appendChild(svg("line", { x1: X(v), y1: 20, x2: X(v), y2: 26, class: "dv-tick" }));
    });
    // baseline
    s.appendChild(svg("line", { x1: 3, y1: 26, x2: 97, y2: 26, class: "dv-axis" }));
    function marker(v, cls, label) {
      var g = svg("g", { class: "dv-marker " + cls });
      g.appendChild(svg("line", { x1: X(v), y1: 6, x2: X(v), y2: 26 }));
      var t = svg("text", { x: X(v), y: 4.5, "text-anchor": "middle", class: "dv-mlabel" });
      t.textContent = label; g.appendChild(t);
      return g;
    }
    s.appendChild(marker(p50, "m-p50", "p50"));
    s.appendChild(marker(p95, "m-p95", "p95"));
    s.appendChild(marker(p99, "m-p99", "p99"));
    var fanG = marker(p99, "m-fan", "");
    s.appendChild(fanG);
    body.appendChild(s);

    // stats
    var stats = el("div", "dv-stats");
    function stat(label, cls) { var d = el("div", "dv-stat " + cls); d.appendChild(el("span", "dv-slabel", label)); var v = el("b"); d.appendChild(v); return { d: d, v: v }; }
    var sMean = stat("mean", "s-mean"), s50 = stat("p50 (median)", "s-p50"), s95 = stat("p95", "s-p95"), s99 = stat("p99", "s-p99");
    [sMean, s50, s95, s99].forEach(function (o) { stats.appendChild(o.d); });
    sMean.v.textContent = Math.round(mean) + unit;
    s50.v.textContent = Math.round(p50) + unit;
    s95.v.textContent = Math.round(p95) + unit;
    s99.v.textContent = Math.round(p99) + unit;
    body.appendChild(stats);

    // fan-out control
    var ctrl = el("div", "dv-fanctrl");
    var lab = el("label", "dv-fanlabel");
    lab.appendChild(el("span", null, "Fan-out — a request waits on "));
    var nOut = el("b", "dv-fanN", "1");
    lab.appendChild(nOut);
    lab.appendChild(el("span", null, " parallel backends"));
    ctrl.appendChild(lab);
    var slider = el("input", "dv-fanrange");
    slider.type = "range"; slider.min = "1"; slider.max = String(maxFan); slider.value = "1";
    slider.setAttribute("aria-label", "Number of backend services a request fans out to");
    ctrl.appendChild(slider);
    var out = el("div", "dv-fanout");
    ctrl.appendChild(out);
    body.appendChild(ctrl);

    function update() {
      var n = parseInt(slider.value, 10) || 1;
      nOut.textContent = n;
      // tail of the SLOWEST of N independent calls: P(all<x)=CDF(x)^N=0.99 → CDF(x)=0.99^(1/N)
      var effQ = Math.pow(0.99, 1 / n);
      var effP99 = quantile(samples, effQ);
      fanG.querySelector("line").setAttribute("x1", X(effP99));
      fanG.querySelector("line").setAttribute("x2", X(effP99));
      var lbl = fanG.querySelector("text"); lbl.setAttribute("x", X(effP99)); lbl.textContent = n > 1 ? "tail" : "";
      out.innerHTML = n === 1
        ? "A single call: the request's tail <b>is</b> p99 = " + Math.round(p99) + unit + "."
        : "Wait on <b>" + n + "</b> calls and the request is slow if <i>any one</i> is slow — its effective p99 climbs to <b class=\"dv-amp\">" + Math.round(effP99) + unit + "</b> (≈ the " + (effQ * 100).toFixed(2) + "th percentile of one call).";
    }
    slider.addEventListener("input", update);
    update();
  }

  /* ---------- scene: storage engines (LSM-tree vs B-tree) ---------- */
  function renderStorage(body, cfg) {
    var caps = cfg.captions || {};
    var labels = { lsm: "LSM-tree", btree: "B-tree" };
    var order = ["lsm", "btree"];
    var tabs = el("div", "dv-tabs"), stage = el("div", "dv-stage"), cap = el("div", "dv-caption"), btns = {};

    function box(title, sub, cls) {
      var b = el("div", "dv-box" + (cls ? " " + cls : ""));
      b.appendChild(el("span", "dv-bx-t", title));
      if (sub) b.appendChild(el("small", null, sub));
      return b;
    }
    function drawLSM() {
      var f = el("div", "dv-flow");
      f.appendChild(box("Memtable", "RAM · sorted", "dv-hot"));
      f.appendChild(el("div", "dv-arrow", "flush when full ↓"));
      var row = el("div", "dv-row");
      row.appendChild(box("SSTable", "newest"));
      row.appendChild(box("SSTable", null));
      row.appendChild(box("SSTable", "oldest"));
      f.appendChild(row);
      f.appendChild(el("div", "dv-arrow", "compaction merges runs, drops overwritten keys ↓"));
      f.appendChild(box("Merged SSTable", "disk · immutable", "dv-cool"));
      return f;
    }
    function drawBtree() {
      var f = el("div", "dv-flow");
      f.appendChild(box("Root page", "keys partition the space", "dv-root"));
      f.appendChild(el("div", "dv-arrow", "traverse root → leaf ↓"));
      var row = el("div", "dv-row");
      row.appendChild(box("Leaf page", "keys 1–50"));
      row.appendChild(box("Leaf page", "keys 51–100", "dv-hit"));
      row.appendChild(box("Leaf page", "keys over 100"));
      f.appendChild(row);
      f.appendChild(el("div", "dv-note-row", "＋ write-ahead log · update the page in place"));
      return f;
    }
    function show(which) {
      order.forEach(function (k) { if (btns[k]) btns[k].classList.toggle("active", k === which); });
      stage.innerHTML = "";
      stage.appendChild(which === "lsm" ? drawLSM() : drawBtree());
      cap.innerHTML = "<b>" + esc(labels[which]) + ".</b> " + (caps[which] || "");
    }
    order.forEach(function (k) {
      var b = el("button", "dv-tab", labels[k]); b.type = "button";
      b.addEventListener("click", function () { show(k); });
      tabs.appendChild(b); btns[k] = b;
    });
    body.appendChild(tabs); body.appendChild(stage); body.appendChild(cap);
    show("lsm");
  }

  /* ---------- scene: consistent-hashing ring (partitioning) ---------- */
  var RING_COLORS = ["#6366f1", "#34d399", "#f59e0b", "#fb7185", "#38bdf8", "#a78bfa"];
  function renderRing(body, cfg) {
    var norm = function (a) { return ((a % 360) + 360) % 360; };
    var allNodes = (cfg.nodes || []).map(function (n, i) {
      return { label: n.label, angle: norm(n.angle), color: n.color || RING_COLORS[i % RING_COLORS.length], idx: i };
    });
    var keys = (cfg.keys || []).map(function (k) { return { label: k.label, angle: norm(k.angle) }; });
    if (!allNodes.length || !keys.length) { body.appendChild(el("p", "viz-fallback", "No ring data.")); return; }

    var cx = 60, cy = 60, R = 42;
    function xy(angle, r) { var a = angle * Math.PI / 180; return { x: cx + r * Math.sin(a), y: cy - r * Math.cos(a) }; }
    function ownerOf(keyAngle, active) {
      var sorted = active.slice().sort(function (a, b) { return a.angle - b.angle; });
      for (var i = 0; i < sorted.length; i++) if (sorted[i].angle >= keyAngle) return sorted[i];
      return sorted[0];   // wrap past 360° back to the first node
    }

    var stage = el("div", "dv-ringwrap");
    var s = svg("svg", { viewBox: "0 0 120 120", class: "dv-ring", role: "img" });
    var legend = el("div", "dv-rlegend");
    stage.appendChild(s); stage.appendChild(legend);
    body.appendChild(stage);

    var ctrl = el("div", "dv-ringctrl");
    var lab = el("label", "dv-fanlabel");
    lab.appendChild(el("span", null, "Nodes on the ring: "));
    var nOut = el("b", "dv-fanN", ""); lab.appendChild(nOut);
    ctrl.appendChild(lab);
    var slider = el("input", "dv-fanrange");
    slider.type = "range"; slider.min = "1"; slider.max = String(allNodes.length);
    slider.value = String(Math.min(cfg.start || allNodes.length, allNodes.length));
    slider.setAttribute("aria-label", "Number of active nodes on the hash ring");
    ctrl.appendChild(slider);
    var msg = el("div", "dv-fanout"); ctrl.appendChild(msg);
    body.appendChild(ctrl);

    var prevOwners = null, prevCount = null;

    function render() {
      var count = parseInt(slider.value, 10) || 1;
      nOut.textContent = count;
      var active = allNodes.slice(0, count);
      s.innerHTML = ""; legend.innerHTML = "";
      s.appendChild(svg("circle", { cx: cx, cy: cy, r: R, class: "dv-rring" }));

      var owners = {}, counts = {};
      keys.forEach(function (k) { var o = ownerOf(k.angle, active); owners[k.label] = o.idx; counts[o.idx] = (counts[o.idx] || 0) + 1; });

      active.forEach(function (n) {
        var p = xy(n.angle, R), pin = xy(n.angle, R - 4), pout = xy(n.angle, R + 4), plab = xy(n.angle, R + 11);
        var g = svg("g", { class: "dv-rnode" });
        g.appendChild(svg("line", { x1: pin.x, y1: pin.y, x2: pout.x, y2: pout.y, stroke: n.color, "stroke-width": 1.6 }));
        g.appendChild(svg("circle", { cx: p.x, cy: p.y, r: 3, fill: n.color, class: "dv-rnodedot" }));
        var t = svg("text", { x: plab.x, y: plab.y + 1.4, class: "dv-rnlabel", fill: n.color,
          "text-anchor": plab.x < cx - 3 ? "end" : (plab.x > cx + 3 ? "start" : "middle") });
        t.textContent = n.label; g.appendChild(t);
        s.appendChild(g);
      });

      keys.forEach(function (k) {
        var p = xy(k.angle, R);
        var moved = prevOwners && prevOwners[k.label] !== owners[k.label];
        var c = svg("circle", { cx: p.x, cy: p.y, r: 2.1, fill: allNodes[owners[k.label]].color, class: "dv-rkey" + (moved ? " moved" : "") });
        s.appendChild(c);
      });

      active.forEach(function (n) {
        var row = el("div", "dv-rlrow");
        var sw = el("span", "dv-rsw"); sw.style.background = n.color; row.appendChild(sw);
        row.appendChild(el("span", "dv-rlname", n.label));
        row.appendChild(el("span", "dv-rlcount", (counts[n.idx] || 0) + " keys"));
        legend.appendChild(row);
      });

      var movedCount = prevOwners ? keys.filter(function (k) { return prevOwners[k.label] !== owners[k.label]; }).length : 0;
      if (prevCount == null)
        msg.innerHTML = "Each key sits at a hash position and belongs to the <b>first node clockwise</b>. Drag to add or drop a node.";
      else if (count > prevCount)
        msg.innerHTML = "Added a node (" + prevCount + " → " + count + "): only <b class=\"dv-amp\">" + movedCount + " of " + keys.length + "</b> keys moved — the rest stayed put. With naïve <code>hash % N</code>, nearly all would move.";
      else if (count < prevCount)
        msg.innerHTML = "Dropped a node (" + prevCount + " → " + count + "): its <b class=\"dv-amp\">" + movedCount + "</b> keys spilled to the next node clockwise; everyone else is untouched.";
      else
        msg.innerHTML = "Each key belongs to the first node clockwise of its hash position.";

      prevOwners = owners; prevCount = count;
    }

    slider.addEventListener("input", render);
    render();
  }

  /* ---------- boot ---------- */
  function init(host) {
    var sEl = host.querySelector(".dv-config") || host.querySelector("script[type='application/json']");
    var cfg = {};
    if (sEl) { try { cfg = JSON.parse(sEl.textContent) || {}; } catch (e) { cfg = {}; } }

    var title = cfg.title || (host.querySelector(".dv-title") && host.querySelector(".dv-title").textContent) || "";
    host.innerHTML = "";
    if (title) {
      var cap = el("figcaption", "dv-title");
      cap.textContent = title;
      host.appendChild(cap);
    }
    var body = el("div", "dv-body");
    host.appendChild(body);

    if (cfg.scene === "percentiles") renderPercentiles(body, cfg);
    else if (cfg.scene === "datamodel") renderDataModel(body, cfg);
    else if (cfg.scene === "storage") renderStorage(body, cfg);
    else if (cfg.scene === "ring") renderRing(body, cfg);
    else body.appendChild(el("p", "viz-fallback", "Unknown scene: " + (cfg.scene || "(none)")));
  }

  function onReady(fn) { if (document.readyState !== "loading") fn(); else document.addEventListener("DOMContentLoaded", fn); }
  onReady(function () { document.querySelectorAll(".ddiaviz").forEach(init); });
})();
