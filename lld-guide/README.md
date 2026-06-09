# The Design Field Guide

A visual, beginner-first learning site for **object-oriented programming and low-level
design (LLD)** — taught in **Python**, from the four pillars through SOLID and the
Gang-of-Four design patterns to full, interview-style design case studies.

Every idea is explained **twice**: first with a plain-English analogy, then precisely with
real Python you can read. It's a static site with **zero build step and no dependencies** —
pure HTML, CSS, and vanilla JavaScript. It's the sibling of `../langstack` and
`../fastapi-guide` and reuses their design system.

## Quick start

**Option A — just open it.** Double-click `index.html` (or open it in your browser).
Everything works offline.

**Option B — serve it locally** (recommended if your browser is strict about `file://`):

```bash
cd lld-guide
python3 -m http.server 8000
# then open http://localhost:8000/
```

## What needs an internet connection?

Almost nothing — the site is offline-first and has **no code runner** (all examples are
shown with their expected output inline). Only one thing reaches the network:

| Feature | Needs internet? | If offline |
|---|---|---|
| Pages, search, progress, quizzes, exercises, diagrams | No | Work fully |
| Google Fonts | Optional | Falls back to system fonts |

## What it covers

- **OOP fundamentals** — objects vs classes, the four pillars (encapsulation, abstraction,
  inheritance, polymorphism), and class relationships with readable UML.
- **SOLID** — coupling/cohesion, code smells, and the five principles with before/after Python.
- **Design patterns** — the GoF catalog grouped into creational, structural, and behavioral —
  each with intent, analogy, UML, Python, and the **Pythonic shortcut**.
- **LLD case studies** — a repeatable interview method, then worked solutions: a parking lot,
  a vending machine (State pattern), and a notification service (Observer + Strategy + Factory).
- **Reference** — a glossary, a "which pattern?" picker, a SOLID cheatsheet, and the UML legend.

## Project structure

```
lld-guide/
├── index.html                  # Home: learning arc, module cards, progress dashboard
├── assets/
│   ├── css/styles.css          # Base design system (shared with langstack)
│   ├── css/theme.css           # Site accents + components (search/progress/exercise/UML)
│   └── js/
│       ├── main.js             # Theme, nav, code tabs, copy, quizzes, scroll-spy, Python highlighter
│       ├── lessons.js          # Canonical lesson registry (powers progress tracking)
│       ├── search-index.js     # GENERATED search index (see below)
│       ├── search.js           # Full-text search overlay
│       └── progress.js         # localStorage progress + sidebar checks + home dashboard
├── oop/                        # Overview · The four pillars · Relationships & UML
├── solid/                      # Why principles · The SOLID five
├── patterns/                   # Overview · Creational · Structural · Behavioral
├── lld/                        # The method · Parking lot · Vending machine · Notification service
├── reference/                  # Glossary & cheatsheet
└── tools/
    ├── build-search-index.js   # Regenerates assets/js/search-index.js
    └── verify.js               # Static checker: links, anchors, assets, escaped code, wiring
```

## Maintaining it

**Regenerate the search index** after editing page content (it's loaded via a plain
`<script>` so search works from `file://`):

```bash
node tools/build-search-index.js
```

**Verify the whole site** (every internal link + `#anchor` resolves, assets resolve, no raw
`<` inside code blocks, lesson pages wire all scripts):

```bash
node tools/verify.js
```

## Conventions

- All examples are **Python 3.13**, using modern idioms: `dataclasses`, `abc.ABC` /
  `@abstractmethod`, `typing.Protocol`, `enum.Enum`, `@property`, `match`/`case`. Content is
  current **as of June 2026**; the design ideas are language-agnostic and we note where Python
  differs from classic Java/C++ OOP.
- No package manager, no bundler, no framework. Edit a file, refresh the browser.
- Dark/light theme is remembered in `localStorage` (`dg-theme`); progress under `lld-progress`.
- Built to read top-to-bottom (Home → OOP → SOLID → Patterns → LLD → Reference), but every
  page stands alone and is reachable via search (press <kbd>/</kbd> or <kbd>Cmd/Ctrl-K</kbd>).
```
