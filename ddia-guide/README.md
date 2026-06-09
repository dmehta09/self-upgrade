# Designing Data-Intensive Applications

A sharp, **visual**, crisp guide to Martin Kleppmann's *Designing Data-Intensive Applications* (DDIA) — **not** a comprehensive re-telling, just the ideas that move the needle. Every concept is given **twice**: a plain-English analogy first, then the precise technical version, backed by **diagrams and trade-off tables** (the book's level), with short **Python** only where an algorithm makes it click.

> **Built in parts.** DDIA is a big book (3 parts, 12 chapters), so this guide ships **phase by phase**. The scaffold holds the whole roadmap from day one; each phase fills in more chapters.
>
> **Phase 1 (now): Part I · Foundations, chapters 1–2** — *Reliable, scalable & maintainable* and *Data models & query languages*. The home page shows the full 3-part roadmap with the rest marked **“soon.”**

Where topics overlap high-level system design (replication, partitioning, consistency, CAP), lessons carry a light **“see also”** link into the sibling **`sysdesign-guide`**.

## Open it
- Just open `index.html` in a browser, **or**
- `python3 -m http.server` then visit `http://localhost:8000` (so in-site search + progress behave exactly like production).

Works fully offline (Google Fonts degrade gracefully to system fonts). Dark/light theme toggle and per-lesson progress persist in your browser.

## What's inside (Phase 1)
- **Part I — Foundations** — Reliable, scalable & maintainable (faults vs failures; percentiles & tail-latency amplification; operability/simplicity/evolvability); Data models & query languages (relational vs document vs graph; the impedance mismatch; schema-on-read vs schema-on-write; declarative vs imperative)
- **Reference** — a Decisions & trade-offs cheatsheet (each recurring choice + a one-line heuristic) and flashcards

## Interactive
`ddia-viz` (the guide's own engine — a **data-model explorer** that shows the same entity as relational ⇄ document ⇄ graph, and a **percentiles** scene that makes p50/p95/p99 and tail-latency amplification tangible) · reused `tradeoff` slider · `flashcards` · in-site search · per-lesson progress. All dependency-free, theme-aware, and offline.

## Editing / regenerating
Content lives as **section-only fragments** in `tools/fragments/<dir>__<slug>.html` (double-underscore = path separator). The site map is inline in `tools/gen.js` (`PAGES`/`MOD`/`NAV`); the lesson registry is `assets/js/lessons.js`; the search file list is in `tools/build-search-index.js`. After editing:

```bash
node tools/gen.js                # assemble pages from fragments (sidebar, TOC, nav, "mark learned")
node tools/build-search-index.js # rebuild the search index
node tools/verify.js             # validate links, anchors, escaping, lesson wiring
node tools/reverify.js           # deep cross-checks: gen ↔ lessons ↔ fragments ↔ search, JSON configs, drift
```

### Adding the next phase
1. Add fragment(s) under `tools/fragments/` (e.g. `foundations__storage-engines.html`).
2. Append the page(s) to `PAGES` and the sidebar group to `NAV` in `tools/gen.js`.
3. Append the lesson(s) to `window.LESSONS` in `assets/js/lessons.js`.
4. Add the file(s) to `FILES` in `tools/build-search-index.js`.
5. On the home page, flip the matching **“soon”** items into real links.
6. Re-run the four commands above. `reverify.js` counts are derived, so it stays green.

Authoring rules and component/engine markup: **`tools/AUTHORING.md`**.
