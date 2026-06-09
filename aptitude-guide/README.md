# Aptitude & Reasoning Field Guide

A sharp, **visual**, practice-first guide to the **aptitude / online-assessment round** that gates tech-company interviews — **Quantitative Aptitude, Logical Reasoning, Verbal Ability, and Data Interpretation**, tuned for tech placements as of **June 2026**. Not comprehensive: every topic gets a plain-English idea, a diagram, the shortcut, a couple of worked examples, the classic trap — and a **timed drill** so you build real speed.

## Open it
- Just open `index.html` in a browser, **or**
- `python3 -m http.server` then visit `http://localhost:8000` (so in-site search + progress + drills behave exactly like production).

Works fully offline (Google Fonts degrade to system fonts). Dark/light theme, per-lesson progress, flashcard state, and your best drill scores all persist in your browser.

## What's inside (~30 pages)
- **Test Strategy & Speed** — how aptitude tests are scored + the mental-math toolkit
- **Quantitative Aptitude** — numbers, percentages, ratio & mixtures, averages & ages, profit/interest, time-speed-distance, time & work, P&C & probability
- **Logical Reasoning** — series & analogies, coding–decoding, blood relations, direction sense, syllogisms, seating & puzzles, clocks/calendars/cubes/dice
- **Verbal Ability** — reading comprehension, grammar & error-spotting, completion & para-jumbles, vocabulary
- **Data Interpretation** — charts & tables, caselets & mixed sets, data sufficiency
- **Practice** — the exam-day method & time budgets, and a **timed drill** arena
- **Reference** — a one-page formula & shortcut sheet, active-recall flashcards, and an A–Z glossary

Each concept page ends with **worked examples** (tap to reveal the fast way) and an **inline 5-question timed drill**.

## The drill engine
`drill.js` powers every drill: pick a section/topic and count, race a per-question clock, get instant scoring, and review every question with a worked explanation. Option order is shuffled each run, and your best score is saved locally. Pure vanilla JS — dependency-free, theme-aware, and offline.

## Editing / regenerating
Content lives as **section-only fragments** in `tools/content/<dir>-<slug>.html`. The site map is `tools/manifest.js`; practice questions live in `assets/js/question-bank.js` (tagged by topic). After editing:

```bash
node tools/gen.js                # assemble pages from fragments
node tools/build-search-index.js # rebuild the search index
node tools/verify.js             # validate links, anchors, escaping, JSON, wiring
```

Authoring rules and component/engine markup: **`tools/AUTHORING.md`**. Full regeneration spec: **`prompt.md`**.
