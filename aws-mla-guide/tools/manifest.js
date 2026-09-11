/* AWS MLA Field Guide — site manifest (MLA-C02) */
const MODULES = [
  { key: "foundations", label: "Foundations", pages: [
    { slug: "ml-lifecycle-aws", title: "ML lifecycle on AWS", nav: "ML lifecycle", id: "fo-lifecycle", widgets: ["mermaid-init.js", "reqflow.js"] },
    { slug: "sagemaker-vs-bedrock", title: "SageMaker AI vs Bedrock", nav: "SageMaker vs Bedrock", id: "fo-sm-bedrock", widgets: ["mermaid-init.js", "tradeoff.js"] },
    { slug: "exam-method", title: "How to take MLA-C02", nav: "Exam method", id: "fo-exam", widgets: ["mermaid-init.js"] },
    { slug: "responsible-ai", title: "Responsible AI overview", nav: "Responsible AI", id: "fo-rai", widgets: ["mermaid-init.js"] },
  ]},
  { key: "data-prep", label: "Data preparation", pages: [
    { slug: "ingest-and-store", title: "Ingest & store for ML", nav: "Ingest & store", id: "dp-ingest", widgets: ["mermaid-init.js", "reqflow.js"] },
    { slug: "transform-and-features", title: "Transform & feature engineering", nav: "Transform & FE", id: "dp-transform", widgets: ["mermaid-init.js"] },
    { slug: "integrity-bias-leakage", title: "Integrity, bias & leakage", nav: "Integrity · bias", id: "dp-integrity", widgets: ["mermaid-init.js"] },
    { slug: "feature-store", title: "Feature Store patterns", nav: "Feature Store", id: "dp-fs", widgets: ["mermaid-init.js"] },
    { slug: "embeddings-for-rag", title: "Embeddings & vector data for RAG", nav: "Embeddings · RAG data", id: "dp-embed", widgets: ["mermaid-init.js", "reqflow.js"] },
  ]},
  { key: "modeling", label: "Model development", pages: [
    { slug: "algorithm-choice", title: "Algorithm & problem framing", nav: "Algorithm choice", id: "md-algo", widgets: ["mermaid-init.js", "reqflow.js"] },
    { slug: "train-on-sagemaker", title: "Train on SageMaker", nav: "Train on SageMaker", id: "md-train", widgets: ["mermaid-init.js"] },
    { slug: "hpo-and-tuning", title: "HPO & tuning", nav: "HPO & tuning", id: "md-hpo", widgets: ["mermaid-init.js"] },
    { slug: "evaluate-and-clarify", title: "Evaluate, metrics & Clarify", nav: "Evaluate · Clarify", id: "md-eval", widgets: ["mermaid-init.js"] },
    { slug: "jumpstart-and-transfer", title: "JumpStart & transfer learning", nav: "JumpStart", id: "md-jump", widgets: ["mermaid-init.js"] },
  ]},
  { key: "genai", label: "GenAI on AWS", pages: [
    { slug: "bedrock-models", title: "Bedrock foundation models", nav: "Bedrock models", id: "ga-models", widgets: ["mermaid-init.js"] },
    { slug: "prompt-vs-finetune", title: "Prompt vs PEFT / fine-tune", nav: "Prompt vs fine-tune", id: "ga-prompt", widgets: ["mermaid-init.js", "tradeoff.js"] },
    { slug: "knowledge-bases-rag", title: "Knowledge Bases & RAG design", nav: "KB & RAG", id: "ga-rag", widgets: ["mermaid-init.js", "reqflow.js"] },
    { slug: "agents-and-tools", title: "Bedrock Agents & action groups", nav: "Agents", id: "ga-agents", widgets: ["mermaid-init.js", "reqflow.js"] },
    { slug: "guardrails", title: "Guardrails & responsible GenAI", nav: "Guardrails", id: "ga-guard", widgets: ["mermaid-init.js"] },
  ]},
  { key: "deploy", label: "Deploy & orchestrate", pages: [
    { slug: "inference-options", title: "Inference options", nav: "Inference options", id: "dep-inf", widgets: ["mermaid-init.js", "tradeoff.js"] },
    { slug: "model-registry", title: "Model Registry & promotion", nav: "Model Registry", id: "dep-reg", widgets: ["mermaid-init.js"] },
    { slug: "pipelines-cicd", title: "Pipelines & CI/CD for ML", nav: "Pipelines · CI/CD", id: "dep-pipe", widgets: ["mermaid-init.js", "reqflow.js"] },
    { slug: "orchestrate-genai", title: "Orchestrate GenAI workloads", nav: "Orchestrate GenAI", id: "dep-orch", widgets: ["mermaid-init.js"] },
  ]},
  { key: "ops-security", label: "Operate, secure & cost", pages: [
    { slug: "monitor-and-drift", title: "Monitor & drift", nav: "Monitor · drift", id: "ops-mon", widgets: ["mermaid-init.js"] },
    { slug: "cost-and-accelerators", title: "Cost & accelerators", nav: "Cost · Inferentia", id: "ops-cost", widgets: ["mermaid-init.js"] },
    { slug: "iam-for-ml", title: "IAM for training & endpoints", nav: "IAM for ML", id: "ops-iam", widgets: ["mermaid-init.js", "reqflow.js"] },
    { slug: "encryption-and-lineage", title: "Encryption & lineage", nav: "Encryption · lineage", id: "ops-enc", widgets: ["mermaid-init.js"] },
  ]},
];

const EXAM_PREP = [
  { dir: "exam", slug: "domain-map", title: "MLA-C02 domain map", nav: "Domain map", id: "ex-map", widgets: ["mermaid-init.js"] },
  { dir: "exam", slug: "scenario-bank", title: "ML scenario bank", nav: "Scenario bank", id: "ex-scenarios", widgets: ["mermaid-init.js"] },
  { dir: "exam", slug: "mock-exam", title: "Timed mock exam", nav: "Timed mock", id: "ex-mock", widgets: ["mock-exam.js"] },
];

const REFERENCE = [
  { dir: "exam", slug: "cheat-sheet", title: "MLA cheat-sheet", nav: "Cheat-sheet", tool: "exam", widgets: [] },
  { dir: "exam", slug: "flashcards", title: "MLA flashcards", nav: "Flashcards", tool: "exam", widgets: ["flashcards.js"] },
  { dir: "reference", slug: "glossary", title: "Glossary", nav: "Glossary", tool: "", widgets: [] },
];

function file(dir, slug) { return (dir ? dir + "/" : "") + slug + ".html"; }

function allPages() {
  const out = [];
  out.push({ file: "index.html", dir: "", slug: "index", title: "AWS MLA Field Guide", tool: "", lesson: null, module: null, widgets: [] });
  MODULES.forEach(function (m) {
    m.pages.forEach(function (p) {
      out.push({ file: file(m.key, p.slug), dir: m.key, slug: p.slug, title: p.title,
        tool: m.key, lesson: p.id || null, module: p.id ? m.key : null, widgets: p.widgets || [] });
    });
  });
  EXAM_PREP.forEach(function (p) {
    out.push({ file: file(p.dir, p.slug), dir: p.dir, slug: p.slug, title: p.title,
      tool: "exam", lesson: p.id || null, module: p.id ? "exam" : null, widgets: p.widgets || [] });
  });
  REFERENCE.forEach(function (p) {
    out.push({ file: file(p.dir, p.slug), dir: p.dir, slug: p.slug, title: p.title,
      tool: p.tool || "", lesson: null, module: null, widgets: p.widgets || [] });
  });
  return out;
}

function sidebarGroups() {
  const groups = [];
  groups.push({ label: "Start here", cls: "", links: [{ file: "index.html", label: "Home · the roadmap" }] });
  MODULES.forEach(function (m) {
    groups.push({ label: m.label, cls: "is-" + m.key,
      links: m.pages.map(function (p) { return { file: file(m.key, p.slug), label: p.nav }; }) });
  });
  groups.push({ label: "Exam prep", cls: "is-exam",
    links: EXAM_PREP.map(function (p) { return { file: file(p.dir, p.slug), label: p.nav }; })
      .concat(REFERENCE.filter(function (p) { return p.dir === "exam"; }).map(function (p) { return { file: file(p.dir, p.slug), label: p.nav }; })) });
  groups.push({ label: "Reference", cls: "",
    links: REFERENCE.filter(function (p) { return p.dir === "reference"; }).map(function (p) { return { file: file(p.dir, p.slug), label: p.nav }; }) });
  return groups;
}

function lessons() {
  const out = [];
  MODULES.forEach(function (m) {
    m.pages.forEach(function (p) {
      if (p.id) out.push({ id: p.id, title: p.title, url: file(m.key, p.slug), module: m.key, tool: m.key });
    });
  });
  EXAM_PREP.forEach(function (p) {
    if (p.id) out.push({ id: p.id, title: p.title, url: file(p.dir, p.slug), module: "exam", tool: "exam" });
  });
  return out;
}

const LESSON_MODULES = MODULES.map(function (m) { return { key: m.key, label: m.label }; })
  .concat([{ key: "exam", label: "Exam prep" }]);

module.exports = { MODULES, EXAM_PREP, REFERENCE, allPages, sidebarGroups, lessons, LESSON_MODULES };
