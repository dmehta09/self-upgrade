# Aptitude & Reasoning Field Guide — regeneration spec

Paste this to rebuild the guide from scratch. It encodes every decision already made. The authoritative content contract is **`tools/AUTHORING.md`** — read it before writing any page.

## What this is
A sharp, crisp, **visual** prep guide for the **aptitude / online-assessment (OA) round** that gates tech-company interviews (TCS NQT, Infosys, Accenture, Cognizant, Amazon-OA-style), as of **June 2026**. NOT comprehensive — every topic gets a plain-English idea, a diagram, the shortcut, 2–3 worked examples, the common trap, and a **timed drill**. Built to be done fast and turn easy marks automatic.

## Knobs (the decisions)
- **Audience:** software engineer (~3–4 yrs) prepping tech-placement OAs; visual learner.
- **Sections (all four):** **Quantitative Aptitude + Logical Reasoning + Verbal Ability + Data Interpretation** (Quant + LR weighted heaviest), plus a foundations primer and a practice arena.
- **Voice:** intuition-first (one analogy) → technique (formula/steps) → visual → worked examples → trap → mini-drill. Both layman and technical; ≤60-word leads; 4–6 sections/page.
- **Scope:** ~30 pages (foundations 2, quant 8, reasoning 7, verbal 4, DI 3, practice 2, reference 3).
- **Practice:** a NEW **timed-drill engine** is the centerpiece — pick a topic/section, race a clock, instant scoring + per-question review, best score saved.
- **No code:** mental-math + reasoning only. Math via `.formula`/`.frac`/Unicode; diagrams via inline SVG in `.figbox` with `svg-*` token classes. Static, offline.

## Architecture (tool-driven, offline static site)
Clone the newest sibling pattern (`devops-guide`/`observability-guide`). No runtime build, no deps; opens at `file://` or via `python3 -m http.server`.
- `tools/manifest.js` — single source of truth: MODULES + REFERENCE, each page's `{slug,title,nav,id,widgets}`.
- `tools/gen.js` — wraps section-only fragments from `tools/content/<dir>-<slug>.html` in the shared shell; AUTO-generates the right-rail TOC, prev/next nav, and the "Mark as learned" button; regenerates `assets/js/lessons.js`. Auto-injects `question-bank.js` before `drill.js`. **No module-overview pages** (crisp): the home page carries the module map.
- `tools/build-search-index.js` — crawls HTML → `assets/js/search-index.js` (works at `file://`).
- `tools/verify.js` — validates links/anchors/assets, escaped `<` in code, valid inline JSON, engine wiring (`ENGINES = { drill, flashdeck }`), lesson registry.
- Build: `node tools/gen.js && node tools/build-search-index.js && node tools/verify.js` → expect `✓ No problems found.`

## Design system
- Fonts: Fraunces (display), Hanken Grotesk (body), JetBrains Mono (code/formulas). Dark-first + warm-paper light theme; toggle persisted to `localStorage["apti-theme"]`.
- `assets/css/styles.css` (shared design system), `assets/css/theme.css` (brand + per-module accents + search/progress; light per-module rules use the descendant form `[data-theme="light"] [data-tool="x"]` because data-theme is on <html> and data-tool on <body>), `assets/css/aptitude.css` (Q&A/worked-examples, `.formula`/`.frac`/`.exfig`, `.figbox` + `svg-*` diagram tokens, flashcards, and the drill engine).
- Per-module accent via `<body data-tool="<key>">`: foundations(sky) · quant(emerald) · reasoning(purple) · verbal(amber) · di(blue) · practice(rose) · reference(teal); brand = indigo.
- localStorage namespace: `apti-progress`, `apti-theme`, `apti-cards`, `apti-drill`.

## Interactive engines (`assets/js/`)
- `drill.js` (`.drill`) — timed MCQ player. Reads an inline `.drill-config` JSON; pulls questions from `window.APTI_QUESTIONS` (filter by `section`/`topic`) or inline `questions`; intro → timed question card → score + per-question review; shuffles option order; best score → `localStorage["apti-drill"]`. Honors reduced-motion; keyboard 1–4 / Enter.
- `question-bank.js` — `window.APTI_QUESTIONS` (tagged by section + topic id) + `window.APTI_TOPIC_NAMES`. Auto-loaded wherever a `.drill` appears.
- `flashcards.js` (`.flashdeck`) — reference active-recall deck (`data-deck="apti"`).
- Shared (always-on): `main.js`, `search.js`, `progress.js`, generated `lessons.js` + `search-index.js`.

## Page map (~30 pages)
- **Foundations:** how-aptitude-tests-work · speed-math-toolkit (drill)
- **Quant:** numbers-and-divisibility · percentages · ratio-proportion-mixtures · averages-and-ages · profit-loss-and-interest · time-speed-distance · time-and-work · permutations-combinations-probability (all drill)
- **Reasoning:** series-and-analogies · coding-decoding · blood-relations · direction-sense · syllogisms-and-statements · seating-and-puzzles · clocks-calendars-cubes-dice (all drill, SVG figures)
- **Verbal:** reading-comprehension · grammar-and-error-spotting · sentence-completion-and-para-jumbles · vocabulary (all drill, count 4)
- **Data Interpretation:** charts-and-tables · caselets-and-mixed-sets · data-sufficiency (all drill, count 4, SVG charts)
- **Practice:** method (time budgets, two-pass) · drill (the timed drill center with section chips + counts)
- **Reference:** formula-sheet · flashcards · glossary
- **Home:** `index.html` — hero, progress dashboard, junior→pro path, 7-section module map, drill CTA.

## Per-page recipe
Hero (no id) + 4–6 id'd sections, last `id="solve"`. Required: one `.callout analogy` ("In plain English"), one primary visual (`.figbox` SVG / `.formula` / `.exfig` / `.steps` / `.versus`), ≥1 `.callout gotcha`, ≥1 `.quiz`, 2–3 worked examples (`details.qa` + "The fast way" callout + difficulty chip), and the inline mini-drill `.drill` (valid JSON config). See `tools/AUTHORING.md` for exact markup.
