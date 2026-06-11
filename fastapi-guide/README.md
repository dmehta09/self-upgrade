# FastAPI Field Guide

A visual, beginner-first learning site for **Python &amp; FastAPI** — from a quick Python
refresher to a complete backend (routing, validation, sync &amp; async databases with real Alembic
migrations, auth, WebSockets &amp; streaming, production patterns, deployment). 20 lessons. It's a
static site with **zero build step and no dependencies**: pure HTML, CSS, and vanilla JavaScript.

It builds on the design system of its sibling project `../langstack`, and adds the pieces that
make it more than a wall of text:

- **▶ Runnable Python** — edit and run real Python in the browser (via Pyodide), including live
  Pydantic v2 validation.
- **⇄ Interactive API playground** — send requests to mock FastAPI endpoints and see the real
  status codes &amp; JSON, including the exact `422` validation envelope.
- **⟲ Request tracer** (`assets/js/reqtrace.js`) — an animated request walking FastAPI's pipeline:
  middleware → router → dependency resolution → validation → handler → response. Powers the
  overview (happy path + 422), dependency-injection (sub-deps, caching, yield cleanup), and
  CORS-middleware stories.
- **≋ Loop lab** (`assets/js/looplab.js`) — an event-loop timeline that shows sequential awaits vs
  `gather`, and a blocking call freezing every request (vs `def` in the threadpool).
- **⌕ Full-text search** — press <kbd>/</kbd> (or <kbd>Cmd/Ctrl-K</kbd>) anywhere to jump to any topic.
- **✓ Exercises &amp; progress tracking** — mini-challenges with reveal-able solutions, and a
  "mark as learned" tracker saved in your browser.
- **◎ Quiz drills** (`drill/`, `assets/js/quizdrill.js`) — three timed chip quizzes: *pick the
  tool* (dependency vs middleware vs background task…), *status codes* (401 vs 403, 404 vs 422),
  and *debug it* (symptom → cause). Traps explained; misses link back to the lesson. Best scores
  in `localStorage["fa-drill"]`.
- **▤ Flashcards** (`assets/js/flashcards.js`) — two decks (status codes, core concepts) with
  flip/known/review; persists to `localStorage["fa-cards"]`.

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
│       ├── reqtrace.js         # Request-lifecycle stepper (pipeline / DI / CORS stories)
│       ├── looplab.js          # Event-loop timeline (gather vs sequential, blocking)
│       └── progress.js         # localStorage progress + sidebar checks + home dashboard
│       ├── quizdrill.js        # Timed quiz drills (3 modes; best scores in fa-drill)
│       ├── flashcards.js       # Flip-card decks (known/review in fa-cards)
├── python/                     # Setup & tooling · The refresher (runnable)
├── fastapi/                    # Overview · Routing · Request body · Validation · Dependencies · Databases · Async DB · Auth · Advanced · Streaming · Production
├── deploy/                     # Testing & deployment
├── drill/                      # Practice hub: quiz drills + flashcards
└── tools/
    ├── build-search-index.js   # Regenerates assets/js/search-index.js
    └── verify.js               # Link/anchor/asset/wiring checks — run after every edit
```

## Regenerating the search index

The search index is a generated file (`assets/js/search-index.js`). After editing page content,
rebuild it so search stays in sync:

```bash
node tools/build-search-index.js
node tools/verify.js   # link, anchor, asset & script-wiring checks
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
- Dark/light theme is remembered in `localStorage` (`fa-theme`); progress under `fa-progress`;
  drill best scores under `fa-drill`; flashcard marks under `fa-cards`.
- Built to be read top-to-bottom (Home → Python → FastAPI core → Databases → Auth → Advanced →
  Ship it), but every page stands alone and is reachable via search.
- Databases is two lessons (SQLModel CRUD, then async SQLAlchemy + Alembic); Advanced is three
  (async &amp; structure, WebSockets &amp; streaming, production patterns).
