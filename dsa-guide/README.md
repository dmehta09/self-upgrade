# DSA Field Guide

A visual, beginner-first guide to the **data-structures-and-algorithms interview** — pitched at the
problems a mid-level (≈4-years) engineer actually sees, but every idea explained like you're ten:
an everyday analogy first, then an animated walk-through, then the real algorithm, the Big-O, and
**Python you can run in the browser**.

It's a static site — **no build step, no dependencies, works offline** (open `index.html` and go).
A sibling of `langstack`, `fastapi-guide`, and `lld-guide`; it shares their design system.

## What's inside
- **Foundations** (5 pages): how to use the guide · Big-O & complexity · arrays/strings/hashing ·
  linked lists/stacks/queues · trees/heaps/graphs.
- **Patterns** (the pattern map + 16 pattern pages): Arrays & Hashing, Two Pointers, Sliding Window,
  Stack, Binary Search, Linked List, Trees (BFS/DFS), Heap/Top-K, Backtracking, Graphs, Dynamic
  Programming, Intervals, Greedy, Tries, Union-Find, Bit Manipulation — **45+ curated problems**.
- **Reference**: a Big-O cheat-sheet (cost tables per data structure) + a plain-words glossary.

Every problem follows the same rhythm: a **"explain like I'm 10" analogy** → an **animated
visualization** → the approach → a **complexity table** → a **self-check quiz** → a **hint** and the
full **runnable solution** → a **line-by-line walkthrough** with a **Mermaid algorithm workflow**.

## How to open it
Just open `index.html` in any modern browser — everything works from `file://`, including search and
progress tracking.

The **Run** button downloads a Python runtime (Pyodide) once from a CDN. Mermaid workflows also load
once from a CDN the first time you open a walkthrough. Offline, runpads show saved expected output
and Mermaid falls back to the diagram source text.

Tip: to browse over HTTP instead, run `python3 -m http.server` in this folder and visit
`http://localhost:8000/`.

## Features
- **Animated algorithm visualizations** — step / play / speed controls; keyboard arrows; pauses under
  "reduce motion". Renderers for arrays & pointers, grids, binary trees, and graphs.
- **Timed coding drills** (`drill/`) — fourteen 40-minute mock rounds (restate 5 / brute force 5 /
  find the pattern 10 / code 15 / test 5) with interviewer nudges, reveal-on-demand hints, a senior
  rubric, and a model answer. Best scores persist to `localStorage["dsa-drill"]`.
- **Pattern-recognition trainer** — read a problem blurb, name the pattern under time (on the pattern
  map), plus a **Big-O speed quiz** mode (on the Big-O page) with the classic amortized/memoized traps.
  Scores in `localStorage["dsa-ptrainer"]`.
- **Recursion-tree explorer** — step through real call trees: calls appear, returns pop, memo hits
  glow (backtracking & DP pages).
- **Runnable Python** — edit and run real solutions in-browser (Pyodide).
- **Line-by-line walkthrough + Mermaid flow** — after each solution, a fold-out that explains every
  line in plain English and shows the algorithm as a flowchart (`assets/js/mermaid-init.js`).
- **Full-text search** — press `/` or ⌘/Ctrl-K.
- **Quizzes & progress** — mark lessons learned; a home dashboard tracks it (saved in `localStorage`).
- **Dark / light theme**.

## Project layout
```
dsa-guide/
├── index.html              home: hero + progress dashboard
├── foundations/            Big-O + core data structures
├── patterns/               the pattern map + 16 pattern pages (45+ problems)
├── drill/                  timed coding drills (40-min mock rounds)
├── reference/cheatsheet.html
├── assets/css/             styles.css (shared design system) + theme.css (this site)
├── assets/js/              main, search, runpad (Pyodide), visualizer, mermaid-init, progress, lessons,
│                           search-index, drill + drill-bank, patternpicker, recursion-tree
└── tools/                  build-search-index.js, verify.js
```

## Maintaining it
- **After editing any page content, rebuild the search index:**
  ```
  node tools/build-search-index.js
  ```
  (It regenerates `assets/js/search-index.js` — the only generated file.)
- **Check links, anchors, assets, escaping, and lesson wiring:**
  ```
  node tools/verify.js
  ```
  Pattern problems must each include a runnable solution **and** a walkthrough (Mermaid + `code-walk`); verify fails if either is missing.
- **Stub a new pattern problem:**
  ```
  node tools/new-problem.js stack next-greater "Next Greater Element"
  ```
  Paste into the pattern page, fix the section number / TOC, then rebuild + verify.
- **Add a lesson:** add an entry to `assets/js/lessons.js` (stable `id`, `url`, `module`), create the
  page from an existing one, add it to the sidebar and to `tools/build-search-index.js`'s `FILES` list.

### Authoring a visualization
Drop a `<figure class="viz">` with the standard control bar and a
`<script type="application/json" class="viz-config">` holding `{ type, meta, frames }`.
`type` is `array` | `grid` | `tree` | `graph`; each frame is a state snapshot with a plain-language
`caption`. Only `values`/`grid` carry over between frames — declare highlight states fresh each frame.
See any pattern page (e.g. `patterns/two-pointers.html`) for worked examples, and
`assets/js/visualizer.js` for the exact field semantics.

### Authoring a line-by-line walkthrough
After each `<details class="deeper solution">` block, add:

```html
<details class="deeper walkthrough">
  <summary>… Line-by-line walkthrough + flow <span class="tag">walkthrough</span></summary>
  <div class="deeper-body">
    <p class="takeaway">Why this is the interview default.</p>
    <div class="mermaid-wrap"><pre class="mermaid">flowchart TD
      A[Start] --> B[Step]
    </pre></div>
    <ol class="code-walk">
      <li><code>exact line</code><span>Plain-English explanation.</span></li>
    </ol>
    <p class="walk-why">Complexity in one sentence.</p>
  </div>
</details>
```

Include `<script src="../assets/js/mermaid-init.js"></script>` on the page (loads Mermaid from CDN once).
Keep the runpad free of dense comments — explanations live in `.code-walk` only.

---
Built to open offline · content verified Jun 2026.
