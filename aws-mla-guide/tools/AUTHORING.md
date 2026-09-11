# Authoring — AWS MLA Field Guide

Self-contained **MLA-C02** exam track (classic MLOps + Bedrock/RAG/agents). As of September 2026.

## Non-negotiables

- **Self-contained:** never link to `aws-saa-guide/`, `devops-guide/`, or other field guides for substance.
- **Do not paste** other guides. Research official MLA-C02 outline + current AWS docs; add **only exam decision material**.
- Prefer Mermaid decision trees and short **Acme Health** / **Ledger Bank** stories over service encyclopedias.
- Thin networking/IAM only where ML stems need it (endpoint roles, VPC for training) — not a second SAA guide.
- Audience: basic ML assumed; teach AWS ML/GenAI services and **constraint → architecture** judgment.

## Build

```bash
./bin/guide build aws-mla-guide
./bin/guide verify aws-mla-guide
```

Fragments live in `tools/content/<module>/<slug>.html`. `tools/gen.js` wraps shell, TOC, prev/next, lessons.js.

## Brand

- Teal accent (`theme.css` + `aws-mla.css`)
- localStorage: `aws-mla-theme`, `aws-mla-progress`, `aws-mla-cards`

## Pedagogy

- Visualization-first: Mermaid / reqflow / tradeoff when a path teaches.
- Exam surfaces: scenarios with walkthroughs; mock items with `why` + `lesson` ids.
- GenAI woven through data/model/deploy/ops — not a bolted appendix.

## Depth rule

If a topic won't appear as an MLA stem chooser, skip it. Prefer one clear rule over five edge cases.
