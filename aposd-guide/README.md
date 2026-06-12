# A Philosophy of Software Design

A sharp, **visual**, crisp guide to John Ousterhout's *A Philosophy of Software Design* (APOSD) — **not** a comprehensive re-telling, just the ideas that move the needle. Every concept is given **twice**: a plain-English analogy first, then the precise technical version, backed by short **Python** examples and **before→after refactors** you can flip through. 14 punchy lessons across 4 modules.

> Where ideas overlap object-oriented & low-level design (deep modules ↔ SRP, the trends ↔ GoF patterns), lessons carry a light **"see also"** link into the sibling **`lld-guide`** (Design Field Guide). This guide stays focused on the book.

## Open it
- Just open `index.html` in a browser, **or**
- `python3 -m http.server` then visit `http://localhost:8000` (so in-site search + progress behave exactly like production).

Works fully offline (Google Fonts degrade gracefully to system fonts). Dark/light theme toggle and per-lesson progress persist in your browser.

## What's inside (17 pages · 14 lessons)
- **Complexity — the enemy** — what complexity is (change amplification, cognitive load, unknown unknowns); strategic vs tactical programming
- **Deep modules — the core move** — deep vs shallow; information hiding & leakage; general-purpose interfaces; different layer, different abstraction; pull complexity down / together-or-apart
- **Everyday craft** — define errors out of existence; comments (why & what, comments-first); names, consistency & obvious code; modifying existing code
- **Judgment** — design it twice · a level-headed take on trends (OOP/agile/TDD/patterns/AI-assisted coding); performance & deciding what matters; the red-flags playbook
- **Reference** — the red-flags cheatsheet (every smell + a one-line fix) and flashcards

## Interactive
`refactor` (the before→after viewer — flip shallow→deep, tactical→strategic, leaky→hidden, obscure→obvious) · `flagspot` (click the smelly line, name the red flag) · `decay` (tactical vs strategic absorbing the same change requests — watch the crossover) · `depthgauge` (interface cost vs functionality) · `flashcards` (principles & red flags) · in-site search · per-lesson progress. All dependency-free, theme-aware, and offline.

## Editing / regenerating
Content lives as **section-only fragments** in `tools/content/<dir>-<slug>.html`. The site map is `tools/manifest.js`. After editing:

```bash
node tools/gen.js                # assemble pages from fragments (+ lessons.js)
node tools/build-search-index.js # rebuild the search index
node tools/verify.js             # validate links, anchors, escaping, JSON, wiring
```

Authoring rules and component/engine markup: **`tools/AUTHORING.md`**.
