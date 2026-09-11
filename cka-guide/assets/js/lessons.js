/* ============================================================
   CKA Field Guide — canonical lesson registry
   GENERATED from tools/manifest.js by tools/gen.js — edit the
   manifest, then re-run `node tools/gen.js`. Stable lesson ids;
   each lesson page sets <body data-lesson="<id>">.
   ============================================================ */
window.LESSONS = [
  { id: "fo-model", title: "Kubernetes mental model", url: "foundations/k8s-mental-model.html", module: "foundations", tool: "foundations" },
  { id: "fo-kubectl", title: "kubectl fluency & docs speed", url: "foundations/kubectl-fluency.html", module: "foundations", tool: "foundations" },
  { id: "fo-api", title: "API objects, namespaces & labels", url: "foundations/api-objects.html", module: "foundations", tool: "foundations" },
  { id: "fo-yaml", title: "YAML vs imperative", url: "foundations/yaml-and-imperative.html", module: "foundations", tool: "foundations" },
  { id: "fo-exam", title: "How to take CKA", url: "foundations/exam-method.html", module: "foundations", tool: "foundations" },
  { id: "wl-deploy", title: "Deployments, rollouts & rollbacks", url: "workloads/deployments-rollouts.html", module: "workloads", tool: "workloads" },
  { id: "wl-config", title: "ConfigMaps & Secrets", url: "workloads/configmaps-secrets.html", module: "workloads", tool: "workloads" },
  { id: "wl-probes", title: "Probes & self-healing", url: "workloads/probes-self-healing.html", module: "workloads", tool: "workloads" },
  { id: "wl-hpa", title: "Requests, limits & HPA", url: "workloads/resources-hpa.html", module: "workloads", tool: "workloads" },
  { id: "wl-sched", title: "Scheduling: affinity, taints & admission", url: "workloads/scheduling.html", module: "workloads", tool: "workloads" },
  { id: "st-vol", title: "Volumes & access modes", url: "storage/volumes-access-modes.html", module: "storage", tool: "storage" },
  { id: "st-pv", title: "PV & PVC lifecycle", url: "storage/pv-pvc.html", module: "storage", tool: "storage" },
  { id: "st-sc", title: "StorageClass & dynamic provisioning", url: "storage/storageclass.html", module: "storage", tool: "storage" },
  { id: "net-pod", title: "Pod networking", url: "networking/pod-networking.html", module: "networking", tool: "networking" },
  { id: "net-svc", title: "Services & endpoints", url: "networking/services-endpoints.html", module: "networking", tool: "networking" },
  { id: "net-np", title: "NetworkPolicies", url: "networking/network-policies.html", module: "networking", tool: "networking" },
  { id: "net-ing", title: "Ingress controllers & resources", url: "networking/ingress.html", module: "networking", tool: "networking" },
  { id: "net-gw", title: "Gateway API", url: "networking/gateway-api.html", module: "networking", tool: "networking" },
  { id: "net-dns", title: "CoreDNS", url: "networking/coredns.html", module: "networking", tool: "networking" },
  { id: "cl-cp", title: "Control plane & node components", url: "cluster/control-plane-nodes.html", module: "cluster", tool: "cluster" },
  { id: "cl-ext", title: "Extension interfaces: CRI, CNI, CSI", url: "cluster/cri-cni-csi.html", module: "cluster", tool: "cluster" },
  { id: "cl-kubeadm", title: "kubeadm: create & manage clusters", url: "cluster/kubeadm-install.html", module: "cluster", tool: "cluster" },
  { id: "cl-ha", title: "HA control plane & cluster lifecycle", url: "cluster/ha-lifecycle.html", module: "cluster", tool: "cluster" },
  { id: "cl-rbac", title: "RBAC", url: "cluster/rbac.html", module: "cluster", tool: "cluster" },
  { id: "cl-helm", title: "Helm & Kustomize", url: "cluster/helm-kustomize.html", module: "cluster", tool: "cluster" },
  { id: "cl-crd", title: "CRDs & operators", url: "cluster/crds-operators.html", module: "cluster", tool: "cluster" },
  { id: "ts-pods", title: "Troubleshoot pods & apps", url: "troubleshooting/pods-apps.html", module: "troubleshooting", tool: "troubleshooting" },
  { id: "ts-nodes", title: "Troubleshoot nodes", url: "troubleshooting/nodes.html", module: "troubleshooting", tool: "troubleshooting" },
  { id: "ts-cp", title: "Troubleshoot control-plane components", url: "troubleshooting/control-plane.html", module: "troubleshooting", tool: "troubleshooting" },
  { id: "ts-net", title: "Troubleshoot Services, DNS & NetworkPolicy", url: "troubleshooting/services-dns-np.html", module: "troubleshooting", tool: "troubleshooting" },
  { id: "ts-logs", title: "Logs, events & kubectl debug", url: "troubleshooting/logs-debug.html", module: "troubleshooting", tool: "troubleshooting" },
  { id: "ts-mon", title: "Monitor cluster & app resources", url: "troubleshooting/resource-monitoring.html", module: "troubleshooting", tool: "troubleshooting" },
  { id: "ex-map", title: "CKA domain map", url: "exam/domain-map.html", module: "exam", tool: "exam" },
  { id: "ex-tasks", title: "Performance task bank", url: "exam/task-bank.html", module: "exam", tool: "exam" },
  { id: "ex-mock", title: "Timed task mock", url: "exam/mock-exam.html", module: "exam", tool: "exam" },
];

window.LESSON_MODULES = [
  { key: "foundations", label: "Foundations" },
  { key: "workloads", label: "Workloads & Scheduling" },
  { key: "storage", label: "Storage" },
  { key: "networking", label: "Services & Networking" },
  { key: "cluster", label: "Cluster Architecture" },
  { key: "troubleshooting", label: "Troubleshooting" },
  { key: "exam", label: "Exam prep" },
];
