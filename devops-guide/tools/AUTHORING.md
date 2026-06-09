# DevOps Field Guide — Authoring Spec (read fully before writing)

You author **content fragments** for a static, offline HTML learning guide. The generator (`tools/gen.js`) wraps your fragment in the shared shell and **auto-generates** the right-rail TOC, the prev/next page-nav, and the "Mark as learned" button. You therefore write **ONLY the `<section>`s** — nothing else.

**Write each fragment to:** `tools/content/<data-page>.html`, where `<data-page>` = folder path with `/`→`-`, plus the slug. Examples: `cicd/continuous-integration` → `cicd-continuous-integration.html`; `kubernetes/core-objects` → `kubernetes-core-objects.html`; `interview/question-bank` → `interview-question-bank.html`; `reference/glossary` → `reference-glossary.html`.

---

## 0. Audience, voice, prime directive

A software engineer with ~3–4 years' experience prepping for **DevOps engineer interviews (June 2026)**. They mostly use **AWS**. A **visual learner** who wants **sharp, crisp** info — NOT comprehensive. Both **technical AND layman**, with **multiple examples**. This guide is **diagrams-first / minimal code**.

- **SHARP AND CRISP.** Short paragraphs (2–3 sentences, ≤ ~60 words). Overflow → a `.kv`, table, list, `.versus`, or a visual — never a longer paragraph.
- **Analogy-first, then technical.** Exactly **one** `.callout analogy` per page, near the top, in plain layman terms ("In plain English…"). Then the precise technical version.
- **Diagrams-first.** Each concept page has its assigned engine **or** a `.diagram`/`.flow`/`.steps`/`.versus`/`.table-wrap`. Prefer showing over telling. Keep **code/config tiny** — domain-native (YAML, Dockerfile, HCL, Bash, JSON, Python), ≤ ~14 lines, one teaching point each.
- **AWS-first.** When a concept maps to a concrete cloud service, use the **AWS** name (EC2, ASG, ALB, VPC, IAM, S3, EKS, ECS/Fargate, Lambda, RDS, Secrets Manager, KMS, CloudFormation/CDK). Where it genuinely aids transfer, add a one-line "GCP/Azure equivalent" — don't overdo it.
- **Multiple examples.** 2–3 short examples per key concept.
- **Interview-ready.** Every concept page ends with a `#interview` section: a `.qa-set` of 2–3 `details.qa`, each with a **"Say it out loud"** spoken version + difficulty chip.
- **Skip what they know:** assume working fluency with programming. Teach the DevOps mental models, the AWS specifics, and the trade-offs interviewers probe.

**Per concept page, REQUIRED:** one analogy callout, one primary visual, **≥1** `.callout gotcha`, **≥1** `.quiz`, **2–3** inline Q&A with "say it out loud". Keep each page to **4–6 `<section>`s**.

---

## 1. Fragment skeleton (this is the WHOLE file you write)

```html
<section class="hero reveal">
  <span class="eyebrow">MODULE · topic</span>
  <h1>Page title.</h1>
  <p class="lead">1–3 sentences: what this is and why a pro DevOps engineer cares.</p>
</section>

<section class="section reveal" id="idea">
  <h2><span class="section-num">01</span> The idea</h2>
  <p class="takeaway">One-line essence with <b>bolded</b> key terms.</p>
  <p>2–3 sentence technical-but-plain explanation.</p>
  <div class="callout analogy">… In plain English …</div>
  <!-- primary visual: an engine figure OR a .diagram/.flow -->
  <dl class="kv">…</dl>
</section>

<section class="section reveal" id="...">
  <h2><span class="section-num">02</span> …</h2>
  … 1 point + small example; add .versus / .steps / .callout gotcha / .quiz …
</section>

<!-- total 4–6 sections; the LAST is always: -->
<section class="section reveal" id="interview">
  <h2><span class="section-num">0N</span> Interview rapid-fire</h2>
  <div class="qa-set"> … 2–3 details.qa … </div>
</section>
```

**Hard rules**
- Do **NOT** write `<head>`, sidebar, topbar, footer, `<script>`, the `<div class="content">`/`<div class="prose">` wrappers, the right-rail `.toc`, the `.page-nav`, or the `.lesson-complete` button. The generator adds all of these.
- The **hero** section has **no `id`** (so it's excluded from the auto-TOC).
- Every other `<section>` **must have a unique `id`** (kebab-case). Aim for ≥3 id'd sections so the page gets a TOC.
- The last section's `id` is **`interview`**.
- **ESCAPE `<` → `&lt;` and `>` → `&gt;` inside ANY `<code>`** (incl. YAML `<`, shell redirects, `&&`, generics). The verifier rejects a raw `<` in code.

---

## 2. Component library (copy these exactly)

**Callouts** — variants `analogy` (lightbulb), `gotcha` (warning), `tip` (check), `note` (info):
```html
<div class="callout analogy"><span class="co-ic"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18h6M10 22h4M12 2a7 7 0 0 0-4 12.7c.6.5 1 1.3 1 2.1h6c0-.8.4-1.6 1-2.1A7 7 0 0 0 12 2Z"/></svg></span><div class="co-body"><div class="co-title">In plain English <span class="tag">analogy</span></div><p>…</p></div></div>
```
- gotcha icon path: `<path d="M10.3 3.6 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.6a2 2 0 0 0-3.4 0Z"/><path d="M12 9v4M12 17h.01"/>` · title "Common trap" + `<span class="tag">gotcha</span>`
- tip icon path: `<path d="M22 11.1V12a10 10 0 1 1-5.9-9.1"/><path d="M22 4 12 14.01l-3-3"/>` · title "Pro tip"
- note icon path: `<circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/>` · title "Heads up"

**Key-value list:** `<dl class="kv"><dt>Term</dt><dd>Definition with <code>inline code</code>.</dd> …</dl>`

**Code block** (always set `data-lang`; ESCAPE `<`/`>`):
```html
<div class="codeblock">
  <div class="code-head"><div class="code-dots"><i></i><i></i><i></i></div><span class="code-file">Dockerfile</span><button class="code-copy"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15V5a2 2 0 0 1 2-2h10"/></svg><span class="clabel">Copy</span></button></div>
  <pre><code data-lang="dockerfile">FROM python:3.12-slim
COPY . /app
CMD ["python", "app.py"]</code></pre>
</div>
```
`data-lang` ∈ `bash` · `yaml` · `dockerfile` · `hcl` (Terraform) · `json` · `python` · `text`. Keep snippets ≤ ~14 lines.

**Good-vs-bad two-up:**
```html
<div class="versus">
  <div class="vs-col vs-bad"><div class="vs-h">Anti-pattern</div> … </div>
  <div class="vs-col vs-good"><div class="vs-h">Better</div> … </div>
</div>
```
(Each side can hold a `.codeblock`, a `<p>`, or a `<ul>`.)

**Quiz** (mark the correct option `data-correct="true"`):
```html
<div class="quiz" data-quiz>
  <p class="q">Question?</p>
  <div class="quiz-opts">
    <button class="quiz-opt" data-correct="true"><span class="mark"></span>Right answer.</button>
    <button class="quiz-opt"><span class="mark"></span>Distractor.</button>
  </div>
  <div class="quiz-explain"><b>Right.</b> Why.</div>
</div>
```

**Interview Q&A** (difficulty chip = `diff-warm` | `diff-core` | `diff-stretch`):
```html
<div class="qa-set">
  <details class="qa">
    <summary><svg class="chev" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m9 6 6 6-6 6"/></svg><span class="qa-q">Question?</span><span class="pm-chip diff-core">core</span></summary>
    <div class="qa-body">
      <h5>Model answer</h5>
      <p>Precise 2–4 sentence answer.</p>
      <div class="callout tip qa-say"><span class="co-ic"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.1V12a10 10 0 1 1-5.9-9.1"/><path d="M22 4 12 14.01l-3-3"/></svg></span><div class="co-body"><div class="co-title">Say it out loud <span class="tag">say it</span></div><p>"Conversational 1–2 sentence spoken version."</p></div></div>
      <div class="qa-followups"><h5>Follow-ups to expect</h5><ul><li>…</li></ul></div> <!-- optional -->
    </div>
  </details>
</div>
```

**Steps:** `<div class="steps"><div class="step"><span class="step-num">1</span><div class="step-body"><h4>Title</h4><p>What happens.</p></div></div> …</div>`

**Flow of boxes** (great for pipelines/lifecycles where no engine is assigned):
```html
<div class="diagram"><div class="dg-title">Title</div>
  <div class="flow">
    <div class="flow-node"><div class="fn-k">stage</div><div class="fn-t">Build</div><div class="fn-d">detail</div></div>
    <div class="flow-arrow"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg></div>
    <div class="flow-node">…</div>
  </div>
  <div class="cap">Caption.</div>
</div>
```

**Comparison table:** `<div class="table-wrap"><table><thead><tr><th>…</th></tr></thead><tbody><tr><td>…</td></tr></tbody></table></div>`

**Cards grid** (link lists): `<div class="grid grid-2"><a class="card feature" href="page.html"><div class="f-ic"><svg …></svg></div><h4>Title</h4><p>One line.</p></a> …</div>` — links are **relative to your page's folder** (siblings: `href="slug.html"`).

**Go-deeper (optional, ≤1 per page):** `<details class="deeper"><summary><svg class="chev" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m9 6 6 6-6 6"/></svg> Title <span class="tag">optional</span></summary><div class="deeper-body"><p>…</p></div></details>`

**Labelled command/endpoint:** `<div class="endpoint"><span class="verb get">GET</span><span class="path">/healthz</span><span class="ep-note">liveness probe</span></div>` (verb classes: `get`/`post`/`put`/`del`).

**Cheat-sheet block** (interview/cheat-sheet only): `<div class="sheet-grid"><div class="sheet"><h3>kubectl</h3> …tables/kv… </div> …</div>`
**Glossary** (reference/glossary only): `<dl class="glossary"><dt>Term</dt><dd>Definition.</dd> …</dl>` (A–Z).
**Flashcards** (interview/flashcards only): `<div class="flashdeck" data-deck="devops"><div class="fd-controls"><span class="fd-progress"><b>0</b>/<span class="fd-total">0</span> known</span><span class="spacer"></span><button class="fd-btn fd-shuffle">Shuffle</button><button class="fd-btn fd-reset">Reset</button></div><ul class="fd-cards"><li class="flashcard" tabindex="0"><div class="fc-inner"><div class="fc-face fc-front"><p>Front question</p></div><div class="fc-face fc-back"><p>Back answer</p><div class="fc-mark"><button class="fc-known">Known</button><button class="fc-unknown">Review</button></div></div></div></li> … </ul></div>` (both faces live in the DOM).

---

## 3. Visualizer engines — use ONLY the one assigned to your page

Engines are auto-loaded ONLY on pages whose manifest lists them, so **do not** add an engine to a page it isn't assigned to (the verifier flags it). Everywhere else, use `.diagram`/`.flow`/`.steps`/`.versus`/`.table-wrap`. Inline JSON **must be valid** (double-quoted keys/strings, no trailing commas) — the verifier parses it. Always include a `<p class="viz-fallback">` plain-text summary.

### reqflow — `class="reqflow" data-reqflow` · config class `rf-config`
Animated topology: nodes on a col/row grid; a packet walks edges with a caption at each hop. Perfect for **CI/CD pipelines, a request through a VPC/load balancer, K8s request routing, the GitOps reconcile loop**.
```html
<figure class="reqflow" data-reqflow>
  <figcaption class="rf-title">CI pipeline: commit → deploy</figcaption>
  <div class="rf-stage"></div>
  <div class="rf-caption" aria-live="polite"></div>
  <div class="rf-controls">
    <button class="rf-btn rf-reset" type="button" aria-label="Restart">⏮</button>
    <button class="rf-btn rf-prev" type="button" aria-label="Previous step">‹</button>
    <button class="rf-btn rf-play" type="button" aria-label="Play">▶</button>
    <button class="rf-btn rf-next" type="button" aria-label="Next step">›</button>
    <div class="rf-progress"><div class="rf-progress-fill"></div></div>
    <span class="rf-step">1 / 1</span>
    <select class="rf-speed-sel" aria-label="Speed"><option value="1700">0.5×</option><option value="1100" selected>1×</option><option value="600">2×</option></select>
  </div>
  <script type="application/json" class="rf-config">
  { "title": "Push to prod",
    "nodes": [
      { "id": "dev", "label": "git push", "type": "source", "col": 0, "row": 1 },
      { "id": "ci",  "label": "CI runner", "type": "build", "col": 1, "row": 1 },
      { "id": "reg", "label": "Registry", "type": "artifact", "col": 2, "row": 0 },
      { "id": "cd",  "label": "Deploy",   "type": "release", "col": 2, "row": 2 }
    ],
    "edges": [
      { "from": "dev", "to": "ci", "label": "webhook" },
      { "from": "ci", "to": "reg", "label": "push image" },
      { "from": "ci", "to": "cd", "label": "promote" }
    ],
    "steps": [
      { "node": "dev", "caption": "A commit lands on main." },
      { "edge": ["dev","ci"], "caption": "A webhook triggers the CI runner." , "latency": "build + test" },
      { "edge": ["ci","reg"], "caption": "Tests pass → build a versioned image, push to the registry." },
      { "edge": ["ci","cd"], "caption": "The pipeline promotes that exact image to the deploy stage.", "status": "hit" }
    ] }
  </script>
  <p class="viz-fallback">A commit triggers CI, which builds + tests, pushes an image to the registry, then promotes it to deploy.</p>
</figure>
```
- `node.type` is a short free-text tag shown above the label. `step.status` ∈ `hit` (green) | `miss` (red) tints the target node. `step.latency` is an optional suffix on the caption.
- Assigned to: `foundations/lifecycle-and-toolchain`, `linux-networking/networking-for-devops`, `cicd/continuous-integration`, `cicd/continuous-delivery`, `kubernetes/k8s-mental-model`, `kubernetes/core-objects`, `aws/compute-and-networking`, `delivery/gitops-progressive-delivery`, `interview/scenarios`.

### tradeoff — `class="tradeoff" data-tradeoff` · config class `tr-config`
Segmented slider between competing options; each pick animates dimension bars (0–100) + a "best for" note. Use for **VM vs container vs serverless, monolith vs microservices, push vs pull GitOps, mutable vs immutable infra**.
```html
<div class="tradeoff" data-tradeoff>
  <script type="application/json" class="tr-config">
  { "title": "Where do you run it?",
    "axisLabel": "Compute model trade-offs",
    "stops": [
      { "label": "VM (EC2)", "dims": { "Control": 95, "Ops burden": 80, "Cold start": 90, "Cost at idle": 35 }, "note": "Full control of the OS; you patch and scale it. Best for stateful or legacy workloads." },
      { "label": "Container (ECS/EKS)", "dims": { "Control": 70, "Ops burden": 55, "Cold start": 80, "Cost at idle": 50 }, "note": "Portable, dense, fast to roll. The default for most services in 2026." },
      { "label": "Serverless (Lambda)", "dims": { "Control": 35, "Ops burden": 20, "Cold start": 45, "Cost at idle": 95 }, "note": "No servers to manage; pay per request. Best for spiky or event-driven work; watch cold starts." }
    ] }
  </script>
</div>
```
Dimension names come from the FIRST stop (keep them identical across stops). Assigned to: `foundations/dora-and-delivery-metrics`, `containers/running-containers`, `delivery/gitops-progressive-delivery`.

### calc — `class="calc" data-calc` · config class `calc-config`
Live back-of-the-envelope sizing. Fixed model (DAU → QPS, storage, app servers). Use on **aws/compute-and-networking** for "how many instances / how much storage."
```html
<div class="calc" data-calc>
  <script type="application/json" class="calc-config">
  { "title": "Sizing a web tier",
    "preset": "Web app",
    "presets": [
      { "label": "Web app", "values": { "dau": 2000000, "writesPerUser": 5, "readWrite": 20, "bytesPerItem": 2000, "retentionYears": 2, "replication": 3, "perServerQps": 800 } }
    ],
    "outputs": ["writeQps","readQps","peakQps","storageTotal","servers"] }
  </script>
</div>
```
Input keys: `dau, writesPerUser, readWrite, bytesPerItem, retentionYears, replication, peakFactor, perServerQps`. Outputs: `writeQps, readQps, peakQps, storageDay, storageTotal, bandwidthOut, bandwidthIn, servers`.

### deploy-viz — `class="deployviz" data-deployviz` · config class `dv-config`
Release-strategy player: pods flip old→new while a traffic bar tracks the split. Use on **delivery/release-strategies** (and optionally `interview/scenarios`).
```html
<div class="deployviz" data-deployviz>
  <script type="application/json" class="dv-config">
  { "title": "Four ways to ship v2",
    "strategies": [
      { "name": "Recreate", "frames": [
        { "pods": ["old","old","old","old"], "traffic": 0, "status": "ok", "caption": "v1: 4 pods, 100% of traffic." },
        { "pods": ["down","down","down","down"], "traffic": 0, "status": "down", "caption": "Stop all v1 — full downtime while v2 starts." },
        { "pods": ["new","new","new","new"], "traffic": 100, "status": "ok", "caption": "v2 up; traffic restored. Simple, but users saw an outage." }
      ] },
      { "name": "Rolling", "frames": [
        { "pods": ["old","old","old","old"], "traffic": 0, "status": "ok", "caption": "Start on v1." },
        { "pods": ["new","old","old","old"], "traffic": 25, "status": "ok", "caption": "Replace one pod at a time; 25% on v2. No downtime." },
        { "pods": ["new","new","new","new"], "traffic": 100, "status": "ok", "caption": "All pods on v2. Rollback = roll the other way (slow)." }
      ] },
      { "name": "Canary", "frames": [
        { "pods": ["old","old","old","old"], "traffic": 0, "status": "ok", "caption": "All v1." },
        { "pods": ["canary","old","old","old"], "traffic": 5, "status": "risk", "caption": "Send 5% to one v2 canary; watch error rate + latency." },
        { "pods": ["new","new","old","old"], "traffic": 50, "status": "ok", "caption": "Healthy → widen to 50%." },
        { "pods": ["new","new","new","new"], "traffic": 100, "status": "ok", "caption": "Full rollout. Bad canary? Cut traffic instantly — blast radius was 5%." }
      ] }
    ] }
  </script>
  <p class="viz-fallback">Recreate has downtime; rolling swaps pods gradually; canary sends a small % to v2 first and widens only if healthy.</p>
</div>
```
`pod` ∈ `old` | `new` | `canary` | `down`. `traffic` = % to the NEW version. `status` ∈ `ok` | `risk` | `down` (tints caption).

---

## 4. Version facts — June 2026 (state versions naturally; don't date-stamp every line)

- **Kubernetes** is on the **1.3x** line (≈ 1.36 mid-2026; 3 releases/year). Runtime is **containerd** (dockershim long removed). **Pod Security Admission** replaced PodSecurityPolicies (gone since 1.25). **Gateway API** is the modern, role-oriented successor to Ingress (GA). **Native sidecar containers** are stable. **In-place pod resize** has graduated. Managed control planes dominate: **EKS** (AWS), GKE, AKS.
- **Docker / OCI:** images are **OCI** artifacts; **BuildKit** is the default builder (multi-stage, cache mounts). **Docker Compose v2** (`docker compose`). Prefer small bases (**distroless**, `-slim`, Alpine) and **non-root** users. Registries: **ECR**, GHCR, Docker Hub.
- **CI/CD:** **GitHub Actions** is the common default (matrix, reusable workflows, OIDC to assume an AWS role with **no long-lived keys**). GitLab CI, Jenkins, CircleCI also appear. AWS-native: **CodePipeline / CodeBuild / CodeDeploy**.
- **IaC:** **Terraform** (HashiCorp, BSL-licensed since 2023; IBM acquired HashiCorp, closed 2025) and its open-source fork **OpenTofu** (Linux Foundation, MPL) — interviews ask about the license split. **AWS CloudFormation** + **CDK** (define infra in Python/TypeScript). Config mgmt: **Ansible** (agentless).
- **GitOps / progressive delivery:** **Argo CD** and **Flux** (both CNCF-graduated) reconcile a Git repo → cluster. **Argo Rollouts** / **Flagger** automate canary + blue-green with metric analysis. Pull-based: the cluster syncs itself; Git is the source of truth.
- **AWS building blocks:** EC2 + **Auto Scaling Groups**, **ALB/NLB**, **VPC** (subnets, route tables, IGW/NAT, **security groups** = stateful, **NACLs** = stateless). Containers: **ECS/Fargate**, **EKS**, **ECR**. Serverless: **Lambda**, **API Gateway**, EventBridge, SQS/SNS. Identity/data: **IAM** (roles + least-privilege; **IAM roles for service accounts / Pod Identity** on EKS; **instance roles**), **S3**, **RDS/Aurora**, **EBS**, **Secrets Manager** + **SSM Parameter Store**, **KMS**. **Graviton** (ARM) for price/perf.
- **DevSecOps / supply chain:** shift-left scanning (**Trivy**, Grype, `npm/pip audit`), **SBOM** (SPDX / CycloneDX), artifact signing (**Sigstore / cosign**), provenance (**SLSA**), secrets via **Vault** / AWS Secrets Manager / OIDC. Least privilege everywhere.
- **Reliability culture:** **DORA** four keys (deploy frequency, lead time for changes, change-fail rate, failed-deployment recovery time / MTTR) + reliability; **Elite→Low** performers. **Blameless postmortems**, **error budgets**, **runbooks**, **incident command (IC)**. **Platform engineering** & internal developer platforms (**Backstage**) and "you build it, you run it" are the 2026 trend.
- **Service mesh (light mention):** **Istio** (ambient / sidecar-less mode GA) and **Linkerd** for mTLS, traffic shifting, retries. **eBPF** (Cilium) for fast networking/policy.

---

## 5. Observability boundary — HARD RULE

There is a **separate Observability guide**. Do **NOT** teach: logs/metrics/traces internals, OpenTelemetry, Prometheus/PromQL, Grafana, Loki/Tempo/Jaeger, SLI/SLO math, error-budget burn-rate alerting, sampling, or cardinality. Where DevOps legitimately touches monitoring (incident response, deploy health checks, alerting philosophy, golden signals by name), stay on the **process / human / safety** side and add a cross-link:

```html
<div class="callout note"><span class="co-ic"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/></svg></span><div class="co-body"><div class="co-title">Heads up <span class="tag">scope</span></div><p>The telemetry behind this — metrics, traces, dashboards, SLO burn-rate alerts — lives in the companion <strong>Observability guide</strong>. Here we cover the DevOps side: pipelines, infra, deploys, and the human process.</p></div></div>
```

---

## 6. Crispness guardrails (hard limits)
- Lead idea per concept: **2–3 sentences (≤60 words)**. Overflow → list/table/kv/visual.
- **4–6 sections** per concept page. One analogy, one primary visual, ≥1 gotcha, ≥1 quiz, 2–3 inline Q&A with "say it out loud".
- Code/config: **one point each, ≤ ~14 lines**, escaped, copyable, static, domain-native.
- No full manifests/modules/exhaustive flag tables. Teach the model + the trade-off.
- Use ONLY the documented components + your page's assigned engine. Always include `.viz-fallback` inside engine figures.

When done, return a short list of the files you created.
