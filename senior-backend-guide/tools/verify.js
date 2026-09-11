#!/usr/bin/env node
/* Static verification for Senior Backend Scenario Q&A.
   Crawls every .html under the project root (excluding tools/) and checks:
     • every internal link (href) resolves to an existing file
     • every #anchor (in-page, page-nav, TOC, sidebar) resolves to an existing id
     • every <script src> and <link href> asset resolves
     • no raw "<" inside <code> blocks (would break the highlighter)
     • each lesson page wires the 5 JS modules and sets SITE_BASE + data-lesson
     • every data-lesson id is registered in lessons.js, and every lesson url exists
     • any visualizer mount class on a page also loads its engine <script>
     • every inline <script type="application/json"> config is valid JSON
   Usage:  node tools/verify.js
*/
const fs = require("fs");
const path = require("path");
const ROOT = path.resolve(__dirname, "..");

const REQUIRED_SCRIPTS = ["lessons.js", "search-index.js", "main.js", "search.js", "progress.js"];
// mount class -> engine script that must be present when the class appears
const ENGINES = {
  flashdeck: "flashcards.js",
  trainer: "drill-bank.js",
  "sbe-drill": "drill-bank.js",
};

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
  // strip <pre>/<code> so example markup (href=, src=) inside snippets isn't validated as real links/assets
  const htmlNoCode = html.replace(/<pre[\s\S]*?<\/pre>/gi, " ").replace(/<code[\s\S]*?<\/code>/gi, " ");

  // ---- links ----
  let m; const linkRe = /\bhref="([^"]+)"/g;
  while ((m = linkRe.exec(htmlNoCode))) {
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
  while ((m = assetRe.exec(htmlNoCode))) {
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

  // ---- visualizer engine wiring ----
  Object.keys(ENGINES).forEach(function (cls) {
    const re2 = new RegExp('class="[^"]*\\b' + cls + '\\b');
    if (re2.test(html) && !html.includes("assets/js/" + ENGINES[cls]))
      problems.push(`${rel(f)}: uses .${cls} but does not load ${ENGINES[cls]}`);
  });

  // ---- inline JSON configs must parse ----
  let jm; const jsonRe = /<script[^>]*type="application\/json"[^>]*>([\s\S]*?)<\/script>/g;
  while ((jm = jsonRe.exec(html))) {
    try { JSON.parse(jm[1]); }
    catch (e) { problems.push(`${rel(f)}: invalid JSON in <script type="application/json">: ${e.message}`); }
  }

  // ---- data-lesson must be a known id ----
  const dl = (html.match(/data-lesson="([^"]+)"/) || [])[1];
  if (dl && !lessonIds.has(dl)) problems.push(`${rel(f)}: data-lesson="${dl}" not found in lessons.js`);

  // ---- lesson wiring (pages that set data-lesson) ----
  if (dl) {
    if (!/window\.SITE_BASE/.test(html)) problems.push(`${rel(f)}: lesson page missing window.SITE_BASE`);
    for (const js of REQUIRED_SCRIPTS)
      if (!html.includes("assets/js/" + js)) problems.push(`${rel(f)}: missing <script> ${js}`);
  }
}

console.log(`Checked ${files.length} HTML files; ${lessonIds.size} lessons registered.`);
if (!problems.length) { console.log("✓ No problems found."); process.exit(0); }
console.log(`\n${problems.length} problem(s):`);
for (const p of problems) console.log("  • " + p);
process.exit(1);
