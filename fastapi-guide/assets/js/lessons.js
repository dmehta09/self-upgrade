/* ============================================================
   FastAPI Field Guide — canonical lesson registry
   The single source of truth for progress tracking. Lesson ids
   are STABLE keys (never derived from URLs/titles, which move).
   Each page sets <body data-lesson="<id>">; progress.js maps
   sidebar links to lessons by resolving url against SITE_BASE.
   ============================================================ */
window.LESSONS = [
  { id: "python-setup",        title: "Python setup",            url: "python/index.html",          module: "python",   tool: "python" },
  { id: "python-concepts",     title: "Python refresher",        url: "python/concepts.html",       module: "python",   tool: "python" },
  { id: "python-oop",          title: "Classes & OOP",           url: "python/oop.html",            module: "python",   tool: "python" },
  { id: "python-decorators",   title: "Decorators & closures",   url: "python/decorators.html",     module: "python",   tool: "python" },
  { id: "python-errors",       title: "Errors & exceptions",     url: "python/errors.html",         module: "python",   tool: "python" },
  { id: "python-generators",   title: "Generators & context",    url: "python/generators.html",     module: "python",   tool: "python" },
  { id: "python-typing",       title: "Typing in depth",         url: "python/typing.html",         module: "python",   tool: "python" },
  { id: "python-async",        title: "Async in depth",          url: "python/async.html",          module: "python",   tool: "python" },
  { id: "fastapi-intro",       title: "FastAPI overview",        url: "fastapi/index.html",         module: "fastapi",  tool: "fastapi" },
  { id: "fastapi-routing",     title: "Routing & parameters",    url: "fastapi/routing.html",       module: "fastapi",  tool: "fastapi" },
  { id: "fastapi-request-body",title: "Request body & models",   url: "fastapi/request-body.html",  module: "fastapi",  tool: "fastapi" },
  { id: "fastapi-validation",  title: "Validation & errors",     url: "fastapi/validation.html",    module: "fastapi",  tool: "fastapi" },
  { id: "fastapi-dependencies",title: "Dependency injection",    url: "fastapi/dependencies.html",  module: "fastapi",  tool: "fastapi" },
  { id: "fastapi-databases",   title: "Databases (SQLModel)",    url: "fastapi/databases.html",     module: "db",       tool: "db" },
  { id: "fastapi-async-db",    title: "Async DB & migrations",   url: "fastapi/async-db.html",      module: "db",       tool: "db" },
  { id: "fastapi-auth",        title: "Auth & security",         url: "fastapi/auth.html",          module: "auth",     tool: "auth" },
  { id: "fastapi-advanced",    title: "Async & structure",       url: "fastapi/advanced.html",      module: "advanced", tool: "advanced" },
  { id: "fastapi-streaming",   title: "WebSockets & streaming",  url: "fastapi/streaming.html",     module: "advanced", tool: "advanced" },
  { id: "fastapi-production",  title: "Production patterns",     url: "fastapi/production.html",    module: "advanced", tool: "advanced" },
  { id: "deploy",              title: "Testing & deployment",    url: "deploy/index.html",          module: "deploy",   tool: "deploy" }
];

/* Ordered module groups for the home dashboard. */
window.LESSON_MODULES = [
  { key: "python",   label: "Python" },
  { key: "fastapi",  label: "FastAPI core" },
  { key: "db",       label: "Databases" },
  { key: "auth",     label: "Auth" },
  { key: "advanced", label: "Advanced" },
  { key: "deploy",   label: "Ship it" }
];
