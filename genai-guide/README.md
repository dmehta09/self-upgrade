# GenAI Field Guide

A visual, beginner-first, **interview-ready** guide to generative AI — built to open offline in a browser. Sibling to `langstack`, `fastapi-guide`, `lld-guide`, and `dsa-guide`.

It covers the whole stack: foundations and LLM internals, prompting and context, tools & MCP, embeddings & vector search, RAG, agents, fine-tuning, inference & serving, evaluation & observability, safety & security, full multimodal (image / audio / video), and productionization — plus a dedicated **interview** module (question bank, system-design case studies, cheat-sheets, flashcards). Content is current to **June 2026**.

## Quick start

Just open `index.html` in a browser. For the search index and all features to work reliably (some browsers restrict `file://`), serve locally:

```bash
cd genai-guide
python3 -m http.server
# open http://localhost:8000
```

No build step, no framework, no dependencies. The only external resource is Google Fonts (with system-font fallbacks, so it still works offline).

## What's inside

14 content modules + an interview module, ~90 pages:

- **Foundations** — what GenAI is, the 2026 model landscape, tokens & cost
- **LLM internals** — embeddings, attention, transformers, sampling, reasoning models
- **Prompting & context** — prompting, context engineering, structured outputs
- **Tools & MCP** — function calling, the Model Context Protocol, computer use
- **Embeddings & vectors** — embedding models, vector DBs & ANN, quantization, chunking
- **RAG** — naive → hybrid/rerank → GraphRAG deep-dive → agentic; RAG vs fine-tuning
- **Agents** — ReAct, memory, multi-agent patterns, reliability
- **Fine-tuning** — SFT, LoRA/QLoRA, DPO/RLHF, GRPO & RL for reasoning, distillation
- **Inference & serving** — KV cache, serving engines, inside vLLM (PagedAttention, continuous batching), speculative decoding, quantization
- **Evaluation & observability** — eval methods, LLM-as-judge, RAGAS, tracing, benchmarks
- **Safety & security** — prompt injection, OWASP LLM Top 10, guardrails, governance
- **Image & diffusion** · **Audio, video & VLMs** — diffusion, DiT/flow matching, STT/TTS, video, VLMs
- **Productionization** — cost & latency, prompt caching & cost engineering, routing/gateways, reliable deployment
- **Interview prep** — question bank, 7 system-design cases, cheat-sheets, flashcards

## Features

- Dark "ink" / light "paper" themes (toggle persists in `localStorage`)
- Full-text **search** (press `/`) — works offline
- **Progress tracking** — mark lessons learned; per-module dashboard on the home page
- **Interactive widgets** (no API keys, no GPU, no network): tokenizer playground, sampling visualizer, vector/ANN explorer, attention heat-map, diffusion denoiser, flashcards, RAG-pipeline stepper (`genai-ragflow.js`), GPU-serving timeline (`genai-servelab.js`)
- Analogy-first **ELI10 voice** with "how to say it out loud" interview phrasing, quizzes, hints/solutions
- Concepts are framework-agnostic; the **Lang Stack guide** is cross-linked for LangChain/LangGraph/LangSmith specifics

## Project structure

```
genai-guide/
├── index.html              # home hub
├── prompt.md               # regeneration spec (design system, anatomy, curriculum, currency rules)
├── assets/
│   ├── css/{styles.css, theme.css, genai.css}
│   ├── js/{main, progress, search, visualizer, lessons, search-index,
│   │        genai-lab, genai-sampling, genai-vectors, flashcards}.js
│   └── genai-data/         # precomputed widget data
├── tools/{manifest.js, gen.js, build-search-index.js, verify.js}
└── <module folders>/       # foundations, internals, …, interview/
```

## Dev tools (authoring only — the site itself has no build step)

- `node tools/gen.js` — scaffolds page stubs from `tools/manifest.js` (idempotent; never clobbers authored pages) and regenerates `assets/js/lessons.js`. Pass `--force` to re-stamp all pages from the template.
- `node tools/build-search-index.js` — rebuilds `assets/js/search-index.js` from the manifest. Run after editing content.
- `node tools/verify.js` — checks every internal link, `#anchor`, and `<script>/<link>` asset resolves; that lesson wiring is intact; and that there's no raw `<` inside `<code>`.

`tools/manifest.js` is the single source of truth for the site map (pages, modules, sidebar, lessons).

## Tech & versions

Vanilla HTML/CSS/JS. Fonts: Fraunces (display), Hanken Grotesk (body), JetBrains Mono (code). Content reflects the generative-AI landscape **as of June 2026**; fast-moving specifics (model versions, serving engines) favor durable facts over patch numbers and are dated where relevant.

Built with Claude Code.
