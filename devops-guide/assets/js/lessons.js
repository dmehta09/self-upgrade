/* ============================================================
   DevOps Field Guide — canonical lesson registry
   GENERATED from tools/manifest.js by tools/gen.js — edit the
   manifest, then re-run `node tools/gen.js`. Stable lesson ids;
   each lesson page sets <body data-lesson="<id>">.
   ============================================================ */
window.LESSONS = [
  { id: "fo-what", title: "What DevOps really is", url: "foundations/what-is-devops.html", module: "foundations", tool: "foundations" },
  { id: "fo-lifecycle", title: "The delivery lifecycle & 2026 toolchain", url: "foundations/lifecycle-and-toolchain.html", module: "foundations", tool: "foundations" },
  { id: "fo-dora", title: "DORA & delivery metrics", url: "foundations/dora-and-delivery-metrics.html", module: "foundations", tool: "foundations" },
  { id: "ln-linux", title: "Linux for DevOps", url: "linux-networking/linux-for-devops.html", module: "linux-networking", tool: "linux-networking" },
  { id: "ln-net", title: "Networking for DevOps", url: "linux-networking/networking-for-devops.html", module: "linux-networking", tool: "linux-networking" },
  { id: "ci-git", title: "Git & branching models", url: "cicd/git-and-branching.html", module: "cicd", tool: "cicd" },
  { id: "ci-ci", title: "Continuous integration", url: "cicd/continuous-integration.html", module: "cicd", tool: "cicd" },
  { id: "ci-cd", title: "Continuous delivery & deployment", url: "cicd/continuous-delivery.html", module: "cicd", tool: "cicd" },
  { id: "co-images", title: "Images & Dockerfiles", url: "containers/images-and-dockerfiles.html", module: "containers", tool: "containers" },
  { id: "co-run", title: "Running containers", url: "containers/running-containers.html", module: "containers", tool: "containers" },
  { id: "ku-model", title: "The Kubernetes mental model", url: "kubernetes/k8s-mental-model.html", module: "kubernetes", tool: "kubernetes" },
  { id: "ku-objects", title: "Core objects", url: "kubernetes/core-objects.html", module: "kubernetes", tool: "kubernetes" },
  { id: "ku-workloads", title: "Workloads, scaling & config", url: "kubernetes/workloads-and-scaling.html", module: "kubernetes", tool: "kubernetes" },
  { id: "ia-model", title: "IaC & the Terraform model", url: "iac/iac-and-terraform-model.html", module: "iac", tool: "iac" },
  { id: "ia-practice", title: "Terraform in practice", url: "iac/terraform-in-practice.html", module: "iac", tool: "iac" },
  { id: "aw-compute", title: "AWS compute & networking", url: "aws/compute-and-networking.html", module: "aws", tool: "aws" },
  { id: "aw-containers", title: "AWS containers & serverless", url: "aws/containers-and-serverless.html", module: "aws", tool: "aws" },
  { id: "aw-iam", title: "IAM, storage & data", url: "aws/iam-storage-data.html", module: "aws", tool: "aws" },
  { id: "de-release", title: "Release strategies", url: "delivery/release-strategies.html", module: "delivery", tool: "delivery" },
  { id: "de-gitops", title: "GitOps & progressive delivery", url: "delivery/gitops-progressive-delivery.html", module: "delivery", tool: "delivery" },
  { id: "op-incident", title: "Incident response & on-call", url: "operate/incident-response.html", module: "operate", tool: "operate" },
  { id: "op-postmortem", title: "Postmortems & resilience", url: "operate/postmortems-and-resilience.html", module: "operate", tool: "operate" },
  { id: "op-security", title: "DevSecOps essentials", url: "operate/devsecops-essentials.html", module: "operate", tool: "operate" },
  { id: "iv-method", title: "How DevOps interviews work", url: "interview/index.html", module: "interview", tool: "interview" },
  { id: "iv-bank", title: "DevOps question bank", url: "interview/question-bank.html", module: "interview", tool: "interview" },
  { id: "iv-scenarios", title: "Scenario walkthroughs", url: "interview/scenarios.html", module: "interview", tool: "interview" },
];

window.LESSON_MODULES = [
  { key: "foundations", label: "Foundations" },
  { key: "linux-networking", label: "Linux & Networking" },
  { key: "cicd", label: "Git & CI/CD" },
  { key: "containers", label: "Containers (Docker)" },
  { key: "kubernetes", label: "Kubernetes" },
  { key: "iac", label: "Infrastructure as Code" },
  { key: "aws", label: "AWS for DevOps" },
  { key: "delivery", label: "Deploy strategies & GitOps" },
  { key: "operate", label: "Reliability & Security" },
  { key: "interview", label: "Interview prep" },
];
