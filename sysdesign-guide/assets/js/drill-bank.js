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
];
