# FastAPI Field Guide

A visual, beginner-first learning site for **Python &amp; FastAPI** — from a quick Python
refresher to a complete backend (routing, validation, databases, auth, deployment). It's a
static site with **zero build step and no dependencies**: pure HTML, CSS, and vanilla JavaScript.

It builds on the design system of its sibling project `../langstack`, and adds four things that
make it more than a wall of text:

- **▶ Runnable Python** — edit and run real Python in the browser (via Pyodide), including live
  Pydantic v2 validation.
- **⇄ Interactive API playground** — send requests to mock FastAPI endpoints and see the real
  status codes &amp; JSON, including the exact `422` validation envelope.
- **⌕ Full-text search** — press <kbd>/</kbd> (or <kbd>Cmd/Ctrl-K</kbd>) anywhere to jump to any topic.
- **✓ Exercises &amp; progress tracking** — mini-challenges with reveal-able solutions, and a
  "mark as learned" tracker saved in your browser.

## Quick start

**Option A — just open it.** Double-click `index.html` (or open it in your browser). Everything
works offline *except* live "Run" buttons (see below).

**Option B — serve it locally** (recommended; needed if your browser blocks some `file://`
features):

```bash
cd fastapi-guide
python3 -m http.server 8000
# then open http://localhost:8000/
```

## What needs an internet connection?

Almost nothing. The site is offline-first. Only two features reach the network, both via CDN:

| Feature | Needs internet? | If offline |
|---|---|---|
| Pages, search, playground, progress, quizzes, exercises | No | Work fully |
| **Runnable Python ("Run" buttons)** | **Yes** (downloads the Pyodide runtime once) | Falls back to showing each snippet's saved expected output |
| Google Fonts | Optional | Falls back to system fonts |

## Project structure

```
fastapi-guide/
├── index.html                  # Home: request-flow diagram, progress dashboard, versions
├── assets/
│   ├── css/styles.css          # Base design system (shared with langstack)
│   ├── css/theme.css           # Site accents + new components (search/runpad/playground/progress)
│   └── js/
│       ├── main.js             # Theme, nav, code tabs, copy, quizzes, scroll-spy, Python highlighter
│       ├── lessons.js          # Canonical lesson registry (powers progress tracking)
│       ├── search-index.js     # GENERATED search index (see below)
│       ├── search.js           # Full-text search overlay
│       ├── runpad.js           # Runnable Python (Pyodide, lazy-loaded)
│       ├── playground.js       # Mock FastAPI router + Pydantic-v2-faithful validator
│       └── progress.js         # localStorage progress + sidebar checks + home dashboard
├── python/                     # Setup & tooling · The refresher (runnable)
├── fastapi/                    # Overview · Routing · Request body · Validation · Dependencies · Databases · Auth · Advanced
├── deploy/                     # Testing & deployment
└── tools/build-search-index.js # Regenerates assets/js/search-index.js
```

## Regenerating the search index

The search index is a generated file (`assets/js/search-index.js`). After editing page content,
rebuild it so search stays in sync:

```bash
node tools/build-search-index.js
```

It crawls every page, emits one record per heading-section (so results deep-link to anchors), and
writes a `window.SEARCH_INDEX = [...]` file. It's loaded with a plain `<script>` tag rather than
`fetch()`, which is what makes search work when the site is opened directly from disk (`file://`).

## Versions this guide targets

Content is current **as of June 2026**. Patch numbers move fast; what matters is the durable
shape (Pydantic v2, the `Annotated` + `Depends` style, `lifespan`).

| Package | Version | |
|---|---|---|
| Python | 3.13.x | use `list[int]`, `X \| None` |
| FastAPI | 0.136.x | `Annotated[T, Depends()]`, `lifespan=`, auto docs at `/docs` |
| Pydantic | 2.13.x | `model_config`, `Field(pattern=...)`, `.model_dump()` |
| SQLModel | 0.0.2x | `table=True`, `session.exec(select(...))` (pre-1.0) |
| uvicorn | 0.48.x | `fastapi dev` / `fastapi run` / `uvicorn` |
| Auth | PyJWT + pwdlib | (not the unmaintained python-jose / passlib) |
| Testing | pytest 8 + httpx 0.28 | `fastapi.testclient.TestClient` |

## Notes

- No package manager, no bundler, no framework. Edit a file, refresh the browser.
- Dark/light theme is remembered in `localStorage` (`fa-theme`); progress under `fa-progress`.
- Built to be read top-to-bottom (Home → Python → FastAPI core → Databases → Auth → Advanced →
  Ship it), but every page stands alone and is reachable via search.
