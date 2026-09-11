# Senior Backend Scenario Q&A — Answer Quality Audit

**Date:** 2026-09-12  
**Corpus:** 12 domains × 10 cards = **120** primary answers (+ quizzes + flashcards)  
**Bar:** Staff / Principal interview (why · what breaks · what you measure)

---

## Executive verdict

Answers are **mid-senior checklist-correct** more often than wrong, but they systematically fail a **Staff/Principal** loop. The bank teaches *what to name*, not *how to reason*. A strong senior might pass many topics; a principal probes past almost every `modelAnswer` in one follow-up.

| Signal | Finding |
|--------|---------|
| Overall altitude | Imperative inventories, not tradeoff interviews |
| Strongest | Debugging (~964c, 8 steps) · Distributed · Dependencies |
| Weakest | Kafka · MongoDB · Redis · Security (heuristic) |
| Depth cliff | d01–d04: **8** bullets · d05–d08: **5** · d09–d12: **6** |
| Learning inversion | Best prose was in `first30s` / `followUps`; drills previously omitted `modelAnswer` (fixed) |

**Staff-ready gate (see AUTHORING):** avg ≥ 4.0 and Tradeoffs ≥ 4 and Failure modes ≥ 4.  
**Pre-rewrite estimate:** almost no card clears the gate; d01 peaks ~3.2 domain avg (heuristic).

---

## Rubric (0–5 each)

| Criterion | 0 | 3 | 5 |
|-----------|---|---|---|
| Technical correctness | Wrong/misleading | Mostly right, imprecise edges | Precise under PG/Redis/Kafka/AWS semantics; caveats named |
| Diagnosis / design steps | Vague verbs | Ordered steps | Branching: evidence → decision → action; commands/metrics named |
| Tradeoffs | None | One alternative | ≥2 options with cost, risk, when to choose |
| Failure modes | Happy path only | 1–2 failures | Crash/timeout/dup/partial; what user sees |
| Operability | No metrics | Names a metric | SLI/SLO, alert, runbook/game-day |
| Learning WHY | Checklist | Some causal links | Addresses misconception; explains why trap fails |
| Interview altitude | Junior glossary | Mid-senior pass | Survives 2 hostile follow-ups without new facts |
| Non-generic | Interchangeable | Some domain detail | Concrete numbers, schemas, or worked example |

---

## Per-domain scores (heuristic, pre-Wave-1)

Heuristic scoring from length, bullet count, and keyword signals for tradeoffs / failures / metrics. Use for prioritization, not as a substitute for human review.

| Domain | Avg score | Avg chars | Bullets | Severity |
|--------|-----------|-----------|---------|----------|
| Debugging | 3.20 | 964 | 8 | Minor |
| Dependencies | 2.81 | 649 | 8 | Minor–Major |
| Distributed | 2.76 | 690 | 6 | Minor |
| Async | 2.61 | 662 | 8 | Major (dupes) |
| AWS / Nginx | 2.47 | 638 | 6 | Major |
| Postgres | 2.40 | 578 | 5 | Major |
| API design | 2.38 | 625 | 8 | Major |
| Ownership | 2.16 | 519 | 6 | Major (soft) |
| Redis | 2.12 | 462 | 5 | Critical |
| Security | 2.06 | 556 | 6 | Major |
| MongoDB | 2.02 | 495 | 5 | Critical |
| Kafka | 1.97 | 477 | 5 | Critical–Major |

---

## Cross-cutting defects

1. **Almost no WHY / tradeoffs in `modelAnswer`** — principal interviews are tradeoff interviews.
2. **Fixed bullet quotas** — quality cliff correlates with 5-bullet mid-bank compression.
3. **`sayIt` + flashcards train slogan recall** — trap backs often 3–6 words.
4. **Follow-ups harder than the model answer** — best content inverted for learning.
5. **Failure modes, metrics, and numbers sparse** — tool names dominate.
6. **AUTHORING / verify had no pedagogy bar** — pipeline-only until this pass.

---

## Top 15 rewrite priorities

| Rank | ID | Domain | Why weak | Fix toward |
|------|-----|--------|----------|------------|
| 1 | d07-q03 | Redis | Cache-aside recipe | Consistency window, stampede, invalidation, null cache, metrics |
| 2 | d07-q09 | Redis | MULTI/EXEC ≈ Lua | WATCH/Lua correctly; durability limits |
| 3 | d07-q05 | Redis | Stampede slogan | Lock TTL, waiter timeout, SWR vs hot-key |
| 4 | d07-q10 | Redis | Avalanche without sizing | Semaphore, shed order, game-day |
| 5 | d08-q02 | Kafka | Dedupe unique only | Inbox/outbox, non-DB effects, EOS scope |
| 6 | d08-q03 | Kafka | Crash taxonomy thin | auto.commit, revoke, partial batch |
| 7 | d08-q10 | Kafka | Outbox happy path | Idempotent produce, lag SLO, dual-write timeline |
| 8 | d06-q02 | Mongo | Embed/ref textbook | Size, contention, fan-out, worked pattern |
| 9 | d06-q04 | Mongo | ESR name-drop | Full index from query + explain |
| 10 | d06-q07 | Mongo | Hotspot list | Detection → mitigation order → tradeoffs |
| 11 | d11-q01 | Security | Control laundry list | Threat model, abuse cases, authn/z failures |
| 12 | d04-q09 | API | Generic layering | Bad route → use-case + authz seam |
| 13 | d12-q08 | Ownership | Process platitudes | Compatibility policy, CI ownership |
| 14 | d02-q03 | Async | Near-dupe of q01/q04 | Merge or deepen one decorator design |
| 15 | d05-q06 | Postgres | RR/SSI imprecision | Accurate anomaly table; locks vs isolation |

**Gold bar:** `d01-q01` (502 hop walk) — evidence-ordered, hop-specific, mitigate last.

---

## Practice / pedagogy gaps

| Surface | Shows | Gap |
|---------|-------|-----|
| Domain cards | Full `modelAnswer` + code/diagram | Best learning surface |
| Drills (post-fix) | First 30s → **model steps** → say it → traps | Layered reveal |
| Flashcards | `sayIt` / one trap | Slogan recall only |
| Method | Five-beat scaffold | Cards rarely labeled to beats |

---

## Enhancement waves (this implementation)

| Wave | Scope | Status target |
|------|-------|---------------|
| 0 | This audit + AUTHORING rubric + verify soft gates + drill layered reveal | Done in same PR |
| 1 | Rewrite `d05`–`d08` to Debugging density | Done in same PR |
| 2 | d02 dedupe · d04/d11/d12 · mental models | Follow-up |
| 3 | Polish d01/d03/d09 + ≥4 mermaid/domain for redis/kafka/mongo/postgres | Follow-up |

---

## Post–Wave-1 rewrite metrics

| Domain | Before avg chars / bullets | After avg chars / bullets |
|--------|----------------------------|---------------------------|
| Postgres | ~578 / 5 | ~1433 / 8 |
| MongoDB | ~495 / 5 | ~1257 / 8 |
| Redis | ~462 / 5 | ~1228 / 8 |
| Kafka | ~477 / 5 | ~1120 / 8 |

Wave-1 pedagogy soft-gate warnings for `d05`–`d08`: **0**. Remaining ~150 warnings are Waves 2–3 domains.

Also shipped: AUTHORING Staff bar, layered drill reveal, Philosophy `quizdrill.js` removed from practice, pedagogy soft gates in `verify.js`, meta description fixed in `gen.js`.

## Success criteria

- Redis/Mongo/Kafka avg length and rubric approach Debugging/Distributed.
- Hostile follow-ups answerable from `modelAnswer` alone.
- Drills teach *path*; flashcards still train *spoken close*.
- Authoring + verify prevent regressing to 5-bullet slogans.
