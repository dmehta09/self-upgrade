/* Cert Mocks Guide — site manifest (SAA-C03 · MLA-C02 · CKA v1.35) */
const MODULES = [
  { key: "saa", label: "SAA-C03", pages: [
    { slug: "method", title: "How to take SAA mocks", nav: "Method", id: "saa-method", widgets: ["mermaid-init.js"] },
    { slug: "domain-map", title: "SAA-C03 domain map", nav: "Domain map", id: "saa-map", widgets: ["mermaid-init.js"] },
    { slug: "mock-1", title: "SAA Mock 1 · full exam", nav: "Mock 1", id: "saa-m1", widgets: ["mock-exam.js"] },
    { slug: "mock-2", title: "SAA Mock 2 · full exam", nav: "Mock 2", id: "saa-m2", widgets: ["mock-exam.js"] },
    { slug: "mock-3", title: "SAA Mock 3 · full exam", nav: "Mock 3", id: "saa-m3", widgets: ["mock-exam.js"] },
    { slug: "high-yield", title: "SAA high-yield drill", nav: "High-yield", id: "saa-hy", widgets: ["mermaid-init.js"] },
  ]},
  { key: "mla", label: "MLA-C02", pages: [
    { slug: "method", title: "How to take MLA mocks", nav: "Method", id: "mla-method", widgets: ["mermaid-init.js"] },
    { slug: "domain-map", title: "MLA-C02 domain map", nav: "Domain map", id: "mla-map", widgets: ["mermaid-init.js"] },
    { slug: "mock-1", title: "MLA Mock 1 · full exam", nav: "Mock 1", id: "mla-m1", widgets: ["mock-exam.js"] },
    { slug: "mock-2", title: "MLA Mock 2 · full exam", nav: "Mock 2", id: "mla-m2", widgets: ["mock-exam.js"] },
    { slug: "mock-3", title: "MLA Mock 3 · full exam", nav: "Mock 3", id: "mla-m3", widgets: ["mock-exam.js"] },
    { slug: "high-yield", title: "MLA high-yield drill", nav: "High-yield", id: "mla-hy", widgets: ["mermaid-init.js"] },
  ]},
  { key: "cka", label: "CKA v1.35", pages: [
    { slug: "method", title: "How to take CKA mocks", nav: "Method", id: "cka-method", widgets: ["mermaid-init.js"] },
    { slug: "domain-map", title: "CKA domain map", nav: "Domain map", id: "cka-map", widgets: ["mermaid-init.js"] },
    { slug: "mock-1", title: "CKA Mock 1 · full exam", nav: "Mock 1", id: "cka-m1", widgets: ["task-mock.js"] },
    { slug: "mock-2", title: "CKA Mock 2 · full exam", nav: "Mock 2", id: "cka-m2", widgets: ["task-mock.js"] },
    { slug: "mock-3", title: "CKA Mock 3 · full exam", nav: "Mock 3", id: "cka-m3", widgets: ["task-mock.js"] },
    { slug: "warmup", title: "CKA task warm-up", nav: "Warm-up", id: "cka-wu", widgets: ["mermaid-init.js"] },
  ]},
];

const EXAM_PREP = [];

const REFERENCE = [
  { dir: "reference", slug: "scoring", title: "Scoring & real-exam mapping", nav: "Scoring notes", tool: "", widgets: [] },
];

function file(dir, slug) { return (dir ? dir + "/" : "") + slug + ".html"; }

function allPages() {
  const out = [];
  out.push({ file: "index.html", dir: "", slug: "index", title: "Cert Mocks Guide", tool: "", lesson: null, module: null, widgets: [] });
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

function sidebarGroups() {
  const groups = [];
  groups.push({ label: "Start here", cls: "", links: [{ file: "index.html", label: "Home · pick a track" }] });
  MODULES.forEach(function (m) {
    groups.push({ label: m.label, cls: "is-" + m.key,
      links: m.pages.map(function (p) { return { file: file(m.key, p.slug), label: p.nav }; }) });
  });
  groups.push({ label: "Reference", cls: "",
    links: REFERENCE.map(function (p) { return { file: file(p.dir, p.slug), label: p.nav }; }) });
  return groups;
}

function lessons() {
  const out = [];
  MODULES.forEach(function (m) {
    m.pages.forEach(function (p) {
      if (p.id) out.push({ id: p.id, title: p.title, url: file(m.key, p.slug), module: m.key, tool: m.key });
    });
  });
  return out;
}

const LESSON_MODULES = MODULES.map(function (m) { return { key: m.key, label: m.label }; });

module.exports = { MODULES, INTERVIEW_PREP: EXAM_PREP, EXAM_PREP, REFERENCE, allPages, sidebarGroups, lessons, LESSON_MODULES, file };
