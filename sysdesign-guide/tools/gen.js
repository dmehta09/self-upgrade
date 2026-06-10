#!/usr/bin/env node
/* ============================================================
   System Design Field Guide — page generator (build-time only)
   Wraps a hand-authored content fragment (tools/fragments/<slug>.html,
   which holds just the hero + <section>s) in the shared house shell:
   <head>, sidebar, topbar/breadcrumb, footer, the 5 universal scripts
   (+ any per-page engine scripts), an auto-built "on this page" TOC,
   the "mark as learned" button, and auto prev/next page-nav.

   Output is plain static HTML with zero runtime dependencies — the
   generator just spares us copy-pasting the 75-line sidebar 33×.

   Run from the project root:  node tools/gen.js
   ============================================================ */
const fs = require("fs");
const path = require("path");
const ROOT = path.resolve(__dirname, "..");
const FRAG = path.join(__dirname, "fragments");

/* ---- modules (sidebar label + breadcrumb + index path) ---- */
const MOD = {
  fundamentals: { crumb: "Fundamentals",    index: "fundamentals/index.html" },
  blocks:       { crumb: "Building blocks",  index: "blocks/index.html" },
  data:         { crumb: "Data at scale",    index: "data/index.html" },
  warmup:       { crumb: "Warm-up designs",  index: "warmup/index.html" },
  core:         { crumb: "Core designs",     index: null },     /* no index page; label only */
  advanced:     { crumb: "Advanced designs", index: null },     /* no index page; label only */
  expert:       { crumb: "Expert designs",   index: null },     /* no index page; label only */
  drill:        { crumb: "Practice",         index: "drill/index.html" },
  reference:    { crumb: "Reference",        index: "reference/glossary.html" }
};

/* ---- the reading order (drives prev/next) ---- */
const PAGES = [
  { out: "index.html", title: "Home", home: true },

  { out: "fundamentals/index.html",            mod: "fundamentals", lesson: "fund-framework",     title: "Reading a design question", desc: "How a system-design interview actually runs: clarify scope, list functional and non-functional requirements, estimate, then sketch the architecture. A repeatable framework you'll reuse on every case study." },
  { out: "fundamentals/estimation.html",       mod: "fundamentals", lesson: "fund-estimation",    title: "Back-of-the-envelope estimation", desc: "Turn 'design X' into numbers: QPS, storage, and bandwidth from DAU and a few assumptions — with a live calculator.", scripts: ["capacity.js"] },
  { out: "fundamentals/numbers.html",          mod: "fundamentals", lesson: "fund-numbers",       title: "Numbers you must know", desc: "Latency numbers every engineer should know, powers of two, and the rules of thumb that make estimation fast." },
  { out: "fundamentals/availability.html",     mod: "fundamentals", lesson: "fund-availability",  title: "Availability, reliability & SLAs", desc: "What 'five nines' really means, how redundancy buys availability, and SLA vs SLO vs SLI.", scripts: ["tradeoff.js"] },
  { out: "fundamentals/consistency.html",      mod: "fundamentals", lesson: "fund-consistency",   title: "Consistency, CAP & PACELC", desc: "Strong vs eventual consistency, the CAP theorem, and the PACELC refinement interviewers expect in 2026 — with a trade-off slider.", scripts: ["tradeoff.js"] },

  { out: "blocks/index.html",                  mod: "blocks", lesson: "blocks-overview",  title: "The building blocks", desc: "The handful of boxes every architecture is made of — and how a request moves through them." , scripts: ["reqflow.js","journey.js"] },
  { out: "blocks/load-balancing.html",         mod: "blocks", lesson: "blocks-lb",        title: "Load balancing", desc: "Spreading traffic across servers: L4 vs L7, algorithms, health checks, and stateless design.", scripts: ["reqflow.js","visualizer.js","failsim.js"] },
  { out: "blocks/api-gateway.html",            mod: "blocks", lesson: "blocks-gateway",   title: "API gateway & reverse proxies", desc: "The front door: routing, auth, rate limiting, and TLS termination at the edge of your services.", scripts: ["reqflow.js"] },
  { out: "blocks/cdn.html",                    mod: "blocks", lesson: "blocks-cdn",        title: "CDN & the edge", desc: "Serving bytes from close to the user: edge caching, cache hits/misses, and invalidation.", scripts: ["reqflow.js"] },
  { out: "blocks/caching.html",                mod: "blocks", lesson: "blocks-caching",   title: "Caching", desc: "The single biggest scaling lever: cache-aside vs write-through, eviction, TTLs, hot keys, and the stampede.", scripts: ["reqflow.js","tradeoff.js"] },
  { out: "blocks/messaging.html",              mod: "blocks", lesson: "blocks-messaging", title: "Queues, pub/sub & streams", desc: "Decoupling with asynchronous messaging: queues, pub/sub fan-out, Kafka logs, idempotency, and delivery guarantees.", scripts: ["reqflow.js"] },

  { out: "data/index.html",                    mod: "data", lesson: "data-overview",    title: "SQL vs NoSQL", desc: "Choosing a data store: relational ACID vs the NoSQL families, and how to pick by access pattern.", scripts: ["tradeoff.js"] },
  { out: "data/indexing.html",                 mod: "data", lesson: "data-indexing",   title: "Indexing", desc: "Why an index turns a full scan into a lookup: B-trees, composite and covering indexes, and their write cost.", scripts: ["visualizer.js"] },
  { out: "data/sharding.html",                 mod: "data", lesson: "data-sharding",   title: "Sharding & partitioning", desc: "Splitting data across machines: shard keys, hot shards, range vs hash partitioning, and resharding.", scripts: ["visualizer.js","tradeoff.js"] },
  { out: "data/replication.html",              mod: "data", lesson: "data-replication", title: "Replication & quorums", desc: "Copies for durability and reads: leader-follower, sync vs async, and quorum reads/writes.", scripts: ["tradeoff.js","visualizer.js","quorum.js"] },
  { out: "data/consensus.html",                mod: "data", lesson: "data-consensus", title: "Consensus & leader election", desc: "How a cluster agrees under failure: leader election (the Raft intuition), majority quorums, split-brain, and distributed locks.", scripts: ["visualizer.js","quorum.js"] },
  { out: "data/consistent-hashing.html",       mod: "data", lesson: "data-hashing",    title: "Consistent hashing", desc: "Distributing keys so adding or removing a node moves as few as possible — the ring, virtual nodes, and replication.", scripts: ["visualizer.js"] },

  { out: "warmup/index.html",                  mod: "warmup", lesson: "warmup-playbook",     title: "The design playbook", desc: "The repeatable 7-step method for driving any system-design interview, with a one-page checklist.", scripts: ["journey.js"] },
  { out: "warmup/url-shortener.html",          mod: "warmup", lesson: "warmup-url",          title: "Design a URL shortener", desc: "The classic warm-up: base62 keys, a key-generation service, read-heavy caching, and the redirect path.", scripts: ["reqflow.js","capacity.js"] },
  { out: "warmup/rate-limiter.html",           mod: "warmup", lesson: "warmup-rate-limiter", title: "Design a rate limiter", desc: "Token bucket, sliding window and GCRA, where to put the limiter, and atomic distributed counters in Redis.", scripts: ["reqflow.js","visualizer.js","tradeoff.js"] },
  { out: "warmup/unique-id.html",              mod: "warmup", lesson: "warmup-unique-id",    title: "Design a unique-ID generator", desc: "Snowflake and UUIDv7: time-ordered IDs generated without coordination — plus the clock-skew gotcha.", scripts: ["reqflow.js","tradeoff.js"] },

  { out: "core/distributed-cache.html",        mod: "core", lesson: "core-cache",        title: "Design a distributed cache", desc: "A Redis-like cache at scale: consistent hashing, replication, eviction, write policies, and the hot-key problem.", scripts: ["reqflow.js","visualizer.js","tradeoff.js","failsim.js"] },
  { out: "core/web-crawler.html",              mod: "core", lesson: "core-crawler",      title: "Design a web crawler", desc: "Crawl the web politely and without loops: the URL frontier, Bloom-filter dedup, and BFS at scale.", scripts: ["reqflow.js","visualizer.js"] },
  { out: "core/notification-system.html",      mod: "core", lesson: "core-notification", title: "Design a notification system", desc: "Multi-channel delivery (push/SMS/email) with queues, fan-out, retries, and idempotency.", scripts: ["reqflow.js"] },
  { out: "core/news-feed.html",                mod: "core", lesson: "core-news-feed",    title: "Design a news feed (Twitter)", desc: "The iconic feed problem: fan-out on write vs read, the celebrity case, and timeline caching.", scripts: ["reqflow.js","tradeoff.js","capacity.js","journey.js"] },
  { out: "core/file-sync.html",                mod: "core", lesson: "core-file-sync",    title: "Design Dropbox / file sync", desc: "Sync files across devices: content-defined chunking, deduplication, delta sync, object storage, and the metadata service.", scripts: ["reqflow.js","visualizer.js"] },
  { out: "core/chat.html",                     mod: "core", lesson: "core-chat",         title: "Design a chat system (WhatsApp)", desc: "Real-time messaging: WebSockets, presence, delivery and ordering guarantees, and group fan-out.", scripts: ["reqflow.js","journey.js"] },

  { out: "advanced/uber.html",                 mod: "advanced", lesson: "adv-uber",     title: "Design Uber / ride-hailing", desc: "Match riders to nearby drivers in real time: geospatial indexing (geohash/QuadTree/H3), dispatch, and ETA.", scripts: ["reqflow.js","visualizer.js","tradeoff.js"] },
  { out: "advanced/youtube.html",              mod: "advanced", lesson: "adv-youtube",  title: "Design YouTube / video streaming", desc: "Upload, transcode, and stream video globally: the CDN, adaptive bitrate, blob storage, and the view path.", scripts: ["reqflow.js","capacity.js"] },
  { out: "advanced/payments.html",             mod: "advanced", lesson: "adv-payments", title: "Design a payment system", desc: "Move money correctly: idempotency keys, the double-entry ledger, exactly-once, saga vs 2PC, and reconciliation.", scripts: ["reqflow.js","tradeoff.js","failsim.js"] },
  { out: "advanced/llm-serving.html",          mod: "advanced", lesson: "adv-llm",      title: "Design an LLM serving system", desc: "Serve a large language model at scale (2026): continuous batching, the KV cache, PagedAttention, token streaming, and autoscaling.", scripts: ["reqflow.js","tradeoff.js","capacity.js"] },
  { out: "advanced/vector-recommender.html",   mod: "advanced", lesson: "adv-vector",   title: "Design vector search & a recommender", desc: "Semantic search and recommendations (2026): embeddings, ANN indexes (HNSW/IVF-PQ/DiskANN), and candidate-generation + ranking.", scripts: ["reqflow.js","visualizer.js","tradeoff.js"] },

  { out: "expert/multi-tenancy.html",          mod: "expert", lesson: "expert-multi-tenancy",  title: "Design a multi-tenant SaaS architecture", desc: "Tenant isolation at scale: silo vs pool vs bridge, shared-DB with tenant_id + Postgres RLS, the noisy-neighbour problem, cells, and per-tenant residency.", scripts: ["reqflow.js","tradeoff.js","failsim.js"] },
  { out: "expert/user-management.html",         mod: "expert", lesson: "expert-user-management", title: "Design a user management system", desc: "The user as an entity: account lifecycle, identity vs profile, session revocation fan-out, and GDPR-correct delete/export.", scripts: ["reqflow.js","tradeoff.js"] },
  { out: "expert/org-management.html",          mod: "expert", lesson: "expert-org-management",  title: "Design organizations & teams", desc: "B2B multi-user accounts: the user-org-team membership graph, roles, invitations, seats, and ownership transfer.", scripts: ["reqflow.js","visualizer.js"] },
  { out: "expert/authentication.html",          mod: "expert", lesson: "expert-authentication", title: "Design authentication (login, SSO, MFA)", desc: "Who are you? Argon2id passwords, sessions vs JWT with refresh rotation, passkeys/WebAuthn, OAuth2/OIDC, and enterprise SSO.", scripts: ["reqflow.js","tradeoff.js"] },
  { out: "expert/authorization.html",           mod: "expert", lesson: "expert-authorization",  title: "Design authorization (RBAC, ABAC, ReBAC)", desc: "What can you do? RBAC vs ABAC vs ReBAC/Zanzibar relationship tuples, the check API at scale, and multi-tenant permission scoping.", scripts: ["reqflow.js","tradeoff.js","visualizer.js"] },
  { out: "expert/ecommerce-catalog.html",       mod: "expert", lesson: "expert-ecommerce-catalog", title: "Design e-commerce: catalog, search & cart", desc: "The read side: product/SKU model, faceted search over an inverted index, the shopping cart (cart ≠ reservation), pricing, and read-heavy caching.", scripts: ["reqflow.js","capacity.js"] },
  { out: "expert/ecommerce-checkout.html",      mod: "expert", lesson: "expert-ecommerce-checkout", title: "Design e-commerce: checkout, inventory & orders", desc: "The write side: the checkout saga with compensations, inventory reservation / oversell prevention, idempotent orders, and the order state machine + outbox.", scripts: ["reqflow.js","tradeoff.js","failsim.js"] },
  { out: "expert/billing.html",                 mod: "expert", lesson: "expert-billing",          title: "Design billing, subscriptions & metering", desc: "SaaS billing: plans/subscriptions, the usage-metering pipeline (ingest → aggregate → rate), invoicing, proration, dunning, and the billing ledger.", scripts: ["reqflow.js","tradeoff.js","failsim.js"] },
  { out: "expert/audit-log.html",               mod: "expert", lesson: "expert-audit-log",        title: "Design an audit log / activity feed", desc: "Immutable, tamper-evident event trail: hash chaining + WORM, outbox ingestion, hot/cold retention, compliance query, and the activity-feed read model.", scripts: ["reqflow.js","visualizer.js"] },

  { out: "drill/index.html",                    mod: "drill", title: "Mock-interview drills", desc: "Timed 35-minute mock system-design interviews: phased timer, interviewer-style nudges, a senior grading rubric, and model answers — practice the loop, not just the knowledge.", scripts: ["drill-bank.js","drill.js"] },

  { out: "reference/glossary.html",            mod: "reference", title: "Glossary", desc: "Every system-design term in this guide, defined in one line — from ACID to write-ahead log." },
  { out: "reference/cheatsheet.html",          mod: "reference", title: "The cheat sheet", desc: "One page to skim before an interview: latency numbers, capacity formulas, the design checklist, and the best references." }
];

/* ============================================================ */
const FONTS = 'https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300..600;1,9..144,400&family=Hanken+Grotesk:wght@300..800&family=JetBrains+Mono:wght@400;500;700&display=swap';
const FAVICON = "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'><circle cx='5' cy='6' r='2.3' fill='none' stroke='%2338bdf8' stroke-width='2'/><circle cx='19' cy='6' r='2.3' fill='none' stroke='%2338bdf8' stroke-width='2'/><circle cx='12' cy='18' r='2.3' fill='none' stroke='%2338bdf8' stroke-width='2'/><path d='M7 7.4l4 8.6M17 7.4l-4 8.6M7.3 6h9.4' stroke='%2338bdf8' stroke-width='2'/></svg>";

const NAV = [
  { h: "Start here", links: [["index.html","Home"],["reference/glossary.html","Glossary"],["reference/cheatsheet.html","Cheat sheet"]] },
  { h: "Fundamentals", cls: "is-fundamentals", links: [["fundamentals/index.html","Reading a design question"],["fundamentals/estimation.html","Back-of-envelope math"],["fundamentals/numbers.html","Numbers you must know"],["fundamentals/availability.html","Availability &amp; SLAs"],["fundamentals/consistency.html","Consistency · CAP · PACELC"]] },
  { h: "Building blocks", cls: "is-blocks", links: [["blocks/index.html","The building blocks"],["blocks/load-balancing.html","Load balancing"],["blocks/api-gateway.html","API gateway &amp; proxies"],["blocks/cdn.html","CDN &amp; the edge"],["blocks/caching.html","Caching"],["blocks/messaging.html","Queues, pub/sub &amp; streams"]] },
  { h: "Data at scale", cls: "is-data", links: [["data/index.html","SQL vs NoSQL"],["data/indexing.html","Indexing"],["data/sharding.html","Sharding &amp; partitioning"],["data/replication.html","Replication &amp; quorums"],["data/consensus.html","Consensus &amp; leader election"],["data/consistent-hashing.html","Consistent hashing"]] },
  { h: "Warm-up designs", cls: "is-warmup", links: [["warmup/index.html","The design playbook"],["warmup/url-shortener.html","URL shortener"],["warmup/rate-limiter.html","Rate limiter"],["warmup/unique-id.html","Unique ID generator"]] },
  { h: "Core designs", cls: "is-core", links: [["core/distributed-cache.html","Distributed cache"],["core/web-crawler.html","Web crawler"],["core/notification-system.html","Notification system"],["core/news-feed.html","News feed (Twitter)"],["core/file-sync.html","Dropbox / file sync"],["core/chat.html","Chat (WhatsApp)"]] },
  { h: "Advanced designs", cls: "is-advanced", links: [["advanced/uber.html","Uber / ride-hailing"],["advanced/youtube.html","YouTube / streaming"],["advanced/payments.html","Payment system"],["advanced/llm-serving.html","LLM serving"],["advanced/vector-recommender.html","Vector search &amp; recsys"]] },
  { h: "Expert designs", cls: "is-expert", links: [["expert/multi-tenancy.html","Multi-tenant SaaS"],["expert/user-management.html","User management"],["expert/org-management.html","Organizations &amp; teams"],["expert/authentication.html","Authentication"],["expert/authorization.html","Authorization"],["expert/ecommerce-catalog.html","E-commerce: catalog &amp; cart"],["expert/ecommerce-checkout.html","E-commerce: checkout"],["expert/billing.html","Billing &amp; subscriptions"],["expert/audit-log.html","Audit log"]] },
  { h: "Practice", cls: "is-drill", links: [["drill/index.html","Mock-interview drills"]] }
];

function sidebar(base) {
  let s = '    <aside class="sidebar" id="sidebar">\n';
  s += '      <a class="brand" href="' + base + 'index.html" aria-label="The System Design Field Guide home">\n';
  s += '        <span class="brand-mark"><svg viewBox="0 0 24 24" fill="none" stroke="#06121b" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="5" cy="6" r="2.4"/><circle cx="19" cy="6" r="2.4"/><circle cx="12" cy="18" r="2.4"/><path d="M7 7.4l4 8.6M17 7.4l-4 8.6M7.3 6h9.4"/></svg></span>\n';
  s += '        <span class="brand-text"><b>System Design</b><span>Concepts · Cases · Scale</span></span>\n      </a>\n';
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

/* relative path from page A to page B (both root-relative like "core/chat.html") */
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
  h += "  <title>" + p.title + " | The System Design Field Guide</title>\n";
  h += '  <meta name="description" content="' + p.desc.replace(/"/g, "&quot;") + '" />\n';
  h += '  <link rel="preconnect" href="https://fonts.googleapis.com" />\n  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />\n';
  h += '  <link href="' + FONTS + '" rel="stylesheet" />\n';
  h += '  <link rel="icon" href="' + FAVICON + '" />\n';
  h += '  <link rel="stylesheet" href="' + base + 'assets/css/styles.css" />\n  <link rel="stylesheet" href="' + base + 'assets/css/theme.css" />\n';
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
  h += '      <footer class="footer">\n        <span class="fmono">' + footL + '</span>\n        <span class="fmono">The System Design Field Guide · Jun 2026</span>\n      </footer>\n    </div>\n  </div>\n';
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
