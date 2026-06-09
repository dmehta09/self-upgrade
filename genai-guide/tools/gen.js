#!/usr/bin/env node
/* ============================================================
   GenAI Field Guide — scaffolder (dev-time only; output is plain
   static HTML with no runtime build). Reads tools/manifest.js and:
     • writes a stub for every page that does NOT yet exist
       (idempotent — never clobbers authored pages; use --force to
       rewrite ALL pages from the template, e.g. after a skeleton change)
     • (re)writes assets/js/lessons.js from the manifest
   The shared HEAD / SIDEBAR / TOPBAR / FOOTER / SCRIPTS template here
   is the single source of truth for the page skeleton; hand-authored
   pages should match it (see genai-guide/prompt.md §3).
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

const ICON = "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'><circle cx='12' cy='12' r='9' fill='none' stroke='%232dd4bf' stroke-width='2'/><circle cx='12' cy='12' r='3' fill='%232dd4bf'/><path d='M12 3v3M12 18v3M3 12h3M18 12h3' stroke='%232dd4bf' stroke-width='2'/></svg>";

function sidebar(p) {
  const groups = M.sidebarGroups();
  let s = `    <aside class="sidebar" id="sidebar">\n`;
  s += `      <a class="brand" href="${p}index.html" aria-label="GenAI Field Guide home">\n`;
  s += `        <span class="brand-mark"><svg viewBox="0 0 24 24" fill="none" stroke="#0b1020" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3.2" fill="#0b1020"/><path d="M12 4.5v3M12 16.5v3M4.5 12h3M16.5 12h3M6.7 6.7l2.1 2.1M15.2 15.2l2.1 2.1M17.3 6.7l-2.1 2.1M8.8 15.2l-2.1 2.1"/></svg></span>\n`;
  s += `        <span class="brand-text"><b>GenAI Field Guide</b><span>Interview-ready generative AI</span></span>\n`;
  s += `      </a>\n`;
  groups.forEach(function (g) {
    const cls = g.cls ? " " + g.cls : "";
    const dot = g.cls ? `<span class="dot"></span>` : "";
    s += `      <nav class="nav-group${cls}" aria-label="${attr(g.label)}">\n`;
    s += `        <h4>${dot}${g.label}</h4>\n`;
    g.links.forEach(function (l) {
      s += `        <a class="nav-link" href="${p}${l.file}">${l.label}</a>\n`;
    });
    s += `      </nav>\n`;
  });
  s += `    </aside>\n    <div class="sidebar-scrim"></div>\n`;
  return s;
}

function topbar(p, page, crumbLabel) {
  const crumb = page.file === "index.html"
    ? `<span class="current">Home</span>`
    : `<a href="${p}index.html">Home</a> <span class="sep">/</span> <span class="current">${crumbLabel}</span>`;
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
  s += `  <script src="${p}assets/js/visualizer.js"></script>\n`;
  (widgets || []).forEach(function (w) { s += `  <script src="${p}assets/js/${w}"></script>\n`; });
  s += `  <script src="${p}assets/js/progress.js"></script>\n`;
  return s;
}

function moduleLabelFor(page) {
  if (!page.dir) return "GenAI Field Guide";
  if (page.dir.indexOf("interview") === 0) return "Interview prep";
  if (page.dir === "reference") return "Reference";
  const m = M.MODULES.find(function (x) { return x.key === page.dir; });
  return m ? m.label : "GenAI Field Guide";
}

function stubMain(page) {
  const eyebrow = moduleLabelFor(page);
  let s = `      <main class="content" id="main">\n`;
  s += `        <section class="hero reveal">\n`;
  s += `          <span class="eyebrow">${eyebrow}</span>\n`;
  s += `          <h1>${page.title}</h1>\n`;
  s += `          <p class="lead">This page is part of the GenAI Field Guide. The full, interview-ready explanation is being written — check back soon.</p>\n`;
  s += `        </section>\n`;
  s += `        <section class="section reveal">\n`;
  s += `          <div class="callout note"><span class="co-ic"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 8h.01M11 12h1v4h1"/></svg></span><div class="co-body"><div class="co-title">Coming soon <span class="tag">draft</span></div><p>Content for <strong>${page.title}</strong> is on the way.</p></div></div>\n`;
  s += `        </section>\n`;
  if (page.lesson) {
    s += `        <button class="lesson-complete" type="button"><span class="lc-box">✓</span><span class="lc-text"></span></button>\n`;
  }
  s += `      </main>\n`;
  return s;
}

function renderPage(page, mainHtml) {
  const p = pre(page.file);
  const dataTool = page.tool ? ` data-tool="${page.tool}"` : "";
  const dataLesson = page.lesson ? ` data-lesson="${page.lesson}"` : "";
  const dataPage = (page.dir ? page.dir.replace(/\//g, "-") + "-" : "") + page.slug;
  const desc = "GenAI Field Guide — " + page.title + ". A visual, interview-ready guide to generative AI (June 2026).";
  return `<!DOCTYPE html>
<html lang="en" data-theme="dark">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${page.title} | GenAI Field Guide</title>
  <meta name="description" content="${attr(desc)}" />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300..600;1,9..144,400&family=Hanken+Grotesk:wght@300..800&family=JetBrains+Mono:wght@400;500;700&display=swap" rel="stylesheet" />
  <link rel="icon" href="${ICON}" />
  <link rel="stylesheet" href="${p}assets/css/styles.css" />
  <link rel="stylesheet" href="${p}assets/css/theme.css" />
  <link rel="stylesheet" href="${p}assets/css/genai.css" />
  <script>window.SITE_BASE = "${siteBase(page.file)}";</script>
</head>
<body${dataTool} data-page="${dataPage}"${dataLesson}>
  <a class="skip-link" href="#main">Skip to content</a>
  <div class="scroll-progress"></div>
  <div class="app">
${sidebar(p)}
    <div class="main">
${topbar(p, page, page.title)}

${mainHtml}
      <footer class="footer">
        <span class="fmono">GenAI Field Guide · interview-ready generative AI</span>
        <span class="fmono">Built to open offline · Jun 2026</span>
      </footer>
    </div>
  </div>
${scripts(p, page.widgets)}</body>
</html>
`;
}

function writeLessons() {
  const lessons = M.lessons();
  const mods = M.LESSON_MODULES;
  let s = `/* ============================================================
   GenAI Field Guide — canonical lesson registry
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
  let created = 0, skipped = 0;
  M.allPages().forEach(function (page) {
    const abs = path.join(ROOT, page.file);
    if (fs.existsSync(abs) && !FORCE) { skipped++; return; }
    fs.mkdirSync(path.dirname(abs), { recursive: true });
    fs.writeFileSync(abs, renderPage(page, stubMain(page)));
    created++;
  });
  console.log("Pages: " + created + " written, " + skipped + " skipped (already exist).");
  writeLessons();
}
main();
