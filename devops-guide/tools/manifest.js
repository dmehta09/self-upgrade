/* ============================================================
   DevOps Field Guide — site manifest (single source of truth)
   Drives: tools/gen.js (page assembly + sidebar + lessons.js),
   tools/build-search-index.js (FILES), and tools/verify.js.
   Editing the site map here keeps every page's sidebar, the lesson
   registry, and the search index in agreement.

   Each content MODULE: { key, label, pages:[ {slug,title,nav,id,widgets} ] }
   - key      = folder name AND <body data-tool> (per-module accent)
   - id       = STABLE lesson id (used by progress.js); omit = not a lesson
   - slug     = filename without ".html"
   - widgets  = extra per-page engine <script>s (besides the always-on set)
   NOTE: there are NO module "index" overview pages — modules group
   lessons in the sidebar; the home page carries the module map. This
   keeps the guide sharp (the user's explicit preference).
   ============================================================ */

const MODULES = [
  { key: "foundations", label: "Foundations", pages: [
    { slug: "what-is-devops",            title: "What DevOps really is",                    nav: "What DevOps is",         id: "fo-what" },
    { slug: "lifecycle-and-toolchain",   title: "The delivery lifecycle & 2026 toolchain",  nav: "Lifecycle & toolchain",  id: "fo-lifecycle", widgets: ["reqflow.js"] },
    { slug: "dora-and-delivery-metrics", title: "DORA & delivery metrics",                  nav: "DORA & metrics",         id: "fo-dora",      widgets: ["tradeoff.js"] },
  ]},
  { key: "linux-networking", label: "Linux & Networking", pages: [
    { slug: "linux-for-devops",      title: "Linux for DevOps",      nav: "Linux essentials",      id: "ln-linux" },
    { slug: "networking-for-devops", title: "Networking for DevOps", nav: "Networking essentials", id: "ln-net", widgets: ["reqflow.js"] },
  ]},
  { key: "cicd", label: "Git & CI/CD", pages: [
    { slug: "git-and-branching",      title: "Git & branching models",            nav: "Git & branching",        id: "ci-git" },
    { slug: "continuous-integration", title: "Continuous integration",            nav: "Continuous integration", id: "ci-ci", widgets: ["reqflow.js"] },
    { slug: "continuous-delivery",    title: "Continuous delivery & deployment",  nav: "Continuous delivery",    id: "ci-cd", widgets: ["reqflow.js"] },
  ]},
  { key: "containers", label: "Containers (Docker)", pages: [
    { slug: "images-and-dockerfiles", title: "Images & Dockerfiles", nav: "Images & Dockerfiles", id: "co-images" },
    { slug: "running-containers",     title: "Running containers",   nav: "Running containers",   id: "co-run", widgets: ["tradeoff.js"] },
  ]},
  { key: "kubernetes", label: "Kubernetes", pages: [
    { slug: "k8s-mental-model",      title: "The Kubernetes mental model", nav: "Mental model",        id: "ku-model",     widgets: ["reqflow.js"] },
    { slug: "core-objects",          title: "Core objects",                nav: "Core objects",        id: "ku-objects",   widgets: ["reqflow.js"] },
    { slug: "workloads-and-scaling", title: "Workloads, scaling & config", nav: "Workloads & scaling", id: "ku-workloads" },
  ]},
  { key: "iac", label: "Infrastructure as Code", pages: [
    { slug: "iac-and-terraform-model", title: "IaC & the Terraform model", nav: "IaC & Terraform model", id: "ia-model" },
    { slug: "terraform-in-practice",   title: "Terraform in practice",     nav: "Terraform in practice", id: "ia-practice" },
  ]},
  { key: "aws", label: "AWS for DevOps", pages: [
    { slug: "compute-and-networking",    title: "AWS compute & networking",    nav: "Compute & networking",   id: "aw-compute",    widgets: ["reqflow.js", "capacity.js"] },
    { slug: "containers-and-serverless", title: "AWS containers & serverless", nav: "Containers & serverless", id: "aw-containers" },
    { slug: "iam-storage-data",          title: "IAM, storage & data",         nav: "IAM, storage & data",    id: "aw-iam" },
  ]},
  { key: "delivery", label: "Deploy strategies & GitOps", pages: [
    { slug: "release-strategies",          title: "Release strategies",            nav: "Release strategies", id: "de-release", widgets: ["deploy-viz.js"] },
    { slug: "gitops-progressive-delivery", title: "GitOps & progressive delivery", nav: "GitOps",             id: "de-gitops",  widgets: ["reqflow.js", "tradeoff.js"] },
  ]},
  { key: "operate", label: "Reliability & Security", pages: [
    { slug: "incident-response",          title: "Incident response & on-call", nav: "Incident response",        id: "op-incident" },
    { slug: "postmortems-and-resilience", title: "Postmortems & resilience",    nav: "Postmortems & resilience", id: "op-postmortem" },
    { slug: "devsecops-essentials",       title: "DevSecOps essentials",        nav: "DevSecOps",                id: "op-security" },
  ]},
];

/* Interview prep (folder interview/, data-tool "interview", lesson-module "interview") */
const INTERVIEW_PREP = [
  { dir: "interview", slug: "index",         title: "How DevOps interviews work", nav: "How to interview", id: "iv-method" },
  { dir: "interview", slug: "question-bank", title: "DevOps question bank",       nav: "Question bank",    id: "iv-bank" },
  { dir: "interview", slug: "scenarios",     title: "Scenario walkthroughs",      nav: "Scenarios",        id: "iv-scenarios", widgets: ["reqflow.js", "deploy-viz.js"] },
];
/* Reference / practice surfaces — NOT lessons */
const REFERENCE = [
  { dir: "interview", slug: "cheat-sheet", title: "DevOps cheat-sheet", nav: "Cheat-sheet", tool: "interview", widgets: [] },
  { dir: "interview", slug: "flashcards",  title: "DevOps flashcards",  nav: "Flashcards",  tool: "interview", widgets: ["flashcards.js"] },
  { dir: "reference", slug: "glossary",    title: "Glossary",           nav: "Glossary",    tool: "",          widgets: [] },
];

/* ---- helpers ---- */
function file(dir, slug) { return (dir ? dir + "/" : "") + slug + ".html"; }

function allPages() {
  const out = [];
  out.push({ file: "index.html", dir: "", slug: "index", title: "DevOps Field Guide", tool: "", lesson: null, module: null, widgets: [] });
  MODULES.forEach(function (m) {
    m.pages.forEach(function (p) {
      out.push({ file: file(m.key, p.slug), dir: m.key, slug: p.slug, title: p.title,
        tool: m.key, lesson: p.id || null, module: p.id ? m.key : null, widgets: p.widgets || [] });
    });
  });
  INTERVIEW_PREP.forEach(function (p) {
    out.push({ file: file(p.dir, p.slug), dir: p.dir, slug: p.slug, title: p.title,
      tool: "interview", lesson: p.id || null, module: p.id ? "interview" : null, widgets: p.widgets || [] });
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
  groups.push({ label: "Interview prep", cls: "is-interview",
    links: INTERVIEW_PREP.map(function (p) { return { file: file(p.dir, p.slug), label: p.nav }; })
      .concat(REFERENCE.filter(function (p) { return p.dir === "interview"; }).map(function (p) { return { file: file(p.dir, p.slug), label: p.nav }; })) });
  groups.push({ label: "Reference", cls: "",
    links: REFERENCE.filter(function (p) { return p.dir === "reference"; }).map(function (p) { return { file: file(p.dir, p.slug), label: p.nav }; }) });
  return groups;
}

/* ordered lessons for lessons.js (module field = data-tool, except interview area) */
function lessons() {
  const out = [];
  MODULES.forEach(function (m) {
    m.pages.forEach(function (p) { if (p.id) out.push({ id: p.id, title: p.title, url: file(m.key, p.slug), module: m.key, tool: m.key }); });
  });
  INTERVIEW_PREP.forEach(function (p) {
    if (p.id) out.push({ id: p.id, title: p.title, url: file(p.dir, p.slug), module: "interview", tool: "interview" });
  });
  return out;
}

const LESSON_MODULES = MODULES.map(function (m) { return { key: m.key, label: m.label }; })
  .concat([{ key: "interview", label: "Interview prep" }]);

module.exports = { MODULES, INTERVIEW_PREP, REFERENCE, allPages, sidebarGroups, lessons, LESSON_MODULES, file };
