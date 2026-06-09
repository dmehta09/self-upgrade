# DevOps Field Guide

A sharp, **visual**, interview-ready guide to the modern pro DevOps engineer journey — basic → pro, **AWS-first**, as of **June 2026**. Not comprehensive: every concept gets a plain-English analogy, a diagram or interactive engine, a couple of crisp examples, and the trade-off an interviewer will probe. Each lesson ends with an "interview rapid-fire," and there's a dedicated interview hub.

> Core observability (logs, metrics, traces, OpenTelemetry, Prometheus, Grafana, SLO burn-rate math) lives in the sibling **`observability-guide`** — this guide stays on the DevOps side and cross-links.

## Open it
- Just open `index.html` in a browser, **or**
- `python3 -m http.server` then visit `http://localhost:8000` (so in-site search + progress behave exactly like production).

Works fully offline (Google Fonts degrade gracefully to system fonts). Dark/light theme toggle and per-lesson progress persist in your browser.

## What's inside (~30 pages)
- **Foundations** — what DevOps is, the delivery lifecycle & 2026 toolchain, DORA metrics
- **Linux & Networking** — the OS + network bedrock every interview probes
- **Git & CI/CD** — branching models, continuous integration, continuous delivery
- **Containers** — images, Dockerfiles, running containers
- **Kubernetes** — the reconcile model, core objects, workloads & scaling
- **Infrastructure as Code** — the Terraform model, Terraform in practice
- **AWS for DevOps** — compute & networking, containers & serverless, IAM/storage/data
- **Deploy strategies & GitOps** — blue-green/canary/rolling, GitOps with Argo CD/Flux
- **Reliability & Security** — incident response, postmortems & resilience, DevSecOps
- **Interview hub** — method, ~55-question bank, scenario walkthroughs, flashcards, cheat-sheet
- **Reference** — A–Z glossary

## Interactive engines
`reqflow` (animated pipelines/topologies) · `deploy-viz` (release-strategy traffic-shift player) · `tradeoff` (decision sliders) · `capacity` (back-of-envelope sizing) · `flashcards`. All dependency-free, theme-aware, and offline.

## Editing / regenerating
Content lives as **section-only fragments** in `tools/content/<dir>-<slug>.html`. The site map is `tools/manifest.js`. After editing:

```bash
node tools/gen.js               # assemble pages from fragments
node tools/build-search-index.js # rebuild the search index
node tools/verify.js            # validate links, anchors, escaping, JSON, wiring
```

Authoring rules and component/engine markup: **`tools/AUTHORING.md`**. Full regeneration spec: **`prompt.md`**.
