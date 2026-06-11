# The Lang Stack — A Visual Field Guide

A self-contained, **offline-openable** website that teaches **LangChain**, **LangGraph**, and **LangSmith** from absolute zero — built for visual learners, with diagrams, plain-English analogies, runnable Python, and interactive quizzes.

> Content verified **June 2026**. No build step, no server, no dependencies to install.

---

## 🚀 Quick start

Just open the entry page in any modern browser:

```text
index.html      ← double-click this
```

That's it. Everything works offline (the only network call is to Google Fonts for nicer typography — it degrades gracefully to clean system fonts if you're offline).

> **Tip:** If you'd rather serve it locally, run `python3 -m http.server` from this folder and visit `http://localhost:8000`.

---

## 📚 What's inside

A beginner-first path through the three core "Lang" tools and how they fit together.

| Section | Teaches |
|---|---|
| **Home** | The big picture, the three tools at a glance, a "how they fit together" diagram, and a learning path |
| **LangChain** | Chat models · messages · prompt templates · output parsers · **LCEL** (`prompt \| model \| parser`) · tools & tool-calling · retrieval · **RAG** · memory · agents — plus **RAG in production** (chunking strategies, hybrid search & RRF, reranking, query rewriting, citations) |
| **LangGraph** | Graphs/nodes/edges · **StateGraph** · reducers · conditional edges · checkpointers & threads · human-in-the-loop · memory & the Store · multi-agent · prebuilt ReAct agent — plus **Agent architectures** (ReAct internals, supervisor, swarm/handoffs, planner-executor) and **Advanced LangGraph** (subgraphs, streaming modes, interrupts, durability, Studio & Platform) |
| **LangSmith** | Traces & the run tree · enabling tracing · the Playground · Prompt Hub · datasets · **evaluation** (heuristic / LLM-as-judge / pairwise) · experiments · monitoring · human feedback — plus **Evaluation in depth** (custom evaluators, judge calibration, annotation queues, online evals, CI wiring) |
| **Ecosystem** | Side-by-side comparison, a "which one do I use?" decision guide (with a built-in speed quiz), a learning roadmap, and a consolidated version table |
| **Glossary** | 51 searchable terms, each cross-linked to where it's taught |
| **Practice** | Three timed quiz drills — *which tool?*, *design it* (pick the primitive), *debug it* (name the cause) — with explanations and links back to the lessons |

**Recommended order:** Home → The big picture → LangChain → LangGraph → LangSmith.

---

## 🗂 Project structure

```text
langstack/                     ← this project
├── README.md                  ← you are here
├── prompt.md                  ← reusable prompt to regenerate this whole project
├── docs/
│   └── skills-used.md         ← how this project was built (Claude Code skills)
├── index.html                 ← entry point (the hub + progress dashboard)
├── tools/
│   ├── build-search-index.js   ← regenerates assets/js/search-index.js
│   └── verify.js               ← link/anchor/asset/wiring checker
├── assets/
│   ├── css/styles.css          ← shared design system (themes, components)
│   └── js/                     ← main.js (theme, scrollspy, tabs, quizzes,
│       │                          highlighter) + lessons.js, progress.js,
│       │                          search.js, search-index.js (generated)
│       └── …engines             ← graphsim.js, tracelab.js, pipeviz.js, quizdrill.js
├── drill/
│   └── index.html              ← timed quiz drills (3 modes)
├── langchain/
│   ├── index.html              ← overview
│   ├── concepts.html           ← deep dive
│   └── rag.html                ← RAG in production
├── langgraph/
│   ├── index.html
│   ├── concepts.html
│   ├── agents.html             ← agent architectures
│   └── advanced.html           ← subgraphs · streaming · interrupts · Platform
├── langsmith/
│   ├── index.html
│   ├── concepts.html
│   └── evals.html              ← evaluation in depth
└── ecosystem/
    ├── index.html              ← "the big picture"
    └── glossary.html
```

14 HTML pages + shared assets. Every page reuses the same sidebar, top bar, and footer; all links are relative within the tree.

**After editing any page content**, rebuild the search index and check the tree:

```text
node tools/build-search-index.js && node tools/verify.js
```

---

## ✨ Features

- **Visual-first** — hand-drawn SVG/CSS flow diagrams for LCEL, RAG, state graphs, conditional routing, the trace run-tree, and more.
- **Interactive simulators** — a **StateGraph stepper** (`graphsim.js`: watch the router pick edges, the tool loop fire, state merge, and checkpoints replay), a **LangSmith-style trace waterfall** (`tracelab.js`: click runs to inspect inputs/outputs/latency/tokens), and an **LCEL pipe stepper** (`pipeviz.js`: see the payload change shape at every hop).
- **Full-text search** — press `/` or ⌘/Ctrl-K anywhere; results deep-link to the exact section.
- **Progress tracking** — a "mark as learned" button per lesson, sidebar checkmarks, and a home dashboard (saved in `localStorage["lang-progress"]`).
- **Timed quiz drills** (`drill/`) — three modes (*which tool?* / *design it* / *debug it*) with per-question countdowns, trap explanations, and miss-links back to lessons. Best scores in `localStorage["lang-drill"]`.
- **Interactive** — collapsible "go deeper" sections, tabbed code blocks with copy buttons, mini self-check quizzes with instant feedback, sidebar nav with scroll-spy, and a live-filtering glossary.
- **Light & dark mode** — toggle in the top bar; your choice is remembered (`localStorage`).
- **Per-tool theming** — LangChain green · LangGraph indigo · LangSmith amber.
- **Beginner-friendly** — plain-English analogies and "gotcha" callouts throughout.
- **Self-contained & offline** — no frameworks, no build tools, no package install.

---

## 🛠 Tech

- Plain **HTML + CSS + vanilla JavaScript** — zero runtime dependencies.
- Typography: **Fraunces** (display), **Hanken Grotesk** (body), **JetBrains Mono** (code), loaded from Google Fonts with system-font fallbacks.
- A small **regex-based Python syntax highlighter** is bundled in `assets/js/main.js` so code coloring works offline.

---

## ⚠️ A note on versions

These libraries ship often, so the exact patch number changes week to week. The guide labels everything "as of June 2026" and emphasizes the **durable** facts instead: **LangChain and LangGraph both reached 1.0 in late 2025**, which froze their core APIs. When you install, pin a minor range (e.g. `langchain>=1.3,<1.4`).

Approximate latest stable versions referenced (June 2026): `langchain` 1.3.x · `langchain-core` 1.4.x · `langgraph` 1.2.x · `langsmith` SDK 0.7.x.

---

## 📖 How this was built

This project was built with **Claude Code**. For a breakdown of the specific skills and workflows used during the build, see **[`docs/skills-used.md`](docs/skills-used.md)**.

Want to regenerate it (or a variant) from scratch? Paste **[`prompt.md`](prompt.md)** into Claude Code — it encodes the full spec and has customization knobs at the top.

---

*Built with [Claude Code](https://claude.com/claude-code) · June 2026*
