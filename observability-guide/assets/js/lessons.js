/* ============================================================
   Observability Field Guide — canonical lesson registry
   GENERATED from tools/manifest.js by tools/gen.js — edit the
   manifest, then re-run `node tools/gen.js`. Stable lesson ids;
   each lesson page sets <body data-lesson="<id>">.
   ============================================================ */
window.LESSONS = [
  { id: "fo-overview", title: "Foundations — see your systems", url: "foundations/index.html", module: "foundations", tool: "foundations" },
  { id: "fo-what", title: "Monitoring vs observability", url: "foundations/what-is-observability.html", module: "foundations", tool: "foundations" },
  { id: "fo-pillars", title: "The three pillars + signals", url: "foundations/three-pillars.html", module: "foundations", tool: "foundations" },
  { id: "fo-cardinality", title: "Cardinality & the cost model", url: "foundations/cardinality.html", module: "foundations", tool: "foundations" },
  { id: "fo-stack", title: "The 2026 stack: open source + vendors", url: "foundations/the-stack.html", module: "foundations", tool: "foundations" },
  { id: "lo-overview", title: "Logs — the narrative signal", url: "logs/index.html", module: "logs", tool: "logs" },
  { id: "lo-structured", title: "Structured logging", url: "logs/structured-logging.html", module: "logs", tool: "logs" },
  { id: "lo-correlation", title: "Correlation IDs & context", url: "logs/correlation.html", module: "logs", tool: "logs" },
  { id: "lo-loki", title: "Loki & log pipelines", url: "logs/loki-and-pipelines.html", module: "logs", tool: "logs" },
  { id: "me-overview", title: "Metrics — the cheap signal", url: "metrics/index.html", module: "metrics", tool: "metrics" },
  { id: "me-types", title: "The four metric types", url: "metrics/metric-types.html", module: "metrics", tool: "metrics" },
  { id: "me-red-use", title: "RED & USE methods", url: "metrics/red-use.html", module: "metrics", tool: "metrics" },
  { id: "me-histograms", title: "Histograms & percentiles", url: "metrics/histograms-percentiles.html", module: "metrics", tool: "metrics" },
  { id: "tr-overview", title: "Traces — the causal signal", url: "traces/index.html", module: "traces", tool: "traces" },
  { id: "tr-spans", title: "Spans & context propagation", url: "traces/spans-and-context.html", module: "traces", tool: "traces" },
  { id: "tr-critical", title: "Reading a trace: the critical path", url: "traces/critical-path.html", module: "traces", tool: "traces" },
  { id: "tr-sampling", title: "Trace sampling", url: "traces/sampling.html", module: "traces", tool: "traces" },
  { id: "ot-overview", title: "OpenTelemetry — one standard", url: "otel/index.html", module: "otel", tool: "otel" },
  { id: "ot-architecture", title: "API, SDK & Collector", url: "otel/api-sdk-collector.html", module: "otel", tool: "otel" },
  { id: "ot-instrumentation", title: "Auto vs manual instrumentation", url: "otel/instrumentation.html", module: "otel", tool: "otel" },
  { id: "ot-semconv", title: "Semantic conventions", url: "otel/semantic-conventions.html", module: "otel", tool: "otel" },
  { id: "pr-overview", title: "Prometheus & Grafana", url: "promstack/index.html", module: "promstack", tool: "promstack" },
  { id: "pr-model", title: "The Prometheus model", url: "promstack/prometheus-model.html", module: "promstack", tool: "promstack" },
  { id: "pr-promql", title: "PromQL, hands-on", url: "promstack/promql.html", module: "promstack", tool: "promstack" },
  { id: "pr-grafana", title: "Grafana dashboards", url: "promstack/grafana-dashboards.html", module: "promstack", tool: "promstack" },
  { id: "pr-alerting", title: "Alerting with Alertmanager", url: "promstack/alertmanager.html", module: "promstack", tool: "promstack" },
  { id: "sl-overview", title: "SLO / SLI & alerting", url: "slo/index.html", module: "slo", tool: "slo" },
  { id: "sl-definitions", title: "SLI vs SLO vs SLA", url: "slo/sli-slo-sla.html", module: "slo", tool: "slo" },
  { id: "sl-budgets", title: "Error budgets & burn rate", url: "slo/error-budgets.html", module: "slo", tool: "slo" },
  { id: "sl-burn-alerts", title: "Multi-burn-rate alerting", url: "slo/alerting-on-slos.html", module: "slo", tool: "slo" },
  { id: "iv-method", title: "How observability interviews work", url: "interview/index.html", module: "interview", tool: "interview" },
  { id: "iv-bank", title: "Observability question bank", url: "interview/question-bank.html", module: "interview", tool: "interview" },
  { id: "iv-sc-method", title: "Debugging scenarios", url: "interview/scenarios/index.html", module: "interview", tool: "interview" },
  { id: "iv-sc-latency", title: "Scenario: p99 latency spike", url: "interview/scenarios/latency-spike.html", module: "interview", tool: "interview" },
  { id: "iv-sc-errors", title: "Scenario: error-rate surge", url: "interview/scenarios/error-surge.html", module: "interview", tool: "interview" },
];

window.LESSON_MODULES = [
  { key: "foundations", label: "Foundations" },
  { key: "logs", label: "Logs" },
  { key: "metrics", label: "Metrics" },
  { key: "traces", label: "Traces & distributed tracing" },
  { key: "otel", label: "OpenTelemetry" },
  { key: "promstack", label: "Prometheus & Grafana" },
  { key: "slo", label: "SLO / SLI & alerting" },
  { key: "interview", label: "Interview prep" },
];
