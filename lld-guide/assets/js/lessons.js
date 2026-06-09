/* ============================================================
   The Design Field Guide — canonical lesson registry
   The single source of truth for progress tracking. Lesson ids
   are STABLE keys (never derived from URLs/titles, which move).
   Each lesson page sets <body data-lesson="<id>">; progress.js
   maps sidebar links to lessons by resolving url against SITE_BASE.
   (The home page and the reference glossary are NOT lessons.)
   ============================================================ */
window.LESSONS = [
  { id: "oop-overview",        title: "OOP overview",          url: "oop/index.html",                 module: "oop",      tool: "oop" },
  { id: "oop-pillars",         title: "The four pillars",      url: "oop/pillars.html",               module: "oop",      tool: "oop" },
  { id: "oop-relationships",   title: "Relationships & UML",   url: "oop/relationships.html",         module: "oop",      tool: "oop" },
  { id: "oop-inheritance-composition", title: "Inheritance & composition", url: "oop/inheritance-composition.html", module: "oop", tool: "oop" },
  { id: "solid-intro",         title: "Why principles",        url: "solid/index.html",               module: "solid",    tool: "solid" },
  { id: "solid-principles",    title: "The SOLID five",        url: "solid/principles.html",          module: "solid",    tool: "solid" },
  { id: "patterns-overview",   title: "Patterns overview",     url: "patterns/index.html",            module: "patterns", tool: "patterns" },
  { id: "patterns-creational", title: "Creational patterns",   url: "patterns/creational.html",       module: "patterns", tool: "patterns" },
  { id: "patterns-structural", title: "Structural patterns",   url: "patterns/structural.html",       module: "patterns", tool: "patterns" },
  { id: "patterns-behavioral", title: "Behavioral patterns",   url: "patterns/behavioral.html",       module: "patterns", tool: "patterns" },
  { id: "lld-method",          title: "The LLD method",        url: "lld/index.html",                 module: "lld",      tool: "lld" },
  { id: "lld-parking-lot",     title: "Case: Parking lot",     url: "lld/parking-lot.html",           module: "lld",      tool: "lld" },
  { id: "lld-vending-machine", title: "Case: Vending machine", url: "lld/vending-machine.html",       module: "lld",      tool: "lld" },
  { id: "lld-notification",    title: "Case: Notifications",   url: "lld/notification-service.html",  module: "lld",      tool: "lld" },
  { id: "adv-overview",            title: "Advanced: overview",       url: "advanced/index.html",                 module: "adv", tool: "adv" },
  { id: "adv-lru-cache",           title: "Case: LRU / LFU cache",    url: "advanced/lru-cache.html",             module: "adv", tool: "adv" },
  { id: "adv-logging-framework",   title: "Case: Logging framework",  url: "advanced/logging-framework.html",     module: "adv", tool: "adv" },
  { id: "adv-file-system",         title: "Case: File system",        url: "advanced/file-system.html",           module: "adv", tool: "adv" },
  { id: "adv-elevator-system",     title: "Case: Elevator system",    url: "advanced/elevator-system.html",       module: "adv", tool: "adv" },
  { id: "adv-splitwise",           title: "Case: Splitwise",          url: "advanced/splitwise.html",             module: "adv", tool: "adv" },
  { id: "adv-rate-limiter",        title: "Case: Rate limiter",       url: "advanced/rate-limiter.html",          module: "adv", tool: "adv" },
  { id: "adv-movie-booking",       title: "Case: Movie booking",      url: "advanced/movie-booking.html",         module: "adv", tool: "adv" },
  { id: "adv-pubsub-queue",        title: "Case: Pub/Sub queue",      url: "advanced/pubsub-queue.html",          module: "adv", tool: "adv" },
  { id: "adv-ride-hailing",        title: "Case: Ride-hailing",       url: "advanced/ride-hailing.html",          module: "adv", tool: "adv" }
];

/* Ordered module groups for the home dashboard. */
window.LESSON_MODULES = [
  { key: "oop",      label: "OOP" },
  { key: "solid",    label: "SOLID" },
  { key: "patterns", label: "Patterns" },
  { key: "lld",      label: "LLD cases" },
  { key: "adv",      label: "Advanced cases" }
];
