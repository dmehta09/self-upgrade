# Enhancement audit · 2026-09-11

**Scope:** [`lld-guide`](lld-guide/) · [`sysdesign-guide`](sysdesign-guide/) · [`devops-guide`](devops-guide/) · [`observability-guide`](observability-guide/) · [`go-guide`](go-guide/)  
**Lens:** mid-senior curriculum depth and currency — **not** interview-day prep  
**Rules:** engines first where they already exist · concept modules over more Q-banks · sibling handoffs get real `href`s  
**Serve from repo root:** `python3 -m http.server` in `self-upgrade/`

---

## Executive verdict

| Guide | Score | Role | Verdict |
|-------|-------|------|---------|
| **lld-guide** | 8/10 applied LLD | Machine-coding + patterns | Strong engines/drills; finish GoF + orphan drills + engine thin pages |
| **sysdesign-guide** | 8.5/10 HLD curriculum | Foundations + 25 cases | Expert SaaS cases excellent; mid-senior **theory modules** thin (consistency, CQRS, multi-region, cost/security) |
| **devops-guide** | 7.5/10 delivery primer | AWS-first DevOps | Great mental models; thin on **platform eng, K8s packaging/security, CI productization**, clickable obs handoffs |
| **observability-guide** | 8/10 L/M/T + SLO | Classic obs stack | Core stack current; 2026 gaps: **Profiles, GenAI telemetry, exemplars/OpenMetrics, alert design** |
| **go-guide** | 8.5/10 language curriculum | Go 1.26-era | Content largely complete; fix **meta (wrong README)**, tip-only modern APIs (`omitzero`, synctest, modules depth) |

**Overall:** All five are shippable field guides. Enhancement is close curriculum holes and currency — not rewrites.

---

## Cross-cutting themes

1. **Theory pulled up vs buried in cases** — sysdesign CQRS/MR; devops platform; obs Profiles/GenAI.
2. **Sibling handoffs without links** — devops↔obs soft callouts; lld↔sysdesign/aposd missing.
3. **Engine/drill coverage lagging prose** — lld + sysdesign.
4. **Currency nits** — Go README/`omitzero`; TF S3 lock; obs AUTHORING Profiles ban.
5. **Interview surfaces already heavy** — put effort into concept modules, not more Q-banks.

---

## Implementation waves

| Wave | Focus | Status |
|------|--------|--------|
| **A** | go-guide P0 (README, omitzero, synctest, modules) | ✅ |
| **B** | observability P0 (Profiles, GenAI, exemplars) + devops obs handoff links | ✅ |
| **C** | devops Platform Eng + K8s packaging/security + CI OIDC | ✅ |
| **D** | sysdesign consistency + CQRS + multi-region foundations | ✅ |
| **E** | lld orphan drills + GoF finish + engine thin pages | ✅ |

---

## 1. LLD Field Guide (`lld-guide/`)

**Tier:** C hand-HTML · ~33 pages · 30 lessons · 14 drills · engines: fsm, patternflow, concurrency, umlx

### Strengths
Analogy→UML→code; serious 45-min drill bank; advanced concurrency cases (rate limiter, KV, scheduler).

### Gaps
- GoF incomplete: Mediator, Memento, Visitor, Interpreter
- Orphan cases (no drill): file-system, pub/sub, ride-hailing
- Engine starvation: ride-hailing, file-system, LRU
- No flashcards / verbal bank; weak bridges to aposd / sysdesign
- Home IA copy (“five modules”) vs Advanced + Drill; glossary Back nav

### Backlog

**P0**
1. Drills for file-system, pub/sub, ride-hailing — [`assets/js/drill-bank.js`](lld-guide/assets/js/drill-bank.js)
2. Engines on [`advanced/ride-hailing.html`](lld-guide/advanced/ride-hailing.html), [`advanced/file-system.html`](lld-guide/advanced/file-system.html), [`advanced/lru-cache.html`](lld-guide/advanced/lru-cache.html)
3. Finish GoF in [`patterns/behavioral.html`](lld-guide/patterns/behavioral.html) (+ glossary picker)
4. IA/nav: home arc, glossary Back/Next, brand subtitle, README path

**P1** — Tic-Tac-Toe / meeting-room / cart cases; exercises on SOLID/patterns; testing-LLD lesson; aposd/sysdesign callouts; case→drill CTAs  
**P2** — flashcards; verbal bank; interactive pattern picker; Tier-A migration

---

## 2. System Design Field Guide (`sysdesign-guide/`)

**Tier:** fragment gen · 43 lessons · 25 cases · 8 engines · 15/25 drills

### Strengths
7-step framework; modern canon (LLM, cells, Zanzibar, Temporal); checkout/payments depth.

### Gaps
- Consistency ~65 lines — no linearizability / session guarantees lab
- No first-class CQRS / outbox / saga module
- No multi-region / DR, resilience, cost, security HLD foundations
- Case coda uneven; failsim rare; drills miss 10 cases; path skips Expert

### Backlog

**P0**
1. Expand [`tools/fragments/fundamentals__consistency.html`](sysdesign-guide/tools/fragments/fundamentals__consistency.html)
2. New CQRS/async-patterns + multi-region foundation fragments; register in gen/lessons
3. Uniform case coda (MR · cost · security · obs) on thin cases
4. failsim on chat / feed / YouTube / Uber

**P1** — resilience page; cost fundamentals; security HLD primer; fill drill bank; nav Core vs Expert paths  
**P2** — typeahead / ticket / collab-doc cases; observability foundation; journey on more cases

---

## 3. DevOps Field Guide (`devops-guide/`)

**Tier:** A · ~30 pages · 23 concept lessons · 5 engines

### Strengths
Delivery spine; AWS + OIDC/IRSA; DevSecOps overview; clean obs boundary.

### Gaps
- Platform Engineering name-only
- K8s: no Helm/Kustomize, RBAC/NetworkPolicy/PSA
- CI productization thin; obs callouts without hrefs
- TF DynamoDB lock as default vs S3 native locking

### Backlog

**P0**
1. New `platform/` module (IDP, golden paths, catalog)
2. [`kubernetes/helm-and-kustomize`](devops-guide/) + [`kubernetes/security-and-policy`](devops-guide/)
3. CI auth/reuse (OIDC, environments, reusable workflows)
4. Deploy-health handoff page with real links into observability-guide
5. S3 native lock currency in IaC Terraform practice

**P1** — progressive delivery depth; PVC/autoscaling; Checkov/Atlantis; Kyverno/Gatekeeper  
**P2** — FinOps; service mesh primer; multi-cluster GitOps; Crossplane note

---

## 4. Observability Field Guide (`observability-guide/`)

**Tier:** A · 39 pages · 35 lessons · 5 engines

### Strengths
L/M/T + OTel + Prom + multi-window burn-rate; cardinality/sampling engines; June 2026 stack facts.

### Gaps
- AUTHORING forbids Profiles module
- GenAI/`gen_ai` name drops only
- OpenMetrics / exemplars not lessons
- Alert design / SRE practice / eBPF thin

### Backlog

**P0**
1. Profiles page/module; update [`tools/AUTHORING.md`](observability-guide/tools/AUTHORING.md)
2. [`otel-genai-observability`](observability-guide/) page (+ genai-guide cross-link)
3. Exemplars + cross-signal linking page

**P1** — OpenMetrics; alert-design lesson; SRE practices; eBPF primer; Collector processors  
**P2** — wide events; RUM/synthetics; OTel metrics temporality; baggage depth

---

## 5. Go Field Guide (`go-guide/`)

**Tier:** A · 61 pages · 54 lessons · 9 engines · Go 1.26 claim

### Strengths
Full map wired; concurrency centerpiece; real 1.22–1.23 anchors; errors + HTTP production solid.

### Gaps
- Root README is an APOSD paste
- `omitzero` (1.24) absent
- `testing/synctest` tip-only; modules/`go.work`/`toolchain` thin
- Callout-only: `WaitGroup.Go`, context helpers, slog depth, `sync.Map`

### Backlog

**P0**
1. Rewrite [`go-guide/README.md`](go-guide/README.md)
2. `omitzero` in [`tools/content/stdlib-encoding-json.html`](go-guide/tools/content/stdlib-encoding-json.html)
3. Dedicated synctest lesson
4. Modules depth in toolchain / tooling

**P1** — `WaitGroup.Go` primary idiom; context APIs with code; slog production; `sync.Map`; mux edge cases  
**P2** — `iter.Pull` lab; execution tracer section; singleflight in patterns

---

## Suggested sequencing

1. Wave A (Go) — fast currency/meta  
2. Wave B (Obs + devops handoffs) — cross-guide coherence  
3. Wave C (DevOps platform/K8s/CI) — biggest devops delta  
4. Wave D (Sysdesign theory modules) — mid-senior HLD hole  
5. Wave E (LLD drills/GoF/engines) — applied LLD closeout  

Leave `error.json` untracked. Small thematic commits per wave.

---

## Post-mortem

- Pages that still feel thin after waves:
- Engines that need a second pass:
- Sibling links still soft:
