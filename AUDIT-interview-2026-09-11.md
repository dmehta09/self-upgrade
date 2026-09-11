# Interview day audit · 2026-09-11

**Slot mix:** Aptitude · DSA · GenAI / Backend (FastAPI + LangStack gotchas)  
**Rules:** visual-first · timed · say-it-out-loud · no new engines unless gap  
**Serve from repo root:** `python3 -m http.server` in `self-upgrade/` so hub progress + same-origin `localStorage` work.

---

## Executive verdict (mixed interview)

| Guide | Score | Role today | Verdict |
|-------|-------|------------|---------|
| **Aptitude** | 8/10 OA | Round 0 gate | Strong warm/core; stretch bank thin |
| **DSA** | 8/10 mid coding | Pattern + timed drill | Strong mid primer; stretch gaps (prefix / perms / deque) filled |
| **GenAI** | 8.5/10 conceptual + SD | Verbal / system design | Interview kit is real; avoid memorizing speculative model brand names |
| **FastAPI** | 8/10 API screen | Backend verbal | Modern stack correct; 2 copy-paste bugs fixed in this pass |
| **LangStack** | 6.5/10 currency | Framework verbal | Pedagogy excellent; agent factory + Platform naming corrected in this pass |

**Overall:** Guides are strong enough for a mixed day if you follow the study map below — engines first, prose second.

**DevOps:** Out of the five-guide audit scope. Use existing [`devops-guide/`](devops-guide/index.html) if a round turns DevOps — no new project needed.

---

## 0. Hub path (15 min)

- [ ] Open [`index.html`](index.html) → **Interview today** checklist
- [ ] Confirm progress strip shows the five tracks (after any prior “Mark as learned”)
- [ ] Deep-link into the first block (Aptitude drill)

```bash
cd /Users/arvasit/Desktop/self-upgrade && python3 -m http.server 8765
# open http://127.0.0.1:8765/
```

Author commands (after this pass):

```bash
./bin/guide status
./bin/guide verify all
./bin/guide build aptitude-guide   # Tier-A: gen → search → verify
```

---

## 1. Aptitude (35–45 min)

| Topic | Page | Visual | Drill | Status | Weak? |
|-------|------|--------|-------|--------|-------|
| Timed arena | [practice/drill.html](aptitude-guide/practice/drill.html) | drill engine | full | ⬜ | |
| Speed math | [foundations/speed-math-toolkit.html](aptitude-guide/foundations/speed-math-toolkit.html) | figbox | mini | ⬜ | |
| Weak quant (pick 1) | e.g. [time-speed-distance](aptitude-guide/quant/time-speed-distance.html) | SVG | page drill | ⬜ | |
| Weak reasoning (pick 1) | e.g. [syllogisms](aptitude-guide/reasoning/syllogisms-and-statements.html) | Venn/figbox | page drill | ⬜ | |
| Formula sheet | [reference/formula-sheet.html](aptitude-guide/reference/formula-sheet.html) | — | skim | ⬜ | |
| Flashcards (Leitner) | [reference/flashcards.html](aptitude-guide/reference/flashcards.html) | cards | due-first shuffle | ⬜ | |

**How:** Timed drill first → say the shortcut out loud → mark Known only if you can re-derive in &lt;30s.

**Skip today:** Pure encyclopedia RC reading; optional larger stretch pool only.

---

## 2. DSA (50–60 min)

| Pattern | Viz? | Drill | Say-aloud one-liner | Status |
|---------|------|-------|---------------------|--------|
| Pattern map | [patterns/index.html](dsa-guide/patterns/index.html) picker | — | “Constraint → pattern” | ⬜ |
| Two pointers / SW / Hash | pick weak pattern page + step `visualizer` | — | Big-O + invariant | ⬜ |
| Python coding bank | [reference/python-coding-round.html](dsa-guide/reference/python-coding-round.html) | Top 12 + traps | LC starter out loud | ⬜ |
| Timed round | [drill/index.html](dsa-guide/drill/index.html) | 40-min mock | Rubric out loud | ⬜ |
| Cheatsheet | [reference/cheatsheet.html](dsa-guide/reference/cheatsheet.html) | — | When-to table | ⬜ |

**How:** Step viz frames; narrate invariant; one timed round only.

**Park:** ~~permutations / N-Queens, prefix sums, monotonic queue~~ — now on pattern pages (stretch).

**Trap:** Best Time to Buy/Sell Stock is taught under Sliding Window but interviewers usually call it **one-pass greedy** — say both.

---

## 3. GenAI (50–60 min)

| Concept | Engine / page | Interview Q | Status |
|---------|---------------|-------------|--------|
| Attention | [internals/attention-mechanism.html](genai-guide/internals/attention-mechanism.html) heatmap | “Why O(n²)? What is GQA for?” | ⬜ |
| Hybrid RAG | [rag/hybrid-search-and-reranking.html](genai-guide/rag/hybrid-search-and-reranking.html) ragflow | “Fuse ranks not scores; when rerank?” | ⬜ |
| Workflow map | [rag/architectures-and-workflows.html](genai-guide/rag/architectures-and-workflows.html) Mermaid | “Strong default → when graph/agent?” | ⬜ |
| Spoken bank | [interview/question-bank.html](genai-guide/interview/question-bank.html) | 3 answers out loud | ⬜ |
| SD case (pick 1) | [rag-chatbot](genai-guide/interview/system-design/rag-chatbot.html) or [agentic-assistant](genai-guide/interview/system-design/agentic-assistant.html) | Define → trade-off → gotcha | ⬜ |
| Cheatsheet | [interview/cheatsheets.html](genai-guide/interview/cheatsheets.html) | 20 things skim | ⬜ |
| Flashcards | [interview/flashcards.html](genai-guide/interview/flashcards.html) | Leitner due-first | ⬜ |

**How:** Watch engine → speak trade-off → do not memorize landscape brand names (“Fable 5” / “GPT-5.x”) — speak **capability tiers**.

**Park:** Full multimodal/world-models survey; A2A deep dive (gap).

---

## 4. FastAPI / backend (25–30 min)

| Concept | Engine / page | Trap | Status |
|---------|---------------|------|--------|
| Verbal bank | [drill/interview-gotchas.html](fastapi-guide/drill/interview-gotchas.html) | Opening line + MissingGreenlet | ⬜ |
| Request lifecycle | [fastapi/index.html](fastapi-guide/fastapi/index.html) `reqtrace` | Validation before handler | ⬜ |
| DI | [fastapi/dependencies.html](fastapi-guide/fastapi/dependencies.html) | `Annotated` + yield cleanup | ⬜ |
| Async DB | [fastapi/async-db.html](fastapi-guide/fastapi/async-db.html) | MissingGreenlet / forgotten await | ⬜ |
| Lifespan / CORS | [fastapi/advanced.html](fastapi-guide/fastapi/advanced.html) `looplab` | lifespan ≠ on_event | ⬜ |
| Auth gist | [fastapi/auth.html](fastapi-guide/fastapi/auth.html) | signed ≠ encrypted; env secrets | ⬜ |
| Flashcards | [drill/index.html](fastapi-guide/drill/index.html) | status codes + concepts | ⬜ |

---

## 5. LangStack (15–20 min) — gotchas only

| Concept | Page / engine | Must say | Status |
|---------|---------------|----------|--------|
| Verbal bank | [ecosystem/interview-gotchas.html](langstack/ecosystem/interview-gotchas.html) | Opening line + HITL footgun | ⬜ |
| LCEL | [langchain/concepts.html](langstack/langchain/concepts.html) pipeviz | `prompt \| model \| parser` | ⬜ |
| Agent factory | LangChain `create_agent` (not deprecated `create_react_agent`) | middleware is the customization surface | ⬜ |
| HITL | [langgraph/concepts.html](langstack/langgraph/concepts.html) / advanced | `interrupt` re-runs node — side effects before interrupt are dangerous | ⬜ |
| Deploy name | advanced / ecosystem | **LangSmith Deployment** (was LangGraph Platform, Oct 2025) | ⬜ |

---

## Per-guide audit (modern practice)

### FastAPI Field Guide

**Coverage:** Python track → routing/validation/DI → SQLModel sync+async → OAuth2+JWT → lifespan/streaming/production → TestClient+Docker.

**Aligned with 2025–26:** Pydantic v2 methods, `Annotated`+`Depends`, lifespan, pwdlib+PyJWT, async SQLModel/Alembic.

**Bugs fixed this pass:** `session.query` → `session.exec(select(...))`; `include_router` missing `)`.

**Still add later:** return-type annotations alongside `response_model` polish; more production caching drills.

**Shipped:** Auth II (refresh/RBAC), async tests + compose, dedicated [interview gotchas](fastapi-guide/drill/interview-gotchas.html) page.

### Lang Stack

**Coverage:** LCEL, messages, tools, prod RAG, StateGraph, checkpointers, interrupts, multi-agent, LangSmith evals.

**Verified outdated (fixed this pass):** `create_react_agent` as recommended default → `create_agent` + middleware note; “LangGraph Platform” → LangSmith Deployment.

**Still add later:** MCP cross-link depth, context engineering (`trim_messages`) polish, Agent Server mental model.

**Shipped:** middleware lesson, interview gotchas bank, `create_agent` + LangSmith Deployment naming.

### GenAI Field Guide

**Coverage:** foundations→internals→prompting→tools/MCP→vectors→RAG→agents→FT/GRPO→serving→eval/RAGAS→safety→multimodal→production→interview kit.

**Risk:** speculative model brand names in landscape/model-table — use capability language in interviews.

**Nav nits:** ~~finetuning map should list GRPO page; production “three pages” vs four~~ — fixed (maps already list GRPO + four production pages).

**Engines:** do **not** rebuild attention heatmap / ragflow / servelab / sampling / vectors.

### DSA Field Guide

**Coverage:** foundations + 16 patterns + drills + cheatsheet (~54 worked problems).

**Gaps:** ~~permutations/N-Queens, prefix sums, monotonic queue~~ (shipped stretch).

**Shipped (senior wave):** Min Window, Meeting Rooms II, LRU/design, Dijkstra, Unique Paths / 2D DP, Python coding bank.

**Shipped (stretch):** [Subarray Sum Equals K](dsa-guide/patterns/arrays-hashing.html#subarray-sum-k), [Permutations](dsa-guide/patterns/backtracking.html#permutations) (+ N-Queens bridge note), [Sliding Window Maximum](dsa-guide/patterns/sliding-window.html#sliding-window-maximum).

### Aptitude & Reasoning

**Coverage:** quant (9) · reasoning (8) · verbal (4) · DI (3) · 125-Q bank · formula/flashcards.

**Gaps:** larger stretch pool only (nice-to-have).

**Shipped:** [geometry](aptitude-guide/quant/geometry-and-mensuration.html); [coded inequalities](aptitude-guide/reasoning/coded-inequalities.html); multi-set DI on [caselets](aptitude-guide/di/caselets-and-mixed-sets.html); harder RC stems on [reading comprehension](aptitude-guide/verbal/reading-comprehension.html).

---

## Engine inventory (static — do not rebuild)

| Engine | Path | Interview use |
|--------|------|---------------|
| Aptitude drill | `aptitude-guide/assets/js/drill.js` | Yes — primary OA |
| Aptitude flashcards | `…/flashcards.js` | Yes — Leitner-lite |
| DSA visualizer | `dsa-guide/assets/js/visualizer.js` | Yes |
| DSA pattern picker | `…/patternpicker.js` | Yes |
| DSA drill | `…/drill.js` | Yes |
| GenAI heatmap / ragflow / sampling / vectors / servelab | `genai-guide/assets/js/*` | Yes |
| GenAI quizdrill / flashcards | interview pages | Yes |
| FastAPI reqtrace / looplab / runpad / playground | `fastapi-guide/assets/js/*` | Yes |
| LangStack pipeviz / graphsim / tracelab | `langstack/assets/js/*` | Yes (short) |

---

## Progress / storage keys (`localStorage`)

| Guide | Progress | Cards | Notes |
|-------|----------|-------|-------|
| Aptitude | `apti-progress` | `apti-cards` | Leitner: `{ box, due }` per index |
| DSA | `dsa-progress` | — | |
| GenAI | `genai-progress` | `genai-cards` | Leitner |
| FastAPI | `fa-progress` | `fa-cards` | Leitner |
| LangStack | `lang-progress` | — | |
| Hub checklist | `su-today` | — | Interview-today checkboxes |
| Hub focus | `su-focus` | — | last track |

---

## Visual learning enhancements

**Already good:** analogy → SVG/viz → precise → quiz (Mayer dual-coding).

**Shipped this pass:** hub Interview-today path + progress strip; Leitner-lite on aptitude/genai/fastapi flashcards.

**Next densify (no new engine paradigm):** more `viz-config` / figbox / ragflow / reqtrace frames; whiteboard SVG strip; quiz-miss → lesson links everywhere.

**Do not build:** React SPA, FSRS/Anki sync, live LLM backends, XP gamification, mega search merge.

---

## Authoring engine / CLI

**Need:** thin **author-time** CLI — not a runtime site rewrite.

**Shipped:** [`bin/guide`](bin/guide)

```bash
./bin/guide status
./bin/guide verify [all|name]
./bin/guide build [all|name]      # gen (if present) → search-index → verify
./bin/guide new-page <guide> <module/slug>   # Tier-A fragment stub + note to edit manifest
```

**Tiers:** A fragment→gen (aptitude/devops/…) · B stub gen (genai) · C hand HTML (fastapi/dsa/langstack). Migrate C→A only when heavily editing.

**Keep** domain engines per guide. Extract shared verify/search later if copy-drift hurts.

---

## Do NOT do today

- Read every lesson in every guide
- Quote speculative model brand names
- Build new visual engines
- Start a separate DevOps learning repo (`devops-guide` exists)

---

## Phased backlog

### Done in this implementation pass

- [x] This audit + study map
- [x] Hub Interview-today + cross-guide progress
- [x] Leitner-lite flashcards (apti / genai / fa)
- [x] `bin/guide` CLI
- [x] FastAPI `session.query` + `include_router` fixes
- [x] LangStack `create_agent` + LangSmith Deployment naming
- [x] DSA Python coding-round bank
- [x] LangStack interview gotchas verbal bank
- [x] FastAPI interview gotchas verbal bank
- [x] Aptitude geometry & mensuration lesson
- [x] Aptitude coded inequalities lesson
- [x] Aptitude multi-set DI densify on caselets
- [x] Aptitude harder RC stems densify

### Still open

1. ~~GenAI: soften landscape brand names; fix finetuning/production module maps; HyDE cross-link~~ (done in senior wave)
2. ~~DSA: Min Window, Meeting Rooms, LRU, Dijkstra, 2D DP, fix Stock pattern label~~ (done)
3. ~~Aptitude: geometry + coded inequalities + multi-set DI + harder RC~~ (done)
4. ~~FastAPI: Auth II, async tests, compose+Postgres~~ (done)
5. ~~LangStack: middleware lesson, MCP cross-link, context engineering~~ (done)
6. ~~Densify viz captions / whiteboard~~ (done on key pages)
7. ~~DSA stretch: prefix sums, permutations/N-Queens bridge, monotonic deque~~ (done)

### Senior wave shipped

- [x] Hub Senior path (`su-senior`)
- [x] LangStack `langchain/middleware.html`
- [x] FastAPI Auth II + async tests + compose
- [x] DSA Min Window / Meeting Rooms II / LRU / Unique Paths / Dijkstra
- [x] GenAI capability-tier naming, MCP vs A2A, eval-in-CI, Q-bank prompts
- [x] Whiteboard strip (DSA + aptitude method)

---

## Senior path (4y+) · efficient refresh

Skip foundations. Engines first. Checklist also on [`index.html#senior-path`](index.html#senior-path) (`su-senior`).

| Block | Time | Open |
|-------|------|------|
| GenAI | 45m | [Attention](genai-guide/internals/attention-mechanism.html) → [workflows](genai-guide/rag/architectures-and-workflows.html) → [hybrid RAG](genai-guide/rag/hybrid-search-and-reranking.html) → [Q bank](genai-guide/interview/question-bank.html) → [RAG SD](genai-guide/interview/system-design/rag-chatbot.html) |
| LangStack | 35m | [Gotchas](langstack/ecosystem/interview-gotchas.html) → [Middleware](langstack/langchain/middleware.html) → [HITL advanced](langstack/langgraph/advanced.html) → [evals](langstack/langsmith/evals.html) |
| FastAPI | 40m | [Gotchas](fastapi-guide/drill/interview-gotchas.html) → [DI](fastapi-guide/fastapi/dependencies.html) → [async DB](fastapi-guide/fastapi/async-db.html) → [Auth II](fastapi-guide/fastapi/auth.html#auth-ii) → [async tests](fastapi-guide/deploy/index.html#async-tests) |
| DSA | 50m | [Pattern map](dsa-guide/patterns/index.html) → [Python bank](dsa-guide/reference/python-coding-round.html) → [Min Window](dsa-guide/patterns/sliding-window.html#min-window) → [SW Maximum](dsa-guide/patterns/sliding-window.html#sliding-window-maximum) → [LRU](dsa-guide/patterns/design.html) → [Prefix sum K](dsa-guide/patterns/arrays-hashing.html#subarray-sum-k) → [Permutations](dsa-guide/patterns/backtracking.html#permutations) |

---

## Post-mortem (fill after interview)

- Missed visuals / questions to author next:
- Rounds that felt thin:
- Pages to promote into hub Interview-today:
