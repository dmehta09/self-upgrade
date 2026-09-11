/* ============================================================
   AWS MLA Field Guide — canonical lesson registry
   GENERATED from tools/manifest.js by tools/gen.js — edit the
   manifest, then re-run `node tools/gen.js`. Stable lesson ids;
   each lesson page sets <body data-lesson="<id>">.
   ============================================================ */
window.LESSONS = [
  { id: "fo-lifecycle", title: "ML lifecycle on AWS", url: "foundations/ml-lifecycle-aws.html", module: "foundations", tool: "foundations" },
  { id: "fo-sm-bedrock", title: "SageMaker AI vs Bedrock", url: "foundations/sagemaker-vs-bedrock.html", module: "foundations", tool: "foundations" },
  { id: "fo-exam", title: "How to take MLA-C02", url: "foundations/exam-method.html", module: "foundations", tool: "foundations" },
  { id: "fo-rai", title: "Responsible AI overview", url: "foundations/responsible-ai.html", module: "foundations", tool: "foundations" },
  { id: "dp-ingest", title: "Ingest & store for ML", url: "data-prep/ingest-and-store.html", module: "data-prep", tool: "data-prep" },
  { id: "dp-transform", title: "Transform & feature engineering", url: "data-prep/transform-and-features.html", module: "data-prep", tool: "data-prep" },
  { id: "dp-integrity", title: "Integrity, bias & leakage", url: "data-prep/integrity-bias-leakage.html", module: "data-prep", tool: "data-prep" },
  { id: "dp-fs", title: "Feature Store patterns", url: "data-prep/feature-store.html", module: "data-prep", tool: "data-prep" },
  { id: "dp-embed", title: "Embeddings & vector data for RAG", url: "data-prep/embeddings-for-rag.html", module: "data-prep", tool: "data-prep" },
  { id: "md-algo", title: "Algorithm & problem framing", url: "modeling/algorithm-choice.html", module: "modeling", tool: "modeling" },
  { id: "md-train", title: "Train on SageMaker", url: "modeling/train-on-sagemaker.html", module: "modeling", tool: "modeling" },
  { id: "md-hpo", title: "HPO & tuning", url: "modeling/hpo-and-tuning.html", module: "modeling", tool: "modeling" },
  { id: "md-eval", title: "Evaluate, metrics & Clarify", url: "modeling/evaluate-and-clarify.html", module: "modeling", tool: "modeling" },
  { id: "md-jump", title: "JumpStart & transfer learning", url: "modeling/jumpstart-and-transfer.html", module: "modeling", tool: "modeling" },
  { id: "ga-models", title: "Bedrock foundation models", url: "genai/bedrock-models.html", module: "genai", tool: "genai" },
  { id: "ga-prompt", title: "Prompt vs PEFT / fine-tune", url: "genai/prompt-vs-finetune.html", module: "genai", tool: "genai" },
  { id: "ga-rag", title: "Knowledge Bases & RAG design", url: "genai/knowledge-bases-rag.html", module: "genai", tool: "genai" },
  { id: "ga-agents", title: "Bedrock Agents & action groups", url: "genai/agents-and-tools.html", module: "genai", tool: "genai" },
  { id: "ga-guard", title: "Guardrails & responsible GenAI", url: "genai/guardrails.html", module: "genai", tool: "genai" },
  { id: "dep-inf", title: "Inference options", url: "deploy/inference-options.html", module: "deploy", tool: "deploy" },
  { id: "dep-reg", title: "Model Registry & promotion", url: "deploy/model-registry.html", module: "deploy", tool: "deploy" },
  { id: "dep-pipe", title: "Pipelines & CI/CD for ML", url: "deploy/pipelines-cicd.html", module: "deploy", tool: "deploy" },
  { id: "dep-orch", title: "Orchestrate GenAI workloads", url: "deploy/orchestrate-genai.html", module: "deploy", tool: "deploy" },
  { id: "ops-mon", title: "Monitor & drift", url: "ops-security/monitor-and-drift.html", module: "ops-security", tool: "ops-security" },
  { id: "ops-cost", title: "Cost & accelerators", url: "ops-security/cost-and-accelerators.html", module: "ops-security", tool: "ops-security" },
  { id: "ops-iam", title: "IAM for training & endpoints", url: "ops-security/iam-for-ml.html", module: "ops-security", tool: "ops-security" },
  { id: "ops-enc", title: "Encryption & lineage", url: "ops-security/encryption-and-lineage.html", module: "ops-security", tool: "ops-security" },
  { id: "ex-map", title: "MLA-C02 domain map", url: "exam/domain-map.html", module: "exam", tool: "exam" },
  { id: "ex-scenarios", title: "ML scenario bank", url: "exam/scenario-bank.html", module: "exam", tool: "exam" },
  { id: "ex-mock", title: "Timed mock exam", url: "exam/mock-exam.html", module: "exam", tool: "exam" },
];

window.LESSON_MODULES = [
  { key: "foundations", label: "Foundations" },
  { key: "data-prep", label: "Data preparation" },
  { key: "modeling", label: "Model development" },
  { key: "genai", label: "GenAI on AWS" },
  { key: "deploy", label: "Deploy & orchestrate" },
  { key: "ops-security", label: "Operate, secure & cost" },
  { key: "exam", label: "Exam prep" },
];
