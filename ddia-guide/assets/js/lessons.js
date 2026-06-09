/* ============================================================
   Designing Data-Intensive Applications — canonical lesson registry
   The single source of truth for progress tracking. Lesson ids are
   STABLE keys (never derived from URLs/titles, which move). Each
   lesson page sets <body data-lesson="<id>">; progress.js maps sidebar
   links to lessons by resolving url against SITE_BASE.
   (The home page and the reference pages are NOT lessons.)

   This guide ships in PHASES — append a lesson here when its fragment
   lands. The home dashboard skips any module with zero lessons, so the
   Part II / Part III groups below stay invisible until they're built.
   ============================================================ */
window.LESSONS = [
  /* ---- Part I · Foundations (ch 1–4) ---- */
  { id: "found-rsm",         title: "Reliable, scalable & maintainable", url: "foundations/reliable-scalable-maintainable.html", module: "foundations", tool: "foundations" },
  { id: "found-data-models", title: "Data models & query languages",     url: "foundations/data-models.html",                    module: "foundations", tool: "foundations" },
  { id: "found-storage",     title: "Storage & retrieval",               url: "foundations/storage-engines.html",                module: "foundations", tool: "foundations" },
  { id: "found-encoding",    title: "Encoding & evolution",              url: "foundations/encoding-evolution.html",             module: "foundations", tool: "foundations" }
  /* Part I complete. Part II (replication, partitioning, …) — Phase 3 */
];

/* Ordered module groups for the home dashboard + sidebar.
   Modules with no lessons yet are simply skipped by the dashboard. */
window.LESSON_MODULES = [
  { key: "foundations", label: "Part I · Foundations" },
  { key: "distributed", label: "Part II · Distributed Data" },
  { key: "derived",     label: "Part III · Derived Data" }
];
