/* ============================================================
   System Design Field Guide — mock-interview drill bank
   Data only (no behavior — drill.js renders it). Each drill is a
   full 35-minute interview question: the prompt the interviewer
   reads out, per-phase nudges and hints, a self-grading rubric
   keyed to the phases, and a model-answer outline that links back
   to the lesson that teaches it (lesson = id in lessons.js).
   levels: warm | core | advanced | expert
   ============================================================ */

/* The fixed 35-minute loop every drill runs on. */
window.SD_DRILL_PHASES = [
  { key: "requirements", label: "Requirements",      min: 5,  doing: "Ask clarifying questions. Lock functional + non-functional requirements and what is OUT of scope." },
  { key: "estimation",   label: "Estimation",        min: 5,  doing: "Back-of-the-envelope: DAU → QPS, storage, bandwidth. Round hard, state assumptions out loud." },
  { key: "highlevel",    label: "High-level design", min: 10, doing: "Draw the boxes: clients, edge, services, data stores, queues. Walk one read and one write through the diagram." },
  { key: "deepdive",     label: "Deep dive",         min: 10, doing: "Pick the 1–2 hardest components and go deep: data model, algorithm, scaling strategy, the key trade-off." },
  { key: "wrap",         label: "Wrap-up",           min: 5,  doing: "Failure modes, bottlenecks, monitoring, and what you'd build first. Invite follow-up questions." }
];

window.SD_DRILLS = [
  {
    id: "drill-rate-limiter",
    title: "Design a rate limiter",
    level: "warm",
    lesson: "warmup-rate-limiter",
    prompt: "Design a rate limiter for our public API. We have roughly 10 million developers calling it, and we want per-API-key limits like “100 requests per minute”. It must work across our fleet of API servers.",
    phaseNotes: {
      requirements: {
        prompts: ["Hard limit (reject) or soft limit (throttle/queue)?", "Per key only, or also per IP / per endpoint?", "How accurate must the limit be — is a small burst overshoot acceptable?"],
        hints: ["Ask where it runs: client-side, gateway, or per-service middleware. The interviewer usually wants it at the gateway."]
      },
      estimation: {
        prompts: ["10M keys × a counter — does the whole state fit in one Redis?", "What QPS does the limiter itself have to absorb?"],
        hints: ["State is tiny: ~10M keys × tens of bytes ≈ a few GB. The challenge is latency + atomicity, not storage."]
      },
      highlevel: {
        prompts: ["Where does the check happen on the request path?", "What responds when the limit is exceeded (HTTP 429 + Retry-After)?"],
        hints: ["Gateway middleware → Redis (or local memory + sync) → allow/reject before the request touches application servers."]
      },
      deepdive: {
        prompts: ["Compare fixed window vs sliding window vs token bucket vs GCRA.", "How do you make check-and-decrement atomic across servers?"],
        hints: ["Token bucket handles bursts gracefully; a Lua script in Redis makes read-modify-write atomic; local caches trade accuracy for latency."]
      },
      wrap: {
        prompts: ["What happens when Redis is down — fail open or fail closed?", "How do you monitor false-positive throttling?"],
        hints: ["Most companies fail OPEN for availability (and alert), except on abuse/security endpoints."]
      }
    },
    rubric: [
      { phase: "requirements", text: "Clarified limit semantics (hard vs soft), scope (per key/IP/endpoint), and tolerance for burst overshoot" },
      { phase: "requirements", text: "Stated non-functional needs: sub-ms decision latency, high availability of the limiter itself" },
      { phase: "estimation",   text: "Estimated state size (~GBs for 10M keys) and the limiter's own QPS, concluding state fits in memory" },
      { phase: "highlevel",    text: "Placed the limiter at the gateway/middleware and showed the 429 + Retry-After reject path" },
      { phase: "highlevel",    text: "Used a shared store (Redis) so limits hold across the whole fleet, not per server" },
      { phase: "deepdive",     text: "Compared at least two algorithms (token bucket vs sliding window) and justified a choice" },
      { phase: "deepdive",     text: "Solved the race: atomic check-and-set (Redis Lua / GCRA timestamp math), not read-then-write" },
      { phase: "wrap",         text: "Took a position on fail-open vs fail-closed and named what to monitor (throttle rate, limiter latency)" }
    ],
    model: "<p><b>Shape of a strong answer:</b> hard per-key limits enforced at the API gateway; counters in Redis with a Lua script for atomic check-and-decrement; <b>token bucket</b> (burst-friendly, two numbers per key) or <b>GCRA</b> (one timestamp) as the algorithm; 429 + <code>Retry-After</code> on reject. Scale by sharding keys across a Redis cluster (key affinity makes this trivial). For ultra-low latency, a local in-memory bucket per gateway node synced async — accept small overshoot. Fail open when the store is down, alert loudly. Mention multi-region: per-region limits are the pragmatic default; a global limit costs a cross-region hop.</p>"
  },

  {
    id: "drill-news-feed",
    title: "Design a news feed",
    level: "core",
    lesson: "core-news-feed",
    prompt: "Design the home feed for a social network like X/Twitter: 250 million daily users, people follow each other, and the feed shows recent posts from accounts you follow. Posting and reading must both feel instant.",
    phaseNotes: {
      requirements: {
        prompts: ["Chronological or ranked feed?", "What's the read:write ratio — how many feed loads per post?", "Do celebrity accounts (50M followers) exist in scope?"],
        hints: ["The celebrity question decides your whole architecture. Ask it before the interviewer plants it as a trap."]
      },
      estimation: {
        prompts: ["Posts/day → write QPS; feed loads/day → read QPS.", "What's the fan-out write amplification if you precompute timelines?"],
        hints: ["250M DAU × ~2 feed loads ≈ 500M reads/day ≈ 6K read QPS avg (×3–5 peak). Fan-out: each post × avg followers = the real write load."]
      },
      highlevel: {
        prompts: ["Where do precomputed timelines live?", "Walk a post from publish → follower's feed, and a feed load → response."],
        hints: ["Post service → Kafka → fan-out workers → Redis timeline lists (push). Feed service reads your list, hydrates post bodies from cache/DB."]
      },
      deepdive: {
        prompts: ["Fan-out on write vs on read vs hybrid — argue with numbers.", "How exactly does the celebrity path work at read time?"],
        hints: ["Push for normal users (fast reads), pull for accounts above ~100K followers (avoid 50M-write storms), merge both at read time."]
      },
      wrap: {
        prompts: ["What breaks first at 10× scale?", "Where does ranking/ML fit without changing the architecture?"],
        hints: ["Timeline-cache RAM and fan-out compute are the cost drivers; ranking is a separate scoring stage between candidate fetch and response."]
      }
    },
    rubric: [
      { phase: "requirements", text: "Clarified ranked vs chronological, read:write ratio (~100:1), and surfaced the celebrity case unprompted" },
      { phase: "requirements", text: "Set non-functional targets: feed p99 < ~200 ms, eventual consistency acceptable (seconds of delay fine)" },
      { phase: "estimation",   text: "Derived read and write QPS from DAU, and computed fan-out write amplification (posts × avg followers)" },
      { phase: "estimation",   text: "Sized the timeline cache (users × ~800 post-ids × bytes) to justify Redis-scale memory" },
      { phase: "highlevel",    text: "Drew the async pipeline: post service → queue → fan-out workers → timeline cache, decoupling publish latency from fan-out" },
      { phase: "highlevel",    text: "Separated timeline (list of post ids) from post content (hydrated at read) — no full posts copied 50M times" },
      { phase: "deepdive",     text: "Argued push vs pull vs hybrid with numbers and picked hybrid with a follower-count threshold" },
      { phase: "deepdive",     text: "Walked the celebrity read path: merge precomputed timeline + pulled celebrity posts at read time" },
      { phase: "wrap",         text: "Named the cost drivers (timeline RAM, fan-out compute) and a monitoring story (fan-out lag, feed latency)" }
    ],
    model: "<p><b>Shape of a strong answer:</b> hybrid fan-out. Normal users: fan-out <b>on write</b> — a post lands in Kafka, workers push its id onto each follower's Redis timeline list (capped ~800 entries). Celebrities (>~100K followers): fan-out <b>on read</b> — followers pull their recent posts at feed-load time and merge. Feed read = fetch id list (1 Redis op) + hydrate posts from a post cache + merge celebrity pulls + (2026) a two-stage ranker. Write amplification, not storage, is the scaling constraint — say “a 100-follower average turns 6K posts/s into 600K timeline writes/s” and the interviewer knows you've done the math. Failure modes: fan-out lag (monitor queue depth), hot celebrity post (cache the post body aggressively), timeline cache loss (rebuild from the social graph + post store).</p>"
  },

  {
    id: "drill-multi-tenancy",
    title: "Design a multi-tenant SaaS platform",
    level: "expert",
    lesson: "expert-multi-tenancy",
    prompt: "We're building a B2B SaaS (think project-management tool). Design the multi-tenant architecture: 10,000 companies from 5-seat startups to 50,000-seat enterprises share the platform. Enterprises ask about data isolation in every security review.",
    phaseNotes: {
      requirements: {
        prompts: ["What isolation do enterprises actually require — separate DB? separate region? or contractual + technical row isolation?", "Per-tenant SLAs or one shared SLA?", "Data residency (EU tenant data stays in EU)?"],
        hints: ["Ask about the tenant size distribution. 9,900 small tenants and 100 huge ones want different answers — that's the tiering insight."]
      },
      estimation: {
        prompts: ["What does a dedicated DB per tenant cost × 10,000 tenants?", "What density can a shared Postgres safely hold?"],
        hints: ["Silo for everyone is ~100× the infra cost of pooling. The math forces the tiered answer."]
      },
      highlevel: {
        prompts: ["How does a request learn which tenant it belongs to?", "Where does the tenant→shard/tier/region mapping live?"],
        hints: ["Subdomain or JWT claim → tenant catalog (control plane) → route to the right cell/DB with tenant context attached."]
      },
      deepdive: {
        prompts: ["Enforce isolation in the data layer: tenant_id everywhere + Postgres RLS — and its footguns.", "Noisy neighbour: one tenant's batch job saturates the pool. Defenses?"],
        hints: ["RLS: FORCE row level security (owners bypass otherwise), SET LOCAL on pooled connections. Noisy neighbour: per-tenant connection/rate budgets, fair queuing, move offenders to silo."]
      },
      wrap: {
        prompts: ["Blast radius: a bad deploy takes the platform down for everyone. Mitigation?", "How does a tenant migrate pool → silo when they upgrade to enterprise?"],
        hints: ["Cells: partition tenants into independent stacks, deploy wave by wave. Migration: dual-write or logical replication + a catalog flip."]
      }
    },
    rubric: [
      { phase: "requirements", text: "Clarified what “isolation” means per customer tier and surfaced data-residency requirements" },
      { phase: "requirements", text: "Asked about tenant size distribution and concluded one isolation model won't fit all 10,000" },
      { phase: "estimation",   text: "Quantified silo vs pool cost (~100× per-tenant difference) to justify a tiered strategy" },
      { phase: "highlevel",    text: "Designed tenant context propagation: subdomain/JWT → tenant catalog → routed request carrying tenant_id" },
      { phase: "highlevel",    text: "Proposed tiered isolation: pooled (shared DB + RLS) for SMB, silo (dedicated) for enterprise" },
      { phase: "deepdive",     text: "Enforced isolation in the database: tenant_id leading every PK/index + Postgres RLS, naming the FORCE and SET LOCAL footguns" },
      { phase: "deepdive",     text: "Defended against noisy neighbours: per-tenant quotas, fair queuing, connection-pool budgets, eviction to silo" },
      { phase: "wrap",         text: "Bounded blast radius with cells and wave deploys; sketched a pool→silo migration path via the catalog" }
    ],
    model: "<p><b>Shape of a strong answer:</b> a <b>tiered</b> model — pool the long tail (shared schema, <code>tenant_id</code> on every row, Postgres RLS with <code>FORCE</code> and <code>SET LOCAL</code> per request), silo the enterprises that pay for it (dedicated DB, optionally dedicated cell/region for residency). A <b>tenant catalog</b> is the control plane: tenant → tier, shard, region, feature flags; every request resolves it once (subdomain or JWT claim) and carries tenant context end-to-end. Defend the pool from noisy neighbours with per-tenant rate/connection budgets and fair queuing; bound blast radius with <b>cells</b> (each cell a full stack serving a tenant subset, deploys roll cell by cell). The differentiating sentence: “isolation is a spectrum you price, not a boolean”.</p>"
  }
  ,

  {
    id: "drill-url-shortener",
    title: "Design a URL shortener",
    level: "warm",
    lesson: "warmup-url",
    prompt: "Design a URL shortener like bit.ly: shorten a long URL to a 7-character code, redirect on click. 100 million new URLs a month, reads dominate massively.",
    phaseNotes: {
      requirements: { prompts: ["Custom aliases? Expiry? Click analytics?", "Can two users shortening the same URL share a code?"], hints: ["Ask the read:write ratio — it's ~100:1+ and shapes everything."] },
      estimation: { prompts: ["100M/month → write QPS? Storage for 5 years at ~500 B/row?", "How many 7-char base62 codes exist?"], hints: ["62⁷ ≈ 3.5 trillion — the keyspace is never the problem; collisions and the read path are."] },
      deepdive: { prompts: ["Key generation: counter+base62 vs random+collision-check vs pre-generated key service?", "301 or 302 redirect — and what does the choice cost you?"], hints: ["301 is cached by browsers (fast, but kills analytics and edits); 302 keeps every click observable."] }
    },
    rubric: [
      { phase: "requirements", text: "Clarified custom aliases, expiry, analytics, and stated the system is extremely read-heavy" },
      { phase: "estimation",   text: "Derived ~40 writes/s and ~4K reads/s from 100M/month, and ~300 GB/5yr storage — concluding one DB fits, caching is the lever" },
      { phase: "highlevel",    text: "Drew the redirect path: cache (hot codes) in front of the store, app servers stateless behind an LB" },
      { phase: "highlevel",    text: "Separated the write path (create code) from the read path (redirect) and sized them differently" },
      { phase: "deepdive",     text: "Compared at least two key-generation schemes and handled collisions/uniqueness explicitly" },
      { phase: "deepdive",     text: "Took a position on 301 vs 302 and tied it to analytics requirements" },
      { phase: "wrap",         text: "Named hot-key skew (one viral link), cache stampede protection, and abuse (malware links) as operational concerns" }
    ],
    model: "<p><b>Shape of a strong answer:</b> a <b>key-generation service</b> hands out blocks of pre-generated base62 codes (no coordination on the write path, no collisions by construction). Store {code → long_url, owner, expiry} in a replicated KV/SQL store; redirect path = Redis cache (≥90% hit on the hot tail) → store → <b>302</b> (keep analytics; emit a click event to Kafka for the analytics pipeline). At 4K reads/s this is comfortably one cache + a few app servers — say that, then scale the story: shard by code when storage demands it, CDN-edge redirects if global latency matters.</p>"
  },

  {
    id: "drill-chat",
    title: "Design a chat system (WhatsApp)",
    level: "core",
    lesson: "core-chat",
    prompt: "Design 1:1 and group messaging for a WhatsApp-scale app: 500 million users, messages must arrive in real time when the recipient is online, and reliably later when they're not.",
    phaseNotes: {
      requirements: { prompts: ["Delivery guarantees — at-least-once? Ordering within a conversation?", "Read receipts/presence in scope? Group size cap?"], hints: ["Pin down 'real time': sub-second delivery when online is the SLO that forces persistent connections."] },
      estimation: { prompts: ["Concurrent connections at peak? Memory per connection?", "Messages/s and fan-out for groups?"], hints: ["~10% of 500M online → 50M persistent connections; epoll-style gateways hold ~1M each → ~50–100 boxes."] },
      deepdive: { prompts: ["Alice on gateway 3, Bob on gateway 7 — walk the message.", "Offline delivery and per-conversation ordering — how exactly?"], hints: ["Session registry (user → gateway) + pub/sub backplane; per-conversation sequence numbers, client acks, mailbox for offline."] }
    },
    rubric: [
      { phase: "requirements", text: "Locked delivery semantics (at-least-once + dedupe), per-conversation ordering, and online vs offline paths" },
      { phase: "estimation",   text: "Estimated concurrent connections (~50M) and gateway count from per-box connection limits — the connection-driven sizing" },
      { phase: "highlevel",    text: "Drew WebSocket gateways + session registry + message store, with push notifications for offline users" },
      { phase: "highlevel",    text: "Walked one message across gateways (registry lookup or backplane hop) end to end" },
      { phase: "deepdive",     text: "Solved cross-gateway routing (registry vs pub/sub backplane) and justified the choice at scale" },
      { phase: "deepdive",     text: "Handled offline delivery: durable mailbox, client ack to clear, per-conversation seq for ordering and gap detection" },
      { phase: "deepdive",     text: "Chose a write-optimized message store (Cassandra-style, partitioned by conversation) over a SQL primary" },
      { phase: "wrap",         text: "Named reconnect storms, multi-region (region-aware registry), and E2E encryption's effect on the server's role" }
    ],
    model: "<p><b>Shape of a strong answer:</b> persistent WebSockets into epoll/BEAM <b>gateway</b> boxes (~1M conns each); a <b>session registry</b> maps user → gateway; messages publish onto a backplane and the recipient's gateway delivers. Offline → durable <b>mailbox</b> + push notification; clients ack, server clears. Ordering = per-conversation sequence numbers (global order is a non-goal — say so). Messages land in Cassandra/Scylla partitioned by conversation_id. Groups: server-side fan-out to member sessions, capped group size. E2E (Signal protocol) means the server routes ciphertext and loses content features — name the trade.</p>"
  },

  {
    id: "drill-file-sync",
    title: "Design Dropbox / file sync",
    level: "core",
    lesson: "core-file-sync",
    prompt: "Design a file-sync service: a desktop client watches a folder, syncs changes to the cloud and to the user's other devices. Files up to gigabytes; most edits touch a small part of a big file.",
    phaseNotes: {
      requirements: { prompts: ["Sync latency target? Concurrent edit conflicts — last-write-wins or both copies?", "Bandwidth efficiency: is re-uploading a 2 GB file on every save acceptable?"], hints: ["The hidden requirement is delta sync — interviewers plant the 'small edit, huge file' detail deliberately."] },
      deepdive: { prompts: ["Chunking: fixed-size vs content-defined — what happens on insert-at-front?", "Walk the metadata vs block storage split, and dedup."], hints: ["Content-defined chunking (rolling hash) keeps chunk boundaries stable under insertion; hash chunks → dedupe global storage."] }
    },
    rubric: [
      { phase: "requirements", text: "Surfaced delta sync and conflict handling as requirements; set a seconds-level sync SLO" },
      { phase: "estimation",   text: "Estimated storage with dedup factor and upload bandwidth, noting most 'changes' move only a few chunks" },
      { phase: "highlevel",    text: "Split metadata service (namespace, versions, chunk lists) from block store (S3-style content-addressed chunks)" },
      { phase: "highlevel",    text: "Used notifications (long-poll/WebSocket) to push 'something changed' to other devices rather than polling" },
      { phase: "deepdive",     text: "Explained content-defined chunking with a rolling hash and why fixed-size chunking breaks on inserts" },
      { phase: "deepdive",     text: "Made chunks content-addressed (hash = id) giving dedup and integrity for free" },
      { phase: "deepdive",     text: "Resolved concurrent edits without data loss: version vectors / rename one copy as a conflict file" },
      { phase: "wrap",         text: "Covered resumable uploads, client throttling, and cold storage tiering for old versions" }
    ],
    model: "<p><b>Shape of a strong answer:</b> client computes <b>content-defined chunks</b> (rolling hash, ~4 MB avg), uploads only chunks whose hash the server doesn't have (dedup), then commits a new file version = ordered chunk list to the <b>metadata service</b> (SQL, the consistency anchor). Blocks live in object storage keyed by content hash. Other devices learn via a notification channel and pull just the missing chunks. Conflicts: never merge silently — keep both, rename one ('conflicted copy'), let the human decide. The two-service split (consistent small metadata vs dumb huge blocks) is the architecture in one sentence.</p>"
  },

  {
    id: "drill-notifications",
    title: "Design a notification system",
    level: "core",
    lesson: "core-notification",
    prompt: "Design the notification platform for a large app: push (APNs/FCM), SMS, and email, triggered by product events — order shipped, friend request, marketing campaigns. Tens of millions a day, with campaigns spiking to millions in minutes.",
    phaseNotes: {
      requirements: { prompts: ["Delivery guarantee per channel — is a dropped marketing push acceptable? A dropped OTP SMS?", "User preferences/quiet hours? Rate caps per user?"], hints: ["Differentiate criticality classes early: transactional ≫ marketing. One pipeline, different lanes."] },
      deepdive: { prompts: ["A campaign drops 5M sends at once — how do transactional OTPs not queue behind it?", "Provider (APNs/Twilio) is rate-limited and flaky — retries without duplicates?"], hints: ["Priority queues/lanes, per-provider rate limiting, idempotency key per (user, event), DLQ for poison messages."] }
    },
    rubric: [
      { phase: "requirements", text: "Separated transactional vs marketing criticality and captured user preferences/quiet hours as a first-class feature" },
      { phase: "estimation",   text: "Sized steady QPS vs campaign burst (millions in minutes) and concluded the design is queue-shaped" },
      { phase: "highlevel",    text: "Drew event → notification service → per-channel queues → channel workers → providers (APNs/FCM/SES/Twilio)" },
      { phase: "highlevel",    text: "Put preference/eligibility checking (opt-outs, quiet hours, caps) before enqueue, not in the worker hot path" },
      { phase: "deepdive",     text: "Isolated lanes so campaigns can't starve OTPs: priority queues or separate queues + worker pools" },
      { phase: "deepdive",     text: "Made sends idempotent (dedupe key per user+event) so provider retries never double-notify" },
      { phase: "deepdive",     text: "Handled provider failure: retries with backoff, circuit breaker, fallback channel for critical sends, DLQ" },
      { phase: "wrap",         text: "Named delivery-rate observability per channel/provider and token hygiene (expired device tokens pruned via provider feedback)" }
    ],
    model: "<p><b>Shape of a strong answer:</b> an ingest API validates the event, resolves the user's preferences and channels, applies caps/quiet hours, then enqueues per-channel messages with an <b>idempotency key</b>. Separate <b>priority lanes</b> (transactional vs bulk) with independent worker pools; workers rate-limit per provider, retry with backoff, trip circuit breakers, and dead-letter poison sends. Device-token registry cleaned from APNs/FCM feedback. The sentences that score: 'marketing must never delay an OTP' and 'at-least-once + idempotent send = effectively exactly-once to the user'.</p>"
  },

  {
    id: "drill-uber",
    title: "Design Uber / ride-hailing",
    level: "advanced",
    lesson: "adv-uber",
    prompt: "Design the core of a ride-hailing app: riders request a trip, nearby drivers are matched in seconds, both sides see live location. One million concurrent drivers in big cities.",
    phaseNotes: {
      requirements: { prompts: ["Matching latency target? Does the rider pick a driver or does the system dispatch?", "Location update frequency and accuracy?"], hints: ["The hard sub-problems: geo-indexing moving points, and dispatch as a short-lived distributed transaction."] },
      estimation: { prompts: ["1M drivers × an update every 4 s → write QPS into the geo index?"], hints: ["250K location writes/s — this alone rules out 'just use PostGIS' and forces an in-memory index."] },
      deepdive: { prompts: ["Compare geohash vs quadtree vs H3 for 'drivers near me'.", "Two riders match the same driver simultaneously — prevent the double-dispatch."], hints: ["Hex cells (H3) avoid geohash edge distortions; dispatch needs a lock/lease on the driver (single-writer per driver)."] }
    },
    rubric: [
      { phase: "requirements", text: "Set matching latency (seconds) and clarified dispatch model, surge/pricing out of scope explicitly" },
      { phase: "estimation",   text: "Computed location-write volume (~250K/s) and used it to justify an in-memory geo index over a disk DB" },
      { phase: "highlevel",    text: "Drew location ingestion (gateway → geo index) separate from the dispatch/matching service and trip state store" },
      { phase: "highlevel",    text: "Kept live locations ephemeral (memory, TTL) and trip state durable (DB) — different data, different stores" },
      { phase: "deepdive",     text: "Explained cell-based geo-indexing (H3/geohash): drivers bucketed by cell, query = my cell + neighbors" },
      { phase: "deepdive",     text: "Prevented double-dispatch with a driver lock/lease and an offer state machine (offered → accepted/timeout)" },
      { phase: "deepdive",     text: "Sharded the geo index by city/region — matching is inherently local, so the problem partitions cleanly" },
      { phase: "wrap",         text: "Named ETA (precomputed road-graph + ML correction), hot-cell skew (airport), and what degrades if the geo index dies" }
    ],
    model: "<p><b>Shape of a strong answer:</b> drivers stream locations over a persistent connection into an <b>in-memory geo index</b> sharded by city — H3 hex cells mapping cell → driver set, updated at 250K writes/s, no disk in the path. A ride request queries its cell ring, ranks candidates by ETA (road-network distance, not haversine — say it), and the <b>dispatch service takes a lease on the chosen driver</b> so concurrent requests can't double-book; offer times out → next candidate. Trip state machine in a durable store; locations are ephemeral by design ('if we lose the index we rebuild it from the stream in seconds'). Uber-specific color: Ringpop/SWIM for shard membership, DeepETA for arrival times.</p>"
  },

  {
    id: "drill-payments",
    title: "Design a payment system",
    level: "advanced",
    lesson: "adv-payments",
    prompt: "Design the payment system for a marketplace: charge buyers via card networks, record balances, pay out sellers. Correctness is non-negotiable — we'd rather fail a payment than charge twice.",
    phaseNotes: {
      requirements: { prompts: ["Are we the merchant of record? Which PSP(s)?", "Latency vs correctness — which wins, explicitly?"], hints: ["Say the magic sentence yourself: 'we'd rather fail closed than double-charge' — it sets up every later choice."] },
      deepdive: { prompts: ["The PSP call times out — walk the exact recovery.", "Why double-entry ledger instead of a balance column?"], hints: ["Idempotency key end-to-end + state machine + reconciliation; append-only double-entry makes every cent traceable and sums to zero."] }
    },
    rubric: [
      { phase: "requirements", text: "Established correctness > availability > latency, and scoped PSP integration vs building card rails" },
      { phase: "estimation",   text: "Sized TPS honestly (even Stripe peaks ~2.5K TPS) — concluding payments is a correctness problem, not a throughput one" },
      { phase: "highlevel",    text: "Drew client → payment service (state machine) → PSP, with ledger and payout flows decoupled via events" },
      { phase: "highlevel",    text: "Generated the idempotency key at payment creation and threaded the SAME key through every retry to the PSP" },
      { phase: "deepdive",     text: "Modeled payment as an explicit state machine with transitional states for unknown PSP outcomes (never blind-retry)" },
      { phase: "deepdive",     text: "Used an append-only double-entry ledger (every movement = balanced debit+credit) as the source of financial truth" },
      { phase: "deepdive",     text: "Kept the PSP call outside any DB transaction; order row + outbox event commit atomically" },
      { phase: "wrap",         text: "Named reconciliation (three-way: ledger ↔ PSP file ↔ bank) and the authorization-rate metric as the top KPI" }
    ],
    model: "<p><b>Shape of a strong answer:</b> a payment is a <b>state machine row</b> created with a client-generated <b>idempotency key</b>; the PSP charge happens outside DB transactions with that same key, so any retry returns the original result. Unknown outcomes (timeout) park in a transitional state; a recovery worker polls the PSP status API to drive them terminal. Money movements record as <b>double-entry ledger</b> appends (debits = credits, always); payouts consume ledger balances asynchronously. <b>Reconciliation</b> — internal ledger vs PSP settlement vs bank statement — is the backstop that catches everything else. Compliance one-liner: tokenize cards (network tokens), keep PAN out of scope.</p>"
  },

  {
    id: "drill-llm-serving",
    title: "Design an LLM serving system",
    level: "advanced",
    lesson: "adv-llm",
    prompt: "Design the inference platform serving a 70B-parameter chat model to 10 million users: streaming token responses, interactive latency, GPUs are the cost center.",
    phaseNotes: {
      requirements: { prompts: ["Latency SLOs: time-to-first-token vs per-token rate?", "One model or many? Context lengths?"], hints: ["TTFT ≤ ~300 ms and TPOT ≤ ~50 ms are the two numbers that define 'interactive' — name both."] },
      estimation: { prompts: ["Peak requests/s × output tokens → tokens/s; per-GPU throughput at target utilization → fleet size?", "KV-cache memory per concurrent sequence?"], hints: ["Capacity math is tokens/s, not requests/s; KV cache (≈0.3 MB/token for a 70B GQA model) limits batch size before compute does."] },
      deepdive: { prompts: ["Why does naive request-level batching waste GPUs, and what's continuous batching?", "What does PagedAttention actually fix?"], hints: ["Sequences finish at different times — continuous batching swaps finished sequences out mid-flight; PagedAttention ends KV fragmentation via paging."] }
    },
    rubric: [
      { phase: "requirements", text: "Defined TTFT and TPOT SLOs separately and made GPU cost an explicit design constraint" },
      { phase: "estimation",   text: "Computed tokens/s = RPS × output length, divided by per-GPU throughput × utilization to size the fleet" },
      { phase: "estimation",   text: "Budgeted GPU memory: weights (tensor-parallel or FP8) + KV cache per concurrent sequence" },
      { phase: "highlevel",    text: "Drew gateway → scheduler/router → model replicas (vLLM-style), streaming tokens via SSE end to end" },
      { phase: "deepdive",     text: "Explained continuous batching (per-iteration scheduling, sequences join/leave mid-batch) as the utilization unlock" },
      { phase: "deepdive",     text: "Explained the KV cache and PagedAttention (paged, non-contiguous KV blocks → no fragmentation, higher batch)" },
      { phase: "deepdive",     text: "Added prefix caching for shared system prompts, and routed by expected length / disaggregated prefill-decode (2026)" },
      { phase: "wrap",         text: "Autoscaled on queue depth/token backlog (not CPU), named goodput vs latency trade and graceful degradation (smaller model fallback)" }
    ],
    model: "<p><b>Shape of a strong answer:</b> stateless gateway streams SSE; a <b>scheduler</b> routes to replicas running <b>continuous batching</b> with <b>PagedAttention</b> (vLLM/SGLang) — that pair is what turns 10% GPU utilization into 60%+. Memory math drives everything: 70B BF16 = 140 GB → TP across 2×80 GB or FP8 on one; KV cache ≈ 0.3 MB/token caps concurrent sequences. Prefix-cache the shared system prompt; (2026) disaggregate prefill and decode pools so long prompts don't stall token streams. Autoscale on token backlog; degrade to a distilled model under brownout. Close with the money: utilization is the bill — show the GPU count halving when util goes 0.3 → 0.6.</p>"
  },

  {
    id: "drill-feature-store",
    title: "Design a real-time ML feature store",
    level: "advanced",
    lesson: "adv-feature-store",
    prompt: "Design the feature platform for a fraud-detection team: models need features like 'transactions in the last 5 minutes' served in under 10 ms at inference, and historically accurate training sets over 6 months.",
    phaseNotes: {
      requirements: { prompts: ["Freshness per feature — which features genuinely need seconds?", "Who else consumes features — one team or the whole company?"], hints: ["Two consumers, opposite needs: training wants complete history; inference wants the latest value, fast. Build the answer around that duality."] },
      deepdive: { prompts: ["A training row is dated March 3 — which feature values may it see?", "The same feature computed by two different pipelines — what goes wrong?"], hints: ["Point-in-time (ASOF) joins kill leakage; a single registered transformation kills training-serving skew."] }
    },
    rubric: [
      { phase: "requirements", text: "Identified the dual consumer (training bulk vs inference point-reads) and per-feature freshness SLAs" },
      { phase: "estimation",   text: "Computed feature reads/s = inference QPS × features per call (the amplification) and sized the online store" },
      { phase: "highlevel",    text: "Drew one transformation pipeline materializing to BOTH an offline history store and an online latest-value store" },
      { phase: "highlevel",    text: "Included a registry (definitions, owners, freshness SLAs) making features shared, governed infrastructure" },
      { phase: "deepdive",     text: "Explained point-in-time-correct (ASOF) joins and the leakage bug they prevent" },
      { phase: "deepdive",     text: "Explained training-serving skew and killed it by defining each transformation exactly once" },
      { phase: "deepdive",     text: "Tiered materialization by freshness: batch by default, streaming only for second-level features (fraud velocity)" },
      { phase: "wrap",         text: "Monitored feature freshness lag per view, defined cold-start defaults, and ran online/offline consistency audits" }
    ],
    model: "<p><b>Shape of a strong answer:</b> one registered transformation per feature, materialized twice — append-only timestamped history in the <b>offline store</b> (lakehouse) and latest-value-per-key in the <b>online store</b> (Redis/DynamoDB, batched multi-get < 10 ms). Training sets are built with <b>ASOF joins</b> at each label's timestamp (no leakage); skew dies because there is no second implementation. Freshness is a per-feature dial: nightly batch for slow signals, Flink streaming only for the 5-minute fraud windows. Ops: alert on freshness lag (a stuck stream serves silent staleness), train with the declared cold-start defaults, and continuously diff online vs offline values.</p>"
  },

  {
    id: "drill-checkout",
    title: "Design e-commerce checkout & inventory",
    level: "expert",
    lesson: "expert-ecommerce-checkout",
    prompt: "Design checkout for a large store: reserve stock, charge the customer, create the order — across separate inventory, payment, and order services. Flash sales oversell nothing; failures never leak money or stock.",
    phaseNotes: {
      requirements: { prompts: ["Does adding to cart hold stock? How long can a checkout reservation live?", "What's acceptable during a flash sale — queueing or overselling?"], hints: ["'Cart ≠ reservation' and 'reserve at checkout with a TTL' are the two scoping wins available in the first 5 minutes."] },
      deepdive: { prompts: ["No 2PC across services — so how do the three steps stay consistent?", "Two buyers race for the last unit — show the exact query that prevents oversell."], hints: ["Saga with compensations (orchestrated); atomic conditional decrement: UPDATE … SET reserved = reserved + 1 WHERE available > reserved."] }
    },
    rubric: [
      { phase: "requirements", text: "Scoped cart vs reservation (cart holds nothing) and set reservation TTL semantics" },
      { phase: "estimation",   text: "Sized normal vs flash-sale peaks and flagged the hot-SKU row as the real contention point" },
      { phase: "highlevel",    text: "Drew an orchestrated saga: reserve → authorize → create order, each step with a named compensation" },
      { phase: "highlevel",    text: "Created the order with an idempotency key from form render, making double-submit harmless" },
      { phase: "deepdive",     text: "Prevented oversell with an atomic conditional decrement (or per-SKU serialized queue for flash sales)" },
      { phase: "deepdive",     text: "Handled 'payment captured, order write failed': compensating refund with the same idempotency key" },
      { phase: "deepdive",     text: "Committed order row + outbox event in one local transaction; downstream fulfillment consumes events" },
      { phase: "wrap",         text: "Named durable execution / a reconciler for stuck sagas, and metrics on compensation rate (a rising rate = a rotting dependency)" }
    ],
    model: "<p><b>Shape of a strong answer:</b> an <b>orchestrated saga</b> (durable-execution engine): reserve inventory (atomic conditional decrement + TTL hold), authorize/capture payment (PSP call outside DB txns, idempotency key threaded through), create order + outbox event in one local transaction, confirm the reservation. Every step pairs with a compensation — release hold, refund — executed in reverse on failure; TTL expiry is the backstop for lost releases. Flash sales: per-SKU ordered queue (serialize the hot row) and honest 'sold out' over optimistic overselling. The differentiator: walking the 'captured but no order' branch unprompted.</p>"
  },

  {
    id: "drill-billing",
    title: "Design billing, subscriptions & metering",
    level: "expert",
    lesson: "expert-billing",
    prompt: "Design billing for a SaaS with seat subscriptions plus usage-based pricing (per-API-call). Meter millions of usage events an hour, invoice monthly, handle plan changes mid-cycle. Overcharging is unacceptable.",
    phaseNotes: {
      requirements: { prompts: ["Pricing models in scope: flat seats, tiers, usage, hybrid?", "When a customer disputes an invoice line, what must you be able to show?"], hints: ["Auditability is the hidden requirement: every invoice line must trace to raw events."] },
      deepdive: { prompts: ["The same usage event arrives three times — invoice impact?", "Usage arrives two hours after the cycle closed — what happens?"], hints: ["Idempotent ingest on event_id (ON CONFLICT DO NOTHING); draft invoice + grace window + adjustments on the next cycle."] }
    },
    rubric: [
      { phase: "requirements", text: "Captured hybrid pricing (seats + usage) and auditability (invoice line → raw events) as requirements" },
      { phase: "estimation",   text: "Sized event ingest (thousands/s) vs invoicing (monthly batch) — two very different workloads in one system" },
      { phase: "highlevel",    text: "Drew the pipeline: idempotent ingest → durable event stream → aggregator → usage store → rating/invoicing" },
      { phase: "highlevel",    text: "Kept the meter append-only: corrections are compensating events, never edits" },
      { phase: "deepdive",     text: "Deduplicated at ingest on a client event id — double-counting named as the cardinal sin" },
      { phase: "deepdive",     text: "Handled late/out-of-order events with a watermark: draft at cycle end, grace window, then finalize" },
      { phase: "deepdive",     text: "Modeled proration as ledger-style debits/credits on plan change, not recomputed history" },
      { phase: "wrap",         text: "Named dunning (failed payment retries + grace), invoice immutability after finalize, and consumer lag vs watermark alerting" }
    ],
    model: "<p><b>Shape of a strong answer:</b> a metering pipeline — idempotent ingest (event_id unique constraint), Kafka, streaming/batch aggregation into per-customer-per-meter buckets — feeding a <b>rating engine</b> that prices buckets against the customer's plan at invoice time. Invoices are <b>drafts</b> until the grace-window watermark passes; truly-late usage becomes next cycle's adjustment; finalized invoices are immutable (accounting requirement). Subscriptions are a state machine (trial → active → past_due → canceled) with proration as credit/debit line items. Billing ledger ties every line to raw events for disputes. 2026 color: usage-based hybrid is now the dominant SaaS model (Metronome, Orb) — metering is the hard 20%.</p>"
  },

  {
    id: "drill-authorization",
    title: "Design an authorization system",
    level: "expert",
    lesson: "expert-authorization",
    prompt: "Design the permissions system for a Google-Drive-like product: per-document sharing, folders inherit, groups, and 'can user X see doc Y?' answered on every request at under 10 ms.",
    phaseNotes: {
      requirements: { prompts: ["Reverse queries needed — 'list everything X can see'?", "After un-sharing, how fast must access actually disappear?"], hints: ["Per-object sharing + inheritance is the tell that plain RBAC won't fit — steer to ReBAC early."] },
      deepdive: { prompts: ["Model 'viewers of a doc include viewers of its parent folder' as data, not code.", "A check hits a stale replica right after un-sharing — what's the danger and the fix?"], hints: ["Zanzibar tuples + tuple_to_userset; the 'new enemy' problem → zookies / consistency tokens."] }
    },
    rubric: [
      { phase: "requirements", text: "Established per-object sharing, inheritance, groups, and reverse queries — concluding RBAC alone can't express it" },
      { phase: "estimation",   text: "Sized check QPS (multiple per request, every request) — the read-heavy hot path that justifies a dedicated service" },
      { phase: "highlevel",    text: "Drew a central check API (PDP) consulted by services, backed by a replicated tuple store + cache" },
      { phase: "highlevel",    text: "Modeled permissions as relation tuples (object#relation@subject) with usersets for groups" },
      { phase: "deepdive",     text: "Expressed folder→doc inheritance via tuple rewrites (tuple_to_userset), not per-file ACL copies" },
      { phase: "deepdive",     text: "Implemented check as cached graph reachability, with computed usersets (editor ⊆ viewer)" },
      { phase: "deepdive",     text: "Named the new-enemy problem and solved it with consistency tokens (zookies) on check" },
      { phase: "wrap",         text: "Covered reverse indexing for 'list accessible', tenant scoping, and what fails open/closed when the authz service degrades" }
    ],
    model: "<p><b>Shape of a strong answer:</b> a Zanzibar-style <b>ReBAC service</b> (SpiceDB/OpenFGA in practice): relation tuples in a replicated store, schema rewrites for role implication and folder inheritance, <b>Check</b> = memoized graph walk served from heavy caches at sub-10 ms, plus Expand/List via reverse indexes. Correctness under replication is the senior differentiator: cite the <b>new-enemy problem</b> and gate checks with a consistency token captured when the content was written. Authz fails <b>closed</b>; cache TTLs bound the un-share propagation you promised in requirements.</p>"
  },

  {
    id: "drill-cells",
    title: "Design a cell-based architecture",
    level: "expert",
    lesson: "expert-cells",
    prompt: "Your B2B platform serves 20,000 companies from one big multi-AZ deployment. Last month a bad deploy took everyone down for 4 hours. Redesign for bounded blast radius.",
    phaseNotes: {
      requirements: { prompts: ["What's an acceptable blast radius — 10%? 5%?", "Largest single customer's share of total load?"], hints: ["The whale question matters: your biggest customer must fit inside one cell with headroom."] },
      deepdive: { prompts: ["Design the router: hash vs directory? What happens when the mapping store is down?", "Cell 2 dies — do you fail its traffic over to cells 1 and 3?"], hints: ["Directory mapping + static stability; and NO spillover — ceilings protect the healthy cells. Restoration over redistribution."] }
    },
    rubric: [
      { phase: "requirements", text: "Quantified target blast radius (→ cell count) and surfaced the whale-customer sizing constraint" },
      { phase: "estimation",   text: "Sized cells: fixed infra cost per cell vs 1/N damage cap, and capacity ceiling below load-tested max" },
      { phase: "highlevel",    text: "Drew N shared-nothing full-stack cells with a thin router as the ONLY shared component" },
      { phase: "highlevel",    text: "Chose a directory mapping (customer → cell) over pure hashing, for deliberate placement and easy migration" },
      { phase: "deepdive",     text: "Made the router static-stable: cached map served even when the mapping control plane is down" },
      { phase: "deepdive",     text: "Turned deploys into cell-by-cell waves with bake time — the direct fix for the 4-hour incident" },
      { phase: "deepdive",     text: "Refused cross-cell failover (ceilings protect healthy cells); recovery = restore the cell, not spill its load" },
      { phase: "deepdive",     text: "Applied shuffle sharding to shrink poison-pill blast radius below 1/N" },
      { phase: "wrap",         text: "Acknowledged the costs: N× fixed infra, cell-aware tooling, async aggregation plane for cross-customer features" }
    ],
    model: "<p><b>Shape of a strong answer:</b> partition into <b>N complete, shared-nothing cells</b> (each: gateway, services, queues, DB), each owning a directory-assigned customer slice with a hard capacity ceiling; scale by adding cells. The <b>thin router</b> is the lone shared piece — a static-stable key→cell lookup with edge-cached maps and no runtime dependency on its control plane. Deploys roll in waves with bake time (the incident's fix); a dead cell is <em>restored, never spilled over</em>; shuffle sharding gives the long tail combinatorial isolation. Costs stated plainly: N× infra, cross-customer analytics move to an async aggregation plane. Name-drop honestly: AWS guidance, Slack, Salesforce pods.</p>"
  }
];
