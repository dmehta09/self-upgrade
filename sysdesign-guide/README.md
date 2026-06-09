# The System Design Field Guide

A visual, interview-focused guide to **high-level system design (HLD)** — the core
concepts and the famous case studies — built as a static, offline, zero-dependency
website. Open `index.html` in any browser; nothing to install.

Part of the [`self-upgrade`](../README.md) workspace of learning guides; shares the
house "ink + blueprint" design system with its siblings (`dsa-guide`, `lld-guide`, …).

## What's inside

Two tracks, 41 lessons:

- **Foundations** (17) — *Fundamentals* (estimation, latency numbers, availability/SLAs,
  CAP/PACELC), *Building blocks* (load balancing, API gateway, CDN, caching, queues),
  and *Data at scale* (SQL vs NoSQL, indexing, sharding, replication, consensus &
  leader election, consistent hashing).
- **Case studies** (23, +1 playbook) — warm-up (URL shortener, rate limiter, unique-ID),
  core (distributed cache, web crawler, notifications, news feed, file sync, chat),
  advanced (Uber, YouTube, payments, LLM serving, vector search), and **expert** —
  SaaS/platform & product systems (multi-tenancy, user management, organizations & teams,
  authentication, authorization, e-commerce catalog + checkout, billing & metering, audit
  log). Together they cover the full core-concept set with little overlap.
- **Reference** — a glossary and a one-page cheat sheet (numbers, formulas, the 7-step
  method, and the best external resources).

Every idea is explained twice — a plain-English analogy, then the precise technical
version — and grounded in current (June 2026) interview canon.

## The interactive engines

Four data-driven visual tools (vanilla JS, no deps, work at `file://`, honor
`prefers-reduced-motion`):

| Engine | File | What it does |
|---|---|---|
| Request-flow player | `assets/js/reqflow.js` | Animates a request hop-by-hop through an architecture (`.reqflow` + JSON config). |
| Capacity calculator | `assets/js/capacity.js` | Live back-of-the-envelope QPS / storage / servers (`.calc` + presets). |
| Trade-off explorer | `assets/js/tradeoff.js` | Segmented slider → animated dimension bars (`.tradeoff`). |
| Frames visualizer | `assets/js/visualizer.js` | Step-through array/grid/tree/graph animations (`.viz`), reused from `dsa-guide`. |

## Project layout

```
sysdesign-guide/
├── index.html                 # home (hand-authored)
├── assets/
│   ├── css/{styles,theme}.css  # shared tokens + this guide's accents & engine styles
│   └── js/                     # lessons, search, progress, main + the 4 engines
├── fundamentals/  blocks/  data/        # Foundations track
├── warmup/  core/  advanced/            # Case studies track
├── reference/                  # glossary + cheat sheet
└── tools/
    ├── gen.js                  # wraps tools/fragments/*.html in the shared shell
    ├── fragments/              # per-page content (the source you edit)
    ├── build-search-index.js   # regenerates assets/js/search-index.js
    └── verify.js               # link / anchor / asset / wiring checker
```

## Editing & building

Content pages are generated from fragments so the shared shell (sidebar, scripts,
TOC, prev/next) stays identical everywhere.

```bash
# 1. edit a page's content in tools/fragments/<dir>__<page>.html
# 2. regenerate the HTML pages
node tools/gen.js
# 3. rebuild the search index
node tools/build-search-index.js
# 4. verify links, anchors, assets, and lesson wiring
node tools/verify.js
# 5. preview
python3 -m http.server 8000   # then open http://localhost:8000/
```

The home page (`index.html`) is hand-authored and not produced by `gen.js`.

_Content verified June 2026._
