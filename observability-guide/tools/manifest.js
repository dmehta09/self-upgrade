/* ============================================================
   Observability Field Guide — site manifest (single source of truth)
   Drives: tools/gen.js (page assembly + sidebar + lessons.js) and
   tools/build-search-index.js (FILES) and tools/verify.js.
   Editing the site map here keeps every page's sidebar, the lesson
   registry, the search index, and verify in agreement.

   Each content MODULE: { key, label, pages:[ {slug,title,nav,id,widgets} ] }
   - key      = folder name AND <body data-tool> (per-module accent)
   - id       = STABLE lesson id (used by progress.js); omit = not a lesson
   - slug     = filename without ".html" ("index" = module overview)
   - widgets  = extra per-page <script> engines (besides the always-on set)
   The Interview area + Reference are defined separately because their
   folder / data-tool / lesson-module differ from the 1:1 content rule.
   ============================================================ */

const MODULES = [
  { key: "foundations", label: "Foundations", pages: [
    { slug: "index",                 title: "Foundations — see your systems",     nav: "Overview",                   id: "fo-overview" },
    { slug: "what-is-observability", title: "Monitoring vs observability",        nav: "Monitoring vs observability", id: "fo-what" },
    { slug: "three-pillars",         title: "The three pillars + signals",        nav: "Three pillars & signals",    id: "fo-pillars" },
    { slug: "cardinality",           title: "Cardinality & the cost model",       nav: "Cardinality & cost",         id: "fo-cardinality", widgets: ["series-lab.js"] },
    { slug: "the-stack",             title: "The 2026 stack: open source + vendors", nav: "The stack & vendors",     id: "fo-stack" },
  ]},
  { key: "logs", label: "Logs", pages: [
    { slug: "index",              title: "Logs — the narrative signal",  nav: "Overview",          id: "lo-overview" },
    { slug: "structured-logging", title: "Structured logging",           nav: "Structured logging", id: "lo-structured" },
    { slug: "correlation",        title: "Correlation IDs & context",    nav: "Correlation IDs",   id: "lo-correlation" },
    { slug: "loki-and-pipelines", title: "Loki & log pipelines",         nav: "Loki & pipelines",  id: "lo-loki" },
  ]},
  { key: "metrics", label: "Metrics", pages: [
    { slug: "index",                  title: "Metrics — the cheap signal",  nav: "Overview",                id: "me-overview" },
    { slug: "metric-types",           title: "The four metric types",       nav: "Metric types",            id: "me-types",      widgets: ["series-lab.js"] },
    { slug: "red-use",                title: "RED & USE methods",           nav: "RED & USE",               id: "me-red-use" },
    { slug: "histograms-percentiles", title: "Histograms & percentiles",    nav: "Histograms & percentiles", id: "me-histograms", widgets: ["series-lab.js"] },
  ]},
  { key: "traces", label: "Traces & distributed tracing", pages: [
    { slug: "index",             title: "Traces — the causal signal",            nav: "Overview",       id: "tr-overview" },
    { slug: "spans-and-context", title: "Spans & context propagation",           nav: "Spans & context", id: "tr-spans",    widgets: ["trace-waterfall.js"] },
    { slug: "critical-path",     title: "Reading a trace: the critical path",    nav: "Critical path",  id: "tr-critical", widgets: ["trace-waterfall.js"] },
    { slug: "sampling",          title: "Trace sampling",                        nav: "Sampling",       id: "tr-sampling", widgets: ["sampling-viz.js"] },
  ]},
  { key: "otel", label: "OpenTelemetry", pages: [
    { slug: "index",                 title: "OpenTelemetry — one standard",      nav: "Overview",            id: "ot-overview" },
    { slug: "api-sdk-collector",     title: "API, SDK & Collector",              nav: "API · SDK · Collector", id: "ot-architecture" },
    { slug: "instrumentation",       title: "Auto vs manual instrumentation",    nav: "Instrumentation",     id: "ot-instrumentation" },
    { slug: "semantic-conventions",  title: "Semantic conventions",              nav: "Semantic conventions", id: "ot-semconv" },
  ]},
  { key: "promstack", label: "Prometheus & Grafana", pages: [
    { slug: "index",            title: "Prometheus & Grafana",          nav: "Overview",          id: "pr-overview" },
    { slug: "prometheus-model", title: "The Prometheus model",          nav: "Prometheus model",  id: "pr-model" },
    { slug: "promql",           title: "PromQL, hands-on",              nav: "PromQL",            id: "pr-promql",   widgets: ["query-explorer.js"] },
    { slug: "grafana-dashboards", title: "Grafana dashboards",          nav: "Grafana dashboards", id: "pr-grafana" },
    { slug: "alertmanager",     title: "Alerting with Alertmanager",    nav: "Alertmanager",      id: "pr-alerting" },
  ]},
  { key: "slo", label: "SLO / SLI & alerting", pages: [
    { slug: "index",            title: "SLO / SLI & alerting",          nav: "Overview",         id: "sl-overview" },
    { slug: "sli-slo-sla",      title: "SLI vs SLO vs SLA",             nav: "SLI · SLO · SLA",  id: "sl-definitions" },
    { slug: "error-budgets",    title: "Error budgets & burn rate",     nav: "Error budgets",    id: "sl-budgets",     widgets: ["budget-burn.js"] },
    { slug: "alerting-on-slos", title: "Multi-burn-rate alerting",      nav: "SLO-based alerting", id: "sl-burn-alerts", widgets: ["budget-burn.js"] },
  ]},
];

/* Interview prep (folder interview/, data-tool "interview", lesson-module "interview") */
const INTERVIEW_PREP = [
  { dir: "interview", slug: "index",         title: "How observability interviews work", nav: "How to interview", id: "iv-method" },
  { dir: "interview", slug: "question-bank", title: "Observability question bank",       nav: "Question bank",    id: "iv-bank" },
];
/* Debugging scenarios (folder interview/scenarios/) */
const SCENARIOS = [
  { dir: "interview/scenarios", slug: "index",        title: "Debugging scenarios",         nav: "Scenario method",  id: "iv-sc-method" },
  { dir: "interview/scenarios", slug: "latency-spike", title: "Scenario: p99 latency spike", nav: "p99 latency spike", id: "iv-sc-latency", widgets: ["trace-waterfall.js"] },
  { dir: "interview/scenarios", slug: "error-surge",  title: "Scenario: error-rate surge",  nav: "Error-rate surge", id: "iv-sc-errors",  widgets: ["budget-burn.js"] },
];
/* Reference / practice surfaces — NOT lessons */
const REFERENCE = [
  { dir: "interview", slug: "cheatsheet", title: "Observability cheat-sheet", nav: "Cheat-sheet", tool: "interview", widgets: [] },
  { dir: "interview", slug: "flashcards", title: "Observability flashcards",  nav: "Flashcards",  tool: "interview", widgets: ["flashcards.js"] },
  { dir: "reference", slug: "glossary",   title: "Glossary",                  nav: "Glossary",    tool: "",          widgets: [] },
];

/* ---- helpers ---- */
function file(dir, slug) { return (dir ? dir + "/" : "") + slug + ".html"; }

function allPages() {
  const out = [];
  out.push({ file: "index.html", dir: "", slug: "index", title: "Observability Field Guide", tool: "", lesson: null, module: null, widgets: [] });
  MODULES.forEach(function (m) {
    m.pages.forEach(function (p) {
      out.push({ file: file(m.key, p.slug), dir: m.key, slug: p.slug, title: p.title,
        tool: m.key, lesson: p.id || null, module: p.id ? m.key : null, widgets: p.widgets || [] });
    });
  });
  INTERVIEW_PREP.concat(SCENARIOS).forEach(function (p) {
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
  groups.push({ label: "Debugging scenarios", cls: "is-interview",
    links: SCENARIOS.map(function (p) { return { file: file(p.dir, p.slug), label: p.nav }; }) });
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
  INTERVIEW_PREP.concat(SCENARIOS).forEach(function (p) {
    if (p.id) out.push({ id: p.id, title: p.title, url: file(p.dir, p.slug), module: "interview", tool: "interview" });
  });
  return out;
}

const LESSON_MODULES = MODULES.map(function (m) { return { key: m.key, label: m.label }; })
  .concat([{ key: "interview", label: "Interview prep" }]);

module.exports = { MODULES, INTERVIEW_PREP, SCENARIOS, REFERENCE, allPages, sidebarGroups, lessons, LESSON_MODULES, file };
