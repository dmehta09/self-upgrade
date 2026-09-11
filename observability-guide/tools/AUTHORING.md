# Observability Field Guide — Authoring Spec (read fully before writing)

You author **content fragments** for a static, offline HTML learning guide. The generator (`tools/gen.js`) wraps your fragment in the shared shell and **auto-generates** the right-rail TOC, the prev/next page-nav, and the "Mark as learned" button. You therefore write **ONLY the `<section>`s** — nothing else.

**Reference exemplar (study its quality + rhythm):** `/Users/arvasit/Desktop/self-upgrade/frontend-guide/tools/content/react-render-and-rerender.html` (note: that project hand-wrote its TOC/nav — *we do not*; ignore its trailing `.toc`/`.page-nav`/`.lesson-complete`).

**Write each fragment to:** `tools/content/<data-page>.html`, where `<data-page>` = folder path with `/`→`-`, plus the slug. Examples: `foundations/cardinality` → `foundations-cardinality.html`; `traces/spans-and-context` → `traces-spans-and-context.html`; `interview/scenarios/latency-spike` → `interview-scenarios-latency-spike.html`; `reference/glossary` → `reference-glossary.html`.

---

## 0. Audience, voice, prime directive

A software engineer with ~4 years' experience prepping for interviews (June 2026). A **visual learner** who wants **sharp, crisp** info — NOT comprehensive. Both **technical AND layman**, with **multiple examples**. This guide is **diagrams-first / minimal code**.

- **SHARP AND CRISP.** Short paragraphs (2–3 sentences, ≤ ~60 words). Overflow → a `.kv`, table, list, `.versus`, or a visual — never a longer paragraph.
- **Analogy-first, then technical.** Exactly **one** `.callout analogy` per page, near the top, in plain layman terms. Then the precise version.
- **Diagrams-first.** Each concept page has its assigned engine **or** a `.diagram`/`.flow`/`.steps`/`.versus`/`.table-wrap`. Prefer showing over telling. Keep **code/config tiny** (Python by default; YAML/PromQL only when it teaches something), ≤ ~14 lines.
- **Multiple examples.** 2–3 short examples per key concept.
- **Interview-ready.** Every concept page ends with a `#interview` section: a `.qa-set` of 2–3 `details.qa`, each with a **"Say it out loud"** spoken version.
- **Skip what they know:** no generic "what is a server" tutorials. Assume working fluency; teach the observability mental models + trade-offs interviewers probe.

**Per concept page, REQUIRED:** one analogy callout, one primary visual, **≥1** `.callout gotcha`, **≥1** `.quiz`, **2–3** inline Q&A with "say it out loud". Keep each page to **4–6 `<section>`s**.

---

## 1. Fragment skeleton (this is the WHOLE file you write)

```html
<section class="hero reveal">
  <span class="eyebrow">MODULE · topic</span>
  <h1>Page title.</h1>
  <p class="lead">1–3 sentences: what this is and why a pro cares.</p>
</section>

<section class="section reveal" id="idea">
  <h2><span class="section-num">01</span> The idea</h2>
  <p class="takeaway">One-line essence with <b>bolded</b> key terms.</p>
  <p>2–3 sentence technical-but-plain explanation.</p>
  <div class="callout analogy">…</div>
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
- Every other `<section>` **must have a unique `id`** (kebab-case). The TOC + per-section search records are built from `<section id> + <h2>`. Aim for ≥3 id'd sections so the page gets a TOC.
- The last section's `id` is **`interview`**.

**Module index pages** (`<module>/index.html`, i.e. data-page `<module>-index`): a `hero` + ONE short section (`id="map"`) containing a 1–2 sentence "what's here / reading order" and a `.grid.grid-2` of `.card.feature` links to the module's pages. ~1 screen. (No TOC is generated for `index` pages.)

---

## 2. Component library (copy these exactly)

**Callouts** — variants `analogy` (lightbulb), `gotcha` (warning), `tip` (check), `note` (info):
```html
<div class="callout analogy"><span class="co-ic"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18h6M10 22h4M12 2a7 7 0 0 0-4 12.7c.6.5 1 1.3 1 2.1h6c0-.8.4-1.6 1-2.1A7 7 0 0 0 12 2Z"/></svg></span><div class="co-body"><div class="co-title">In plain English <span class="tag">analogy</span></div><p>…</p></div></div>
```
- gotcha icon path: `<path d="M10.3 3.6 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.6a2 2 0 0 0-3.4 0Z"/><path d="M12 9v4M12 17h.01"/>` · title e.g. "Common trap" + `<span class="tag">gotcha</span>`
- tip icon path: `<path d="M22 11.1V12a10 10 0 1 1-5.9-9.1"/><path d="M22 4 12 14.01l-3-3"/>` · title "Pro tip"
- note icon path: `<circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/>` · title "Heads up"

**Key-value list:** `<dl class="kv"><dt>Term</dt><dd>Definition with <code>inline code</code>.</dd> …</dl>`

**Code block** (always set `data-lang`; **ESCAPE `<`→`&lt;` and `>`→`&gt;` inside ANY `<code>`** — incl. PromQL `<`/`>` and YAML — the verifier rejects a raw `<` in code):
```html
<div class="codeblock">
  <div class="code-head"><div class="code-dots"><i></i><i></i><i></i></div><span class="code-file">app.py</span><button class="code-copy"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15V5a2 2 0 0 1 2-2h10"/></svg><span class="clabel">Copy</span></button></div>
  <pre><code data-lang="python">logger.info("order placed", extra={"order_id": oid})</code></pre>
</div>
```
`data-lang`: `python` (default), `bash`, `json`, `yaml`, `promql`, `text`. Keep snippets ≤ ~14 lines, one point each.

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
    <div class="flow-node"><div class="fn-k">step</div><div class="fn-t">Name</div><div class="fn-d">detail</div></div>
    <div class="flow-arrow"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg></div>
    <div class="flow-node">…</div>
  </div>
  <div class="cap">Caption.</div>
</div>
```

**Comparison table:** `<div class="table-wrap"><table><thead><tr><th>…</th></tr></thead><tbody><tr><td>…</td></tr></tbody></table></div>`

**Cards grid** (module index + link lists): `<div class="grid grid-2"><a class="card feature" href="page.html"><div class="f-ic"><svg …></svg></div><h4>Title</h4><p>One line.</p></a> …</div>` — links are **relative to your page's folder** (siblings: `href="slug.html"`).

**Go-deeper (optional, ≤1 per page):** `<details class="deeper"><summary><svg class="chev" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m9 6 6 6-6 6"/></svg> Title <span class="tag">optional</span></summary><div class="deeper-body"><p>…</p></div></details>`

**Cheat-sheet block** (interview/cheatsheet only): use `<div class="sheet"> … </div>` with `<div class="sheet-card"><h4>…</h4> …</div>` inside (one screen of recap cards).
**Glossary** (reference/glossary only): `<dl class="glossary"><dt>Term</dt><dd>Definition.</dd> …</dl>` (A–Z).
**Flashcards** (interview/flashcards only): `<div class="flashdeck" data-deck="obs"><div class="fd-head">…shuffle/reset/progress…</div><div class="fd-cards"> <div class="flashcard" tabindex="0"><div class="fc-inner"><div class="fc-face fc-front"><p>Front</p></div><div class="fc-face fc-back"><p>Back</p><div class="fc-mark"><button class="fc-known">Known</button><button class="fc-unknown">Review</button></div></div></div></div> … </div></div>` (study the frontend `interview-flashcards.html` for exact markup; both faces live in the DOM).

---

## 3. Visualizer engines — use ONLY the one assigned to your page

Embed as a `<figure>` + inline JSON. The engine's `<script>` is auto-loaded ONLY on pages whose manifest lists it, so **do not** add an engine to a page it isn't assigned to (the verifier will flag it). Everywhere else, use `.diagram`/`.flow`/`.steps`/`.versus`/`.table-wrap`. **Always include a `<p class="viz-fallback">` plain-text summary.** Inline JSON **must be valid** (double-quoted keys/strings, no trailing commas) — the verifier parses it.

### trace-waterfall — `class="viz tracewf" data-tracewf`, config class `twf-config`
Distributed-trace span waterfall: nesting via `depth`, color via `kind`, critical path via `"critical":true`.
```html
<figure class="viz tracewf" data-tracewf>
  <figcaption class="viz-title">trace</figcaption>
  <script type="application/json" class="twf-config">
  { "title":"POST /checkout — 300 ms end-to-end", "scaleMs":300, "legend":true,
    "caption":"The DB write dominates — it's on the critical path.",
    "spans":[
      {"service":"gateway","name":"POST /checkout","t":[0,300],"kind":"server","depth":0,"critical":true},
      {"service":"orders","name":"createOrder","t":[15,210],"kind":"http","depth":1,"critical":true},
      {"service":"postgres","name":"INSERT orders","t":[40,180],"kind":"db","depth":2,"critical":true},
      {"service":"redis","name":"GET cart","t":[18,35],"kind":"cache","depth":1},
      {"service":"payments","name":"charge card","t":[215,295],"kind":"http","depth":1}
    ] }
  </script>
  <p class="viz-fallback">A trace of POST /checkout: the gateway span contains createOrder → INSERT (the critical path) plus a cache read and a payment call.</p>
</figure>
```
`kind` ∈ `server|client|http|db|cache|queue|compute|error`. `t:[startMs,endMs]`. Pages: `traces/spans-and-context`, `traces/critical-path`, `interview/scenarios/latency-spike`.

### series-lab — `class="viz serieslab" data-serieslab`, config class `sl-config`
Three self-contained modes:
- `{ "mode":"types" }` — counter/gauge/histogram shapes. Page: `metrics/metric-types`.
- `{ "mode":"cardinality", "metric":"http_requests_total", "labels":[{"name":"endpoint","values":20,"max":80},{"name":"status","values":5,"max":12},{"name":"region","values":4,"max":12},{"name":"user_id","values":1,"max":100000}] }` — sliders → total series = product. Page: `foundations/cardinality` (labels optional — omit for sensible defaults).
- `{ "mode":"histogram" }` — latency buckets + a tail-weight slider; recomputes p50/p95/p99. Page: `metrics/histograms-percentiles`.

### budget-burn — `class="viz budgetburn" data-budgetburn`, config class `bb-config`
- `{ "mode":"burndown", "slo":99.9 }` — error rate slider → 30-day budget burndown + days-to-exhaustion. Page: `slo/error-budgets`.
- `{ "mode":"burnrate", "slo":99.9 }` — error rate slider → burn-rate multiple + which alert tier fires. Pages: `slo/alerting-on-slos`, `interview/scenarios/error-surge`.

### sampling-viz — `class="viz samplingviz" data-samplingviz`, config class `sv-config`
`{ "defaults":{"strategy":"tail","rate":0.1} }` — strategy (head/tail/error/off) + rate → which traces are kept vs dropped + % errors/slow kept. Page: `traces/sampling`.

### query-explorer — `class="viz queryexp" data-queryexp`, config class `qe-config`
`{}` uses a built-in PromQL essentials deck; or pass `{ "queries":[ {"q":"rate(http_requests_total[5m])","explain":"…","result":"series","preview":[5,6,8,7,9]} ] }`. Page: `promstack/promql`.

---

## 4. Version facts — June 2026 (use these; state versions naturally, don't date-stamp every line)

- **OpenTelemetry (OTel)** is the vendor-neutral standard. **Traces + Metrics** APIs are **stable** across major languages; **Logs** are maturing (most gaps closing through 2026); **Profiles is the 4th signal — public alpha (Mar 2026)**, with a low-overhead eBPF agent donated by Elastic. One wire protocol = **OTLP** (gRPC/HTTP). **Semantic Conventions** ~v1.41: **HTTP / database / messaging are stable**; `gen_ai` is experimental. Opt into stable HTTP attrs via `OTEL_SEMCONV_STABILITY_OPT_IN`.
- **Prometheus 3.x** (3.0 was the first major in 7 years; 3.7 shipped Oct 2025): **native histograms** (exponential buckets — still experimental, opt-in `--enable-feature=native-histograms`), **native OTLP ingestion** (`/api/v1/otlp/v1/metrics`), **Remote-Write 2.0** (metadata, exemplars, created-timestamp, native histograms), full UTF-8 metric/label names, a rebuilt UI. Pull/scrape model; scale-out via **Mimir / Thanos**.
- **Grafana 12 → 12.3:** Observability-as-Code (**Git Sync** — dashboards as code with PRs in-UI), **dynamic dashboards** (auto-grid), **Drilldown** GA, Grafana-managed alerts/recording rules, redesigned logs panel.
- **Tracing backends:** **Jaeger v2** is rebuilt **on the OTel Collector** and speaks OTLP end-to-end (v1 hit EOL Dec 31 2025). **Grafana Tempo** = object-storage-only backend with **TraceQL** + Traces Drilldown.
- **Loki** = log backend: a small **label index** + highly compressed chunks (cheap); query with **LogQL**; ship logs via **Grafana Alloy** (the OTel-collector distro). Native correlation: from a span, jump to **Loki logs** (filtered by `trace_id`) and to **metrics via exemplars**.
- **Profiles:** first-class module — the **4th OTel signal** (public alpha Mar 2026). Cover continuous profiling via **Pyroscope** / FlameQL, the low-overhead eBPF agent (Elastic-donated), and correlation of profiles to traces. Treat it as a peer of Logs / Metrics / Traces, not a sidebar mention.
- **Commercial context** (name + one line, don't deep-dive): **Datadog** (all-in-one SaaS, agent + APM), **New Relic** (all-in-one, usage pricing), **Honeycomb** (high-cardinality events, "observability 2.0 / wide events"), **Splunk** (logs/SIEM heritage), **Grafana Cloud** (managed Prometheus/Loki/Tempo/Pyroscope). The OSS trend in 2026: **OTel for instrumentation + a backend of choice**, and "wide structured events" as an emerging model.

---

## 5. Crispness guardrails (hard limits)
- Lead idea per concept: **2–3 sentences (≤60 words)**. Overflow → list/table/kv/visual.
- **4–6 sections** per concept page. One analogy, one primary visual, ≥1 gotcha, ≥1 quiz, 2–3 inline Q&A.
- Code/config: **one point each, ≤ ~14 lines**, escaped, copyable, static.
- No full configs/manifests; no exhaustive flag tables. Teach the model + the trade-off.
- Use ONLY the documented components + your page's assigned engine. Always include `.viz-fallback`.

When done, return a short list of the files you created.
