# How This Project Was Built — Skills & Workflow

This site was built with **Claude Code**. This document records the **skills** that were invoked during the build and how each one was actually used, plus the supporting tools and the end-to-end workflow. It's meant as an honest "making-of" so the process is reproducible.

---

## TL;DR

| # | Claude Code skill | Why it was used |
|---|---|---|
| 1 | `superpowers:using-superpowers` | Framework that enforces checking for a relevant skill before acting |
| 2 | `superpowers:brainstorming` | Clarify requirements & intent before building anything |
| 3 | `frontend-design` | Commit to a distinctive, non-generic visual direction and build polished UI |
| 4 | `superpowers:dispatching-parallel-agents` | Build 3 independent sections concurrently to save time |

Supporting capabilities: **Plan Mode**, **Explore / sub-agents**, **Context7 MCP**, **web search**, **Playwright MCP** (browser verification), and **task tracking**.

---

## 1. `superpowers:using-superpowers`

**What it is:** The meta-skill loaded at the start of every session. It establishes the discipline of *"if there's even a 1% chance a skill applies, invoke it"* and defines skill priority (process skills before implementation skills).

**How it was used here:** It set the order of operations for the whole build — brainstorm first, then design, then implement — and prompted invoking each of the skills below at the right moment.

---

## 2. `superpowers:brainstorming`

**What it is:** A process skill for turning a vague idea into a concrete spec through collaborative dialogue *before* writing code.

**How it was used here:** Rather than guessing, it drove a short round of clarifying questions that shaped the entire deliverable. Four decisions were locked in with the user:

- **Code language** → Python (most beginner-friendly for this stack)
- **Scope** → a comprehensive multi-page site (~9 pages)
- **Interactivity** → rich & interactive (animated diagrams, collapsibles, tabbed/copyable code, quizzes)
- **Visual style** → modern dev-docs with a distinct accent color per tool

These answers became the plan that everything else followed.

---

## 3. `frontend-design`

**What it is:** An implementation skill for creating distinctive, production-grade interfaces that avoid generic "AI slop" aesthetics — committing to a bold, intentional design direction.

**How it was used here:** It drove a deliberate aesthetic choice instead of a default template. The committed direction was **"Schematic"**:

- A node-graph **blueprint** aesthetic (subtle dot-grid background) that mirrors what the stack *is* (blocks → graphs → observability).
- Dark-first "ink" theme + a warm "paper" light theme.
- Editorial serif headings (**Fraunces**) paired with a friendly grotesk body (**Hanken Grotesk**) and **JetBrains Mono** for code — deliberately *not* Inter/Roboto.
- Per-tool accent colors (LangChain green, LangGraph indigo, LangSmith amber).
- Hand-authored SVG/CSS diagrams with animated connector paths.

The result is the shared design system in `langstack/assets/css/styles.css`.

---

## 4. `superpowers:dispatching-parallel-agents`

**What it is:** A skill for delegating multiple **independent** tasks to focused sub-agents that run concurrently, each with its own isolated context and precise instructions.

**How it was used here:** After the foundation (design system, shared JS, home page, and the full LangChain section) was built and verified as a proven template, the three remaining sections were genuinely independent (separate files). Three sub-agents were dispatched **in parallel**, one each for:

- **LangGraph** (`langgraph/index.html` + `concepts.html`)
- **LangSmith** (`langsmith/index.html` + `concepts.html`)
- **Ecosystem + Glossary** (`ecosystem/index.html` + `glossary.html`)

Each agent was instructed to read the existing CSS and the LangChain reference pages and mirror the exact patterns (shared shell, class vocabulary, code-block markup, callouts, diagrams, quizzes), so the whole site stayed consistent. The verified, accurate content and code snippets were handed to each agent so nothing had to be re-researched.

---

## Supporting tools & workflows

These aren't "skills" in the skill-system sense, but they were essential to the build:

- **Plan Mode** — The session began in plan mode: explore/research → design → clarify → write a plan → get approval before any code was written.
- **Research sub-agents (Explore)** — Three `Explore` agents ran in parallel to gather current facts on LangChain, LangGraph, and LangSmith.
- **Context7 MCP + web search** — Used by the research agents to verify the **latest stable versions and APIs as of June 2026** (knowledge cutoff alone wasn't trusted for version numbers).
- **Playwright MCP** — Used to verify the built site in a real browser: a link-integrity crawl across all 9 pages (zero broken links / anchors), console-error checks, light/dark theme checks, quiz and glossary-filter interaction tests, mobile-drawer responsiveness, and screenshots in both themes.
- **Task tracking** — A running task list tracked the build phases (design system → JS → home → each section → verification).

---

## Build sequence (what happened, in order)

1. **Research** (plan mode) — 3 parallel Explore agents + Context7/web search confirmed June-2026 versions and concepts.
2. **Brainstorm** — clarified language, scope, interactivity, and visual style with the user.
3. **Plan** — wrote and got approval for an implementation plan.
4. **Design foundation** — built `styles.css` (the "Schematic" design system) and `main.js` (behaviors + offline highlighter).
5. **Build the template vertical** — home page + the full LangChain section (overview + concepts).
6. **Early verification** — Playwright sanity check of the template (layout, diagrams, syntax highlighting, quizzes, themes).
7. **Parallel build** — 3 sub-agents produced LangGraph, LangSmith, and Ecosystem/Glossary against the proven template.
8. **Full verification** — link integrity, console errors, responsiveness, and visual spot-checks across every page in both themes.
9. **Cleanup & packaging** — removed verification artifacts; organized everything under `langstack/`.

---

*Generated as part of the build · June 2026*
