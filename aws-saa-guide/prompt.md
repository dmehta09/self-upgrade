# AWS SAA Field Guide — regeneration spec (SAA-C03)

Paste this to rebuild. Authoritative page contract: **`tools/AUTHORING.md`**.

## What this is
A **visual, exam-focused** field guide for **AWS Certified Solutions Architect – Associate (SAA-C03)** as of **September 2026**. Zero-AWS friendly: start at foundations, then design decisions mapped to the four official domains (Secure · Resilient · High-performing · Cost-optimized).

## Knobs
- **Audience:** engineers with little/no AWS who need to pass SAA-C03.
- **Voice:** analogy-first → technical → Mermaid/versus → scenario quiz → say-it-out-loud.
- **Scope:** ~35 lessons + exam surfaces (scenarios, timed mock, flashcards, cheat-sheet).
- **As-of:** September 2026. Confirm against the official SAA-C03 exam guide before inventing services.
- **Sibling boundary:** Interview-depth AWS lives in `devops-guide/aws/`. Cross-link; do not duplicate that crisp interview module.
- **Out of scope:** SAP / specialties, deep K8s, full observability stack, live AWS console labs.

## Architecture
Tier A fragment→gen (clone of devops pattern):
- `tools/manifest.js` — MODULES + EXAM_PREP + REFERENCE
- `tools/content/<dir>-<slug>.html` — section-only fragments
- `node tools/gen.js && node tools/build-search-index.js && node tools/verify.js`

## Domains (official SAA-C03)
1. Design Secure Architectures  
2. Design Resilient Architectures  
3. Design High-Performing Architectures  
4. Design Cost-Optimized Architectures  

Modern defaults to teach: IAM roles / Identity Center (not long-lived keys), PrivateLink/VPC endpoints, Graviton + Savings Plans, Multi-AZ by default for stateful data, S3 Intelligent-Tiering, Aurora Serverless v2 / Dynamo on-demand where fit, multi-account Organizations + SCPs.
