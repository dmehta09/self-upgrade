# Regeneration Prompt — "The Lang Stack" learning site

Paste everything below the line into Claude Code (or a capable coding agent) to regenerate this project from scratch. It encodes every decision already made, so the agent shouldn't need to ask. Tweak the **Customization knobs** at the top to generate a different flavor.

---

## Customization knobs (edit before running)

- **Topic:** LangChain, LangGraph, and LangSmith (the "Lang stack").
- **Code language:** Python.
- **Audience:** complete beginner ("noob").
- **Scope:** comprehensive multi-page site (~9 pages).
- **Interactivity:** rich & interactive.
- **Visual style:** modern dev-docs, "Schematic" blueprint aesthetic, a distinct accent color per tool.
- **Output folder:** `langstack/`.
- **As-of date:** June 2026 (web-search to confirm latest stable versions at generation time).

---

## PROMPT

You are building a **self-contained, offline-openable educational website** that teaches a complete beginner about **LangChain, LangGraph, and LangSmith**. It must be visual, accurate, and genuinely beginner-friendly. Plain **HTML + CSS + vanilla JavaScript only** — no frameworks, no build step, no server required (double-clicking a file must work). The only allowed external resource is Google Fonts via CDN, with system-font fallbacks so it still works offline.

### 0. Research first (don't trust memory for versions)
Before writing content, **web-search and/or use the Context7 docs tool** to confirm the latest stable versions and current APIs of LangChain, LangGraph, and LangSmith *as of the generation date*. Label all version numbers "as of <month year>" and note that patch versions move fast. Emphasize durable facts over exact patch numbers (e.g., "LangChain and LangGraph both reached 1.0 in late 2025, freezing core APIs"). Use current-era APIs only: `init_chat_model`, LCEL (`prompt | model | parser`), `create_agent` / `create_react_agent`, `with_structured_output`, `@traceable`, `evaluate(...)`. Avoid deprecated APIs (`AgentExecutor`, `initialize_agent`, `RetrievalQA`, ReAct prompt-parsing).

### 1. File structure (create exactly this)
```text
langstack/
├── index.html                 # Home hub
├── assets/
│   ├── css/styles.css          # Shared design system
│   └── js/main.js              # Shared behaviors + offline Python highlighter
├── langchain/  (index.html overview + concepts.html deep dive)
├── langgraph/  (index.html overview + concepts.html deep dive)
├── langsmith/  (index.html overview + concepts.html deep dive)
└── ecosystem/  (index.html "big picture" + glossary.html)
```
9 HTML pages + 2 shared assets. Every page shares one sidebar + top bar + footer. Root page uses `assets/...`; subfolder pages use `../assets/...`. All links relative within the tree.

### 2. Design system ("Schematic")
- **Aesthetic:** a node-graph "blueprint" feel (subtle dot-grid background) mirroring what the stack is (blocks → graphs → observability). Polished, intentional — NOT generic.
- **Themes:** dark-first "ink" theme + warm "paper" light theme, via CSS custom properties on `<html data-theme>`. Toggle in the top bar, persisted in `localStorage`.
- **Per-tool accent:** set on `<body data-tool="langchain|langgraph|langsmith">` → LangChain **green**, LangGraph **indigo**, LangSmith **amber**. Pages with no `data-tool` (home, ecosystem, glossary) use a default **teal** brand accent.
- **Typography (Google Fonts + fallbacks):** **Fraunces** (display serif, headings), **Hanken Grotesk** (body), **JetBrains Mono** (code/labels). Deliberately NOT Inter/Roboto.
- **Reusable components (define as CSS classes, reuse everywhere):** fixed left sidebar with grouped nav + colored dots; sticky top bar with breadcrumb, a status pill, theme toggle, and mobile hamburger; content column; concept cards; **analogy / gotcha / tip / note callouts** (each with an inline SVG icon); version badges & pills; **terminal-style code blocks** with a header (traffic-light dots, filename, copy button) and `data-lang` on `<code>`; collapsible `<details>` "go deeper" blocks; **mini-quiz** blocks (multiple-choice, instant correct/incorrect feedback, one option `data-correct="true"`); hand-authored **SVG/CSS flow diagrams** (`.diagram`, `.flow`, `.flow-node`, `.flow-arrow`) with animated connector paths; tables; a `.steps` learning-path component; `.kv` spec lists; bottom prev/next page-nav; footer. Add `reveal`-on-scroll animation. Respect `prefers-reduced-motion`. Fully responsive (sidebar collapses to a slide-in drawer with a scrim under ~980px).

### 3. Shared JavaScript (`assets/js/main.js`, no dependencies)
Theme toggle (+ persistence), mobile sidebar open/close (+ Escape + scrim + auto-close on link tap), auto-mark the active sidebar link by current path, a scroll-progress bar, code-tab switching, copy-to-clipboard (with fallback), quiz logic, reveal-on-scroll via IntersectionObserver, scroll-spy that highlights the current section in the right-hand "On this page" TOC and sidebar sub-nav, and a **regex-based Python syntax highlighter** (keywords/strings/comments/numbers/decorators/builtins/function-calls) plus a minimal shell highlighter — so code coloring works fully offline (no CDN highlighter).

### 4. Page content
**Home (`index.html`):** hero; an animated "how the three fit together" diagram (LangChain builds blocks → LangGraph orchestrates into a stateful graph → LangSmith observes everything); a 3-tool card grid; a "what problem does this solve?" explainer with an analogy; a visual learning-path; and a version reference table dated to the generation month.

**Overview pages** (`<tool>/index.html`): what it is, the problem it solves, an analogy, how it's packaged/architected, a "hello world" code sample, the one key idea, and "when to use it." Use plain `<main class="content">` (no TOC).

**Concepts pages** (`<tool>/concepts.html`): a deep dive with a right-side sticky "On this page" TOC + matching sidebar sub-anchors and scroll-spy. Use `<div class="content has-toc">` containing `.prose` + `<aside class="toc">`. Each concept = numbered section with explanation + diagram (where helpful) + a real Python example + a gotcha callout; include ≥2 mini-quizzes per page. Cover:
- **LangChain:** chat models & the standard interface (`.invoke/.stream/.batch`); messages (System/Human/AI/Tool); prompt templates; output parsers & **structured output** (`with_structured_output`); **LCEL & the Runnable interface** (the pipe `|`, with a flow diagram); tools & tool-calling; the retrieval stack (loaders→splitters→embeddings→vector store→retriever); **RAG** (with a pipeline diagram); memory/chat history; **agents** (`create_agent`, noting they run on LangGraph); partner packages; "what changed in 1.0 / gotchas."
- **LangGraph:** graphs/nodes/edges; **State & StateGraph** (TypedDict, channels); **reducers** (merging updates, with a diagram); **conditional edges & routing** (with a branch diagram); compile/invoke/stream; **checkpointers & threads** (persistent memory, with a multi-turn diagram); **human-in-the-loop** (`interrupt`/`Command(resume=...)`, with a timeline); short- vs long-term memory & the Store; subgraphs & multi-agent (supervisor/swarm); **prebuilt `create_react_agent` & `ToolNode`**; gotchas (return-don't-mutate state, reducer conflicts for parallel writes, side-effects-before-interrupt, consistent `thread_id`).
- **LangSmith:** traces, runs & the **run tree** (with a nested-tree diagram); enabling tracing (env vars `LANGSMITH_TRACING`/`LANGSMITH_API_KEY`/`LANGSMITH_PROJECT`, auto for LangChain/LangGraph, and `@traceable`); the Playground; Prompt Hub & versioning; datasets & examples; **evaluation** (heuristic / LLM-as-judge / pairwise) via `evaluate(...)`; experiments & comparison; monitoring/dashboards/online-eval/alerts; annotation queues & human feedback; cloud vs self-hosted & free-tier (~5,000 traces/mo); tips & gotchas. Stress that LangSmith is **framework-agnostic**.

**Ecosystem (`ecosystem/index.html`):** one mental model; a side-by-side comparison table; a "which one do I use?" decision guide (flow diagram); a learning roadmap (`.steps`); a consolidated version table with the "versions move" note; and beginner misconceptions.

**Glossary (`ecosystem/glossary.html`):** ~40+ alphabetized terms, each with a plain-English definition and a cross-link to the section that teaches it. Add a small client-side **filter input** (self-contained inline script) that live-filters terms.

### 5. Tone & accuracy
Beginner-first and warm: lead with analogies, define jargon, keep code minimal and real (include `pip install` hints). Every code snippet should reflect current best practice. No invented APIs.

### 6. Verify before declaring done
Serve locally (`python3 -m http.server`) and check in a real browser: every page loads (200); **zero broken links/anchors** (crawl all internal links incl. glossary cross-links); no console errors; light/dark toggle + persistence; code copy buttons, code tabs, collapsibles, quizzes, scroll-spy, and the glossary filter all work; diagrams render; per-tool accents apply; and the mobile drawer works. Fix anything that fails, then report results.

### 7. Deliverables
The 11 files above, a project `README.md`, and a `docs/skills-used.md` (or build notes). Keep the folder clean (remove any temp/screenshot artifacts).
