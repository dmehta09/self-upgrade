/* ============================================================
   Senior Backend Scenario Q&A — site manifest
   ============================================================ */

const MODULES = [
  { key: "domains", label: "Scenario domains", pages: [
    { slug: "debugging",     title: "Production debugging & incidents",     nav: "01 · Debugging",     id: "sb-d01" },
    { slug: "async",         title: "Async FastAPI / Node",                 nav: "02 · Async",         id: "sb-d02" },
    { slug: "dependencies",  title: "Third-party & dependency failures",    nav: "03 · Dependencies",  id: "sb-d03" },
    { slug: "api-design",    title: "API design & architecture",            nav: "04 · API design",    id: "sb-d04" },
    { slug: "postgres",      title: "PostgreSQL performance & concurrency", nav: "05 · PostgreSQL",    id: "sb-d05" },
    { slug: "mongodb",       title: "MongoDB modeling & scaling",           nav: "06 · MongoDB",       id: "sb-d06" },
    { slug: "redis",         title: "Redis, caching & rate limiting",       nav: "07 · Redis",         id: "sb-d07" },
    { slug: "kafka",         title: "Kafka & event-driven systems",         nav: "08 · Kafka",         id: "sb-d08" },
    { slug: "distributed",   title: "Distributed systems & failure",        nav: "09 · Distributed",   id: "sb-d09" },
    { slug: "aws-nginx",     title: "AWS, Nginx & networking",              nav: "10 · AWS / Nginx",   id: "sb-d10" },
    { slug: "security",      title: "Security & multi-tenancy",             nav: "11 · Security",      id: "sb-d11" },
    { slug: "ownership",     title: "Delivery & senior judgment",           nav: "12 · Ownership",     id: "sb-d12" },
    { slug: "projects",      title: "My projects deep dive",                nav: "13 · Projects",      id: "sb-d13" },
  ]},
];

const REFERENCE = [
  { dir: "", slug: "method", title: "How to answer scenario questions", nav: "Answer method", tool: "method", id: "sb-method" },
  { dir: "practice", slug: "drills", title: "Rapid-fire drills", nav: "Rapid-fire drills", tool: "practice", widgets: ["drill-bank.js"] },
  { dir: "practice", slug: "flashcards", title: "Flashcards", nav: "Flashcards", tool: "practice", widgets: ["flashcards.js"] },
  { dir: "reference", slug: "cheatsheets", title: "Domain cheatsheets", nav: "Cheatsheets", tool: "reference" },
  { dir: "reference", slug: "glossary", title: "Glossary", nav: "Glossary", tool: "reference" },
];

function file(dir, slug) { return (dir ? dir + "/" : "") + slug + ".html"; }

function allPages() {
  const out = [];
  out.push({ file: "index.html", dir: "", slug: "index", title: "Senior Backend Scenario Q&A", tool: "", lesson: null, module: null, widgets: [] });
  REFERENCE.filter(function (p) { return p.slug === "method"; }).forEach(function (p) {
    out.push({ file: file(p.dir, p.slug), dir: p.dir, slug: p.slug, title: p.title,
      tool: p.tool || "", lesson: p.id || null, module: p.id ? "method" : null, widgets: p.widgets || [] });
  });
  MODULES.forEach(function (m) {
    m.pages.forEach(function (p) {
      out.push({ file: file(m.key, p.slug), dir: m.key, slug: p.slug, title: p.title,
        tool: m.key, lesson: p.id || null, module: p.id ? m.key : null, widgets: p.widgets || [] });
    });
  });
  REFERENCE.filter(function (p) { return p.slug !== "method"; }).forEach(function (p) {
    out.push({ file: file(p.dir, p.slug), dir: p.dir, slug: p.slug, title: p.title,
      tool: p.tool || "", lesson: null, module: null, widgets: p.widgets || [] });
  });
  return out;
}

function sidebarGroups() {
  const groups = [];
  groups.push({ label: "Start here", cls: "", links: [
    { file: "index.html", label: "Home · roadmap" },
    { file: "method.html", label: "Answer method" },
  ]});
  MODULES.forEach(function (m) {
    groups.push({ label: m.label, cls: "is-" + m.key,
      links: m.pages.map(function (p) { return { file: file(m.key, p.slug), label: p.nav }; }) });
  });
  groups.push({ label: "Practice", cls: "is-practice", links: [
    { file: "practice/drills.html", label: "Rapid-fire drills" },
    { file: "practice/flashcards.html", label: "Flashcards" },
  ]});
  groups.push({ label: "Reference", cls: "is-reference", links: [
    { file: "reference/cheatsheets.html", label: "Cheatsheets" },
    { file: "reference/glossary.html", label: "Glossary" },
  ]});
  return groups;
}


const LESSON_MODULES = [
  { key: "method", label: "Method" },
  { key: "domains", label: "Scenario domains" },
];

function lessons() {
  return allPages().filter(function (p) { return p.lesson; }).map(function (p) {
    return { id: p.lesson, title: p.title, url: p.file, module: p.module, tool: p.tool };
  });
}

module.exports = { MODULES, REFERENCE, LESSON_MODULES, allPages, sidebarGroups, file, lessons };

