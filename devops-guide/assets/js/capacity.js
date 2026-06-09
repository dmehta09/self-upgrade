/* ============================================================
   System Design Field Guide — capacity calculator (.calc)
   The back-of-envelope math every interview asks for, made live.
   A fixed, well-known estimation model; the config only supplies
   input defaults/labels and named scenario presets. No eval, no deps.

   Authoring:
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

  function init(host) {
    var cfg = {};
    var sEl = host.querySelector(".calc-config") || host.querySelector("script[type='application/json']");
    if (sEl) { try { cfg = JSON.parse(sEl.textContent) || {}; } catch (e) { cfg = {}; } }
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
