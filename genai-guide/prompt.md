# Regeneration Prompt — "GenAI Field Guide"

Paste everything below the line into Claude Code (or a capable coding agent) to (re)build this project. It encodes every decision already made, so the agent shouldn't need to ask. This guide is a sibling of `langstack`, `fastapi-guide`, `lld-guide`, and `dsa-guide` under `~/Desktop/self-upgrade/` and reuses their shared "Schematic" chassis.

---

## Customization knobs

- **Topic:** Generative AI, end to end, for interview preparation.
- **Audience:** an engineer with ~2 years' experience (the *reader*), but written in a beginner-friendly **ELI10 / analogy-first** voice so anyone can follow.
- **Goal:** *interview-crack-proof* — maximum concept coverage, with an explicit interview layer.
- **Scope:** **full multimodal, deep** — text LLMs + image generation (diffusion) + audio (STT/TTS) + video generation.
- **Code language:** Python for content snippets (shown, not executed). Widget internals are vanilla JS.
- **Interactivity:** content-first + **safe browser-only widgets** (no API keys, no GPU, no network).
- **Frameworks:** taught **generically**; cross-link to the sibling `langstack` guide for LangChain/LangGraph/LangSmith specifics — do **not** re-teach them.
- **Excluded:** generic ML/DL (classical ML algorithms, training theory, CNNs for vision classification, etc.) — **except** where load-bearing for GenAI (transformers, attention, embeddings, diffusion intuition).
- **Output folder:** `genai-guide/`.
- **As-of date:** June 2026 (web-search + Context7 to confirm latest stable facts at generation time).

---

## PROMPT

You are building a **self-contained, offline-openable educational website** that teaches Generative AI for interviews. Plain **HTML + CSS + vanilla JavaScript only** — no frameworks, no build step, no server required (double-clicking a file must work). The only external resource is Google Fonts via CDN, with system-font fallbacks so it still works offline.

### 0. Research first (don't trust memory for fast-moving facts)

Before writing a module, **web-search and/or use Context7** to confirm the June-2026 state. Label volatile facts "as of June 2026" and prefer **durable facts over patch numbers** (e.g., "reasoning models that spend test-time compute became standard in 2025"). The content must reflect these June-2026 realities:

- **Frontier models are specialised, not one winner.** Families: OpenAI GPT-5.x, Anthropic Claude Opus 4.x, Google Gemini 3.x, xAI Grok 4, DeepSeek V4 (open-weight, far cheaper), Llama 4, Qwen 3.x, GLM-5. 1M+ context is common. Reason about *capabilities*, not exact versions (they churn weekly → tag `[VERIFY]`).
- **Test-time compute / reasoning models**: a separate "thinking" pass; more thinking helps math/logic/planning, hurts knowledge recall + adds latency/cost. Reasoning-effort / thinking-budget controls exist.
- **Architecture**: RoPE universal; **GQA** standard; **MoE** (top-k expert routing) mainstream; **MLA** (KV compression). KV cache is the central inference concept.
- **MCP** (Model Context Protocol): a "USB-C for AI tools"; donated to the Linux Foundation / Agentic AI Foundation (Dec 2025); 2026 spec adds stateless core, MCP Apps, Tasks. It *standardises* function calling, doesn't replace it.
- **RAG is a spectrum**: naive → hybrid (dense+BM25)+reranker → late-interaction/ColBERT → GraphRAG → agentic RAG with adaptive routing. Retrieval, not generation, is the bottleneck.
- **Agents**: patterns = fan-out, pipeline, debate, **supervisor** (production default), **swarm** (frontier). Memory: working/semantic/episodic/procedural; Letta/MemGPT tiers; programmatic vs agentic memory.
- **Fine-tuning ladder**: Prompt → RAG → Fine-tune → Distill. LoRA/QLoRA (PEFT), SFT, preference opt **DPO / ORPO / KTO**, RLHF/RLAIF, **GRPO** (RL for reasoning). Tooling: TRL, PEFT, Axolotl, Unsloth.
- **Inference/serving**: vLLM (most adopted), SGLang (RadixAttention), TensorRT-LLM (FP8/FP4). PagedAttention, continuous batching, chunked prefill, speculative decoding. Quant: FP8/FP4, AWQ, GPTQ, GGUF (Q4_K_M default).
- **Eval/observability**: deterministic vs LLM-as-judge vs composite; RAGAS; agent trajectory vs outcome eval; **OpenTelemetry GenAI semantic conventions**; eval is now a production gate.
- **Safety**: OWASP LLM Top 10 v2.0 (prompt injection #1); direct vs indirect/persistent injection; guardrails via a *separate* classifier; SynthID watermarking; EU AI Act.
- **Embeddings/vectors**: Matryoshka (MRL) truncatable dims; binary/int8 quantization; HNSW/IVF ANN; CLIP/contrastive multimodal embeddings.
- **Image**: Latent Diffusion → **DiT/MM-DiT + rectified flow / flow matching** (SD3-era); consistency models (few-step); ControlNet/adapters. **Video**: spatiotemporal latent DiTs with native synchronized audio (Sora 2 / Veo 3.1 / Kling 3 / Seedance 2.0 — `[VERIFY]`). **Audio**: Whisper-lineage STT, neural-codec/diffusion TTS, real-time speech-to-speech.
- **LLMOps**: prompt caching vs semantic caching, model routing / LLM gateways (LiteLLM, OpenRouter), cost/latency tiers.

### 1. File structure

```text
genai-guide/
├── index.html                      # home hub
├── README.md
├── prompt.md                       # this spec
├── assets/
│   ├── css/{styles.css, theme.css, genai.css}
│   ├── js/{main.js, progress.js, search.js, visualizer.js, lessons.js, search-index.js,
│   │       genai-lab.js, genai-sampling.js, genai-vectors.js, flashcards.js}
│   └── genai-data/{vocab.json, vectors.json, docs.json}
├── tools/{build-search-index.js, verify.js}
├── foundations/   (index + what-is-genai, model-landscape-2026, tokens-and-tokenization)
├── internals/     (index + embeddings-and-vectors, attention-mechanism, transformer-architecture,
│                   sampling-and-decoding, reasoning-and-test-time-compute, training-lifecycle)
├── prompting/     (index + prompting-fundamentals, advanced-prompting, context-engineering, structured-outputs)
├── tool-use/      (index + function-calling, model-context-protocol, computer-use-and-code-execution)
├── vectors/       (index + embedding-models, vector-databases, quantization-and-scale, chunking-strategies)
├── rag/           (index + naive-rag, hybrid-search-and-reranking, advanced-retrieval, agentic-rag,
│                   rag-vs-finetuning-vs-longcontext)
├── agents/        (index + agent-fundamentals, agent-memory, multi-agent-patterns, agent-reliability-and-eval)
├── finetuning/    (index + sft-and-data, peft-lora-qlora, preference-optimization, distillation-and-tooling)
├── inference/     (index + kv-cache-and-attention-optims, serving-engines, speculative-decoding,
│                   quantization-for-inference)
├── evaluation/    (index + eval-methods, llm-as-judge, rag-and-agent-eval, observability-and-tracing, benchmarks)
├── safety/        (index + prompt-injection-and-jailbreaks, owasp-and-threats, guardrails-and-defenses,
│                   watermarking-and-governance)
├── image/         (index + gans-and-vaes, diffusion-models, dit-and-flow-matching, text-to-image-control)
├── multimodal/    (index + vision-language-models, speech-stt-tts, video-generation, world-models-and-frontier)
├── production/    (index + cost-and-latency, routing-and-gateways, reliability-and-deployment)
├── reference/     (glossary, model-table, further-reading)   # NOT lessons
└── interview/
    ├── index.html                  # how to interview for GenAI + the method   (lesson)
    ├── question-bank.html          # global Q&A grouped by topic               (lesson)
    ├── cheatsheets.html            # NOT a lesson
    ├── flashcards.html             # NOT a lesson
    └── system-design/  (index + rag-chatbot, agentic-assistant, llm-gateway, multimodal-search,
                         realtime-voice, moderation-guardrails, finetune-eval-pipeline)   # lessons
```

> NOTE: the Module-3 folder is `tool-use/` (not `tools/`) to avoid colliding with the build-scripts `tools/` folder.

### 2. Design system ("Schematic" — reuse, do not redesign)

`styles.css` is copied verbatim from a sibling. `theme.css` re-skins the **per-module accent** palette and keeps shared components (search, progress dashboard, `.lesson-complete`, `.exercise`, `.pm-chip`, `.bigo`, `.deeper.hint/.solution`, the `.viz` engine). `genai.css` holds new widget + interview components. Tokens: dark "ink" default + warm "paper" light theme via `<html data-theme>`; fonts **Fraunces** (display), **Hanken Grotesk** (body), **JetBrains Mono** (code); blueprint dot-grid; **per-module accent** via `<body data-tool="…">` (foundations, internals, prompting, tool-use, vectors, rag, agents, finetuning, inference, evaluation, safety, image, multimodal, production, interview; home/reference = brand teal).

**Badges:** mark interview-critical content with `<span class="badge">IV</span>` styling and 2025–26-new content with a `[NEW]` badge, so learners can scan. Use the existing `.badge` component.

### 3. Shared page skeleton (canonical — copy onto every page)

`PREFIX` = `""` for root pages, `"../"` for module pages, `"../../"` for `interview/system-design/` pages. `SITE_BASE` = `"./"` at root, else equals `PREFIX`.

```html
<!DOCTYPE html>
<html lang="en" data-theme="dark">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>PAGE — Section | GenAI Field Guide</title>
  <meta name="description" content="…one-line summary…" />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300..600;1,9..144,400&family=Hanken+Grotesk:wght@300..800&family=JetBrains+Mono:wght@400;500;700&display=swap" rel="stylesheet" />
  <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'><circle cx='12' cy='12' r='9' fill='none' stroke='%232dd4bf' stroke-width='2'/><circle cx='12' cy='12' r='3' fill='%232dd4bf'/><path d='M12 3v3M12 18v3M3 12h3M18 12h3' stroke='%232dd4bf' stroke-width='2'/></svg>" />
  <link rel="stylesheet" href="PREFIXassets/css/styles.css" />
  <link rel="stylesheet" href="PREFIXassets/css/theme.css" />
  <link rel="stylesheet" href="PREFIXassets/css/genai.css" />
  <script>window.SITE_BASE = "SITE_BASE";</script>
</head>
<body data-tool="MODULE" data-page="UNIQUE-ID" data-lesson="LESSON-ID">  <!-- theme attribute lives on <html> only, never on <body> -->
  <a class="skip-link" href="#main">Skip to content</a>
  <div class="scroll-progress"></div>
  <div class="app">
    <aside class="sidebar" id="sidebar"> …CANONICAL SIDEBAR (section 3a)… </aside>
    <div class="sidebar-scrim"></div>
    <div class="main">
      <header class="topbar"> …menu btn · breadcrumb · spacer · search-trigger · theme toggle… </header>
      <main class="content" id="main"> …PAGE CONTENT… </main>
      <footer class="footer">
        <span class="fmono">GenAI Field Guide · interview-ready generative AI</span>
        <span class="fmono">Built to open offline · Jun 2026</span>
      </footer>
    </div>
  </div>
  <script src="PREFIXassets/js/lessons.js"></script>
  <script src="PREFIXassets/js/search-index.js"></script>
  <script src="PREFIXassets/js/main.js"></script>
  <script src="PREFIXassets/js/search.js"></script>
  <script src="PREFIXassets/js/visualizer.js"></script>
  <!-- page-specific widget scripts here, e.g. genai-lab.js / genai-sampling.js / genai-vectors.js / flashcards.js -->
  <script src="PREFIXassets/js/progress.js"></script>
</body>
</html>
```

- `data-lesson` only on lesson pages (not home/reference/cheatsheets/flashcards). `data-tool` omitted on home/reference (→ brand teal).
- `verify.js` requires every lesson page to set `window.SITE_BASE` and load the 6 standard scripts above.
- Concept pages with many sections may add a right-hand `<aside class="toc">` (use `<div class="content has-toc">` with `.prose` + `.toc`) and matching `.nav-sub` anchors; `main.js` runs scroll-spy.

#### 3a. Canonical sidebar (identical on every page; only hrefs get `PREFIX`)

Brand → then one `<nav class="nav-group is-MODULE">` per module with `<h4><span class="dot"></span>Label</h4>` and `.nav-link`s. Groups in curriculum order: Start here (Home) · Foundations · LLM internals · Prompting & context · Tools & MCP · Embeddings & vectors · RAG · Agents · Fine-tuning · Inference & serving · Evaluation & obs. · Safety & security · Image & diffusion · Audio · video & VLMs · Productionization · Interview prep · GenAI system design · Reference. (The home page authored in this repo is the source of truth — copy its `<aside>` verbatim, adjusting `PREFIX`.)

### 4. Topic anatomy & voice

**Voice:** ELI10, analogy-first, warm, second person ("you"). Define every term before using it. One idea at a time. Real, minimal Python. No invented APIs. Lead with a picture, then the precise version a 2-YOE candidate must say in an interview.

**Each concept page flows:**
1. `<section class="hero reveal">` — eyebrow (module · topic), `<h1>`, `<p class="lead">`, optional `[IV]`/`[NEW]` badges.
2. Numbered `<section class="section reveal" id="…">` blocks, each: `<h2><span class="section-num">01</span> Title</h2>` → **analogy callout** → plain definition → diagram or `.viz`/widget → trade-off `.table-wrap`/`.kv` → **"How to say it out loud"** `.callout.tip` (the interview phrasing) → `.callout.gotcha` (the trap) → `.quiz` self-check.
3. 1–2 inline `.qa` rapid-fire questions ("Could you answer these out loud?").
4. Optional `.exercise` (Practice) with `.deeper.hint` → `.deeper.solution`.
5. `<button class="lesson-complete"><span class="lc-box">✓</span><span class="lc-text"></span></button>`.
6. `<nav class="page-nav reveal">` prev/next.

**Callouts:** `.callout.analogy` (lightbulb), `.gotcha` (warning), `.tip` (check), `.note` (info) — each `<span class="co-ic">SVG</span>` + `.co-body` (`.co-title` + `<span class="tag">`).
**Code:** `.codeblock` with `.code-head` (dots + `.code-file` + `.code-copy`) and `<pre><code data-lang="python">`. Escape `<` as `&lt;` inside `<code>` (verify.js enforces).
**Quiz:** `.quiz` with `.quiz-opt[data-correct="true|false"]` (one true) + `.quiz-explain`.
**Cross-link to langstack** as a `.callout.note`: "We teach the *concept* here; see the **Lang Stack guide** (`../../langstack/…`) for framework code."

### 5. Shared JS

`main.js` (theme, mobile nav, active link, scroll progress, code tabs+copy, quizzes, reveal-on-scroll, scroll-spy, Python/shell highlighter), `progress.js` (localStorage `genai-progress`, per-page toggle, sidebar checks, home dashboard), `search.js` + generated `search-index.js` (overlay, `/` or ⌘/Ctrl-K), `visualizer.js` (frame engine: `array|grid|tree|graph` + new `heatmap`/`denoise`). Widget modules load only on pages that use them.

### 6. Curriculum (modules → pages; `[IV]` interview-critical, `[NEW]` 2025–26)

(See README and the approved plan for the page table. Each page gets 5–12 specific topic bullets — author from the Research block above.) Modules: 0 Foundations · 1 LLM Internals · 2 Prompting & Context · 3 Tool Use/Function-calling/MCP · 4 Embeddings & Vector Search · 5 RAG · 6 Agents & Multi-Agent · 7 Fine-tuning · 8 Inference & Serving · 9 Evaluation & Observability · 10 Safety/Security/Governance · 11 Image & Diffusion · 12 Audio/Video/VLMs · 13 Productionization/LLMOps · Reference · Interview.

### 7. Interactive widgets (offline, no keys/GPU/network)

- **genai-lab.js** — one module, three `data-mode`s sharing a greedy-BPE tokenizer core over `genai-data/vocab.json`: `tokenizer` (text → token chips + ids + count + cost), `chunking` (size/overlap sliders → chunk bands + simulated retrieval), `prompt` (fill `{vars}` → role bubbles + token count). Markup: `<div class="genai-lab" data-mode="…"><script type="application/json" class="gl-config">{…}</script></div>`.
- **genai-sampling.js** — temperature/top-k/top-p/rep-penalty sliders reshape a fixed logits bar chart. `<div class="genai-sampling"><script type="application/json">{candidates,logits,seen,defaults}</script></div>`.
- **genai-vectors.js** — SVG scatter of precomputed 2D points (`genai-data/vectors.json`); `similarity` mode (pick two → cosine) + `ann` mode (query → k-NN, greedy graph hops).
- **visualizer.js renderers** — add `heatmap` (N×N attention cells, opacity = weight, per-frame `weights`) and `denoise` (canvas: blend a tiny target image with per-frame `noise`, seeded so scrubbing is stable). Both use the standard `.viz` markup so they inherit controls/keyboard/reduced-motion.
- Label any approximation "illustrative, not byte-identical to a production model." All widget styles live in `genai.css`, reusing design tokens.

### 8. Interview layer

- **Q&A `.qa` block** (new, thin): `<details class="qa"><summary>chev + .qa-q + .pm-chip difficulty</summary><div class="qa-body"> .qa-model (Model answer) · .callout.tip.qa-say (How to say it out loud) · .qa-followups</div></details>`. Lives on `interview/question-bank.html` grouped by topic `<section id>`, plus 1–2 inline per concept page.
- **System-design (6-step)**, mirroring `lld-guide/lld/`: (1) requirements & clarifying Qs (`.steps` + `.grid.grid-2` of `.card.feature`) → (2) constraints/SLAs/NFRs incl. **cost-per-request, latency p50/p95, safety** (`.kv`) → (3) high-level architecture (`.diagram > .flow`) → (4) component deep-dives (`.kv` + pseudo-code) → (5) trade-offs & bottlenecks (`.table-wrap` + `.callout.gotcha`) → (6) extensions (`.exercise`). Each step a `<section id>` with `<h2><span class="section-num">`. Cases: rag-chatbot, agentic-assistant, llm-gateway, multimodal-search, realtime-voice, moderation-guardrails, finetune-eval-pipeline.
- **Cheat-sheets** (`cheatsheets.html`): "20 things you must know" `<ol>`/`.kv`, comparison `.table-wrap`s, glossary `.kv`. No new code.
- **Flashcards** (`flashcards.html`): `flashcards.js` (~80 lines) — click-to-flip, shuffle, known/unknown in `localStorage["genai-cards"]`. Markup `<div class="flashdeck" data-deck="…">` with `.fd-controls` + `<ul class="fd-cards">` of `<li class="flashcard">` (`.fc-inner` > `.fc-front`/`.fc-back`); both faces in DOM (searchable, reduced-motion safe).
- **Coding exercises**: reuse `.exercise` + progressive `.deeper.hint` → `.deeper.solution` + `.codeblock` (+ `.io-out` for expected output). Shown, not executed.

### 9. Integration

- `lessons.js`: append `{id,title,url,module,tool}` (root-relative urls). All interview + system-design pages are lessons in module `interview`; cheat-sheets + flashcards + reference are **not** lessons. Keep every url pointing at a real file (verify.js cross-checks).
- `tools/build-search-index.js`: add every new page to `FILES`; ensure every major block is a `<section id>` so it's deep-linkable. Re-run `node tools/build-search-index.js` after edits.
- Sidebar: add the page's `.nav-link`; `main.js` marks active, `progress.js` paints checks.
- Home: the dashboard auto-reads `LESSON_MODULES`; keep the "N of N" count text roughly current.

### 10. Verify before declaring done

`cd genai-guide && python3 -m http.server`, then in a browser: every page 200s; **zero broken links/anchors/assets** (`node tools/verify.js`); regenerate search (`node tools/build-search-index.js`); no console errors; dark/light toggle + persistence; sidebar active + scroll-spy; mobile drawer; code copy + highlight; quizzes; `<details>` hints/solutions; reveal-on-scroll; every widget works; flashcards flip+shuffle+persist; progress dashboard shows per-module bars; search finds new sections; per-module accents apply. Spot-check accuracy against June-2026 facts; confirm no excluded generic-ML crept in.

### 11. Deliverables & build phases

All files in §1, a `README.md`, and this `prompt.md`. Build in phases, verifying + checkpointing after each: **P1** Foundations+Internals+Prompting+RAG (+ core widgets, glossary, interview index); **P2** Tools+Vectors+Agents+Eval (+ vector widget, question-bank, 2 cases); **P3** Finetuning+Inference+Safety+Production (+ remaining cases, cheatsheets, flashcards); **P4** Image+Multimodal (+ diffusion widget, 2 cases, model-table, further-reading).
