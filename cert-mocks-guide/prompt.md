# Cert Mocks Guide — regeneration spec

## What this is
Practice-only hub: **3 full timed mocks** each for SAA-C03, MLA-C02, and CKA v1.35. As of **September 2026**.

## Knobs
- **Audience:** candidates ready to sit timed full-length mocks.
- **Isolation of stems:** do not copy questions from learning-guide mock banks; write fresh.
- **Lesson links:** `../aws-saa-guide/...`, `../aws-mla-guide/...`, `../cka-guide/...`.
- **Out of scope:** concept curriculum, CKAD/CKS, SAP.

## Domains
- SAA: Secure 30 · Resilient 26 · High-performing 24 · Cost 20
- MLA: Data 28 · Model/FM 24 · Deploy 24 · Operate 24
- CKA: Troubleshooting 30 · Cluster 25 · Networking 20 · Workloads 15 · Storage 10

## Build
`node tools/gen.js && node tools/build-search-index.js && node tools/verify.js`
