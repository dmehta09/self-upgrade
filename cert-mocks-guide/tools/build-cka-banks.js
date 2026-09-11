#!/usr/bin/env node
/* ============================================================
   Cert Mocks Guide — CKA v1.35 task-bank generator.

   Writes tools/content/cka-mock-{1,2,3}.html fragments with
   timed performance banks (data-task-mock + #mockBank JSON).

   Usage:  node tools/build-cka-banks.js
   ============================================================ */
"use strict";

const fs = require("fs");
const path = require("path");

const OUT_DIR = path.join(__dirname, "content");
const L = (p) => "../../cka-guide/" + p;

const D = {
  T: { domain: "Troubleshooting", weight: 30 },
  C: { domain: "Cluster Architecture", weight: 25 },
  N: { domain: "Services & Networking", weight: 20 },
  W: { domain: "Workloads & Scheduling", weight: 15 },
  S: { domain: "Storage", weight: 10 },
};

function task(meta, stem, solutionSteps, verify, why, lesson) {
  return {
    domain: meta.domain,
    weight: meta.weight,
    stem,
    solutionSteps,
    verify,
    why,
    lesson: L(lesson),
  };
}

/* ---- Mock 1 · ns themes: retail / edge / ops ---- */
const MOCK1 = [
  task(
    D.T,
    "Namespace retail has Deployment checkout stuck in CrashLoopBackOff. Use describe and previous container logs to find the bad env key on ConfigMap checkout-cfg, fix it, and wait until Pods are Ready.",
    [
      "kubectl -n retail get pods -l app=checkout",
      "kubectl -n retail describe pod {checkout-pod}",
      "kubectl -n retail logs {checkout-pod} -c checkout --previous",
      "kubectl -n retail edit configmap checkout-cfg",
      "kubectl -n retail rollout status deploy/checkout",
    ],
    "checkout Pods Ready 1/1; no CrashLoop; app starts without missing env.",
    "CrashLoop diagnosis starts with Events and --previous logs; fix the owned ConfigMap, not endless pod deletes.",
    "troubleshooting/pods-apps.html"
  ),
  task(
    D.T,
    "Worker node edge-b is NotReady. Diagnose kubelet/runtime conditions, cordon if needed, restore Ready, then uncordon.",
    [
      "kubectl get nodes; kubectl describe node edge-b",
      "systemctl status kubelet containerd",
      "kubectl cordon edge-b",
      "fix disk/runtime or restart kubelet/containerd as indicated",
      "kubectl uncordon edge-b",
    ],
    "edge-b Ready=True; SchedulingDisabled cleared.",
    "Node NotReady is host-plane (kubelet/CRI/disk), not Deployment YAML.",
    "troubleshooting/nodes.html"
  ),
  task(
    D.T,
    "API server answers kubectl but new Pods stay Pending with no scheduler Events. Restore the kube-scheduler static Pod under /etc/kubernetes/manifests.",
    [
      "kubectl get pods -n kube-system | grep scheduler",
      "ls /etc/kubernetes/manifests",
      "crictl ps -a | grep kube-scheduler",
      "restore or fix /etc/kubernetes/manifests/kube-scheduler.yaml; journalctl -u kubelet -e",
    ],
    "kube-scheduler Running; new Pods receive a nodeName.",
    "API healthy + no binds usually means the scheduler component is down.",
    "troubleshooting/control-plane.html"
  ),
  task(
    D.T,
    "Service catalog in namespace retail has empty Endpoints while Pods are Running. Align Service selector and Pod labels so Endpoints populate.",
    [
      "kubectl -n retail get svc catalog -o yaml",
      "kubectl -n retail get pods --show-labels",
      "kubectl -n retail get endpoints catalog",
      "kubectl -n retail patch svc catalog --type merge -p '{selector fix}' or relabel Pods",
    ],
    "kubectl -n retail get ep catalog shows Pod IPs; curl ClusterIP succeeds.",
    "Empty Endpoints means selector/readiness mismatch, not VIP magic.",
    "troubleshooting/services-dns-np.html"
  ),
  task(
    D.T,
    "Distroless Pod storefront in namespace retail cannot exec. Use kubectl debug with an ephemeral container to wget the backend Service and decide whether NetworkPolicy is blocking.",
    [
      "kubectl -n retail debug -it storefront --image=busybox:1.36 --target=app -- sh",
      "wget -qO- http://backend.retail.svc:8080/health || true",
      "kubectl -n retail get networkpolicies -o wide",
    ],
    "You can state allow vs deny with evidence from debug output and NetworkPolicy rules.",
    "Ephemeral debug shares the Pod network namespace without changing the app image.",
    "troubleshooting/logs-debug.html"
  ),
  task(
    D.T,
    "kubectl top fails cluster-wide. Repair metrics-server in kube-system, then name the noisiest CPU Pod across all namespaces.",
    [
      "kubectl top nodes",
      "kubectl -n kube-system get deploy,pods | grep metrics",
      "kubectl -n kube-system logs deploy/metrics-server",
      "kubectl top pods -A --sort-by=cpu | head",
    ],
    "kubectl top works; you can name the top CPU consumer Pod.",
    "Without the metrics API, top and resource-based HPA cannot function.",
    "troubleshooting/resource-monitoring.html"
  ),
  task(
    D.C,
    "Create ServiceAccount shipper in namespace deliver with a Role that allows get/list/watch on configmaps only. Bind it and prove with auth can-i.",
    [
      "kubectl -n deliver create sa shipper",
      "kubectl -n deliver create role cm-reader --verb=get,list,watch --resource=configmaps",
      "kubectl -n deliver create rolebinding shipper-cm --role=cm-reader --serviceaccount=deliver:shipper",
      "kubectl auth can-i get configmaps -n deliver --as=system:serviceaccount:deliver:shipper",
      "kubectl auth can-i create pods -n deliver --as=system:serviceaccount:deliver:shipper",
    ],
    "can-i yes for configmaps; no for create pods.",
    "Least-privilege namespaced RBAC is a core Cluster Architecture skill.",
    "cluster/rbac.html"
  ),
  task(
    D.C,
    "Using Helm, install chart bitnami/nginx as release edge-web into namespace edge with replicaCount=2. Confirm the release and Deployment.",
    [
      "kubectl create ns edge --dry-run=client -o yaml | kubectl apply -f -",
      "helm repo add bitnami https://charts.bitnami.com/bitnami && helm repo update",
      "helm upgrade --install edge-web bitnami/nginx -n edge --set replicaCount=2",
      "helm -n edge status edge-web; kubectl -n edge get deploy",
    ],
    "helm list -n edge shows edge-web deployed; Deployment readyReplicas=2.",
    "Helm is in-scope for modern CKA packaging tasks.",
    "cluster/helm-kustomize.html"
  ),
  task(
    D.C,
    "On a control-plane node, confirm containerd is the CRI, that a CNI config exists under /etc/cni/net.d, and that a CSI-related Pod is Running in kube-system. Summarize each plane in one line.",
    [
      "crictl info | grep -i runtime",
      "ls /etc/cni/net.d; kubectl get pods -n kube-system -o wide | grep -i cni",
      "kubectl get pods -n kube-system | grep -i csi",
    ],
    "You can state CRI runtime, CNI config present, and at least one CSI Pod Running.",
    "CRI/CNI/CSI are separate planes; exam tasks often ask you to locate which one failed.",
    "cluster/cri-cni-csi.html"
  ),
  task(
    D.C,
    "Drain worker edge-a for maintenance with ignore-daemonsets and delete-emptydir-data, confirm cordoned and empty of non-DaemonSet Pods, then uncordon when done.",
    [
      "kubectl drain edge-a --ignore-daemonsets --delete-emptydir-data",
      "kubectl get node edge-a; kubectl get pods -A -o wide --field-selector spec.nodeName=edge-a",
      "kubectl uncordon edge-a",
    ],
    "During drain: SchedulingDisabled and no user Pods on edge-a; after: Ready and schedulable.",
    "Lifecycle drain/uncordon is standard HA maintenance, not etcd dump trivia.",
    "cluster/ha-lifecycle.html"
  ),
  task(
    D.N,
    "In namespace mesh, create NetworkPolicy web-allow that selects Pods app=web, default-denies ingress, and allows TCP 8080 only from Pods role=frontend in the same namespace.",
    [
      "kubectl -n mesh apply -f - <<'EOF'\napiVersion: networking.k8s.io/v1\nkind: NetworkPolicy\nmetadata:\n  name: web-allow\n  namespace: mesh\nspec:\n  podSelector:\n    matchLabels:\n      app: web\n  policyTypes: [Ingress]\n  ingress:\n  - from:\n    - podSelector:\n        matchLabels:\n          role: frontend\n    ports:\n    - protocol: TCP\n      port: 8080\nEOF",
      "kubectl -n mesh describe networkpolicy web-allow",
    ],
    "NetworkPolicy web-allow exists; ingress rules match frontend→web:8080 only.",
    "NetworkPolicy is allow-list once selected; missing from: means deny for others.",
    "networking/network-policies.html"
  ),
  task(
    D.N,
    "In namespace edge, create Gateway API HTTPRoute shop-route attaching to Gateway public-gw, matching PathPrefix /shop, backend Service shop-svc port 80.",
    [
      "kubectl -n edge apply -f - <<'EOF'\napiVersion: gateway.networking.k8s.io/v1\nkind: HTTPRoute\nmetadata:\n  name: shop-route\n  namespace: edge\nspec:\n  parentRefs:\n  - name: public-gw\n  rules:\n  - matches:\n    - path:\n        type: PathPrefix\n        value: /shop\n    backendRefs:\n    - name: shop-svc\n      port: 80\nEOF",
      "kubectl -n edge get httproute shop-route -o yaml",
    ],
    "HTTPRoute Accepted/ResolvedRefs; traffic path /shop targets shop-svc:80.",
    "Gateway API (not only Ingress) is expected on CKA v1.35 networking tasks.",
    "networking/gateway-api.html"
  ),
  task(
    D.N,
    "Expose Deployment payments in namespace retail as ClusterIP Service payments on port 80 targeting container port 8080. Confirm Endpoints list Pod IPs.",
    [
      "kubectl -n retail expose deploy/payments --name=payments --port=80 --target-port=8080 --type=ClusterIP",
      "kubectl -n retail get svc,ep payments",
      "kubectl -n retail get pods -l app=payments -o wide",
    ],
    "Service payments ClusterIP; Endpoints contain Ready Pod IPs.",
    "Service→Endpoints wiring is the core of Services & Networking.",
    "networking/services-endpoints.html"
  ),
  task(
    D.N,
    "From a debug Pod in namespace retail, resolve kubernetes.default and payments.retail.svc.cluster.local. If CoreDNS is broken, restore the coredns Deployment in kube-system.",
    [
      "kubectl -n retail run dnscheck --rm -it --restart=Never --image=busybox:1.36 -- nslookup kubernetes.default",
      "kubectl -n retail run dnscheck2 --rm -it --restart=Never --image=busybox:1.36 -- nslookup payments.retail.svc.cluster.local",
      "kubectl -n kube-system get deploy coredns; kubectl -n kube-system logs -l k8s-app=kube-dns",
    ],
    "Both lookups succeed; coredns Pods Ready.",
    "Cluster DNS failures almost always trace to CoreDNS or the Pod DNSConfig path.",
    "networking/coredns.html"
  ),
  task(
    D.W,
    "In namespace batch, create Deployment worker with 3 replicas of nginx:1.27, then scale to 5 and record a rollout undo after a bad image change.",
    [
      "kubectl -n batch create deploy worker --image=nginx:1.27 --replicas=3",
      "kubectl -n batch scale deploy/worker --replicas=5",
      "kubectl -n batch set image deploy/worker nginx=nginx:badtag",
      "kubectl -n batch rollout undo deploy/worker",
      "kubectl -n batch rollout status deploy/worker",
    ],
    "worker availableReplicas=5 on a good image; rollout history shows undo.",
    "Deployments + rollouts are the Workloads backbone of CKA.",
    "workloads/deployments-rollouts.html"
  ),
  task(
    D.W,
    "In namespace batch, create an HPA named worker-hpa for Deployment worker targeting 60% CPU, min 2 max 8. Confirm the HPA object references the Deployment.",
    [
      "kubectl -n batch autoscale deploy/worker --name=worker-hpa --cpu-percent=60 --min=2 --max=8",
      "kubectl -n batch get hpa worker-hpa -o yaml",
      "kubectl -n batch describe hpa worker-hpa",
    ],
    "HPA worker-hpa exists; scaleTargetRef is Deployment/worker; min=2 max=8.",
    "HPA is in modern CKA workloads; it needs metrics-server to actually scale.",
    "workloads/resources-hpa.html"
  ),
  task(
    D.S,
    "In namespace data, create PVC reports-pvc requesting 2Gi ReadWriteOnce from StorageClass local-path. Mount it on Pod reports-pod at /data and confirm Bound.",
    [
      "kubectl -n data apply -f - <<'EOF'\napiVersion: v1\nkind: PersistentVolumeClaim\nmetadata:\n  name: reports-pvc\n  namespace: data\nspec:\n  accessModes: [ReadWriteOnce]\n  storageClassName: local-path\n  resources:\n    requests:\n      storage: 2Gi\nEOF",
      "kubectl -n data run reports-pod --image=busybox:1.36 --restart=Never --overrides='{mount PVC at /data}' -- sleep 3600",
      "kubectl -n data get pvc reports-pvc; kubectl -n data exec reports-pod -- df /data",
    ],
    "PVC Bound; Pod Running with /data mounted.",
    "PV/PVC binding and mount verification are the Storage 10% staples.",
    "storage/pv-pvc.html"
  ),
  task(
    D.S,
    "Create StorageClass fast-ssd with provisioner rancher.io/local-path, volumeBindingMode WaitForFirstConsumer, and reclaimPolicy Delete. Show it is not the default unless annotated.",
    [
      "kubectl apply -f - <<'EOF'\napiVersion: storage.k8s.io/v1\nkind: StorageClass\nmetadata:\n  name: fast-ssd\nprovisioner: rancher.io/local-path\nreclaimPolicy: Delete\nvolumeBindingMode: WaitForFirstConsumer\nEOF",
      "kubectl get storageclass fast-ssd -o yaml",
      "kubectl get sc",
    ],
    "StorageClass fast-ssd exists with WaitForFirstConsumer and Delete; default marker only if you annotated it.",
    "StorageClass controls provisioner, binding mode, and reclaim — not the PVC size alone.",
    "storage/storageclass.html"
  ),
];

/* ---- Mock 2 · ns themes: platform / apps / lab ---- */
const MOCK2 = [
  task(
    D.T,
    "Pod invoice in namespace billing is ImagePullBackOff. Fix the image reference on Deployment invoice so Pods become Ready.",
    [
      "kubectl -n billing get pods -l app=invoice",
      "kubectl -n billing describe pod {invoice-pod} | grep -A5 Events",
      "kubectl -n billing set image deploy/invoice invoice=nginx:1.27",
      "kubectl -n billing rollout status deploy/invoice",
    ],
    "invoice Pods Ready; Events no longer show ErrImagePull/ImagePullBackOff.",
    "ImagePullBackOff is registry/tag/secret — read Events before rewriting YAML blindly.",
    "troubleshooting/pods-apps.html"
  ),
  task(
    D.T,
    "Node lab-worker-1 shows MemoryPressure and pods are being evicted. Identify pressure condition, free or cordon appropriately, and restore a healthy Ready state.",
    [
      "kubectl describe node lab-worker-1 | grep -A20 Conditions",
      "kubectl get pods -A --field-selector spec.nodeName=lab-worker-1",
      "address disk/memory pressure on the host; restart kubelet if needed",
      "kubectl get node lab-worker-1",
    ],
    "lab-worker-1 Ready without MemoryPressure; evictions stop.",
    "Node conditions drive kubelet eviction; treat the host resource plane.",
    "troubleshooting/nodes.html"
  ),
  task(
    D.T,
    "Static Pod kube-controller-manager is missing from kube-system. Restore its manifest and confirm leader election / Running state.",
    [
      "kubectl get pods -n kube-system | grep controller-manager",
      "ls /etc/kubernetes/manifests",
      "restore kube-controller-manager.yaml; crictl ps | grep controller",
      "kubectl -n kube-system logs {cm-pod} --tail=50",
    ],
    "kube-controller-manager Running; controllers reconcile (e.g. Deployments progress).",
    "Control-plane static Pods live under manifests/; kubelet is the supervisor.",
    "troubleshooting/control-plane.html"
  ),
  task(
    D.T,
    "Clients in namespace apps cannot reach Service api via DNS name api.apps.svc. ClusterIP ping works from a Pod on the same node network. Fix CoreDNS or the Service DNS path.",
    [
      "kubectl -n apps get svc api; kubectl -n apps get endpoints api",
      "kubectl -n apps run dig --rm -it --restart=Never --image=busybox:1.36 -- nslookup api.apps.svc",
      "kubectl -n kube-system get pods -l k8s-app=kube-dns; kubectl -n kube-system logs -l k8s-app=kube-dns",
      "fix Corefile / coredns Deployment as needed",
    ],
    "nslookup api.apps.svc succeeds; curl http://api.apps.svc works from a client Pod.",
    "Distinguish Service Endpoints health from cluster DNS resolution failures.",
    "troubleshooting/services-dns-np.html"
  ),
  task(
    D.T,
    "Application Pod ledger in namespace apps is Running but you need filesystem contents without changing the image. Use kubectl debug --copy-to or ephemeral container to ls /var/log/app and capture findings.",
    [
      "kubectl -n apps debug ledger -it --image=busybox:1.36 --target=ledger -- sh",
      "ls -la /var/log/app || ls -la /",
      "kubectl -n apps logs ledger --tail=100",
    ],
    "You inspected the container filesystem/logs via debug; note path that held the evidence.",
    "kubectl debug is the modern CKA path for distroless and sealed images.",
    "troubleshooting/logs-debug.html"
  ),
  task(
    D.T,
    "metrics-server arguments reject insecure kubelet TLS and top is empty. Adjust the Deployment args appropriately for your lab, restart, and show kubectl top nodes working.",
    [
      "kubectl -n kube-system get deploy metrics-server -o yaml",
      "kubectl -n kube-system edit deploy metrics-server",
      "kubectl -n kube-system rollout status deploy/metrics-server",
      "kubectl top nodes; kubectl top pods -A | head",
    ],
    "kubectl top nodes returns CPU/memory; metrics-server Pods Ready.",
    "Resource monitoring on CKA often means repairing metrics-server flags, not Prometheus.",
    "troubleshooting/resource-monitoring.html"
  ),
  task(
    D.C,
    "Create ClusterRole pod-reader allowing get/list/watch on pods cluster-wide. Bind it to ServiceAccount auditor in namespace platform via ClusterRoleBinding auditor-pods. Prove can-i in another namespace.",
    [
      "kubectl -n platform create sa auditor",
      "kubectl create clusterrole pod-reader --verb=get,list,watch --resource=pods",
      "kubectl create clusterrolebinding auditor-pods --clusterrole=pod-reader --serviceaccount=platform:auditor",
      "kubectl auth can-i list pods -n kube-system --as=system:serviceaccount:platform:auditor",
    ],
    "can-i list pods is yes in kube-system for the auditor SA.",
    "ClusterRoleBinding extends RBAC beyond a single namespace.",
    "cluster/rbac.html"
  ),
  task(
    D.C,
    "In directory /tmp/kustomize-lab with a base Deployment, use Kustomize to set replicas to 4 and name prefix lab-, then apply to namespace lab.",
    [
      "mkdir -p /tmp/kustomize-lab && cd /tmp/kustomize-lab",
      "write kustomization.yaml with resources, namePrefix: lab-, replicas",
      "kubectl apply -k /tmp/kustomize-lab -n lab",
      "kubectl -n lab get deploy",
    ],
    "Namespaced Deployment lab-* shows 4 replicas from kubectl apply -k.",
    "Kustomize (kubectl -k) is first-class alongside Helm on modern CKA.",
    "cluster/helm-kustomize.html"
  ),
  task(
    D.C,
    "Using kubeadm, show the current cluster version and plan an upgrade of the control plane to the next patch (dry-run / plan only). Do not leave the cluster mid-upgrade.",
    [
      "kubectl version --short || kubectl version",
      "kubeadm version",
      "kubeadm upgrade plan",
      "document the chosen target version from plan output",
    ],
    "kubeadm upgrade plan succeeds and shows a clear target version; cluster still healthy.",
    "kubeadm upgrade plan is the safe CKA skill; full upgrade needs careful sequencing.",
    "cluster/kubeadm-install.html"
  ),
  task(
    D.C,
    "Install a sample CRD widgets.demo.example.com (namespaced, v1, status subresource optional). Create one Widget named sample in namespace lab and show it with kubectl get.",
    [
      "kubectl apply -f {crd-yaml}",
      "kubectl get crd widgets.demo.example.com",
      "kubectl -n lab apply -f {widget-cr-yaml}",
      "kubectl -n lab get widgets sample -o yaml",
    ],
    "CRD Established; Widget sample exists in lab.",
    "CRDs extend the API; CKA expects apply/get, not writing operators from scratch.",
    "cluster/crds-operators.html"
  ),
  task(
    D.N,
    "In namespace apps, create Ingress api-ing (or Gateway equivalent if IngressClass missing) routing host api.lab.local PathPrefix /v1 to Service api:80.",
    [
      "kubectl -n apps create ingress api-ing --class=nginx --rule='api.lab.local/v1*=api:80'",
      "kubectl -n apps get ingress api-ing -o yaml",
      "kubectl -n apps describe ingress api-ing",
    ],
    "Ingress rules show host/path → api:80; address or Accepted as your controller allows.",
    "Ingress remains valid; prefer Gateway API when the lab provides it.",
    "networking/ingress.html"
  ),
  task(
    D.N,
    "Create NetworkPolicy default-deny-apps in namespace apps that selects all Pods and denies all Ingress and Egress. Then add allow-dns egress for UDP/TCP 53 to kube-system.",
    [
      "kubectl -n apps apply -f {default-deny-policy}",
      "kubectl -n apps apply -f {allow-dns-egress-policy}",
      "kubectl -n apps get networkpolicy",
    ],
    "Both policies exist; Pods cannot reach arbitrary nets but DNS to kube-system:53 works.",
    "Default-deny plus explicit DNS egress is a classic NetworkPolicy exam pattern.",
    "networking/network-policies.html"
  ),
  task(
    D.N,
    "Document the CNI plugin in use and show that Pods on different nodes have distinct PodCIDRs/routes. Create two debug Pods on different nodes if possible and confirm cross-Pod connectivity.",
    [
      "kubectl get nodes -o jsonpath='{range .items[*]}{.metadata.name}{\" \"}{.spec.podCIDR}{\"\\n\"}{end}'",
      "ls /etc/cni/net.d; kubectl get pods -n kube-system | grep -iE 'calico|cilium|flannel|weave'",
      "kubectl -n lab run a --image=busybox:1.36 --restart=Never -- sleep 3600",
      "kubectl -n lab run b --image=busybox:1.36 --restart=Never -- sleep 3600",
      "kubectl -n lab exec a -- ping -c1 {b-pod-ip}",
    ],
    "You named the CNI; Pod-to-Pod ping across nodes works (or you explained the block).",
    "Pod networking is CNI + routes; Services sit on top.",
    "networking/pod-networking.html"
  ),
  task(
    D.N,
    "In namespace edge2, create Gateway public-gw (GatewayClass as provided in lab) listening HTTP :80, then HTTPRoute root-route PathPrefix / to Service homepage:8080.",
    [
      "kubectl -n edge2 apply -f {gateway-yaml}",
      "kubectl -n edge2 apply -f {httproute-yaml}",
      "kubectl -n edge2 get gateway,httproute",
    ],
    "Gateway Programmed/Accepted; HTTPRoute parentRef binds; backend homepage:8080.",
    "Gateway + HTTPRoute is the v1.35 networking default for L7 routing tasks.",
    "networking/gateway-api.html"
  ),
  task(
    D.W,
    "In namespace platform, create Pod probe-demo with nginx:1.27, readinessProbe httpGet / on 80 (initialDelaySeconds 5), and livenessProbe httpGet / on 80 (periodSeconds 10). Confirm Ready.",
    [
      "kubectl -n platform apply -f {probe-demo-pod-yaml}",
      "kubectl -n platform describe pod probe-demo | grep -A20 Probes",
      "kubectl -n platform get pod probe-demo -w",
    ],
    "Pod Ready 1/1; describe shows both probes configured.",
    "Probes drive Ready and restarts — self-healing without custom controllers.",
    "workloads/probes-self-healing.html"
  ),
  task(
    D.W,
    "Schedule Pod pinned-hw in namespace lab onto a node labeled disk=ssd using nodeSelector. Label a node if needed, create the Pod, confirm nodeName.",
    [
      "kubectl label node {node} disk=ssd --overwrite",
      "kubectl -n lab run pinned-hw --image=nginx:1.27 --overrides='{nodeSelector disk=ssd}' --restart=Never",
      "kubectl -n lab get pod pinned-hw -o wide",
    ],
    "Pod Running on the labeled node only.",
    "Scheduling constraints (nodeSelector/affinity/taints) are Workloads & Scheduling territory.",
    "workloads/scheduling.html"
  ),
  task(
    D.S,
    "In namespace persist, create Pod vol-modes with an emptyDir volume at /cache and a PVC data-pvc (1Gi RWO) at /data. Confirm both mounts with df/mount.",
    [
      "kubectl -n persist apply -f {data-pvc-yaml}",
      "kubectl -n persist apply -f {vol-modes-pod-yaml}",
      "kubectl -n persist exec vol-modes -- df -h /cache /data",
    ],
    "Both paths mounted; PVC Bound; emptyDir present.",
    "Know access modes and volume types — emptyDir vs PVC is a common contrast.",
    "storage/volumes-access-modes.html"
  ),
  task(
    D.S,
    "Create PV static-pv 5Gi ReadWriteOnce hostPath /mnt/data, reclaim Retain, and PVC static-pvc that binds to it by volumeName or matching size/access. Mount on Pod static-pod in namespace persist.",
    [
      "kubectl apply -f {static-pv-yaml}",
      "kubectl -n persist apply -f {static-pvc-yaml}",
      "kubectl -n persist apply -f {static-pod-yaml}",
      "kubectl get pv,pvc -A | grep static",
    ],
    "PVC Bound to static-pv; Pod Running with volume mounted.",
    "Static PV + PVC binding still appears; prefer StorageClass dynamics when available.",
    "storage/pv-pvc.html"
  ),
];

/* ---- Mock 3 · ns themes: prod / staging / kube-ops ---- */
const MOCK3 = [
  task(
    D.T,
    "Deployment cart in namespace shop is progressing but Pods fail readiness and stay 0/1 Ready. Fix the readiness probe path or port so traffic can flow.",
    [
      "kubectl -n shop get pods -l app=cart",
      "kubectl -n shop describe pod {cart-pod} | grep -A15 Readiness",
      "kubectl -n shop edit deploy/cart",
      "kubectl -n shop get pods -l app=cart",
    ],
    "cart Pods Ready 1/1; Service Endpoints include them.",
    "Not Ready often means probe mismatch, not CrashLoop.",
    "troubleshooting/pods-apps.html"
  ),
  task(
    D.T,
    "Node staging-w2 is Ready but SchedulingDisabled from a forgotten cordon. Confirm no maintenance is needed, uncordon, and schedule a test Pod onto it.",
    [
      "kubectl get nodes",
      "kubectl describe node staging-w2 | grep Taints",
      "kubectl uncordon staging-w2",
      "kubectl -n staging run land --image=busybox:1.36 --restart=Never --overrides='{nodeName staging-w2}' -- sleep 30",
    ],
    "staging-w2 schedulable; test Pod lands on that node.",
    "Cordon left behind is a common ops footgun on node troubleshooting.",
    "troubleshooting/nodes.html"
  ),
  task(
    D.T,
    "kubectl get cs or componentstatuses is stale; instead verify etcd, apiserver, and scheduler via static Pods and local healthz. Restore any missing static Pod manifest (do not perform etcd snapshot restore).",
    [
      "kubectl get pods -n kube-system -o wide | grep -E 'etcd|apiserver|scheduler'",
      "ls /etc/kubernetes/manifests",
      "curl -k https://127.0.0.1:6443/healthz || true",
      "fix missing manifests; avoid etcdctl snapshot as the primary task",
    ],
    "All control-plane static Pods Running; API healthz ok.",
    "Modern CKA stresses component health and manifests — not deep etcd backup drills.",
    "troubleshooting/control-plane.html"
  ),
  task(
    D.T,
    "NetworkPolicy lock-shop in namespace shop accidentally blocks CoreDNS egress. Adjust policies so Pods can resolve cluster DNS while keeping default-deny for other egress.",
    [
      "kubectl -n shop get networkpolicy",
      "kubectl -n shop describe networkpolicy lock-shop",
      "apply egress allow to namespace kube-system (or podSelector k8s-app=kube-dns) ports 53",
      "kubectl -n shop run ns --rm -it --restart=Never --image=busybox:1.36 -- nslookup kubernetes.default",
    ],
    "DNS works; non-DNS egress still denied by policy.",
    "NP troubleshooting is often DNS collateral damage after default-deny egress.",
    "troubleshooting/services-dns-np.html"
  ),
  task(
    D.T,
    "On a failing Pod payments in namespace shop, collect current logs, previous logs, and Events. Use kubectl debug to confirm the process listen port matches the Service targetPort.",
    [
      "kubectl -n shop logs payments --tail=100",
      "kubectl -n shop logs payments --previous --tail=50 || true",
      "kubectl -n shop describe pod payments",
      "kubectl -n shop debug -it payments --image=busybox:1.36 --target=app -- sh",
    ],
    "You have log+Event evidence and confirmed listen port vs Service targetPort.",
    "Structured log/Event/debug triage beats random restarts.",
    "troubleshooting/logs-debug.html"
  ),
  task(
    D.T,
    "Identify the top three memory consumers cluster-wide with kubectl top, then annotate why one Deployment should set memory requests/limits.",
    [
      "kubectl top pods -A --sort-by=memory | head -n 20",
      "kubectl -n {ns} get deploy {noisy} -o yaml | grep -A10 resources || true",
      "kubectl -n {ns} set resources deploy/{noisy} --requests=memory=128Mi --limits=memory=256Mi",
    ],
    "Top consumers listed; at least one Deployment has memory requests/limits set.",
    "Monitoring tasks close the loop into resource hygiene.",
    "troubleshooting/resource-monitoring.html"
  ),
  task(
    D.C,
    "Create Role secret-reader in namespace prod allowing get/list on secrets. Bind to group shop-admins via RoleBinding prod-secret-readers. Prove with --as and --as-group.",
    [
      "kubectl -n prod create role secret-reader --verb=get,list --resource=secrets",
      "kubectl -n prod create rolebinding prod-secret-readers --role=secret-reader --group=shop-admins",
      "kubectl auth can-i get secrets -n prod --as=jane --as-group=shop-admins",
      "kubectl auth can-i get secrets -n prod --as=jane",
    ],
    "can-i yes with group shop-admins; no without the group.",
    "RBAC subjects include users, groups, and service accounts.",
    "cluster/rbac.html"
  ),
  task(
    D.C,
    "Helm: upgrade existing release cart-web in namespace shop setting service.type=ClusterIP and image.tag=1.27.0. Show helm history and current values.",
    [
      "helm -n shop upgrade cart-web bitnami/nginx --set service.type=ClusterIP --set image.tag=1.27.0",
      "helm -n shop history cart-web",
      "helm -n shop get values cart-web",
    ],
    "Release revised; values show ClusterIP and tag 1.27.0.",
    "Helm upgrade/history is day-2 cluster packaging work.",
    "cluster/helm-kustomize.html"
  ),
  task(
    D.C,
    "Compare control-plane node roles and taints with worker nodes. Add NoSchedule taint workload=reserved:NoSchedule to staging-w3 and show a toleration-capable Pod can still schedule there.",
    [
      "kubectl get nodes -o custom-columns=NAME:.metadata.name,ROLES:.metadata.labels.node-role\\.kubernetes\\.io/control-plane,TAINTS:.spec.taints",
      "kubectl taint nodes staging-w3 workload=reserved:NoSchedule",
      "kubectl -n staging apply -f {pod-with-toleration}",
      "kubectl -n staging get pod -o wide",
    ],
    "Control-plane taints visible; reserved Pod runs on staging-w3; untolerated Pods do not.",
    "Control-plane vs worker roles and taints are Cluster Architecture basics.",
    "cluster/control-plane-nodes.html"
  ),
  task(
    D.C,
    "List CSI drivers and storage-related DaemonSets/Deployments. Confirm at least one CSI Pod is Running and that a StorageClass references a known provisioner.",
    [
      "kubectl get csidrivers",
      "kubectl get pods -A | grep -i csi",
      "kubectl get sc -o custom-columns=NAME:.metadata.name,PROVISIONER:.provisioner",
    ],
    "CSI driver listed; CSI Pod Running; SC provisioner identified.",
    "CSI is the storage plugin plane parallel to CRI/CNI.",
    "cluster/cri-cni-csi.html"
  ),
  task(
    D.N,
    "In namespace shop, fix Service checkout whose targetPort does not match the container port. Confirm Endpoints and a successful curl from a client Pod.",
    [
      "kubectl -n shop get deploy checkout -o yaml | grep -A5 ports",
      "kubectl -n shop get svc checkout -o yaml",
      "kubectl -n shop patch svc checkout --type merge -p '{\"spec\":{\"ports\":[{\"port\":80,\"targetPort\":8080}]}}'",
      "kubectl -n shop run curl --rm -it --restart=Never --image=busybox:1.36 -- wget -qO- http://checkout:80/",
    ],
    "Endpoints healthy; wget/curl to checkout Service succeeds.",
    "Wrong targetPort yields Endpoints without working data path.",
    "networking/services-endpoints.html"
  ),
  task(
    D.N,
    "Create GatewayClass-backed HTTPRoute payments-route in namespace shop for PathPrefix /pay to Service payments:8080, attaching parent Gateway shop-gw.",
    [
      "kubectl -n shop apply -f {payments-httproute}",
      "kubectl -n shop get httproute payments-route -o yaml",
      "kubectl -n shop describe httproute payments-route",
    ],
    "HTTPRoute bound to shop-gw; backendRef payments:8080.",
    "Gateway API routes are preferred modern L7 config on CKA v1.35.",
    "networking/gateway-api.html"
  ),
  task(
    D.N,
    "Author NetworkPolicy db-allow in namespace shop selecting app=db, allowing Ingress TCP 5432 only from Pods app=api. Verify with a forbidden client and an allowed client (debug Pods).",
    [
      "kubectl -n shop apply -f {db-allow-np}",
      "kubectl -n shop run bad --rm -it --restart=Never --image=busybox:1.36 --labels=app=web -- wget -T2 -qO- http://db:5432 || true",
      "kubectl -n shop run good --rm -it --restart=Never --image=busybox:1.36 --labels=app=api -- nc -zv db 5432",
    ],
    "api-labeled client connects; other labels time out / fail.",
    "Always test NetworkPolicy with positive and negative clients.",
    "networking/network-policies.html"
  ),
  task(
    D.N,
    "CoreDNS ConfigMap has a broken forward plugin. Restore a working Corefile (kubernetes + forward to /etc/resolv.conf or lab upstream) and confirm cluster DNS lookups.",
    [
      "kubectl -n kube-system get cm coredns -o yaml",
      "kubectl -n kube-system edit cm coredns",
      "kubectl -n kube-system rollout restart deploy/coredns",
      "kubectl -n shop run dns --rm -it --restart=Never --image=busybox:1.36 -- nslookup kubernetes.default",
    ],
    "coredns Ready; kubernetes.default resolves.",
    "Corefile mistakes take down all Service DNS — high-yield networking fix.",
    "networking/coredns.html"
  ),
  task(
    D.W,
    "In namespace staging, create ConfigMap app-config with key MESSAGE=hello and Secret app-secret with key TOKEN=s3cr3t. Mount both into Deployment cfg-demo as envFrom / optional volume; confirm env inside the Pod.",
    [
      "kubectl -n staging create configmap app-config --from-literal=MESSAGE=hello",
      "kubectl -n staging create secret generic app-secret --from-literal=TOKEN=s3cr3t",
      "kubectl -n staging apply -f {cfg-demo-deploy}",
      "kubectl -n staging exec deploy/cfg-demo -- printenv MESSAGE TOKEN",
    ],
    "Pod prints hello and s3cr3t from ConfigMap/Secret.",
    "ConfigMaps and Secrets are core Workloads configuration tasks.",
    "workloads/configmaps-secrets.html"
  ),
  task(
    D.W,
    "Create Deployment scale-me in namespace staging with requests cpu=100m, then HPA scale-me-hpa CPU 50% min=1 max=5. Confirm HPA can see metrics (targets not unknown).",
    [
      "kubectl -n staging create deploy scale-me --image=nginx:1.27",
      "kubectl -n staging set resources deploy/scale-me --requests=cpu=100m",
      "kubectl -n staging autoscale deploy/scale-me --name=scale-me-hpa --cpu-percent=50 --min=1 --max=5",
      "kubectl -n staging get hpa scale-me-hpa",
    ],
    "HPA shows a numeric target (not unknown) once metrics-server works.",
    "HPA needs resource requests + metrics API to function.",
    "workloads/resources-hpa.html"
  ),
  task(
    D.S,
    "In namespace prod, create StorageClass retain-disk with reclaimPolicy Retain and WaitForFirstConsumer. Create PVC audit-logs 3Gi RWO using that class; confirm Pending until a consumer Pod mounts it, then Bound.",
    [
      "kubectl apply -f {retain-disk-sc}",
      "kubectl -n prod apply -f {audit-logs-pvc}",
      "kubectl -n prod get pvc audit-logs",
      "kubectl -n prod apply -f {consumer-pod}",
      "kubectl -n prod get pvc audit-logs",
    ],
    "PVC Pending before Pod; Bound after consumer scheduled (WaitForFirstConsumer).",
    "Binding mode changes when PVCs become Bound — classic StorageClass exam point.",
    "storage/storageclass.html"
  ),
  task(
    D.S,
    "Create PVC media-pvc in namespace prod for 4Gi ReadWriteOnce. Launch Pod media-writer that writes /data/ok.txt and a second Pod media-reader (after delete writer if RWO single-node) that reads the file.",
    [
      "kubectl -n prod apply -f {media-pvc}",
      "kubectl -n prod apply -f {media-writer}",
      "kubectl -n prod exec media-writer -- sh -c 'echo ok > /data/ok.txt'",
      "kubectl -n prod delete pod media-writer",
      "kubectl -n prod apply -f {media-reader}",
      "kubectl -n prod exec media-reader -- cat /data/ok.txt",
    ],
    "File persists across Pod recreate via PVC; content is ok.",
    "PVC durability across Pod lifetime is the point of PV/PVC.",
    "storage/pv-pvc.html"
  ),
];

const BANKS = [
  {
    num: 1,
    label: "CKA v1.35 · Mock 1",
    tasks: MOCK1,
    next: "mock-2.html",
    prevLabel: "Warm-up",
    prevHref: "warmup.html",
  },
  {
    num: 2,
    label: "CKA v1.35 · Mock 2",
    tasks: MOCK2,
    next: "mock-3.html",
    prevLabel: "Mock 1",
    prevHref: "mock-1.html",
  },
  {
    num: 3,
    label: "CKA v1.35 · Mock 3",
    tasks: MOCK3,
    next: "warmup.html",
    prevLabel: "Mock 2",
    prevHref: "mock-2.html",
  },
];

const EXPECTED = {
  Troubleshooting: 6,
  "Cluster Architecture": 4,
  "Services & Networking": 4,
  "Workloads & Scheduling": 2,
  Storage: 2,
};

const WEIGHT = {
  Troubleshooting: 30,
  "Cluster Architecture": 25,
  "Services & Networking": 20,
  "Workloads & Scheduling": 15,
  Storage: 10,
};

function validateBank(name, tasks) {
  const errors = [];
  if (tasks.length < 17 || tasks.length > 18) {
    errors.push(`${name}: expected 17–18 tasks, got ${tasks.length}`);
  }
  const counts = {};
  for (const t of tasks) {
    counts[t.domain] = (counts[t.domain] || 0) + 1;
    if (WEIGHT[t.domain] !== t.weight) {
      errors.push(`${name}: weight ${t.weight} != ${WEIGHT[t.domain]} for ${t.domain}`);
    }
    for (const key of ["stem", "verify", "why", "lesson"]) {
      if (!t[key] || typeof t[key] !== "string") errors.push(`${name}: missing ${key}`);
    }
    if (!Array.isArray(t.solutionSteps) || t.solutionSteps.length < 2) {
      errors.push(`${name}: solutionSteps too short`);
    }
    if (!t.lesson.startsWith("../../cka-guide/")) {
      errors.push(`${name}: lesson must start with ../../cka-guide/ (${t.lesson})`);
    }
    const abs = path.resolve(__dirname, "..", t.lesson);
    // lesson is relative to assembled page cka/mock-N.html → ../../cka-guide = repo root sibling
    const fromPage = path.resolve(__dirname, "..", "cka", t.lesson);
    if (!fs.existsSync(fromPage)) {
      errors.push(`${name}: lesson file missing: ${t.lesson} (resolved ${fromPage})`);
    }
    const blob = JSON.stringify(t);
    if (/<[A-Za-z_/]/.test(blob) || /&lt;[A-Za-z]/.test(blob)) {
      // allow HTML in applied YAML heredocs inside steps — but flag angle-bracket placeholders like <name>
      if (/<[a-zA-Z][a-zA-Z0-9_-]*>/.test(blob)) {
        errors.push(`${name}: use {name} placeholders, not <name> angle brackets`);
      }
    }
  }
  for (const [d, n] of Object.entries(EXPECTED)) {
    if ((counts[d] || 0) !== n) {
      errors.push(`${name}: ${d} count ${(counts[d] || 0)} != ${n}`);
    }
  }
  return errors;
}

function renderFragment(bank) {
  const json = {
    minutes: 120,
    label: bank.label,
    passHint: "Practice bar ≥66% on honest self-check after verify commands.",
    tasks: bank.tasks,
  };
  const pretty = JSON.stringify(json, null, 2);
  return `<section class="hero reveal">
  <span class="eyebrow">CKA · Mock ${bank.num}</span>
  <span class="domain-chip">120 min · ${bank.tasks.length} tasks · pass ≥66%</span>
  <h1>CKA Mock ${bank.num} · full exam.</h1>
  <p class="lead">Timed performance session on your lab cluster. Domain mix: Troubleshooting 6 · Cluster 4 · Networking 4 · Workloads 2 · Storage 2. Mark done only after verify passes.</p>
</section>

<section class="section reveal" id="instructions">
  <h2><span class="section-num">01</span> Instructions</h2>
  <ul>
    <li>Budget ~6–7 minutes per task; skip sinkholes and return.</li>
    <li>Use docs/patterns you would have on exam day (kubernetes.io).</li>
    <li>Prefer <code>--dry-run=client -o yaml</code> scaffolds; confirm with get/describe.</li>
    <li>Remediate weak domains in <a href="../../cka-guide/index.html">cka-guide</a>.</li>
  </ul>
  <div class="callout warn"><div class="co-body"><div class="co-title">Honesty</div><p>Self-check score only counts if verify commands actually passed on a cluster.</p></div></div>
</section>

<section class="section reveal in" id="mock">
  <h2><span class="section-num">02</span> Mock session</h2>
  <div data-task-mock>
  <script type="application/json" id="mockBank">
${pretty}
  </script>
  </div>
</section>

<section class="section reveal" id="check">
  <h2><span class="section-num">03</span> Afterward</h2>
  <p>Review solutions, then <a href="${bank.next}">next mock</a> or revisit <a href="${bank.prevHref}">${bank.prevLabel}</a>. Scoring notes: <a href="../reference/scoring.html">reference</a>.</p>
</section>
`;
}

function main() {
  const allErrors = [];
  for (const bank of BANKS) {
    const errs = validateBank(`Mock ${bank.num}`, bank.tasks);
    allErrors.push(...errs);
  }
  if (allErrors.length) {
    console.error("Validation failed:");
    allErrors.forEach((e) => console.error("  -", e));
    process.exit(1);
  }

  for (const bank of BANKS) {
    const out = path.join(OUT_DIR, `cka-mock-${bank.num}.html`);
    fs.writeFileSync(out, renderFragment(bank));
    console.log(`Wrote ${path.relative(process.cwd(), out)} (${bank.tasks.length} tasks)`);
  }

  // Re-parse written JSON to ensure fragments stay valid
  for (const bank of BANKS) {
    const html = fs.readFileSync(path.join(OUT_DIR, `cka-mock-${bank.num}.html`), "utf8");
    if (!html.includes('data-task-mock')) throw new Error("missing data-task-mock");
    const m = html.match(/<script type="application\/json" id="mockBank">([\s\S]*?)<\/script>/);
    if (!m) throw new Error("missing mockBank");
    const parsed = JSON.parse(m[1]);
    if (parsed.minutes !== 120) throw new Error("minutes != 120");
    if (parsed.tasks.length !== 18) throw new Error("tasks != 18");
  }
  console.log("OK · 3 banks · 18 tasks each · domain mix validated · JSON parseable");
}

main();
