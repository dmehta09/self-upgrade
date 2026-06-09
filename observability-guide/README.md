# Observability Field Guide

A sharp, **visual**, interview-prep guide to observability for working software engineers — logs, metrics, traces, OpenTelemetry, Prometheus & Grafana, and SLOs. Every concept leads with a plain-English analogy, then the precise version, with **interactive diagrams you can poke at** and per-page interview Q&A. Static HTML, no build step at runtime, **opens offline**. Current to **June 2026**.

## View it

Open `index.html` in a browser — it works straight from `file://`. For the in-site search and progress to behave exactly like production you can also serve it:

```bash
cd observability-guide
python3 -m http.server 8000   # then open http://localhost:8000
```

## What's inside

7 content modules + an interview hub (35 lessons, 39 pages):

- **Foundations** — monitoring vs observability, the three pillars, cardinality & cost, the 2026 stack (OSS + vendors)
- **Logs** — structured logging, correlation IDs, Loki & cheap pipelines
- **Metrics** — the four metric types, RED & USE, histograms & percentiles
- **Traces** — spans & context propagation, the critical path, sampling
- **OpenTelemetry** — API/SDK/Collector, auto vs manual instrumentation, semantic conventions
- **Prometheus & Grafana** — the pull model, PromQL, dashboards, Alertmanager
- **SLO / SLI** — SLI vs SLO vs SLA, error budgets, multi-burn-rate alerting
- **Interview hub** — a question bank, debugging scenarios, a cheat-sheet, flashcards, and a glossary

### Interactive engines

Five custom, dependency-free, theme-aware visualizers (plus flashcards): a **distributed-trace waterfall** (`trace-waterfall.js`), a **metrics lab** (`series-lab.js` — metric types / cardinality blow-up / histogram percentiles), an **error-budget engine** (`budget-burn.js` — burndown + burn-rate), a **trace-sampling explorer** (`sampling-viz.js`), and a **PromQL explorer** (`query-explorer.js`). Each reads inline JSON config and degrades to a static fallback with JS off.

## How it's built

The site is generated from a single manifest — no runtime dependencies.

```
tools/manifest.js          # single source of truth: modules, pages, lesson ids, sidebar, widgets
tools/content/<page>.html  # one content fragment per page (just the <section>s)
tools/gen.js               # wraps fragments in the shared shell; AUTO-generates the
                           #   right-rail TOC, prev/next nav, and "mark as learned" button;
                           #   (re)writes assets/js/lessons.js
tools/build-search-index.js# crawls the generated HTML -> assets/js/search-index.js
tools/verify.js            # link/anchor/asset/escaping/JSON/engine-wiring checks (the gate)
tools/AUTHORING.md         # the authoring contract (voice, components, engine config shapes, June-2026 facts)
```

### Add or edit a page

1. (New page) add it to `tools/manifest.js` under the right module, with a stable lesson `id` and any `widgets`.
2. Write the fragment to `tools/content/<dir-with-dashes>-<slug>.html` — **only the `<section>`s** (see `tools/AUTHORING.md`). The generator adds the shell, TOC, nav, and complete button.
3. Rebuild:

```bash
node tools/gen.js              # assemble pages (use --force to also rewrite stubs)
node tools/build-search-index.js
node tools/verify.js           # must print "✓ No problems found."
```

## Conventions

- **Diagrams-first, minimal code.** Code/config snippets are short and illustrative (Python by default; PromQL/YAML where it teaches something).
- Per-module accent colors via `[data-tool="…"]` in `assets/css/theme.css`; custom-engine styles live in `assets/css/observability.css`.
- Progress, theme, and flashcard state are stored in `localStorage` under `obs-*` keys (isolated from sibling guides).
- Escape `<`/`>` as `&lt;`/`&gt;` inside any `<code>` (the verifier enforces it).

Built to open offline · June 2026.
