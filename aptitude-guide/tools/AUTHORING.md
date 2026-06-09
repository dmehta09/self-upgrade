# Aptitude & Reasoning Field Guide — Authoring Spec (read fully before writing)

You author **content fragments** for a static, offline HTML learning guide. The generator (`tools/gen.js`) wraps your fragment in the shared shell and **auto-generates** the right-rail TOC, the prev/next page-nav, and the "Mark as learned" button. You therefore write **ONLY the `<section>`s** — nothing else.

**Write each fragment to:** `tools/content/<data-page>.html`, where `<data-page>` = folder path with `/`→`-`, plus the slug. Examples: `quant/percentages` → `quant-percentages.html`; `reasoning/blood-relations` → `reasoning-blood-relations.html`; `di/data-sufficiency` → `di-data-sufficiency.html`; `reference/glossary` → `reference-glossary.html`.

---

## 0. Audience, voice, prime directive

A software engineer (~3–4 yrs) prepping the **aptitude / online-assessment (OA) round** that gates tech-company interviews (TCS NQT, Infosys, Accenture, Cognizant, Amazon-OA-style). A **visual learner** who wants **sharp, crisp** info — NOT comprehensive. The skill being taught is **recognising the question type and solving it FAST under time** — so every page sells a *shortcut* and proves it on examples.

- **Intuition first, then technique.** Exactly **one** `.callout analogy` per page, near the top, in plain layman terms ("In plain English…"). Then the precise method: the formula or the step recipe.
- **Diagrams-first.** Aptitude is visual — prefer a `.figbox` SVG (compass, family tree, Venn, clock, cube, bar/pie mock), a `.formula`, an `.exfig` stat strip, `.steps`, or `.versus` over prose. Show the trick, don't just state it.
- **Multiple worked examples.** 2–3 short examples per page that *apply the shortcut*, with the numbers worked through.
- **Speed-ready.** Every page ends with a `#solve` section: 2–3 worked examples (as `details.qa`, each with a **"The fast way"** callout + difficulty chip) **and** an inline timed **mini-drill** (`.drill`).
- **No code.** This is mental-math + reasoning, not programming. Render math with `.formula`, `.frac`, Unicode (`× ÷ √ ² ³ ½ π ≈ ≤ ≥ → −`), `<sup>`/`<sub>`. If you ever show a `<code>` token, **escape `<`→`&lt;` and `>`→`&gt;`** (the verifier rejects a raw `<` in `<code>`).

**Per page, REQUIRED:** one analogy callout, one primary visual (`.figbox`/`.formula`/`.exfig`/`.steps`/`.versus`), **≥1** `.callout gotcha` (a classic trap), **≥1** `.quiz`, **2–3** worked examples in `#solve`, and the inline **`.drill`** mini-drill. Keep each page to **4–6 `<section>`s**.

*(Exceptions: `foundations/how-aptitude-tests-work` and `practice/method` are strategy pages — prose + steps + tables, no drill required. `practice/drill` is the full drill center. Reference pages use their own components below.)*

---

## 1. Fragment skeleton (this is the WHOLE file you write)

```html
<section class="hero reveal">
  <span class="eyebrow">MODULE · topic</span>
  <h1>Page title.</h1>
  <p class="lead">1–2 sentences: what this type is and why it's worth easy marks.</p>
</section>

<section class="section reveal" id="idea">
  <h2><span class="section-num">01</span> The idea</h2>
  <p class="takeaway">One-line essence with <b>bolded</b> key terms / the core formula.</p>
  <p>2–3 sentence plain-but-precise explanation.</p>
  <div class="callout analogy">… In plain English …</div>
  <div class="formula">…the key formula…</div>
</section>

<section class="section reveal" id="...">  <!-- 1–2 middle sections: the method + a twist -->
  <h2><span class="section-num">02</span> …</h2>
  … steps / figbox / versus / a worked mini-example / .callout gotcha / .quiz …
</section>

<!-- total 4–6 sections; the LAST is always: -->
<section class="section reveal" id="solve">
  <h2><span class="section-num">0N</span> Solve it fast</h2>
  <div class="qa-set"> … 2–3 worked examples as details.qa … </div>
  <div class="drill" data-drill> … inline mini-drill … </div>
</section>
```

**Hard rules**
- Do **NOT** write `<head>`, sidebar, topbar, footer, `<script>` (except the engine's inline JSON config), the `.content`/`.prose` wrappers, the right-rail `.toc`, the `.page-nav`, or the `.lesson-complete` button. The generator adds all of these.
- The **hero** section has **no `id`** (so it's excluded from the auto-TOC).
- Every other `<section>` **must have a unique kebab-case `id`**. Aim for ≥3 id'd sections so the page gets a TOC. The **last** section's id is **`solve`**.
- Inline engine JSON (`.drill-config`) **must be valid JSON** (double-quoted keys + strings, no trailing commas) — the verifier parses it.

---

## 2. Component library (copy these exactly)

**Callouts** — variants `analogy` (lightbulb), `gotcha` (warning), `tip` (check), `note` (info):
```html
<div class="callout analogy"><span class="co-ic"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18h6M10 22h4M12 2a7 7 0 0 0-4 12.7c.6.5 1 1.3 1 2.1h6c0-.8.4-1.6 1-2.1A7 7 0 0 0 12 2Z"/></svg></span><div class="co-body"><div class="co-title">In plain English <span class="tag">analogy</span></div><p>…</p></div></div>
```
- gotcha icon path: `<path d="M10.3 3.6 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.6a2 2 0 0 0-3.4 0Z"/><path d="M12 9v4M12 17h.01"/>` · title "Common trap" + `<span class="tag">gotcha</span>`
- tip icon path: `<path d="M22 11.1V12a10 10 0 1 1-5.9-9.1"/><path d="M22 4 12 14.01l-3-3"/>` · title "Pro tip"
- note icon path: `<circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/>` · title "Heads up"

**Formula** (the workhorse — use Unicode + `<sup>`/`<sub>`; `.hl` highlights, `.cmt` is a faint comment):
```html
<div class="formula">A = P(1 + <span class="hl">r</span>/100)<sup>n</sup>   <span class="cmt"># compound amount</span></div>
```
**Inline fraction:** `<span class="frac"><span class="num">x</span><span class="den">y</span></span>` · **answer pill:** `<span class="ans">42</span>` (renders "= 42").

**Example stat strip** (great for "the numbers at a glance"):
```html
<div class="exfig"><div class="ef"><b>20%</b><span>net change</span></div><div class="ef"><b>₹1210</b><span>amount</span></div></div>
```

**Steps** (the method, ordered): `<div class="steps"><div class="step"><span class="step-num">1</span><div class="step-body"><h4>Title</h4><p>What to do.</p></div></div> …</div>`

**Good-vs-bad / slow-vs-fast two-up:**
```html
<div class="versus">
  <div class="vs-col vs-bad"><div class="vs-h">Slow way</div><p>…long arithmetic…</p></div>
  <div class="vs-col vs-good"><div class="vs-h">Fast way</div><p>…the shortcut…</p></div>
</div>
```

**Quiz** (mark the correct option `data-correct="true"`):
```html
<div class="quiz" data-quiz>
  <p class="q">Question?</p>
  <div class="quiz-opts">
    <button class="quiz-opt" data-correct="true"><span class="mark"></span>Right answer.</button>
    <button class="quiz-opt"><span class="mark"></span>Distractor (a tempting trap).</button>
  </div>
  <div class="quiz-explain"><b>Right.</b> Why — name the trap the distractor sets.</div>
</div>
```

**Worked examples** (the `#solve` block — `details.qa`; difficulty chip = `diff-warm`|`diff-core`|`diff-stretch`; the tip callout is relabelled **"The fast way"**):
```html
<div class="qa-set">
  <details class="qa">
    <summary><svg class="chev" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m9 6 6 6-6 6"/></svg><span class="qa-q">A shirt marked ₹800 is sold at 25% off. Selling price?</span><span class="pm-chip diff-warm">warm-up</span></summary>
    <div class="qa-body">
      <h5>Solve it</h5>
      <p>25% of 800 = 200, so price = 800 − 200 = <span class="ans">₹600</span>.</p>
      <div class="callout tip qa-say"><span class="co-ic"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.1V12a10 10 0 1 1-5.9-9.1"/><path d="M22 4 12 14.01l-3-3"/></svg></span><div class="co-body"><div class="co-title">The fast way <span class="tag">shortcut</span></div><p>25% off = pay <b>¾</b>. 800 × ¾ = 600 in one step.</p></div></div>
    </div>
  </details>
</div>
```

**Comparison table:** `<div class="table-wrap"><table><thead><tr><th>…</th></tr></thead><tbody><tr><td>…</td></tr></tbody></table></div>`
**Key-value list:** `<dl class="kv"><dt>Term</dt><dd>Definition with the formula.</dd> …</dl>`
**Cards grid** (home / link lists): `<div class="grid grid-2"><a class="card feature" href="page.html"><div class="f-ic"><svg …></svg></div><h4>Title</h4><p>One line.</p></a> …</div>` — links **relative to your page's folder**.

**Reference-only:**
- Cheat-sheet block (`reference/formula-sheet`): `<div class="sheet-grid"><div class="sheet"><h3>Percentages</h3> …kv/table/formula… </div> …</div>`
- Glossary (`reference/glossary`): `<dl class="glossary"><dt>Alligation</dt><dd>Rule to find the ratio in which two strengths/prices mix to a mean.</dd> …</dl>` (A–Z).
- Flashcards (`reference/flashcards`): `<div class="flashdeck" data-deck="apti"><div class="fd-controls"><span class="fd-progress"><b>0</b>/<span class="fd-total">0</span> known</span><span class="spacer"></span><button class="fd-btn fd-shuffle">Shuffle</button><button class="fd-btn fd-reset">Reset</button></div><ul class="fd-cards"><li class="flashcard" tabindex="0"><div class="fc-inner"><div class="fc-face fc-front"><p>Front: 12.5% = ?</p></div><div class="fc-face fc-back"><p>1/8 — divide by 8.</p><div class="fc-mark"><button class="fc-known">Known</button><button class="fc-unknown">Review</button></div></div></div></li> … </ul></div>` (both faces live in the DOM).

---

## 3. Diagrams — inline SVG in a `.figbox` (theme-aware)

Draw diagrams as **raw inline `<svg>`** inside a `.figbox`, using the **`svg-*` token classes** so every figure adapts to light/dark + the module accent. Never hard-code colors. `viewBox` + no fixed width (the CSS sizes it).

Token classes: `svg-stroke` (neutral outline) · `svg-accent` / `svg-accent-fill` (accent line / fill) · `svg-grid` (faint axes) · `svg-bar` / `svg-bar-2` (chart bars) · `svg-good` / `svg-bad` (green/red) · `svg-good-s`/`svg-bad-s` (green/red stroke) · `svg-label` (body text) · `svg-mono` (mono caption) · `svg-faint` (small mono).

```html
<div class="figbox">
  <div class="fig-title">3 North + 4 East = 5 straight-line</div>
  <svg viewBox="0 0 300 170" role="img" aria-label="Right triangle: 3 up, 4 across, hypotenuse 5">
    <line class="svg-grid" x1="40" y1="140" x2="280" y2="140"/>
    <line class="svg-accent" x1="60" y1="140" x2="60" y2="50"/>
    <line class="svg-accent" x1="60" y1="50" x2="180" y2="50"/>
    <line class="svg-good-s" x1="60" y1="140" x2="180" y2="50" stroke-dasharray="5 4"/>
    <text class="svg-mono" x="40" y="100">3 N</text>
    <text class="svg-mono" x="110" y="42">4 E</text>
    <text class="svg-good" x="118" y="108">5</text>
  </svg>
  <div class="cap">A 3-4-5 triangle — recognise the Pythagorean triple and skip the square roots.</div>
</div>
```
Use diagrams for: direction paths (compass), blood-relation **family trees** (boxes + connector lines), **Venn** circles (syllogism / DI overlap), **clock faces**, **cube nets / dice**, and DI **bar/pie/line mocks**. Keep them small and labelled.

---

## 4. The drill — `class="drill" data-drill` · config class `drill-config`

Every concept page ends with an inline **mini-drill**: 5 timed MCQs (4 for Verbal/DI pages) pulled from the shared bank for *this page's topic*. Set `topics` to the page's topic id and `sections` to its module key (given to you per page). `count` × ~48s ≈ `timerSec`.

```html
<div class="drill" data-drill>
  <script type="application/json" class="drill-config">
  { "title": "Quick drill — percentages", "sections": ["quant"], "topics": ["qa-percent"], "count": 5, "timerSec": 240 }
  </script>
  <p class="viz-fallback">Five timed practice questions on percentages — open in a browser to play, or use the worked examples above.</p>
</div>
```
The engine builds its own UI (intro → timed questions → score + review) from `window.APTI_QUESTIONS`. You do **not** write questions in the fragment — they live in `assets/js/question-bank.js` (tagged by `topic`). Just point the config at the right `topics`/`sections`. **The JSON must be valid** (double quotes, no trailing comma).

The **drill center** (`practice/drill` only) uses chips + counts:
```html
<div class="drill" data-drill>
  <script type="application/json" class="drill-config">
  { "title": "Mixed timed drill", "count": 10, "counts": [10,20,30], "secPerQ": 45,
    "chips": [ {"label":"All"}, {"label":"Quant","sections":["quant"]}, {"label":"Reasoning","sections":["reasoning"]}, {"label":"Verbal","sections":["verbal"]}, {"label":"Data Interp.","sections":["di"]} ] }
  </script>
  <p class="viz-fallback">Pick a section and a question count, then race the clock — instant score and per-question explanations.</p>
</div>
```

---

## 5. Topic facts to lean on (tech-placement OA flavour)

- **Quant** is shortcut country: `12.5%=1/8`, `25%=1/4`, `33⅓%=1/3`, `16⅔%=1/6`; `×5 = ÷2 then ×10`; successive % via multipliers (`1.2 × 0.8`); speed `× 5/18` (km/h→m/s); **time-and-work LCM trick** (let total work = LCM of days); **alligation** for mixtures/average-price; **digit cycles** for unit digits; back-solve from options when algebra is slow.
- **Reasoning** is method country: series → look at **differences/ratios**; coding → find the **shift/positional rule**; blood relations → draw a **family tree**; directions → draw the **path + Pythagoras**; syllogisms → the **Venn method** (and "possibility" vs "must be true"); seating → fix the certain clue first, branch the rest; clocks → `30°/hr`, `6°/min`; calendars → **odd days**; cubes → corners=3 faces, edges=2, centres=1.
- **Verbal**: RC answers come **from the passage** (avoid extreme/outside-knowledge options); error-spotting → subject-verb agreement, tense, `each/every` (singular), comparatives (`than`); para-jumbles → find the opener + pronoun/transition chains.
- **DI**: read the **labels/units first**; **approximate** then refine; pie `% × 3.6 = degrees`; data-sufficiency tests **whether** you can answer, not the value — stop as soon as it's decidable.
- These guides are dated **June 2026**, but aptitude topics are timeless — don't date-stamp content; just teach the shortcut.

---

## 6. Crispness guardrails (hard limits)
- Lead idea per concept: **2–3 sentences (≤60 words)**. Overflow → a list / table / kv / figure / formula, never a longer paragraph.
- **4–6 sections** per page. One analogy, one primary visual, ≥1 gotcha, ≥1 quiz, 2–3 worked examples + the mini-drill.
- Prefer a **figure or formula** over a paragraph. No walls of text, no exhaustive theory dumps. Teach the pattern + the shortcut + the trap.
- Use ONLY the documented components. Inline `.drill-config` JSON must be valid. Always include a `.viz-fallback` line inside the `.drill`.

When done, return a short list of the files you created.
