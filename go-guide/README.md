# Go — a visual guide

A sharp, **visual**, diagram-first guide to **Go** (currency: **Go 1.26 era**) for backend engineers and interviews. Every idea is given **twice**: a plain-English analogy first, then the precise mechanic — with runnable **gopad** snippets, steppers, and concurrency labs. Nine modules, **55** lessons: language core → concurrency centerpiece → stdlib/HTTP → testing & runtime.

## Open it
- Just open `index.html` in a browser, **or**
- From the **repo root** (`self-upgrade/`): `python3 -m http.server` then visit `http://localhost:8000/go-guide/` (so in-site search + progress behave like production).

Works fully offline (Google Fonts degrade gracefully to system fonts). Dark/light theme toggle and per-lesson progress persist in your browser.

## What's inside
- **Getting started** — why Go, toolchain & modules, program anatomy, vars/zeros, control flow
- **Language core** — slices, maps, strings/runes, structs, pointers, errors/defer, error patterns
- **Types & interfaces** — methods, interfaces, nil trap, assertions, Stringer/sort, reflection
- **Generics & modern Go** — type params, generic stdlib, iterators (1.23), pitfalls
- **Concurrency** — goroutines, G-M-P, channels, select, sync, atomics, context, patterns, errgroup, races
- **Standard library** — encoding/json (`omitzero`), time, io/bufio, files/os, slog, tour
- **HTTP services** — net/http 1.22 router, middleware, clients, JSON APIs, production shutdown
- **Testing & tooling** — table tests, mocks/seams, benchmarks, fuzzing, **synctest**, vet/modules belt
- **Runtime** — escape analysis, GC, pprof, performance patterns, cgo/unsafe
- **Interview + reference** — question bank, machine-coding, cheatsheet, flashcards, timed drills, gotchas

## Interactive
`gopad` · `slicelab` · `deferstack` · `goroutinelab` · `chanlab` · `conviz` · `escapeview` · `gclab` · flashcards · timed drills · in-site search · per-lesson progress. All dependency-free, theme-aware, and offline.

## Editing / regenerating
Content lives as **section-only fragments** in `tools/content/<dir>-<slug>.html`. The site map is `tools/manifest.js`. After editing:

```bash
# from repo root
./bin/guide build go-guide
# or from this directory:
node tools/gen.js
node tools/build-search-index.js
node tools/verify.js
```

Authoring rules and component/engine markup: **`tools/AUTHORING.md`**.
