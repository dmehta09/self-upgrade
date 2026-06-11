#!/usr/bin/env node
/* Static verification for the FastAPI Field Guide.
   Crawls every .html under the project root and checks:
     • every internal link (href) resolves to an existing file
     • every #anchor (in-page, page-nav, TOC, sidebar) resolves to an existing id
     • every <script src> and <link href> asset resolves
     • no raw "<" inside <code> blocks (would break the highlighter / HTML parse)
     • each lesson page wires the core JS modules and sets SITE_BASE + data-lesson
     • every data-lesson id is registered in lessons.js, and every lesson url exists
     • every page that hosts an engine (runpad/playground/…) loads its script
   Usage:  node tools/verify.js
*/
const fs = require("fs");
const path = require("path");
const ROOT = path.resolve(__dirname, "..");

function walk(dir) {
  let out = [];
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (e.name === "node_modules" || e.name.startsWith(".")) continue;
    const p = path.join(dir, e.name);
    if (e.isDirectory()) out = out.concat(walk(p));
    else if (e.name.endsWith(".html")) out.push(p);
  }
  return out;
}

// ---- lessons registry cross-check ----
const lessonsSrc = fs.readFileSync(path.join(ROOT, "assets/js/lessons.js"), "utf8");
const lessonIds = new Set();
const lessonUrls = [];
{
  let m; const re = /\{\s*id:\s*"([^"]+)"[^}]*url:\s*"([^"]+)"/g;
  while ((m = re.exec(lessonsSrc))) { lessonIds.add(m[1]); lessonUrls.push(m[2]); }
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

// every registered lesson url must exist on disk
for (const u of lessonUrls) {
  if (!fs.existsSync(path.join(ROOT, u))) problems.push(`lessons.js: url -> ${u} (missing file)`);
}

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
    if (/</.test(body)) {
      const around = body.slice(Math.max(0, body.indexOf("<") - 25), body.indexOf("<") + 25).replace(/\s+/g, " ");
      problems.push(`${rel(f)}: raw "<" inside <code> (use &lt;) near: ...${around}...`);
    }
  }

  // ---- data-lesson must be a known id ----
  const dl = (html.match(/data-lesson="([^"]+)"/) || [])[1];
  if (dl && !lessonIds.has(dl)) problems.push(`${rel(f)}: data-lesson="${dl}" not found in lessons.js`);

  // ---- engine wiring: a page that hosts an engine must load its script ----
  const ENGINES = [
    [/class="runpad"/, "runpad.js"],
    [/class="playground"/, "playground.js"],
    [/data-reqtrace/, "reqtrace.js"],
    [/data-looplab/, "looplab.js"],
    [/data-trainer/, "quizdrill.js"],
    [/class="flashdeck"/, "flashcards.js"],
  ];
  for (const [re, js] of ENGINES) {
    if (re.test(html) && !html.includes("assets/js/" + js))
      problems.push(`${rel(f)}: hosts ${re} but missing <script> ${js}`);
  }

  // ---- lesson wiring (pages that set data-lesson) ----
  // Universal modules every lesson page must load, in order. Interactive
  // engines (runpad.js, playground.js, reqtrace.js, looplab.js, …) are
  // page-specific and covered by the ENGINES map above.
  if (dl) {
    if (!/window\.SITE_BASE/.test(html)) problems.push(`${rel(f)}: lesson page missing window.SITE_BASE`);
    const CORE = ["lessons.js", "search-index.js", "main.js", "search.js", "progress.js"];
    let last = -1;
    for (const js of CORE) {
      const at = html.indexOf("assets/js/" + js);
      if (at === -1) { problems.push(`${rel(f)}: missing <script> ${js}`); continue; }
      if (at < last) problems.push(`${rel(f)}: <script> ${js} out of order (expected ${CORE.join(" → ")})`);
      last = at;
    }
  }
}

console.log(`Checked ${files.length} HTML files; ${lessonIds.size} lessons registered.`);
if (!problems.length) { console.log("✓ No problems found."); process.exit(0); }
console.log(`\n${problems.length} problem(s):`);
for (const p of problems) console.log("  • " + p);
process.exit(1);
