/* ============================================================
   Claude & Claude Code — Field Guide · QUIZ DRILLS (.trainer)
   Timed chip quizzes for the judgment this guide actually builds:
     "pick-the-mechanism" — a Claude Code need → the right mechanism
     "which-feature"      — an API scenario → the right feature
     "debug-it"           — a symptom → the cause
   Best scores persist to localStorage["claude-drill"].
   Offline, no deps, theme-aware, honors prefers-reduced-motion.

   Authoring:
     <div class="trainer" data-trainer>
       <script type="application/json" class="trainer-config">
       { "mode": "pick-the-mechanism", "count": 10 }
       </script>
     </div>
   Config: mode (see registry), count = questions per round
   (default 10), secs = seconds per question (default per mode).
   ============================================================ */
(function () {
  "use strict";
  var STORE = "claude-drill";
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
  var MECHS = {
    "hook":       { label: "A hook",                       lesson: "code-hooks" },
    "mcp":        { label: "An MCP server",                lesson: "code-mcp" },
    "subagent":   { label: "A subagent",                   lesson: "code-subagents" },
    "skill":      { label: "A skill",                      lesson: "code-skills" },
    "slash":      { label: "A custom slash command",       lesson: "code-commands" },
    "claude-md":  { label: "CLAUDE.md",                    lesson: "code-memory" },
    "permission": { label: "A permission rule",            lesson: "code-permissions" },
    "headless":   { label: "A headless run (claude -p)",   lesson: "code-headless" }
  };

  var FEATURES = {
    "streaming":  { label: "Streaming",          lesson: "claude-api" },
    "caching":    { label: "Prompt caching",     lesson: "claude-power" },
    "batch":      { label: "Batch API",          lesson: "claude-power" },
    "structured": { label: "Structured outputs", lesson: "claude-power" },
    "files":      { label: "Files API",          lesson: "claude-power" },
    "thinking":   { label: "Extended thinking",  lesson: "claude-power" },
    "tool-use":   { label: "Tool use",           lesson: "claude-tools" },
    "vision":     { label: "Vision / PDF",       lesson: "claude-power" }
  };

  var CAUSES = {
    "context-bloat":   { label: "Context-window bloat",              lesson: "code-context" },
    "stale-claude-md": { label: "CLAUDE.md is stale or wrong",       lesson: "code-memory" },
    "hook-block":      { label: "A hook is blocking the action",     lesson: "code-hooks" },
    "deny-rule":       { label: "A permission deny rule matches",    lesson: "code-permissions" },
    "no-retry":        { label: "No retry/backoff on 429s",          lesson: "claude-production" },
    "wrong-model":     { label: "Wrong model for the job",           lesson: "claude-models" },
    "vague-tools":     { label: "Vague tool descriptions",           lesson: "claude-production" },
    "missing-result":  { label: "Tool result never sent back",       lesson: "claude-tools" },
    "no-verify":       { label: "Nothing verified the work",         lesson: "code-verify" },
    "unclear-prompt":  { label: "The prompt is vague",               lesson: "claude-prompt-basics" },
    "cache-miss":      { label: "The cached prefix keeps changing",  lesson: "claude-power" },
    "skipped-plan":    { label: "Skipped plan mode on a big task",   lesson: "code-epcc" }
  };

  /* ---------- bank: pick-the-mechanism ---------- */
  var PM_ITEMS = [
    { id: "pm-format", answer: "hook", trapKey: "claude-md",
      blurb: "Every file Claude edits must be run through prettier — every time, not just when it remembers.",
      why: "A PostToolUse hook on Edit|Write runs deterministically after every edit. “Always” means automation, not advice.",
      trap: "A CLAUDE.md line is a polite request the model can forget under pressure. Hooks are guarantees." },
    { id: "pm-jira", answer: "mcp", trapKey: "skill",
      blurb: "Claude should read your Jira tickets and update their status from inside a session.",
      why: "External systems with APIs are what MCP servers connect: typed tools for read/write, auth included.",
      trap: "A skill teaches Claude HOW to work; it can't give it a new connection to an outside system." },
    { id: "pm-explore", answer: "subagent", trapKey: "headless",
      blurb: "Investigate a giant unfamiliar codebase — without flooding your main session's context with 200 files.",
      why: "A subagent explores in its OWN context window and reports back a summary. Your desk stays clean.",
      trap: "A headless run also has fresh context, but you lose the conversation — subagents hand findings back into yours." },
    { id: "pm-convention", answer: "skill", trapKey: "claude-md",
      blurb: "Teach Claude your team's API-design conventions — but only load them when it's actually doing API work.",
      why: "Skills are knowledge folders loaded on demand, exactly when relevant. Zero context cost the rest of the time.",
      trap: "CLAUDE.md is read EVERY session — stuff it with niche conventions and you pay context for them always." },
    { id: "pm-testcmd", answer: "claude-md", trapKey: "slash",
      blurb: "Claude keeps guessing the wrong test command for your repo, session after session.",
      why: "Build/test commands are exactly what CLAUDE.md is for — a memo read at the start of every session.",
      trap: "A slash command runs when YOU invoke it; the memo fixes what Claude assumes by default." },
    { id: "pm-protect", answer: "permission", trapKey: "hook",
      blurb: "Claude must NEVER read .env or touch infra/ — regardless of what anyone types in a prompt.",
      why: "deny rules in settings.json are checked before anything runs and can't be argued with. Simplest, first gate.",
      trap: "A PreToolUse hook CAN block too — but you'd be writing a script for what one deny line already does." },
    { id: "pm-nightly", answer: "headless", trapKey: "slash",
      blurb: "Every night at 2 a.m., summarize the day's new TODO comments into a report. Nobody is at a keyboard.",
      why: "Unattended + scheduled = headless: cron runs claude -p and pipes the answer wherever you want.",
      trap: "Slash commands live inside an interactive session — there isn't one at 2 a.m." },
    { id: "pm-friday", answer: "slash", trapKey: "skill",
      blurb: "You paste the same long release-checklist prompt every Friday afternoon.",
      why: "A custom slash command turns a reusable prompt into /release-checklist. One keystroke, no pasting.",
      trap: "A skill is for knowledge and multi-step workflows; a reusable PROMPT is the command's home turf." },
    { id: "pm-gate", answer: "hook", trapKey: "permission",
      blurb: "Claude must not be able to end its turn until the test suite passes.",
      why: "A Stop hook runs when Claude tries to finish and can block until the check passes — the deterministic verify gate.",
      trap: "Permission rules gate TOOL CALLS going out; they have no say over when a turn may end." },
    { id: "pm-db", answer: "mcp", trapKey: "permission",
      blurb: "Give Claude a safe, typed way to query your Postgres database during sessions.",
      why: "An MCP server exposes the database as proper tools (query, schema) with its own auth and guardrails.",
      trap: "Permissions control which tools may RUN — they can't create the database tool in the first place." },
    { id: "pm-review", answer: "subagent", trapKey: "headless",
      blurb: "Before you ship, get an independent review of the plan from fresh eyes with no stake in the conversation.",
      why: "A reviewer subagent starts without your session's biases and reports its verdict back into the session.",
      trap: "Headless also gives fresh eyes — but then you're shuttling context by hand instead of delegating." },
    { id: "pm-prbot", answer: "headless", trapKey: "mcp",
      blurb: "Review every opened pull request in CI and post the findings as a comment.",
      why: "CI is automation: a workflow runs claude -p over the diff and posts the JSON verdict. No human in the loop.",
      trap: "MCP connects tools INTO a session; CI needs a whole non-interactive RUN, which is -p's job." },
    { id: "pm-commits", answer: "claude-md", trapKey: "hook",
      blurb: "Commit messages in this repo should follow your conventional-commits format, in every session.",
      why: "A convention Claude should follow by default belongs in the project memo it reads every session.",
      trap: "A hook could VALIDATE messages after the fact — but the memo prevents the problem instead of bouncing it." },
    { id: "pm-migrate", answer: "skill", trapKey: "slash",
      blurb: "A multi-step migration playbook — steps, checks, edge cases — that you reuse across many repos.",
      why: "That's a workflow with knowledge attached: a skill folder (SKILL.md + helpers) Claude loads when the task matches.",
      trap: "A slash command fires a prompt; it doesn't carry a playbook's worth of steps, files, and judgment." },
    { id: "pm-push", answer: "permission", trapKey: "hook",
      blurb: "git push must always require your explicit OK — even in a mostly auto-accept session.",
      why: "An ask rule — “Bash(git push:*)” — always prompts, whatever the session mode. One line of settings.",
      trap: "A hook could block pushes entirely, but you want a PROMPT, and that's literally what ask rules are." },
    { id: "pm-flaky", answer: "subagent", trapKey: "slash",
      blurb: "Chase the flaky test's noisy 400-line logs — without those logs ever entering your main context.",
      why: "Delegate to a subagent: the logs fill ITS window, and only the diagnosis comes back to yours.",
      trap: "A slash command runs in YOUR session — the logs land on your desk either way." }
  ];

  /* ---------- bank: which-feature ---------- */
  var WF_ITEMS = [
    { id: "wf-blank", answer: "streaming", trapKey: "caching",
      blurb: "Users stare at a blank screen for 20 seconds while long answers generate.",
      why: "Streaming delivers tokens as they're produced — perceived latency drops to near-zero.",
      trap: "Caching cuts the time to FIRST token on repeated prefixes; it can't make a long answer feel live." },
    { id: "wf-manual", answer: "caching", trapKey: "files",
      blurb: "Every request re-sends the same 80-page policy manual. Latency and cost are brutal.",
      why: "A long, unchanging prefix is the textbook prompt-caching case — pay for it once, reuse it cheaply.",
      trap: "The Files API stores documents for reuse, but caching is what slashes the per-call token bill here." },
    { id: "wf-backlog", answer: "batch", trapKey: "caching",
      blurb: "Label 200,000 archived support tickets by next week. Nobody is waiting on any single one.",
      why: "Asynchronous bulk at ~50% off — the Batch API exists for exactly this shape of work.",
      trap: "Caching helps the shared prompt, but the headline lever for huge non-urgent volume is batching." },
    { id: "wf-queue", answer: "structured", trapKey: "tool-use",
      blurb: "The reply must parse as {category, priority} every single time — it feeds an automated queue.",
      why: "Structured outputs guarantee the response matches your JSON schema. No parsing roulette.",
      trap: "Tool use is for Claude taking ACTIONS; the shape of the final ANSWER is structured outputs' job." },
    { id: "wf-spec", answer: "files", trapKey: "caching",
      blurb: "One 200-page spec is referenced by every conversation across your whole app.",
      why: "Upload once with the Files API and reference it by id everywhere — no re-sending, no duplication.",
      trap: "Caching reuses a prompt PREFIX within its window; a shared asset across many conversations wants Files." },
    { id: "wf-puzzle", answer: "thinking", trapKey: "structured",
      blurb: "Multi-step logic problems keep getting confident but wrong answers.",
      why: "Extended thinking buys the model reasoning steps before it commits — accuracy on hard problems jumps.",
      trap: "A schema makes the answer well-SHAPED, not well-REASONED. Wrong, but valid JSON, is still wrong." },
    { id: "wf-orders", answer: "tool-use", trapKey: "files",
      blurb: "Claude must answer with TODAY's order status, live from your internal API.",
      why: "Live data means letting Claude call a get_order_status tool — tool use is the bridge to your systems.",
      trap: "Files are static snapshots; by tomorrow the uploaded data is stale." },
    { id: "wf-spike", answer: "vision", trapKey: "files",
      blurb: "Users upload dashboard screenshots and ask “why did this spike?”",
      why: "Reading charts and screenshots is vision — send the image, Claude reads it like a document.",
      trap: "The Files API can STORE the image, but understanding pixels is the vision capability." },
    { id: "wf-invoice", answer: "vision", trapKey: "structured",
      blurb: "Pull the line items out of scanned invoice PDFs.",
      why: "Scanned PDFs are images at heart — vision reads them. (Pair with structured outputs for the result.)",
      trap: "Structured outputs shape what comes OUT; reading the scan in the first place is vision." },
    { id: "wf-refund", answer: "tool-use", trapKey: "structured",
      blurb: "Claude should decide WHEN to call refund_customer, and with what arguments.",
      why: "Model-decided actions with typed arguments = tool use. Claude requests; your code executes.",
      trap: "Structured outputs constrain the final reply — they don't let the model trigger actions mid-task." },
    { id: "wf-evals", answer: "batch", trapKey: "streaming",
      blurb: "Run your 5,000-case eval suite for half the price; results are due tomorrow morning.",
      why: "Overnight + bulk + price-sensitive: submit as a batch, collect results before standup.",
      trap: "Streaming is about watching one answer arrive — irrelevant when no human is watching 5,000." },
    { id: "wf-fewshot", answer: "caching", trapKey: "batch",
      blurb: "Your prompt carries 30 few-shot examples that never change between calls.",
      why: "Static examples are a constant prefix — cache them and stop paying full price per call.",
      trap: "Batching changes WHEN requests run; it doesn't shrink the repeated tokens inside each one." },
    { id: "wf-typewriter", answer: "streaming", trapKey: "thinking",
      blurb: "Show the answer appearing word-by-word in your UI, like a typewriter.",
      why: "That UI is literally the stream — render tokens as the events arrive.",
      trap: "Extended thinking happens BEFORE the answer; the typewriter effect is delivery, not reasoning." },
    { id: "wf-parser", answer: "structured", trapKey: "thinking",
      blurb: "Your hand-rolled JSON parser breaks weekly because the model phrases output differently.",
      why: "Stop parsing prose. Bind a schema with structured outputs and the response validates every time.",
      trap: "More thinking might phrase it better — but only a schema makes the format a guarantee." },
    { id: "wf-tradeoff", answer: "thinking", trapKey: "tool-use",
      blurb: "A gnarly architecture decision needs trade-offs weighed carefully before answering.",
      why: "Deliberation is extended thinking's home turf — give the model a budget to reason before it commits.",
      trap: "There's no tool to call for judgment; the work is internal reasoning, not external data." },
    { id: "wf-latency-bill", answer: "caching", trapKey: "streaming",
      blurb: "Same system prompt, same docs, thousands of calls a day — finance wants the bill down 50%+.",
      why: "Caching the shared prefix routinely cuts both cost and latency dramatically on repeated context.",
      trap: "Streaming improves FEEL, not the bill — the tokens still get paid for." }
  ];

  /* ---------- bank: debug-it ---------- */
  var DB_ITEMS = [
    { id: "db-forgets", answer: "context-bloat", trapKey: "stale-claude-md",
      blurb: "Two hours into a session, Claude starts forgetting instructions you gave earlier and repeating finished work.",
      why: "Classic bloated window: too much in view, attention degrades. /context to confirm, /compact or /clear to fix.",
      trap: "CLAUDE.md loads at session START — symptoms that worsen AS the session grows point at context." },
    { id: "db-oldcmd", answer: "stale-claude-md", trapKey: "context-bloat",
      blurb: "Every NEW session, Claude runs the old build command — even though you corrected it yesterday.",
      why: "Yesterday's correction lived in that conversation. New sessions read CLAUDE.md, and it still says the old thing.",
      trap: "A fresh session has an empty window — this is stale memory, not a full desk." },
    { id: "db-bashfail", answer: "hook-block", trapKey: "deny-rule",
      blurb: "Suddenly every Bash command fails instantly with a cryptic non-zero exit — before it even seems to run.",
      why: "A PreToolUse hook (e.g. a guard script) is vetoing calls. /hooks to see what's wired; check its exit codes.",
      trap: "A deny rule would say it's not permitted; “fails instantly with an exit code” smells like a script saying no." },
    { id: "db-cantread", answer: "deny-rule", trapKey: "hook-block",
      blurb: "Claude says it can't read a config file. The file exists, and the same read works in your terminal.",
      why: "Check /permissions — a deny rule like Read(./.env) blocks the tool call before anything runs.",
      trap: "Hooks can block too, but “not permitted” phrasing and per-path consistency point at permission rules." },
    { id: "db-launchday", answer: "no-retry", trapKey: "wrong-model",
      blurb: "Worked perfectly in dev; under launch traffic ~2% of API calls fail and users see raw 429 errors.",
      why: "Rate limits are weather, not bugs — without backoff retries, every 429 becomes a user-facing failure.",
      trap: "A different model has different limits but the same cliff — the missing piece is retry handling." },
    { id: "db-slowcheap", answer: "wrong-model", trapKey: "no-retry",
      blurb: "A simple high-volume classifier is slow and your bill is enormous — accuracy was never the problem.",
      why: "That's an Opus-shaped bill for a Haiku-shaped job. Match the model to the task and re-check.",
      trap: "Nothing is failing, so retries aren't the issue — the per-call cost is." },
    { id: "db-wrongtool", answer: "vague-tools", trapKey: "missing-result",
      blurb: "The model keeps calling search_web when it obviously should call search_orders.",
      why: "The model picks tools by reading their descriptions. If they're vague or overlapping, it guesses. Sharpen them.",
      trap: "Results aren't the issue — the WRONG tool keeps being chosen at selection time." },
    { id: "db-ignores", answer: "missing-result", trapKey: "vague-tools",
      blurb: "Claude says “I checked the database” — but the answer ignores what the tool actually returned.",
      why: "After executing a tool you must send the result back in a tool_result block. Skip it and the model improvises.",
      trap: "The right tool WAS called — its output just never made it back into the conversation." },
    { id: "db-donenot", answer: "no-verify", trapKey: "skipped-plan",
      blurb: "Claude announces “done!” — and the code doesn't even compile.",
      why: "Generation without verification. Close the loop: have it run the build/tests before declaring victory.",
      trap: "Even a perfectly planned change needs the loop closed — plans don't compile code, builds do." },
    { id: "db-generic", answer: "unclear-prompt", trapKey: "wrong-model",
      blurb: "Answers keep coming back generic and wrong-shaped, and you re-explain the same things every time.",
      why: "Vague in, vague out. State the context, the constraints, and the exact output shape you want.",
      trap: "A bigger model polishes a vague answer — it still can't read your mind about what you wanted." },
    { id: "db-nobill", answer: "cache-miss", trapKey: "no-retry",
      blurb: "You enabled prompt caching, but the bill didn't move at all.",
      why: "Caching matches the prefix EXACTLY. A timestamp or session id at the top of the prompt busts it every call.",
      trap: "Nothing is erroring — the cache is just never hitting. Move volatile bits below the cached prefix." },
    { id: "db-sideways", answer: "skipped-plan", trapKey: "context-bloat",
      blurb: "A big refactor went sideways fast — Claude started editing immediately and painted itself into a corner.",
      why: "Big changes earn plan mode: explore first, agree on an approach, THEN edit. Cheap insurance.",
      trap: "The window wasn't full — the problem was acting before understanding." }
  ];

  /* ---------- mode registry ---------- */
  var MODES = {
    "pick-the-mechanism": {
      title: "Pick the mechanism — Claude Code judgment", vocab: MECHS, items: PM_ITEMS, secs: 45,
      fixed: ["hook", "mcp", "subagent", "skill", "slash", "claude-md", "permission", "headless"],
      lead: "Read the need, pick the right Claude Code mechanism in under {secs} seconds — hooks vs CLAUDE.md, skills vs commands, subagents vs headless. The confusables, on a clock. {count} questions per round."
    },
    "which-feature": {
      title: "Which API feature? — speed round", vocab: FEATURES, items: WF_ITEMS, secs: 30,
      fixed: ["streaming", "caching", "batch", "structured", "files", "thinking", "tool-use", "vision"],
      lead: "Read the scenario, name the API feature that solves it in under {secs} seconds — the architecture instinct interviews and design docs run on. {count} questions per round."
    },
    "debug-it": {
      title: "Debug the session — name the cause", vocab: CAUSES, items: DB_ITEMS, secs: 45, chips: 8,
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
    var mode = MODES[cfg.mode] ? cfg.mode : "pick-the-mechanism";
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
