/* ============================================================
   The Design Field Guide — pattern-flow stepper (.pflow)
   Animates the RUNTIME call flow of a design pattern as a small
   sequence diagram: objects are lanes with dashed lifelines, each
   step draws a call / return / self arrow, and a mono code panel
   highlights the line being executed. The point: students read
   pattern UML all day but rarely see the messages fly — this shows
   Observer's fan-out, Strategy's dispatch, a Chain's walk, etc.
   Offline, theme-aware, keyboard-driven, honors reduced motion.

   Authoring:
     <figure class="pflow" data-pflow>
       <figcaption class="pf-title">Observer · notify fan-out</figcaption>
       <script type="application/json" class="pf-config">
       {
         "lanes": [
           { "id":"client", "label":"client code" },
           { "id":"subject", "label":"NewsFeed (Subject)" },
           { "id":"obs1", "label":"EmailAlert" }
         ],
         "code": ["feed.attach(email)", "feed.publish(art)", "  for ob in observers:", "    ob.update(art)"],
         "steps": [
           { "from":"client", "to":"subject", "label":"attach(email)", "line":0,
             "caption":"The subject stores observers behind one tiny interface." },
           { "from":"subject", "to":"obs1", "label":"update(art)", "kind":"call", "line":3,
             "caption":"Fan-out: the same call goes to every registered observer." },
           { "from":"obs1", "to":"subject", "kind":"return", "line":3, "caption":"…" },
           { "from":"subject", "to":"subject", "label":"next observer", "kind":"self",
             "line":2, "caption":"…" }
         ]
       }
       </script>
     </figure>

   kind: "call" (default, solid arrow) · "return" (dashed, open head)
   · "self" (loop on one lifeline). "line" indexes into code[] (omit
   to leave the code panel unhighlighted for that step).
   ============================================================ */
(function () {
  "use strict";
  var SVGNS = "http://www.w3.org/2000/svg";
  var REDUCED = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  var LANEW = 128, LANEH = 34, GAP = 64, PADX = 18, PADTOP = 14, ROWH = 44, PADBOT = 16;

  function svg(tag, attrs) {
    var e = document.createElementNS(SVGNS, tag);
    if (attrs) for (var k in attrs) e.setAttribute(k, attrs[k]);
    return e;
  }
  function el(t, c, html) { var e = document.createElement(t); if (c) e.className = c; if (html != null) e.innerHTML = html; return e; }

  function Engine(fig) {
    var confEl = fig.querySelector(".pf-config");
    if (!confEl) return;
    var cfg; try { cfg = JSON.parse(confEl.textContent); } catch (e) { return; }
    var lanes = cfg.lanes || [], steps = cfg.steps || [], code = cfg.code || [];
    if (lanes.length < 2 || !steps.length) return;

    /* ---- chrome ---- */
    var wrap = el("div", "pf-wrap");
    var stage = el("div", "pf-stage");
    var codeBox = code.length ? el("div", "pf-code") : null;
    wrap.appendChild(stage); if (codeBox) wrap.appendChild(codeBox);
    var cap = el("div", "pf-caption"); cap.setAttribute("aria-live", "polite");
    var bar = el("div", "pf-bar");
    var prev = el("button", "pf-btn pf-prev", "‹"); prev.type = "button"; prev.setAttribute("aria-label", "Previous step");
    var play = el("button", "pf-btn pf-play", "▶"); play.type = "button"; play.setAttribute("aria-label", "Play");
    var next = el("button", "pf-btn pf-next", "›"); next.type = "button"; next.setAttribute("aria-label", "Next step");
    var stepLbl = el("span", "pf-step", "0 / " + steps.length);
    var prog = el("div", "pf-progress"); var fill = el("div", "pf-progress-fill"); prog.appendChild(fill);
    bar.appendChild(prev); bar.appendChild(play); bar.appendChild(next);
    bar.appendChild(prog); bar.appendChild(stepLbl);
    fig.appendChild(wrap); fig.appendChild(cap); fig.appendChild(bar);

    /* ---- code panel ---- */
    var codeLines = [];
    if (codeBox) {
      code.forEach(function (ln) {
        var d = el("div", "pf-cline");
        d.textContent = ln === "" ? " " : ln;
        codeBox.appendChild(d); codeLines.push(d);
      });
    }

    /* ---- stage geometry ---- */
    var laneX = {};
    lanes.forEach(function (l, k) { laneX[l.id] = PADX + LANEW / 2 + k * (LANEW + GAP); });
    var width = PADX * 2 + lanes.length * LANEW + (lanes.length - 1) * GAP;
    var topY = PADTOP + LANEH;
    var height = topY + steps.length * ROWH + PADBOT;
    var s = svg("svg", { class: "pf-svg", viewBox: "0 0 " + width + " " + height });
    stage.appendChild(s);

    lanes.forEach(function (l) {
      var x = laneX[l.id];
      s.appendChild(svg("line", { class: "pf-life", x1: x, y1: topY, x2: x, y2: height - 6 }));
      var g = svg("g", { class: "pf-lane" });
      g.appendChild(svg("rect", { class: "pf-lrect", x: x - LANEW / 2, y: PADTOP, width: LANEW, height: LANEH, rx: 9 }));
      var t = svg("text", { class: "pf-llabel", x: x, y: PADTOP + LANEH / 2 + 4 });
      t.textContent = l.label || l.id; g.appendChild(t);
      s.appendChild(g);
    });

    /* ---- arrows (pre-drawn, revealed by step) ---- */
    var arrowEls = steps.map(function (st, k) {
      var y = topY + (k + 0.5) * ROWH + 6;
      var g = svg("g", { class: "pf-arrow k-" + (st.kind || "call") });
      var x1 = laneX[st.from], x2 = laneX[st.to];
      if (st.from === st.to || st.kind === "self") {
        var x = laneX[st.from];
        g.appendChild(svg("path", { class: "pf-aline", d: "M" + x + " " + (y - 10) + " H" + (x + 34) + " V" + (y + 4) + " H" + (x + 6) }));
        g.appendChild(svg("polygon", { class: "pf-ahead", points: (x + 6) + "," + (y + 4) + " " + (x + 15) + "," + (y - 1) + " " + (x + 15) + "," + (y + 9) }));
        if (st.label) { var lt0 = svg("text", { class: "pf-alabel", x: x + 40, y: y - 1, "text-anchor": "start" }); lt0.textContent = st.label; g.appendChild(lt0); }
      } else {
        var dir = x2 > x1 ? 1 : -1;
        var ax1 = x1 + dir * 4, ax2 = x2 - dir * 12;
        g.appendChild(svg("line", { class: "pf-aline", x1: ax1, y1: y, x2: ax2, y2: y }));
        if (st.kind === "return") {
          g.appendChild(svg("polyline", { class: "pf-aopen", points: (ax2 - dir * 0 + dir * -9) + "," + (y - 5) + " " + (ax2 + dir * 8) + "," + y + " " + (ax2 - dir * 9) + "," + (y + 5) }));
        } else {
          g.appendChild(svg("polygon", { class: "pf-ahead", points: (ax2 + dir * 8) + "," + y + " " + (ax2 - dir * 4) + "," + (y - 5.5) + " " + (ax2 - dir * 4) + "," + (y + 5.5) }));
        }
        if (st.label) {
          var lt = svg("text", { class: "pf-alabel", x: (x1 + x2) / 2, y: y - 7 });
          lt.textContent = st.label; g.appendChild(lt);
        }
      }
      s.appendChild(g);
      return g;
    });

    /* ---- stepping ---- */
    var i = -1, timer = null;

    function render() {
      arrowEls.forEach(function (g, k) {
        g.classList.toggle("past", k < i);
        g.classList.toggle("now", k === i);
        g.classList.toggle("future", k > i);
      });
      var st = steps[i];
      cap.textContent = st ? (st.caption || "") : (cfg.idle || "Press ▶ or › to step through the calls.");
      codeLines.forEach(function (d, k) {
        d.classList.toggle("on", !!st && st.line === k);
      });
      stepLbl.textContent = (i + 1) + " / " + steps.length;
      fill.style.width = ((i + 1) / steps.length * 100) + "%";
    }

    function go(n) { i = Math.max(-1, Math.min(steps.length - 1, n)); render(); }
    function stop() { if (timer) { clearInterval(timer); timer = null; } play.textContent = "▶"; play.setAttribute("aria-label", "Play"); }
    function start() {
      if (i >= steps.length - 1) i = -1;
      play.textContent = "⏸"; play.setAttribute("aria-label", "Pause");
      timer = setInterval(function () {
        if (i >= steps.length - 1) { stop(); return; }
        go(i + 1);
      }, 1400);
    }

    prev.addEventListener("click", function () { stop(); go(i - 1); });
    next.addEventListener("click", function () { stop(); go(i + 1); });
    play.addEventListener("click", function () { timer ? stop() : start(); });
    if (REDUCED) play.style.display = "none";

    fig.setAttribute("tabindex", "0");
    fig.addEventListener("keydown", function (e) {
      if (e.target !== fig) return;
      if (e.key === "ArrowRight") { stop(); go(i + 1); e.preventDefault(); }
      else if (e.key === "ArrowLeft") { stop(); go(i - 1); e.preventDefault(); }
      else if (e.key === " " || e.key === "Spacebar") { timer ? stop() : start(); e.preventDefault(); }
      else if (e.key === "Home") { stop(); go(-1); }
      else if (e.key === "End") { stop(); go(steps.length - 1); }
    });

    render();
  }

  function onReady(fn) { if (document.readyState !== "loading") fn(); else document.addEventListener("DOMContentLoaded", fn); }
  onReady(function () { document.querySelectorAll(".pflow").forEach(Engine); });
})();
