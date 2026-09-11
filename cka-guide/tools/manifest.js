/* CKA Field Guide — site manifest (Curriculum v1.35 / Kubernetes v1.35) */
const MODULES = [
  { key: "foundations", label: "Foundations", pages: [
    { slug: "k8s-mental-model", title: "Kubernetes mental model", nav: "Mental model", id: "fo-model", widgets: ["mermaid-init.js", "reqflow.js"] },
    { slug: "kubectl-fluency", title: "kubectl fluency & docs speed", nav: "kubectl fluency", id: "fo-kubectl", widgets: ["mermaid-init.js"] },
    { slug: "api-objects", title: "API objects, namespaces & labels", nav: "API objects", id: "fo-api", widgets: ["mermaid-init.js"] },
    { slug: "yaml-and-imperative", title: "YAML vs imperative", nav: "YAML · imperative", id: "fo-yaml", widgets: ["mermaid-init.js"] },
    { slug: "exam-method", title: "How to take CKA", nav: "Exam method", id: "fo-exam", widgets: ["mermaid-init.js"] },
  ]},
  { key: "workloads", label: "Workloads & Scheduling", pages: [
    { slug: "deployments-rollouts", title: "Deployments, rollouts & rollbacks", nav: "Deployments", id: "wl-deploy", widgets: ["mermaid-init.js"] },
    { slug: "configmaps-secrets", title: "ConfigMaps & Secrets", nav: "ConfigMaps · Secrets", id: "wl-config", widgets: ["mermaid-init.js"] },
    { slug: "probes-self-healing", title: "Probes & self-healing", nav: "Probes", id: "wl-probes", widgets: ["mermaid-init.js"] },
    { slug: "resources-hpa", title: "Requests, limits & HPA", nav: "Resources · HPA", id: "wl-hpa", widgets: ["mermaid-init.js", "tradeoff.js"] },
    { slug: "scheduling", title: "Scheduling: affinity, taints & admission", nav: "Scheduling", id: "wl-sched", widgets: ["mermaid-init.js"] },
  ]},
  { key: "storage", label: "Storage", pages: [
    { slug: "volumes-access-modes", title: "Volumes & access modes", nav: "Volumes", id: "st-vol", widgets: ["mermaid-init.js"] },
    { slug: "pv-pvc", title: "PV & PVC lifecycle", nav: "PV · PVC", id: "st-pv", widgets: ["mermaid-init.js", "reqflow.js"] },
    { slug: "storageclass", title: "StorageClass & dynamic provisioning", nav: "StorageClass", id: "st-sc", widgets: ["mermaid-init.js"] },
  ]},
  { key: "networking", label: "Services & Networking", pages: [
    { slug: "pod-networking", title: "Pod networking", nav: "Pod networking", id: "net-pod", widgets: ["mermaid-init.js"] },
    { slug: "services-endpoints", title: "Services & endpoints", nav: "Services", id: "net-svc", widgets: ["mermaid-init.js", "reqflow.js"] },
    { slug: "network-policies", title: "NetworkPolicies", nav: "NetworkPolicies", id: "net-np", widgets: ["mermaid-init.js"] },
    { slug: "ingress", title: "Ingress controllers & resources", nav: "Ingress", id: "net-ing", widgets: ["mermaid-init.js"] },
    { slug: "gateway-api", title: "Gateway API", nav: "Gateway API", id: "net-gw", widgets: ["mermaid-init.js", "reqflow.js"] },
    { slug: "coredns", title: "CoreDNS", nav: "CoreDNS", id: "net-dns", widgets: ["mermaid-init.js"] },
  ]},
  { key: "cluster", label: "Cluster Architecture", pages: [
    { slug: "control-plane-nodes", title: "Control plane & node components", nav: "Control plane", id: "cl-cp", widgets: ["mermaid-init.js", "reqflow.js"] },
    { slug: "cri-cni-csi", title: "Extension interfaces: CRI, CNI, CSI", nav: "CRI · CNI · CSI", id: "cl-ext", widgets: ["mermaid-init.js"] },
    { slug: "kubeadm-install", title: "kubeadm: create & manage clusters", nav: "kubeadm", id: "cl-kubeadm", widgets: ["mermaid-init.js"] },
    { slug: "ha-lifecycle", title: "HA control plane & cluster lifecycle", nav: "HA · lifecycle", id: "cl-ha", widgets: ["mermaid-init.js"] },
    { slug: "rbac", title: "RBAC", nav: "RBAC", id: "cl-rbac", widgets: ["mermaid-init.js"] },
    { slug: "helm-kustomize", title: "Helm & Kustomize", nav: "Helm · Kustomize", id: "cl-helm", widgets: ["mermaid-init.js", "tradeoff.js"] },
    { slug: "crds-operators", title: "CRDs & operators", nav: "CRDs · operators", id: "cl-crd", widgets: ["mermaid-init.js"] },
  ]},
  { key: "troubleshooting", label: "Troubleshooting", pages: [
    { slug: "pods-apps", title: "Troubleshoot pods & apps", nav: "Pods & apps", id: "ts-pods", widgets: ["mermaid-init.js"] },
    { slug: "nodes", title: "Troubleshoot nodes", nav: "Nodes", id: "ts-nodes", widgets: ["mermaid-init.js"] },
    { slug: "control-plane", title: "Troubleshoot control-plane components", nav: "Control plane", id: "ts-cp", widgets: ["mermaid-init.js"] },
    { slug: "services-dns-np", title: "Troubleshoot Services, DNS & NetworkPolicy", nav: "Svc · DNS · NP", id: "ts-net", widgets: ["mermaid-init.js"] },
    { slug: "logs-debug", title: "Logs, events & kubectl debug", nav: "Logs · debug", id: "ts-logs", widgets: ["mermaid-init.js"] },
    { slug: "resource-monitoring", title: "Monitor cluster & app resources", nav: "Monitoring", id: "ts-mon", widgets: ["mermaid-init.js"] },
  ]},
];

const EXAM_PREP = [
  { dir: "exam", slug: "domain-map", title: "CKA domain map", nav: "Domain map", id: "ex-map", widgets: ["mermaid-init.js"] },
  { dir: "exam", slug: "task-bank", title: "Performance task bank", nav: "Task bank", id: "ex-tasks", widgets: ["mermaid-init.js"] },
  { dir: "exam", slug: "mock-exam", title: "Timed task mock", nav: "Timed mock", id: "ex-mock", widgets: ["mock-exam.js"] },
];

const REFERENCE = [
  { dir: "exam", slug: "cheat-sheet", title: "CKA cheat-sheet", nav: "Cheat-sheet", tool: "exam", widgets: [] },
  { dir: "exam", slug: "flashcards", title: "CKA flashcards", nav: "Flashcards", tool: "exam", widgets: ["flashcards.js"] },
  { dir: "reference", slug: "glossary", title: "Glossary", nav: "Glossary", tool: "", widgets: [] },
];

function file(dir, slug) { return (dir ? dir + "/" : "") + slug + ".html"; }

function allPages() {
  const out = [];
  out.push({ file: "index.html", dir: "", slug: "index", title: "CKA Field Guide", tool: "", lesson: null, module: null, widgets: [] });
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

module.exports = { MODULES, INTERVIEW_PREP: EXAM_PREP, EXAM_PREP, REFERENCE, allPages, sidebarGroups, lessons, LESSON_MODULES, file };
