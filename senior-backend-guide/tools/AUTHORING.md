# Authoring — Senior Backend Scenario Q&A

## Pipeline

1. Edit or add `tools/banks/dNN-slug.json`.
2. Keep `id` / `question` stable when updating answers.
3. Run `node tools/gen.js` (renders banks → fragments → pages + `sbe-bank.js`).
4. Run `node tools/verify.js` (links, assets, **and pedagogy soft gates**).

## Senior Answer Card schema

Each `questions[]` item:

| Field | Required | Role |
|-------|----------|------|
| `id` | yes | Stable cite key (`d07-q03`) |
| `question` | yes | Scenario prompt |
| `first30s` | yes | Hypothesis-driven opening (spoken first 30s) |
| `modelAnswer` | yes | Ordered learning path (see bar below) |
| `sayIt` | yes | Spoken close — conclusion, not a slogan list |
| `traps` | yes | ≥3 anti-patterns; each should imply *why it hurts* |
| `followUps` | yes | Interview probes; prefer Socratic + expected shape |
| `code` / `codeLang` | mechanism cards | Concrete commands or snippets |
| `mermaid` | mechanism cards | Decision / sequence / hop diagram |
| `nestNote` | encouraged | Nest/Node bridge |
| `links` | encouraged | Authoritative refs |

Domain-level: `primer`, `cheatStrip` (6 chips), `quiz` (4 MC with `explain`).

### Practice surfaces (do not author assuming they are equal)

- **Domain pages:** full card (`modelAnswer`, code, mermaid, …).
- **Drills:** layered reveal — First 30s → **Model steps** → Say it → Traps.
- **Flashcards:** `sayIt` (and trap recognition) — spoken close only.

## Staff-ready quality bar

Score each `modelAnswer` 0–5 on:

**Correctness · Steps · Tradeoffs · Failure modes · Operability · WHY · Interview altitude · Non-generic**

**Gate:** average ≥ 4.0 **and** Tradeoffs ≥ 4 **and** Failure modes ≥ 4.

### Required answer shape (labeled bullets OK)

Keep `modelAnswer` as a string array, but cover these beats (method.html):

1. **Clarify / opening** — what the symptom means; hypothesis.
2. **Evidence / steps** — ordered diagnosis or design with concrete signals (commands, logs, SQL).
3. **Tradeoffs** — ≥2 options with cost and *when* to choose (use “because / vs / rather than”).
4. **Failure modes** — crash, timeout, duplicate, partial; what the user sees; detection.
5. **Fix** — mitigation that matches evidence.
6. **Prevent / operability** — metric or SLI, alert, or game-day close.

Also strengthen:

- **`sayIt`** — one spoken paragraph that could survive a follow-up.
- **`traps`** — smell → why it fails in prod → (implied) correct move.
- **Anti-answer** — fold into traps or last model bullet: common wrong answer + why rejected.
- **Metrics** — name at least one measurable signal (p99, lag, hit rate, pool wait, …).

### Depth targets (ops / data domains)

Especially **postgres, mongodb, redis, kafka, debugging, distributed, dependencies, projects**:

- Prefer **≥6** substantive `modelAnswer` steps (not padding).
- Prefer **≥700** characters total across `modelAnswer` bullets.
- Mechanism questions: ≥1 of `{code, mermaid}` non-empty.
- Last 1–2 bullets should close **Fix / Prevent** (ops), not another glossary noun.

### Project deep-dive domain (`d13` / `projects`)

- Frame systems by **capability** (document intelligence RAG, institutional LMS, healthcare diagnostics) — never by employer.
- **Forbidden** in bank JSON / rendered HTML: resume paths, LinkedIn, email, phone, employer names, personal URLs, “see resume”.
- Answers are Staff technical judgment for *these* platforms; public docs only in `links[]` (no personal artifacts).

Gold bar: `d01-q01` (502 hop walk) — evidence-ordered, hop-specific, mitigate last.

### Soft gates in `verify.js`

Warnings (or failures when strict) for:

- `modelAnswer` char sum below domain minimum (ops domains: 700).
- Fewer than 6 steps on ops domains.
- Fewer than 3 traps.
- Empty `code` and `mermaid` on mechanism-tagged cards (heuristic: question mentions implement/debug/design/how would you).
- Missing prevent/ops language in final bullets (metric / alert / monitor / prevent / game-day / retry / SLO — soft).

## Rewrite checklist (per card)

- [ ] Hostile follow-up (“what breaks / what do you measure / why not X”) answerable from `modelAnswer` alone
- [ ] No MULTI/EXEC claimed as peer to Lua for conditional RMW without WATCH
- [ ] Postgres isolation wording matches PG semantics (SSI / 40001)
- [ ] Kafka at-least-once + idempotency + commit-after-success explicit
- [ ] Redis stampede ≠ hot-key; avalanche = bounded DB fallback

## Adding a domain

New `tools/banks/dNN-slug.json` + manifest page + domain slug; then `gen.js` + `verify.js`.
