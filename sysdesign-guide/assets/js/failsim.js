/* ============================================================
   System Design Field Guide — failure simulator (.failsim)
   A data-driven chaos toy: draws an architecture as labelled boxes
   (same column/row grid as the request-flow player), then lets the
   reader inject a failure — kill a node, partition a link — and
   step through the consequences hop by hop: health checks fail,
   traffic reroutes, a replica is promoted, a queue backs up. Each
   scenario ends with the "what the interviewer wants to hear" note.
   Offline, theme-aware, keyboard-driven, honors reduced motion.

   Authoring:
     <figure class="failsim" data-failsim> … controls …
       <script type="application/json" class="fs-config">
       {
         "title": "Payments under failure",
         "nodes": [ { "id":"db1","label":"DB primary","type":"store","col":3,"row":0 }, … ],
         "edges": [ { "from":"app","to":"db1","label":"write" }, … ],
         "scenarios": [
           { "id":"db-down", "label":"Kill the DB primary",
             "target": { "node":"db1" },                  // or { "edge":["app","db1"] }
             "steps": [
               { "caption":"Writes time out; health checks trip after ~10 s.",
                 "fail":["db1"], "degrade":["app"], "edgesDown":[["app","db1"]] },
               { "caption":"A replica is promoted; clients reroute.",
                 "fail":["db1"], "promote":["db2"], "reroute":[["app","db2"]],
                 "badges":[{ "node":"q", "text":"queue ↑" }] },
               { "caption":"Recovered at reduced redundancy.", "recover":true }
             ],
             "interviewer":"Name the detection (health checks), the mechanism (promotion), and the cost (async-replicated writes may be lost — RPO)." }
         ]
       }
       </script>
     </figure>

   Step state is declared fresh each step (no carry-over):
   fail / degrade / promote are node-id lists; edgesDown / reroute
   are [from,to] pairs; badges pin a small note to a node;
   recover:true clears everything back to healthy.
   ============================================================ */
(function () {
  "use strict";
  var SVGNS = "http://www.w3.org/2000/svg";
  var REDUCED = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  var W = 138, H = 52, GAPX = 60, GAPY = 38, PAD = 22, HW = W / 2, HH = H / 2;
  var GLYPH = { fail: "✕", degrade: "▲", promote: "✓" };

  function svg(tag, attrs) {
    var e = document.createElementNS(SVGNS, tag);
    if (attrs) for (var k in attrs) e.setAttribute(k, attrs[k]);
    return e;
  }

  function boundary(cx, cy, tx, ty) {
    var dx = tx - cx, dy = ty - cy;
    if (dx === 0 && dy === 0) return { x: cx, y: cy };
    var sx = dx !== 0 ? HW / Math.abs(dx) : Infinity;
    var sy = dy !== 0 ? HH / Math.abs(dy) : Infinity;
    var s = Math.min(sx, sy);
    return { x: cx + dx * s, y: cy + dy * s };
  }

  function Engine(fig) {
    var confEl = fig.querySelector(".fs-config");
    if (!confEl) return;
    var cfg; try { cfg = JSON.parse(confEl.textContent); } catch (e) { return; }
    var nodes = cfg.nodes || [], edges = cfg.edges || [], scenarios = cfg.scenarios || [];
    if (!nodes.length || !scenarios.length) return;

    var stage = fig.querySelector(".fs-stage");
    var capEl = fig.querySelector(".fs-caption");
    var noteEl = fig.querySelector(".fs-note");
    var chipsEl = fig.querySelector(".fs-scenarios");
    var fill = fig.querySelector(".fs-progress-fill");
    var stepEl = fig.querySelector(".fs-step");
    var playBtn = fig.querySelector(".fs-play");

    /* ---- layout (same grid as .reqflow) ---- */
    var maxCol = 0, maxRow = 0, pos = {};
    nodes.forEach(function (n) { maxCol = Math.max(maxCol, n.col || 0); maxRow = Math.max(maxRow, n.row || 0); });
    var cols = maxCol + 1, rows = maxRow + 1;
    var width = PAD * 2 + cols * W + (cols - 1) * GAPX;
    var height = PAD * 2 + rows * H + (rows - 1) * GAPY;
    nodes.forEach(function (n) {
      pos[n.id] = { x: PAD + HW + (n.col || 0) * (W + GAPX), y: PAD + HH + (n.row || 0) * (H + GAPY) };
    });

    var s = svg("svg", { class: "fs-svg", viewBox: "0 0 " + width + " " + height });
    stage.innerHTML = ""; stage.appendChild(s);

    var edgeEls = {};
    edges.forEach(function (e) {
      var a = pos[e.from], b = pos[e.to]; if (!a || !b) return;
      var p1 = boundary(a.x, a.y, b.x, b.y), p2 = boundary(b.x, b.y, a.x, a.y);
      var dx = p2.x - p1.x, dy = p2.y - p1.y, L = Math.sqrt(dx * dx + dy * dy) || 1, ux = dx / L, uy = dy / L;
      var tipX = p2.x - ux * 3, tipY = p2.y - uy * 3;
      var bx = tipX - ux * 9, by = tipY - uy * 9, px = -uy * 5, py = ux * 5;
      var path = svg("path", { class: "fs-edge", d: "M" + p1.x + " " + p1.y + " L" + (tipX - ux * 5) + " " + (tipY - uy * 5) });
      var ahead = svg("polygon", { class: "fs-ahead", points: tipX + "," + tipY + " " + (bx + px) + "," + (by + py) + " " + (bx - px) + "," + (by - py) });
      s.appendChild(path); s.appendChild(ahead);
      var label = null;
      if (e.label) {
        label = svg("text", { class: "fs-elabel", x: (p1.x + p2.x) / 2, y: (p1.y + p2.y) / 2 - 7 });
        label.textContent = e.label; s.appendChild(label);
      }
      edgeEls[e.from + "|" + e.to] = { path: path, ahead: ahead, label: label, p1: p1, p2: p2 };
    });

    var nodeEls = {}, statusEls = {};
    nodes.forEach(function (n) {
      var c = pos[n.id];
      var g = svg("g", { class: "fs-node", "data-id": n.id });
      g.appendChild(svg("rect", { class: "fs-nrect", x: c.x - HW, y: c.y - HH, width: W, height: H, rx: 11 }));
      if (n.type) {
        var tt = svg("text", { class: "fs-ntype", x: c.x, y: c.y - 9 }); tt.textContent = n.type; g.appendChild(tt);
      }
      var lt = svg("text", { class: "fs-nlabel", x: c.x, y: c.y + (n.type ? 8 : 1) }); lt.textContent = n.label || n.id; g.appendChild(lt);
      var st = svg("text", { class: "fs-status", x: c.x + HW - 12, y: c.y - HH + 16 }); g.appendChild(st);
      s.appendChild(g); nodeEls[n.id] = g; statusEls[n.id] = st;
    });

    /* badge layer (per-step annotations like "queue ↑ 12k") */
    var badgeLayer = svg("g", { class: "fs-badges" }); s.appendChild(badgeLayer);

    /* a reroute may follow a path that isn't part of the healthy
       diagram (e.g. app → promoted replica) — draw it on demand */
    function dynEdge(fromId, toId) {
      var a = pos[fromId], b = pos[toId]; if (!a || !b) return null;
      var p1 = boundary(a.x, a.y, b.x, b.y), p2 = boundary(b.x, b.y, a.x, a.y);
      var dx = p2.x - p1.x, dy = p2.y - p1.y, L = Math.sqrt(dx * dx + dy * dy) || 1, ux = dx / L, uy = dy / L;
      var tipX = p2.x - ux * 3, tipY = p2.y - uy * 3;
      var bx = tipX - ux * 9, by = tipY - uy * 9, px = -uy * 5, py = ux * 5;
      var path = svg("path", { class: "fs-edge on fs-dyn", d: "M" + p1.x + " " + p1.y + " L" + (tipX - ux * 5) + " " + (tipY - uy * 5) });
      var ahead = svg("polygon", { class: "fs-ahead on fs-dyn", points: tipX + "," + tipY + " " + (bx + px) + "," + (by + py) + " " + (bx - px) + "," + (by - py) });
      s.insertBefore(path, badgeLayer); s.insertBefore(ahead, badgeLayer);
      return { path: path, ahead: ahead, p1: p1, p2: p2 };
    }

    /* ---- scenario chips (the primary, keyboard-friendly selector) ---- */
    var cur = -1, i = 0, timer = null, raf = 0, DELAY = 1500;
    var chipBtns = [];
    if (chipsEl) {
      chipsEl.innerHTML = "";
      scenarios.forEach(function (sc, k) {
        var b = document.createElement("button");
        b.type = "button"; b.className = "fs-chip"; b.textContent = "⚡ " + (sc.label || "Scenario " + (k + 1));
        b.addEventListener("click", function () { select(k); });
        chipsEl.appendChild(b); chipBtns.push(b);
      });
    }

    /* clicking a scenario's target node/edge also triggers it */
    scenarios.forEach(function (sc, k) {
      var t = sc.target || {};
      var g = t.node && nodeEls[t.node];
      if (g) {
        g.classList.add("fs-target");
        g.setAttribute("tabindex", "0"); g.setAttribute("role", "button");
        g.setAttribute("aria-label", sc.label || "Inject failure");
        g.addEventListener("click", function () { select(k); });
        g.addEventListener("keydown", function (e) { if (e.key === "Enter" || e.key === " ") { select(k); e.preventDefault(); } });
      }
      var ed = t.edge && edgeEls[t.edge[0] + "|" + t.edge[1]];
      if (ed) { ed.path.classList.add("fs-target-edge"); ed.path.addEventListener("click", function () { select(k); }); }
    });

    function clearPackets() {
      if (raf) { cancelAnimationFrame(raf); raf = 0; }
      [].forEach.call(s.querySelectorAll(".fs-packet"), function (d) { d.remove(); });
    }

    var liveEdges = {};   // reroute edges of the current step (incl. dynamic ones)

    function animatePackets(pairs) {
      clearPackets();
      if (REDUCED || !pairs.length) return;
      var dots = [];
      pairs.forEach(function (pr) {
        var ed = liveEdges[pr[0] + "|" + pr[1]]; if (!ed) return;
        var dot = svg("circle", { class: "fs-packet", r: 5, cx: ed.p1.x, cy: ed.p1.y });
        s.appendChild(dot); dots.push({ dot: dot, ed: ed });
      });
      var dur = 720, t0 = 0;
      function frame(ts) {
        if (!t0) t0 = ts;
        var k = Math.min(1, (ts - t0) / dur);
        var e = k < .5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2;
        dots.forEach(function (d) {
          d.dot.setAttribute("cx", d.ed.p1.x + (d.ed.p2.x - d.ed.p1.x) * e);
          d.dot.setAttribute("cy", d.ed.p1.y + (d.ed.p2.y - d.ed.p1.y) * e);
        });
        if (k < 1) raf = requestAnimationFrame(frame);
        else { raf = 0; dots.forEach(function (d) { d.dot.remove(); }); }
      }
      raf = requestAnimationFrame(frame);
    }

    function resetStates() {
      Object.keys(nodeEls).forEach(function (id) {
        nodeEls[id].classList.remove("fail", "degrade", "promote");
        statusEls[id].textContent = "";
      });
      for (var key in edgeEls) {
        var ee = edgeEls[key];
        ee.path.classList.remove("down", "on"); ee.ahead.classList.remove("down", "on");
        if (ee.label) ee.label.classList.remove("on");
      }
      badgeLayer.innerHTML = "";
      [].forEach.call(s.querySelectorAll(".fs-dyn"), function (e) { e.remove(); });
      clearPackets();
    }

    function render() {
      resetStates();
      var sc = scenarios[cur]; if (!sc) return;
      var steps = sc.steps || [], st = steps[i] || {};

      if (!st.recover) {
        (st.fail || []).forEach(function (id) { if (nodeEls[id]) { nodeEls[id].classList.add("fail"); statusEls[id].textContent = GLYPH.fail; } });
        (st.degrade || []).forEach(function (id) { if (nodeEls[id]) { nodeEls[id].classList.add("degrade"); statusEls[id].textContent = GLYPH.degrade; } });
        (st.promote || []).forEach(function (id) { if (nodeEls[id]) { nodeEls[id].classList.add("promote"); statusEls[id].textContent = GLYPH.promote; } });
        (st.edgesDown || []).forEach(function (pr) {
          var ee = edgeEls[pr[0] + "|" + pr[1]];
          if (ee) { ee.path.classList.add("down"); ee.ahead.classList.add("down"); }
        });
        liveEdges = {};
        (st.reroute || []).forEach(function (pr) {
          var key = pr[0] + "|" + pr[1], ee = edgeEls[key];
          if (ee) { ee.path.classList.add("on"); ee.ahead.classList.add("on"); if (ee.label) ee.label.classList.add("on"); }
          else ee = dynEdge(pr[0], pr[1]);
          if (ee) liveEdges[key] = ee;
        });
        (st.badges || []).forEach(function (bd) {
          var c = pos[bd.node]; if (!c) return;
          var t = svg("text", { class: "fs-badge", x: c.x, y: c.y + HH + 16 });
          t.textContent = bd.text; badgeLayer.appendChild(t);
        });
        animatePackets(st.reroute || []);
      }

      if (capEl) capEl.textContent = st.caption || "";
      if (fill) fill.style.width = (steps.length < 2 ? 100 : (i / (steps.length - 1)) * 100) + "%";
      if (stepEl) stepEl.textContent = (i + 1) + " / " + steps.length;
      if (noteEl) {
        var last = i === steps.length - 1;
        noteEl.hidden = !(last && sc.interviewer);
        if (last && sc.interviewer) noteEl.innerHTML = "<b>Say this in the interview:</b> " + sc.interviewer;
      }
    }

    function select(k) {
      stop();
      cur = k; i = 0;
      chipBtns.forEach(function (b, bi) { b.classList.toggle("active", bi === k); });
      fig.classList.add("has-scenario");
      render();
    }

    function steps() { return (scenarios[cur] && scenarios[cur].steps) || []; }
    function go(n) { if (cur < 0) return; i = Math.max(0, Math.min(steps().length - 1, n)); render(); }
    function setPlay(g, l) { if (playBtn) { playBtn.textContent = g; playBtn.setAttribute("aria-label", l); } }
    function stop() { if (timer) { clearInterval(timer); timer = null; } setPlay("▶", "Play"); }
    function play() {
      if (cur < 0) select(0);
      if (i >= steps().length - 1) i = -1;
      setPlay("⏸", "Pause");
      timer = setInterval(function () { if (i >= steps().length - 1) { stop(); return; } go(i + 1); }, DELAY);
    }

    var prev = fig.querySelector(".fs-prev"), next = fig.querySelector(".fs-next"), reset = fig.querySelector(".fs-reset");
    if (prev) prev.addEventListener("click", function () { stop(); go(i - 1); });
    if (next) next.addEventListener("click", function () { if (cur < 0) { select(0); return; } stop(); go(i + 1); });
    if (reset) reset.addEventListener("click", function () { stop(); cur = -1; i = 0; fig.classList.remove("has-scenario"); chipBtns.forEach(function (b) { b.classList.remove("active"); }); resetStates(); if (capEl) capEl.textContent = idleCaption; if (noteEl) noteEl.hidden = true; if (fill) fill.style.width = "0%"; if (stepEl) stepEl.textContent = "– / –"; });
    if (playBtn) playBtn.addEventListener("click", function () { timer ? stop() : play(); });

    fig.setAttribute("tabindex", "0");
    fig.addEventListener("keydown", function (e) {
      if (e.target !== fig) return;                     // let chips/targets keep Enter/Space
      if (e.key === "ArrowRight") { stop(); cur < 0 ? select(0) : go(i + 1); e.preventDefault(); }
      else if (e.key === "ArrowLeft") { stop(); go(i - 1); e.preventDefault(); }
      else if (e.key === " " || e.key === "Spacebar") { timer ? stop() : play(); e.preventDefault(); }
      else if (e.key === "Home") { stop(); go(0); }
      else if (e.key === "End") { stop(); go(steps().length - 1); }
    });

    if (REDUCED && playBtn) playBtn.style.display = "none";

    var idleCaption = cfg.idle || "All healthy. Pick a failure to inject — chips above, or click a ⚡ component.";
    if (capEl) capEl.textContent = idleCaption;
    if (noteEl) noteEl.hidden = true;
    if (stepEl) stepEl.textContent = "– / –";
  }

  function onReady(fn) { if (document.readyState !== "loading") fn(); else document.addEventListener("DOMContentLoaded", fn); }
  onReady(function () { document.querySelectorAll(".failsim").forEach(Engine); });
})();
