/* ============================================================
   System Design Field Guide — capacity calculator (.calc)
   The back-of-envelope math every interview asks for, made live.
   Two modes, no eval, no deps:

   1) FIXED model (the default) — the well-known DAU → QPS/storage/
      bandwidth recipe; config only supplies presets + output picks:
     <div class="calc" data-calc>
       <script type="application/json" class="calc-config">
       {
         "title": "URL shortener — capacity",
         "preset": "URL shortener",
         "presets": [
           { "label": "URL shortener", "values": { "dau": 100000000, "writesPerUser": 0.1, "readWrite": 100, "bytesPerItem": 500 } },
           { "label": "Twitter-scale", "values": { "dau": 300000000, "writesPerUser": 2, "readWrite": 100, "bytesPerItem": 300 } }
         ],
         "outputs": ["writeQps","readQps","peakQps","storageTotal","bandwidthOut","servers"]
       }
       </script>
     </div>

   2) CUSTOM model (cfg.model present) — a page declares its own
      inputs and derived outputs as formula strings. Formulas are
      parsed by a tiny arithmetic evaluator (numbers, + - * / and
      parentheses, identifiers, ceil/floor/round/max/min) — NOT
      JavaScript eval. Outputs may reference inputs and any output
      declared before them. A bad formula renders nothing.
       {
         "title": "LLM serving — GPU math",
         "model": {
           "inputs":  [ { "key":"rps", "label":"Peak requests/s", "min":1, "max":5000, "step":1, "def":200, "fmt":"num" }, … ],
           "outputs": [ { "key":"tokSec", "label":"Tokens/s to serve", "formula":"rps * tokOut", "fmt":"num/s", "note":"rps × output tokens" },
                        { "key":"gpus", "label":"GPUs needed", "formula":"ceil(tokSec / (tokPerGpu * util))", "fmt":"num" } ],
           "presets": [ { "label":"Chatbot", "values": { "rps": 200 } } ],
           "summary": "Serving {tokSec} tokens/s needs about {gpus} GPUs."
         }
       }
   ============================================================ */
(function () {
  "use strict";

  var SPECS = {
    dau:          { label: "Daily active users",   min: 100000,  max: 2000000000, step: 100000, def: 100000000, fmt: "num" },
    writesPerUser:{ label: "Writes / user / day",  min: 0.1,     max: 500,        step: 0.1,    def: 2,         fmt: "dec" },
    readWrite:    { label: "Read : write ratio",   min: 1,       max: 1000,       step: 1,      def: 100,       fmt: "ratio" },
    bytesPerItem: { label: "Bytes per write",      min: 50,      max: 50000000,   step: 50,     def: 1000,      fmt: "bytes" },
    retentionYears:{label: "Retention (years)",    min: 1,       max: 10,         step: 1,      def: 5,         fmt: "yr" },
    replication:  { label: "Replication factor",   min: 1,       max: 5,          step: 1,      def: 3,         fmt: "x" },
    peakFactor:   { label: "Peak factor",          min: 1,       max: 10,         step: 0.5,    def: 2,         fmt: "x" },
    perServerQps: { label: "QPS per app server",   min: 100,     max: 50000,      step: 100,    def: 1000,      fmt: "num" }
  };
  var INPUT_ORDER = ["dau", "writesPerUser", "readWrite", "bytesPerItem", "retentionYears", "replication", "peakFactor", "perServerQps"];
  var OUT_DEF = ["writeQps", "readQps", "peakQps", "storageTotal", "bandwidthOut", "servers"];

  function el(t, c, x) { var e = document.createElement(t); if (c) e.className = c; if (x != null) e.textContent = x; return e; }

  function num(n) {
    var a = Math.abs(n);
    if (a >= 1e12) return trim(n / 1e12) + "T";
    if (a >= 1e9) return trim(n / 1e9) + "B";
    if (a >= 1e6) return trim(n / 1e6) + "M";
    if (a >= 1e3) return trim(n / 1e3) + "K";
    return String(Math.round(n));
  }
  function bytes(n) {
    var u = ["B", "KB", "MB", "GB", "TB", "PB", "EB"], i = 0;
    while (n >= 1000 && i < u.length - 1) { n /= 1000; i++; }
    return trim(n) + " " + u[i];
  }
  function trim(n) { return (Math.round(n * 10) / 10).toString(); }
  function fmtIn(spec, v) {
    if (spec.fmt === "num") return num(v);
    if (spec.fmt === "dec") return (Math.round(v * 10) / 10).toString();
    if (spec.fmt === "ratio") return Math.round(v) + ":1";
    if (spec.fmt === "bytes") return bytes(v);
    if (spec.fmt === "yr") return Math.round(v) + " yr";
    if (spec.fmt === "x") return (Math.round(v * 10) / 10) + "×";
    return String(v);
  }

  /* ---------- tiny formula evaluator (custom models) ----------
     numbers · identifiers · + - * / · parentheses · unary minus ·
     ceil/floor/round/max/min(…).  Throws on anything else.       */
  var FUNCS = { ceil: Math.ceil, floor: Math.floor, round: Math.round, max: Math.max, min: Math.min };

  function tokenize(src) {
    var toks = [], re = /\s*(?:(\d+\.?\d*(?:[eE][+-]?\d+)?)|([A-Za-z_][A-Za-z0-9_]*)|([()+\-*/,]))/g, m, last = 0;
    while ((m = re.exec(src))) {
      if (m.index !== last && src.slice(last, m.index).trim()) throw new Error("bad token");
      last = re.lastIndex;
      if (m[1] != null) toks.push({ t: "num", v: parseFloat(m[1]) });
      else if (m[2] != null) toks.push({ t: "id", v: m[2] });
      else toks.push({ t: m[3] });
    }
    if (src.slice(last).trim()) throw new Error("bad token");
    return toks;
  }

  function evalFormula(src, vars) {
    var toks = tokenize(src), p = 0;
    function peek() { return toks[p]; }
    function eat(t) { if (!toks[p] || toks[p].t !== t) throw new Error("expected " + t); return toks[p++]; }
    function expr() {
      var v = term();
      while (peek() && (peek().t === "+" || peek().t === "-")) { var op = toks[p++].t; var r = term(); v = op === "+" ? v + r : v - r; }
      return v;
    }
    function term() {
      var v = factor();
      while (peek() && (peek().t === "*" || peek().t === "/")) { var op = toks[p++].t; var r = factor(); v = op === "*" ? v * r : v / r; }
      return v;
    }
    function factor() {
      var tk = peek();
      if (!tk) throw new Error("unexpected end");
      if (tk.t === "-") { p++; return -factor(); }
      if (tk.t === "num") { p++; return tk.v; }
      if (tk.t === "(") { p++; var v = expr(); eat(")"); return v; }
      if (tk.t === "id") {
        p++;
        if (peek() && peek().t === "(") {
          var fn = FUNCS[tk.v]; if (!fn) throw new Error("unknown fn " + tk.v);
          p++; var args = [expr()];
          while (peek() && peek().t === ",") { p++; args.push(expr()); }
          eat(")");
          return fn.apply(null, args);
        }
        if (!(tk.v in vars)) throw new Error("unknown var " + tk.v);
        return vars[tk.v];
      }
      throw new Error("unexpected " + tk.t);
    }
    var out = expr();
    if (p !== toks.length) throw new Error("trailing tokens");
    if (typeof out !== "number" || !isFinite(out)) throw new Error("not a number");
    return out;
  }

  function fmtOut(fmt, v) {
    if (fmt === "bytes") return bytes(v);
    if (fmt === "bytes/s") return bytes(v) + "/s";
    if (fmt === "num/s") return num(v) + "/s";
    if (fmt === "pct") return trim(v * 100) + "%";
    if (fmt === "dec") return trim(v);
    if (fmt === "x") return trim(v) + "×";
    if (fmt === "ms") return trim(v) + " ms";
    return num(v);
  }

  /* ---------- custom-model calculator (cfg.model) ---------- */
  function initModel(host, cfg) {
    var model = cfg.model;
    var inputs = model.inputs || [], outs = model.outputs || [], presets = model.presets || [];
    if (!inputs.length || !outs.length) return;

    var state = {};
    inputs.forEach(function (sp) { state[sp.key] = sp.def != null ? sp.def : sp.min; });

    /* validate every formula once with the defaults — a typo means
       we leave the host empty rather than show wrong math */
    try {
      var probe = {}; inputs.forEach(function (sp) { probe[sp.key] = state[sp.key]; });
      outs.forEach(function (o) { probe[o.key] = evalFormula(o.formula, probe); });
    } catch (e) { return; }

    host.innerHTML = "";
    var head = el("div", "calc-head");
    head.appendChild(el("span", "calc-title", cfg.title || "Back-of-the-envelope"));
    var presetWrap = el("div", "calc-presets");
    head.appendChild(presetWrap);
    host.appendChild(head);

    var grid = el("div", "calc-grid");
    var inputsCol = el("div", "calc-inputs");
    var outputsCol = el("div", "calc-outputs");
    grid.appendChild(inputsCol); grid.appendChild(outputsCol);
    host.appendChild(grid);
    var note = el("div", "calc-note"); host.appendChild(note);
    if (!model.summary) note.style.display = "none";

    var presetBtns = [];
    presets.forEach(function (p) {
      var b = el("button", "calc-preset", p.label); b.type = "button";
      b.addEventListener("click", function () { applyPreset(p); });
      presetWrap.appendChild(b); presetBtns.push({ b: b, p: p });
    });
    function markPreset(p) { presetBtns.forEach(function (x) { x.b.classList.toggle("active", x.p === p); }); }

    var valEls = {}, ranges = {};
    inputs.forEach(function (sp) {
      var row = el("div", "calc-irow");
      row.appendChild(el("span", "calc-ilabel", sp.label));
      var val = el("span", "calc-ival", fmtOut(sp.fmt, state[sp.key]));
      row.appendChild(val);
      var inp = document.createElement("input");
      inp.type = "range"; inp.min = sp.min; inp.max = Math.max(sp.max, state[sp.key]); inp.step = sp.step || 1; inp.value = state[sp.key];
      inp.addEventListener("input", function () { state[sp.key] = +inp.value; val.textContent = fmtOut(sp.fmt, state[sp.key]); markPreset(null); render(); });
      row.appendChild(inp);
      inputsCol.appendChild(row);
      valEls[sp.key] = val; ranges[sp.key] = inp;
    });

    function applyPreset(p) {
      Object.keys(p.values || {}).forEach(function (k) {
        if (!(k in state)) return;
        state[k] = p.values[k];
        var sp = null; inputs.forEach(function (x) { if (x.key === k) sp = x; });
        if (ranges[k]) { ranges[k].max = Math.max(+ranges[k].max, state[k]); ranges[k].value = state[k]; }
        if (valEls[k] && sp) valEls[k].textContent = fmtOut(sp.fmt, state[k]);
      });
      markPreset(p); render();
    }

    function render() {
      var vars = {}; inputs.forEach(function (sp) { vars[sp.key] = state[sp.key]; });
      var shown = {};
      outputsCol.innerHTML = "";
      try {
        outs.forEach(function (o) {
          vars[o.key] = evalFormula(o.formula, vars);
          shown[o.key] = fmtOut(o.fmt, vars[o.key]);
        });
      } catch (e) { return; }
      outs.forEach(function (o) {
        var card = el("div", "calc-out");
        card.appendChild(el("div", "co-k", o.label));
        var v = el("div", "co-v"); v.innerHTML = "<b>" + shown[o.key] + "</b>"; card.appendChild(v);
        if (o.note) card.appendChild(el("div", "co-f", o.note));
        outputsCol.appendChild(card);
      });
      if (model.summary) {
        note.innerHTML = model.summary.replace(/\{(\w+)\}/g, function (_, k) {
          return shown[k] != null ? "<b>" + shown[k] + "</b>" : "{" + k + "}";
        });
      }
    }

    if (presets.length) { markPreset(presets[0]); applyPreset(presets[0]); }
    else render();
  }

  function init(host) {
    var cfg = {};
    var sEl = host.querySelector(".calc-config") || host.querySelector("script[type='application/json']");
    if (sEl) { try { cfg = JSON.parse(sEl.textContent) || {}; } catch (e) { cfg = {}; } }
    if (cfg.model) { initModel(host, cfg); return; }
    var presets = cfg.presets || [];
    var outputs = cfg.outputs || OUT_DEF;

    // starting values: spec defaults, overlaid by the selected (or first) preset
    var state = {}; INPUT_ORDER.forEach(function (k) { state[k] = SPECS[k].def; });
    var chosen = null;
    if (presets.length) {
      chosen = presets[0];
      if (cfg.preset) presets.forEach(function (p) { if (p.label === cfg.preset) chosen = p; });
      Object.keys(chosen.values || {}).forEach(function (k) { if (k in state) state[k] = chosen.values[k]; });
    }

    host.innerHTML = "";
    var head = el("div", "calc-head");
    head.appendChild(el("span", "calc-title", cfg.title || "Back-of-the-envelope"));
    var presetWrap = el("div", "calc-presets");
    head.appendChild(presetWrap);
    host.appendChild(head);

    var grid = el("div", "calc-grid");
    var inputsCol = el("div", "calc-inputs");
    var outputsCol = el("div", "calc-outputs");
    grid.appendChild(inputsCol); grid.appendChild(outputsCol);
    host.appendChild(grid);
    var note = el("div", "calc-note"); host.appendChild(note);

    // preset chips
    var presetBtns = [];
    presets.forEach(function (p) {
      var b = el("button", "calc-preset", p.label); b.type = "button";
      b.addEventListener("click", function () { applyPreset(p); });
      presetWrap.appendChild(b); presetBtns.push({ b: b, p: p });
    });
    function markPreset(p) { presetBtns.forEach(function (x) { x.b.classList.toggle("active", x.p === p); }); }

    // input rows
    var valEls = {}, inputs = {};
    INPUT_ORDER.forEach(function (k) {
      var spec = SPECS[k];
      var row = el("div", "calc-irow");
      row.appendChild(el("span", "calc-ilabel", spec.label));
      var val = el("span", "calc-ival", fmtIn(spec, state[k]));
      row.appendChild(val);
      var inp = document.createElement("input");
      inp.type = "range"; inp.min = spec.min; inp.max = Math.max(spec.max, state[k]); inp.step = spec.step; inp.value = state[k];
      inp.addEventListener("input", function () { state[k] = +inp.value; val.textContent = fmtIn(spec, state[k]); markPreset(null); render(); });
      row.appendChild(inp);
      inputsCol.appendChild(row);
      valEls[k] = val; inputs[k] = inp;
    });

    function applyPreset(p) {
      Object.keys(p.values || {}).forEach(function (k) {
        if (!(k in state)) return;
        state[k] = p.values[k];
        if (inputs[k]) { inputs[k].max = Math.max(SPECS[k].max, state[k]); inputs[k].value = state[k]; }
        if (valEls[k]) valEls[k].textContent = fmtIn(SPECS[k], state[k]);
      });
      markPreset(p); render();
    }

    function compute() {
      var writeQps = state.dau * state.writesPerUser / 86400;
      var readQps = writeQps * state.readWrite;
      var peakQps = (writeQps + readQps) * state.peakFactor;
      var storageDay = state.dau * state.writesPerUser * state.bytesPerItem;
      var storageTotal = storageDay * 365 * state.retentionYears * state.replication;
      var bandwidthOut = readQps * state.bytesPerItem;
      var bandwidthIn = writeQps * state.bytesPerItem;
      var servers = Math.max(1, Math.ceil(peakQps / state.perServerQps));
      return { writeQps: writeQps, readQps: readQps, peakQps: peakQps, storageDay: storageDay, storageTotal: storageTotal, bandwidthOut: bandwidthOut, bandwidthIn: bandwidthIn, servers: servers };
    }

    var OUTMETA = {
      writeQps:     { k: "Write QPS (avg)", f: "DAU × writes ÷ 86,400", show: function (r) { return num(r.writeQps) + "/s"; } },
      readQps:      { k: "Read QPS (avg)",  f: "write QPS × R:W",        show: function (r) { return num(r.readQps) + "/s"; } },
      peakQps:      { k: "Peak QPS",        f: "(read+write) × peak",    show: function (r) { return num(r.peakQps) + "/s"; } },
      storageDay:   { k: "New data / day",  f: "DAU × writes × bytes",   show: function (r) { return bytes(r.storageDay); } },
      storageTotal: { k: "Total storage",   f: "/day × 365 × yrs × repl", show: function (r) { return bytes(r.storageTotal); } },
      bandwidthOut: { k: "Read bandwidth",  f: "read QPS × bytes",       show: function (r) { return bytes(r.bandwidthOut) + "/s"; } },
      bandwidthIn:  { k: "Write bandwidth", f: "write QPS × bytes",      show: function (r) { return bytes(r.bandwidthIn) + "/s"; } },
      servers:      { k: "App servers",     f: "⌈ peak QPS ÷ per-server ⌉", show: function (r) { return num(r.servers); } }
    };

    function render() {
      var r = compute();
      outputsCol.innerHTML = "";
      outputs.forEach(function (key) {
        var m = OUTMETA[key]; if (!m) return;
        var card = el("div", "calc-out");
        card.appendChild(el("div", "co-k", m.k));
        var v = el("div", "co-v"); v.innerHTML = "<b>" + m.show(r) + "</b>"; card.appendChild(v);
        card.appendChild(el("div", "co-f", m.f));
        outputsCol.appendChild(card);
      });
      note.innerHTML = "Peak ≈ <b>" + num(r.peakQps) + " req/s</b> → about <b>" + num(r.servers) +
        "</b> stateless app servers; roughly <b>" + bytes(r.storageTotal) + "</b> stored over " +
        Math.round(state.retentionYears) + " years at " + Math.round(state.replication) + "× replication.";
    }

    if (chosen) markPreset(chosen);
    render();
  }

  function onReady(fn) { if (document.readyState !== "loading") fn(); else document.addEventListener("DOMContentLoaded", fn); }
  onReady(function () { document.querySelectorAll(".calc").forEach(init); });
})();
