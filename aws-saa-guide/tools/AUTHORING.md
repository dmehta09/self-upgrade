# AWS SAA Field Guide — Authoring Spec

You author **content fragments** only. `tools/gen.js` wraps the shell, TOC, prev/next, and “Mark as learned”.

**Write to:** `tools/content/<data-page>.html` where `<data-page>` = `folder-slug` (e.g. `networking-vpc-and-subnets.html`).

---

## 0. Audience, voice, prime directive

Zero AWS → **SAA-C03**. A **visual learner** who wants **simple language**, **multiple examples**, and **pictures that teach choices** — not service encyclopedias.

- **SHARP AND CRISP.** Short paragraphs (2–3 sentences, ≤ ~60 words). Overflow → a `.kv`, table, list, `.versus`, or a visual — never a longer paragraph.
- **Analogy-first, then technical.** Exactly **one** `.callout analogy` per page, near the top, in plain English (“In plain English…”). Then the precise AWS version.
- **Visualization-first.** Each concept page teaches a **choice or path**, not a static topology dump. Prefer:
  - **Decision Mermaid** (quoted human labels) when the exam asks “which service / pattern?”
  - **`.reqflow`** when a request hops through components (add `reqflow.js` to the manifest)
  - **`.tradeoff`** when two axes collide (cost vs RTO, features vs static IP) — add `tradeoff.js`
  - `.versus` / `.diagram` / `.steps` when engines are overkill
- **Multiple examples.** **2–3 short named stories** per key concept (e.g. “Acme tickets”, “payments ledger”). The quiz alone does **not** count as an example.
- **Exam-ready.** Last section `id="interview"` (or `check` for pure reference): 2–3 `details.qa` with **Say it out loud**.
- **2026 defaults.** Roles + Identity Center over long-lived keys; gateway/interface endpoints over NAT-for-AWS APIs; Intelligent-Tiering; Graviton / Savings Plans where relevant; Multi-AZ ≠ read replica; CloudFront ≠ Global Accelerator.

**Per concept page, REQUIRED:** one analogy, one **teaching** primary visual, ≥1 gotcha, ≥1 quiz, 2–3 say-it Q&As. Keep **4–6** `<section>`s (use 5–6 when adding a worked stem).

---

## 1. Fragment skeleton

```html
<section class="hero reveal">
  <span class="eyebrow">MODULE · topic</span>
  <span class="domain-chip">Domain N · …</span>
  <h1>Page title.</h1>
  <p class="lead">1–3 sentences: what this is and why SAA cares.</p>
</section>

<section class="section reveal" id="idea">
  <h2><span class="section-num">01</span> The idea</h2>
  <p class="takeaway">One-line essence with <b>bolded</b> key terms.</p>
  <p>2–3 sentence plain explanation.</p>
  <div class="callout analogy">… In plain English …</div>
  <!-- primary visual: decision Mermaid, reqflow, tradeoff, versus, or diagram -->
</section>

<!-- more sections; optional id="worked" with one exam stem walkthrough -->

<section class="section reveal" id="interview">
  <h2><span class="section-num">0N</span> Exam rapid-fire</h2>
  <div class="qa-set"> … 2–3 details.qa … </div>
</section>
```

**Hard rules**
- Do **NOT** write `<head>`, sidebar, scripts, `.toc`, `.page-nav`, `.lesson-complete`.
- Hero has **no `id`**. Every other section needs a kebab-case `id`.
- Last section: **`interview`** (concept) or **`check`** (reference).
- Escape `&lt;` / `&gt;` inside any `<code>`.

---

## 2. Mermaid (human labels)

```html
<div class="mermaid-wrap"><pre class="mermaid">flowchart TD
  start["Need private AWS access?"] --> decide{"AWS API only?"}
  decide -->|yes| ep["Gateway or interface endpoint"]
  decide -->|no| nat["NAT Gateway"]
</pre></div>
```

- Node **IDs**: no spaces (`decide`, `ep`). Labels: **quoted plain English** (`["Public subnet · AZ-a"]`) — never `Public_subnet_AZa`.
- Prefer **decision trees** over stars or cost ladders that don’t teach picking.
- Add `widgets: ["mermaid-init.js"]` in `tools/manifest.js` for that page.

---

## 3. Reqflow & tradeoff (gold patterns)

Copy structure from `networking-vpc-and-subnets.html` (reqflow) and `resilience-dr-rpo-rto.html` (tradeoff). Always include `.viz-fallback` text under reqflow. Manifest must list `reqflow.js` / `tradeoff.js`.

---

## 4. Worked exam stem (optional 5th section)

When deepening a high-weight page, add:

1. Underline the **constraint** in the stem  
2. Eliminate **two** distractors with one line each  
3. State the **best answer** and why  
4. Optional mini Mermaid / reqflow  

---

## 5. Exam surfaces

| Surface | Standard |
|---------|----------|
| **Timed mock** | Each question: `why` + `lesson` path; after score show ✓/✗ + explain + link |
| **Scenario bank** | Flagship cards: constraint → eliminate → answer → say-it → optional visual; compact cards: Best/Why + lesson link |
| **Flashcards / cheat-sheet** | Short recall — OK as one-liners |

---

## 6. Cross-links (isolation)

- Link **only** to other lessons inside `aws-saa-guide/`.
- **Never** paste or mirror content from other field guides.
- Add material only when it is **needed to pass SAA-C03** (constraint → architecture choice). Rewrite in this guide’s voice; skip interview culture, sizing calculators, and soft-skill filler.

---

## Do not write

`<head>`, sidebar, footer, scripts, `.toc`, `.page-nav`, `.lesson-complete`.
