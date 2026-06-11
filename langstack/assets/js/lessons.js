/* ============================================================
   THE LANG STACK — canonical lesson registry
   The single source of truth for progress tracking. Lesson ids
   are STABLE keys (never derived from URLs/titles, which move).
   Each page sets <body data-lesson="<id>">; progress.js maps
   sidebar links to lessons by resolving url against SITE_BASE.
   ============================================================ */
window.LESSONS = [
  /* ---- START HERE ---- */
  { id: "eco-big-picture", title: "The big picture",            url: "ecosystem/index.html",    module: "ecosystem", tool: "ecosystem" },

  /* ---- LANGCHAIN ---- */
  { id: "lc-overview",     title: "LangChain — Overview",       url: "langchain/index.html",    module: "langchain", tool: "langchain" },
  { id: "lc-concepts",     title: "LangChain — Core concepts",  url: "langchain/concepts.html", module: "langchain", tool: "langchain" },

  /* ---- LANGGRAPH ---- */
  { id: "lg-overview",     title: "LangGraph — Overview",       url: "langgraph/index.html",    module: "langgraph", tool: "langgraph" },
  { id: "lg-concepts",     title: "LangGraph — Core concepts",  url: "langgraph/concepts.html", module: "langgraph", tool: "langgraph" },

  /* ---- LANGSMITH ---- */
  { id: "ls-overview",     title: "LangSmith — Overview",       url: "langsmith/index.html",    module: "langsmith", tool: "langsmith" },
  { id: "ls-concepts",     title: "LangSmith — Core concepts",  url: "langsmith/concepts.html", module: "langsmith", tool: "langsmith" }
];

/* Ordered module groups for the home dashboard. */
window.LESSON_MODULES = [
  { key: "ecosystem", label: "The big picture" },
  { key: "langchain", label: "LangChain" },
  { key: "langgraph", label: "LangGraph" },
  { key: "langsmith", label: "LangSmith" }
];
