# DevOps Field Guide — regeneration spec

Paste this to rebuild the guide from scratch. It encodes every decision already made. The authoritative content contract is **`tools/AUTHORING.md`** — read it before writing any page.

## What this is
A sharp, crisp, **visual** interview-prep guide to the **modern pro DevOps engineer journey, basic → pro, as of June 2026**. NOT comprehensive — every concept gets a plain-English analogy, a diagram/engine, multiple short examples, and the trade-off an interviewer probes. Built to **crack interviews** (per-page rapid-fire + a dedicated interview hub).

## Knobs (the decisions)
- **Audience:** software engineer, ~3–4 yrs, prepping DevOps interviews; visual learner.
- **Cloud:** **AWS-first** — teach via concrete AWS services; one-line GCP/Azure equivalents only where they aid transfer.
- **Voice:** analogy-first → technical → visual; both technical AND layman; 2–3 examples per concept; crisp (≤60-word lead ideas; 4–6 sections/page).
- **Scope:** ~30 pages (9 content modules + interview hub + reference).
- **As-of:** June 2026 (see `tools/AUTHORING.md` §4 for the version facts).
- **Observability boundary (HARD):** do NOT re-cover logs/metrics/traces/OpenTelemetry/Prometheus/PromQL/Grafana/SLO-math/burn-rate/sampling — those live in the **sibling `observability-guide`**. Cover only the DevOps side (pipelines, infra, deploys, the human/process side of reliability) and cross-link.
- **Languages:** domain-native — YAML, Dockerfile, HCL (Terraform), Bash, JSON, Python. Static, copyable, no in-browser execution.

## Architecture (tool-driven, offline static site)
Clone the newest sibling pattern. No runtime build, no dependencies; opens at `file://` or via `python3 -m http.server`.
- `tools/manifest.js` — single source of truth: MODULES + INTERVIEW_PREP + REFERENCE, each page's `{slug,title,nav,id,widgets}`.
- `tools/gen.js` — wraps section-only fragments from `tools/content/<dir>-<slug>.html` in the shared shell; AUTO-generates the right-rail TOC, prev/next nav, and the "Mark as learned" button; regenerates `assets/js/lessons.js`. There are **no module-overview pages** (crisp): the home page carries the module map.
- `tools/build-search-index.js` — crawls HTML → `assets/js/search-index.js` (works at `file://`).
- `tools/verify.js` — validates links/anchors/assets, escaped `<` in code, valid inline JSON, engine wiring, lesson registry.
- Build: `node tools/gen.js && node tools/build-search-index.js && node tools/verify.js` → expect `✓ No problems found.`

## Design system
- Fonts: Fraunces (display), Hanken Grotesk (body), JetBrains Mono (code). Dark-first + warm-paper light theme; toggle persisted to `localStorage["devops-theme"]`.
- `assets/css/styles.css` (shared design system), `assets/css/theme.css` (brand + per-module accents + search/progress components), `assets/css/devops.css` (Q&A, versus, journey, home cards, flashcards, and the engines).
- Per-module accent via `<body data-tool="<module>">`: foundations(sky) · linux-networking(emerald) · cicd(violet) · containers(blue) · kubernetes(indigo) · iac(purple) · aws(orange) · delivery(rose) · platform(amber) · operate(teal) · interview(cyan).
- localStorage namespace: `devops-progress`, `devops-theme`, `devops-cards`.

## Interactive engines (`assets/js/`)
- `reqflow.js` (`.reqflow`) — animated topology/pipeline player (CI/CD, VPC path, K8s routing, GitOps loop).
- `deploy-viz.js` (`.deployviz`) — release-strategy player: pods flip old→new while a traffic bar tracks the split (recreate/rolling/blue-green/canary).
- `tradeoff.js` (`.tradeoff`) — segmented slider → dimension bars.
- `capacity.js` (`.calc`) — back-of-envelope sizing calculator.
- `flashcards.js` (`.flashdeck`) — spaced-repetition flip cards.
- Shared (always-on): `main.js` (theme, nav, quizzes, copy, reveal, multi-language highlighter incl. YAML/Dockerfile/HCL), `search.js`, `progress.js`, generated `lessons.js` + `search-index.js`.

## Page map (~30 pages)
- **Foundations:** what-is-devops · lifecycle-and-toolchain (reqflow) · dora-and-delivery-metrics (tradeoff)
- **Linux & Networking:** linux-for-devops · networking-for-devops (reqflow)
- **Git & CI/CD:** git-and-branching · continuous-integration (reqflow) · continuous-delivery (reqflow)
- **Containers:** images-and-dockerfiles · running-containers (tradeoff)
- **Kubernetes:** k8s-mental-model (reqflow) · core-objects (reqflow) · workloads-and-scaling
- **Infrastructure as Code:** iac-and-terraform-model · terraform-in-practice
- **AWS for DevOps:** compute-and-networking (reqflow + calc) · containers-and-serverless · iam-storage-data
- **Deploy strategies & GitOps:** release-strategies (deploy-viz) · gitops-progressive-delivery (reqflow + tradeoff)
- **Reliability & Security:** incident-response · postmortems-and-resilience · devsecops-essentials
- **Interview hub:** index (method) · question-bank (~55 Q&A) · scenarios (reqflow + deploy-viz) · cheat-sheet · flashcards
- **Reference:** glossary
- **Home:** `index.html` — hero, progress dashboard, junior→pro journey, module map.

## Per-page recipe
Hero (no id) + 4–6 id'd sections, last `id="interview"`. Required: one `.callout analogy` ("In plain English"), one primary visual (assigned engine or static `.diagram`/`.flow`/`.steps`/`.versus`/`.table-wrap`/`.kv`), ≥1 `.callout gotcha`, ≥1 `.quiz`, and 2–3 `details.qa` with a "Say it out loud" callout + difficulty chip. Escape `<`/`>` in all `<code>`. See `tools/AUTHORING.md` for exact component + engine markup.
