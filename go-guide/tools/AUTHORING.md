# Go — a visual guide — Authoring Spec (read fully before writing)

You author **content fragments** for a static, offline HTML guide to the Go programming language.
The generator (`tools/gen.js`) wraps your fragment in the shared shell and **auto-generates** the
`<head>`, sidebar, breadcrumb, right-rail TOC, prev/next page-nav, and the "Mark as learned" button.
You write **ONLY the `<section>`s**.

**Write each fragment to:** `tools/content/<data-page>.html`, where `<data-page>` = folder with `/`→`-`
plus slug. Examples: `language/arrays-slices` → `language-arrays-slices.html`;
`reference/flashcards` → `reference-flashcards.html`. Then run `node tools/gen.js`.

---

## 0. Audience, voice, prime directive

A backend engineer learning Go **and/or** prepping for a Go-heavy interview. A visual,
beginner-friendly learner who wants the idea to **click**, then become **interview-ready**.

- **Say it twice.** Lead each idea with a plain-English **`.callout analogy`** ("In plain English…"),
  then the **precise technical statement** (`.takeaway` + prose). Layman first, then rigorous.
- **Show, don't tell.** 2–3 short **Go** examples per idea that *show the mechanic*, not toy fluff.
- **Name the trap.** Every lesson teaches at least one **gotcha** (`.callout gotcha`) — the classic
  Go interview trap for that topic (see the gotchas list below).
- **Crisp.** No walls of text. Prefer a callout, a `.versus`, a `.kv`, a table, a short code block, or
  an **engine** over a long paragraph. Aim **4–6 `<section>`s** per lesson.
- **One quiz.** End-ish with **≥1 `.quiz`** ("check yourself").
- **Cross-link lightly.** Where an idea overlaps a sibling guide, add ONE `.callout note` "See also"
  with a relative link `../../<guide>/<path>.html` (depth from a lesson is two levels up). Rare.

**Currency (June 2026 — Go 1.26 era).** Anchor features to the version that shipped them: generics
(1.18), `slices`/`maps`/`cmp` + `min`/`max`/`clear` + `log/slog` (1.21), **per-iteration loop
variables** + range-over-int (1.22), range-over-func iterators + `iter` (1.23), generic type aliases +
`testing.B.Loop` (1.24), `sync.WaitGroup.Go` + container-aware `GOMAXPROCS` + `testing/synctest` (1.25).
Say "Go 1.26" for "latest". Never invent post-1.26 features; if unsure, say "recent Go".

**Per lesson, REQUIRED:** one `.callout analogy`, a `.takeaway`, **≥2** Go examples (code blocks and/or
an engine), **≥1** `.callout gotcha`, **≥1** `.quiz`.

---

## 1. Fragment skeleton (this is the WHOLE file you write)

```html
<section class="hero reveal">
  <span class="eyebrow">MODULE · short tag</span>
  <h1>Lesson title.</h1>
  <p class="lead">1–2 sentences: the idea and why it matters in real Go.</p>
</section>

<section class="section reveal" id="the-idea">
  <h2><span class="section-num">01</span> The idea</h2>
  <p class="takeaway">One-line essence with <b>the key term bolded</b>.</p>
  <div class="callout analogy"> … In plain English … </div>
  <p>2–3 sentence precise explanation.</p>
</section>

<!-- 2–4 middle sections: the mechanic, a code example or engine, a .versus, a .gotcha -->

<section class="section reveal" id="check">
  <h2><span class="section-num">0N</span> Check yourself</h2>
  <div class="quiz" data-quiz> … </div>
</section>
```

**Hard rules**
- Do **NOT** write `<head>`, sidebar, topbar, footer, `<script>`, the `.content`/`.prose` wrappers,
  the right-rail `.toc`, the `.page-nav`, or the `.lesson-complete` button. The generator adds them.
- The **hero** section has **no `id`** (so it's excluded from the auto-TOC).
- Every other `<section>` **must have a unique kebab-case `id`**. Aim for ≥3 id'd sections (→ a TOC).
- **CRITICAL — escaping inside `<code>`:** Go is full of `<`, `<-`, `<=`, `[]T`, `map[K]V`. Inside any
  `<code>` (and inside `.codeblock pre code`), write `<`→`&lt;` and `>`→`&gt;`. The verifier **rejects a
  raw `<` inside `<code>`** and will fail the build. (Channel receive `<-ch` → `&lt;-ch`; `if a < b` →
  `if a &lt; b`; `chan<- int` → `chan&lt;- int`.) **Exception:** code inside a **gopad** `<script
  type="text/plain">` is NOT inside `<code>` — write it raw there (no escaping needed).
- Any page using an engine/component class must load its script — that's set per-page in the manifest
  `widgets` array (already wired for each lesson). If you add an engine to a page, ensure its widget is
  in the manifest.

---

## 2. Component library (copy these exactly)

**Callouts** — `analogy` (lightbulb) · `gotcha` (red flag) · `tip` (check) · `note` (see-also):
```html
<div class="callout analogy"><span class="co-ic"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18h6M10 22h4M12 2a7 7 0 0 0-4 12.7c.6.5 1 1.3 1 2.1h6c0-.8.4-1.6 1-2.1A7 7 0 0 0 12 2Z"/></svg></span><div class="co-body"><div class="co-title">In plain English <span class="tag">analogy</span></div><p>…</p></div></div>
```
- gotcha icon path: `<path d="M10.3 3.6 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.6a2 2 0 0 0-3.4 0Z"/><path d="M12 9v4M12 17h.01"/>` · title "Gotcha" + `<span class="tag">trap</span>`
- tip icon path: `<path d="M22 11.1V12a10 10 0 1 1-5.9-9.1"/><path d="M22 4 12 14.01l-3-3"/>` · title "Pro tip"
- note icon path: `<circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/>` · title "See also"

**Takeaway** (one-line essence, accent left-border): `<p class="takeaway">…<b>bold</b>…</p>`

**Code block** (`data-lang="go"` drives the highlighter; the head row is optional but nice). **Escape
`<`/`>` inside `<code>`:**
```html
<div class="codeblock">
  <div class="code-head"><div class="code-dots"><i></i><i></i><i></i></div><span class="code-file">main.go</span><button class="code-copy"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15V5a2 2 0 0 1 2-2h10"/></svg><span class="clabel">Copy</span></button></div>
  <pre><code data-lang="go">func max[T cmp.Ordered](a, b T) T {
    if a &lt; b {
        return b
    }
    return a
}</code></pre>
</div>
```
For shell, add class `shell` to `.codeblock` and use `data-lang="bash"`.

**Concept two-up** (good vs bad): `.versus` with `.vs-col vs-bad` / `.vs-col vs-good`, each opening with
`<div class="vs-h">…</div>`. Use for idiomatic-vs-not.

**Quiz** (mark the correct option `data-correct="true"`):
```html
<div class="quiz" data-quiz>
  <p class="q">What does this print?</p>
  <div class="quiz-opts">
    <button class="quiz-opt" data-correct="true"><span class="mark"></span>The right answer.</button>
    <button class="quiz-opt"><span class="mark"></span>A tempting wrong answer.</button>
  </div>
  <div class="quiz-explain"><b>Right.</b> Why — and name the trap.</div>
</div>
```

**Other shared pieces:** `.deeper` (`<details class="deeper"><summary>…<span class="tag">deeper</span></summary><div class="deeper-body">…</div></details>`),
`.kv` (`<dl class="kv"><dt>Term</dt><dd>…</dd></dl>`), `.table-wrap > table`, `.grid grid-2/grid-3` +
`.card`/`.feature`, `.pill`, `.badge`, `.statline`.

---

## 3. Engines (load via the page's manifest `widgets`)

**gopad** — runnable Go snippet, authored output (offline). Code + output live in `text/plain` scripts,
so write Go **raw** (no escaping) there:
```html
<div class="gopad" data-gopad data-file="main.go">
  <script type="text/plain" class="gp-code">package main

import "fmt"

func main() {
    s := []int{1, 2, 3}
    fmt.Println(len(s), cap(s))
}</script>
  <script type="text/plain" class="gp-output">3 3</script>
</div>
```

**slicelab** — slice header over a backing array (aliasing, len/cap, realloc). Each frame is full state;
`config` is `application/json` (the verifier parses it):
```html
<figure class="slicelab reveal" data-slicelab aria-label="Slice header over its backing array">
  <script type="application/json" class="sl-config">
  { "frames": [
    { "caption": "<code>s := make([]int, 3, 4)</code> — len 3, cap 4.",
      "arrays":  [ { "id": "A0", "cells": [1,2,3,0] } ],
      "headers": [ { "name": "s", "array": "A0", "start": 0, "len": 3, "cap": 4 } ] },
    { "caption": "<code>t := s[1:3]</code> shares the SAME array — <b>aliases s</b>.",
      "arrays":  [ { "id": "A0", "cells": [1,2,3,0] } ],
      "headers": [ { "name": "s", "array": "A0", "start": 0, "len": 3, "cap": 4 },
                   { "name": "t", "array": "A0", "start": 1, "len": 2, "cap": 3 } ],
      "alias": ["s","t"] }
  ] }
  </script>
</figure>
```
Captions may contain HTML (`<code>`, `<b>`). A cell is "used" if a header covers `[start,start+len)`,
"spare" for `[start+len,start+cap)`. `"changed": {"A0":[1]}` pulses a write; `"realloc": {"to":"A1"}`
tags a fresh array.

**deferstack** — call stack + deferred LIFO + panic/recover. `config` is `application/json`; each frame
is full state:
```html
<figure class="deferstack reveal" data-deferstack aria-label="defer / panic / recover">
  <script type="application/json" class="ds-config">
  { "frames": [
    { "caption": "f registers two defers (LIFO).",
      "stack": [ { "name": "main()" },
                 { "name": "f()", "state": "active", "defers": ["println(\"A\")","println(\"B\")"] } ],
      "output": "" },
    { "caption": "Returning runs <b>B then A</b> (last-in, first-out).",
      "stack": [ { "name": "main()" },
                 { "name": "f()", "state": "active", "running": 1, "defers": ["println(\"A\")","println(\"B\")"] } ],
      "output": "B" }
  ] }
  </script>
</figure>
```
`state`: `active|panicking|recovered`. `running` = index of the defer executing (LIFO → highest first).

---

## 4. The Go gotchas catalog (teach the one that fits the lesson)

loop-var capture (pre/post-1.22) · nil interface vs nil pointer · slice aliasing / append realloc ·
append to a shared slice (3-index cap) · map iteration order random · writing to a nil map panics ·
defer in a loop · defer args evaluated immediately · range copies the element · value vs pointer
receivers · closing channels / send-on-closed panics · struct comparability · nil/closed channel matrix ·
unsynchronised shared flag (memory model) · forgetting `cancel()` · copying a `sync.Mutex`/`WaitGroup`.

---

## 5. Crispness guardrails (hard limits)
- Lead idea per concept: **2–3 sentences (≤55 words)**. Overflow → a list / table / kv / code / engine.
- **4–6 sections** per lesson. One analogy, one takeaway, ≥2 Go examples, ≥1 gotcha, ≥1 quiz.
- Prefer a **code / engine / table** over a paragraph. Teach the mechanic, prove it, name the trap.
- Use ONLY the documented components. **Escape `<`/`>` inside `<code>`** (raw OK only in gopad scripts).

When done, return the list of files you created.
