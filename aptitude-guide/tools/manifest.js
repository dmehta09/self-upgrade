/* ============================================================
   Aptitude & Reasoning Field Guide — site manifest (single source of truth)
   Drives: tools/gen.js (page assembly + sidebar + lessons.js),
   tools/build-search-index.js (FILES), and tools/verify.js.
   Editing the site map here keeps every page's sidebar, the lesson
   registry, and the search index in agreement.

   Each content MODULE: { key, label, pages:[ {slug,title,nav,id,widgets} ] }
   - key      = folder name AND <body data-tool> (per-module accent)
   - id       = STABLE lesson id (used by progress.js); omit = not a lesson
   - slug     = filename without ".html"
   - widgets  = extra per-page <script>s (besides the always-on set);
                "drill.js" auto-pulls "question-bank.js" in gen.js.
   NOTE: there are NO module "index" overview pages — modules group
   lessons in the sidebar; the home page carries the module map. This
   keeps the guide sharp (the user's explicit preference). Target =
   tech-placement / online-assessment (OA) rounds, June 2026.
   ============================================================ */

const MODULES = [
  { key: "foundations", label: "Test Strategy & Speed", pages: [
    { slug: "how-aptitude-tests-work", title: "How aptitude tests work",   nav: "How tests work",      id: "fo-tests" },
    { slug: "speed-math-toolkit",      title: "The speed-math toolkit",     nav: "Speed-math toolkit",  id: "fo-speed", widgets: ["drill.js"] },
  ]},
  { key: "quant", label: "Quantitative Aptitude", pages: [
    { slug: "numbers-and-divisibility",                  title: "Numbers & divisibility",                 nav: "Numbers & divisibility", id: "qa-numbers",  widgets: ["drill.js"] },
    { slug: "percentages",                               title: "Percentages",                            nav: "Percentages",            id: "qa-percent",  widgets: ["drill.js"] },
    { slug: "ratio-proportion-mixtures",                 title: "Ratio, proportion & mixtures",           nav: "Ratio & mixtures",       id: "qa-ratio",    widgets: ["drill.js"] },
    { slug: "averages-and-ages",                         title: "Averages & ages",                        nav: "Averages & ages",        id: "qa-averages", widgets: ["drill.js"] },
    { slug: "profit-loss-and-interest",                  title: "Profit, loss & interest",                nav: "Profit, loss, interest", id: "qa-commerce", widgets: ["drill.js"] },
    { slug: "time-speed-distance",                       title: "Time, speed & distance",                 nav: "Time, speed & distance", id: "qa-tsd",      widgets: ["drill.js"] },
    { slug: "time-and-work",                             title: "Time & work",                            nav: "Time & work",            id: "qa-work",     widgets: ["drill.js"] },
    { slug: "permutations-combinations-probability",     title: "Permutations, combinations & probability", nav: "P&C & probability",    id: "qa-pnc",      widgets: ["drill.js"] },
  ]},
  { key: "reasoning", label: "Logical Reasoning", pages: [
    { slug: "series-and-analogies",        title: "Series, analogies & classification", nav: "Series & analogies",     id: "lr-series",    widgets: ["drill.js"] },
    { slug: "coding-decoding",             title: "Coding–decoding",               nav: "Coding–decoding",   id: "lr-coding",    widgets: ["drill.js"] },
    { slug: "blood-relations",             title: "Blood relations",                    nav: "Blood relations",        id: "lr-blood",     widgets: ["drill.js"] },
    { slug: "direction-sense",             title: "Direction sense",                    nav: "Direction sense",        id: "lr-direction", widgets: ["drill.js"] },
    { slug: "syllogisms-and-statements",   title: "Syllogisms & statements",            nav: "Syllogisms & statements", id: "lr-deduction", widgets: ["drill.js"] },
    { slug: "seating-and-puzzles",         title: "Seating & puzzles",                  nav: "Seating & puzzles",      id: "lr-seating",   widgets: ["drill.js"] },
    { slug: "clocks-calendars-cubes-dice", title: "Clocks, calendars, cubes & dice",    nav: "Clocks, calendars, cubes", id: "lr-spatial", widgets: ["drill.js"] },
  ]},
  { key: "verbal", label: "Verbal Ability", pages: [
    { slug: "reading-comprehension",                  title: "Reading comprehension",                nav: "Reading comprehension", id: "va-rc",         widgets: ["drill.js"] },
    { slug: "grammar-and-error-spotting",             title: "Grammar & error spotting",             nav: "Grammar & errors",      id: "va-grammar",    widgets: ["drill.js"] },
    { slug: "sentence-completion-and-para-jumbles",   title: "Sentence completion & para-jumbles",   nav: "Completion & jumbles",  id: "va-completion", widgets: ["drill.js"] },
    { slug: "vocabulary",                             title: "Vocabulary",                           nav: "Vocabulary",            id: "va-vocab",      widgets: ["drill.js"] },
  ]},
  { key: "di", label: "Data Interpretation", pages: [
    { slug: "charts-and-tables",      title: "Charts & tables",      nav: "Charts & tables",   id: "di-charts",   widgets: ["drill.js"] },
    { slug: "caselets-and-mixed-sets", title: "Caselets & mixed sets", nav: "Caselets & mixed", id: "di-caselets", widgets: ["drill.js"] },
    { slug: "data-sufficiency",       title: "Data sufficiency",     nav: "Data sufficiency",  id: "di-ds",       widgets: ["drill.js"] },
  ]},
  { key: "practice", label: "Practice", pages: [
    { slug: "method", title: "How to crack the test",  nav: "Method & time budgets", id: "pr-method" },
    { slug: "drill",  title: "Timed practice drill",   nav: "Timed drill",           id: "pr-drill", widgets: ["drill.js"] },
  ]},
];

/* Reference surfaces — NOT lessons (no progress checkmark) */
const REFERENCE = [
  { dir: "reference", slug: "formula-sheet", title: "Formula & shortcut sheet", nav: "Formula sheet", tool: "reference", widgets: [] },
  { dir: "reference", slug: "flashcards",    title: "Flashcards",               nav: "Flashcards",    tool: "reference", widgets: ["flashcards.js"] },
  { dir: "reference", slug: "glossary",      title: "Glossary",                 nav: "Glossary",      tool: "reference", widgets: [] },
];

/* ---- helpers ---- */
function file(dir, slug) { return (dir ? dir + "/" : "") + slug + ".html"; }

function allPages() {
  const out = [];
  out.push({ file: "index.html", dir: "", slug: "index", title: "Aptitude & Reasoning Field Guide", tool: "", lesson: null, module: null, widgets: [] });
  MODULES.forEach(function (m) {
    m.pages.forEach(function (p) {
      out.push({ file: file(m.key, p.slug), dir: m.key, slug: p.slug, title: p.title,
        tool: m.key, lesson: p.id || null, module: p.id ? m.key : null, widgets: p.widgets || [] });
    });
  });
  REFERENCE.forEach(function (p) {
    out.push({ file: file(p.dir, p.slug), dir: p.dir, slug: p.slug, title: p.title,
      tool: p.tool || "", lesson: null, module: null, widgets: p.widgets || [] });
  });
  return out;
}

/* ---- sidebar groups (ordered) ---- */
function sidebarGroups() {
  const groups = [];
  groups.push({ label: "Start here", cls: "", links: [{ file: "index.html", label: "Home · the roadmap" }] });
  MODULES.forEach(function (m) {
    groups.push({ label: m.label, cls: "is-" + m.key,
      links: m.pages.map(function (p) { return { file: file(m.key, p.slug), label: p.nav }; }) });
  });
  groups.push({ label: "Reference", cls: "is-reference",
    links: REFERENCE.map(function (p) { return { file: file(p.dir, p.slug), label: p.nav }; }) });
  return groups;
}

/* ordered lessons for lessons.js (module field = data-tool) */
function lessons() {
  const out = [];
  MODULES.forEach(function (m) {
    m.pages.forEach(function (p) { if (p.id) out.push({ id: p.id, title: p.title, url: file(m.key, p.slug), module: m.key, tool: m.key }); });
  });
  return out;
}

const LESSON_MODULES = MODULES.map(function (m) { return { key: m.key, label: m.label }; });

module.exports = { MODULES, REFERENCE, allPages, sidebarGroups, lessons, LESSON_MODULES, file };
