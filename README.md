# Self-Upgrade — Projects Workspace

A personal workspace of hands-on learning projects. **Each project lives in its own top-level folder with its own `README.md`** (and optional `docs/`), so projects stay self-contained and easy to browse. This file is just the index.

**Live (phone-friendly):** [https://dmehta09.github.io/self-upgrade/](https://dmehta09.github.io/self-upgrade/) · Senior backend: [senior-backend-guide](https://dmehta09.github.io/self-upgrade/senior-backend-guide/)

**Local:** open [`index.html`](./index.html) — same hub offline.

---

## Projects

| Project | What it is | Status | Open |
|---|---|---|---|
| **[Claude & Claude Code](./claude-guide/index.html)** | Visual guide to **Claude** (models · API · prompting) + **Claude Code** (the agentic coding tool) — two tracks, animated session player, command explorer | ✅ Complete · Jun 2026 | [`claude-guide/index.html`](./claude-guide/index.html) |
| **[GenAI Field Guide](./genai-guide/index.html)** | The whole **generative-AI** stack — LLMs, transformers, RAG, agents, fine-tuning, multimodal — explained simply & interview-ready | ✅ Complete · Jun 2026 | [`genai-guide/index.html`](./genai-guide/index.html) |
| **[The Lang Stack](./langstack/index.html)** | A visual, beginner-first guide to **LangChain · LangGraph · LangSmith** | ✅ Complete · Jun 2026 | [`langstack/index.html`](./langstack/index.html) |
| **[FastAPI Field Guide](./fastapi-guide/index.html)** | **Python → FastAPI** from zero to a real backend (routing, validation, databases, auth, deploy) — with runnable code | ✅ Complete · Jun 2026 | [`fastapi-guide/index.html`](./fastapi-guide/index.html) |
| **[DSA Field Guide](./dsa-guide/index.html)** | **Data structures & algorithms** for interviews — ~30 problems sorted into patterns, ELI10 then real Python, with a visualizer | ✅ Complete · Jun 2026 | [`dsa-guide/index.html`](./dsa-guide/index.html) |
| **[Design Field Guide](./lld-guide/index.html)** | **Object-oriented & low-level design** — OOP, SOLID, Gang-of-Four patterns, and interview-style design problems | ✅ Complete · Jun 2026 | [`lld-guide/index.html`](./lld-guide/index.html) |
| **[System Design Field Guide](./sysdesign-guide/index.html)** | **High-level / distributed system design** for interviews — core concepts (CAP, caching, sharding, queues, consistent hashing) + 14 famous case studies, with animated request flows & a capacity calculator | ✅ Complete · Jun 2026 | [`sysdesign-guide/index.html`](./sysdesign-guide/index.html) |
| **[Frontend Field Guide](./frontend-guide/index.html)** | **Modern pro frontend** for interviews — React 19, Next.js App Router, Tailwind v4, shadcn/ui, plus data/state, performance, testing & shipping — analogy-first, with step-through visualizers (render tree, hydration, RSC boundary) | ✅ Complete · Jun 2026 | [`frontend-guide/index.html`](./frontend-guide/index.html) |
| **[Observability Field Guide](./observability-guide/index.html)** | **Logs · metrics · traces** for interviews — the three pillars, OpenTelemetry, Prometheus & Grafana, and SLOs/error budgets — with a trace waterfall, a metrics lab, and burn-rate visualizers | ✅ Complete · Jun 2026 | [`observability-guide/index.html`](./observability-guide/index.html) |
| **[DevOps Field Guide](./devops-guide/index.html)** | The **modern DevOps engineer** journey for interviews — CI/CD, Docker, Kubernetes, Terraform, AWS, zero-downtime deploys & GitOps, reliability & DevSecOps — AWS-first, analogy-first, with animated pipeline/deploy/sizing engines | ✅ Complete · Jun 2026 | [`devops-guide/index.html`](./devops-guide/index.html) |
| **[AWS MLA Field Guide](./aws-mla-guide/index.html)** | **AWS Machine Learning Engineer Associate (MLA-C02)** — classic MLOps + Bedrock/RAG/agents, Mermaid decision flows, scenario bank & timed mocks | ✅ Complete · Sep 2026 | [`aws-mla-guide/index.html`](./aws-mla-guide/index.html) |
| **[AWS SAA Field Guide](./aws-saa-guide/index.html)** | **AWS Solutions Architect Associate (SAA-C03)** exam guide — zero-AWS foundations through Well-Architected domains, Mermaid decision flows, scenario bank & timed mocks | ✅ Complete · Sep 2026 | [`aws-saa-guide/index.html`](./aws-saa-guide/index.html) |
| **[CKA Field Guide](./cka-guide/index.html)** | **Certified Kubernetes Administrator (CKA)** on Kubernetes v1.35 — workloads, Gateway API, cluster architecture, troubleshooting; command-first tasks & timed performance mock | ✅ Complete · Sep 2026 | [`cka-guide/index.html`](./cka-guide/index.html) |
| **[Cert Mocks Guide](./cert-mocks-guide/index.html)** | Full timed mocks for **SAA-C03**, **MLA-C02**, and **CKA v1.35** — 3 end-to-end exams each, domain-weighted, with remediation links into the learning guides | ✅ Complete · Sep 2026 | [`cert-mocks-guide/index.html`](./cert-mocks-guide/index.html) |
| **[Senior Backend Scenario Q&A](./senior-backend-guide/index.html)** | **120 production interview scenarios** — debugging, async, Postgres, Kafka, Redis, AWS, security, ownership — FastAPI-first answers with Nest notes, drills & flashcards | ✅ Complete · Sep 2026 | [`senior-backend-guide/index.html`](./senior-backend-guide/index.html) |
| **[Aptitude & Reasoning Field Guide](./aptitude-guide/index.html)** | **Aptitude & reasoning** for tech-placement online assessments — quantitative aptitude, logical reasoning, verbal ability & data interpretation, shortcut-first with inline diagrams and a **timed drill engine** that scores you and explains every answer | ✅ Complete · Jun 2026 | [`aptitude-guide/index.html`](./aptitude-guide/index.html) |

> Tip: open the visual hub at [`index.html`](./index.html), or double-click any project's entry HTML (e.g. `claude-guide/index.html`). Each project folder also has its own `README.md`.

---

## 🗂 Repository layout

```text
self-upgrade/
├── index.html                 ← visual hub linking to every guide
├── README.md                  ← this index (lists every project)
├── claude-guide/              ← Claude & Claude Code
├── genai-guide/               ← Generative AI
├── langstack/                 ← The Lang Stack
├── fastapi-guide/             ← Python & FastAPI
├── dsa-guide/                 ← Data structures & algorithms
├── lld-guide/                 ← OOP & low-level design
├── sysdesign-guide/           ← High-level / distributed system design
├── frontend-guide/            ← Modern frontend (React · Next.js · Tailwind)
├── observability-guide/       ← Observability (logs · metrics · traces · OTel)
├── devops-guide/              ← DevOps (CI/CD · containers · Kubernetes · IaC · AWS)
├── aws-mla-guide/             ← AWS MLA-C02 exam (MLOps · Bedrock · scenarios · mocks)
├── aws-saa-guide/             ← AWS SAA-C03 exam (Well-Architected · scenarios · mocks)
├── cka-guide/                 ← CKA exam (K8s v1.35 · Gateway API · troubleshooting · task mock)
├── cert-mocks-guide/          ← Full timed mocks (SAA · MLA · CKA × 3 each)
├── senior-backend-guide/      ← Senior backend scenario Q&A (120 cards)
└── aptitude-guide/            ← Aptitude & reasoning (quant · reasoning · verbal · DI)
```

Each guide folder is self-contained — an `index.html` entry point, an `assets/` folder, and its own
`README.md`. The root holds just this index, the visual hub, and one folder per guide.

---

## ➕ Adding a new project

Keep every project self-contained so this workspace scales cleanly:

1. **Create a folder** at the root named in `kebab-case`, e.g. `prompt-eval-lab/`.
2. **Put the project inside it** — code, assets, and an entry point.
3. **Add a `README.md`** to that folder describing what it is, how to run it, and its structure. Put any build/process notes in a `docs/` subfolder.
4. **Register it** by adding a row to the [Projects](#-projects) table above:

   ```markdown
   | **[Project Name](./folder-name/README.md)** | One-line description | 🚧 In progress | [`folder-name/index.html`](./folder-name/index.html) |
   ```

   Suggested status labels: `🚧 In progress` · `✅ Complete` · `🧪 Experiment` · `📦 Archived`.

### Minimal project README template

Copy this into your new project's `README.md` to get started:

```markdown
# <Project Name>

One-paragraph description of what this is and who it's for.

## Quick start
How to open / run it (e.g. open `index.html`, or `npm install && npm run dev`).

## Structure
A short tree of the important files.

## Notes
Anything worth knowing — dependencies, caveats, links to `docs/`.
```

---

*Workspace maintained with [Claude Code](https://claude.com/claude-code).*
