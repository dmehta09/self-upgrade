#!/usr/bin/env node
/* ============================================================
   Cert Mocks Guide — MLA-C02 full mock bank generator
   Writes tools/content/mla-mock-{1,2,3}.html (65 Q each, 130 min).
   Usage:  node tools/build-mla-banks.js
   ============================================================ */
"use strict";

const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const OUT = path.join(__dirname, "content");
const L = (p) => "../../aws-mla-guide/" + p;

const QUOTAS = { Data: 18, Model: 16, Deploy: 16, Operate: 15 };

const COMPANIES = [
  ["Acme Tickets", "event ticketing"],
  ["Ledger Bank", "retail banking"],
  ["Nova Health", "telehealth"],
  ["Polar Retail", "e-commerce"],
  ["Cobalt IoT", "industrial sensors"],
  ["Harbor Logistics", "freight routing"],
  ["Quill Insurance", "claims underwriting"],
  ["Summit Media", "content platforms"],
  ["Cedar Energy", "grid forecasting"],
  ["Orbit Travel", "booking assistants"],
];

/** @type {{domain:string, stemTemplate:string, variants?:string[], choices:string[], answer:number, why:string, lesson:string}[]} */
const TEMPLATES = [
  // ── Data (22) ──────────────────────────────────────────────
  {
    domain: "Data",
    stemTemplate: "{{company}} streams click events that must land in a durable lake for nightly SageMaker retraining and also feed near-real-time features. Which ingest pattern fits?",
    variants: [
      "{{company}} needs both a historical lake for batch training and a streaming path for live features. Best AWS combination?",
    ],
    choices: [
      "Amazon RDS Multi-AZ as the sole ML data lake",
      "Kinesis Data Streams or Firehose into S3 with Glue Data Catalog metadata",
      "EC2 instance store only for durability",
      "AWS Backup without a streaming ingest path",
    ],
    answer: 1,
    why: "Kinesis/Firehose → S3 + Glue catalog is the standard stream+batch ML ingest pattern.",
    lesson: L("data-prep/ingest-and-store.html"),
  },
  {
    domain: "Data",
    stemTemplate: "{{company}} must keep identical feature definitions for offline training and millisecond online scoring. What should they implement?",
    choices: [
      "Duplicate SQL in notebooks and a Lambda preprocessor",
      "DynamoDB alone with no offline export path",
      "SageMaker Feature Store with offline and online stores",
      "ElastiCache holding raw JSON documents only",
    ],
    answer: 2,
    why: "Feature Store shares definitions across offline training exports and online low-latency reads — the train-serve skew fix.",
    lesson: L("data-prep/feature-store.html"),
  },
  {
    domain: "Data",
    stemTemplate: "A {{biz}} fraud model at {{company}} shows near-perfect validation AUC but fails in production. Labels leak post-investigation outcomes into features. What prevents recurrence?",
    choices: [
      "Enable Model Monitor on the endpoint only",
      "Point-in-time feature engineering with time-based splits and pipeline data validation",
      "Switch to a larger GPU for training",
      "Add CloudWatch alarms on endpoint latency",
    ],
    answer: 1,
    why: "Target leakage is fixed in data prep with cutoff-aware features and validation — not by post-deploy monitoring alone.",
    lesson: L("data-prep/integrity-bias-leakage.html"),
  },
  {
    domain: "Data",
    stemTemplate: "{{company}} is standing up a Bedrock Knowledge Base over internal PDFs in S3. Before retrieval works well, which data-prep step is essential?",
    choices: [
      "Train XGBoost on PDF filenames",
      "Chunk documents, generate embeddings, and index them in a supported vector store",
      "Pass entire unindexed PDFs in every prompt",
      "Enable RDS read replicas for PDF blobs",
    ],
    answer: 1,
    why: "RAG needs chunking + embeddings + a vector index; Knowledge Bases automate that pipeline.",
    lesson: L("data-prep/embeddings-for-rag.html"),
  },
  {
    domain: "Data",
    stemTemplate: "{{company}}'s Glue batch feature jobs should reuse the same transform container before SageMaker Training. Least duplication?",
    choices: [
      "Copy Glue scripts into every notebook by hand",
      "SageMaker Processing job or ProcessingStep sharing the transform container",
      "Re-implement transforms only inside the endpoint image",
      "Email CSV extracts between teams",
    ],
    answer: 1,
    why: "Processing jobs (often in Pipelines) containerize shared transform logic for train and batch prep.",
    lesson: L("data-prep/transform-and-features.html"),
  },
  {
    domain: "Data",
    stemTemplate: "Which check belongs in {{company}}'s data-preparation phase rather than post-deploy monitoring?",
    choices: [
      "CloudWatch endpoint 5xx rate",
      "Detecting duplicate entity IDs and null-rate spikes in the training manifest",
      "Auto scaling on the inference endpoint",
      "Blue/green traffic shifting",
    ],
    answer: 1,
    why: "Schema and quality checks on training data are prep-phase; the others are deploy/operate concerns.",
    lesson: L("data-prep/integrity-bias-leakage.html"),
  },
  {
    domain: "Data",
    stemTemplate: "{{company}} stores labeled training objects in S3. Data scientists need governed catalog discovery without copying every dataset into Studio. What helps?",
    choices: [
      "Glue Data Catalog tables over the S3 prefixes used by training",
      "Public S3 ACLs on every object",
      "Emailing Parquet files on USB drives",
      "Storing all labels only in local laptop folders",
    ],
    answer: 0,
    why: "Glue Catalog centralizes schema/metadata over lake prefixes so jobs and Studio can discover datasets consistently.",
    lesson: L("data-prep/ingest-and-store.html"),
  },
  {
    domain: "Data",
    stemTemplate: "For {{company}}'s RAG corpus, retrieval quality is poor on long manuals. Chunks are 8k tokens with no overlap. What data-prep change is most appropriate first?",
    choices: [
      "Disable embeddings and use keyword search only forever",
      "Re-chunk with smaller semantic windows and modest overlap, then re-embed",
      "Train a custom CNN on the PDFs",
      "Move all documents into DynamoDB items of 400 KB",
    ],
    answer: 1,
    why: "Oversized chunks dilute embeddings; smaller overlapping chunks improve retrieval precision.",
    lesson: L("data-prep/embeddings-for-rag.html"),
  },
  {
    domain: "Data",
    stemTemplate: "{{company}} needs online features for a real-time ranking model and nightly offline exports for retraining from the same definitions. Online store latency must stay low. Choose:",
    choices: [
      "Amazon SageMaker Feature Store online + offline stores",
      "Amazon Redshift Spectrum only for online lookups",
      "Amazon SNS as a feature database",
      "Amazon Route 53 latency records as features",
    ],
    answer: 0,
    why: "Feature Store is purpose-built for shared definitions with online serving and offline training exports.",
    lesson: L("data-prep/feature-store.html"),
  },
  {
    domain: "Data",
    stemTemplate: "Analysts at {{company}} find that a protected attribute drives model outcomes unfairly in the training set. Which prep action aligns with responsible data work?",
    choices: [
      "Ignore bias until after production launch",
      "Measure bias metrics on the dataset and remediate features/labels before training",
      "Only increase endpoint instance count",
      "Delete CloudTrail logs",
    ],
    answer: 1,
    why: "Bias detection and remediation belong in data prep (and Clarify) before shipping models.",
    lesson: L("data-prep/integrity-bias-leakage.html"),
  },
  {
    domain: "Data",
    stemTemplate: "{{company}} wants reusable feature engineering across notebooks and Pipelines without rewriting pandas each time. Good approach?",
    choices: [
      "SageMaker Processing / Data Wrangler flows versioned and invoked from Pipelines",
      "Paste different transforms into every Studio cell",
      "Hard-code transforms only in the client mobile app",
      "Use Amazon SES to transform CSV",
    ],
    answer: 0,
    why: "Data Wrangler/Processing gives shareable, versionable transforms that Pipelines can call.",
    lesson: L("data-prep/transform-and-features.html"),
  },
  {
    domain: "Data",
    stemTemplate: "{{company}} must land multi-TB Parquet from partners into S3 for SageMaker training with encryption at rest. Prefer:",
    choices: [
      "Unencrypted public buckets for speed",
      "S3 with SSE-KMS (or SSE-S3) as the training lake landing zone",
      "Instance store as the system of record",
      "Amazon WorkMail attachments",
    ],
    answer: 1,
    why: "Encrypted S3 is the durable landing zone for large ML datasets consumed by SageMaker.",
    lesson: L("data-prep/ingest-and-store.html"),
  },
  {
    domain: "Data",
    stemTemplate: "Building embeddings for {{company}}'s Knowledge Base, the team wonders whether to embed whole 200-page contracts or passages. Best practice?",
    choices: [
      "Embed whole contracts as single vectors only",
      "Embed passage-sized chunks aligned to how users ask questions",
      "Skip embeddings and store contracts in ElastiCache strings",
      "Use only image OCR without text chunking forever",
    ],
    answer: 1,
    why: "Passage-level chunks match query granularity and improve retrieval for RAG.",
    lesson: L("data-prep/embeddings-for-rag.html"),
  },
  {
    domain: "Data",
    stemTemplate: "{{company}} discovers training rows include future transaction timestamps relative to the label time. Risk?",
    choices: [
      "No risk — timestamps always help",
      "Temporal leakage inflating offline metrics that won't hold in production",
      "Only higher S3 storage cost",
      "Bedrock token limits only",
    ],
    answer: 1,
    why: "Future information relative to decision time is leakage and breaks production generalization.",
    lesson: L("data-prep/integrity-bias-leakage.html"),
  },
  {
    domain: "Data",
    stemTemplate: "{{company}} wants Feature Store feature groups discoverable by multiple teams with consistent schemas. What should they emphasize?",
    choices: [
      "Ad-hoc CSV columns named differently per team",
      "Governed feature groups with documented definitions and shared Feature Store",
      "One-off notebook variables never registered",
      "Storing features only in browser localStorage",
    ],
    answer: 1,
    why: "Shared feature groups with clear definitions prevent skew and duplicate work across teams.",
    lesson: L("data-prep/feature-store.html"),
  },
  {
    domain: "Data",
    stemTemplate: "A {{biz}} team at {{company}} cleansse categorical encodings before training. Where should that logic live for train and batch scoring consistency?",
    choices: [
      "Only in the analyst's spreadsheet",
      "Shared Processing/transform step used by both training and batch inference prep",
      "Only inside CloudWatch dashboards",
      "Only in the CDN edge function",
    ],
    answer: 1,
    why: "Shared transform steps keep encoding consistent between train and score paths.",
    lesson: L("data-prep/transform-and-features.html"),
  },
  {
    domain: "Data",
    stemTemplate: "{{company}} receives IoT JSON on Kinesis and must compact it into Parquet partitions for efficient SageMaker reads. Pattern?",
    choices: [
      "Firehose with S3 destination and conversion/compaction, or Glue ETL to Parquet",
      "Store every JSON event as a separate DynamoDB item without a lake",
      "Email JSON to the ML team nightly",
      "Put JSON only in Parameter Store",
    ],
    answer: 0,
    why: "Stream → S3 Parquet (Firehose/Glue) is the efficient lake pattern for training reads.",
    lesson: L("data-prep/ingest-and-store.html"),
  },
  {
    domain: "Data",
    stemTemplate: "For {{company}} RAG, metadata filters (region, product line) must constrain retrieval. What data-prep practice enables this?",
    choices: [
      "Strip all metadata so vectors are anonymous",
      "Attach structured metadata to chunks during ingest/index time",
      "Put metadata only in the model checkpoint",
      "Disable Knowledge Base sync",
    ],
    answer: 1,
    why: "Metadata on chunks at ingest enables filtered retrieval at query time.",
    lesson: L("data-prep/embeddings-for-rag.html"),
  },
  {
    domain: "Data",
    stemTemplate: "{{company}} splits data randomly and finds the same customer in train and test with correlated rows. Better prep practice?",
    choices: [
      "Keep random row splits regardless",
      "Group/entity-aware or time-based splits to avoid leakage across partitions",
      "Use only the first 10 rows for test",
      "Duplicate the full dataset into test",
    ],
    answer: 1,
    why: "Entity-aware or temporal splits prevent optimistic leakage across train/test.",
    lesson: L("data-prep/integrity-bias-leakage.html"),
  },
  {
    domain: "Data",
    stemTemplate: "{{company}} Feature Store online lookups occasionally return stale values vs offline training exports. What should they review first?",
    choices: [
      "CloudFront cache TTLs only",
      "Feature ingestion pipelines, TTL/consistency settings, and point-in-time correctness",
      "Route 53 health checks",
      "S3 Transfer Acceleration alone",
    ],
    answer: 1,
    why: "Online/offline skew is a Feature Store ingestion and consistency problem.",
    lesson: L("data-prep/feature-store.html"),
  },
  {
    domain: "Data",
    stemTemplate: "{{company}} wants SageMaker Data Wrangler to profile missingness and generate a reusable flow for Pipelines. Valid goal?",
    choices: [
      "Replace IAM with public buckets",
      "Yes — profile, transform, and export a flow/job used downstream in Pipelines",
      "Data Wrangler cannot export anything reusable",
      "Only use Data Wrangler for Bedrock fine-tuning GPUs",
    ],
    answer: 1,
    why: "Data Wrangler profiles and produces reusable transforms for Pipelines/Processing.",
    lesson: L("data-prep/transform-and-features.html"),
  },
  {
    domain: "Data",
    stemTemplate: "{{company}} must version training datasets so lineage can show which S3 snapshot trained model v14. Prep practice?",
    choices: [
      "Overwrite the same S3 key forever with no versions",
      "Immutable dataset prefixes/versions referenced by training jobs and lineage",
      "Store datasets only in chat logs",
      "Disable S3 versioning and delete after each job",
    ],
    answer: 1,
    why: "Immutable versioned datasets make training reproducible and lineage useful.",
    lesson: L("data-prep/ingest-and-store.html"),
  },

  // ── Model (20) ─────────────────────────────────────────────
  {
    domain: "Model",
    stemTemplate: "{{company}} wants SageMaker to search hyperparameters for an XGBoost model within a fixed budget. What should they use?",
    choices: [
      "Manual nested for-loops only in a notebook",
      "SageMaker Automatic Model Tuning (HPO)",
      "AWS Batch Spot without a tuning objective",
      "Bedrock InvokeModel to pick hyperparameters",
    ],
    answer: 1,
    why: "SageMaker HPO runs managed tuning jobs against an objective metric within resource limits.",
    lesson: L("modeling/hpo-and-tuning.html"),
  },
  {
    domain: "Model",
    stemTemplate: "Regulators require explanations for individual denial scores from {{company}}'s SageMaker endpoint. Which capability fits?",
    choices: [
      "Amazon SageMaker Clarify",
      "AWS CloudTrail alone",
      "Amazon GuardDuty",
      "AWS Cost Explorer",
    ],
    answer: 0,
    why: "Clarify provides SHAP-style explanations and bias reports for ML models.",
    lesson: L("modeling/evaluate-and-clarify.html"),
  },
  {
    domain: "Model",
    stemTemplate: "{{company}} has only a few hundred labeled images and needs a strong classifier quickly on SageMaker. Best starting point?",
    choices: [
      "Train from random init on a single CPU for weeks",
      "SageMaker JumpStart pre-trained model with transfer learning",
      "Batch Transform without any training",
      "Amazon Redshift as the inference engine",
    ],
    answer: 1,
    why: "JumpStart + transfer learning is ideal when labels are scarce.",
    lesson: L("modeling/jumpstart-and-transfer.html"),
  },
  {
    domain: "Model",
    stemTemplate: "{{company}}'s GenAI assistant must answer from internal docs. The FM is already strong; minimize ops first. Next step?",
    choices: [
      "Full pre-training on all email history",
      "Prompt engineering with Bedrock Knowledge Base RAG",
      "Self-host only on bare EC2 with no RAG",
      "Disable retrieval to cut cost",
    ],
    answer: 1,
    why: "Prompt + RAG is the lowest-ops customization before fine-tuning.",
    lesson: L("genai/prompt-vs-finetune.html"),
  },
  {
    domain: "Model",
    stemTemplate: "Which metric fit is best for {{company}}'s highly imbalanced fraud training job?",
    choices: [
      "Accuracy alone on a balanced subsample without class weights",
      "PR-AUC or F1 with appropriate class weights",
      "Minimize wall-clock time only",
      "Maximize log loss on the majority class only",
    ],
    answer: 1,
    why: "Imbalanced problems need PR-AUC/F1 and weighting — accuracy misleads.",
    lesson: L("modeling/evaluate-and-clarify.html"),
  },
  {
    domain: "Model",
    stemTemplate: "{{company}} needs managed distributed training of a custom PyTorch model with spot-friendly checkpointing. Prefer?",
    choices: [
      "Amazon SageMaker Training jobs with the PyTorch framework estimator",
      "Run forever on a single unmanaged laptop GPU",
      "Amazon SNS fan-out as a trainer",
      "Amazon Athena ML only",
    ],
    answer: 0,
    why: "SageMaker Training manages containers, scaling, and checkpoint-friendly Spot training.",
    lesson: L("modeling/train-on-sagemaker.html"),
  },
  {
    domain: "Model",
    stemTemplate: "For tabular churn at {{company}} with mixed categorical/numeric features, which algorithm family is a strong default on SageMaker?",
    choices: [
      "Gradient-boosted trees (e.g., XGBoost) before deep nets",
      "Always train a 70B LLM from scratch",
      "k-NN only with no feature engineering ever",
      "PCA as the sole classifier",
    ],
    answer: 0,
    why: "Tree ensembles remain strong tabular defaults; LLMs are overkill for classic churn.",
    lesson: L("modeling/algorithm-choice.html"),
  },
  {
    domain: "Model",
    stemTemplate: "{{company}} must pick a Bedrock foundation model for long-context policy Q&A with strong reasoning. Selection should prioritize?",
    choices: [
      "Only the cheapest model regardless of context window",
      "Context window, quality on the task, latency, and price — evaluated with a fixed prompt set",
      "Always the largest multimodal model for CSV forecasting",
      "Random model IDs weekly",
    ],
    answer: 1,
    why: "Bedrock model choice is an eval against task needs: context, quality, latency, cost.",
    lesson: L("genai/bedrock-models.html"),
  },
  {
    domain: "Model",
    stemTemplate: "{{company}} tried RAG and better prompts; answers still miss brand tone on thousands of labeled examples. Next customization?",
    choices: [
      "Fine-tune / continued customization on Bedrock or PEFT where supported",
      "Delete the Knowledge Base permanently",
      "Switch to Amazon Polly only",
      "Disable Guardrails as the primary fix",
    ],
    answer: 0,
    why: "After prompt+RAG, fine-tuning/PEFT is the next step when you have labeled style/task data.",
    lesson: L("genai/prompt-vs-finetune.html"),
  },
  {
    domain: "Model",
    stemTemplate: "When should {{company}} prefer SageMaker custom training over Bedrock InvokeModel?",
    choices: [
      "Always — Bedrock cannot be used for text",
      "When they need full training control on proprietary labeled data and classic/custom architectures",
      "Only when they lack an AWS account",
      "Never — Bedrock replaces all ML",
    ],
    answer: 1,
    why: "SageMaker fits custom training; Bedrock fits managed FMs — choose by control vs managed FM needs.",
    lesson: L("foundations/sagemaker-vs-bedrock.html"),
  },
  {
    domain: "Model",
    stemTemplate: "{{company}} runs HPO with Bayesian strategy but objective metric is noisy. What practice helps?",
    choices: [
      "Use a stable validation metric, enough parallel jobs within budget, and early stopping where supported",
      "Tune only on training loss forever",
      "Ignore the objective and pick the last job",
      "Use production traffic as the only HPO signal without a holdout",
    ],
    answer: 0,
    why: "Stable holdout metrics and budgeted parallel trials make HPO trustworthy.",
    lesson: L("modeling/hpo-and-tuning.html"),
  },
  {
    domain: "Model",
    stemTemplate: "{{company}} must report bias metrics across demographic slices before approving a credit model. Tooling?",
    choices: [
      "SageMaker Clarify bias analysis on the training/eval data and predictions",
      "Amazon Macie alone for model fairness",
      "AWS WAF rate limits",
      "CloudFront geographic restrictions",
    ],
    answer: 0,
    why: "Clarify is the SageMaker path for bias metrics and explainability reports.",
    lesson: L("modeling/evaluate-and-clarify.html"),
  },
  {
    domain: "Model",
    stemTemplate: "A cold-start recommender at {{company}} has sparse interactions. Algorithm direction?",
    choices: [
      "Ignore cold-start and use only deep CTR nets without content features",
      "Consider factorization / content-based hybrids or JumpStart rec recipes with side features",
      "Always full RL from scratch on day one",
      "Sort items alphabetically as the model",
    ],
    answer: 1,
    why: "Sparse/cold-start favors content or hybrid approaches and curated recipes over pure interaction nets.",
    lesson: L("modeling/algorithm-choice.html"),
  },
  {
    domain: "Model",
    stemTemplate: "{{company}} wants managed training with custom Docker, metrics to CloudWatch, and spot interruption handling. Feature?",
    choices: [
      "SageMaker Training with custom containers, metric definitions, and Managed Spot Training",
      "Only local Docker without orchestration",
      "Amazon SES for training logs",
      "Amazon MQ as the trainer",
    ],
    answer: 0,
    why: "SageMaker Training supports custom images, metrics, and Spot with checkpoints.",
    lesson: L("modeling/train-on-sagemaker.html"),
  },
  {
    domain: "Model",
    stemTemplate: "{{company}} evaluates Bedrock models with a gold Q&A set and an LLM-as-judge rubric. Why is this valuable?",
    choices: [
      "It replaces all security reviews",
      "It compares FM quality on the task before locking a production model ID",
      "It eliminates the need for IAM",
      "It trains XGBoost automatically",
    ],
    answer: 1,
    why: "Task-specific eval (including LLM-as-judge) grounds Bedrock model selection.",
    lesson: L("genai/bedrock-models.html"),
  },
  {
    domain: "Model",
    stemTemplate: "{{company}} has a strong open-weight vision model in JumpStart and domain photos. Fast path?",
    choices: [
      "Fine-tune / transfer via JumpStart rather than training from scratch",
      "Collect 50M labels before any experiment",
      "Use Batch Transform as a training algorithm",
      "Host only on Amplify static hosting",
    ],
    answer: 0,
    why: "JumpStart transfer/fine-tune accelerates domain vision with limited labels.",
    lesson: L("modeling/jumpstart-and-transfer.html"),
  },
  {
    domain: "Model",
    stemTemplate: "Prompting alone fails for {{company}}'s structured extraction that must match a JSON schema tightly across 100k examples. Consider?",
    choices: [
      "Fine-tuning / customization for the extraction task after schema-constrained prompting",
      "Larger prompts with random essays",
      "Turning off JSON mode forever",
      "Replacing the FM with Amazon RDS triggers",
    ],
    answer: 0,
    why: "High-volume structured tasks often need fine-tuning beyond prompts alone.",
    lesson: L("genai/prompt-vs-finetune.html"),
  },
  {
    domain: "Model",
    stemTemplate: "{{company}} debates training a proprietary ranking model vs calling Bedrock for every rank. Guidance?",
    choices: [
      "If latency/cost and tabular features dominate, SageMaker custom/XGBoost; use Bedrock when language/reasoning is the core",
      "Always Bedrock for numeric feature ranking",
      "Always train GPT-scale models for CTR",
      "Neither — only Excel Solver",
    ],
    answer: 0,
    why: "SageMaker vs Bedrock follows problem type: classic ML features vs generative language tasks.",
    lesson: L("foundations/sagemaker-vs-bedrock.html"),
  },
  {
    domain: "Model",
    stemTemplate: "{{company}} must compare two candidate models on a holdout before Registry approval. Practice?",
    choices: [
      "Deploy both to 100% production without metrics",
      "Evaluate offline metrics (and Clarify if needed) on a held-out set, then register the winner",
      "Pick the model with the longest training time",
      "Pick the model that used the most GPUs",
    ],
    answer: 1,
    why: "Holdout evaluation before approval is core model-development hygiene.",
    lesson: L("modeling/evaluate-and-clarify.html"),
  },
  {
    domain: "Model",
    stemTemplate: "For {{company}}'s text classification with 5k labels, they consider BERT-style transfer on SageMaker vs prompting a huge Bedrock model. Trade-off?",
    choices: [
      "Fine-tuned smaller classifiers can beat generic prompting on narrow tasks at lower inference cost",
      "Prompting always wins on cost for high QPS classifiers",
      "Transfer learning never works under 1M labels",
      "Bedrock cannot do classification prompts",
    ],
    answer: 0,
    why: "Narrow labeled tasks often favor fine-tuned classifiers over always-on large FM prompts.",
    lesson: L("modeling/jumpstart-and-transfer.html"),
  },

  // ── Deploy (18) ────────────────────────────────────────────
  {
    domain: "Deploy",
    stemTemplate: "{{company}}'s scoring API sees bursts at open and is idle overnight; warm latency under 200 ms is OK. Cost-effective inference?",
    choices: [
      "Always-on multi-GPU real-time endpoint at min capacity 2",
      "SageMaker Serverless Inference",
      "Batch Transform every 5 minutes",
      "Async inference for every interactive click",
    ],
    answer: 1,
    why: "Serverless scales to zero between bursts when cold-start is acceptable.",
    lesson: L("deploy/inference-options.html"),
  },
  {
    domain: "Deploy",
    stemTemplate: "{{company}} must score 2M records nightly from S3 with no persistent API. Use?",
    choices: [
      "Real-time endpoint with a client loop",
      "SageMaker Batch Transform",
      "Bedrock Agent",
      "Model Monitor alone",
    ],
    answer: 1,
    why: "Batch Transform is offline bulk scoring from S3 without a warm endpoint.",
    lesson: L("deploy/inference-options.html"),
  },
  {
    domain: "Deploy",
    stemTemplate: "A new model package at {{company}} must not reach production until risk approves it. Capability?",
    choices: [
      "CloudWatch Logs",
      "SageMaker Model Registry manual approval status on model packages",
      "AWS Budgets",
      "EBS encryption alone",
    ],
    answer: 1,
    why: "Model Registry PendingManualApproval → Approved gates deploy pipelines.",
    lesson: L("deploy/model-registry.html"),
  },
  {
    domain: "Deploy",
    stemTemplate: "{{company}} needs a repeatable DAG: process → train → evaluate → register → deploy if metrics pass. Native path?",
    choices: [
      "Amazon SQS alone",
      "SageMaker Pipelines with ConditionStep gating deploy",
      "RDS stored procedures",
      "CloudFormation only without workflow steps",
    ],
    answer: 1,
    why: "SageMaker Pipelines is the managed ML DAG with conditional registration/deploy.",
    lesson: L("deploy/pipelines-cicd.html"),
  },
  {
    domain: "Deploy",
    stemTemplate: "{{company}}'s HR chatbot must query a policy Knowledge Base and call a leave-balance API with minimal custom orchestration. Fit?",
    choices: [
      "Single InvokeModel with no tools",
      "Bedrock Agent with Knowledge Base and action groups",
      "Athena SQL only",
      "SageMaker Batch Transform",
    ],
    answer: 1,
    why: "Agents orchestrate RAG retrieval and tool/API calls via action groups.",
    lesson: L("genai/agents-and-tools.html"),
  },
  {
    domain: "Deploy",
    stemTemplate: "{{company}} wants managed RAG over S3 docs with automatic sync into a vector index for Bedrock. Service?",
    choices: [
      "Amazon Bedrock Knowledge Bases",
      "Amazon MQ",
      "AWS Snowball only",
      "Amazon Lightsail",
    ],
    answer: 0,
    why: "Knowledge Bases manage ingest, embed, and retrieve against foundation models.",
    lesson: L("genai/knowledge-bases-rag.html"),
  },
  {
    domain: "Deploy",
    stemTemplate: "Long-running document summaries at {{company}} can wait minutes; clients should not hold HTTP open. Inference mode?",
    choices: [
      "SageMaker Asynchronous Inference with SNS/SQS completion",
      "Synchronous real-time only with 30s API Gateway hard stop and no async path",
      "Batch Transform for each single interactive user click",
      "Serverless with zero timeout tolerance",
    ],
    answer: 0,
    why: "Async inference fits long jobs with queueing and completion notifications.",
    lesson: L("deploy/inference-options.html"),
  },
  {
    domain: "Deploy",
    stemTemplate: "{{company}} CI must deploy only Approved model packages from Registry to staging then prod. Pattern?",
    choices: [
      "Pipelines/CodePipeline steps that query Registry approval and promote endpoints",
      "kubectl apply random unchecked tarballs",
      "Email the model file to ops",
      "Disable Registry and overwrite prod nightly",
    ],
    answer: 0,
    why: "CI/CD should consume Registry approval status before promotion.",
    lesson: L("deploy/pipelines-cicd.html"),
  },
  {
    domain: "Deploy",
    stemTemplate: "{{company}} GenAI workflow: retrieve → call tools → summarize with human-in-the-loop approval. Orchestration?",
    choices: [
      "Bedrock Agents and/or Step Functions with explicit approval states",
      "A single unauthenticated Lambda with no state machine",
      "Cron on a laptop under someone's desk",
      "Amazon Pinpoint journeys only",
    ],
    answer: 0,
    why: "Agents + Step Functions cover tool use and human approval in GenAI orchestration.",
    lesson: L("deploy/orchestrate-genai.html"),
  },
  {
    domain: "Deploy",
    stemTemplate: "{{company}} registers multiple model versions and needs aliases for prod vs shadow. Use?",
    choices: [
      "SageMaker Model Registry model packages and deployment groups/aliases as designed",
      "Overwrite one S3 key named latest.pkl forever without Registry",
      "Store versions only in Slack",
      "Route 53 weighted records pointing at notebooks",
    ],
    answer: 0,
    why: "Registry versions and controlled deployment aliases support safe promotion.",
    lesson: L("deploy/model-registry.html"),
  },
  {
    domain: "Deploy",
    stemTemplate: "{{company}} agent must invoke an internal REST API with IAM auth from an action group. Requirement?",
    choices: [
      "Define an action group with an OpenAPI schema and Lambda/API fulfillment role",
      "Paste API keys into the system prompt in plaintext",
      "Disable all tools and hard-code answers",
      "Use Batch Transform as the tool runtime",
    ],
    answer: 0,
    why: "Action groups bind schemas to Lambda/API backends with proper IAM.",
    lesson: L("genai/agents-and-tools.html"),
  },
  {
    domain: "Deploy",
    stemTemplate: "{{company}} Knowledge Base retrieval is weak; docs changed in S3 but answers are stale. First deploy/ops check?",
    choices: [
      "Confirm data source sync/ingestion jobs completed after S3 updates",
      "Buy more GPUs for XGBoost",
      "Disable the vector store",
      "Delete Guardrails",
    ],
    answer: 0,
    why: "KB freshness depends on successful sync/ingest after corpus changes.",
    lesson: L("genai/knowledge-bases-rag.html"),
  },
  {
    domain: "Deploy",
    stemTemplate: "Steady 24/7 low-latency fraud scores at {{company}} need consistent p99. Inference choice?",
    choices: [
      "SageMaker real-time endpoints with autoscaling",
      "Serverless only despite strict warm p99 and no cold starts allowed",
      "Nightly Batch Transform for real-time card swipes",
      "Async queues for every synchronous auth decision",
    ],
    answer: 0,
    why: "Real-time endpoints fit steady low-latency traffic; serverless cold starts may violate p99.",
    lesson: L("deploy/inference-options.html"),
  },
  {
    domain: "Deploy",
    stemTemplate: "{{company}} wants blue/green or canary traffic shift to a new endpoint variant after Registry approval. Approach?",
    choices: [
      "Deployment guardrails / traffic shifting on SageMaker endpoints driven by CI after approval",
      "Replace the only instance at 100% with no rollback plan",
      "Ship via USB at midnight",
      "Change DNS to a developer's laptop",
    ],
    answer: 0,
    why: "Controlled traffic shifting after Registry approval is the safe deploy pattern.",
    lesson: L("deploy/pipelines-cicd.html"),
  },
  {
    domain: "Deploy",
    stemTemplate: "{{company}} multi-step GenAI app needs retries, branching, and auditability beyond a single agent turn. Add?",
    choices: [
      "AWS Step Functions (or similar) wrapping Bedrock/Agent invocations",
      "Nested for-loops in the browser only",
      "Amazon SES as the orchestrator",
      "Manual copy-paste between consoles",
    ],
    answer: 0,
    why: "Step Functions provide durable orchestration, retries, and audit around GenAI calls.",
    lesson: L("deploy/orchestrate-genai.html"),
  },
  {
    domain: "Deploy",
    stemTemplate: "{{company}} must expose a Retrieval Augmented chatbot using Bedrock without building a custom vector service. Prefer?",
    choices: [
      "Bedrock Knowledge Bases wired to a supported vector store and FM",
      "Hand-rolled FAISS on an unmanaged EC2 with no backups",
      "Store embeddings in Route 53 TXT records",
      "Amazon CloudSearch classic only without embeddings",
    ],
    answer: 0,
    why: "Managed Knowledge Bases remove undifferentiated vector plumbing.",
    lesson: L("genai/knowledge-bases-rag.html"),
  },
  {
    domain: "Deploy",
    stemTemplate: "Model package metadata at {{company}} must capture metrics and approval for auditors. Where?",
    choices: [
      "SageMaker Model Registry model package details and status",
      "Only in a sticky note on a monitor",
      "Only in ephemeral container env vars",
      "Only in CloudFront headers",
    ],
    answer: 0,
    why: "Registry stores version metadata, metrics, and approval state for audit.",
    lesson: L("deploy/model-registry.html"),
  },
  {
    domain: "Deploy",
    stemTemplate: "{{company}} agent hallucinated an API path. How should tools be constrained?",
    choices: [
      "Strict action-group OpenAPI schemas and least-privilege fulfillment; validate arguments server-side",
      "Let the model invent any URL including internal admin",
      "Disable HTTPS",
      "Put root credentials in the prompt",
    ],
    answer: 0,
    why: "Schemas + server-side validation constrain agent tools safely.",
    lesson: L("genai/agents-and-tools.html"),
  },

  // ── Operate (18) ───────────────────────────────────────────
  {
    domain: "Operate",
    stemTemplate: "After a schema change, {{company}} sees feature distribution shift while endpoint latency is normal. What detects the ML issue?",
    choices: [
      "CloudWatch CPUUtilization alone",
      "SageMaker Model Monitor data drift vs a baseline",
      "AWS Cost Explorer",
      "CloudTrail only",
    ],
    answer: 1,
    why: "Model Monitor compares live feature distributions to baselines — CPU won't catch drift.",
    lesson: L("ops-security/monitor-and-drift.html"),
  },
  {
    domain: "Operate",
    stemTemplate: "A SageMaker Training job at {{company}} must read S3 without long-lived access keys in code. How?",
    choices: [
      "Embed IAM user keys in the training script",
      "Attach an IAM execution role with least-privilege S3 permissions",
      "Make the bucket public",
      "Store keys in an unencrypted text file beside the data",
    ],
    answer: 1,
    why: "Jobs assume execution roles for temporary credentials — keys in code are an anti-pattern.",
    lesson: L("ops-security/iam-for-ml.html"),
  },
  {
    domain: "Operate",
    stemTemplate: "Model artifacts at {{company}} use SSE-KMS; the endpoint fails with KMS AccessDenied. Fix?",
    choices: [
      "Disable encryption",
      "Grant the endpoint execution role kms:Decrypt on the CMK via key policy/IAM",
      "Switch to public S3 URLs",
      "Add IAM user keys to the endpoint env",
    ],
    answer: 1,
    why: "The endpoint role must be allowed to decrypt with the CMK.",
    lesson: L("ops-security/encryption-and-lineage.html"),
  },
  {
    domain: "Operate",
    stemTemplate: "A 10-hour fault-tolerant training job at {{company}} checkpoints to S3. Minimize cost?",
    choices: [
      "On-Demand only on the largest GPU",
      "Managed Spot Training with checkpoint restart on interrupt",
      "Run on a laptop overnight",
      "Provisioned Bedrock throughput for XGBoost",
    ],
    answer: 1,
    why: "Managed Spot discounts interruptible jobs when checkpoints handle reclaim.",
    lesson: L("ops-security/cost-and-accelerators.html"),
  },
  {
    domain: "Operate",
    stemTemplate: "Auditors ask which training job and dataset produced {{company}} production model v12. Trace?",
    choices: [
      "Amazon SNS",
      "SageMaker Lineage linked to Model Registry packages",
      "Amazon Route 53",
      "AWS WAF",
    ],
    answer: 1,
    why: "Lineage connects datasets, jobs, and model packages for audit.",
    lesson: L("ops-security/encryption-and-lineage.html"),
  },
  {
    domain: "Operate",
    stemTemplate: "24/7 XGBoost inference at {{company}} leaves GPUs mostly idle. Cost optimization to evaluate?",
    choices: [
      "Enable Bedrock Guardrails only",
      "Compile with Neo and/or deploy on Inferentia or Graviton CPU instances",
      "Add Multi-AZ RDS read replicas",
      "Increase endpoint instance count",
    ],
    answer: 1,
    why: "Classical ML often fits Inf/Graviton at better $/throughput than idle GPUs.",
    lesson: L("ops-security/cost-and-accelerators.html"),
  },
  {
    domain: "Operate",
    stemTemplate: "{{company}}'s customer chatbot must block PII and hate speech in prompts and completions. Control?",
    choices: [
      "Amazon Bedrock Guardrails",
      "Amazon Macie as the chat runtime",
      "Security group egress rules only",
      "S3 lifecycle policies",
    ],
    answer: 0,
    why: "Guardrails filter topics, PII, and harmful content around Bedrock apps.",
    lesson: L("genai/guardrails.html"),
  },
  {
    domain: "Operate",
    stemTemplate: "{{company}} must document human oversight and prohibited uses for a GenAI assistant. Practice?",
    choices: [
      "Responsible AI policies, use-case review, and monitoring for misuse",
      "Ship with no policies because FMs are always safe",
      "Disable all logging forever",
      "Grant every role AdministratorAccess",
    ],
    answer: 0,
    why: "Responsible AI requires governance, oversight, and misuse monitoring.",
    lesson: L("foundations/responsible-ai.html"),
  },
  {
    domain: "Operate",
    stemTemplate: "Model quality at {{company}} drops after a marketing campaign shifts traffic mix. Detection?",
    choices: [
      "Model Monitor model-quality monitoring against ground truth when available",
      "Only CPU alarms",
      "Only S3 storage metrics",
      "Only Route 53 query logs",
    ],
    answer: 0,
    why: "Model-quality monitors catch metric drift when labels arrive; infra metrics miss it.",
    lesson: L("ops-security/monitor-and-drift.html"),
  },
  {
    domain: "Operate",
    stemTemplate: "Studio users at {{company}} should not all share one powerful role that can delete prod endpoints. Fix?",
    choices: [
      "Separate least-privilege roles/domains for data science vs deploy; use permission boundaries",
      "One AdministratorAccess role for everyone",
      "Embed root keys in Studio",
      "Disable IAM and use long-lived passwords in notebooks",
    ],
    answer: 0,
    why: "Least-privilege IAM for ML personas separates experiment from production control.",
    lesson: L("ops-security/iam-for-ml.html"),
  },
  {
    domain: "Operate",
    stemTemplate: "{{company}} requires encryption in transit and at rest for training data and model artifacts. Baseline?",
    choices: [
      "TLS to S3/endpoints plus SSE-KMS (or SSE-S3) on buckets and encrypted EBS where used",
      "HTTP only to public buckets",
      "Unencrypted EFS for models",
      "Disable KMS to speed training",
    ],
    answer: 0,
    why: "Encrypt data in transit and at rest across lake, jobs, and artifacts.",
    lesson: L("ops-security/encryption-and-lineage.html"),
  },
  {
    domain: "Operate",
    stemTemplate: "Bedrock token spend at {{company}} spiked after a recursive agent loop. Control?",
    choices: [
      "Max tokens, Guardrails, budgets/alarms, and agent step limits",
      "Remove all IAM so calls fail closed forever",
      "Only buy more GPUs",
      "Disable CloudWatch",
    ],
    answer: 0,
    why: "Token budgets, step limits, and Guardrails contain GenAI cost/risk loops.",
    lesson: L("ops-security/cost-and-accelerators.html"),
  },
  {
    domain: "Operate",
    stemTemplate: "{{company}} must block prompt injection that tries to exfiltrate system prompts. Layer?",
    choices: [
      "Bedrock Guardrails plus app-side input/output filtering and least-privilege tools",
      "Security groups alone",
      "NACL deny of port 443",
      "Turning off HTTPS",
    ],
    answer: 0,
    why: "Guardrails + app filters + tool IAM mitigate prompt-injection exfil paths.",
    lesson: L("genai/guardrails.html"),
  },
  {
    domain: "Operate",
    stemTemplate: "Drift alarms at {{company}} should trigger investigation and optional retraining. Wiring?",
    choices: [
      "Model Monitor findings to EventBridge/SNS then runbook or Pipeline retrain",
      "Ignore drift until customers complain only",
      "Page only on disk full",
      "Delete the baseline nightly",
    ],
    answer: 0,
    why: "Monitor → EventBridge/SNS → runbook/Pipeline closes the operate loop.",
    lesson: L("ops-security/monitor-and-drift.html"),
  },
  {
    domain: "Operate",
    stemTemplate: "Cross-account model artifact read at {{company}} failed after enabling CMKs. Likely miss?",
    choices: [
      "Key policy and role grants for the consuming account/role on kms:Decrypt",
      "Public ACL on the model object",
      "Disabling encryption",
      "Using HTTP instead of HTTPS",
    ],
    answer: 0,
    why: "Cross-account encrypted artifacts need KMS grants for the consumer role.",
    lesson: L("ops-security/encryption-and-lineage.html"),
  },
  {
    domain: "Operate",
    stemTemplate: "{{company}} endpoints should assume roles that can invoke Bedrock but not delete VPCs. Principle?",
    choices: [
      "Least privilege IAM policies scoped to required bedrock/sagemaker actions and resources",
      "AdministratorAccess on every endpoint role",
      "Inline root credentials",
      "Disable CloudTrail for endpoints",
    ],
    answer: 0,
    why: "Endpoint/execution roles get only the API actions they need.",
    lesson: L("ops-security/iam-for-ml.html"),
  },
  {
    domain: "Operate",
    stemTemplate: "{{company}} reviews GenAI use cases for fairness, transparency, and human escalation paths. Framework?",
    choices: [
      "Responsible AI review covering impact, monitoring, and escalation",
      "Ship all use cases without review",
      "Only optimize for tokens",
      "Only optimize for GPU utilization",
    ],
    answer: 0,
    why: "Responsible AI reviews cover fairness, transparency, and human oversight.",
    lesson: L("foundations/responsible-ai.html"),
  },
  {
    domain: "Operate",
    stemTemplate: "High Bedrock QPS at {{company}} needs predictable latency for a VIP tier. Cost/perf option?",
    choices: [
      "Provisioned Throughput for the chosen model where available, with monitoring",
      "On-Demand only with no capacity planning ever",
      "Train XGBoost on Inferentia for chat generation",
      "Disable caching and max out temperature",
    ],
    answer: 0,
    why: "Provisioned Throughput stabilizes latency/capacity for steady GenAI load.",
    lesson: L("ops-security/cost-and-accelerators.html"),
  },
];

function mulberry32(a) {
  return function () {
    let t = (a += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function shuffle(arr, rnd) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    const tmp = a[i];
    a[i] = a[j];
    a[j] = tmp;
  }
  return a;
}

function fill(template, company, biz, mockIdx, qIdx) {
  let stem = template.stemTemplate;
  if (template.variants && template.variants.length) {
    const pick = (mockIdx + qIdx) % (template.variants.length + 1);
    if (pick > 0) stem = template.variants[pick - 1];
  }
  stem = stem.replace(/\{\{company\}\}/g, company).replace(/\{\{biz\}\}/g, biz);
  if (mockIdx === 1 && stem.includes("What should they")) {
    stem = stem.replace("What should they", "What should the team");
  }
  if (mockIdx === 2 && stem.includes("Best ")) {
    stem = stem.replace("Best ", "Most appropriate ");
  }
  return {
    domain: template.domain,
    stem,
    choices: template.choices.slice(),
    answer: template.answer,
    why: template.why,
    lesson: template.lesson,
  };
}

function pickCompany(mockIdx, qIdx) {
  // Rotate company pools so mocks feel distinct
  const offset = mockIdx * 3;
  const idx = (offset + qIdx) % COMPANIES.length;
  return COMPANIES[idx];
}

function buildQuestions(mockIdx) {
  const rnd = mulberry32(1000 + mockIdx * 97);
  const byDomain = {};
  for (const t of TEMPLATES) {
    if (!byDomain[t.domain]) byDomain[t.domain] = [];
    byDomain[t.domain].push(t);
  }
  const selected = [];
  let seq = 0;
  for (const domain of Object.keys(QUOTAS)) {
    const need = QUOTAS[domain];
    const pool = shuffle(byDomain[domain], rnd);
    if (pool.length < need) {
      throw new Error(`Domain ${domain}: only ${pool.length} templates, need ${need}`);
    }
    // Rotate starting offset per mock so overlap differs across mocks
    const rot = (mockIdx * 5) % pool.length;
    const rotated = pool.slice(rot).concat(pool.slice(0, rot));
    for (let i = 0; i < need; i++) {
      const tmpl = rotated[i % rotated.length];
      const [company, biz] = pickCompany(mockIdx, seq++);
      selected.push(fill(tmpl, company, biz, mockIdx, i));
    }
  }
  return shuffle(selected, rnd);
}

function renderHtml(n, questions) {
  const counts = {};
  for (const q of questions) counts[q.domain] = (counts[q.domain] || 0) + 1;
  const mix = `Data ${counts.Data} · Model ${counts.Model} · Deploy ${counts.Deploy} · Operate ${counts.Operate}`;
  const bank = {
    minutes: 130,
    label: `MLA-C02 · Mock ${n}`,
    passHint: "Practice bar ≥72% (~AWS 720/1000).",
    questions,
  };
  const json = JSON.stringify(bank, null, 2);
  return `<section class="hero reveal">
  <span class="eyebrow">MLA-C02 · Mock ${n}</span>
  <span class="domain-chip">65 Q · 130 min · pass ≥72%</span>
  <h1>MLA Mock ${n} · full exam.</h1>
  <p class="lead">Timed domain-weighted bank (${mix}). Start the timer, one answer each, then score — every item shows why and a lesson link into aws-mla-guide. September 2026.</p>
</section>

<section class="section reveal in" id="mock">
  <h2><span class="section-num">01</span> Timed mock</h2>
  <p class="takeaway">Flag Bedrock vs SageMaker vs managed AI early. For RAG, separate ingest from retrieval. Remediate weak domains in the guide.</p>
  <div data-mock>
  <script type="application/json" id="mockBank">
${json}
  </script>
  </div>
</section>

<section class="section reveal" id="check">
  <h2><span class="section-num">02</span> After you score</h2>
  <p>Use domain bars, then drill <a href="high-yield.html">high-yield</a> or open the matching lesson. Next mock when ready.</p>
</section>
`;
}

function main() {
  if (TEMPLATES.length < 70) {
    throw new Error(`Need ≥70 templates, have ${TEMPLATES.length}`);
  }
  const domains = {};
  for (const t of TEMPLATES) domains[t.domain] = (domains[t.domain] || 0) + 1;
  console.log(`Templates: ${TEMPLATES.length}`, domains);

  for (let n = 1; n <= 3; n++) {
    const qs = buildQuestions(n - 1);
    if (qs.length !== 65) throw new Error(`Mock ${n} has ${qs.length} questions`);
    const counts = {};
    for (const q of qs) counts[q.domain] = (counts[q.domain] || 0) + 1;
    for (const [d, need] of Object.entries(QUOTAS)) {
      if (counts[d] !== need) throw new Error(`Mock ${n} ${d}=${counts[d]} want ${need}`);
    }
    // Validate lessons exist
    for (const q of qs) {
      const rel = q.lesson.replace("../../aws-mla-guide/", "");
      const abs = path.join(ROOT, "..", "aws-mla-guide", rel);
      if (!fs.existsSync(abs)) throw new Error(`Missing lesson ${q.lesson}`);
      JSON.stringify(q); // ensure serializable
    }
    const html = renderHtml(n, qs);
    const outPath = path.join(OUT, `mla-mock-${n}.html`);
    fs.writeFileSync(outPath, html);
    // Re-parse JSON from file
    const m = html.match(/<script type="application\/json" id="mockBank">([\s\S]*?)<\/script>/);
    const parsed = JSON.parse(m[1]);
    if (parsed.questions.length !== 65) throw new Error(`parse fail mock ${n}`);
    if (parsed.minutes !== 130 || parsed.label !== `MLA-C02 · Mock ${n}`) {
      throw new Error(`meta fail mock ${n}`);
    }
    console.log(`Wrote ${path.relative(ROOT, outPath)} — ${JSON.stringify(counts)}`);
  }
}

main();
