/* ============================================================
   GenAI Field Guide — site manifest (single source of truth)
   Drives: tools/gen.js (page stubs + sidebar + lessons.js) and
   tools/build-search-index.js (FILES). Editing the site map here
   keeps every page's sidebar, the lesson registry, the search
   index, and verify.js in agreement.

   Each content MODULE: { key, label, pages:[ {slug,title,nav,id,lesson} ] }
   - key      = folder name AND <body data-tool> (per-module accent)
   - id       = STABLE lesson id (used by progress.js); null/omit = not a lesson
   - slug     = filename without ".html" ("index" = module overview)
   The Interview + Reference areas are defined separately below because
   their folders / data-tool / lesson-module differ from the 1:1 content rule.
   ============================================================ */

const MODULES = [
  { key: "foundations", label: "Foundations", pages: [
    { slug: "index",                 title: "How to use this guide",            nav: "How to use this guide", id: "f-overview" },
    { slug: "what-is-genai",         title: "What generative AI actually is",   nav: "What is GenAI?",        id: "f-what" },
    { slug: "model-landscape-2026",  title: "The 2026 model landscape",         nav: "Model landscape 2026",  id: "f-landscape" },
    { slug: "tokens-and-tokenization", title: "Tokens, context & cost",         nav: "Tokens & tokenization", id: "f-tokens" },
  ]},
  { key: "internals", label: "LLM internals", pages: [
    { slug: "index",                          title: "LLM internals — overview",         nav: "Overview",               id: "in-overview" },
    { slug: "embeddings-and-vectors",         title: "Embeddings: meaning as coordinates", nav: "Embeddings & vectors",  id: "in-embeddings" },
    { slug: "attention-mechanism",            title: "Attention is all you need",        nav: "Attention",              id: "in-attention" },
    { slug: "transformer-architecture",       title: "Inside a transformer",             nav: "Transformer architecture", id: "in-transformer" },
    { slug: "sampling-and-decoding",          title: "How text is generated",            nav: "Sampling & decoding",    id: "in-sampling" },
    { slug: "reasoning-and-test-time-compute", title: "Reasoning & test-time compute",   nav: "Reasoning models",       id: "in-reasoning" },
    { slug: "training-lifecycle",             title: "Pretraining to post-training",     nav: "Training lifecycle",     id: "in-training" },
  ]},
  { key: "prompting", label: "Prompting & context", pages: [
    { slug: "index",                  title: "Prompting & context — overview", nav: "Overview",              id: "pr-overview" },
    { slug: "prompting-fundamentals", title: "Prompting fundamentals",         nav: "Prompting fundamentals", id: "pr-fundamentals" },
    { slug: "advanced-prompting",     title: "Reasoning-era prompting",        nav: "Advanced prompting",     id: "pr-advanced" },
    { slug: "context-engineering",    title: "Context engineering",            nav: "Context engineering",    id: "pr-context" },
    { slug: "structured-outputs",     title: "Structured outputs",             nav: "Structured outputs",     id: "pr-structured" },
  ]},
  { key: "tool-use", label: "Tools & MCP", pages: [
    { slug: "index",                          title: "Tool use — overview",            nav: "Overview",         id: "tu-overview" },
    { slug: "function-calling",               title: "Function / tool calling",        nav: "Function calling", id: "tu-functions" },
    { slug: "model-context-protocol",         title: "The Model Context Protocol",     nav: "MCP",              id: "tu-mcp" },
    { slug: "computer-use-and-code-execution", title: "Computer use & code execution", nav: "Computer use",     id: "tu-computer" },
  ]},
  { key: "vectors", label: "Embeddings & vectors", pages: [
    { slug: "index",                 title: "Vectors — overview",             nav: "Overview",            id: "ve-overview" },
    { slug: "embedding-models",      title: "Choosing & using embeddings",    nav: "Embedding models",    id: "ve-models" },
    { slug: "vector-databases",      title: "Vector databases & ANN",         nav: "Vector databases",    id: "ve-databases" },
    { slug: "quantization-and-scale", title: "Cheap vector search at scale",  nav: "Quantization & scale", id: "ve-quant" },
    { slug: "chunking-strategies",   title: "Chunking strategies",            nav: "Chunking strategies", id: "ve-chunking" },
  ]},
  { key: "rag", label: "RAG", pages: [
    { slug: "index",                          title: "RAG — overview",                      nav: "Overview",          id: "rag-overview" },
    { slug: "naive-rag",                      title: "RAG from scratch",                    nav: "Naive RAG",         id: "rag-naive", widgets: ["genai-ragflow.js"] },
    { slug: "hybrid-search-and-reranking",    title: "Hybrid search & reranking",           nav: "Hybrid search & rerank", id: "rag-hybrid", widgets: ["genai-ragflow.js"] },
    { slug: "advanced-retrieval",             title: "Late interaction, multi-vector & GraphRAG", nav: "Advanced retrieval", id: "rag-advanced" },
    { slug: "graphrag",                       title: "GraphRAG: graphs meet retrieval",     nav: "GraphRAG",          id: "rag-graph", widgets: ["genai-ragflow.js"] },
    { slug: "agentic-rag",                    title: "Agentic RAG",                         nav: "Agentic RAG",       id: "rag-agentic", widgets: ["genai-ragflow.js"] },
    { slug: "architectures-and-workflows",    title: "RAG architectures & workflows",       nav: "Architectures & workflows", id: "rag-workflows" },
    { slug: "rag-vs-finetuning-vs-longcontext", title: "RAG vs fine-tune vs long context", nav: "RAG vs fine-tune",  id: "rag-vs" },
  ]},
  { key: "agents", label: "Agents", pages: [
    { slug: "index",                     title: "Agents — overview",       nav: "Overview",            id: "ag-overview" },
    { slug: "agent-fundamentals",        title: "Anatomy of an agent",     nav: "Agent fundamentals",  id: "ag-fundamentals" },
    { slug: "agent-memory",              title: "Memory for agents",       nav: "Agent memory",        id: "ag-memory" },
    { slug: "multi-agent-patterns",      title: "Multi-agent patterns",    nav: "Multi-agent patterns", id: "ag-multi" },
    { slug: "agent-reliability-and-eval", title: "Reliable agents",        nav: "Reliability & eval",  id: "ag-reliability" },
  ]},
  { key: "finetuning", label: "Fine-tuning", pages: [
    { slug: "index",                  title: "Fine-tuning — overview",  nav: "Overview",              id: "ft-overview" },
    { slug: "sft-and-data",           title: "Supervised fine-tuning",  nav: "SFT & data",            id: "ft-sft" },
    { slug: "peft-lora-qlora",        title: "LoRA & QLoRA",            nav: "PEFT · LoRA/QLoRA",     id: "ft-peft" },
    { slug: "preference-optimization", title: "Aligning to preferences", nav: "Preference optimization", id: "ft-pref" },
    { slug: "rl-for-reasoning",       title: "GRPO & RL for reasoning",  nav: "RL for reasoning",      id: "ft-grpo" },
    { slug: "distillation-and-tooling", title: "Distillation & tooling", nav: "Distillation & tooling", id: "ft-distill" },
  ]},
  { key: "inference", label: "Inference & serving", pages: [
    { slug: "index",                       title: "Inference — overview",     nav: "Overview",            id: "if-overview" },
    { slug: "kv-cache-and-attention-optims", title: "The KV cache",           nav: "KV cache",            id: "if-kv", widgets: ["genai-servelab.js"] },
    { slug: "serving-engines",             title: "Serving engines",          nav: "Serving engines",     id: "if-serving", widgets: ["genai-servelab.js"] },
    { slug: "inside-vllm",                 title: "Inside vLLM: PagedAttention & continuous batching", nav: "Inside vLLM", id: "if-vllm", widgets: ["genai-servelab.js"] },
    { slug: "speculative-decoding",        title: "Speculative decoding",     nav: "Speculative decoding", id: "if-spec" },
    { slug: "quantization-for-inference",  title: "Quantization for inference", nav: "Quantization",      id: "if-quant" },
  ]},
  { key: "evaluation", label: "Evaluation & obs.", pages: [
    { slug: "index",                   title: "Evaluation — overview",   nav: "Overview",        id: "ev-overview" },
    { slug: "eval-methods",            title: "Ways to evaluate",        nav: "Eval methods",    id: "ev-methods" },
    { slug: "llm-as-judge",            title: "LLM-as-a-judge",          nav: "LLM-as-judge",    id: "ev-judge" },
    { slug: "rag-and-agent-eval",      title: "Evaluating RAG & agents", nav: "RAG & agent eval", id: "ev-ragagent" },
    { slug: "observability-and-tracing", title: "Observability & tracing", nav: "Observability", id: "ev-observability" },
    { slug: "benchmarks",              title: "Reading the leaderboards", nav: "Benchmarks",     id: "ev-benchmarks" },
  ]},
  { key: "safety", label: "Safety & security", pages: [
    { slug: "index",                       title: "Safety — overview",            nav: "Overview",                id: "sa-overview" },
    { slug: "prompt-injection-and-jailbreaks", title: "Prompt injection & jailbreaks", nav: "Injection & jailbreaks", id: "sa-injection" },
    { slug: "owasp-and-threats",           title: "OWASP LLM Top 10",             nav: "OWASP & threats",         id: "sa-owasp" },
    { slug: "guardrails-and-defenses",     title: "Guardrails & defenses",        nav: "Guardrails",              id: "sa-guardrails" },
    { slug: "watermarking-and-governance", title: "Watermarking & governance",    nav: "Watermarking & governance", id: "sa-governance" },
  ]},
  { key: "image", label: "Image & diffusion", pages: [
    { slug: "index",                title: "Image generation — overview", nav: "Overview",            id: "im-overview" },
    { slug: "gans-and-vaes",        title: "GANs & VAEs",                 nav: "GANs & VAEs",         id: "im-gans" },
    { slug: "diffusion-models",     title: "How diffusion works",         nav: "Diffusion models",    id: "im-diffusion" },
    { slug: "dit-and-flow-matching", title: "DiT & flow matching",        nav: "DiT & flow matching", id: "im-dit" },
    { slug: "text-to-image-control", title: "Conditioning & control",     nav: "Text-to-image control", id: "im-control" },
  ]},
  { key: "multimodal", label: "Audio, video & VLMs", pages: [
    { slug: "index",                  title: "Multimodal — overview",     nav: "Overview",              id: "mm-overview" },
    { slug: "vision-language-models", title: "Vision-language models",    nav: "Vision-language models", id: "mm-vlm" },
    { slug: "speech-stt-tts",         title: "Speech: STT & TTS",         nav: "Speech (STT/TTS)",      id: "mm-speech" },
    { slug: "video-generation",       title: "Video generation",          nav: "Video generation",      id: "mm-video" },
    { slug: "world-models-and-frontier", title: "World models & the frontier", nav: "World models & frontier", id: "mm-world" },
  ]},
  { key: "production", label: "Productionization", pages: [
    { slug: "index",                   title: "Productionization — overview", nav: "Overview",            id: "pd-overview" },
    { slug: "cost-and-latency",        title: "Engineering for cost & latency", nav: "Cost & latency",    id: "pd-cost" },
    { slug: "prompt-caching",          title: "Prompt caching & cost engineering", nav: "Prompt caching", id: "pd-caching" },
    { slug: "routing-and-gateways",    title: "Model routing & gateways",     nav: "Routing & gateways",  id: "pd-routing" },
    { slug: "reliability-and-deployment", title: "Shipping reliably",         nav: "Reliability & deployment", id: "pd-reliability" },
  ]},
];

/* Interview prep group (folder interview/, data-tool "interview", lesson-module "interview") */
const INTERVIEW_PREP = [
  { dir: "interview", slug: "index",         title: "How to interview for GenAI roles", nav: "How to interview", id: "iv-method" },
  { dir: "interview", slug: "question-bank", title: "GenAI question bank",              nav: "Question bank",    id: "iv-bank", widgets: ["quizdrill.js"] },
  /* practice surface, NOT a lesson (no id) */
  { dir: "interview", slug: "drills",        title: "Timed GenAI drills",               nav: "Timed drills",     widgets: ["quizdrill.js"] },
];
/* GenAI system-design group (folder interview/system-design/, data-tool "interview", module "interview") */
const SYSTEM_DESIGN = [
  { dir: "interview/system-design", slug: "index",                  title: "The 6-step GenAI design method",     nav: "The 6-step method",    id: "iv-sd-method" },
  { dir: "interview/system-design", slug: "rag-chatbot",            title: "Design a RAG chatbot",               nav: "RAG chatbot",          id: "iv-sd-rag" },
  { dir: "interview/system-design", slug: "agentic-assistant",      title: "Design an agentic assistant",        nav: "Agentic assistant",    id: "iv-sd-agent" },
  { dir: "interview/system-design", slug: "llm-gateway",            title: "Design an LLM gateway",              nav: "LLM gateway",          id: "iv-sd-gateway" },
  { dir: "interview/system-design", slug: "multimodal-search",      title: "Design multimodal search",           nav: "Multimodal search",    id: "iv-sd-mmsearch" },
  { dir: "interview/system-design", slug: "realtime-voice",         title: "Design a real-time voice assistant", nav: "Real-time voice",      id: "iv-sd-voice" },
  { dir: "interview/system-design", slug: "moderation-guardrails",  title: "Design a moderation pipeline",       nav: "Moderation & guardrails", id: "iv-sd-moderation" },
  { dir: "interview/system-design", slug: "finetune-eval-pipeline", title: "Design a fine-tune & eval pipeline", nav: "Fine-tune & eval pipeline", id: "iv-sd-finetune" },
];
/* Reference / practice surfaces — NOT lessons */
const REFERENCE = [
  { dir: "interview",  slug: "cheatsheets",     title: "GenAI cheat-sheets",   nav: "Cheat-sheets",     tool: "interview", widgets: [] },
  { dir: "interview",  slug: "flashcards",      title: "GenAI flashcards",     nav: "Flashcards",       tool: "interview", widgets: ["flashcards.js"] },
  { dir: "reference",  slug: "glossary",        title: "Glossary",             nav: "Glossary",         tool: "" },
  { dir: "reference",  slug: "model-table",     title: "Model reference table", nav: "Model table",     tool: "" },
  { dir: "reference",  slug: "further-reading", title: "Further reading",      nav: "Further reading",  tool: "" },
];

/* ---- derive a flat page list ---- */
function file(dir, slug) { return (dir ? dir + "/" : "") + slug + ".html"; }

function allPages() {
  const out = [];
  // home
  out.push({ file: "index.html", dir: "", slug: "index", title: "GenAI Field Guide", tool: "", lesson: null, module: null, widgets: [] });
  // content modules
  MODULES.forEach(function (m) {
    m.pages.forEach(function (p) {
      out.push({ file: file(m.key, p.slug), dir: m.key, slug: p.slug, title: p.title,
        tool: m.key, lesson: p.id || null, module: p.id ? m.key : null, widgets: p.widgets || [] });
    });
  });
  // interview + system design (lesson module "interview")
  INTERVIEW_PREP.concat(SYSTEM_DESIGN).forEach(function (p) {
    out.push({ file: file(p.dir, p.slug), dir: p.dir, slug: p.slug, title: p.title,
      tool: "interview", lesson: p.id || null, module: p.id ? "interview" : null, widgets: p.widgets || [] });
  });
  // reference / practice (not lessons)
  REFERENCE.forEach(function (p) {
    out.push({ file: file(p.dir, p.slug), dir: p.dir, slug: p.slug, title: p.title,
      tool: p.tool || "", lesson: null, module: null, widgets: p.widgets || [] });
  });
  return out;
}

/* ---- sidebar groups (ordered) ---- */
function sidebarGroups() {
  const groups = [];
  groups.push({ label: "Start here", cls: "", links: [{ file: "index.html", label: "Home" }] });
  MODULES.forEach(function (m) {
    groups.push({ label: m.label, cls: "is-" + m.key,
      links: m.pages.map(function (p) { return { file: file(m.key, p.slug), label: p.nav }; }) });
  });
  groups.push({ label: "Interview prep", cls: "is-interview",
    links: INTERVIEW_PREP.map(function (p) { return { file: file(p.dir, p.slug), label: p.nav }; }) });
  groups.push({ label: "GenAI system design", cls: "is-interview",
    links: SYSTEM_DESIGN.map(function (p) { return { file: file(p.dir, p.slug), label: p.nav }; }) });
  groups.push({ label: "Reference", cls: "",
    links: REFERENCE.map(function (p) { return { file: file(p.dir, p.slug), label: p.nav }; }) });
  return groups;
}

/* ordered lessons for lessons.js (module field = data-tool, except interview area) */
function lessons() {
  const out = [];
  MODULES.forEach(function (m) {
    m.pages.forEach(function (p) { if (p.id) out.push({ id: p.id, title: p.title, url: file(m.key, p.slug), module: m.key, tool: m.key }); });
  });
  INTERVIEW_PREP.concat(SYSTEM_DESIGN).forEach(function (p) {
    if (p.id) out.push({ id: p.id, title: p.title, url: file(p.dir, p.slug), module: "interview", tool: "interview" });
  });
  return out;
}

const LESSON_MODULES = MODULES.map(function (m) { return { key: m.key, label: m.label }; })
  .concat([{ key: "interview", label: "Interview prep" }]);

module.exports = { MODULES, INTERVIEW_PREP, SYSTEM_DESIGN, REFERENCE, allPages, sidebarGroups, lessons, LESSON_MODULES, file };
