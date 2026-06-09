/* ============================================================
   DSA Field Guide — canonical lesson registry
   The single source of truth for progress tracking. Lesson ids
   are STABLE keys (never derived from URLs/titles, which move).
   Each page sets <body data-lesson="<id>">; progress.js maps
   sidebar links to lessons by resolving url against SITE_BASE.
   ============================================================ */
window.LESSONS = [
  /* ---- FOUNDATIONS ---- */
  { id: "found-overview",      title: "How to use this guide",         url: "foundations/index.html",            module: "foundations", tool: "foundations" },
  { id: "found-big-o",         title: "Big-O & complexity",            url: "foundations/big-o.html",            module: "foundations", tool: "foundations" },
  { id: "found-arrays",        title: "Arrays, strings & hashing",     url: "foundations/arrays-strings.html",   module: "foundations", tool: "foundations" },
  { id: "found-linked-lists",  title: "Linked lists, stacks & queues", url: "foundations/linked-lists.html",     module: "foundations", tool: "foundations" },
  { id: "found-trees-graphs",  title: "Trees, heaps & graphs",         url: "foundations/trees-graphs.html",     module: "foundations", tool: "foundations" },

  /* ---- PATTERNS ---- */
  { id: "pat-overview",        title: "The pattern map",               url: "patterns/index.html",               module: "patterns",    tool: "patterns" },
  { id: "pat-arrays-hashing",  title: "Arrays & Hashing",              url: "patterns/arrays-hashing.html",      module: "patterns",    tool: "patterns" },
  { id: "pat-two-pointers",    title: "Two Pointers",                  url: "patterns/two-pointers.html",        module: "patterns",    tool: "patterns" },
  { id: "pat-sliding-window",  title: "Sliding Window",                url: "patterns/sliding-window.html",      module: "patterns",    tool: "patterns" },
  { id: "pat-stack",           title: "Stack",                         url: "patterns/stack.html",               module: "patterns",    tool: "patterns" },
  { id: "pat-binary-search",   title: "Binary Search",                 url: "patterns/binary-search.html",       module: "patterns",    tool: "patterns" },
  { id: "pat-linked-list",     title: "Linked List",                   url: "patterns/linked-list.html",         module: "patterns",    tool: "patterns" },
  { id: "pat-trees",           title: "Trees · BFS & DFS",             url: "patterns/trees-traversal.html",     module: "patterns",    tool: "patterns" },
  { id: "pat-heap",            title: "Heap / Top-K",                  url: "patterns/heap-topk.html",           module: "patterns",    tool: "patterns" },
  { id: "pat-backtracking",    title: "Backtracking",                  url: "patterns/backtracking.html",        module: "patterns",    tool: "patterns" },
  { id: "pat-graphs",          title: "Graphs",                        url: "patterns/graphs.html",              module: "patterns",    tool: "patterns" },
  { id: "pat-dp",              title: "Dynamic Programming",           url: "patterns/dynamic-programming.html", module: "patterns",    tool: "patterns" },
  { id: "pat-intervals",       title: "Intervals",                     url: "patterns/intervals.html",           module: "patterns",    tool: "patterns" }
];

/* Ordered module groups for the home dashboard. */
window.LESSON_MODULES = [
  { key: "foundations", label: "Foundations" },
  { key: "patterns",    label: "Patterns" }
];
