#!/usr/bin/env node
/* ============================================================
   A Philosophy of Software Design — page assembler (dev-time only;
   output is plain static HTML with no runtime build / no dependencies).

   Reads tools/manifest.js and, for every page:
     • if tools/content/<page>.html exists  → assemble the full page
       from the shared shell + that content fragment (always rewritten)
     • else if the .html does not exist yet → write a "coming soon" stub
     • else (a hand-authored .html with no fragment) → leave it untouched

   A fragment contains ONLY the content <section>s (hero + sections).
   The generator wraps them in <div class="content"><div class="prose">,
   then AUTO-GENERATES from the manifest + section ids:
     • the right-rail "On this page" TOC (from each <section id> + <h2>)
     • the "Mark as learned" button (when the page is a lesson)
     • the prev / next page-nav (from the manifest reading order)
   So authors never hand-write nav, TOC, or the complete button.

   Also (re)writes assets/js/lessons.js from the manifest.

   Usage:  node tools/gen.js [--force]
   ============================================================ */
const fs = require("fs");
const path = require("path");
const M = require("./manifest.js");

const ROOT = path.resolve(__dirname, "..");
const FORCE = process.argv.includes("--force");

function depth(file) { return (file.match(/\//g) || []).length; }
function pre(file) { return "../".repeat(depth(file)); }
function siteBase(file) { return pre(file) || "./"; }
function attr(s) { return String(s).replace(/&/g, "&amp;").replace(/"/g, "&quot;"); }
function dataPageId(page) { return (page.dir ? page.dir.replace(/\//g, "-") + "-" : "") + page.slug; }
function clean(s) { return String(s).replace(/<span class="section-num">[\s\S]*?<\/span>/g, "").replace(/<[^>]+>/g, " ").replace(/&[a-z]+;/g, " ").replace(/\s+/g, " ").trim(); }

/* open book — "the book, distilled" */
const ICON = "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23e0a82e' stroke-width='2.1' stroke-linecap='round' stroke-linejoin='round'><path d='M3 5.5C5 5 8 5 12 7c4-2 7-2 9-1.5V18c-2-.5-5-.5-9 1.5-4-2-7-2-9-1.5Z'/><path d='M12 7v12'/></svg>";
const BRAND = "A Philosophy of Software Design";

function sidebar(p) {
  const groups = M.sidebarGroups();
  let s = `    <aside class="sidebar" id="sidebar">\n`;
  s += `      <a class="brand" href="${p}index.html" aria-label="${BRAND} home">\n`;
  s += `        <span class="brand-mark"><svg viewBox="0 0 24 24" fill="none" stroke="#06121a" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round"><path d="M3 5.5C5 5 8 5 12 7c4-2 7-2 9-1.5V18c-2-.5-5-.5-9 1.5-4-2-7-2-9-1.5Z"/><path d="M12 7v12"/></svg></span>\n`;
  s += `        <span class="brand-text"><b>${BRAND}</b><span>Ousterhout&rsquo;s principles, distilled</span></span>\n`;
  s += `      </a>\n`;
  groups.forEach(function (g) {
    const cls = g.cls ? " " + g.cls : "";
    const dot = g.cls ? `<span class="dot"></span>` : "";
    s += `      <nav class="nav-group${cls}" aria-label="${attr(g.label)}">\n`;
    s += `        <h4>${dot}${g.label}</h4>\n`;
    g.links.forEach(function (l) { s += `        <a class="nav-link" href="${p}${l.file}">${l.label}</a>\n`; });
    s += `      </nav>\n`;
  });
  s += `    </aside>\n    <div class="sidebar-scrim"></div>\n`;
  return s;
}

function topbar(p, page) {
  const crumb = page.file === "index.html"
    ? `<span class="current">Home</span>`
    : `<a href="${p}index.html">Home</a> <span class="sep">/</span> <span class="current">${attr(page.title)}</span>`;
  return `      <header class="topbar">
        <button class="icon-btn menu-btn" id="menuBtn" aria-label="Open navigation">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 6h16M4 12h16M4 18h16"/></svg>
        </button>
        <nav class="breadcrumb">${crumb}</nav>
        <div class="topbar-spacer"></div>
        <button class="search-trigger" aria-label="Search (press / )">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/></svg>
          <span class="st-label">Search</span><kbd>/</kbd>
        </button>
        <button class="icon-btn" id="themeToggle" aria-label="Toggle light / dark theme">
          <svg class="moon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z"/></svg>
          <svg class="sun" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M4 12H2m20 0h-2M5 5 6.4 6.4M17.6 17.6 19 19M19 5l-1.4 1.4M6.4 17.6 5 19"/></svg>
        </button>
      </header>`;
}

function scripts(p, widgets) {
  let s = "";
  s += `  <script src="${p}assets/js/lessons.js"></script>\n`;
  s += `  <script src="${p}assets/js/search-index.js"></script>\n`;
  s += `  <script src="${p}assets/js/main.js"></script>\n`;
  s += `  <script src="${p}assets/js/search.js"></script>\n`;
  (widgets || []).forEach(function (w) { s += `  <script src="${p}assets/js/${w}"></script>\n`; });
  s += `  <script src="${p}assets/js/progress.js"></script>\n`;
  return s;
}

function moduleLabelFor(page) {
  if (!page.dir) return BRAND;
  if (page.dir.indexOf("interview") === 0) return "Interview prep";
  if (page.dir.indexOf("reference") === 0) return "Reference";
  const m = M.MODULES.find(function (x) { return x.key === page.dir; });
  return m ? m.label : BRAND;
}

/* AUTO right-rail TOC from the fragment's id'd sections (skips hero + index pages) */
function buildToc(frag, page) {
  if (page.slug === "index") return { hasToc: false, html: "" };
  const items = [];
  const secRe = /<section[^>]*\bid="([^"]+)"[^>]*>([\s\S]*?)<\/section>/g;
  let m;
  while ((m = secRe.exec(frag))) {
    if (/\bhero\b/.test(m[0].slice(0, 80))) continue;
    const h = (m[2].match(/<h2[^>]*>([\s\S]*?)<\/h2>/) || [])[1];
    if (h) items.push({ id: m[1], label: clean(h) });
  }
  if (items.length < 3) return { hasToc: false, html: "" };
  let s = `        <nav class="toc">\n          <h5>On this page</h5>\n`;
  items.forEach(function (it) { s += `          <a href="#${it.id}">${it.label}</a>\n`; });
  s += `        </nav>\n`;
  return { hasToc: true, html: s };
}

/* AUTO prev/next from the manifest reading order */
function pageNav(pages, i) {
  const cur = pages[i], p = pre(cur.file), prev = pages[i - 1], next = pages[i + 1];
  let s = `          <nav class="page-nav reveal">\n`;
  if (prev) s += `            <a href="${p}${prev.file}"><span class="pn-k">Previous</span><span class="pn-t">${attr(prev.title)}</span></a>\n`;
  else s += `            <span class="pn-spacer"></span>\n`;
  if (next) s += `            <a class="next" href="${p}${next.file}"><span class="pn-k">Next &rsaquo;</span><span class="pn-t">${attr(next.title)}</span></a>\n`;
  s += `          </nav>\n`;
  return s;
}

function lessonComplete(page) {
  if (!page.lesson) return "";
  return `          <button class="lesson-complete" type="button"><span class="lc-box">&#10003;</span><span class="lc-text"></span></button>\n`;
}

function mainWrap(page, sections, pages, i) {
  const toc = buildToc(sections, page);
  const cls = toc.hasToc ? "content has-toc" : "content";
  return `      <div class="${cls}" id="main">\n        <div class="prose">\n${sections.replace(/\s*$/, "\n")}${lessonComplete(page)}${pageNav(pages, i)}        </div>\n${toc.html}      </div>\n`;
}

function stubSections(page) {
  const eyebrow = moduleLabelFor(page);
  return `          <section class="hero reveal">
            <span class="eyebrow">${eyebrow}</span>
            <h1>${page.title}</h1>
            <p class="lead">This page of ${BRAND} is being written &mdash; sharp, dual-explained, example-led content is on the way.</p>
          </section>
          <section class="section reveal">
            <div class="callout note"><span class="co-ic"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 8h.01M11 12h1v4h1"/></svg></span><div class="co-body"><div class="co-title">Coming soon <span class="tag">draft</span></div><p>Content for <strong>${page.title}</strong> is on the way.</p></div></div>
          </section>\n`;
}

function renderPage(page, sections, pages, i) {
  const p = pre(page.file);
  const dataTool = page.tool ? ` data-tool="${page.tool}"` : "";
  const dataLesson = page.lesson ? ` data-lesson="${page.lesson}"` : "";
  const desc = BRAND + " — " + page.title + ". A sharp, crisp visual guide to John Ousterhout's A Philosophy of Software Design: complexity, deep modules, information hiding, comments & naming — each idea in plain English then precise, with Python examples.";
  return `<!DOCTYPE html>
<html lang="en" data-theme="dark">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${page.file === "index.html" ? page.title : page.title + " | " + BRAND}</title>
  <meta name="description" content="${attr(desc)}" />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300..600;1,9..144,400&family=Hanken+Grotesk:wght@300..800&family=JetBrains+Mono:wght@400;500;700&display=swap" rel="stylesheet" />
  <link rel="icon" href="${ICON}" />
  <link rel="stylesheet" href="${p}assets/css/styles.css" />
  <link rel="stylesheet" href="${p}assets/css/theme.css" />
  <link rel="stylesheet" href="${p}assets/css/aposd.css" />
  <script>window.SITE_BASE = "${siteBase(page.file)}";</script>
</head>
<body${dataTool} data-page="${dataPageId(page)}"${dataLesson}>
  <a class="skip-link" href="#main">Skip to content</a>
  <div class="scroll-progress"></div>
  <div class="app">
${sidebar(p)}
    <div class="main">
${topbar(p, page)}

${mainWrap(page, sections, pages, i)}
      <footer class="footer">
        <span class="fmono">${BRAND} &middot; Ousterhout, distilled &middot; complexity &middot; deep modules &middot; comments</span>
        <span class="fmono">Built to open offline &middot; Jun 2026</span>
      </footer>
    </div>
  </div>
${scripts(p, page.widgets)}</body>
</html>
`;
}

function loadFragment(page) {
  const fp = path.join(ROOT, "tools", "content", dataPageId(page) + ".html");
  return fs.existsSync(fp) ? fs.readFileSync(fp, "utf8") : null;
}

function writeLessons() {
  const lessons = M.lessons();
  const mods = M.LESSON_MODULES;
  let s = `/* ============================================================
   ${BRAND} — canonical lesson registry
   GENERATED from tools/manifest.js by tools/gen.js — edit the
   manifest, then re-run \`node tools/gen.js\`. Stable lesson ids;
   each lesson page sets <body data-lesson="<id>">.
   ============================================================ */\nwindow.LESSONS = [\n`;
  lessons.forEach(function (l) {
    s += `  { id: ${JSON.stringify(l.id)}, title: ${JSON.stringify(l.title)}, url: ${JSON.stringify(l.url)}, module: ${JSON.stringify(l.module)}, tool: ${JSON.stringify(l.tool)} },\n`;
  });
  s += `];\n\nwindow.LESSON_MODULES = [\n`;
  mods.forEach(function (m) { s += `  { key: ${JSON.stringify(m.key)}, label: ${JSON.stringify(m.label)} },\n`; });
  s += `];\n`;
  fs.writeFileSync(path.join(ROOT, "assets/js/lessons.js"), s);
  console.log("Wrote assets/js/lessons.js (" + lessons.length + " lessons, " + mods.length + " modules)");
}

function main() {
  let assembled = 0, stubbed = 0, skipped = 0;
  const pages = M.allPages();
  pages.forEach(function (page, i) {
    const abs = path.join(ROOT, page.file);
    const frag = loadFragment(page);
    if (frag) {
      fs.mkdirSync(path.dirname(abs), { recursive: true });
      fs.writeFileSync(abs, renderPage(page, frag, pages, i));
      assembled++;
      return;
    }
    if (fs.existsSync(abs) && !FORCE) { skipped++; return; }
    fs.mkdirSync(path.dirname(abs), { recursive: true });
    fs.writeFileSync(abs, renderPage(page, stubSections(page), pages, i));
    stubbed++;
  });
  console.log("Pages: " + assembled + " assembled from fragments, " + stubbed + " stubbed, " + skipped + " left as-is.");
  writeLessons();
}
main();
