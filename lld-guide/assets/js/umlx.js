/* ============================================================
   The Design Field Guide — UML explorer (.umlx)
   An interactive class diagram. Click (or arrow-key to) a class:
   its direct relationships stay lit while the rest of the model
   dims, and a panel explains the class's responsibility and which
   PATTERN ROLE it plays ("this is the Strategy interface", "this
   is the Command's receiver"). Relationship-type chips toggle
   whole edge families on/off — isolate "just the composition
   spine" or "just the inheritance tree" of a big design.
   Offline, theme-aware, keyboard-accessible, reduced-motion safe.

   Authoring:
     <figure class="umlx" data-umlx>
       <figcaption class="ux-title">Parking-lot class model</figcaption>
       <script type="application/json" class="ux-config">
       {
         "classes": [
           { "id":"lot", "name":"ParkingLot", "col":1, "row":0,
             "attrs":["floors: list[Floor]"],
             "methods":[{ "sig":"park(v) → Ticket", "role":"the Facade entry point" }],
             "role":"Facade", "duty":"Single entry point; owns floors + tickets." },
           { "id":"spot", "name":"ParkingSpot", "kind":"abstract", "col":0, "row":1,
             "attrs":["id: str"], "methods":["fits(v) → bool"] }
         ],
         "relations": [
           { "from":"lot", "to":"floor", "type":"compose", "label":"1..*" },
           { "from":"compact", "to":"spot", "type":"inherit" },
           { "from":"lot", "to":"strategy", "type":"depend", "label":"uses" }
         ]
       }
       </script>
     </figure>

   kind: class (default) · abstract · interface (name italic + stereo).
   relation type: inherit · implement · compose · aggregate · assoc ·
   depend — drawn with the proper UML arrowheads/diamonds at the
   "to" end (ownership diamonds sit at the OWNER, so author compose/
   aggregate edges as  from = part-side… no: from = owner? We keep it
   simple and visual: the diamond is drawn at the "to" end, so write
   { "from":"floor", "to":"lot", "type":"compose" } = "Floor is part
   of ParkingLot" — the diamond lands on ParkingLot, as UML draws it.
   Likewise inherit/implement point "to" the parent/interface.
   ============================================================ */
(function () {
  "use strict";
  var SVGNS = "http://www.w3.org/2000/svg";
  var REDUCED = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  var UW = 188, GAPX = 74, GAPY = 56, PAD = 26, HW = UW / 2;
  var NAMEH = 27, STEREOH = 13, LINEH = 14.5, COMPPAD = 7;

  /* label = chip text · fwd = sentence verb when reading from→to
     (compose/aggregate edges are authored part → owner, diamond at owner) */
  var RTYPES = {
    inherit:   { label: "inheritance", fwd: "inherits",        dash: false },
    implement: { label: "implements",  fwd: "implements",      dash: true  },
    compose:   { label: "composition", fwd: "is part of",      dash: false },
    aggregate: { label: "aggregation", fwd: "is held by",      dash: false },
    assoc:     { label: "association", fwd: "associates with", dash: false },
    depend:    { label: "dependency",  fwd: "depends on",      dash: true  }
  };

  function svg(tag, attrs) {
    var e = document.createElementNS(SVGNS, tag);
    if (attrs) for (var k in attrs) e.setAttribute(k, attrs[k]);
    return e;
  }
  function el(t, c, html) { var e = document.createElement(t); if (c) e.className = c; if (html != null) e.innerHTML = html; return e; }

  function methodSig(m) { return typeof m === "string" ? m : (m.sig || ""); }
  function methodRole(m) { return typeof m === "string" ? null : (m.role || null); }

  function Engine(fig) {
    var confEl = fig.querySelector(".ux-config");
    if (!confEl) return;
    var cfg; try { cfg = JSON.parse(confEl.textContent); } catch (e) { return; }
    var classes = cfg.classes || [], relations = (cfg.relations || []).filter(function (r) { return RTYPES[r.type]; });
    if (!classes.length) return;

    /* ---- chrome ---- */
    var chips = el("div", "ux-chips");
    var stage = el("div", "ux-stage");
    var panel = el("div", "ux-panel");
    fig.appendChild(chips); fig.appendChild(stage); fig.appendChild(panel);

    /* ---- per-class box height ---- */
    function boxH(c) {
      var h = NAMEH + (c.kind && c.kind !== "class" ? STEREOH : 0);
      var na = (c.attrs || []).length, nm = (c.methods || []).length;
      if (na) h += COMPPAD * 2 + na * LINEH;
      if (nm) h += COMPPAD * 2 + nm * LINEH;
      if (!na && !nm) h += 6;
      return h;
    }

    /* ---- layout: variable row heights ---- */
    var maxCol = 0, maxRow = 0;
    classes.forEach(function (c) { maxCol = Math.max(maxCol, c.col || 0); maxRow = Math.max(maxRow, c.row || 0); });
    var rowH = [];
    for (var r = 0; r <= maxRow; r++) {
      var h = 40;
      classes.forEach(function (c) { if ((c.row || 0) === r) h = Math.max(h, boxH(c)); });
      rowH.push(h);
    }
    var rowY = [], acc = PAD;
    rowH.forEach(function (h) { rowY.push(acc); acc += h + GAPY; });
    var width = PAD * 2 + (maxCol + 1) * UW + maxCol * GAPX;
    var height = acc - GAPY + PAD;

    var geom = {}, byId = {};
    classes.forEach(function (c) {
      byId[c.id] = c;
      var x = PAD + (c.col || 0) * (UW + GAPX);
      var rr = c.row || 0;
      var h = boxH(c);
      var y = rowY[rr] + (rowH[rr] - h) / 2;
      geom[c.id] = { x: x, y: y, w: UW, h: h, cx: x + HW, cy: y + h / 2 };
    });

    var s = svg("svg", { class: "ux-svg", viewBox: "0 0 " + width + " " + height });
    stage.appendChild(s);

    /* boundary point on a class box's edge toward (tx, ty) */
    function boundary(g, tx, ty) {
      var dx = tx - g.cx, dy = ty - g.cy;
      if (dx === 0 && dy === 0) return { x: g.cx, y: g.cy };
      var sx = dx !== 0 ? (g.w / 2) / Math.abs(dx) : Infinity;
      var sy = dy !== 0 ? (g.h / 2) / Math.abs(dy) : Infinity;
      var sc = Math.min(sx, sy);
      return { x: g.cx + dx * sc, y: g.cy + dy * sc };
    }

    /* ---- edges ---- */
    var edgeEls = [];
    relations.forEach(function (rel) {
      var a = geom[rel.from], b = geom[rel.to];
      if (!a || !b) return;
      var p1 = boundary(a, b.cx, b.cy), p2 = boundary(b, a.cx, a.cy);
      var dx = p2.x - p1.x, dy = p2.y - p1.y, L = Math.sqrt(dx * dx + dy * dy) || 1, ux = dx / L, uy = dy / L;
      var px = -uy, py = ux;
      var g = svg("g", { class: "ux-edge t-" + rel.type, "data-type": rel.type });
      var headLen = 0, headEl = null;

      if (rel.type === "inherit" || rel.type === "implement") {
        headLen = 13;
        headEl = svg("polygon", {
          class: "ux-tri",
          points: p2.x + "," + p2.y + " " + (p2.x - ux * 13 + px * 7.5) + "," + (p2.y - uy * 13 + py * 7.5) + " " + (p2.x - ux * 13 - px * 7.5) + "," + (p2.y - uy * 13 - py * 7.5)
        });
      } else if (rel.type === "compose" || rel.type === "aggregate") {
        headLen = 18;
        var m1x = p2.x - ux * 9 + px * 5.5, m1y = p2.y - uy * 9 + py * 5.5;
        var m2x = p2.x - ux * 18, m2y = p2.y - uy * 18;
        var m3x = p2.x - ux * 9 - px * 5.5, m3y = p2.y - uy * 9 - py * 5.5;
        headEl = svg("polygon", {
          class: rel.type === "compose" ? "ux-dia fill" : "ux-dia",
          points: p2.x + "," + p2.y + " " + m1x + "," + m1y + " " + m2x + "," + m2y + " " + m3x + "," + m3y
        });
      } else if (rel.type === "depend") {
        headLen = 11;
        headEl = svg("polyline", {
          class: "ux-open",
          points: (p2.x - ux * 11 + px * 6) + "," + (p2.y - uy * 11 + py * 6) + " " + p2.x + "," + p2.y + " " + (p2.x - ux * 11 - px * 6) + "," + (p2.y - uy * 11 - py * 6)
        });
      }

      var line = svg("line", {
        class: "ux-line" + (RTYPES[rel.type].dash ? " dash" : ""),
        x1: p1.x, y1: p1.y, x2: p2.x - ux * headLen, y2: p2.y - uy * headLen
      });
      g.appendChild(line);
      if (headEl) g.appendChild(headEl);
      if (rel.label) {
        var t = svg("text", { class: "ux-elabel", x: (p1.x + p2.x) / 2 + px * 10, y: (p1.y + p2.y) / 2 + py * 10 });
        t.textContent = rel.label; g.appendChild(t);
      }
      s.appendChild(g);
      edgeEls.push({ g: g, rel: rel });
    });

    /* ---- class boxes ---- */
    var nodeEls = {};
    classes.forEach(function (c) {
      var g0 = geom[c.id];
      var g = svg("g", { class: "ux-class" + (c.kind === "abstract" ? " is-abstract" : "") + (c.kind === "interface" ? " is-interface" : ""), "data-id": c.id });
      g.setAttribute("tabindex", "0"); g.setAttribute("role", "button");
      g.setAttribute("aria-label", c.name + (c.role ? ", pattern role: " + c.role : ""));
      g.appendChild(svg("rect", { class: "ux-rect", x: g0.x, y: g0.y, width: g0.w, height: g0.h, rx: 9 }));

      var nameH = NAMEH + (c.kind && c.kind !== "class" ? STEREOH : 0);
      g.appendChild(svg("rect", { class: "ux-namebar", x: g0.x, y: g0.y, width: g0.w, height: nameH, rx: 9 }));
      g.appendChild(svg("rect", { class: "ux-namebar nb2", x: g0.x, y: g0.y + 9, width: g0.w, height: nameH - 9 }));
      var ty = g0.y;
      if (c.kind && c.kind !== "class") {
        var st = svg("text", { class: "ux-stereo", x: g0.cx, y: g0.y + 11 });
        st.textContent = "«" + c.kind + "»"; g.appendChild(st);
        ty += STEREOH;
      }
      var nm = svg("text", { class: "ux-name", x: g0.cx, y: ty + 18 });
      nm.textContent = c.name; g.appendChild(nm);
      var y = g0.y + nameH;

      var na = (c.attrs || []).length;
      if (na) {
        g.appendChild(svg("line", { class: "ux-sep", x1: g0.x, y1: y, x2: g0.x + g0.w, y2: y }));
        (c.attrs || []).forEach(function (a2, i) {
          var t = svg("text", { class: "ux-member", x: g0.x + 10, y: y + COMPPAD + (i + 1) * LINEH - 3 });
          t.textContent = a2; g.appendChild(t);
        });
        y += COMPPAD * 2 + na * LINEH;
      }
      var nmth = (c.methods || []).length;
      if (nmth) {
        g.appendChild(svg("line", { class: "ux-sep", x1: g0.x, y1: y, x2: g0.x + g0.w, y2: y }));
        (c.methods || []).forEach(function (m, i) {
          var t = svg("text", { class: "ux-member", x: g0.x + 10, y: y + COMPPAD + (i + 1) * LINEH - 3 });
          t.textContent = methodSig(m); g.appendChild(t);
        });
      }
      if (c.role) {
        var badge = svg("text", { class: "ux-rolebadge", x: g0.x + g0.w - 7, y: g0.y + 13 });
        badge.textContent = "◆"; g.appendChild(badge);
      }
      s.appendChild(g);
      nodeEls[c.id] = g;

      g.addEventListener("click", function () { select(c.id === selected ? null : c.id); });
      g.addEventListener("keydown", function (e) {
        if (e.key === "Enter" || e.key === " ") { select(c.id === selected ? null : c.id); e.preventDefault(); }
      });
    });

    /* ---- relationship-type toggle chips ---- */
    var present = [];
    relations.forEach(function (r) { if (present.indexOf(r.type) === -1) present.push(r.type); });
    var typeOn = {};
    present.forEach(function (tp, k) {
      typeOn[tp] = true;
      var b = el("button", "ux-chip t-" + tp + " active", "<i></i>" + RTYPES[tp].label);
      b.type = "button"; b.setAttribute("aria-pressed", "true");
      b.addEventListener("click", function () {
        typeOn[tp] = !typeOn[tp];
        b.classList.toggle("active", typeOn[tp]);
        b.setAttribute("aria-pressed", String(typeOn[tp]));
        paint();
      });
      chips.appendChild(b);
    });

    /* ---- selection + dimming ---- */
    var selected = null;

    function neighbors(id) {
      var set = {};
      relations.forEach(function (r) {
        if (!typeOn[r.type]) return;
        if (r.from === id) set[r.to] = true;
        if (r.to === id) set[r.from] = true;
      });
      return set;
    }

    function paint() {
      var nb = selected ? neighbors(selected) : null;
      classes.forEach(function (c) {
        var g = nodeEls[c.id];
        g.classList.toggle("sel", c.id === selected);
        g.classList.toggle("dim", !!selected && c.id !== selected && !nb[c.id]);
      });
      edgeEls.forEach(function (ee) {
        var off = !typeOn[ee.rel.type];
        ee.g.classList.toggle("off", off);
        var touches = selected && (ee.rel.from === selected || ee.rel.to === selected);
        ee.g.classList.toggle("dim", !!selected && !touches);
        ee.g.classList.toggle("lit", !!touches && !off);
      });
      renderPanel();
    }

    function relSentences(id) {
      var out = [];
      relations.forEach(function (r) {
        if (!typeOn[r.type]) return;
        var other = null, verb = RTYPES[r.type].fwd;
        if (r.from === id) { other = byId[r.to]; }
        else if (r.to === id) {       /* read reversed edges naturally */
          other = byId[r.from];
          verb = ({ inherit: "is extended by", implement: "is implemented by", compose: "owns (composition)", aggregate: "holds (aggregation)", assoc: "associates with", depend: "is used by" })[r.type];
        }
        if (other && verb) out.push("<b>" + verb + "</b> " + other.name + (r.label ? " <i>(" + r.label + ")</i>" : ""));
      });
      return out;
    }

    function renderPanel() {
      panel.innerHTML = "";
      if (!selected) {
        panel.appendChild(el("p", "ux-hint", cfg.idle || "Click a class (or Tab + Enter) to see its responsibility, pattern role, and direct relationships. Chips above hide whole relationship families."));
        return;
      }
      var c = byId[selected];
      var head = el("div", "ux-phead");
      head.appendChild(el("span", "ux-pname", c.name));
      if (c.kind && c.kind !== "class") head.appendChild(el("span", "ux-pkind", "«" + c.kind + "»"));
      if (c.role) head.appendChild(el("span", "ux-prole", "pattern role · " + c.role));
      panel.appendChild(head);
      if (c.duty) panel.appendChild(el("p", "ux-pduty", c.duty));
      var sents = relSentences(selected);
      if (sents.length) {
        var ul = el("ul", "ux-prels");
        sents.forEach(function (s2) { ul.appendChild(el("li", null, s2)); });
        panel.appendChild(ul);
      }
      var withRoles = (c.methods || []).filter(function (m) { return methodRole(m); });
      if (withRoles.length) {
        var dl = el("div", "ux-pmethods");
        withRoles.forEach(function (m) {
          dl.appendChild(el("div", "ux-pm", "<code>" + methodSig(m) + "</code><span>" + methodRole(m) + "</span>"));
        });
        panel.appendChild(dl);
      }
    }

    function select(id) { selected = id; paint(); }

    /* ---- figure-level keyboard: cycle classes ---- */
    fig.setAttribute("tabindex", "0");
    fig.addEventListener("keydown", function (e) {
      if (e.key === "Escape") { select(null); e.preventDefault(); return; }
      if (e.target !== fig) return;
      var idx = classes.findIndex(function (c) { return c.id === selected; });
      if (e.key === "ArrowRight") { select(classes[(idx + 1) % classes.length].id); e.preventDefault(); }
      else if (e.key === "ArrowLeft") { select(classes[(idx - 1 + classes.length) % classes.length].id); e.preventDefault(); }
      else {
        var d = parseInt(e.key, 10);
        if (d >= 1 && d <= present.length) {
          var btns = chips.querySelectorAll(".ux-chip");
          if (btns[d - 1]) btns[d - 1].click();
          e.preventDefault();
        }
      }
    });

    paint();
  }

  function onReady(fn) { if (document.readyState !== "loading") fn(); else document.addEventListener("DOMContentLoaded", fn); }
  onReady(function () { document.querySelectorAll(".umlx").forEach(Engine); });
})();
