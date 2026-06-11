/* ============================================================
   THE LANG STACK — quiz drills (.trainer)
   Timed chip quizzes for the judgment this stack actually needs:
     "which-tool" — read a scenario, pick the right tool fast
     "design-it"  — read a requirement, pick the right primitive
     "debug-it"   — read a symptom, name the cause
   Best scores persist to localStorage["lang-drill"].
   Offline, no deps, theme-aware, honors prefers-reduced-motion.

   Authoring:
     <div class="trainer" data-trainer>
       <script type="application/json" class="trainer-config">
       { "mode": "which-tool", "count": 10 }
       </script>
     </div>
   Config: mode "which-tool"|"design-it"|"debug-it", count = questions
   per round (default 10), secs = seconds per question (default 30/45/45).
   ============================================================ */
(function () {
  "use strict";
  var STORE = "lang-drill";
  var REDUCED = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function readStore() {
    try { var o = JSON.parse(localStorage.getItem(STORE)); return (o && o.v === 1) ? o : { v: 1, modes: {} }; }
    catch (e) { return { v: 1, modes: {} }; }
  }
  function writeStore(o) { try { localStorage.setItem(STORE, JSON.stringify(o)); } catch (e) {} }
  function el(t, c, html) { var e = document.createElement(t); if (c) e.className = c; if (html != null) e.innerHTML = html; return e; }
  function onReady(fn) { if (document.readyState !== "loading") fn(); else document.addEventListener("DOMContentLoaded", fn); }
  function shuffle(a) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)), t = a[i]; a[i] = a[j]; a[j] = t; } return a; }

  /* ---------- vocabularies: key → chip label + lesson id ---------- */
  var TOOLS = {
    "langchain": { label: "LangChain alone",          lesson: "lc-concepts" },
    "langgraph": { label: "LangGraph",                lesson: "lg-concepts" },
    "langsmith": { label: "LangSmith",                lesson: "ls-concepts" },
    "plain":     { label: "Plain SDK call",           lesson: "eco-big-picture" }
  };

  var PRIMS = {
    "reducer":           { label: "A reducer",                       lesson: "lg-concepts" },
    "checkpointer":      { label: "Checkpointer + thread_id",        lesson: "lg-concepts" },
    "cond-edge":         { label: "A conditional edge",              lesson: "lg-concepts" },
    "store":             { label: "The Store (cross-thread memory)", lesson: "lg-concepts" },
    "subgraph":          { label: "A subgraph",                      lesson: "lg-advanced" },
    "interrupt":         { label: "interrupt() + resume",            lesson: "lg-advanced" },
    "streaming":         { label: "A streaming mode",                lesson: "lg-advanced" },
    "supervisor":        { label: "A supervisor agent",              lesson: "lg-agents" },
    "handoff":           { label: "A handoff — Command(goto)",       lesson: "lg-agents" },
    "tool-calling":      { label: "Tool calling",                    lesson: "lc-concepts" },
    "structured-output": { label: "Structured output",               lesson: "lc-concepts" },
    "hybrid-rag":        { label: "Hybrid search + reranking",       lesson: "lc-rag" }
  };

  var CAUSES = {
    "missing-reducer":     { label: "No reducer on that state key",            lesson: "lg-concepts" },
    "no-thread-id":        { label: "thread_id missing or changing",           lesson: "lg-concepts" },
    "no-checkpointer":     { label: "No checkpointer compiled in",             lesson: "lg-concepts" },
    "missing-loop-edge":   { label: "No edge looping tools back to the model", lesson: "lg-concepts" },
    "interrupt-rerun":     { label: "Side effect before interrupt() re-ran",   lesson: "lg-advanced" },
    "wrong-stream-mode":   { label: "Wrong stream_mode",                       lesson: "lg-advanced" },
    "context-bloat":       { label: "Context-window bloat",                    lesson: "lg-agents" },
    "raised-tool-error":   { label: "Tool raised instead of returning error",  lesson: "lg-agents" },
    "missing-tool-result": { label: "Tool result never appended",              lesson: "lc-concepts" },
    "naive-retrieval":     { label: "Retrieval missing the right chunks",      lesson: "lc-rag" },
    "uncalibrated-judge":  { label: "Uncalibrated LLM judge",                  lesson: "ls-evals" },
    "no-tracing":          { label: "Tracing was never enabled",               lesson: "ls-concepts" }
  };

  /* ---------- bank: which-tool ---------- */
  var WT_ITEMS = [
    { id: "wt-once", answer: "plain", trapKey: "langchain",
      blurb: "Summarize one document with one prompt, in a one-off script you'll run once.",
      why: "A single fire-and-forget call has nothing to orchestrate — the provider SDK alone is the smallest correct tool.",
      trap: "LangChain works fine here, but it earns its keep when pieces multiply (templates, parsers, swapping providers) — not for one call." },
    { id: "wt-memory", answer: "langgraph", trapKey: "langchain",
      blurb: "A support bot that must remember the whole conversation per user — across sessions, even after the server restarts.",
      why: "Durable per-conversation memory is the checkpointer + thread_id combo, and that lives in LangGraph.",
      trap: "LangChain chains are stateless pipes; real persistence is the graph runtime's job." },
    { id: "wt-slow", answer: "langsmith", trapKey: "langgraph",
      blurb: "Figure out why last night's runs got slow and which step burned all the tokens.",
      why: "That's observability: traces record every run's latency and token usage — LangSmith's home turf.",
      trap: "LangGraph executes the steps; it doesn't record and visualize what they cost. That's the x-ray layer." },
    { id: "wt-rag", answer: "langchain", trapKey: "langgraph",
      blurb: "Classic RAG: question → retrieve chunks → stuff a prompt → answer. A straight line, no loops.",
      why: "A straight pipe is exactly what LCEL chains model: retriever | prompt | model | parser.",
      trap: "No loops, no branches, no state — a graph adds machinery this flow doesn't need." },
    { id: "wt-agent-loop", answer: "langgraph", trapKey: "langchain",
      blurb: "An agent that calls tools in a loop until the job is done — and pauses for approval before risky actions.",
      why: "Loops and pause/resume are graph structure: conditional edges plus interrupt(). LangGraph is built for this.",
      trap: "LangChain gives you the model and tools, but the LOOP and the pause live in the graph runtime." },
    { id: "wt-compare", answer: "langsmith", trapKey: "langchain",
      blurb: "Grade two prompt versions against 50 saved test questions and see which wins, per question.",
      why: "Dataset × app version = an experiment; comparing experiments side-by-side is LangSmith evaluation.",
      trap: "LangChain runs the prompts; storing the dataset and scoring/diffing the results is the platform's job." },
    { id: "wt-swap", answer: "langchain", trapKey: "plain",
      blurb: "Your app must switch between GPT, Claude, and a local model without rewriting application code.",
      why: "One standard chat-model interface across providers is LangChain's founding feature (init_chat_model).",
      trap: "With raw SDKs you'd maintain one integration per provider — the abstraction is the point." },
    { id: "wt-approve", answer: "langgraph", trapKey: "langsmith",
      blurb: "Pause a refund workflow for a human to approve, then resume exactly where it stopped — even days later.",
      why: "interrupt() + a checkpointer pause a LIVE run and resume it. That's graph runtime behavior.",
      trap: "LangSmith's annotation queues grade runs AFTER the fact — they can't hold a live execution open." },
    { id: "wt-feedback", answer: "langsmith", trapKey: "langgraph",
      blurb: "Collect thumbs-up/down from real users and attach each one to the exact run that produced the answer.",
      why: "Feedback attached to runs (and flowing into datasets) is LangSmith's human-feedback loop.",
      trap: "The graph produced the run, but storing and analyzing verdicts about it is observability." },
    { id: "wt-two-agents", answer: "langgraph", trapKey: "langchain",
      blurb: "A sales agent and a billing agent that hand the same customer conversation back and forth.",
      why: "Multi-agent control flow — handoffs, shared state — is exactly what LangGraph's Command(goto) models.",
      trap: "Each agent may be built from LangChain parts, but the BATON PASSING is graph orchestration." },
    { id: "wt-json", answer: "langchain", trapKey: "plain",
      blurb: "Extract a validated {name, date, amount} object from messy emails, same schema every time.",
      why: "with_structured_output gives you schema-validated objects (with retries) on any provider.",
      trap: "Raw JSON mode gets you 90% there — until the model drifts and nothing validates or retries." },
    { id: "wt-ci", answer: "langsmith", trapKey: "langgraph",
      blurb: "A nightly CI job should fail the build whenever answer quality drops below a threshold.",
      why: "evaluate() over a pinned dataset, assert the aggregate score — LangSmith's CI story.",
      trap: "The app under test might be a graph, but the grading harness is the eval platform." },
    { id: "wt-stream-simple", answer: "langchain", trapKey: "langgraph",
      blurb: "Stream tokens to the browser as the model writes. Simple chat — no tools, no branching.",
      why: ".stream() comes free on every Runnable; a straight chain streams without any graph.",
      trap: "Reaching for LangGraph for a straight line is the classic over-engineering move." },
    { id: "wt-stream-agent", answer: "langgraph", trapKey: "langchain",
      blurb: "Show a typewriter UI AND per-step progress (\"searching… drafting…\") for a multi-step agent.",
      why: "Mixing stream_mode=[\"messages\",\"updates\"] over a stateful run is LangGraph streaming.",
      trap: "A chain can stream tokens, but per-NODE progress events need the graph's view of execution." },
    { id: "wt-prompt-team", answer: "langsmith", trapKey: "langchain",
      blurb: "Let a PM iterate on the system prompt in a UI, version it, and have code pull the latest blessed version.",
      why: "That's the Prompt Hub + Playground: edit, version, and fetch prompts without redeploys.",
      trap: "Prompt TEMPLATES live in LangChain code; prompt COLLABORATION and versioning live in the platform." },
    { id: "wt-batch", answer: "langchain", trapKey: "plain",
      blurb: "Classify 10,000 support tickets overnight with the same prompt template.",
      why: ".batch() runs inputs concurrently with one line — template + parser + parallelism included.",
      trap: "Hand-rolling asyncio + retries around a raw SDK is a weekend you don't need to spend." }
  ];

  /* ---------- bank: design-it ---------- */
  var DI_ITEMS = [
    { id: "di-append", answer: "reducer", trapKey: "checkpointer",
      blurb: "Several nodes each add messages to the conversation. Updates must MERGE into one growing list, not overwrite it.",
      why: "A reducer (like add_messages) tells LangGraph HOW to combine a node's partial update with the existing value.",
      trap: "A checkpointer saves state across invocations — it doesn't decide how two updates combine within a run." },
    { id: "di-reload", answer: "checkpointer", trapKey: "store",
      blurb: "A user closes the tab, comes back tomorrow, and the SAME conversation continues where it left off.",
      why: "One conversation over time = one thread_id; the checkpointer replays its saved state on the next call.",
      trap: "The Store is for facts shared ACROSS conversations — this is one conversation resuming." },
    { id: "di-prefs", answer: "store", trapKey: "checkpointer",
      blurb: "Remember a user's name and preferences in EVERY new conversation they start.",
      why: "Cross-thread, per-user memory is the Store's job — keyed by user, visible from any thread.",
      trap: "A checkpointer is scoped to ONE thread; a new conversation = new thread = empty history." },
    { id: "di-route", answer: "cond-edge", trapKey: "supervisor",
      blurb: "After the model node runs, control should go to the calculator tool OR straight to the end — decided at runtime.",
      why: "A routing function reading state and returning the next node's name — the conditional edge, exactly.",
      trap: "A supervisor is a whole AGENT that delegates; one runtime branch needs only an edge." },
    { id: "di-compose", answer: "subgraph", trapKey: "supervisor",
      blurb: "A 12-node research workflow should appear as ONE node inside your main graph.",
      why: "A compiled graph IS a node — drop it in with add_node and it runs as a unit.",
      trap: "No routing decisions needed here — it's composition (nesting), not delegation." },
    { id: "di-approve", answer: "interrupt", trapKey: "cond-edge",
      blurb: "Before any email is actually sent, a human must click approve; then the run continues.",
      why: "interrupt() pauses mid-node and surfaces a payload; Command(resume=…) continues — the HITL gate.",
      trap: "An edge picks between nodes that RUN; it can't hold the whole graph open waiting for a human." },
    { id: "di-central", answer: "supervisor", trapKey: "handoff",
      blurb: "Route each request to one of three specialist agents, and have every result come back to one place.",
      why: "Central dispatch + workers reporting back is the supervisor pattern — predictable, easy to trace.",
      trap: "Handoffs transfer control PEER to PEER and don't come back — wrong shape for central collection." },
    { id: "di-pass", answer: "handoff", trapKey: "supervisor",
      blurb: "Mid-conversation, the sales agent realizes it's a billing question and passes the customer over — billing takes it from there.",
      why: "Command(goto=\"billing\", update={…}) — control moves sideways and stays there. The swarm style.",
      trap: "Routing back through a supervisor adds a hop and loses the natural \"you take it from here\" flow." },
    { id: "di-progress", answer: "streaming", trapKey: "interrupt",
      blurb: "Your UI should show each node's result the moment that node finishes — not everything at the end.",
      why: "stream_mode=\"updates\" yields every node's delta live; \"messages\" adds token streaming.",
      trap: "interrupt() PAUSES the run for input; streaming just reports while it keeps going." },
    { id: "di-weather", answer: "tool-calling", trapKey: "cond-edge",
      blurb: "Let the MODEL decide when to call your weather API — and with what arguments.",
      why: "Bind the tool; the model emits a structured call with args when it judges it needs one.",
      trap: "A conditional edge routes between nodes YOU wrote with logic YOU wrote — here the model decides." },
    { id: "di-schema", answer: "structured-output", trapKey: "tool-calling",
      blurb: "Every reply must be a valid {title, severity, owner} object your code can trust — no prose.",
      why: "with_structured_output binds a schema and validates/retries until the object conforms.",
      trap: "Tool calling also uses schemas, but it's for ACTIONS; this is about the SHAPE of the final answer." },
    { id: "di-partnum", answer: "hybrid-rag", trapKey: "tool-calling",
      blurb: "Your retrieval keeps missing documents when users search exact part numbers like \"X-99-CFG\".",
      why: "Embeddings blur exact identifiers; add keyword search (BM25) and fuse ranks — hybrid retrieval.",
      trap: "No tool will save a retriever that can't FIND the document — fix the search, then rerank." },
    { id: "di-crash", answer: "checkpointer", trapKey: "interrupt",
      blurb: "If the process dies on step 7 of 9, the run should resume from step 7 after a restart — not start over.",
      why: "Checkpoints after every step are crash insurance: replay state, continue from the last saved step.",
      trap: "interrupt() is a pause YOU code on purpose; crash recovery is the checkpointer being there at all." },
    { id: "di-loop", answer: "cond-edge", trapKey: "reducer",
      blurb: "After tools run, control must return to the model node — again and again until it stops asking for tools.",
      why: "The agent loop is graph structure: tools → agent edge plus a conditional edge that exits when done.",
      trap: "A reducer merges state VALUES; it has no say in which node runs next." },
    { id: "di-teams", answer: "subgraph", trapKey: "handoff",
      blurb: "Three teams ship their own graphs with different state schemas; you compose them, passing only {query, result}.",
      why: "Wrap each compiled graph in a function that maps parent state in and out — subgraphs with state mapping.",
      trap: "A handoff moves a live conversation between agents; this is build-time composition of components." },
    { id: "di-emit", answer: "streaming", trapKey: "tool-calling",
      blurb: "From INSIDE a long node you want to emit \"Downloading… 40%\" progress lines to the UI.",
      why: "stream_mode=\"custom\" + get_stream_writer() lets a node publish its own progress events.",
      trap: "That progress text is for humans — it's an event to stream, not a function for the model to call." }
  ];

  /* ---------- bank: debug-it ---------- */
  var DB_ITEMS = [
    { id: "db-vanish", answer: "missing-reducer", trapKey: "no-checkpointer",
      blurb: "Every turn, the state's message list contains ONLY the newest message — everything older vanishes.",
      why: "Without a reducer, a node's partial update REPLACES the old value. add_messages makes it append.",
      trap: "A checkpointer saves state BETWEEN calls — this list is being overwritten WITHIN the run." },
    { id: "db-amnesia", answer: "no-thread-id", trapKey: "missing-reducer",
      blurb: "You compiled with a checkpointer, but the bot still remembers nothing between calls.",
      why: "Checkpoints are keyed by thread_id. Forget to pass it (or generate a fresh one per call) and every call starts a brand-new thread.",
      trap: "If messages survived within a run but not across calls, the reducer is fine — the KEY is missing." },
    { id: "db-interrupt-err", answer: "no-checkpointer", trapKey: "no-thread-id",
      blurb: "Calling interrupt() raises an error complaining about persistence.",
      why: "A paused graph must park its state somewhere until the resume — interrupts REQUIRE a checkpointer.",
      trap: "thread_id matters too, but the error fires earlier: there's nowhere to save the paused state at all." },
    { id: "db-double", answer: "interrupt-rerun", trapKey: "raised-tool-error",
      blurb: "Your refund tool charges the customer TWICE whenever a human approves the resumed run.",
      why: "On resume, the node re-runs from its top — code BEFORE interrupt() executes again. Put side effects after the gate.",
      trap: "Nothing crashed — the bug is silent re-execution, the classic interrupt gotcha." },
    { id: "db-slow", answer: "context-bloat", trapKey: "naive-retrieval",
      blurb: "The agent is great for five turns, then turns slow, expensive, and weirdly forgetful.",
      why: "Every turn appends messages; unbounded history degrades attention and burns tokens. Trim or summarize old turns.",
      trap: "Retrieval returns the wrong DOCUMENTS; this is the conversation itself outgrowing the window." },
    { id: "db-crash", answer: "raised-tool-error", trapKey: "missing-tool-result",
      blurb: "One malformed tool argument and the whole agent run dies with a stack trace.",
      why: "Catch tool errors and RETURN them as the tool's result — the model reads the error and self-corrects.",
      trap: "The result never got appended because the exception killed the loop first." },
    { id: "db-eval-gap", answer: "uncalibrated-judge", trapKey: "naive-retrieval",
      blurb: "Offline eval scores look great, but real users keep reporting wrong answers.",
      why: "An LLM judge that hands out 9/10s to everything measures nothing. Spot-check it against human labels; prefer strict pass/fail.",
      trap: "Could also be dataset coverage — but verify the JUDGE before trusting any number it produced." },
    { id: "db-hallucinate", answer: "missing-tool-result", trapKey: "raised-tool-error",
      blurb: "The model says \"I checked the database\" but its answers ignore what the tool actually returned.",
      why: "After executing a tool you must append a ToolMessage with the result and call the model AGAIN — skip it and the model improvises.",
      trap: "Nothing raised here; the loop just never fed the result back." },
    { id: "db-wrong-doc", answer: "naive-retrieval", trapKey: "context-bloat",
      blurb: "The RAG bot answers confidently — from the wrong section of the right document.",
      why: "Retrieval quality: chunking that splits answers, no reranking, no citations to expose it. Fix the funnel.",
      trap: "The conversation isn't long — the CONTEXT it was handed was wrong from the start." },
    { id: "db-2am", answer: "no-tracing", trapKey: "no-checkpointer",
      blurb: "Production broke at 2 a.m. and you can't tell which step failed or what its inputs were.",
      why: "That information only exists if every run was traced. Turn tracing on from day one — it's two env vars.",
      trap: "A checkpointer lets the app RESUME; it doesn't show a human what happened inside the run." },
    { id: "db-typewriter", answer: "wrong-stream-mode", trapKey: "context-bloat",
      blurb: "Your \"typewriter\" chat UI prints whole paragraphs at once instead of word by word.",
      why: "stream_mode=\"updates\" yields per-NODE results. Token-by-token is stream_mode=\"messages\".",
      trap: "Nothing is slow or bloated — the events you subscribed to are just coarser than you wanted." },
    { id: "db-stops", answer: "missing-loop-edge", trapKey: "missing-tool-result",
      blurb: "The graph executes the tool node… and then the run simply ends, answer-less.",
      why: "An agent loop needs the edge tools → model so the model can read results and continue. No edge, no loop.",
      trap: "The result WAS recorded — but nothing routed execution back to the model to use it." }
  ];

  /* ---------- mode registry ---------- */
  var MODES = {
    "which-tool": {
      title: "Which tool? — speed round", vocab: TOOLS, items: WT_ITEMS, secs: 30,
      fixed: ["langchain", "langgraph", "langsmith", "plain"],
      lead: "Read the scenario, pick the right layer of the stack in under {secs} seconds — the judgment call every Lang-stack project starts with. {count} questions per round."
    },
    "design-it": {
      title: "Design it — pick the primitive", vocab: PRIMS, items: DI_ITEMS, secs: 45, chips: 8,
      lead: "Read the requirement, name the ONE primitive that solves it in under {secs} seconds. Reducers vs checkpointers, supervisor vs handoff — the confusables, on a clock. {count} questions per round."
    },
    "debug-it": {
      title: "Debug it — name the cause", vocab: CAUSES, items: DB_ITEMS, secs: 45, chips: 8,
      lead: "Read the symptom, diagnose the cause in under {secs} seconds — the gotchas from every lesson, weaponized. {count} questions per round."
    }
  };

  /* ---------- engine ---------- */
  function lessonUrl(vocab, key) {
    var meta = vocab[key]; if (!meta) return null;
    var L = window.LESSONS || [];
    for (var i = 0; i < L.length; i++) if (L[i].id === meta.lesson) return (window.SITE_BASE || "./") + L[i].url;
    return null;
  }

  function init(host) {
    var cfgEl = host.querySelector(".trainer-config") || host.querySelector("script[type='application/json']");
    var cfg = {};
    if (cfgEl) { try { cfg = JSON.parse(cfgEl.textContent) || {}; } catch (e) { cfg = {}; } }
    var mode = MODES[cfg.mode] ? cfg.mode : "which-tool";
    var M = MODES[mode];
    var SECS = cfg.secs || M.secs;
    var bank = M.items;
    var COUNT = Math.min(cfg.count || 10, bank.length);
    if (!COUNT) return;

    var store = readStore();
    var quiz = [], qi = 0, scoreN = 0, streak = 0, bestStreak = 0, misses = [];
    var answered = false, ticker = null, deadline = 0;
    var chipEls = [], barEl = null;

    host.innerHTML = "";
    host.setAttribute("tabindex", "0");

    function modeRec() { return store.modes[mode] || { best: 0, plays: 0 }; }
    function stopTicker() { if (ticker) { clearInterval(ticker); ticker = null; } }

    /* ----- intro ----- */
    function renderIntro() {
      stopTicker(); host.innerHTML = "";
      var head = el("div", "pp-head");
      head.appendChild(el("span", "pp-title", M.title));
      var rec = modeRec();
      head.appendChild(el("span", "pp-best", rec.plays ? "best <b>" + rec.best + "%</b> · " + rec.plays + " round" + (rec.plays === 1 ? "" : "s") : "not attempted"));
      host.appendChild(head);
      host.appendChild(el("p", "pp-lead", M.lead.replace("{secs}", SECS).replace("{count}", COUNT)));
      var start = el("button", "pp-btn primary", "▶ Start a round"); start.type = "button";
      start.addEventListener("click", begin);
      var act = el("div", "pp-actions"); act.appendChild(start);
      host.appendChild(act);
    }

    /* ----- round ----- */
    function begin() {
      quiz = shuffle(bank).slice(0, COUNT);
      qi = 0; scoreN = 0; streak = 0; bestStreak = 0; misses = [];
      renderQuestion();
    }

    function options(q) {
      if (M.fixed) return M.fixed.slice();   /* stable positions aid speed */
      var keys = Object.keys(M.vocab).filter(function (k) { return k !== q.answer && k !== q.trapKey; });
      var n = (M.chips || 8) - 1 - (q.trapKey ? 1 : 0);
      var picked = shuffle(keys).slice(0, n);
      if (q.trapKey) picked.push(q.trapKey);
      picked.push(q.answer);
      return shuffle(picked);
    }

    function renderQuestion() {
      stopTicker(); host.innerHTML = ""; answered = false; chipEls = [];
      var q = quiz[qi];

      var head = el("div", "pp-head");
      head.appendChild(el("span", "pp-title", "Question " + (qi + 1) + " / " + quiz.length));
      head.appendChild(el("span", "pp-best", "score <b>" + scoreN + "</b>" + (streak >= 2 ? " · 🔥 " + streak : "")));
      host.appendChild(head);

      var track = el("div", "pp-track");
      barEl = el("div", "pp-track-fill");
      track.appendChild(barEl);
      host.appendChild(track);

      host.appendChild(el("p", "pp-blurb", "“" + q.blurb + "”"));

      var grid = el("div", "pp-chips");
      options(q).forEach(function (opt, k) {
        var label = M.vocab[opt] ? M.vocab[opt].label : opt;
        var b = el("button", "pp-chip", "<i>" + (k + 1) + "</i>" + label); b.type = "button";
        b.dataset.key = opt;
        b.addEventListener("click", function () { answer(opt); });
        grid.appendChild(b); chipEls.push(b);
      });
      host.appendChild(grid);

      var foot = el("div", "pp-actions");
      var quit = el("button", "pp-btn", "✕ End round"); quit.type = "button";
      quit.addEventListener("click", renderEnd);
      foot.appendChild(quit);
      host.appendChild(foot);

      deadline = Date.now() + SECS * 1000;
      if (REDUCED) { barEl.style.width = "100%"; }
      else {
        barEl.style.transition = "none"; barEl.style.width = "100%";
        void barEl.offsetWidth;            /* reflow so the transition restarts */
        barEl.style.transition = "width " + SECS + "s linear";
        barEl.style.width = "0%";
      }
      ticker = setInterval(function () {
        if (Date.now() >= deadline) answer(null);   /* timeout = wrong */
      }, 100);
      host.focus({ preventScroll: true });
    }

    function answer(picked) {
      if (answered) return;
      answered = true; stopTicker();
      if (barEl && !REDUCED) { barEl.style.transition = "none"; }
      var q = quiz[qi];
      var right = picked === q.answer;
      if (right) { scoreN++; streak++; bestStreak = Math.max(bestStreak, streak); }
      else { streak = 0; misses.push(q); }

      chipEls.forEach(function (b) {
        b.disabled = true;
        if (b.dataset.key === q.answer) b.classList.add("is-right");
        else if (picked != null && b.dataset.key === picked) b.classList.add("is-wrong");
        else b.classList.add("is-dim");
      });

      var v = el("div", "pp-verdict " + (right ? "ok" : "bad"));
      v.appendChild(el("div", "pp-vtitle", right ? "✓ Right" : (picked == null ? "✗ Out of time" : "✗ Not this one")));
      v.appendChild(el("p", "pp-why", q.why));
      if (!right && q.trap && (picked == null || picked === q.trapKey)) v.appendChild(el("p", "pp-trap", "<b>The trap:</b> " + q.trap));
      var next = el("button", "pp-btn primary", qi === quiz.length - 1 ? "See results ▸" : "Next ▸"); next.type = "button";
      next.addEventListener("click", advance);
      var va = el("div", "pp-actions"); va.appendChild(next);
      v.appendChild(va);
      host.appendChild(v);
      next.focus({ preventScroll: true });
    }

    function advance() {
      if (qi === quiz.length - 1) renderEnd();
      else { qi++; renderQuestion(); }
    }

    /* ----- end ----- */
    function renderEnd() {
      stopTicker(); host.innerHTML = "";
      var seen = qi + (answered ? 1 : 0);
      if (!seen) { renderIntro(); return; }   /* abandoned before answering anything */
      var pct = Math.round(scoreN / seen * 100);

      var rec = modeRec();
      rec.plays += 1; rec.best = Math.max(rec.best, pct);
      store.modes[mode] = rec; writeStore(store);

      var head = el("div", "pp-head");
      head.appendChild(el("span", "pp-title", "Round over"));
      head.appendChild(el("span", "pp-best", "best <b>" + rec.best + "%</b>"));
      host.appendChild(head);

      var sc = el("div", "pp-score");
      sc.appendChild(el("div", "pp-pct", pct + "%"));
      sc.appendChild(el("div", "pp-sub", scoreN + " / " + seen + " right · longest streak " + bestStreak));
      host.appendChild(sc);

      if (misses.length) {
        var box = el("div", "pp-misses");
        box.appendChild(el("div", "pp-mhead", "Worth re-reading"));
        var dedup = {};
        misses.forEach(function (q) {
          if (dedup[q.answer]) return;
          dedup[q.answer] = true;
          var label = M.vocab[q.answer] ? M.vocab[q.answer].label : q.answer;
          var url = lessonUrl(M.vocab, q.answer);
          box.appendChild(el("p", "pp-miss", url
            ? "✗ “" + q.blurb + "” → <a href=\"" + url + "\">" + label + " →</a>"
            : "✗ " + q.blurb));
        });
        host.appendChild(box);
      } else if (seen) {
        host.appendChild(el("p", "pp-lead", "Clean sweep. Run it again — the questions reshuffle."));
      }

      var act = el("div", "pp-actions");
      var again = el("button", "pp-btn primary", "↻ Play again"); again.type = "button";
      again.addEventListener("click", begin);
      var back = el("button", "pp-btn", "‹ Intro"); back.type = "button";
      back.addEventListener("click", renderIntro);
      act.appendChild(again); act.appendChild(back);
      host.appendChild(act);
    }

    /* ----- keyboard ----- */
    host.addEventListener("keydown", function (ev) {
      if (ev.key >= "1" && ev.key <= "9" && !answered && chipEls.length) {
        var k = +ev.key - 1;
        if (chipEls[k]) { chipEls[k].click(); ev.preventDefault(); }
      } else if ((ev.key === "Enter" || ev.key === "ArrowRight") && answered) {
        advance(); ev.preventDefault();
      } else if (ev.key === "Escape") {
        renderIntro(); ev.preventDefault();
      }
    });

    renderIntro();
  }

  onReady(function () { document.querySelectorAll(".trainer").forEach(init); });
})();
