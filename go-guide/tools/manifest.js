/* ============================================================
   Go — a visual guide — site manifest (single source of truth)
   Drives: tools/gen.js (page assembly + sidebar + lessons.js),
   tools/build-search-index.js (FILES), and tools/verify.js.
   Editing the site map here keeps every page's sidebar, the lesson
   registry, and the search index in agreement.

   Each content MODULE: { key, label, pages:[ {slug,title,nav,id,widgets} ] }
   - key      = folder name AND <body data-tool> (per-module accent)
   - id       = STABLE lesson id (used by progress.js); omit = not a lesson
   - slug     = filename without ".html"
   - widgets  = extra per-page <script>s (besides the always-on set):
                "gopad.js" runnable-snippet player · "slicelab.js" slice-internals
                stepper · "deferstack.js" defer/panic stack · "goroutinelab.js"
                scheduler · "chanlab.js" channels · "concurrency.js" race scrubber
                · "flashcards.js" deck · "quizdrill.js" timed trainer.

   PHASED BUILD. All 9 content modules are declared up-front so the sidebar,
   home map and progress scope reflect the whole guide; lessons without a
   content fragment in tools/content/ render as "coming soon" stubs and gain
   their fragment (and engine widgets) in a later phase.
     Phase 1 (live): foundations · language · types  + reference/flashcards
     Phase 2:        generics · concurrency  + drills/gotchas/what-prints
     Phase 3:        stdlib · webservices · testing · runtime + interview/reference
   Code examples are Go (data-lang="go"); every idea is given twice
   (plain-English analogy + the precise technical version). Currency: Go 1.26 era.
   ============================================================ */

const MODULES = [
  { key: "foundations", label: "Getting started", pages: [
    { slug: "why-go",        title: "Why Go exists (and where it wins)", nav: "Why Go",            id: "fo-why-go" },
    { slug: "toolchain",     title: "The toolchain & modules",           nav: "Toolchain & modules", id: "fo-toolchain" },
    { slug: "hello-program", title: "Anatomy of a Go program",           nav: "Anatomy of a program", id: "fo-hello",   widgets: ["gopad.js"] },
    { slug: "vars-and-types",title: "Variables, constants & zero values",nav: "Vars, constants & zero values", id: "fo-vars", widgets: ["gopad.js"] },
    { slug: "control-flow",  title: "Control flow & functions",          nav: "Control flow & functions", id: "fo-control", widgets: ["gopad.js"] },
  ]},
  { key: "language", label: "The language core", pages: [
    { slug: "arrays-slices",          title: "Arrays vs slices: the len/cap model", nav: "Arrays & slices",        id: "lang-slices",   widgets: ["slicelab.js", "gopad.js"] },
    { slug: "maps",                   title: "Maps",                                nav: "Maps",                   id: "lang-maps",     widgets: ["gopad.js"] },
    { slug: "strings-runes-bytes",    title: "Strings, runes & bytes",              nav: "Strings, runes & bytes", id: "lang-strings",  widgets: ["gopad.js"] },
    { slug: "structs",                title: "Structs, embedding & tags",           nav: "Structs & embedding",    id: "lang-structs",  widgets: ["gopad.js"] },
    { slug: "pointers",               title: "Pointers & memory semantics",         nav: "Pointers",               id: "lang-pointers", widgets: ["gopad.js"] },
    { slug: "errors-and-defer",       title: "Errors, defer, panic & recover",      nav: "Errors, defer & panic",  id: "lang-defer",    widgets: ["deferstack.js", "gopad.js"] },
    { slug: "error-handling-patterns",title: "Error handling, the senior way",      nav: "Error handling patterns",id: "lang-errors",   widgets: ["gopad.js"] },
  ]},
  { key: "types", label: "Types & interfaces", pages: [
    { slug: "methods",               title: "Methods & receivers",                          nav: "Methods & receivers",   id: "ty-methods",     widgets: ["gopad.js"] },
    { slug: "interfaces",            title: "Interfaces: implicit & structural",            nav: "Interfaces",            id: "ty-interfaces",  widgets: ["gopad.js"] },
    { slug: "nil-interfaces",        title: "The nil interface trap",                       nav: "The nil interface trap",id: "ty-nil-iface",   widgets: ["gopad.js"] },
    { slug: "type-assertions-switch",title: "Type assertions & type switches",              nav: "Assertions & switches", id: "ty-assertions",  widgets: ["gopad.js"] },
    { slug: "error-interface-design",title: "Interfaces in practice: errors, Stringer, sort",nav: "Interfaces in practice",id: "ty-iface-design",widgets: ["gopad.js"] },
    { slug: "reflection",            title: "Reflection & struct tags (use sparingly)",     nav: "Reflection & tags",     id: "ty-reflection",  widgets: ["gopad.js"] },
  ]},
  { key: "generics", label: "Generics & modern Go", pages: [
    { slug: "type-parameters", title: "Type parameters & constraints",       nav: "Type parameters",        id: "gen-type-params", widgets: ["gopad.js"] },
    { slug: "generic-stdlib",  title: "slices, maps, cmp & the builtins",    nav: "Generic stdlib",         id: "gen-stdlib",      widgets: ["gopad.js"] },
    { slug: "iterators",       title: "Range-over-func iterators (1.23)",     nav: "Iterators (range-func)", id: "gen-iterators",   widgets: ["gopad.js"] },
    { slug: "generics-pitfalls",title: "Generics: when NOT to, and the gotchas",nav: "Generics pitfalls",    id: "gen-pitfalls",    widgets: ["gopad.js"] },
  ]},
  { key: "concurrency", label: "Concurrency", pages: [
    { slug: "index",                title: "Concurrency, the big picture",                    nav: "The big picture",        id: "co-index",      widgets: ["gopad.js"] },
    { slug: "goroutines",           title: "Goroutines",                                      nav: "Goroutines",             id: "co-goroutines", widgets: ["goroutinelab.js", "gopad.js"] },
    { slug: "scheduler",            title: "The G-M-P scheduler",                             nav: "The G-M-P scheduler",    id: "co-scheduler",  widgets: ["goroutinelab.js"] },
    { slug: "channels",             title: "Channels",                                        nav: "Channels",               id: "co-channels",   widgets: ["chanlab.js", "gopad.js"] },
    { slug: "select",               title: "select & multiplexing",                           nav: "select & multiplexing",  id: "co-select",     widgets: ["chanlab.js", "gopad.js"] },
    { slug: "sync-primitives",      title: "sync: Mutex, RWMutex, WaitGroup, Once, Cond",     nav: "sync primitives",        id: "co-sync",       widgets: ["conviz.js", "gopad.js"] },
    { slug: "atomics-memory-model", title: "Atomics & the Go memory model",                   nav: "Atomics & memory model", id: "co-memory",     widgets: ["conviz.js", "gopad.js"] },
    { slug: "context",              title: "context: cancellation, deadlines & values",       nav: "context",                id: "co-context",    widgets: ["gopad.js"] },
    { slug: "patterns",             title: "Patterns: pool, fan-in/out, pipeline, semaphore", nav: "Concurrency patterns",   id: "co-patterns",   widgets: ["chanlab.js", "gopad.js"] },
    { slug: "errgroup",             title: "Structured concurrency with errgroup",            nav: "errgroup",               id: "co-errgroup",   widgets: ["gopad.js"] },
    { slug: "leaks-deadlocks-races",title: "Goroutine leaks, deadlocks & the race detector",  nav: "Leaks, deadlocks & races",id: "co-leaks",     widgets: ["conviz.js", "gopad.js"] },
  ]},
  { key: "stdlib", label: "Standard library", pages: [
    { slug: "encoding-json", title: "encoding/json & serialization",             nav: "encoding/json", id: "std-json",  widgets: ["gopad.js"] },
    { slug: "time",          title: "time: durations, timers & the monotonic clock",nav: "time",         id: "std-time", widgets: ["gopad.js"] },
    { slug: "io-bufio",      title: "io, bufio & readers/writers",                nav: "io & bufio",    id: "std-io",    widgets: ["gopad.js"] },
    { slug: "files-os",      title: "Files, os & io/fs",                          nav: "Files & os",    id: "std-files", widgets: ["gopad.js"] },
    { slug: "slog",          title: "Structured logging with log/slog",           nav: "log/slog",      id: "std-slog",  widgets: ["gopad.js"] },
    { slug: "stdlib-tour",   title: "A tour of the rest (net, regexp, crypto)",   nav: "Stdlib tour",   id: "std-tour",  widgets: ["gopad.js"] },
  ]},
  { key: "webservices", label: "HTTP services", pages: [
    { slug: "net-http",            title: "net/http: servers, handlers & the 1.22 router", nav: "net/http",            id: "web-http",       widgets: ["gopad.js"] },
    { slug: "middleware-routing",  title: "Middleware, context & routing patterns",         nav: "Middleware & routing", id: "web-middleware", widgets: ["gopad.js"] },
    { slug: "http-clients",        title: "HTTP clients, timeouts & resilience",            nav: "HTTP clients",         id: "web-clients",    widgets: ["gopad.js"] },
    { slug: "json-apis",           title: "Building JSON APIs & validation",                nav: "JSON APIs",            id: "web-json-apis",  widgets: ["gopad.js"] },
    { slug: "production-services",  title: "Production services: graceful shutdown & deploy",nav: "Production services",  id: "web-production", widgets: ["gopad.js"] },
  ]},
  { key: "testing", label: "Testing & tooling", pages: [
    { slug: "testing-basics",    title: "testing: tests, table tests & subtests",  nav: "Tests & table tests",  id: "test-basics",      widgets: ["gopad.js"] },
    { slug: "mocking-interfaces",title: "Test doubles, interfaces & dependency seams",nav: "Mocking & seams",    id: "test-mocking",     widgets: ["gopad.js"] },
    { slug: "benchmarks",        title: "Benchmarks & profiling",                  nav: "Benchmarks",           id: "test-benchmarks",  widgets: ["gopad.js"] },
    { slug: "fuzzing-coverage",  title: "Fuzzing, coverage & race testing",        nav: "Fuzzing & coverage",   id: "test-fuzzing",     widgets: ["gopad.js"] },
    { slug: "tooling",           title: "The tooling belt: vet, staticcheck, modules",nav: "The tooling belt",  id: "test-tooling",     widgets: ["gopad.js"] },
  ]},
  { key: "runtime", label: "Runtime & performance", pages: [
    { slug: "memory-model-stack-heap",title: "Stack, heap & escape analysis", nav: "Stack, heap & escape",  id: "rt-memory", widgets: ["escapeview.js", "gopad.js"] },
    { slug: "garbage-collector",      title: "The garbage collector",         nav: "The garbage collector", id: "rt-gc",     widgets: ["gclab.js", "gopad.js"] },
    { slug: "pprof-profiling",        title: "Profiling & diagnosing with pprof",nav: "pprof profiling",     id: "rt-pprof",  widgets: ["gopad.js"] },
    { slug: "performance-patterns",   title: "Performance patterns & allocation control",nav: "Performance patterns",id: "rt-perf", widgets: ["gopad.js"] },
    { slug: "cgo-unsafe-build",       title: "cgo, unsafe & build internals", nav: "cgo, unsafe & builds",  id: "rt-cgo",    widgets: ["gopad.js"] },
  ]},
];

/* Interview prep — NOT lessons (no progress checkmark); their own sidebar group. */
const INTERVIEW = [
  { dir: "interview", slug: "question-bank",  title: "The Go question bank",       nav: "Question bank",   tool: "interview" },
  { dir: "interview", slug: "machine-coding", title: "Concurrency machine-coding", nav: "Machine-coding",  tool: "interview", widgets: ["gopad.js"] },
];

/* Reference surfaces — NOT lessons (no progress checkmark).
   Phase 1 ships flashcards; cheatsheet/drills/gotchas arrive with later phases. */
const REFERENCE = [
  { dir: "reference", slug: "cheatsheet", title: "The Go cheatsheet", nav: "Cheatsheet", tool: "reference" },
  { dir: "reference", slug: "flashcards", title: "Flashcards", nav: "Flashcards", tool: "reference", widgets: ["flashcards.js"] },
  { dir: "reference", slug: "drills", title: "Timed drills", nav: "Timed drills", tool: "reference", widgets: ["quizdrill.js"] },
  { dir: "reference", slug: "gotchas", title: "The Go gotchas index", nav: "Gotchas index", tool: "reference", widgets: ["quizdrill.js"] },
];

/* ---- helpers (generic — do not edit when changing the site map) ---- */
function file(dir, slug) { return (dir ? dir + "/" : "") + slug + ".html"; }

function allPages() {
  const out = [];
  out.push({ file: "index.html", dir: "", slug: "index", title: "Go — a visual guide", tool: "", lesson: null, module: null, widgets: [] });
  MODULES.forEach(function (m) {
    m.pages.forEach(function (p) {
      out.push({ file: file(m.key, p.slug), dir: m.key, slug: p.slug, title: p.title,
        tool: m.key, lesson: p.id || null, module: p.id ? m.key : null, widgets: p.widgets || [] });
    });
  });
  REFERENCE.concat(INTERVIEW).forEach(function (p) {
    out.push({ file: file(p.dir, p.slug), dir: p.dir, slug: p.slug, title: p.title,
      tool: p.tool || "", lesson: null, module: null, widgets: p.widgets || [] });
  });
  return out;
}

/* ---- sidebar groups (ordered) ---- */
function sidebarGroups() {
  const groups = [];
  groups.push({ label: "Start here", cls: "", links: [{ file: "index.html", label: "Home · the map" }] });
  MODULES.forEach(function (m) {
    groups.push({ label: m.label, cls: "is-" + m.key,
      links: m.pages.map(function (p) { return { file: file(m.key, p.slug), label: p.nav }; }) });
  });
  groups.push({ label: "Interview prep", cls: "is-interview",
    links: INTERVIEW.map(function (p) { return { file: file(p.dir, p.slug), label: p.nav }; }) });
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

module.exports = { MODULES, REFERENCE, INTERVIEW, allPages, sidebarGroups, lessons, LESSON_MODULES, file };
