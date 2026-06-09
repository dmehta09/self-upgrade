# Frontend Field Guide — Authoring Spec (read this fully before writing)

You are authoring **content fragments** for a static, offline HTML learning guide. A fragment is the page body that the generator (`tools/gen.js`) injects between the shared topbar and footer. You do **not** write `<head>`, sidebar, topbar, footer, or `<script>` tags — only the content block.

**Reference exemplar (study it, match its quality and rhythm):**
`tools/content/react-render-and-rerender.html` — a complete, gold-standard topic page.

**Write each fragment to:** `tools/content/<data-page>.html` where `<data-page>` = the folder path with `/`→`-` plus the slug. Examples: `react/index` → `react-index.html`; `nextjs/server-vs-client-components` → `nextjs-server-vs-client-components.html`; `interview/design-scenarios/autocomplete` → `interview-design-scenarios-autocomplete.html`.

---

## 0. Audience, voice, and the prime directive

The reader **already uses** React, Next.js, Vite, Tailwind, and shadcn/ui. They want to go **basic → pro** and **crack interviews** (June 2026). So:

- **SHARP AND CRISP, never comprehensive.** Short paragraphs (2–3 sentences, ≤ ~60 words). If it needs more, use a `.kv`, table, list, `.versus`, or a visualizer — not a longer paragraph.
- **Analogy-first, then technical.** Exactly **one** `.callout analogy` per page, near the top, in plain layman terms. Then the precise version.
- **Multiple examples.** 2–3 short worked examples per key concept (code, a `.versus`, or a `.steps` trace).
- **Visual.** Each topic page has its assigned visualizer **or** a `.flow`/`.diagram`/`.steps`/`.table-wrap`. Prefer showing over telling.
- **Interview-ready.** Every topic page ends with a short inline Q&A (`.qa-set`, 2–3 items) each carrying a **"Say it out loud"** spoken version.
- **Skip basics they know:** no HTML/CSS/flexbox/JS-language tutorials. Assume working fluency.

**Per page, REQUIRED:** one analogy callout, one primary visual, **≥1** `.callout gotcha`, **≥1** `.quiz`, **2–3** inline Q&A with "say it out loud", a `.lesson-complete` button, a `.page-nav`, and a right-rail `.toc`. Keep each topic page to **3–6 `<section>`s**.

---

## 1. Fragment skeleton (copy this shape)

```html
      <div class="content has-toc" id="main">
        <div class="prose">

          <section class="hero reveal">
            <span class="eyebrow">MODULE · topic</span>
            <h1>Page title</h1>
            <p class="lead">1–3 sentences: what this is and why it matters for a pro.</p>
          </section>

          <section class="section reveal" id="idea">
            <h2><span class="section-num">00</span> The idea</h2>
            <p class="takeaway">One-line essence with <b>bolded</b> key terms.</p>
            <p>2–3 sentence technical-but-plain explanation.</p>
            <div class="callout analogy">…</div>
            <!-- the page's primary visual goes here (engine OR .flow/.diagram) -->
            <dl class="kv">…</dl>
          </section>

          <section class="section reveal" id="...">
            <h2><span class="section-num">01</span> …</h2>
            … 1 point + 1 code block; add .versus / .steps / .callout gotcha / .quiz as needed …
          </section>

          <!-- more sections (total 3–6) … last is the interview Q&A -->
          <section class="section reveal" id="interview">
            <h2><span class="section-num">0N</span> Interview rapid-fire</h2>
            <div class="qa-set">… 2–3 details.qa …</div>
          </section>

          <button class="lesson-complete" type="button"><span class="lc-box">&#10003;</span><span class="lc-text"></span></button>

          <nav class="page-nav reveal">
            <a href="PREV.html"><span class="pn-k">Previous</span><span class="pn-t">Prev title</span></a>
            <a class="next" href="NEXT.html"><span class="pn-k">Next &rsaquo;</span><span class="pn-t">Next title</span></a>
          </nav>
        </div>

        <nav class="toc">
          <h5>On this page</h5>
          <a href="#idea">The idea</a>
          <!-- one <a href="#id"> per section id, in order -->
        </nav>
      </div>
```

**Module index pages** (`<module>/index.html`): use `<div class="content" id="main">` (NO `has-toc`, no `.toc`). A hero + a short "what's here / why it matters" + a `.grid.grid-2`/`.grid-3` of `.card` links to the module's pages (or a `.steps` reading order) + page-nav + `lesson-complete`. Keep it to ~1 screen.

**Links are relative to the page's own folder.** Same-folder siblings: `href="hooks-deep-dive.html"`. The module index: `href="index.html"`. Home: from a module page `href="../index.html"`; from `interview/design-scenarios/*` use `href="../../index.html"`. Cross-module: `href="../nextjs/server-vs-client-components.html"`. The verifier checks every link + anchor resolves, so keep them correct.

---

## 2. Component library (copy-paste; use these classes exactly)

**Callouts** — variants `analogy` (lightbulb), `gotcha` (warning), `tip` (check), `note` (info). Use the matching SVG:
```html
<div class="callout analogy"><span class="co-ic"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18h6M10 22h4M12 2a7 7 0 0 0-4 12.7c.6.5 1 1.3 1 2.1h6c0-.8.4-1.6 1-2.1A7 7 0 0 0 12 2Z"/></svg></span><div class="co-body"><div class="co-title">Think of it like… <span class="tag">analogy</span></div><p>…</p></div></div>
```
- gotcha icon: `<path d="M10.3 3.6 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.6a2 2 0 0 0-3.4 0Z"/><path d="M12 9v4M12 17h.01"/>` · title e.g. "Common trap" + `<span class="tag">gotcha</span>`
- tip icon: `<path d="M22 11.1V12a10 10 0 1 1-5.9-9.1"/><path d="M22 4 12 14.01l-3-3"/>` · title "Pro tip"
- note icon: `<circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/>` · title "Heads up"

**Key-value spec list:**
```html
<dl class="kv"><dt>Term</dt><dd>Definition with <code>inline code</code>.</dd> …</dl>
```

**Code block** (always set `data-lang`; ESCAPE `<`→`&lt;` and `>`→`&gt;` INSIDE `<code>` — JSX will break the build otherwise). Optional filename via `.code-file`:
```html
<div class="codeblock">
  <div class="code-head"><div class="code-dots"><i></i><i></i><i></i></div><span class="code-file">Example.tsx</span><button class="code-copy"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15V5a2 2 0 0 1 2-2h10"/></svg><span class="clabel">Copy</span></button></div>
  <pre><code data-lang="tsx">const x = &lt;div /&gt;;</code></pre>
</div>
```
`data-lang` values: `tsx` (default, React/TS), `ts`, `js`, `jsx`, `json`, `bash`, `css`, `html`, `text`. (CSS/HTML are highlighted as text — fine.)

**Good-vs-bad two-up:**
```html
<div class="versus">
  <div class="vs-col vs-bad"><div class="vs-h">Anti-pattern</div><div class="codeblock"><pre><code data-lang="tsx">…</code></pre></div></div>
  <div class="vs-col vs-good"><div class="vs-h">Better</div><div class="codeblock"><pre><code data-lang="tsx">…</code></pre></div></div>
</div>
```

**Quiz** (instant feedback; mark the correct option `data-correct="true"`):
```html
<div class="quiz" data-quiz>
  <p class="q">Question?</p>
  <div class="quiz-opts">
    <button class="quiz-opt" data-correct="true"><span class="mark"></span>Right answer.</button>
    <button class="quiz-opt"><span class="mark"></span>Distractor.</button>
  </div>
  <div class="quiz-explain"><b>Right.</b> Why.</div>
</div>
```

**Collapsible "go deeper"** (one optional rabbit-hole max per page):
```html
<details class="deeper"><summary><svg class="chev" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m9 6 6 6-6 6"/></svg> Title <span class="tag">optional</span></summary><div class="deeper-body"><p>…</p></div></details>
```

**Inline interview Q&A** (the `.qa-set` block; difficulty chip = `diff-warm`|`diff-core`|`diff-stretch`):
```html
<div class="qa-set">
  <details class="qa">
    <summary><svg class="chev" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m9 6 6 6-6 6"/></svg><span class="qa-q">Question?</span><span class="pm-chip diff-core">core</span></summary>
    <div class="qa-body">
      <h5>Model answer</h5>
      <p>Precise 2–4 sentence answer.</p>
      <div class="callout tip qa-say"><span class="co-ic"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.1V12a10 10 0 1 1-5.9-9.1"/><path d="M22 4 12 14.01l-3-3"/></svg></span><div class="co-body"><div class="co-title">Say it out loud <span class="tag">say it</span></div><p>"Conversational 1–2 sentence spoken version."</p></div></div>
      <div class="qa-followups"><h5>Follow-ups to expect</h5><ul><li>…</li></ul></div> <!-- optional -->
    </div>
  </details>
</div>
```

**Steps / sequence trace:**
```html
<div class="steps"><div class="step"><span class="step-num">1</span><div class="step-body"><h4>Title</h4><p>What happens.</p></div></div> …</div>
```

**Flow of boxes** (great for a simple pipeline/lifecycle when no engine is assigned):
```html
<div class="diagram"><div class="dg-title">Title</div>
  <div class="flow">
    <div class="flow-node"><div class="fn-k">step</div><div class="fn-t">Name</div><div class="fn-d">detail</div></div>
    <div class="flow-arrow"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg></div>
    <div class="flow-node">…</div>
  </div>
</div>
```

**Comparison table:**
```html
<div class="table-wrap"><table><thead><tr><th>…</th><th>…</th></tr></thead><tbody><tr><td><strong>…</strong></td><td>…</td></tr></tbody></table></div>
```

**Cards grid** (module index / link lists):
```html
<div class="grid grid-2">
  <a class="card feature" href="page.html"><div class="f-ic"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"/></svg></div><h4>Title</h4><p>One line.</p></a>
</div>
```

---

## 3. Visualizer engines (use ONLY the one assigned to a page)

Each engine auto-mounts from a `<figure>` + inline JSON config. Use an engine **only on the page told to** (its `<script>` is loaded only there). Everywhere else use `.flow`/`.steps`/`.diagram`/`.table-wrap`. Always include a `<p class="viz-fallback">` plain-text summary for no-JS.

**render-viz** (mount `class="viz renderviz" data-renderviz`, config class `rv-config`): render→reconcile→commit + memo pruning. See the exemplar for the full config. Shape: `{title, phases:["trigger","render","commit"], tree:{id,memo?,children[]}, frames:[{phase,caption,rerender[],skipped[],committed[]}]}`.

**effect-timeline** (`class="viz efftimeline" data-efftimeline`, `et-config`): `{title, lanes:["render","commit (DOM)","effect","cleanup"], passes:["mount","dep change","unmount"], frames:[{col,lane,note?,caption}]}` — frames light cumulatively; the `cleanup` lane shows red.

**rsc-boundary** (`class="viz rscviz" data-rscviz`, `rsc-config`): `{title, tree:{id,kind:"server"|"client",toggle?,children[]}, kb?, note}` — interactive; toggling a node flips its directive and updates server/client bundle meters.

**waterfall-viz** (`class="viz waterfall" data-waterfall`, `wf-config`): `{title, scaleMs, strategies:[{name, fcp, bars:[{label, t:[start,end], kind}]}], legend:true}` — kinds: `html|js|data|server|stream|static|hydrate`.

**tw-playground** (`class="viz twplay" data-twplay`, `tw-config`): `{title, start:"<classes>", preview:"<div class=\"twp-box\">A</div>…", presets:[{label,classes}], note}` — only the curated utility subset in frontend.css renders (flex/grid/gap-*/p-*/m-*/items-*/justify-*/rounded-*/bg-{white,black,slate-*,cyan-500,violet-500,rose-500,emerald-500,amber-400,brand}/text-*/font-*/border/shadow*/w-*/h-*/ring). Keep presets within that subset.

Embed pattern (all engines):
```html
<figure class="viz renderviz" data-renderviz>
  <figcaption class="viz-title">Short title</figcaption>
  <script type="application/json" class="rv-config">{ …valid JSON… }</script>
  <p class="viz-fallback">Plain-text description of what the animation shows.</p>
</figure>
```
The inline JSON **must be valid JSON** (double-quoted keys/strings, no trailing commas) — the verifier parses it.

---

## 4. Version facts — June 2026 (USE THESE; they differ from older knowledge)

Write everything as current to **June 2026**. Key facts (state versions naturally where relevant; don't date-stamp every line):

**React 19.2** (stable). React Compiler **1.0 is GA/stable** (since Oct 2025) — auto-memoizes; treat manual `memo`/`useMemo`/`useCallback` as for measured hotspots. Stable & correctly named: **Actions**, **`useActionState`** (NOT `useFormState`), **`useOptimistic`**, **`useFormStatus`**, **`use()`** (read promises/context), **`ref` as a normal prop** (no `forwardRef` for new components), document-metadata hoisting, `<Context>` as a provider. 19.2 also added `<Activity>`, `useEffectEvent`, View Transitions.

**Next.js 16.2** (App Router is the default). BIG changes vs older Next:
- **PPR's `experimental.ppr` flag is GONE.** Partial prerendering now ships via **Cache Components** — enable with **`cacheComponents: true`** in `next.config.ts`. Caching is **dynamic-by-default**; you opt INTO caching with the **`"use cache"`** directive (compiler derives cache keys). `unstable_cache` is superseded by `"use cache"`.
- `revalidateTag(tag, profile)` now takes a **cache-life profile** 2nd arg; new **`updateTag()`** (read-your-writes in Server Actions) and **`refresh()`** (uncached). `revalidatePath` still exists.
- **Turbopack is STABLE and the DEFAULT** for both `next dev` AND `next build` (opt out `--webpack`).
- **`middleware.ts` → `proxy.ts`** (middleware deprecated). `params`, `searchParams`, `cookies()`, `headers()` are **async** (await them). Node 20.9+. Server Actions are stable.

**Core Web Vitals:** **LCP ≤ 2.5 s**, **INP ≤ 200 ms** (INP replaced FID), **CLS ≤ 0.1** (75th percentile field data).

**Vercel:** **Fluid compute** is the model; runtimes = Node.js (default), Edge, etc. Standalone Edge Functions deprecated (Apr 2026) — recommend Vercel Functions on the Node.js runtime; Edge runtime still used for routing/proxy.

**Tailwind CSS v4.3** — CSS-first: single `@import "tailwindcss";` + `@theme { --color-…: … }` (NO `tailwind.config.js`; it's legacy via `@config`). Oxide engine; `@utility`/`@custom-variant`; native `@container`; tokens are real CSS variables.

**shadcn/ui** — CLI is **`npx shadcn@latest`** (the old `shadcn-ui` is gone). Works with Tailwind v4 + React 19. Copy-in (you own the code), Radix primitives, **`cva`** variants, theming via CSS variables. **`cn()` = `twMerge(clsx(...))`**. Default style is now **`new-york`**; colors use **OKLCH**; components ship `data-slot`; no `forwardRef`.

**TanStack Query v5** — `gcTime` (was `cacheTime`), `isPending` (was `isLoading`), single-object signatures, `useSuspenseQuery`. It's a **server-state cache**, not client state.

**Zustand v5** — `create`, selectors, and **`useShallow`** for object/array selectors (in v5 a raw object selector without `useShallow` can cause infinite loops). For true client/UI state.

**Vite 8** (Rolldown is the default bundler now). **Vitest 4** (Browser Mode stable). **Playwright 1.6x** — `@playwright/test`, locators, `getByRole`. **ESLint 10** — flat config (`eslint.config.js`) is the ONLY format; with **typescript-eslint 8**. **Biome 2** — fast all-in-one lint+format alternative. **pnpm 11** (bun is the fast challenger). **react-hook-form 7.x** + **`@hookform/resolvers` `zodResolver`** + **Zod 4** (stable; share schemas client/server).

If you're unsure of a current detail, you may use the context7 MCP (ToolSearch → `resolve-library-id` + docs query) to confirm — but the facts above are already verified.

---

## 5. Crispness guardrails (hard limits)

- Lead idea per concept: **2–3 sentences (≤60 words)**. Overflow → list/table/kv/visual.
- **3–6 sections** per topic page. One analogy, one primary visual, ≥1 gotcha, ≥1 quiz, 2–3 inline Q&A.
- Code blocks: **one point each, ≤ ~16 lines**, annotated with a comment or two, copyable, static (no live runner).
- No full app/config dumps; no exhaustive API tables. Link out mentally rather than reproducing reference docs.
- Don't invent UI the engines don't support. Stick to the documented components + the page's assigned engine.

When done with your assigned pages, write each fragment file, then return a short summary listing the files you created.
