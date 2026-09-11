# AWS SAA Field Guide — Authoring Spec

You author **content fragments** only. `tools/gen.js` wraps the shell, TOC, prev/next, and “Mark as learned”.

**Write to:** `tools/content/<data-page>.html` where `<data-page>` = `folder-slug` (e.g. `networking-vpc-and-subnets.html`).

## Audience
Zero-to-SAA-C03. Sharp and crisp. Analogy once per page. Prefer Mermaid (`.mermaid-wrap` + `pre.mermaid`, no spaces in node IDs) or `.versus` / `.diagram` over long prose.

## Required per concept page
1. Hero (no id) with eyebrow + lead; optional `<span class="domain-chip">Domain N · …</span>`
2. 4–6 id'd sections; last id = `interview` (exam rapid-fire) OR `check` for pure reference
3. One `.callout analogy`
4. One primary visual (Mermaid / versus / diagram / flow)
5. ≥1 `.callout gotcha`, ≥1 `.quiz`, 2–3 `details.qa` with “Say it out loud”
6. Escape `&lt;` / `&gt;` inside `<code>`
7. Cross-link `../../devops-guide/aws/...` when overlapping interview topics

## Mermaid
```html
<div class="mermaid-wrap"><pre class="mermaid">flowchart TD
  start[Start] --> decide{Decision}
  decide -->|yes| a[OptionA]
  decide -->|no| b[OptionB]
</pre></div>
```
Add `widgets: ["mermaid-init.js"]` in the manifest for that page.

## Do not write
`<head>`, sidebar, scripts, `.toc`, `.page-nav`, `.lesson-complete`.
