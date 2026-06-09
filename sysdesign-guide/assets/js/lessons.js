/* ============================================================
   System Design Field Guide — canonical lesson registry
   The single source of truth for progress tracking. Lesson ids
   are STABLE keys (never derived from URLs/titles, which move).
   Each lesson page sets <body data-lesson="<id>">; progress.js
   maps sidebar links to lessons by resolving url against SITE_BASE.
   (The home page and the reference pages are NOT lessons.)
   ============================================================ */
window.LESSONS = [
  /* ---- Foundations · Fundamentals ---- */
  { id: "fund-framework",      title: "Reading a design question", url: "fundamentals/index.html",            module: "fundamentals", tool: "fundamentals" },
  { id: "fund-estimation",     title: "Back-of-envelope math",     url: "fundamentals/estimation.html",       module: "fundamentals", tool: "fundamentals" },
  { id: "fund-numbers",        title: "Numbers you must know",     url: "fundamentals/numbers.html",          module: "fundamentals", tool: "fundamentals" },
  { id: "fund-availability",   title: "Availability & SLAs",       url: "fundamentals/availability.html",     module: "fundamentals", tool: "fundamentals" },
  { id: "fund-consistency",    title: "Consistency, CAP & PACELC", url: "fundamentals/consistency.html",      module: "fundamentals", tool: "fundamentals" },

  /* ---- Foundations · Building blocks ---- */
  { id: "blocks-overview",     title: "The building blocks",       url: "blocks/index.html",                  module: "blocks", tool: "blocks" },
  { id: "blocks-lb",           title: "Load balancing",            url: "blocks/load-balancing.html",         module: "blocks", tool: "blocks" },
  { id: "blocks-gateway",      title: "API gateway & proxies",     url: "blocks/api-gateway.html",            module: "blocks", tool: "blocks" },
  { id: "blocks-cdn",          title: "CDN & the edge",            url: "blocks/cdn.html",                    module: "blocks", tool: "blocks" },
  { id: "blocks-caching",      title: "Caching",                   url: "blocks/caching.html",                module: "blocks", tool: "blocks" },
  { id: "blocks-messaging",    title: "Queues, pub/sub & streams", url: "blocks/messaging.html",              module: "blocks", tool: "blocks" },

  /* ---- Foundations · Data at scale ---- */
  { id: "data-overview",       title: "SQL vs NoSQL",              url: "data/index.html",                    module: "data", tool: "data" },
  { id: "data-indexing",       title: "Indexing",                  url: "data/indexing.html",                 module: "data", tool: "data" },
  { id: "data-sharding",       title: "Sharding & partitioning",   url: "data/sharding.html",                 module: "data", tool: "data" },
  { id: "data-replication",    title: "Replication & quorums",     url: "data/replication.html",              module: "data", tool: "data" },
  { id: "data-consensus",      title: "Consensus & leader election", url: "data/consensus.html",              module: "data", tool: "data" },
  { id: "data-hashing",        title: "Consistent hashing",        url: "data/consistent-hashing.html",       module: "data", tool: "data" },

  /* ---- Case studies · Warm-up ---- */
  { id: "warmup-playbook",     title: "The design playbook",       url: "warmup/index.html",                  module: "warmup", tool: "warmup" },
  { id: "warmup-url",          title: "URL shortener",             url: "warmup/url-shortener.html",          module: "warmup", tool: "warmup" },
  { id: "warmup-rate-limiter", title: "Rate limiter",              url: "warmup/rate-limiter.html",           module: "warmup", tool: "warmup" },
  { id: "warmup-unique-id",    title: "Unique ID generator",       url: "warmup/unique-id.html",              module: "warmup", tool: "warmup" },

  /* ---- Case studies · Core ---- */
  { id: "core-cache",          title: "Distributed cache",         url: "core/distributed-cache.html",        module: "core", tool: "core" },
  { id: "core-crawler",        title: "Web crawler",               url: "core/web-crawler.html",              module: "core", tool: "core" },
  { id: "core-notification",   title: "Notification system",       url: "core/notification-system.html",      module: "core", tool: "core" },
  { id: "core-news-feed",      title: "News feed (Twitter)",       url: "core/news-feed.html",                module: "core", tool: "core" },
  { id: "core-file-sync",      title: "Dropbox / file sync",       url: "core/file-sync.html",                module: "core", tool: "core" },
  { id: "core-chat",           title: "Chat (WhatsApp)",           url: "core/chat.html",                     module: "core", tool: "core" },

  /* ---- Case studies · Advanced ---- */
  { id: "adv-uber",            title: "Uber / ride-hailing",       url: "advanced/uber.html",                 module: "advanced", tool: "advanced" },
  { id: "adv-youtube",         title: "YouTube / streaming",       url: "advanced/youtube.html",              module: "advanced", tool: "advanced" },
  { id: "adv-payments",        title: "Payment system",            url: "advanced/payments.html",             module: "advanced", tool: "advanced" },
  { id: "adv-llm",             title: "LLM serving",               url: "advanced/llm-serving.html",          module: "advanced", tool: "advanced" },
  { id: "adv-vector",          title: "Vector search & recsys",    url: "advanced/vector-recommender.html",   module: "advanced", tool: "advanced" },

  /* ---- Case studies · Expert ---- */
  { id: "expert-multi-tenancy",  title: "Multi-tenant SaaS",       url: "expert/multi-tenancy.html",          module: "expert", tool: "expert" },
  { id: "expert-user-management",title: "User management",         url: "expert/user-management.html",        module: "expert", tool: "expert" },
  { id: "expert-org-management", title: "Organizations & teams",   url: "expert/org-management.html",          module: "expert", tool: "expert" },
  { id: "expert-authentication", title: "Authentication",          url: "expert/authentication.html",         module: "expert", tool: "expert" },
  { id: "expert-authorization",  title: "Authorization",           url: "expert/authorization.html",          module: "expert", tool: "expert" },
  { id: "expert-ecommerce-catalog",  title: "E-commerce: catalog & cart", url: "expert/ecommerce-catalog.html",  module: "expert", tool: "expert" },
  { id: "expert-ecommerce-checkout", title: "E-commerce: checkout",       url: "expert/ecommerce-checkout.html", module: "expert", tool: "expert" },
  { id: "expert-billing",        title: "Billing & subscriptions", url: "expert/billing.html",                module: "expert", tool: "expert" },
  { id: "expert-audit-log",      title: "Audit log",               url: "expert/audit-log.html",              module: "expert", tool: "expert" }
];

/* Ordered module groups for the home dashboard + sidebar. */
window.LESSON_MODULES = [
  { key: "fundamentals", label: "Fundamentals" },
  { key: "blocks",       label: "Building blocks" },
  { key: "data",         label: "Data at scale" },
  { key: "warmup",       label: "Warm-up designs" },
  { key: "core",         label: "Core designs" },
  { key: "advanced",     label: "Advanced designs" },
  { key: "expert",       label: "Expert designs" }
];
