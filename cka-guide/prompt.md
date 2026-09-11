# CKA Field Guide — regeneration spec (Curriculum v1.35)

Paste this to rebuild. Authoritative page contract: **`tools/AUTHORING.md`**.

## What this is
A **visual, exam-focused** field guide for **Certified Kubernetes Administrator (CKA)** as of **September 2026**, aligned to **Kubernetes v1.35** and the official CNCF curriculum. Zero-to-fluent kubectl: foundations first, then workloads, storage, networking (Gateway API), cluster architecture, and troubleshooting (30%).

## Knobs
- **Audience:** engineers who need to pass the performance-based CKA exam.
- **Voice:** analogy-first → technical → Mermaid/versus → command-first task → say-it-out-loud.
- **Scope:** ~32 concept lessons + exam surfaces (task bank, timed task mock, flashcards, cheat-sheet).
- **As-of:** September 2026. Confirm against [CKA Curriculum v1.35](https://github.com/cncf/curriculum/blob/master/CKA_Curriculum_v1.35.pdf) before inventing topics.
- **Isolation:** This guide is **fully self-contained** — do not cross-link or depend on any other field guide in the repo. Do not paste content from other folders.
- **Out of scope:** CKAD/CKS depth, vendor-managed EKS/GKE/AKS specifics, deep etcd dump/restore as a core lab (removed as explicit competency).

## Architecture
Tier A fragment→gen:
- `tools/manifest.js` — MODULES + EXAM_PREP + REFERENCE
- `tools/content/<dir>-<slug>.html` — section-only fragments
- `node tools/gen.js && node tools/build-search-index.js && node tools/verify.js`

## Domains (official CKA v1.35)
1. Troubleshooting — 30%
2. Cluster Architecture, Installation & Configuration — 25%
3. Services & Networking — 20%
4. Workloads & Scheduling — 15%
5. Storage — 10%

Modern defaults to teach: Gateway API (+ classic Ingress), Helm & Kustomize, NetworkPolicies, CRI/containerd + CNI/CSI, CRDs/operators, HPA + affinity/admission, RBAC, kubeadm + HA control plane.
