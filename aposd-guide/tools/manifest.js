/* ============================================================
   A Philosophy of Software Design — site manifest (single source of truth)
   Drives: tools/gen.js (page assembly + sidebar + lessons.js),
   tools/build-search-index.js (FILES), and tools/verify.js.
   Editing the site map here keeps every page's sidebar, the lesson
   registry, and the search index in agreement.

   Each content MODULE: { key, label, pages:[ {slug,title,nav,id,widgets} ] }
   - key      = folder name AND <body data-tool> (per-module accent)
   - id       = STABLE lesson id (used by progress.js); omit = not a lesson
   - slug     = filename without ".html"
   - widgets  = extra per-page <script>s (besides the always-on set);
                "refactor.js" = the before→after viewer; "flashcards.js" = the deck.
   NOTE: there are NO module "index" overview pages — modules group
   lessons in the sidebar; the home page carries the module map. This
   keeps the guide SHARP (the user's explicit preference). A lean,
   ~12-lesson distillation of Ousterhout's book — not a comprehensive
   re-telling. Code examples are Python; every idea is given twice
   (plain-English analogy + the precise technical version).
   ============================================================ */

const MODULES = [
  { key: "complexity", label: "Complexity — the enemy", pages: [
    { slug: "what-is-complexity",    title: "What is complexity?",                nav: "What is complexity?",   id: "cx-complexity" },
    { slug: "strategic-vs-tactical", title: "Strategic vs tactical programming",  nav: "Strategic vs tactical", id: "cx-tactical", widgets: ["refactor.js"] },
  ]},
  { key: "modules", label: "Deep modules — the core move", pages: [
    { slug: "deep-modules",                          title: "Deep modules",                          nav: "Deep modules",          id: "md-deep",    widgets: ["refactor.js"] },
    { slug: "information-hiding",                     title: "Information hiding & leakage",          nav: "Information hiding",     id: "md-hiding",  widgets: ["refactor.js"] },
    { slug: "general-purpose-modules",               title: "General-purpose modules are deeper",    nav: "General-purpose",        id: "md-general", widgets: ["refactor.js"] },
    { slug: "different-layer-different-abstraction", title: "Different layer, different abstraction", nav: "Layers & pass-through",  id: "md-layers",  widgets: ["refactor.js"] },
    { slug: "pull-complexity-down",                  title: "Pull complexity down · together or apart", nav: "Pull complexity down", id: "md-pull",   widgets: ["refactor.js"] },
  ]},
  { key: "craft", label: "Everyday craft", pages: [
    { slug: "define-errors-out-of-existence", title: "Define errors out of existence",    nav: "Define errors away",   id: "cf-errors",   widgets: ["refactor.js"] },
    { slug: "comments-why-and-what",          title: "Comments: why & what",              nav: "Comments: why & what", id: "cf-comments", widgets: ["refactor.js"] },
    { slug: "names-consistency-obvious",      title: "Names, consistency & obvious code", nav: "Names & obvious code", id: "cf-names",    widgets: ["refactor.js"] },
  ]},
  { key: "judgment", label: "Judgment", pages: [
    { slug: "design-it-twice-and-trends", title: "Design it twice · trends · performance", nav: "Design twice & trends", id: "jd-twice" },
    { slug: "red-flags-playbook",         title: "The red-flags playbook",                 nav: "Red-flags playbook",    id: "jd-redflags" },
  ]},
];

/* Reference surfaces — NOT lessons (no progress checkmark) */
const REFERENCE = [
  { dir: "reference", slug: "red-flags",  title: "Red-flags cheatsheet", nav: "Red-flags cheatsheet", tool: "reference", widgets: [] },
  { dir: "reference", slug: "flashcards", title: "Flashcards",           nav: "Flashcards",           tool: "reference", widgets: ["flashcards.js"] },
];

/* ---- helpers ---- */
function file(dir, slug) { return (dir ? dir + "/" : "") + slug + ".html"; }

function allPages() {
  const out = [];
  out.push({ file: "index.html", dir: "", slug: "index", title: "A Philosophy of Software Design", tool: "", lesson: null, module: null, widgets: [] });
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
  groups.push({ label: "Start here", cls: "", links: [{ file: "index.html", label: "Home · the big idea" }] });
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
