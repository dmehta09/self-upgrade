# Frontend Field Guide

A sharp, visual, **interview-ready** guide to modern pro frontend — React 19, Next.js 16 (App Router), Vite, Tailwind v4, shadcn/ui, plus data/state, performance, testing, and shipping. Current to **June 2026**.

It's a static site: hand-tuned HTML/CSS/vanilla-JS, **no build step, no dependencies, opens offline** from `file://`. It *teaches* React/Next via animated visualizers + annotated, copyable code (it does not run React itself).

## Open it

Just open `index.html` in a browser. For a nicer dev loop (avoids any `file://` quirks):

```bash
cd frontend-guide
python3 -m http.server   # then visit http://localhost:8000/
```

Press `/` (or ⌘/Ctrl-K) anywhere to search. Toggle light/dark, top-right. Progress is saved in your browser.

## What's inside

A roadmap home (Junior → Mid → Senior) + 8 modules + an interview hub (47 pages):

`foundations` (incl. advanced TypeScript) · `react` · `nextjs` · `styling` · `data` · `perf` · `testing` · `ship` (incl. frontend security: XSS, CSP & CSRF) · `interview` (question bank, cheat-sheets, flashcards, timed drills, design-round scenarios incl. a realtime live feed).

Every topic page runs **fundamentals → pro** in one page: an analogy first, then the precise version, a visual, 2–3 worked examples, gotchas, a quiz, and inline "say it out loud" interview Q&A.

### Interactive engines (vanilla JS, `assets/js/`)
- **render-viz** — render → reconcile → commit; which nodes re-render; how `memo` prunes.
- **effect-timeline** — `useEffect` across mount / dep-change / unmount (cleanup-before-rerun).
- **rsc-boundary** — toggle `"use client"`; watch the server/client split + JS-bundle meter.
- **waterfall-viz** — CSR vs SSR vs streaming vs SSG/ISR request timelines.
- **tw-playground** — type Tailwind utilities, see them apply (offline, curated subset).
- **bugspot** — click the buggy line in a TSX snippet (stale closure, identity, effect races, XSS sinks); name the bug, see the fix.
- **cachelab** — a TanStack Query cache entry from mount to garbage collection (`staleTime`/`gcTime`, background refetch).
- **a11ylens** — toggle div-soup vs semantic markup and compare the computed accessibility trees.
- **quizdrill** — timed chip-quiz drills (`interview/drills.html`): *server or client?*, *pick the tool*, *debug it* — 30–45 s per question, designed-in trap answers, misses link back to the owning lesson, best scores persist in `localStorage["fe-drill"]`.
- Plus reused `flashcards.js`, the `.quiz`, search, and progress engines.

## Architecture

Pages are **assembled** by a tiny dev-time generator from a single manifest + per-page content fragments — so the sidebar, lesson registry, search index, and verifier stay in lockstep. Output is plain static HTML.

```
index.html, <module>/*.html, interview/**/*.html   # generated pages (open these)
assets/css/  styles.css · theme.css · frontend.css
assets/js/   main, search, progress, visualizer, flashcards + the 8 engines + generated lessons.js, search-index.js
tools/       manifest.js · gen.js · build-search-index.js · verify.js · AUTHORING.md · content/ (source fragments)
```

### Regenerate / edit

Edit a page by editing its fragment in `tools/content/<data-page>.html` (e.g. `react-render-and-rerender.html`), then:

```bash
node tools/gen.js                 # assemble pages + rewrite lessons.js
node tools/build-search-index.js  # rebuild the offline search index
node tools/verify.js              # check links, anchors, assets, escaping, engine wiring, JSON configs
```

To add a page, add it to `tools/manifest.js` (folder = `data-tool` = module), then run the three commands above.

## Conventions
- Per-module accent via `<body data-tool="…">`; cyan is the brand.
- Code blocks set `data-lang` (`tsx`/`ts`/`bash`/…); JSX `<`/`>` are escaped as `&lt;`/`&gt;` (verifier enforces).
- Authoring rules, the component library, engine config shapes, and the verified June-2026 version facts live in `tools/AUTHORING.md`.
