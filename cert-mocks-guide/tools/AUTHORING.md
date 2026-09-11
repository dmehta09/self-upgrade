# Cert Mocks Guide — Authoring Spec

Author **fragments only** in `tools/content/<dir>-<slug>.html`.

## Mock pages (MCQ)

```html
<section class="hero reveal">...</section>
<section class="section reveal" id="mock">
  <h2>...</h2>
  <div data-mock></div>
  <script type="application/json" id="mockBank">
  { "minutes": 130, "label": "SAA-C03 · Mock 1", "passHint": "Practice bar ≥72%.", "questions": [ ... ] }
  </script>
</section>
<section class="section reveal" id="check">...</section>
```

Each question: `domain`, `stem`, `choices` (4), `answer` (0-based index), `why`, `lesson` (path like `../../aws-saa-guide/...`).

## Mock pages (CKA tasks)

Use `<div data-task-mock></div>` and `tasks[]` with `domain`, `weight`, `stem`, `solutionSteps`, `verify`, `why`, `lesson`.

## Rules

- Full exam length: SAA/MLA 65 Q; CKA 17–18 tasks.
- Domain-weight the bank.
- Escape `&lt;` / `&gt;` in code; never embed `tok-prompt` spans.
- Modern 2026 defaults (Gateway API, Bedrock/RAG/agents, Identity Center, etc.).
