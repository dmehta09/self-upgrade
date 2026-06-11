/* ============================================================
   FastAPI Field Guide — quiz drills (.trainer)
   Timed chip quizzes for the judgment a FastAPI backend needs:
     "pick-the-tool"  — scenario → the right FastAPI mechanism
     "status-codes"   — scenario → the status code, fast
     "debug-it"       — symptom → name the cause
   Best scores persist to localStorage["fa-drill"].
   Offline, no deps, theme-aware, honors prefers-reduced-motion.

   Authoring:
     <div class="trainer" data-trainer>
       <script type="application/json" class="trainer-config">
       { "mode": "pick-the-tool", "count": 10 }
       </script>
     </div>
   Config: mode "pick-the-tool"|"status-codes"|"debug-it", count =
   questions per round (default 10), secs = seconds per question.
   ============================================================ */
(function () {
  "use strict";
  var STORE = "fa-drill";
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
    "dependency":  { label: "A dependency (Depends)",        lesson: "fastapi-dependencies" },
    "middleware":  { label: "Middleware",                    lesson: "fastapi-advanced" },
    "bg-task":     { label: "A background task",             lesson: "fastapi-advanced" },
    "lifespan":    { label: "The lifespan handler",          lesson: "fastapi-advanced" },
    "websocket":   { label: "A WebSocket",                   lesson: "fastapi-streaming" },
    "streaming":   { label: "Streaming response / SSE",      lesson: "fastapi-streaming" },
    "router":      { label: "An APIRouter",                  lesson: "fastapi-advanced" },
    "exc-handler": { label: "An exception handler",          lesson: "fastapi-production" }
  };

  var STATUS = {
    "200": { label: "200 OK",                    lesson: "fastapi-routing" },
    "201": { label: "201 Created",               lesson: "fastapi-routing" },
    "204": { label: "204 No Content",            lesson: "fastapi-routing" },
    "307": { label: "307 Temporary Redirect",    lesson: "fastapi-routing" },
    "401": { label: "401 Unauthorized",          lesson: "fastapi-auth" },
    "403": { label: "403 Forbidden",             lesson: "fastapi-auth" },
    "404": { label: "404 Not Found",             lesson: "fastapi-validation" },
    "422": { label: "422 Unprocessable Entity",  lesson: "fastapi-validation" }
  };

  var CAUSES = {
    "blocking-call":    { label: "Blocking call inside async def",            lesson: "fastapi-advanced" },
    "missing-await":    { label: "Forgot to await a coroutine",               lesson: "python-async" },
    "leaky-model":      { label: "No response_model filtering",               lesson: "fastapi-request-body" },
    "mutable-default":  { label: "Mutable default argument",                  lesson: "python-concepts" },
    "lazy-async":       { label: "Async lazy-load outside the session",       lesson: "fastapi-async-db" },
    "missing-commit":   { label: "Session never committed",                   lesson: "fastapi-databases" },
    "cors-missing":     { label: "CORS middleware missing",                   lesson: "fastapi-advanced" },
    "trailing-slash":   { label: "Trailing-slash 307 redirect",               lesson: "fastapi-routing" },
    "forgot-depends":   { label: "Annotated without Depends()",               lesson: "fastapi-dependencies" },
    "settings-uncached":{ label: "Settings re-parsed every request",          lesson: "fastapi-advanced" },
    "heavy-bg-task":    { label: "Heavy job in BackgroundTasks",              lesson: "fastapi-advanced" },
    "val-misread":      { label: "Misread the 422 loc field",                 lesson: "fastapi-validation" }
  };

  /* ---------- bank: pick-the-tool ---------- */
  var PT_ITEMS = [
    { id: "pt-db-session", answer: "dependency", trapKey: "middleware",
      blurb: "Every endpoint that touches the database needs a session that's opened before the handler and reliably closed after the response.",
      why: "A yield dependency is exactly this shape: setup before, inject the value, teardown after — and only on routes that ask for it.",
      trap: "Middleware wraps EVERY request, even ones that never touch the DB — and it can't inject a typed session into your handler's arguments." },
    { id: "pt-request-id", answer: "middleware", trapKey: "dependency",
      blurb: "Stamp every request with an X-Request-ID header and echo it on every response — including 404s for routes that don't exist.",
      why: "Only middleware sees every request AND every response — even ones that never match a route.",
      trap: "A dependency only runs when a matched route declares it; unmatched 404s would sail past it." },
    { id: "pt-welcome-email", answer: "bg-task", trapKey: "lifespan",
      blurb: "After a successful signup, send a welcome email — but don't make the user wait for the SMTP round-trip.",
      why: "tasks.add_task(send_email, …) runs after the response goes out — quick fire-and-forget work, per request.",
      trap: "Lifespan runs ONCE at startup/shutdown — it has nothing to do with per-request work." },
    { id: "pt-ml-model", answer: "lifespan", trapKey: "dependency",
      blurb: "Load a 2-GB ML model into memory once when the server starts, and release it cleanly at shutdown.",
      why: "One-time startup/shutdown work is the lifespan context manager's whole job — everything before yield runs at boot, after yield at shutdown.",
      trap: "A dependency runs per REQUEST — you'd reload the model two gigabytes at a time, on every call." },
    { id: "pt-chat", answer: "websocket", trapKey: "streaming",
      blurb: "A live support chat: the browser sends messages AND receives them, over one long-lived connection.",
      why: "Two-way, long-lived communication is precisely a WebSocket: accept once, then receive/send in a loop.",
      trap: "Streaming and SSE are one-way — the server talks, the client only listens." },
    { id: "pt-csv", answer: "streaming", trapKey: "bg-task",
      blurb: "Export a 2-GB CSV: the download should start immediately without loading the file into RAM.",
      why: "StreamingResponse over a generator yields chunk after chunk — constant memory, instant first byte.",
      trap: "A background task runs AFTER the response — the client would get nothing to download at all." },
    { id: "pt-split-files", answer: "router", trapKey: "middleware",
      blurb: "main.py hit 1,500 lines. You want /users endpoints in one module and /items in another, then plug both in.",
      why: "APIRouter is the splitting tool: define routes per module, include_router() them into the app.",
      trap: "Middleware changes request handling — it does nothing for code organization." },
    { id: "pt-error-shape", answer: "exc-handler", trapKey: "middleware",
      blurb: "Every error your API returns — not-found, conflict, validation — must share one consistent JSON envelope.",
      why: "@app.exception_handler maps each exception type to one response shape, in one place.",
      trap: "Middleware could intercept responses, but you'd be re-parsing rendered errors — handlers catch the exceptions themselves." },
    { id: "pt-auth-check", answer: "dependency", trapKey: "middleware",
      blurb: "Some routes (not all) must reject requests without a valid token — and the handler wants the decoded user.",
      why: "An auth dependency runs only on routes that declare it AND injects the typed current_user straight into the handler.",
      trap: "Middleware is all-or-nothing per app/router, and it can't hand a typed user object into your function's signature." },
    { id: "pt-latency-log", answer: "middleware", trapKey: "dependency",
      blurb: "Log the latency of every single request, across all routers, with one piece of code.",
      why: "Timing wraps the whole request/response cycle — that's middleware's vantage point.",
      trap: "You'd have to attach the dependency to every route, and it still couldn't time the response leaving." },
    { id: "pt-llm-tokens", answer: "streaming", trapKey: "websocket",
      blurb: "Show an LLM's answer in the browser word by word as it's generated. The browser never sends anything back mid-answer.",
      why: "One-way server→client flow is SSE / StreamingResponse territory — plain HTTP, auto-reconnect for free with EventSource.",
      trap: "A WebSocket works but buys you a second direction you don't need — and you give up plain-HTTP simplicity to get it." },
    { id: "pt-resize-image", answer: "bg-task", trapKey: "streaming",
      blurb: "After responding 201 to an upload, generate the thumbnail versions — the client shouldn't wait for them.",
      why: "Post-response, quick, fire-and-forget — exactly what BackgroundTasks is for.",
      trap: "Streaming sends the RESPONSE in pieces; here the response is already done — the work comes after." },
    { id: "pt-versioning", answer: "router", trapKey: "middleware",
      blurb: "Ship /v2 with a breaking response shape while /v1 keeps working untouched.",
      why: "Two routers, two prefixes: include_router(v1, prefix=\"/v1\") and include_router(v2, prefix=\"/v2\").",
      trap: "Middleware rewriting paths to fake versions is a maintenance trap — versions are routing structure." },
    { id: "pt-live-scores", answer: "streaming", trapKey: "websocket",
      blurb: "A scores dashboard that only listens for server pushes and should reconnect automatically if the connection drops.",
      why: "SSE: one-way pushes over plain HTTP, and EventSource reconnects on its own.",
      trap: "WebSockets need hand-rolled reconnect logic — and the two-way channel would sit unused." },
    { id: "pt-pagination-params", answer: "dependency", trapKey: "router",
      blurb: "The same limit/offset query parameters, validated the same way, appear on twelve different list endpoints.",
      why: "Declare them once as a dependency and inject it everywhere — one definition, twelve users.",
      trap: "Routers group ENDPOINTS; they don't deduplicate shared parameter logic." },
    { id: "pt-redis-pool", answer: "lifespan", trapKey: "middleware",
      blurb: "Open a Redis connection pool when the app boots and close it gracefully when the app stops.",
      why: "Boot/shutdown resource management is the lifespan handler — setup before yield, cleanup after.",
      trap: "Middleware runs per request; opening a pool per request is the bug, not the design." }
  ];

  /* ---------- bank: status-codes ---------- */
  var SC_ITEMS = [
    { id: "sc-create", answer: "201", trapKey: "200",
      blurb: "POST /heroes succeeds — a brand-new row now exists in the database.",
      why: "Creation gets 201 Created — declare it with status_code=201 on the decorator.",
      trap: "200 'works', but 201 tells clients (and your docs) that something new now exists." },
    { id: "sc-delete", answer: "204", trapKey: "200",
      blurb: "DELETE /heroes/7 succeeds and there's nothing meaningful to send back.",
      why: "204 No Content: success with an intentionally empty body.",
      trap: "200 with an empty body is mixed signals — 204 says 'done, and silence is deliberate'." },
    { id: "sc-bad-type", answer: "422", trapKey: "404",
      blurb: "The route is /items/{item_id} with item_id: int — and a client requests /items/abc.",
      why: "The route MATCHES but \"abc\" fails int validation — FastAPI's signature 422 with a precise error body.",
      trap: "It's not a missing resource: the path matched fine, the DATA was wrong." },
    { id: "sc-no-token", answer: "401", trapKey: "403",
      blurb: "A request hits a protected route with no Authorization header at all.",
      why: "401 Unauthorized = 'I don't know who you are' — authentication failed or missing (plus WWW-Authenticate).",
      trap: "403 is for callers you KNOW but won't allow — no credentials means 401." },
    { id: "sc-not-admin", answer: "403", trapKey: "401",
      blurb: "A valid, logged-in user tries to delete another user's data — and they're not an admin.",
      why: "403 Forbidden = 'I know exactly who you are, and the answer is no.' Authorization, not authentication.",
      trap: "401 would tell the client to re-login — but logging in again won't make them an admin." },
    { id: "sc-missing-row", answer: "404", trapKey: "422",
      blurb: "GET /heroes/999 — the id parses perfectly as an int, but no such hero exists.",
      why: "Validation passed; the RESOURCE is absent. raise HTTPException(status_code=404).",
      trap: "422 is for malformed input — '999' was a perfectly valid int." },
    { id: "sc-trailing-slash", answer: "307", trapKey: "404",
      blurb: "Your route is declared as /items/ but a client calls /items — and something odd shows in the logs.",
      why: "FastAPI (via Starlette) answers with a 307 redirect to the slashed path; most clients follow it silently.",
      trap: "It's not missing — it's one slash away, and the framework says so with a redirect." },
    { id: "sc-get-ok", answer: "200", trapKey: "201",
      blurb: "GET /heroes returns the list of heroes, no drama.",
      why: "Plain success reading data: 200 OK, the default.",
      trap: "201 is reserved for requests that CREATE something." },
    { id: "sc-missing-field", answer: "422", trapKey: "404",
      blurb: "POST /signup arrives without the required email field in the JSON body.",
      why: "Pydantic rejects the body before your code runs: 422, loc [\"body\", \"email\"], type 'missing'.",
      trap: "Nothing is missing on the SERVER — the request body failed validation; in FastAPI that's 422 (not 400, not 404)." },
    { id: "sc-put-ok", answer: "200", trapKey: "204",
      blurb: "PUT /heroes/7 succeeds and returns the updated hero so the client can re-render it.",
      why: "You're sending a body back — that's a 200 with content.",
      trap: "204 promises NO content — returning a body with it is a contract violation." },
    { id: "sc-expired", answer: "401", trapKey: "403",
      blurb: "The JWT in the Authorization header expired ten minutes ago.",
      why: "Expired credentials = failed authentication = 401, inviting the client to re-authenticate.",
      trap: "403 says 'valid identity, refused anyway' — an expired token means identity is NOT established." },
    { id: "sc-enum", answer: "422", trapKey: "404",
      blurb: "A query param is declared Literal[\"asc\", \"desc\"] and a client sends ?order=sideways.",
      why: "Enum/Literal violations are validation errors: 422 with the allowed values listed in the error.",
      trap: "The route exists and matched — only the VALUE was out of bounds." },
    { id: "sc-login-ok", answer: "200", trapKey: "201",
      blurb: "POST /token: the password checks out and you return the access token.",
      why: "Logging in returns a token in the body — 200. Nothing persistent was created.",
      trap: "201 implies a stored resource came into being; a stateless JWT isn't one." },
    { id: "sc-empty-list", answer: "200", trapKey: "404",
      blurb: "GET /heroes?team=none matches zero heroes. What goes with the empty list?",
      why: "An empty collection is still a successful answer: 200 and [].",
      trap: "404 would mean the ENDPOINT/resource doesn't exist — an empty result set does exist; it's just empty." },
    { id: "sc-patch-silent", answer: "204", trapKey: "200",
      blurb: "PATCH /settings applies the change; you've decided the response should carry no body at all.",
      why: "Success + deliberately empty body = 204 No Content.",
      trap: "200-with-nothing leaves clients guessing whether a body was supposed to be there." },
    { id: "sc-wrong-pass", answer: "401", trapKey: "422",
      blurb: "POST /token with a well-formed body — but the password is simply wrong.",
      why: "The body VALIDATED fine; the credentials failed. That's authentication: 401.",
      trap: "422 is about the SHAPE of the request — a wrong password is perfectly shaped, just false." }
  ];

  /* ---------- bank: debug-it ---------- */
  var DB_ITEMS = [
    { id: "db-freeze", answer: "blocking-call", trapKey: "heavy-bg-task",
      blurb: "One endpoint calls time.sleep(3) inside async def. Under load, EVERY endpoint — even unrelated ones — goes slow.",
      why: "A sync call inside async def blocks the event loop itself; every coroutine on it stalls. Make it async, or use a def endpoint (threadpool).",
      trap: "No background task here — the symptom 'one endpoint poisons all of them' is the loop being held hostage." },
    { id: "db-coroutine-obj", answer: "missing-await", trapKey: "blocking-call",
      blurb: "A response contains \"&lt;coroutine object get_data&gt;\" and the logs warn: 'coroutine was never awaited'.",
      why: "Calling an async function returns a coroutine OBJECT until you await it. The warning says it verbatim.",
      trap: "Nothing is blocked — the call simply never ran." },
    { id: "db-password-leak", answer: "leaky-model", trapKey: "val-misread",
      blurb: "GET /users/7 works fine… and the JSON includes hashed_password.",
      why: "Without response_model (or with the table model as the response), every column serializes. Declare a public schema as response_model.",
      trap: "No validation error occurred — the response was just never filtered." },
    { id: "db-shared-list", answer: "mutable-default", trapKey: "settings-uncached",
      blurb: "A helper declared as def add_tag(tags: list = []) keeps accumulating values across completely separate requests.",
      why: "Default values evaluate ONCE at definition — every call without the arg shares the same list. Use None and create inside.",
      trap: "Settings aren't involved — it's the classic Python default-argument trap." },
    { id: "db-greenlet", answer: "lazy-async", trapKey: "missing-await",
      blurb: "Accessing hero.team after the request returns raises MissingGreenlet in an async app.",
      why: "Async SQLAlchemy can't lazy-load outside the session/greenlet context — eager-load with selectinload() or query it explicitly.",
      trap: "There's nothing to await on an attribute access — the relationship was never loaded." },
    { id: "db-vanish", answer: "missing-commit", trapKey: "lazy-async",
      blurb: "POST /heroes returns 201 with the new hero… but the row never shows up in the database.",
      why: "session.add() only stages the object — without session.commit() the transaction rolls back when the session closes.",
      trap: "Reading relationships isn't the issue; the WRITE was never made permanent." },
    { id: "db-cors", answer: "cors-missing", trapKey: "trailing-slash",
      blurb: "The browser console says 'blocked by CORS policy', but the exact same request works perfectly from curl.",
      why: "CORS is a BROWSER protection: without CORSMiddleware allowing your front-end's origin, the browser refuses the response. curl doesn't care.",
      trap: "A redirect would show in curl too — browser-only failure is the CORS signature." },
    { id: "db-307", answer: "trailing-slash", trapKey: "cors-missing",
      blurb: "Logs show every request to /items answered 307 before the real 200, and one strict client errors out.",
      why: "The route was declared /items/ — Starlette redirects the slashless path with a 307. Match your declared and called paths.",
      trap: "CORS failures don't produce 307s — that's the framework's slash redirect." },
    { id: "db-default-dep", answer: "forgot-depends", trapKey: "missing-await",
      blurb: "Your 'dependency' never runs — the endpoint receives the raw function object itself as the parameter value.",
      why: "Annotated[Session, get_session] is just metadata — FastAPI only resolves it wrapped as Depends(get_session).",
      trap: "Await isn't the issue: FastAPI was never told this annotation IS a dependency." },
    { id: "db-slow-settings", answer: "settings-uncached", trapKey: "blocking-call",
      blurb: "Every request re-reads .env and re-validates the Settings model — profiling shows it in every trace.",
      why: "Build Settings once — module level or an @lru_cache'd get_settings() dependency — not per request.",
      trap: "It's repeated WORK, not a blocked loop — the fix is caching the object, not async." },
    { id: "db-video", answer: "heavy-bg-task", trapKey: "blocking-call",
      blurb: "Video transcoding runs via tasks.add_task. The server pegs CPU, requests time out, and jobs vanish on every restart.",
      why: "BackgroundTasks runs in-process: heavy/critical jobs need a real queue (Celery, ARQ) with workers and retries.",
      trap: "Even made 'async', the work still lives inside your web process — wrong home for it." },
    { id: "db-loc", answer: "val-misread", trapKey: "leaky-model",
      blurb: "A 422 says [\"body\", \"age\"] — but a teammate spent an hour 'fixing' the age QUERY parameter.",
      why: "The loc array names the exact place: body → field age. Read it like a file path before touching code.",
      trap: "Nothing leaked — the error envelope was telling the truth and got skimmed." }
  ];

  /* ---------- mode registry ---------- */
  var MODES = {
    "pick-the-tool": {
      title: "Pick the tool — the FastAPI judgment call", vocab: TOOLS, items: PT_ITEMS, secs: 45,
      fixed: ["dependency", "middleware", "bg-task", "lifespan", "websocket", "streaming", "router", "exc-handler"],
      lead: "Read the scenario, pick the right mechanism in under {secs} seconds — dependency vs middleware vs background task is the call you'll make every week. {count} questions per round."
    },
    "status-codes": {
      title: "Status codes — speed round", vocab: STATUS, items: SC_ITEMS, secs: 30,
      fixed: ["200", "201", "204", "307", "401", "403", "404", "422"],
      lead: "Read the situation, name the status code in under {secs} seconds. 401 vs 403, 404 vs 422 — the pairs that separate clean APIs from confusing ones. {count} questions per round."
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
    var mode = MODES[cfg.mode] ? cfg.mode : "pick-the-tool";
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
