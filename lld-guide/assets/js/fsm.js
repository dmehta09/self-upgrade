/* ============================================================
   The Design Field Guide — state-machine player (.fsm)
   Draws a finite state machine as labelled boxes on a grid and
   lets the reader FIRE events at it: legal events animate a token
   along the transition edge and move the highlight; illegal events
   shake the current state and explain the rejection in the log —
   which is the whole pedagogy ("what does select mean while Idle?").
   Supports guards (display text), auto transitions with a delay
   (Dispensing → Idle), bounded repeats (wrong PIN ×3), and canned
   scenario chips. Offline, theme-aware, keyboard-driven, honors
   prefers-reduced-motion.

   Authoring:
     <figure class="fsm" data-fsm>
       <figcaption class="fsm-title">Vending machine FSM</figcaption>
       <script type="application/json" class="fsm-config">
       {
         "initial": "idle",
         "states": [
           { "id":"idle", "label":"Idle", "note":"balance = 0", "col":0, "row":0 },
           { "id":"dispense", "label":"Dispensing", "col":2, "row":0, "transient":true }
         ],
         "events": [ { "id":"coin", "label":"insert_coin(25)" } ],
         "transitions": [
           { "from":"idle", "on":"coin", "to":"hasmoney", "log":"balance = 25c" },
           { "from":"hasmoney", "on":"select", "to":"dispense",
             "guard":"balance ≥ price", "log":"vending…" },
           { "from":"dispense", "auto":true, "to":"idle", "delayMs":900,
             "log":"change returned → Idle" },
           { "from":"idle", "on":"select", "reject":"insert money first" },
           { "from":"pin", "on":"bad", "to":"pin", "upTo":2, "log":"wrong PIN" },
           { "from":"pin", "on":"bad", "to":"captured", "log":"card captured" }
         ],
         "scenarios": [ { "label":"Happy path", "fire":["coin","select"] } ]
       }
       </script>
     </figure>

   Matching: the FIRST transition whose (from, on) matches the
   current state wins; a transition with "upTo": N stops matching
   after it has fired N times (counters reset on Reset), which is
   how "third bad PIN captures the card" is modelled.
   ============================================================ */
(function () {
  "use strict";
  var SVGNS = "http://www.w3.org/2000/svg";
  var REDUCED = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  var W = 138, H = 56, GAPX = 64, GAPY = 46, PAD = 24, HW = W / 2, HH = H / 2;

  function svg(tag, attrs) {
    var e = document.createElementNS(SVGNS, tag);
    if (attrs) for (var k in attrs) e.setAttribute(k, attrs[k]);
    return e;
  }
  function el(t, c, html) { var e = document.createElement(t); if (c) e.className = c; if (html != null) e.innerHTML = html; return e; }

  function boundary(cx, cy, tx, ty) {
    var dx = tx - cx, dy = ty - cy;
    if (dx === 0 && dy === 0) return { x: cx, y: cy };
    var sx = dx !== 0 ? HW / Math.abs(dx) : Infinity;
    var sy = dy !== 0 ? HH / Math.abs(dy) : Infinity;
    var s = Math.min(sx, sy);
    return { x: cx + dx * s, y: cy + dy * s };
  }

  function Engine(fig) {
    var confEl = fig.querySelector(".fsm-config");
    if (!confEl) return;
    var cfg; try { cfg = JSON.parse(confEl.textContent); } catch (e) { return; }
    var states = cfg.states || [], events = cfg.events || [], trans = cfg.transitions || [];
    if (!states.length || !trans.length || !cfg.initial) return;

    /* ---- build the chrome (authors only write config) ---- */
    var stage = el("div", "fsm-stage");
    var evRow = el("div", "fsm-events");
    var ctl = el("div", "fsm-ctl");
    var logEl = el("div", "fsm-log"); logEl.setAttribute("aria-live", "polite");
    fig.appendChild(stage); fig.appendChild(evRow); fig.appendChild(ctl); fig.appendChild(logEl);

    /* ---- layout ---- */
    var maxCol = 0, maxRow = 0, pos = {}, byId = {};
    states.forEach(function (n) {
      byId[n.id] = n;
      maxCol = Math.max(maxCol, n.col || 0); maxRow = Math.max(maxRow, n.row || 0);
    });
    var cols = maxCol + 1, rows = maxRow + 1;
    var width = PAD * 2 + cols * W + (cols - 1) * GAPX;
    var height = PAD * 2 + rows * H + (rows - 1) * GAPY;
    states.forEach(function (n) {
      pos[n.id] = { x: PAD + HW + (n.col || 0) * (W + GAPX), y: PAD + HH + (n.row || 0) * (H + GAPY) };
    });

    var s = svg("svg", { class: "fsm-svg", viewBox: "0 0 " + width + " " + height });
    stage.appendChild(s);

    /* edges: one drawn edge per (from,to) pair; labels stack the
       event names of every transition that shares the pair. */
    var pairLabels = {}, pairList = [];
    trans.forEach(function (t) {
      if (!t.to || t.reject) return;
      var key = t.from + "|" + t.to;
      if (!pairLabels[key]) { pairLabels[key] = []; pairList.push({ from: t.from, to: t.to, key: key }); }
      var lbl = t.on ? ((events.filter(function (e) { return e.id === t.on; })[0] || {}).label || t.on) : "auto";
      lbl = lbl.replace(/\(.*\)$/, "");           // keep edge labels short: drop arg lists
      if (t.guard) lbl += " [" + t.guard + "]";
      if (pairLabels[key].indexOf(lbl) === -1) pairLabels[key].push(lbl);
    });

    var edgeEls = {};
    pairList.forEach(function (pr) {
      var a = pos[pr.from], b = pos[pr.to]; if (!a || !b) return;
      var g = svg("g", { class: "fsm-edge-g" });
      if (pr.from === pr.to) {
        /* self-loop: arc above the node */
        var c = a, lx = c.x, ly = c.y - HH;
        var d = "M" + (lx - 18) + " " + ly + " C " + (lx - 30) + " " + (ly - 34) + ", " + (lx + 30) + " " + (ly - 34) + ", " + (lx + 18) + " " + ly;
        var loop = svg("path", { class: "fsm-edge", d: d });
        var ah = svg("polygon", { class: "fsm-ahead", points: (lx + 18) + "," + ly + " " + (lx + 13) + "," + (ly - 10) + " " + (lx + 23) + "," + (ly - 8) });
        g.appendChild(loop); g.appendChild(ah);
        var tl = svg("text", { class: "fsm-elabel", x: lx, y: ly - 30 });
        tl.textContent = pairLabels[pr.key].join(" / "); g.appendChild(tl);
        s.appendChild(g);
        edgeEls[pr.key] = { g: g, p1: { x: lx - 18, y: ly - 22 }, p2: { x: lx + 18, y: ly - 22 } };
        return;
      }
      var p1 = boundary(a.x, a.y, b.x, b.y), p2 = boundary(b.x, b.y, a.x, a.y);
      /* if a reverse edge exists, offset both perpendicular so they don't overlap */
      if (pairLabels[pr.to + "|" + pr.from]) {
        var ddx = p2.x - p1.x, ddy = p2.y - p1.y, LL = Math.sqrt(ddx * ddx + ddy * ddy) || 1;
        var ox = -ddy / LL * 9, oy = ddx / LL * 9;
        p1 = { x: p1.x + ox, y: p1.y + oy }; p2 = { x: p2.x + ox, y: p2.y + oy };
      }
      var dx = p2.x - p1.x, dy = p2.y - p1.y, L = Math.sqrt(dx * dx + dy * dy) || 1, ux = dx / L, uy = dy / L;
      var tipX = p2.x - ux * 3, tipY = p2.y - uy * 3;
      var bx = tipX - ux * 9, by = tipY - uy * 9, px = -uy * 5, py = ux * 5;
      var path = svg("path", { class: "fsm-edge", d: "M" + p1.x + " " + p1.y + " L" + (tipX - ux * 5) + " " + (tipY - uy * 5) });
      var ahead = svg("polygon", { class: "fsm-ahead", points: tipX + "," + tipY + " " + (bx + px) + "," + (by + py) + " " + (bx - px) + "," + (by - py) });
      g.appendChild(path); g.appendChild(ahead);
      var label = svg("text", { class: "fsm-elabel", x: (p1.x + p2.x) / 2, y: (p1.y + p2.y) / 2 - 7 });
      label.textContent = pairLabels[pr.key].join(" / ");
      g.appendChild(label);
      s.appendChild(g);
      edgeEls[pr.key] = { g: g, p1: p1, p2: p2 };
    });

    var nodeEls = {};
    states.forEach(function (n) {
      var c = pos[n.id];
      var g = svg("g", { class: "fsm-node" + (n.transient ? " transient" : ""), "data-id": n.id });
      g.appendChild(svg("rect", { class: "fsm-nrect", x: c.x - HW, y: c.y - HH, width: W, height: H, rx: 12 }));
      var lt = svg("text", { class: "fsm-nlabel", x: c.x, y: c.y + (n.note ? -3 : 5) }); lt.textContent = n.label || n.id; g.appendChild(lt);
      if (n.note) { var nt = svg("text", { class: "fsm-nnote", x: c.x, y: c.y + 14 }); nt.textContent = n.note; g.appendChild(nt); }
      s.appendChild(g); nodeEls[n.id] = g;
    });

    /* ---- simulation state ---- */
    var current = cfg.initial, fired = {}, autoTimer = null, scenTimer = null, raf = 0;

    function log(text, kind) {
      var line = el("div", "fsm-line" + (kind ? " " + kind : ""), text);
      logEl.appendChild(line);
      while (logEl.children.length > 8) logEl.removeChild(logEl.firstChild);
      logEl.scrollTop = logEl.scrollHeight;
    }

    function paint() {
      states.forEach(function (n) { nodeEls[n.id].classList.toggle("on", n.id === current); });
    }

    function token(key, done) {
      var ed = edgeEls[key];
      if (!ed || REDUCED) { if (done) done(); return; }
      var dot = svg("circle", { class: "fsm-token", r: 5, cx: ed.p1.x, cy: ed.p1.y });
      s.appendChild(dot);
      var dur = 480, t0 = 0;
      function frame(ts) {
        if (!t0) t0 = ts;
        var k = Math.min(1, (ts - t0) / dur);
        var e2 = k < .5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2;
        dot.setAttribute("cx", ed.p1.x + (ed.p2.x - ed.p1.x) * e2);
        dot.setAttribute("cy", ed.p1.y + (ed.p2.y - ed.p1.y) * e2);
        if (k < 1) raf = requestAnimationFrame(frame);
        else { raf = 0; dot.remove(); if (done) done(); }
      }
      raf = requestAnimationFrame(frame);
    }

    function shake(id) {
      var g = nodeEls[id]; if (!g || REDUCED) return;
      g.classList.remove("shake"); void g.getBBox; // restart animation
      requestAnimationFrame(function () { g.classList.add("shake"); });
      setTimeout(function () { g.classList.remove("shake"); }, 450);
    }

    function evLabel(id) {
      var e = events.filter(function (x) { return x.id === id; })[0];
      return (e && e.label) || id;
    }
    function stLabel(id) { return (byId[id] && byId[id].label) || id; }

    function match(evId) {
      for (var i = 0; i < trans.length; i++) {
        var t = trans[i];
        if (t.from !== current || t.on !== evId || t.auto || t.reject || !t.to) continue;
        if (t.upTo != null && (fired[i] || 0) >= t.upTo) continue;
        return { t: t, i: i };
      }
      return null;
    }

    function scheduleAuto() {
      for (var i = 0; i < trans.length; i++) {
        var t = trans[i];
        if (t.auto && t.from === current && t.to) {
          var delay = REDUCED ? 60 : (t.delayMs || 900);
          autoTimer = setTimeout(function (tt) {
            autoTimer = null;
            move(tt, true);
          }.bind(null, t), delay);
          return;
        }
      }
    }

    function move(t, isAuto) {
      var fromId = current, key = fromId + "|" + t.to;
      current = t.to;
      token(key, null);
      paint();
      var arrow = isAuto ? " ⟶ (auto) " : " ⟶ ";
      log(stLabel(fromId) + arrow + "<b>" + stLabel(t.to) + "</b>" + (t.log ? " · " + t.log : ""));
      scheduleAuto();
    }

    function fire(evId, fromScenario) {
      if (!fromScenario) stopScenario();
      if (autoTimer) return;                       // mid auto-transition: ignore input
      var m = match(evId);
      if (!m) {
        /* explicit reject? */
        var rej = null;
        for (var i = 0; i < trans.length; i++) {
          var t = trans[i];
          if (t.from === current && t.on === evId && t.reject) { rej = t.reject; break; }
        }
        shake(current);
        log("✕ <b>" + evLabel(evId) + "</b> rejected while " + stLabel(current) + (rej ? " — " + rej : ""), "rej");
        return;
      }
      fired[m.i] = (fired[m.i] || 0) + 1;
      if (m.t.to === current) {                    // self transition: no move, just log
        token(current + "|" + current, null);
        log(stLabel(current) + " ⟳ <b>" + evLabel(evId) + "</b>" + (m.t.log ? " · " + m.t.log : ""));
      } else move(m.t, false);
    }

    /* ---- controls ---- */
    events.forEach(function (e, k) {
      var b = el("button", "fsm-ebtn", (k + 1) + "&thinsp;·&thinsp;" + e.label);
      b.type = "button";
      b.addEventListener("click", function () { fire(e.id, false); });
      evRow.appendChild(b);
    });

    var scenBtns = [];
    (cfg.scenarios || []).forEach(function (sc) {
      var b = el("button", "fsm-chip", "▶ " + (sc.label || "Scenario"));
      b.type = "button";
      b.addEventListener("click", function () { runScenario(sc, b); });
      ctl.appendChild(b); scenBtns.push(b);
    });
    var resetBtn = el("button", "fsm-chip fsm-reset", "↺ Reset");
    resetBtn.type = "button";
    resetBtn.addEventListener("click", reset);
    ctl.appendChild(resetBtn);

    function stopScenario() {
      if (scenTimer) { clearTimeout(scenTimer); scenTimer = null; }
      scenBtns.forEach(function (b) { b.classList.remove("active"); });
    }
    function runScenario(sc, btn) {
      reset();
      btn.classList.add("active");
      var seq = sc.fire || [], i = 0;
      var gap = REDUCED ? 250 : 1100;
      function step() {
        if (i >= seq.length) { stopScenario(); return; }
        fire(seq[i++], true);
        scenTimer = setTimeout(step, gap);
      }
      log("— scenario: <b>" + (sc.label || "") + "</b> —");
      scenTimer = setTimeout(step, REDUCED ? 100 : 500);
    }

    function reset() {
      stopScenario();
      if (autoTimer) { clearTimeout(autoTimer); autoTimer = null; }
      if (raf) { cancelAnimationFrame(raf); raf = 0; }
      [].forEach.call(s.querySelectorAll(".fsm-token"), function (d) { d.remove(); });
      current = cfg.initial; fired = {};
      logEl.innerHTML = "";
      log("reset → <b>" + stLabel(current) + "</b>");
      paint();
    }

    fig.setAttribute("tabindex", "0");
    fig.addEventListener("keydown", function (e) {
      if (e.target !== fig) return;
      var d = parseInt(e.key, 10);
      if (d >= 1 && d <= events.length) { fire(events[d - 1].id, false); e.preventDefault(); }
      else if (e.key === "Home") { reset(); e.preventDefault(); }
      else if ((e.key === " " || e.key === "Spacebar") && (cfg.scenarios || []).length) {
        runScenario(cfg.scenarios[0], scenBtns[0]); e.preventDefault();
      }
    });

    paint();
    log("ready — state: <b>" + stLabel(current) + "</b>. Fire an event (buttons or keys 1–" + events.length + ").");
  }

  function onReady(fn) { if (document.readyState !== "loading") fn(); else document.addEventListener("DOMContentLoaded", fn); }
  onReady(function () { document.querySelectorAll(".fsm").forEach(Engine); });
})();
