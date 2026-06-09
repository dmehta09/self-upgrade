#!/usr/bin/env node
/* Deep cross-checks beyond verify.js. Run: node tools/reverify.js */
const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

const ROOT = path.resolve(__dirname, "..");
const problems = [];

function fail(msg) { problems.push(msg); }

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

// Parse gen.js PAGES (entries are usually single-line objects)
function parseGenPages() {
  const src = fs.readFileSync(path.join(__dirname, "gen.js"), "utf8");
  const start = src.indexOf("const PAGES = [");
  const end = src.indexOf("];\n\n/* ===", start);
  const block = src.slice(start, end);
  const pages = [];
  const entryRe = /\{\s*out:\s*"([^"]+)"([\s\S]*?)\}/g;
  let m;
  while ((m = entryRe.exec(block))) {
    const body = m[2];
    const lessonM = body.match(/lesson:\s*"([^"]+)"/);
    const scriptsM = body.match(/scripts:\s*\[([^\]]+)\]/);
    pages.push({
      out: m[1],
      lesson: lessonM ? lessonM[1] : null,
      scripts: scriptsM
        ? scriptsM[1].split(",").map((s) => s.replace(/["'\s]/g, "")).filter(Boolean)
        : [],
      home: /home:\s*true/.test(body),
    });
  }
  return pages;
}

const genPages = parseGenPages();
const genContent = genPages.filter((p) => !p.home && p.out !== "index.html");
const genWithLesson = genContent.filter((p) => p.lesson);

const lessonsSrc = fs.readFileSync(path.join(ROOT, "assets/js/lessons.js"), "utf8");
const lessons = [];
const lre = /\{\s*id:\s*"([^"]+)",\s*title:\s*"[^"]+",\s*url:\s*"([^"]+)"/g;
let m;
while ((m = lre.exec(lessonsSrc))) lessons.push({ id: m[1], url: m[2] });

// Registry alignment
if (genContent.length !== 43) fail(`gen.js content pages: ${genContent.length}, expected 43`);
if (lessons.length !== 41) fail(`lessons.js: ${lessons.length} entries, expected 41`);
if (genWithLesson.length !== 41) fail(`gen.js lesson pages: ${genWithLesson.length}, expected 41`);

for (const l of lessons) {
  const g = genWithLesson.find((p) => p.out === l.url);
  if (!g) fail(`lessons.js ${l.id}: no gen.js entry for ${l.url}`);
  else if (g.lesson !== l.id) fail(`${l.url}: lesson id gen=${g.lesson} registry=${l.id}`);
}
for (const p of genWithLesson) {
  if (!lessons.find((l) => l.url === p.out)) fail(`gen.js ${p.lesson}: missing from lessons.js`);
}

const fragDir = path.join(__dirname, "fragments");
for (const p of genContent) {
  const frag = path.join(fragDir, p.out.replace(/\//g, "__"));
  if (!fs.existsSync(frag)) fail(`missing fragment for ${p.out}`);
}
for (const f of fs.readdirSync(fragDir).filter((x) => x.endsWith(".html"))) {
  const out = f.replace(/__/g, "/");
  if (!genContent.find((p) => p.out === out)) fail(`orphan fragment: ${out}`);
}

// gen drift
const hashBefore = execSync(
  'find . -path ./tools -prune -o -name "*.html" -type f -print0 | sort -z | xargs -0 md5 2>/dev/null | md5',
  { cwd: ROOT, encoding: "utf8" }
).trim();
execSync("node tools/gen.js", { cwd: ROOT, stdio: "pipe" });
const hashAfter = execSync(
  'find . -path ./tools -prune -o -name "*.html" -type f -print0 | sort -z | xargs -0 md5 2>/dev/null | md5',
  { cwd: ROOT, encoding: "utf8" }
).trim();
if (hashBefore !== hashAfter) fail("gen.js changed HTML — fragments and generated pages are out of sync");

const searchBefore = fs.readFileSync(path.join(ROOT, "assets/js/search-index.js"), "utf8");
execSync("node tools/build-search-index.js", { cwd: ROOT, stdio: "pipe" });
const searchAfter = fs.readFileSync(path.join(ROOT, "assets/js/search-index.js"), "utf8");
if (searchBefore !== searchAfter) fail("search-index.js was stale (rebuilt with diffs)");

// HTML deep checks
const CORE = ["lessons.js", "search-index.js", "main.js", "search.js", "progress.js"];
const CONFIGS = ["rf-config", "calc-config", "tr-config", "viz-config"];

for (const f of walk(ROOT)) {
  const rel = path.relative(ROOT, f).replace(/\\/g, "/");
  const html = fs.readFileSync(f, "utf8");
  const gp = genPages.find((p) => p.out === rel);

  if (gp && gp.lesson) {
    const dl = (html.match(/data-lesson="([^"]+)"/) || [])[1];
    if (dl !== gp.lesson) fail(`${rel}: data-lesson=${dl}, expected ${gp.lesson}`);
    if (!html.includes("lesson-complete")) fail(`${rel}: missing lesson-complete button`);
    for (const s of CORE) if (!html.includes("assets/js/" + s)) fail(`${rel}: missing ${s}`);
    for (const s of gp.scripts) if (!html.includes("assets/js/" + s)) fail(`${rel}: missing ${s}`);
  }

  if (html.includes("data-reqflow") && !html.includes("reqflow.js")) fail(`${rel}: reqflow without script`);
  if (html.includes("data-calc") && !html.includes("capacity.js")) fail(`${rel}: calc without script`);
  if (html.includes("data-tradeoff") && !html.includes("tradeoff.js")) fail(`${rel}: tradeoff without script`);
  if (html.includes("viz-config") && !html.includes("visualizer.js")) fail(`${rel}: viz without script`);

  for (const cls of CONFIGS) {
    const re = new RegExp('class="' + cls + '"[^>]*>([\\s\\S]*?)<\\/script>', "g");
    let jm;
    while ((jm = re.exec(html))) {
      try { JSON.parse(jm[1].trim()); }
      catch (e) { fail(`${rel}: invalid ${cls} JSON — ${e.message}`); }
    }
  }

  if (html.includes('class="content has-toc"')) {
    const toc = (html.match(/<aside class="toc"[\s\S]*?<\/aside>/) || [""])[0];
    const ids = new Set([...html.matchAll(/\bid="([^"]+)"/g)].map((x) => x[1]));
    for (const h of [...toc.matchAll(/href="#([^"]+)"/g)].map((x) => x[1])) {
      if (!ids.has(h)) fail(`${rel}: TOC #${h} missing`);
    }
  }
}

// Search index
const idxSrc = fs.readFileSync(path.join(ROOT, "assets/js/search-index.js"), "utf8");
const idxM = idxSrc.match(/window\.SEARCH_INDEX\s*=\s*(\[[\s\S]*\])\s*;/);
if (!idxM) fail("search-index.js: cannot parse SEARCH_INDEX");
else {
  const idx = JSON.parse(idxM[1]);
  const pageUrls = new Set(idx.map((r) => r.url.split("#")[0]));
  for (const l of lessons) if (!pageUrls.has(l.url)) fail(`search index missing ${l.url}`);
  for (const r of idx) {
    if (!r.url.includes("#")) continue;
    const [page, id] = r.url.split("#");
    const fp = path.join(ROOT, page);
    if (!fs.existsSync(fp)) { fail(`search ${r.url}: file missing`); continue; }
    const h = fs.readFileSync(fp, "utf8");
    if (!h.includes('id="' + id + '"')) fail(`search ${r.url}: anchor missing`);
  }
}

// Home
const home = fs.readFileSync(path.join(ROOT, "index.html"), "utf8");
if ((home.match(/class="dz /g) || []).length !== 23) fail("home: expected 23 case-study cards");
if (!home.includes("of 41 lessons")) fail("home: progress dashboard should reference 41 lessons");

// Content signals
let noAnalogy = 0, noQuiz = 0, thin = 0;
for (const p of genWithLesson) {
  const frag = fs.readFileSync(path.join(fragDir, p.out.replace(/\//g, "__")), "utf8");
  if (!frag.includes("callout analogy")) noAnalogy++;
  if (!frag.includes("data-quiz")) noQuiz++;
  if (frag.split("\n").length < 60) thin++;
}

console.log("Deep reverify — sysdesign-guide");
console.log("  verify.js: run separately");
console.log("  gen pages: " + genContent.length + " | lessons: " + lessons.length + " | fragments: " + fs.readdirSync(fragDir).filter((f) => f.endsWith(".html")).length);
console.log("  HTML files: " + walk(ROOT).length);
if (idxM) console.log("  search records: " + JSON.parse(idxM[1]).length);
console.log("  gen drift: " + (hashBefore === hashAfter ? "none" : "CHANGED"));
console.log("  search drift: " + (searchBefore === searchAfter ? "none" : "rebuilt"));
console.log("  lessons w/o analogy callout: " + noAnalogy + "/32");
console.log("  lessons w/o quiz: " + noQuiz + "/32");
console.log("  lessons <60 lines: " + thin + "/32");

if (!problems.length) {
  console.log("\n✓ All deep checks passed.");
  process.exit(0);
}
console.log("\n" + problems.length + " problem(s):");
problems.forEach((p) => console.log("  • " + p));
process.exit(1);
