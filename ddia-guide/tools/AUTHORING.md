# Authoring — Designing Data-Intensive Applications

How to write a lesson for this guide. The voice is **sharp and crisp, not comprehensive**:
say the important thing well, skip the rest. DDIA is a concept/diagram book, so lead with
**analogy → precise idea → a visual (diagram or trade-off) → a self-check**. Use Python
*only* where an algorithm genuinely makes it click (consistent hashing, LSM merge, quorum
math, encoding) — not as decoration.

## The shape of a fragment
A fragment is **sections only** — no `<head>`, sidebar, TOC, or nav. `gen.js` wraps it.
- First block is the **hero**: `<section class="hero reveal">` with `<span class="eyebrow">`, `<h1>`, and `<p class="lead">`. The hero has **no `id`**.
- Each teaching section: `<section class="section reveal" id="unique-id"><h2><span class="section-num">01</span> Title</h2> …`. The right-rail TOC is built from these `id`+`h2` pairs.
- Aim for **4–6 sections**. If it's sprawling, cut.

## Every lesson includes
- An **analogy callout** first: `<div class="callout analogy"><span class="co-ic">…svg…</span><div class="co-body"><div class="co-title">In plain English <span class="tag">analogy</span></div><p>…</p></div></div>`
- A **one-line `takeaway`** near the top: `<p class="takeaway">The thing to remember.</p>`
- At least one **visual**: a `ddia-viz` scene, a `tradeoff` slider, or an inline SVG diagram.
- A **quiz**: `<div class="quiz" data-quiz><p class="q">…</p><div class="quiz-opts"><button class="quiz-opt"><span class="mark"></span>…</button><button class="quiz-opt" data-correct="true"><span class="mark"></span>…</button></div><div class="quiz-explain"><b>Right:</b> …</div></div>`
- Where it overlaps HLD, a **see-also** into the sibling guide: `<div class="callout note">…<a href="../../sysdesign-guide/…">…</a>…</div>` (note the `../../` — lessons live two levels deep).

## Components (from styles.css + theme.css + ddia.css)
- `callout` variants: `analogy` · `tip` · `gotcha` · `note`.
- `versus` — two-up compare: `<div class="versus"><div class="vs-col vs-a"><div class="vs-h">…</div>…</div><div class="vs-col vs-b">…</div></div>` (also `vs-good`/`vs-bad`).
- `kv` — definition list (`<dl class="kv"><dt>…</dt><dd>…</dd></dl>`).
- `table-wrap` > `table` for comparisons.
- `takeaway`, `steps`, `quiz`, `sheet-grid`/`sheet` (cheatsheet), `flashdeck` (cards).
- Code: `<div class="codeblock"><pre><code data-lang="python">…</code></pre></div>`. The highlighter defaults to Python; `data-lang="bash"`/`text` also supported.

## Interactive engines
Wire each engine via the page's `scripts:` array in `gen.js` `PAGES` (e.g. `scripts: ["ddia-viz.js","tradeoff.js"]`).

### ddia-viz (this guide's own engine) — `assets/js/ddia-viz.js`
```html
<figure class="ddiaviz" data-ddiaviz>
  <figcaption class="dv-title">One profile, three data models</figcaption>
  <div class="dv-body"><p class="viz-fallback">Interactive — needs JavaScript.</p></div>
  <script type="application/json" class="dv-config">{ "scene": "datamodel", "title": "…", "views": {…}, "captions": {…} }</script>
</figure>
```
- `scene: "datamodel"` — `views.relational` = `{ tables:[{name,cols:[…],rows:[[…]]}] }` (columns ending `_id`/`id` render as foreign keys); `views.document` = a plain JSON object (pretty-printed); `views.graph` = `{ nodes:[{id,label,kind:"person|org|place|industry"}], edges:[{from,to,label}] }`. `captions` = a one-liner per view.
- `scene: "percentiles"` — `{ "samples":[…ms…], "unit":"ms", "maxFanout":100 }`. Renders p50/p95/p99 markers + a fan-out slider showing tail-latency amplification (the max of N independent calls).
- Future scenes (Part II/III): `storage` (LSM↔B-tree), `ring` (consistent hashing), `quorum` (w+r>n) — add a `case` in `render()`.

### tradeoff (reused) — `assets/js/tradeoff.js`
```html
<div class="tradeoff" data-tradeoff>
  <script type="application/json" class="tr-config">{ "title":"…", "axisLabel":"…", "stops":[{ "label":"…", "dims":{ "Read latency":92, … }, "note":"…" }] }</script>
</div>
```
`reqflow.js` / `visualizer.js` / `capacity.js` are also available (reused in later phases).

## Hard rules (verify.js / reverify.js enforce)
- **Escape `<` and `>` inside `<code>`** as `&lt;` / `&gt;` — a raw `<` breaks the highlighter and the HTML parse.
- Every `id` on the page is unique; the hero has no `id`.
- A lesson page must set `data-lesson` (gen.js does this from `PAGES`), include the 5 core scripts, and wire any engine it uses.
- All `dv-config` / `tr-config` JSON must be valid (reverify parses it).

## The "soon" convention (phased rollout)
The home page lists **all 12 chapters**. Built ones are real `<a>` links; not-yet-built ones are
plain text with a `<span class="soon-tag">soon</span>` — **never a dead link** (verify.js would flag it).
When a chapter ships, flip its “soon” line into a link.

## Crispness guardrails
- Two explanations max per idea (analogy + precise). No third pass.
- Prefer a diagram or a `versus` to three paragraphs.
- Code blocks ≤ ~20 lines; cut to the teaching core.
- If a section doesn't earn its place, delete it.
