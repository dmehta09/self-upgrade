# Ownership PDF curation — 2026-09-12

**Source:** `senior_engineering_delivery_ownership_judgment_questions.pdf` (268 prompts, 22 sections)  
**Target:** [`senior-backend-guide/tools/banks/d12-ownership.json`](senior-backend-guide/tools/banks/d12-ownership.json)  
**Rule:** Do **not** ingest all 268 as full Senior Answer Cards. Resume used only for private story rehearsal priority — **never** linked from guide answers.

---

## Executive counts

| Tier | Approx prompts | Guide treatment |
|------|----------------|-----------------|
| **Must → full cards** | ~55 compressed into **28** SAC cards | `d12-q01`…`d12-q28` |
| **Merge into Must cards** | ~90 (follow-ups / near-dupes) | `followUps` on umbrella cards |
| **Probe / flash only** | ~45 (§21 + anecdote-only + §22) | `_ownership-probes.json` + cheatStrip |
| **Skip / defer** | ~78 | Other domains or low IC signal |

**Rough split of 268:** ~28 full · ~45 probe · ~195 skip/merge.

---

## Section classification

| § | Theme | n | Tier | Guide mapping |
|---|--------|---|------|----------------|
| 1 | End-to-End Ownership | 15 | Must | `d12-q11` (define ownership / unowned); deepen health via `q10`; story probes for “tell me about” |
| 2 | Ambiguity | 14 | Must | Existing `q02`,`q07`; new `q12` conflicting stakeholders |
| 3 | Planning | 13 | Must | Existing `q01`,`q03`; new `q13` six-month milestones |
| 4 | Delivery risk | 15 | Must | New `q14` slip communication; `q15` impossible deadline / debt contract |
| 5 | Tradeoffs | 15 | Must | Existing `q06`,`q09`; stakeholder explain → `q18` |
| 6 | Tech judgment | 17 | Compress | New `q27` decision framework (Q2–5 as followUps); irreversible/maturity in same card |
| 7 | Disagreement | 13 | Must | New `q16` disagree + commit (peers/manager/PM) |
| 8 | Delegation | 15 | Must | Existing `q01`,`q03`,`q04`,`q05` deepened |
| 9 | Cross-team | 12 | Must | New `q17` unblock / multi-team; contract overlap `q08` |
| 10 | Stakeholders | 11 | Must | New `q18` explain tradeoff/debt to non-technical |
| 11 | Code review | 13 | Must | New `q19` huge PR / block criteria |
| 12 | Release | 12 | Must | Existing `q09`,`q10`; migration mechanics → postgres domain |
| 13 | Incident ownership | 12 | Must (judgment) | New `q20`; hop debug → d01 |
| 14 | Failure / learning | 13 | Must + probe | New `q21` learning loop; rest probes |
| 15 | Tech debt | 10 | Must | New `q22` harmful debt + convince product |
| 16 | Process | 10 | Thin | New `q28` repeat mistake → systemic fix; rest skip |
| 17 | Arch evolution | 10 | Thin | New `q26` monolith split / when not to; microservices fashion as trap |
| 18 | Business impact | 10 | Must | New `q23` |
| 19 | Under pressure | 8 | Must | New `q24` |
| 20 | Difficult scenarios | 10 | Must | New `q25` unsafe-to-ship; others merge into `q14`–`q16`,`q22` |
| 21 | Follow-up drills | 10 | Probe only | Ownership probes (no full modelAnswers) |
| 22 | Senior vs mid | 10 | Primer / cheat | Primer + cheatStrip + flash contrasts; optional ladder in primer |

---

## Skip rules (applied)

1. Follow-up facet of another question (e.g. §6 Q2–Q5).  
2. Duplicate of an existing `d12-q0N` prompt.  
3. Anecdote-only with no transferable method → probe.  
4. Low-frequency process/ceremony (§16 majority).  
5. Architecture fashion / mechanism already in d01/d05–d09 (§12 migrations, §13 hop debug, §17 most).

---

## Card inventory (28)

| ID | Theme |
|----|--------|
| q01–q10 | Existing (deepened to Staff bar) |
| q11 | Ownership definition + unowned prod problem |
| q12 | Conflicting stakeholders / challenge proposed solution |
| q13 | Six-month initiative → milestones / critical path |
| q14 | Slip communication (4→8 weeks) + recover |
| q15 | Impossible deadline / quality tradeoff + debt repayment |
| q16 | Disagree with senior/manager/PM + disagree-and-commit |
| q17 | Cross-team unblock / multi-team coordination |
| q18 | Explain tradeoff or debt to non-technical stakeholder |
| q19 | Code review: huge PR, block vs optional |
| q20 | Incident ownership at 2am (mitigate vs RCA) |
| q21 | Personal failure / missed deadline — learning loop |
| q22 | Harmful debt + convincing product for time |
| q23 | Business impact / outcome metrics |
| q24 | Decision under incomplete data / executive pressure |
| q25 | Unsafe-to-ship pushback |
| q26 | Monolith split / when not to (thin §17) |
| q27 | Technical decision framework (§6 compress) |
| q28 | Repeat production mistake → systemic process fix (§16 thin) |

---

## Private story prep (not in guide)

Rehearse personal examples against Must cards using your own projects (RAG ownership, data-lifecycle judgment, federation coordination, strangler migration, realtime scale). Do **not** paste employer names or resume URLs into bank `links[]`.

---

## Success check

- [x] Every Must theme has ≥1 Staff card  
- [x] §21/§22 as probes/cheat, not 20 long essays  
- [x] Zero resume links in banks  
- [x] Regenerated: 138 drill questions; 20 ownership probes merged into flashcards; verify HTML clean; **0** d12 pedagogy warnings  
