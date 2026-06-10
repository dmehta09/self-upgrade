#!/usr/bin/env node
/* Static verification for the System Design Field Guide.
   Crawls every .html under the project root and checks:
     • every internal link (href) resolves to an existing file
     • every #anchor (in-page, page-nav, TOC, sidebar) resolves to an existing id
     • every <script src> and <link href> asset resolves
     • no raw "<" inside <code> blocks (would break the highlighter / HTML parse)
     • each lesson page wires the 5 JS modules and sets SITE_BASE + data-lesson
   Usage:  node tools/verify.js
*/
const fs = require("fs");
const path = require("path");
const ROOT = path.resolve(__dirname, "..");

function walk(dir) {
  let out = [];
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (e.name === "node_modules" || e.name === "tools" || e.name.startsWith(".")) continue;
    const p = path.join(dir, e.name);
    if (e.isDirectory()) out = out.concat(walk(p));
    else if (e.name.endsWith(".html")) out.push(p);
  }
  return out;
}

const files = walk(ROOT);
const idsByFile = {};
for (const f of files) {
  const html = fs.readFileSync(f, "utf8");
  const ids = new Set();
  let m; const re = /\bid="([^"]+)"/g;
  while ((m = re.exec(html))) ids.add(m[1]);
  idsByFile[f] = ids;
}

const problems = [];
function rel(f) { return path.relative(ROOT, f); }

for (const f of files) {
  const html = fs.readFileSync(f, "utf8");
  const dir = path.dirname(f);

  // ---- links ----
  let m; const linkRe = /\bhref="([^"]+)"/g;
  while ((m = linkRe.exec(html))) {
    const href = m[1];
    if (/^(https?:|mailto:|data:|tel:)/.test(href)) continue;
    if (href.startsWith("#")) {
      if (!idsByFile[f].has(href.slice(1)))
        problems.push(`${rel(f)}: in-page anchor #${href.slice(1)} has no matching id`);
      continue;
    }
    const [p, frag] = href.split("#");
    const target = path.resolve(dir, p);
    if (!fs.existsSync(target)) { problems.push(`${rel(f)}: link -> ${href} (missing file ${rel(target)})`); continue; }
    if (frag && idsByFile[target] && !idsByFile[target].has(frag))
      problems.push(`${rel(f)}: link -> ${href} (file ok, but #${frag} missing)`);
  }

  // ---- assets (script/link) ----
  const assetRe = /(?:src|href)="([^"]+\.(?:js|css))"/g;
  while ((m = assetRe.exec(html))) {
    const a = m[1];
    if (/^https?:/.test(a)) continue;
    if (!fs.existsSync(path.resolve(dir, a)))
      problems.push(`${rel(f)}: asset -> ${a} (missing)`);
  }

  // ---- raw "<" inside <code> ----
  let cm; const codeRe = /<code[^>]*>([\s\S]*?)<\/code>/g;
  while ((cm = codeRe.exec(html))) {
    const body = cm[1];
    // any "<" that is NOT the start of an entity-escaped &lt; is suspicious
    if (/</.test(body)) {
      const around = body.slice(Math.max(0, body.indexOf("<") - 25), body.indexOf("<") + 25).replace(/\s+/g, " ");
      problems.push(`${rel(f)}: raw "<" inside <code> (use &lt;) near: ...${around}...`);
    }
  }

  // ---- engine wiring: a page that embeds an engine must load its script ----
  const ENGINES = [
    ["reqflow", "reqflow.js"], ["viz", "visualizer.js"], ["calc", "capacity.js"],
    ["tradeoff", "tradeoff.js"], ["failsim", "failsim.js"], ["quorum", "quorum.js"],
    ["journey", "journey.js"], ["drill", "drill.js"], ["drill", "drill-bank.js"],
  ];
  for (const [cls, js] of ENGINES) {
    if (new RegExp(`class="${cls}[" ]`).test(html) && !html.includes("assets/js/" + js))
      problems.push(`${rel(f)}: embeds .${cls} but does not load ${js}`);
  }

  // ---- lesson wiring ----
  const isLesson = /data-lesson="/.test(html);
  if (isLesson) {
    if (!/window\.SITE_BASE/.test(html)) problems.push(`${rel(f)}: lesson page missing window.SITE_BASE`);
    for (const js of ["lessons.js", "search-index.js", "main.js", "search.js", "progress.js"])
      if (!html.includes("assets/js/" + js)) problems.push(`${rel(f)}: missing <script> ${js}`);
  }
}

console.log(`Checked ${files.length} HTML files.`);
if (!problems.length) { console.log("✓ No problems found."); process.exit(0); }
console.log(`\n${problems.length} problem(s):`);
for (const p of problems) console.log("  • " + p);
process.exit(1);
