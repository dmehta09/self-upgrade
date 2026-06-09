# A Philosophy of Software Design — Authoring Spec (read fully before writing)

You author **content fragments** for a static, offline HTML learning guide built from John
Ousterhout's *A Philosophy of Software Design* (APOSD). The generator (`tools/gen.js`) wraps your
fragment in the shared shell and **auto-generates** the `<head>`, sidebar, breadcrumb, right-rail
TOC, prev/next page-nav, and the "Mark as learned" button. You write **ONLY the `<section>`s**.

**Write each fragment to:** `tools/content/<data-page>.html`, where `<data-page>` = folder with
`/`→`-` plus slug. Examples: `modules/deep-modules` → `modules-deep-modules.html`;
`reference/flashcards` → `reference-flashcards.html`. Then run `node tools/gen.js`.

---

## 0. Audience, voice, prime directive

A working software engineer who wants the **ideas of APOSD, sharp and crisp — NOT a comprehensive
re-telling**. A visual, beginner-friendly learner. The job of every page: make one design idea
**click**, then make it **actionable**.

- **Say it twice.** Lead each idea with a plain-English **`.callout analogy`** ("In plain English…"),
  then give the **precise technical statement** (`.takeaway` + prose). Layman first, then rigorous.
- **Multiple examples.** 2–3 short **Python** examples per idea that *show the move*, not toy fluff.
  Re-express the book's Java/C++ in clean, idiomatic Python.
- **Show the refactor.** Where the idea is "change shape X into shape Y" (shallow→deep,
  tactical→strategic, leaky→hidden, obscure→obvious), use the **`.refactor` before→after viewer**.
- **Crisp.** No walls of text. Prefer a callout, a `.versus`, a `.kv`, a table, a short code block,
  or a `.refactor` over a long paragraph. Aim **4–6 `<section>`s** per lesson.
- **One quiz.** End-ish with **≥1 `.quiz`** ("check yourself"). Optionally a `.deeper` for a nuance.
- **Cross-link lightly.** Where an idea overlaps the sibling **LLD guide**, add ONE
  `.callout note` "See also" with a relative link `../../lld-guide/…` (depth from a lesson is two
  levels up). Keep these rare.
- Code uses Python. APOSD is timeless — don't date-stamp content.

**Per lesson, REQUIRED:** one `.callout analogy`, a `.takeaway`, **≥2** Python examples (code blocks
and/or a `.refactor`), **≥1** `.callout gotcha` (a classic trap / red flag), **≥1** `.quiz`.

---

## 1. Fragment skeleton (this is the WHOLE file you write)

```html
<section class="hero reveal">
  <span class="eyebrow">MODULE · short tag</span>
  <h1>Lesson title.</h1>
  <p class="lead">1–2 sentences: the idea and why it matters for managing complexity.</p>
</section>

<section class="section reveal" id="idea">
  <h2><span class="section-num">01</span> The idea</h2>
  <p class="takeaway">One-line essence with <b>the key term bolded</b>.</p>
  <div class="callout analogy"> … In plain English … </div>
  <p>2–3 sentence precise explanation.</p>
</section>

<!-- 2–4 middle sections: the technique, a Python example or .refactor, a .versus, a .gotcha -->

<section class="section reveal" id="check">
  <h2><span class="section-num">0N</span> Check yourself</h2>
  <div class="quiz" data-quiz> … </div>
</section>
```

**Hard rules**
- Do **NOT** write `<head>`, sidebar, topbar, footer, `<script>`, the `.content`/`.prose` wrappers,
  the right-rail `.toc`, the `.page-nav`, or the `.lesson-complete` button. The generator adds them.
- The **hero** section has **no `id`** (so it's excluded from the auto-TOC).
- Every other `<section>` **must have a unique kebab-case `id`**. Aim for ≥3 id'd sections so the
  page gets a TOC.
- Inside `<code>`, escape `<`→`&lt;` and `>`→`&gt;` (the verifier rejects a raw `<` in `<code>`).
- Any page using a component class (`.refactor`, `.flashdeck`) must load its engine — that is set in
  the manifest `widgets` for the page (already done for every lesson via `refactor.js`).

---

## 2. Component library (copy these exactly)

**Callouts** — `analogy` (lightbulb) · `gotcha` (warning/red flag) · `tip` (check) · `note` (info):
```html
<div class="callout analogy"><span class="co-ic"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18h6M10 22h4M12 2a7 7 0 0 0-4 12.7c.6.5 1 1.3 1 2.1h6c0-.8.4-1.6 1-2.1A7 7 0 0 0 12 2Z"/></svg></span><div class="co-body"><div class="co-title">In plain English <span class="tag">analogy</span></div><p>…</p></div></div>
```
- gotcha icon: `<path d="M10.3 3.6 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.6a2 2 0 0 0-3.4 0Z"/><path d="M12 9v4M12 17h.01"/>` · title "Red flag" + `<span class="tag">gotcha</span>`
- tip icon: `<path d="M22 11.1V12a10 10 0 1 1-5.9-9.1"/><path d="M22 4 12 14.01l-3-3"/>` · title "Pro tip"
- note icon: `<circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/>` · title "See also" (used for LLD cross-links)

**Takeaway** (one-line essence, accent left-border): `<p class="takeaway">…<b>bold</b>…</p>`

**Code block** (Python; `data-lang="python"` drives the highlighter; head is optional but nice):
```html
<div class="codeblock">
  <div class="code-head"><div class="code-dots"><i></i><i></i><i></i></div><span class="code-file">file.py</span><button class="code-copy"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15V5a2 2 0 0 1 2-2h10"/></svg><span class="clabel">Copy</span></button></div>
  <pre><code data-lang="python">def greet(name):
    return f"hi {name}"</code></pre>
</div>
```
Optional caption under a block: `<p class="code-cap">…</p>`. For shell, add class `shell` to
`.codeblock` and `data-lang="bash"`.

**Before → After refactor viewer** (`.refactor`; the signature widget — needs `refactor.js`, already
wired). Both panes are real `.codeblock`s; the engine adds a Before|After toggle on narrow screens:
```html
<div class="refactor" data-refactor>
  <div class="rf-grid">
    <div class="rf-pane rf-before"><div class="rf-h">Before · shallow</div>
      <div class="codeblock"><pre><code data-lang="python"># the shallow / tactical / obscure version
...</code></pre></div></div>
    <div class="rf-pane rf-after"><div class="rf-h">After · deep</div>
      <div class="codeblock"><pre><code data-lang="python"># the deep / strategic / obvious version
...</code></pre></div></div>
  </div>
  <p class="rf-why"><b>Why it's better:</b> one sharp sentence on the complexity removed.</p>
</div>
```
Label conventions for `.rf-h`: `Before · shallow` / `After · deep`, `Before · tactical` /
`After · strategic`, `Before · leaky` / `After · hidden`, `Before · obscure` / `After · obvious`.

**Concept two-up** (prose or code, good vs bad): `.versus` with `.vs-col vs-bad` / `.vs-col vs-good`,
each opening with `<div class="vs-h">…</div>`.

**Quiz** (mark the correct option `data-correct="true"`):
```html
<div class="quiz" data-quiz>
  <p class="q">Question?</p>
  <div class="quiz-opts">
    <button class="quiz-opt" data-correct="true"><span class="mark"></span>Right answer.</button>
    <button class="quiz-opt"><span class="mark"></span>A tempting wrong answer.</button>
  </div>
  <div class="quiz-explain"><b>Right.</b> Why — and name the trap.</div>
</div>
```

**Other shared pieces:** `.deeper` (collapsible "go deeper" — `<details class="deeper"><summary>…<span class="tag">deeper</span></summary><div class="deeper-body">…</div></details>`),
`.kv` (`<dl class="kv"><dt>Term</dt><dd>…</dd></dl>`), `.table-wrap > table`, `.steps`,
`.grid grid-2/grid-3` + `.card`/`.feature`, `.pill`, `.badge`. `details.qa` (in `.qa-set`) for
worked examples if a lesson wants them. SVG diagrams go in `.diagram` (see styles.css).

---

## 3. Reference & home pages

- **Home `index.html`** (`tools/content/index.html`): hero + the big idea, a `.grid grid-2` of
  `.tool-card[data-tc="complexity|modules|craft|judgment|reference"]` module cards, a short
  "how to read", the `.progress-dash` dashboard markup, and one LLD cross-link `.callout note`.
- **`reference/red-flags`**: a `.sheet-grid` of `.sheet` cards (one per theme) listing each red flag
  + a one-line fix; plus a short "design principles" list.
- **`reference/flashcards`**: `<div class="flashdeck" data-deck="aposd">` with `.fd-controls`
  (progress + Shuffle + Reset) and a `.fd-cards` list of `.flashcard` (front = principle / red flag,
  back = meaning / fix). Both faces live in the DOM.

---

## 4. Crispness guardrails (hard limits)
- Lead idea per concept: **2–3 sentences (≤55 words)**. Overflow → a list / table / kv / code /
  `.refactor`, never a longer paragraph.
- **4–6 sections** per lesson. One analogy, one takeaway, ≥2 Python examples, ≥1 gotcha, ≥1 quiz.
- Prefer a **refactor / code / table** over a paragraph. No exhaustive theory dumps — teach the
  move, prove it on examples, name the trap.
- Use ONLY the documented components. Escape `<`/`>` inside `<code>`.

When done, return a short list of the files you created.
