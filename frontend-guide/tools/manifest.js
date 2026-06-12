/* ============================================================
   Frontend Field Guide — site manifest (single source of truth)
   Drives: tools/gen.js (page assembly + sidebar + lessons.js) and
   tools/build-search-index.js (FILES) and tools/verify.js.
   Editing the site map here keeps every page's sidebar, the lesson
   registry, the search index, and verify in agreement.

   Each content MODULE: { key, label, pages:[ {slug,title,nav,id,widgets} ] }
   - key      = folder name AND <body data-tool> (per-module accent)
   - id       = STABLE lesson id (used by progress.js); omit = not a lesson
   - slug     = filename without ".html" ("index" = module overview)
   - widgets  = extra per-page <script> engines (besides the always-on set)
   The Interview area is defined separately because its folder /
   data-tool / lesson-module differ from the 1:1 content rule.
   ============================================================ */

const MODULES = [
  { key: "foundations", label: "Foundations", pages: [
    { slug: "index",                title: "Foundations — the pro baseline", nav: "Overview",             id: "fo-overview" },
    { slug: "typescript-for-react", title: "TypeScript for React",           nav: "TypeScript for React", id: "fo-ts" },
    { slug: "advanced-typescript",  title: "Advanced TypeScript for React",  nav: "Advanced TypeScript",  id: "fo-ts-adv" },
    { slug: "vite-and-build-tools", title: "Vite & the build toolchain",     nav: "Vite & build tools",   id: "fo-vite" },
  ]},
  { key: "react", label: "React", pages: [
    { slug: "index",                  title: "React — the pro mental model",        nav: "Overview",              id: "re-overview" },
    { slug: "render-and-rerender",    title: "Render vs re-render",                 nav: "Render & re-render",    id: "re-render",      widgets: ["render-viz.js"] },
    { slug: "hooks-deep-dive",        title: "Hooks, identity & memoization",       nav: "Hooks deep-dive",       id: "re-hooks",       widgets: ["bugspot.js"] },
    { slug: "useeffect-mental-model", title: "useEffect — the right mental model",  nav: "useEffect mental model", id: "re-effect",     widgets: ["effect-timeline.js", "bugspot.js"] },
    { slug: "composition-and-context", title: "Composition & context",             nav: "Composition & context", id: "re-composition" },
    { slug: "react-19",               title: "React 19: Actions, use(), compiler",  nav: "React 19 features",     id: "re-19" },
  ]},
  { key: "nextjs", label: "Next.js (App Router)", pages: [
    { slug: "index",                       title: "Next.js App Router — overview",        nav: "Overview",            id: "nx-overview" },
    { slug: "app-router",                  title: "The App Router model",                 nav: "App Router model",    id: "nx-router" },
    { slug: "server-vs-client-components", title: "Server vs Client Components",          nav: "Server vs Client",    id: "nx-rsc",      widgets: ["rsc-boundary.js"] },
    { slug: "rendering-strategies",        title: "Rendering strategies: SSR/SSG/ISR/PPR", nav: "Rendering strategies", id: "nx-rendering", widgets: ["waterfall-viz.js"] },
    { slug: "data-fetching-and-caching",   title: "Data fetching & caching",             nav: "Data fetching & caching", id: "nx-data" },
    { slug: "server-actions",              title: "Server Actions & mutations",          nav: "Server Actions",      id: "nx-actions" },
  ]},
  { key: "styling", label: "Styling", pages: [
    { slug: "index",             title: "Styling — Tailwind + shadcn",         nav: "Overview",       id: "st-overview" },
    { slug: "tailwind-v4",       title: "Tailwind v4: CSS-first",              nav: "Tailwind v4",    id: "st-tailwind", widgets: ["tw-playground.js"] },
    { slug: "shadcn-ui-and-cva", title: "shadcn/ui & the cn()/cva pattern",    nav: "shadcn/ui & cva", id: "st-shadcn" },
  ]},
  { key: "data", label: "Data & state", pages: [
    { slug: "index",                title: "Data & state — three buckets",      nav: "Overview",            id: "da-overview" },
    { slug: "tanstack-query",       title: "TanStack Query: server-state",      nav: "TanStack Query",      id: "da-query",  widgets: ["cachelab.js"] },
    { slug: "zustand",              title: "Zustand for client state",          nav: "Zustand",             id: "da-zustand" },
    { slug: "forms-rhf-zod",        title: "Forms: react-hook-form + Zod",      nav: "Forms (RHF + Zod)",   id: "da-forms" },
    { slug: "state-decision-guide", title: "Where should this state live?",     nav: "State decision guide", id: "da-decision" },
  ]},
  { key: "perf", label: "Rendering & performance", pages: [
    { slug: "index",                 title: "Rendering & performance — overview", nav: "Overview",           id: "pe-overview" },
    { slug: "streaming-and-suspense", title: "Streaming SSR & Suspense",          nav: "Streaming & Suspense", id: "pe-streaming", widgets: ["waterfall-viz.js"] },
    { slug: "hydration",             title: "Hydration, explained",               nav: "Hydration",          id: "pe-hydration", widgets: ["waterfall-viz.js"] },
    { slug: "core-web-vitals",       title: "Core Web Vitals: LCP, INP, CLS",     nav: "Core Web Vitals",    id: "pe-vitals" },
  ]},
  { key: "testing", label: "Testing", pages: [
    { slug: "index",           title: "Testing — the trophy",            nav: "Overview",       id: "te-overview" },
    { slug: "vitest-and-rtl",  title: "Vitest + React Testing Library",  nav: "Vitest + RTL",   id: "te-vitest" },
    { slug: "playwright-e2e",  title: "End-to-end with Playwright",      nav: "Playwright E2E", id: "te-playwright" },
  ]},
  { key: "ship", label: "Ship it", pages: [
    { slug: "index",           title: "Ship it — tooling, a11y & deploy", nav: "Overview",       id: "sh-overview" },
    { slug: "lint-and-format", title: "ESLint, Biome & formatting",       nav: "Lint & format",  id: "sh-lint" },
    { slug: "accessibility",   title: "Accessibility interviewers test",  nav: "Accessibility",  id: "sh-a11y",  widgets: ["a11ylens.js"] },
    { slug: "security",        title: "Frontend security: XSS, CSP & CSRF", nav: "Security",     id: "sh-security", widgets: ["bugspot.js"] },
    { slug: "deploy-and-ci",   title: "Deploy & CI",                      nav: "Deploy & CI",    id: "sh-deploy" },
  ]},
];

/* Interview prep (folder interview/, data-tool "interview", lesson-module "interview") */
const INTERVIEW_PREP = [
  { dir: "interview", slug: "index",         title: "How frontend interviews work", nav: "How to interview", id: "iv-method" },
  { dir: "interview", slug: "question-bank", title: "Frontend question bank",       nav: "Question bank",    id: "iv-bank",   widgets: ["quizdrill.js"] },
];
/* Frontend design round (folder interview/design-scenarios/) */
const DESIGN_SCENARIOS = [
  { dir: "interview/design-scenarios", slug: "index",        title: "The frontend design round",   nav: "Design round method", id: "iv-ds-method" },
  { dir: "interview/design-scenarios", slug: "autocomplete", title: "Design an autocomplete",      nav: "Autocomplete",        id: "iv-ds-autocomplete", widgets: ["a11ylens.js"] },
  { dir: "interview/design-scenarios", slug: "data-table",   title: "Design a data table",         nav: "Data table",          id: "iv-ds-table" },
  { dir: "interview/design-scenarios", slug: "make-it-fast", title: "Make this page fast",         nav: "Make it fast",        id: "iv-ds-fast" },
  { dir: "interview/design-scenarios", slug: "live-feed",    title: "Design a live feed",          nav: "Live feed (realtime)", id: "iv-ds-realtime" },
];
/* Reference / practice surfaces — NOT lessons */
const REFERENCE = [
  { dir: "interview", slug: "cheatsheets", title: "Frontend cheat-sheets", nav: "Cheat-sheets", tool: "interview", widgets: [] },
  { dir: "interview", slug: "flashcards",  title: "Frontend flashcards",   nav: "Flashcards",   tool: "interview", widgets: ["flashcards.js"] },
  { dir: "interview", slug: "drills",      title: "Timed frontend drills", nav: "Timed drills", tool: "interview", widgets: ["quizdrill.js"] },
];

/* ---- helpers ---- */
function file(dir, slug) { return (dir ? dir + "/" : "") + slug + ".html"; }

function allPages() {
  const out = [];
  out.push({ file: "index.html", dir: "", slug: "index", title: "Frontend Field Guide", tool: "", lesson: null, module: null, widgets: [] });
  MODULES.forEach(function (m) {
    m.pages.forEach(function (p) {
      out.push({ file: file(m.key, p.slug), dir: m.key, slug: p.slug, title: p.title,
        tool: m.key, lesson: p.id || null, module: p.id ? m.key : null, widgets: p.widgets || [] });
    });
  });
  INTERVIEW_PREP.concat(DESIGN_SCENARIOS).forEach(function (p) {
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
      .concat(REFERENCE.map(function (p) { return { file: file(p.dir, p.slug), label: p.nav }; })) });
  groups.push({ label: "Design round", cls: "is-interview",
    links: DESIGN_SCENARIOS.map(function (p) { return { file: file(p.dir, p.slug), label: p.nav }; }) });
  return groups;
}

/* ordered lessons for lessons.js (module field = data-tool, except interview area) */
function lessons() {
  const out = [];
  MODULES.forEach(function (m) {
    m.pages.forEach(function (p) { if (p.id) out.push({ id: p.id, title: p.title, url: file(m.key, p.slug), module: m.key, tool: m.key }); });
  });
  INTERVIEW_PREP.concat(DESIGN_SCENARIOS).forEach(function (p) {
    if (p.id) out.push({ id: p.id, title: p.title, url: file(p.dir, p.slug), module: "interview", tool: "interview" });
  });
  return out;
}

const LESSON_MODULES = MODULES.map(function (m) { return { key: m.key, label: m.label }; })
  .concat([{ key: "interview", label: "Interview prep" }]);

module.exports = { MODULES, INTERVIEW_PREP, DESIGN_SCENARIOS, REFERENCE, allPages, sidebarGroups, lessons, LESSON_MODULES, file };
