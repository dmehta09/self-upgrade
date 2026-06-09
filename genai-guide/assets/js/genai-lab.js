/* ============================================================
   GenAI Field Guide — genai-lab
   Browser-only, offline teaching toys. One module, several data-modes:
     • tokenizer  — text → subword tokens + ids + count + cost
     • chunking   — (Phase 1 remainder) document → chunks w/ overlap
     • prompt     — (Phase 1 remainder) template + vars → role messages
   Each widget is <div class="genai-lab" data-mode="…"> with an inline
   <script type="application/json" class="gl-config">{…}</script>.
   The tokenizer is an ILLUSTRATIVE greedy longest-match over a small
   embedded vocab — it teaches the idea (tokens != words, whitespace
   attaches to the next token, rare words fragment, casing matters); it
   is NOT byte-identical to any production tokenizer.
   ============================================================ */
(function () {
  "use strict";

  /* ---------- embedded illustrative vocab ---------- */
  var VOCAB = [], VMAP = {};
  function add(t) { if (VMAP[t] === undefined) { VMAP[t] = VOCAB.length; VOCAB.push(t); } }
  // Common whole words (space-prefixed first so they read like real low-id tokens)
  (" the, of, and, a, to, in, is, you, that, it, he, was, for, on, are, as, with, his, they, I, at, be, this, have, from, or, one, had, by, word, but, not, what, all, were, we, when, your, can, said, there, use, an, each, which, she, do, how, their, if, will, up, other, about, out, many, then, them, these, so, some, her, would, make, like, him, into, time, has, look, two, more, write, go, see, number, no, way, could, people, my, than, first, water, been, call, who, oil, its, now, find, long, down, day, did, get, come, made, may, part, model, models, token, tokens, text, words, language, learn, data, prompt, vector, search, agent, image, sound, video, cat, cats, dog, dogs, sat, mat, ran, the cat, a cat")
    .split(",").forEach(function (w) { var s = w.replace(/^\s+/, " "); if (s.charAt(0) !== " ") s = " " + s.trim(); add(s); add(s.trim()); });
  // Capitalised sentence-openers
  "The,A,An,I,It,This,That,We,You,They,He,She,Hello,Generative,GPT,AI,RAG,LLM".split(",").forEach(add);
  // Common subword fragments (so unknown words fragment believably)
  "ing,ed,er,est,ly,tion,ization,ize,izer,ment,ness,able,ful,less,ous,ive,al,ic,ity,ent,ant,pre,re,un,non,sub,inter,multi,over,under,token,izer,straw,berry,emb,edd,att,ent,ion".split(",").forEach(add);
  // Digits and a few common numbers
  "0,1,2,3,4,5,6,7,8,9,10,100,2024,2025,2026".split(",").forEach(function (d) { add(d); add(" " + d); });
  // Letters (guaranteed fallback so any word resolves to known sub-tokens), both cases
  "abcdefghijklmnopqrstuvwxyz".split("").forEach(function (c) { add(c); add(c.toUpperCase()); add(" " + c); add(" " + c.toUpperCase()); });
  // Punctuation + space
  [" ", ".", ",", "!", "?", ";", ":", "'", '"', "(", ")", "-", "/", "\n", " (", "’", "—", "…"].forEach(add);

  var PRE = /'s|'t|'re|'ve|'m|'ll|'d| ?[A-Za-z]+| ?[0-9]+| ?[^\sA-Za-z0-9]+|\s+/g;

  function tokenize(text) {
    var out = [], m;
    PRE.lastIndex = 0;
    while ((m = PRE.exec(text)) !== null) {
      var piece = m[0];
      if (/^\s+$/.test(piece)) {            // a run of whitespace → one token per char
        for (var k = 0; k < piece.length; k++) out.push(mk(piece[k]));
        continue;
      }
      var i = 0;
      while (i < piece.length) {            // greedy longest-match
        var matched = null;
        for (var j = piece.length; j > i; j--) {
          var sub = piece.slice(i, j);
          if (VMAP[sub] !== undefined) { matched = sub; break; }
        }
        if (matched) { out.push(mk(matched)); i += matched.length; }
        else { out.push(mk(piece[i])); i += 1; }
      }
    }
    return out;
  }
  function mk(tok) {
    var known = VMAP[tok] !== undefined;
    var id = known ? VMAP[tok] : (60000 + (tok.codePointAt(0) || 0));
    return { tok: tok, id: id, known: known };
  }

  /* ---------- helpers ---------- */
  function el(tag, cls, txt) { var e = document.createElement(tag); if (cls) e.className = cls; if (txt != null) e.textContent = txt; return e; }
  function display(tok) {
    if (tok === "\n") return "⏎";
    return tok.replace(/ /g, "·");          // show leading/standalone spaces as middot
  }
  function parseConfig(host) {
    var s = host.querySelector(".gl-config");
    if (!s) return {};
    try { return JSON.parse(s.textContent) || {}; } catch (e) { return {}; }
  }

  /* ---------- tokenizer widget ---------- */
  function initTokenizer(host) {
    var cfg = parseConfig(host);
    var presets = cfg.presets || [
      { label: "a sentence", text: "The cats sat on the mats." },
      { label: "code", text: "def add(a, b):\n    return a + b" },
      { label: "a rare word", text: "antidisestablishmentarianism" },
      { label: "spelling", text: "How many r's are in strawberry?" }
    ];
    var pricing = cfg.pricing || [
      { model: "Haiku-class ($0.80/1M in)", perM: 0.80 },
      { model: "mini-class ($0.15/1M in)", perM: 0.15 },
      { model: "frontier ($3.00/1M in)", perM: 3.00 }
    ];
    var initial = cfg.text || presets[0].text;

    host.innerHTML = "";
    var head = el("div", "gl-head");
    head.appendChild(el("span", "gl-title", cfg.title || "Tokenizer playground"));
    var presetWrap = el("div", "gl-presets");
    presets.forEach(function (p) {
      var b = el("button", "gl-preset", p.label); b.type = "button";
      b.addEventListener("click", function () { ta.value = p.text; render(); });
      presetWrap.appendChild(b);
    });
    head.appendChild(presetWrap);
    host.appendChild(head);

    var ta = el("textarea", "gl-editor"); ta.value = initial; ta.spellcheck = false;
    ta.setAttribute("aria-label", "Text to tokenize");
    host.appendChild(ta);

    var toks = el("div", "gl-tokens"); toks.setAttribute("aria-live", "polite");
    host.appendChild(toks);

    var stats = el("div", "gl-stats");
    host.appendChild(stats);

    var costRow = el("div", "gl-cost");
    var sel = el("select", "gl-model"); sel.setAttribute("aria-label", "Pricing tier");
    pricing.forEach(function (p, i) { var o = el("option", null, p.model); o.value = i; sel.appendChild(o); });
    var costOut = el("span", "gl-cost-out");
    costRow.appendChild(el("span", "gl-cost-label", "Cost for one pass:"));
    costRow.appendChild(costOut);
    costRow.appendChild(sel);
    host.appendChild(costRow);

    function render() {
      var text = ta.value;
      var tokens = tokenize(text);
      toks.innerHTML = "";
      tokens.forEach(function (t, i) {
        var chip = el("span", "gl-tok" + (i % 2 ? " alt" : "") + (t.known ? "" : " unk"), display(t.tok));
        chip.title = "id " + t.id + "  ·  " + JSON.stringify(t.tok);
        toks.appendChild(chip);
      });
      var nChars = text.length, nToks = tokens.length;
      var ratio = nToks ? (nChars / nToks).toFixed(2) : "0";
      stats.innerHTML = "";
      stats.appendChild(stat(nChars, "characters"));
      stats.appendChild(stat(nToks, "tokens"));
      stats.appendChild(stat(ratio, "chars / token"));
      updateCost(nToks);
    }
    function updateCost(nToks) {
      var p = pricing[+sel.value] || pricing[0];
      var c = nToks * (p.perM / 1e6);
      costOut.textContent = "$" + c.toFixed(7) + "  (" + nToks + " tok)";
    }
    function stat(v, label) {
      var b = el("div", "gl-stat");
      b.appendChild(el("b", null, String(v)));
      b.appendChild(el("span", null, label));
      return b;
    }
    ta.addEventListener("input", render);
    sel.addEventListener("change", function () { updateCost(tokenize(ta.value).length); });
    render();
  }

  function statBlock(v, label) { var b = el("div", "gl-stat"); b.appendChild(el("b", null, String(v))); b.appendChild(el("span", null, label)); return b; }
  function sliderRow(label, min, max, val) {
    var r = el("label", "gl-srow"); r.appendChild(el("span", "gl-slabel", label));
    var inp = document.createElement("input"); inp.type = "range"; inp.min = min; inp.max = max; inp.value = val; inp.className = "gl-slider";
    var out = el("span", "gl-sval", String(val)); r.appendChild(inp); r.appendChild(out);
    return { row: r, input: inp, out: out };
  }

  /* ---------- chunking widget ---------- */
  function initChunking(host) {
    var cfg = parseConfig(host);
    var docs = cfg.docs || [{ label: "FAQ snippet", text: "To reset your password, open Settings and choose Security. Click Reset password, then follow the link we email you. The link expires after one hour. If it expires, request a new one. For shared accounts, only the workspace owner can reset the password, and members must ask an admin for help." }];
    var def = cfg.defaults || { size: 18, overlap: 5 };
    host.innerHTML = "";
    var head = el("div", "gl-head"); head.appendChild(el("span", "gl-title", cfg.title || "RAG chunking visualizer")); host.appendChild(head);
    var ctrls = el("div", "gs-ctrls");
    var sizeS = sliderRow("chunk size (words)", 6, 50, def.size);
    var ovS = sliderRow("overlap (words)", 0, 20, def.overlap);
    ctrls.appendChild(sizeS.row); ctrls.appendChild(ovS.row); host.appendChild(ctrls);
    var qrow = el("label", "gl-srow"); qrow.appendChild(el("span", "gl-slabel", "query"));
    var q = document.createElement("input"); q.type = "text"; q.className = "gl-qinput"; q.value = "how do I reset my password?";
    qrow.appendChild(q); host.appendChild(qrow);
    var docEl = el("div", "gl-doc"); host.appendChild(docEl);
    var stats = el("div", "gl-stats"); host.appendChild(stats);
    var words = docs[0].text.split(/\s+/);

    function render() {
      var size = +sizeS.input.value, overlap = Math.min(+ovS.input.value, size - 1);
      sizeS.out.textContent = size; ovS.out.textContent = overlap;
      var step = Math.max(1, size - overlap), chunks = [];
      for (var i = 0; i < words.length; i += step) {
        chunks.push({ start: i, words: words.slice(i, i + size) });
        if (i + size >= words.length) break;
      }
      var qw = (q.value.toLowerCase().match(/[a-z0-9']+/g) || []);
      chunks.forEach(function (c) {
        var set = {}; c.words.forEach(function (w) { set[w.toLowerCase().replace(/[^a-z0-9']/g, "")] = 1; });
        c.score = qw.reduce(function (s, w) { return s + (set[w] ? 1 : 0); }, 0);
      });
      var ranked = chunks.slice().sort(function (a, b) { return b.score - a.score; });
      var top = {}; ranked.slice(0, 2).forEach(function (c) { if (c.score > 0) top[c.start] = 1; });
      docEl.innerHTML = "";
      chunks.forEach(function (c, ci) {
        var band = el("div", "gl-chunk" + (top[c.start] ? " retrieved" : "")); band.style.setProperty("--ci", ci % 4);
        band.appendChild(el("span", "gl-chunk-tag", "chunk " + (ci + 1) + (top[c.start] ? " · retrieved ✓" : "")));
        band.appendChild(document.createTextNode(c.words.join(" ")));
        docEl.appendChild(band);
      });
      stats.innerHTML = "";
      stats.appendChild(statBlock(chunks.length, "chunks"));
      stats.appendChild(statBlock(Object.keys(top).length, "retrieved"));
      stats.appendChild(statBlock(overlap, "overlap words"));
    }
    sizeS.input.addEventListener("input", render); ovS.input.addEventListener("input", render); q.addEventListener("input", render);
    render();
  }

  /* ---------- prompt-template widget ---------- */
  function initPrompt(host) {
    var cfg = parseConfig(host);
    var template = cfg.template || [
      { role: "system", content: "You are a {role}. Keep answers short and concrete." },
      { role: "user", content: "Explain {topic} to a 10-year-old." }
    ];
    var vars = cfg.vars || { role: "friendly tutor", topic: "tokenization" };
    host.innerHTML = "";
    var head = el("div", "gl-head"); head.appendChild(el("span", "gl-title", cfg.title || "Prompt-template sandbox")); host.appendChild(head);
    var varWrap = el("div", "gl-vars"); host.appendChild(varWrap);
    var inputs = {};
    Object.keys(vars).forEach(function (k) {
      var r = el("label", "gl-srow"); r.appendChild(el("span", "gl-slabel", k));
      var inp = document.createElement("input"); inp.type = "text"; inp.className = "gl-qinput"; inp.value = vars[k];
      r.appendChild(inp); varWrap.appendChild(r); inputs[k] = inp;
    });
    var msgs = el("div", "gl-msgs"); host.appendChild(msgs);
    var stats = el("div", "gl-stats"); host.appendChild(stats);

    function render() {
      msgs.innerHTML = ""; var all = "";
      template.forEach(function (m) {
        var content = m.content.replace(/\{(\w+)\}/g, function (_, k) { return inputs[k] ? inputs[k].value : ("{" + k + "}"); });
        var b = el("div", "gl-msg " + m.role);
        b.appendChild(el("span", "gl-msg-role", m.role));
        b.appendChild(el("div", "gl-msg-body", content));
        msgs.appendChild(b); all += m.role + " " + content + " ";
      });
      stats.innerHTML = ""; stats.appendChild(statBlock(tokenize(all).length, "tokens in prompt"));
    }
    Object.keys(inputs).forEach(function (k) { inputs[k].addEventListener("input", render); });
    render();
  }

  /* ---------- mode dispatch ---------- */
  var MODES = { tokenizer: initTokenizer, chunking: initChunking, prompt: initPrompt };

  function onReady(fn) { if (document.readyState !== "loading") fn(); else document.addEventListener("DOMContentLoaded", fn); }
  onReady(function () {
    document.querySelectorAll(".genai-lab").forEach(function (host) {
      var mode = host.getAttribute("data-mode") || "tokenizer";
      if (MODES[mode]) MODES[mode](host);
    });
  });
})();
