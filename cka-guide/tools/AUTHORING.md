# CKA Field Guide — Authoring Spec

You author **content fragments** only. `tools/gen.js` wraps the shell, TOC, prev/next, and “Mark as learned”.

**Write to:** `tools/content/<data-page>.html` where `<data-page>` = `folder-slug` (e.g. `networking-gateway-api.html`).

---

## 0. Audience, voice, prime directive

Zero-to-fluent → **CKA (K8s v1.35)**. A **visual learner** who wants **simple language**, **command-first tasks**, and **pictures that teach choices** — not API encyclopedias.

- **SHARP AND CRISP.** Short paragraphs (2–3 sentences, ≤ ~60 words). Overflow → a `.kv`, table, list, `.versus`, or a visual.
- **Analogy-first, then technical.** Exactly **one** `.callout analogy` per page, near the top.
- **Visualization-first.** Prefer decision Mermaid, `.reqflow` (API → kubelet paths), `.tradeoff`, `.versus`, `.steps`.
- **Command-first.** High-weight pages include a worked kubectl task (constraint → commands → verify).
- **Exam-ready.** Last section `id="interview"` (or `check` for reference): 2–3 `details.qa` with **Say it out loud**.
- **2026 defaults.** Gateway API alongside Ingress; Helm + Kustomize; NetworkPolicies; containerd/CRI (not Docker-as-runtime); no deep etcd backup as core.

**Per concept page, REQUIRED:** one analogy, one **teaching** primary visual, ≥1 gotcha, ≥1 quiz, 2–3 say-it Q&As. Keep **4–6** `<section>`s.

---

## 1. Fragment skeleton

```html
<section class="hero reveal">
  <span class="eyebrow">MODULE · topic</span>
  <span class="domain-chip">Domain N · …</span>
  <h1>Page title.</h1>
  <p class="lead">1–3 sentences: what this is and why CKA cares.</p>
</section>

<section class="section reveal" id="idea">
  <h2><span class="section-num">01</span> The idea</h2>
  <p class="takeaway">One-line essence with <b>bolded</b> key terms.</p>
  <div class="callout analogy">… In plain English …</div>
</section>

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

## 2. Cross-links (isolation)

- Link **only** to other lessons inside `cka-guide/`.
- **Never** paste or mirror content from other field guides.
- Research from CNCF curriculum + kubernetes.io docs only.

---

## Do not write

`<head>`, sidebar, footer, scripts, `.toc`, `.page-nav`, `.lesson-complete`.
