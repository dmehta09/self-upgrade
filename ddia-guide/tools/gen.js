#!/usr/bin/env node
/* ============================================================
   Designing Data-Intensive Applications — page generator (build-time only)
   Wraps a hand-authored content fragment (tools/fragments/<slug>.html,
   which holds just the hero + <section>s) in the shared house shell:
   <head>, sidebar, topbar/breadcrumb, footer, the 5 universal scripts
   (+ any per-page engine scripts), an auto-built "on this page" TOC,
   the "mark as learned" button, and auto prev/next page-nav.

   Output is plain static HTML with zero runtime dependencies — the
   generator just spares us copy-pasting the sidebar on every page.

   This guide ships in PHASES: PAGES below lists only the chapters built
   so far. Each phase appends new lessons (and a sidebar group) here, adds
   matching entries to assets/js/lessons.js + tools/build-search-index.js,
   and flips the "soon" items on the home page into real links.

   Run from the project root:  node tools/gen.js
   ============================================================ */
const fs = require("fs");
const path = require("path");
const ROOT = path.resolve(__dirname, "..");
const FRAG = path.join(__dirname, "fragments");

/* ---- modules (sidebar label + breadcrumb + index path) ---- */
const MOD = {
  foundations: { crumb: "Part I · Foundations",    index: null },   /* no index page yet; label only */
  distributed: { crumb: "Part II · Distributed Data", index: null },
  derived:     { crumb: "Part III · Derived Data",  index: null },
  reference:   { crumb: "Reference",               index: "reference/decisions.html" }
};

/* ---- the reading order (drives prev/next). PHASE 1 = Part I, ch 1–2 ---- */
const PAGES = [
  { out: "index.html", title: "Home", home: true },

  { out: "foundations/reliable-scalable-maintainable.html", mod: "foundations", lesson: "found-rsm",         title: "Reliable, scalable & maintainable", desc: "The three concerns behind every data system: reliability (tolerating faults), scalability (describing and handling load — percentiles, tail latency, fan-out), and maintainability (operability, simplicity, evolvability).", scripts: ["ddia-viz.js", "tradeoff.js"] },
  { out: "foundations/data-models.html",                    mod: "foundations", lesson: "found-data-models", title: "Data models & query languages",      desc: "Relational vs document vs graph: the impedance mismatch, one-to-many vs many-to-many, schema-on-read vs schema-on-write, locality, and declarative vs imperative queries — the same data shown three ways.", scripts: ["ddia-viz.js", "tradeoff.js"] },
  { out: "foundations/storage-engines.html",                mod: "foundations", lesson: "found-storage",     title: "Storage & retrieval",                desc: "How a database stores data and finds it again: the append-only log, LSM-trees (memtable, SSTables, compaction) vs B-trees (pages, in-place updates), and OLTP row stores vs OLAP column stores.", scripts: ["ddia-viz.js", "tradeoff.js"] },
  { out: "foundations/encoding-evolution.html",             mod: "foundations", lesson: "found-encoding",    title: "Encoding & evolution",               desc: "Turning in-memory objects into bytes and back: textual (JSON) vs binary schema formats (Protobuf/Thrift/Avro), field tags, and schema evolution — backward and forward compatibility for zero-downtime rolling deploys." },

  { out: "distributed/replication.html",  mod: "distributed", lesson: "dist-replication",  title: "Replication",   desc: "Keeping the same data on several nodes: single-leader, multi-leader, and leaderless models; synchronous vs asynchronous replication; replication lag and the read-your-writes / monotonic / consistent-prefix guarantees that hide it; quorums (w + r > n).", scripts: ["reqflow.js", "tradeoff.js"] },
  { out: "distributed/partitioning.html", mod: "distributed", lesson: "dist-partitioning", title: "Partitioning", desc: "Splitting a dataset across nodes (sharding): partitioning by key range vs by hash, skew and hot spots, consistent hashing and rebalancing, request routing, and local vs global secondary indexes.", scripts: ["ddia-viz.js", "tradeoff.js"] },
  { out: "distributed/transactions.html", mod: "distributed", lesson: "dist-transactions", title: "Transactions", desc: "The all-or-nothing safety blanket: what ACID really promises, the race conditions weak isolation allows (dirty reads, lost updates, write skew), the isolation-level dial (read committed → snapshot → serializable), and three ways to be serializable (serial, 2PL, SSI).", scripts: ["tradeoff.js"] },
  { out: "distributed/distributed-trouble.html", mod: "distributed", lesson: "dist-trouble", title: "The trouble with distributed systems", desc: "How reality betrays distributed code: unreliable networks (you can't tell crashed from slow), lying clocks (time-of-day vs monotonic), and process pauses — plus fencing tokens, and why truth is defined by a majority.", scripts: ["reqflow.js", "tradeoff.js"] },
  { out: "distributed/consistency-consensus.html", mod: "distributed", lesson: "dist-consensus", title: "Consistency & consensus", desc: "The strongest tools we have: linearizability (the single-copy illusion and its recency guarantee), the CAP trade-off during a partition, causal order and total order broadcast, and consensus (Paxos/Raft) built on overlapping majority quorums.", scripts: ["ddia-viz.js", "tradeoff.js"] },

  { out: "derived/batch-processing.html", mod: "derived", lesson: "deriv-batch", title: "Batch processing", desc: "Processing a large, fixed, immutable input to build derived data: the Unix philosophy, MapReduce (map, shuffle, reduce) and reduce-side joins, dataflow engines (Spark/Flink), and why immutability makes batch jobs retry-safe and reproducible.", scripts: ["reqflow.js", "tradeoff.js"] },
  { out: "derived/stream-processing.html", mod: "derived", lesson: "deriv-stream", title: "Stream processing", desc: "Running batch's ideas continuously on unbounded input: events and streams, traditional vs log-based message brokers (Kafka offsets & replay), change data capture and the stream-table duality, windows and event vs processing time, and keeping materialized views fresh.", scripts: ["reqflow.js"] },
  { out: "derived/future-data-systems.html", mod: "derived", lesson: "deriv-future", title: "The future of data systems", desc: "Composing specialised stores via dataflow: one source of truth with derived views, unbundling the database, lambda vs kappa architecture, end-to-end correctness through deterministic derivation and idempotence — and doing right by data.", scripts: ["reqflow.js", "tradeoff.js"] },

  { out: "reference/decisions.html",  mod: "reference", title: "Decisions & trade-offs", desc: "The recurring data-system decisions on one page — which data model, how to describe load and latency, fan-out on write vs read, replication and partitioning choices, isolation levels and CAP, batch vs stream — each with a one-line heuristic. Covers the whole book." },
  { out: "reference/flashcards.html", mod: "reference", title: "Flashcards",             desc: "The key terms and trade-offs as recall practice: faults vs failures, percentiles & tail-latency amplification, the impedance mismatch, schema-on-read, locality, and more.", scripts: ["flashcards.js"] }
];

/* ============================================================ */
const FONTS = 'https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300..600;1,9..144,400&family=Hanken+Grotesk:wght@300..800&family=JetBrains+Mono:wght@400;500;700&display=swap';
const FAVICON = "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%236366f1' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><ellipse cx='12' cy='5' rx='8' ry='3'/><path d='M4 5v6c0 1.7 3.6 3 8 3s8-1.3 8-3V5'/><path d='M4 11v6c0 1.7 3.6 3 8 3s8-1.3 8-3v-6'/></svg>";

const NAV = [
  { h: "Start here", links: [["index.html", "Home"], ["reference/decisions.html", "Decisions &amp; trade-offs"], ["reference/flashcards.html", "Flashcards"]] },
  { h: "Part I · Foundations", cls: "is-foundations", links: [["foundations/reliable-scalable-maintainable.html", "Reliable, scalable &amp; maintainable"], ["foundations/data-models.html", "Data models &amp; query languages"], ["foundations/storage-engines.html", "Storage &amp; retrieval"], ["foundations/encoding-evolution.html", "Encoding &amp; evolution"]] },
  { h: "Part II · Distributed Data", cls: "is-distributed", links: [["distributed/replication.html", "Replication"], ["distributed/partitioning.html", "Partitioning"], ["distributed/transactions.html", "Transactions"], ["distributed/distributed-trouble.html", "Distributed trouble"], ["distributed/consistency-consensus.html", "Consistency &amp; consensus"]] },
  { h: "Part III · Derived Data", cls: "is-derived", links: [["derived/batch-processing.html", "Batch processing"], ["derived/stream-processing.html", "Stream processing"], ["derived/future-data-systems.html", "The future of data systems"]] }
];

function sidebar(base) {
  let s = '    <aside class="sidebar" id="sidebar">\n';
  s += '      <a class="brand" href="' + base + 'index.html" aria-label="Designing Data-Intensive Applications home">\n';
  s += '        <span class="brand-mark"><svg viewBox="0 0 24 24" fill="none" stroke="#0b1020" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><ellipse cx="12" cy="5" rx="8" ry="3"/><path d="M4 5v6c0 1.7 3.6 3 8 3s8-1.3 8-3V5"/><path d="M4 11v6c0 1.7 3.6 3 8 3s8-1.3 8-3v-6"/></svg></span>\n';
  s += '        <span class="brand-text"><b>Data-Intensive Apps</b><span>DDIA · distilled</span></span>\n      </a>\n';
  NAV.forEach(function (g) {
    s += '      <nav class="nav-group' + (g.cls ? " " + g.cls : "") + '" aria-label="' + g.h.replace(/&amp;/g, "and") + '">\n';
    s += '        <h4>' + (g.cls ? '<span class="dot"></span>' : "") + g.h + '</h4>\n';
    g.links.forEach(function (l) { s += '        <a class="nav-link" href="' + base + l[0] + '">' + l[1] + '</a>\n'; });
    s += '      </nav>\n';
  });
  s += '    </aside>\n    <div class="sidebar-scrim"></div>\n';
  return s;
}

const ICONS = {
  menu: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 6h16M4 12h16M4 18h16"/></svg>',
  search: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/></svg>',
  moon: '<svg class="moon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z"/></svg>',
  sun: '<svg class="sun" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M4 12H2m20 0h-2M5 5 6.4 6.4M17.6 17.6 19 19M19 5l-1.4 1.4M6.4 17.6 5 19"/></svg>'
};

function clean(s) { return s.replace(/<[^>]+>/g, "").replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&nbsp;/g, " ").replace(/\s+/g, " ").trim(); }

/* build the "on this page" TOC from <section id=..><h2>..</h2> */
function buildToc(body) {
  const re = /<section[^>]*\bid="([^"]+)"[^>]*>[\s\S]*?<h2[^>]*>([\s\S]*?)<\/h2>/g;
  let m, out = [];
  while ((m = re.exec(body))) {
    let label = clean(m[2]).replace(/^\d+\s*/, "").replace(/^[—–-]\s*/, "").trim();
    out.push('          <a href="#' + m[1] + '">' + label + '</a>');
  }
  return out;
}

function pageNav(i) {
  const prev = PAGES[i - 1], next = PAGES[i + 1];
  let h = '          <nav class="page-nav reveal">\n';
  if (prev) h += '            <a href="' + rel(PAGES[i].out, prev.out) + '"><span class="pn-k">‹ Back</span><span class="pn-t">' + prev.title + '</span></a>\n';
  else h += '            <span></span>\n';
  if (next) h += '            <a class="next" href="' + rel(PAGES[i].out, next.out) + '"><span class="pn-k">Next ›</span><span class="pn-t">' + next.title + '</span></a>\n';
  h += '          </nav>\n';
  return h;
}

/* relative path from page A to page B (both root-relative like "foundations/x.html") */
function rel(from, to) {
  const fromDir = from.indexOf("/") === -1 ? "" : from.slice(0, from.lastIndexOf("/"));
  if (fromDir === "") return to;                 // home → anything
  const up = "../".repeat(fromDir.split("/").length);
  return up + to;
}

function breadcrumb(p) {
  const base = p.out.indexOf("/") === -1 ? "" : "../";
  const mod = MOD[p.mod];
  const isModIndex = mod && mod.index && p.out === mod.index;
  let bc = '<nav class="breadcrumb"><a href="' + base + 'index.html">Home</a>';
  if (mod && !isModIndex) {
    if (mod.index) bc += '<span class="sep">/</span><a href="' + base + mod.index + '" style="color:var(--accent)">' + mod.crumb + '</a>';
    else bc += '<span class="sep">/</span><span style="color:var(--accent)">' + mod.crumb + '</span>';   // module has no index page
  }
  bc += '<span class="sep">/</span><span class="current">' + (isModIndex ? mod.crumb : p.title) + '</span></nav>';
  return bc;
}

function render(p, i) {
  const base = p.out.indexOf("/") === -1 ? "./" : "../";
  const body = fs.readFileSync(path.join(FRAG, p.out.replace(/\//g, "__")), "utf8").trim();
  const toc = buildToc(body);
  const scripts = ["lessons.js", "search-index.js", "main.js", "search.js", "progress.js"].concat(p.scripts || []);
  const footL = (p.mod ? MOD[p.mod].crumb : "") + (p.mod && p.out !== MOD[p.mod].index && !/reference/.test(p.out) ? " · " + p.title : (p.mod ? "" : p.title));

  let h = "<!DOCTYPE html>\n<html lang=\"en\" data-theme=\"dark\">\n<head>\n";
  h += '  <meta charset="UTF-8" />\n  <meta name="viewport" content="width=device-width, initial-scale=1.0" />\n';
  h += "  <title>" + p.title + " | Designing Data-Intensive Applications</title>\n";
  h += '  <meta name="description" content="' + p.desc.replace(/"/g, "&quot;") + '" />\n';
  h += '  <link rel="preconnect" href="https://fonts.googleapis.com" />\n  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />\n';
  h += '  <link href="' + FONTS + '" rel="stylesheet" />\n';
  h += '  <link rel="icon" href="' + FAVICON + '" />\n';
  h += '  <link rel="stylesheet" href="' + base + 'assets/css/styles.css" />\n  <link rel="stylesheet" href="' + base + 'assets/css/theme.css" />\n  <link rel="stylesheet" href="' + base + 'assets/css/ddia.css" />\n';
  h += '  <script>window.SITE_BASE = "' + base + '";</' + 'script>\n</head>\n';
  h += '<body' + (p.mod && p.mod !== "reference" ? ' data-tool="' + p.mod + '"' : "") + ' data-page="' + (p.lesson || p.out.replace(/[\/.]/g, "-")) + '"' + (p.lesson ? ' data-lesson="' + p.lesson + '"' : "") + '>\n';
  h += '  <a class="skip-link" href="#main">Skip to content</a>\n  <div class="scroll-progress"></div>\n  <div class="app">\n\n';
  h += sidebar(base);
  h += '\n    <div class="main">\n      <header class="topbar">\n';
  h += '        <button class="icon-btn menu-btn" id="menuBtn" aria-label="Open navigation">' + ICONS.menu + '</button>\n';
  h += '        ' + breadcrumb(p) + '\n        <div class="topbar-spacer"></div>\n';
  h += '        <button class="search-trigger" aria-label="Search (press /)">' + ICONS.search + '<span class="st-label">Search</span><kbd>/</kbd></button>\n';
  h += '        <button class="icon-btn" id="themeToggle" aria-label="Toggle light / dark theme">' + ICONS.moon + ICONS.sun + '</button>\n';
  h += '      </header>\n\n';
  h += '      <div class="content has-toc" id="main">\n        <div class="prose">\n';
  h += body + "\n";
  if (p.lesson) h += '\n          <button class="lesson-complete" type="button"><span class="lc-box">✓</span><span class="lc-text"></span></button>\n';
  h += pageNav(i);
  h += '        </div>\n\n        <aside class="toc" aria-label="On this page">\n          <h5>On this page</h5>\n' + toc.join("\n") + '\n        </aside>\n      </div>\n\n';
  h += '      <footer class="footer">\n        <span class="fmono">' + footL + '</span>\n        <span class="fmono">Designing Data-Intensive Applications · Jun 2026</span>\n      </footer>\n    </div>\n  </div>\n';
  scripts.forEach(function (s) { h += '  <script src="' + base + 'assets/js/' + s + '"></' + 'script>\n'; });
  h += '</body>\n</html>\n';
  return h;
}

let made = 0, skipped = [];
PAGES.forEach(function (p, i) {
  if (p.home) return;                              // home is hand-authored
  const fragPath = path.join(FRAG, p.out.replace(/\//g, "__"));
  if (!fs.existsSync(fragPath)) { skipped.push(p.out); return; }
  fs.writeFileSync(path.join(ROOT, p.out), render(p, i));
  made++;
});
console.log("Generated " + made + " pages.");
if (skipped.length) console.log("Skipped (no fragment yet): " + skipped.join(", "));
