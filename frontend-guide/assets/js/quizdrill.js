/* ============================================================
   Frontend Field Guide — quiz drills (.trainer)
   Timed chip quizzes for the judgment frontend interviews test:
     "server-or-client" — where does this code run / belong?
     "pick-the-tool"    — where should this state/data live?
     "debug-it"         — read the symptom, name the fix
   Best scores persist to localStorage["fe-drill"].
   Offline, no deps, theme-aware, honors prefers-reduced-motion.

   Authoring:
     <div class="trainer" data-trainer>
       <script type="application/json" class="trainer-config">
       { "mode": "server-or-client", "count": 10 }
       </script>
     </div>
   Config: mode "server-or-client"|"pick-the-tool"|"debug-it",
   count = questions per round (default 10), secs = seconds per
   question (default 30/45/45).
   ============================================================ */
(function () {
  "use strict";
  var STORE = "fe-drill";
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
  var BOUNDS = {
    "server":   { label: "Server Component",   lesson: "nx-rsc" },
    "client":   { label: "Client Component",   lesson: "nx-rsc" },
    "either":   { label: "Either / shared",    lesson: "nx-rsc" },
    "action":   { label: "Server Action",      lesson: "nx-actions" },
    "cache":    { label: "\"use cache\"",      lesson: "nx-data" },
    "suspense": { label: "Suspense boundary",  lesson: "pe-streaming" }
  };

  var TOOLS = {
    "useState": { label: "Local useState",            lesson: "da-decision" },
    "query":    { label: "TanStack Query",            lesson: "da-query" },
    "zustand":  { label: "Zustand store",             lesson: "da-zustand" },
    "url":      { label: "URL (params / search)",     lesson: "da-decision" },
    "form":     { label: "react-hook-form + Zod",     lesson: "da-forms" },
    "context":  { label: "Context",                   lesson: "re-composition" },
    "action":   { label: "Server Action",             lesson: "nx-actions" },
    "derive":   { label: "Derive it — no state",      lesson: "da-decision" }
  };

  var FIXES = {
    "add-dep":           { label: "Add the missing dependency",          lesson: "re-effect" },
    "effect-event":      { label: "useEffectEvent for that value",       lesson: "re-effect" },
    "fn-update":         { label: "Functional update — set(v => …)",     lesson: "re-hooks" },
    "stable-key":        { label: "A stable key (not the index)",        lesson: "re-render" },
    "move-state":        { label: "Move the state down / split",         lesson: "re-render" },
    "derive":            { label: "Derive it — delete the state",        lesson: "re-effect" },
    "use-shallow":       { label: "useShallow on the selector",          lesson: "da-zustand" },
    "cleanup":           { label: "Cleanup: abort / ignore stale",       lesson: "re-effect" },
    "stable-identity":   { label: "Memoize / hoist the object",          lesson: "re-hooks" },
    "transition":        { label: "useTransition — mark non-urgent",     lesson: "pe-vitals" },
    "suspense-boundary": { label: "Add a Suspense boundary",             lesson: "pe-streaming" },
    "invalidate":        { label: "invalidateQueries after mutate",      lesson: "da-query" }
  };

  /* ---------- bank: server-or-client ---------- */
  var SC_ITEMS = [
    { id: "sc-blog", answer: "server", trapKey: "client",
      blurb: "Render a markdown blog post fetched from the CMS. No interactivity at all.",
      why: "No state, no event handlers, data lives on the server — the default Server Component renders it and ships zero JS.",
      trap: "A Client Component works, but you'd ship the markdown renderer to every visitor's browser for nothing." },
    { id: "sc-dropdown", answer: "client", trapKey: "server",
      blurb: "A dropdown menu that opens and closes when the user clicks it.",
      why: "onClick + useState only exist in the browser — interactivity is exactly what \"use client\" is for.",
      trap: "The server renders HTML once; it can't respond to a click that happens later in the browser." },
    { id: "sc-cookie", answer: "server", trapKey: "client",
      blurb: "Read the session cookie and greet the user by name at the top of the page.",
      why: "cookies() is a server-side request API — read it in a Server Component and render the name into the HTML.",
      trap: "Parsing session cookies in the browser ships auth logic to the client and flashes a loading state for data the server already had." },
    { id: "sc-insert", answer: "action", trapKey: "client",
      blurb: "A form that inserts a row into Postgres when submitted.",
      why: "A \"use server\" function is a typed mutation endpoint: the form posts to it, it touches the DB, and it works before JS loads.",
      trap: "A client fetch to an API route works, but you hand-build the endpoint, lose progressive enhancement, and type-safety ends at the wire." },
    { id: "sc-wizard", answer: "client", trapKey: "either",
      blurb: "A multi-step wizard that tracks the current step as the user clicks Next.",
      why: "Current step is interactive client state — useState in a Client Component.",
      trap: "Shared modules carry no directive, but this one needs hooks and clicks: it must run in the browser." },
    { id: "sc-util", answer: "either", trapKey: "server",
      blurb: "A pure formatPrice(cents) helper imported by both a page and a button component.",
      why: "Pure utilities carry no directive — the bundler includes them wherever they're imported, server or client.",
      trap: "Nothing about it is server-only; pinning it would just block client imports." },
    { id: "sc-mdlib", answer: "server", trapKey: "client",
      blurb: "Render docs pages with a heavy 300 kB markdown/syntax-highlighting library.",
      why: "Keep heavy render-only dependencies in Server Components — the library runs at render time and never enters the bundle.",
      trap: "On the client that 300 kB downloads, parses, and hydrates on every visit." },
    { id: "sc-reviews", answer: "suspense", trapKey: "cache",
      blurb: "The reviews panel is slow, but the rest of the product page should paint instantly.",
      why: "Wrap the slow subtree in a Suspense boundary: the shell streams immediately, reviews stream in when ready.",
      trap: "\"use cache\" speeds up REPEAT renders; the first visitor still waits unless you stream around the slowness." },
    { id: "sc-catalog", answer: "cache", trapKey: "server",
      blurb: "The category list is identical for every visitor and can be an hour stale.",
      why: "\"use cache\" memoizes the rendered output with a cache-life profile — compute once an hour, serve everyone from cache.",
      trap: "It IS a Server Component — but the mechanism that makes it cheap is the caching directive." },
    { id: "sc-hover", answer: "client", trapKey: "server",
      blurb: "Track the mouse position to float a hover preview card under the cursor.",
      why: "Pointer events and per-move state are browser-only — Client Component.",
      trap: "There's no mouse on the server." },
    { id: "sc-delete", answer: "action", trapKey: "cache",
      blurb: "A delete button that removes a todo and refreshes the list with the new truth.",
      why: "A Server Action does the write, then revalidates — the list re-renders from fresh data in one round trip.",
      trap: "Caching can't help a WRITE; it's the mutation path that needs the server function." },
    { id: "sc-filter", answer: "server", trapKey: "client",
      blurb: "Read ?category=shoes from the URL and render the filtered product grid.",
      why: "searchParams arrive with the request — filter and render on the server, ship finished HTML.",
      trap: "Client-side filtering means shipping ALL products to the browser first." },
    { id: "sc-like", answer: "client", trapKey: "action",
      blurb: "A like button whose heart fills instantly, before the server confirms.",
      why: "Instant feedback is client interactivity — useOptimistic in a Client Component (which then calls the action).",
      trap: "The mutation IS a Server Action, but the asked-for instant UI lives in the client component wrapping it." },
    { id: "sc-chart", answer: "client", trapKey: "server",
      blurb: "An interactive analytics chart with tooltips, zoom, and brushing.",
      why: "Continuous interaction = client. Render the page around it on the server; the chart island is \"use client\".",
      trap: "The server could render a static SVG, but tooltips and zoom need a live DOM." },
    { id: "sc-shell", answer: "suspense", trapKey: "client",
      blurb: "Three dashboard panels hit three slow services; the layout should appear immediately.",
      why: "One Suspense boundary per panel: the static shell streams first, each panel pops in as its data lands.",
      trap: "Client-side fetching also shows a shell — plus three spinners, three round trips, and a JS bundle." },
    { id: "sc-nav", answer: "client", trapKey: "either",
      blurb: "A nav bar that highlights whichever route is currently active.",
      why: "usePathname is a client hook — the highlight depends on live navigation state.",
      trap: "It renders on both during SSR, but the hook forces the \"use client\" directive." }
  ];

  /* ---------- bank: pick-the-tool ---------- */
  var PT_ITEMS = [
    { id: "pt-modal", answer: "useState", trapKey: "zustand",
      blurb: "Is the delete-confirmation modal open right now?",
      why: "One component cares, it resets on unmount — local useState is the whole answer.",
      trap: "A global store for a local boolean is the classic over-reach; you'd leak open-state across screens." },
    { id: "pt-users", answer: "query", trapKey: "zustand",
      blurb: "The user list from GET /users, shown on three different pages.",
      why: "Server data belongs in the server cache: TanStack Query dedupes, caches by key, and background-refreshes it.",
      trap: "Copying API data into Zustand makes YOU write the caching, refetching, and invalidation Query ships with." },
    { id: "pt-cart", answer: "zustand", trapKey: "context",
      blurb: "Cart contents: updated from product pages, read by the header badge and checkout.",
      why: "True global client state with frequent writes — a Zustand store with per-selector subscriptions keeps re-renders surgical.",
      trap: "Context re-renders every consumer on every change and needs a provider tree — wrong tool for chatty writes." },
    { id: "pt-filters", answer: "url", trapKey: "useState",
      blurb: "Search filters + page number that must survive refresh and be shareable as a link.",
      why: "\"Shareable\" and \"survives refresh\" are the URL's exact superpowers — searchParams are the state.",
      trap: "useState dies on refresh and can't be sent to a teammate." },
    { id: "pt-signup", answer: "form", trapKey: "useState",
      blurb: "A 12-field signup form with per-field validation rules and error messages.",
      why: "react-hook-form keeps fields uncontrolled (no re-render per keystroke) and a Zod schema validates the lot.",
      trap: "12 useStates re-render the whole form on every keypress and you hand-roll every rule." },
    { id: "pt-fullname", answer: "derive", trapKey: "useState",
      blurb: "fullName, shown next to the firstName and lastName inputs.",
      why: "It's computable from existing state — derive it during render. No state, no syncing, no bug.",
      trap: "Storing it means a second source of truth you must keep in sync with an effect — the classic smell." },
    { id: "pt-locale", answer: "context", trapKey: "zustand",
      blurb: "The locale, chosen at startup, read by nearly every component, almost never changes.",
      why: "Broadly read + rarely written is Context's sweet spot — no store machinery needed.",
      trap: "Zustand works, but for a write-once value the built-in is simpler and dependency-free." },
    { id: "pt-checkout", answer: "action", trapKey: "query",
      blurb: "Submit the checkout: the server must validate the cart and write the order.",
      why: "A Server Action is the typed, progressively-enhanced mutation path in the App Router.",
      trap: "useMutation is the SPA answer; with Server Actions you skip the hand-built API route." },
    { id: "pt-search", answer: "query", trapKey: "useState",
      blurb: "Search results that should be cached per query string and deduped across components.",
      why: "queryKey: ['search', q] gives you per-query caching, deduping, and staleness control for free.",
      trap: "useState + fetch caches nothing — back/forward repeats every request." },
    { id: "pt-undo", answer: "zustand", trapKey: "context",
      blurb: "Undo/redo history for a drawing canvas, driven from global toolbars.",
      why: "Frequent structured writes + reads from distant components — a store (with its history array) fits exactly.",
      trap: "Context would re-render every subscriber on every brushstroke." },
    { id: "pt-accordion", answer: "useState", trapKey: "url",
      blurb: "Which accordion row is expanded — only this list cares, nobody links to it.",
      why: "Ephemeral, local, unshared: useState in the list component.",
      trap: "The URL is for state worth sharing; ?open=3 on every accordion is noise." },
    { id: "pt-tab", answer: "url", trapKey: "useState",
      blurb: "The selected tab on the settings page — users bookmark specific tabs.",
      why: "\"Bookmarkable\" decides it: put the tab in the URL (path or searchParam).",
      trap: "useState forgets on refresh — the bookmark always lands on tab one." },
    { id: "pt-username", answer: "form", trapKey: "query",
      blurb: "An async username-availability check with per-field errors on a big form.",
      why: "Async validators and per-field error state are form-library territory — RHF + Zod handles both.",
      trap: "Query caches server READS; wiring it per-keystroke into field errors re-builds a form library badly." },
    { id: "pt-badge", answer: "derive", trapKey: "useState",
      blurb: "An \"even / odd\" badge computed from the count state.",
      why: "count % 2 in render. Anything computable from existing state should never become state.",
      trap: "A second useState plus an effect to sync it is two bugs waiting." },
    { id: "pt-optimistic", answer: "query", trapKey: "zustand",
      blurb: "Optimistically add the new todo to the list, roll back if the POST fails.",
      why: "useMutation's onMutate/onError gives you snapshot, optimistic write, and rollback against the cached list.",
      trap: "In a store you'd hand-write the snapshot and rollback choreography Query already ships." },
    { id: "pt-wizardData", answer: "useState", trapKey: "zustand",
      blurb: "Form data passed between a wizard's four steps, discarded when it closes.",
      why: "Lift it to the wizard parent: one useState (or useReducer) scoped to the flow's lifetime.",
      trap: "A global store outlives the wizard — stale draft data greets the next opening." }
  ];

  /* ---------- bank: debug-it ---------- */
  var DBG_ITEMS = [
    { id: "dbg-timer", answer: "fn-update", trapKey: "add-dep",
      blurb: "The interval timer climbs to 1 and freezes there.",
      why: "The callback closed over the first render's count. setCount(c => c + 1) never needs the stale value.",
      trap: "Adding count to the deps 'works' by tearing the interval down every second — the functional update is the real fix." },
    { id: "dbg-swap", answer: "stable-key", trapKey: "stable-identity",
      blurb: "Delete the first row and the rows below it show the wrong content / input values.",
      why: "key={index} re-labels every row when the list shifts, so React reuses the wrong state. Key by the item's id.",
      trap: "No memoization issue here — React's reconciliation was simply given misleading identities." },
    { id: "dbg-memo", answer: "stable-identity", trapKey: "move-state",
      blurb: "A memo'd Row re-renders on every parent render anyway.",
      why: "An inline object/function prop gets a fresh reference each render; memo's shallow compare always sees 'changed'. Hoist or memoize it.",
      trap: "Moving state helps when the parent re-renders too often — here the parent may re-render fine; the PROP identity is the leak." },
    { id: "dbg-table", answer: "move-state", trapKey: "transition",
      blurb: "Typing in the search box re-renders the entire 2,000-row table on every keystroke.",
      why: "The input's state lives too high. Move it down (or split components) so keystrokes re-render only the input.",
      trap: "useTransition masks the jank but the table still re-renders 2,000 rows per key — fix the state's home first." },
    { id: "dbg-socket", answer: "effect-event", trapKey: "add-dep",
      blurb: "The chat socket reconnects every time the user toggles the theme (the effect reads theme for a log line).",
      why: "theme is non-reactive logic inside a reactive effect. useEffectEvent reads the latest value without joining the deps.",
      trap: "Adding theme to the deps is what CAUSES the reconnect — the linter is right that it's read, wrong that you want to re-sync on it." },
    { id: "dbg-stale", answer: "add-dep", trapKey: "effect-event",
      blurb: "Navigate from /users/1 to /users/2 and the page still shows user 1's profile.",
      why: "The fetch effect has [] deps, so it ran once. id belongs in the dependency array — new id, new sync.",
      trap: "useEffectEvent is for values that shouldn't RE-RUN the effect; the id absolutely should." },
    { id: "dbg-total", answer: "derive", trapKey: "add-dep",
      blurb: "The cart total in state keeps drifting out of sync with the items prop.",
      why: "Total is computable — derive it during render and the 'sync' problem ceases to exist.",
      trap: "Fixing the effect's deps narrows the window but keeps two sources of truth." },
    { id: "dbg-race", answer: "cleanup", trapKey: "add-dep",
      blurb: "Type fast and the results list shows answers for an OLDER query.",
      why: "Out-of-order responses: the effect needs a cleanup that aborts or flags the previous request as stale.",
      trap: "The deps are correct — every keystroke re-ran the effect; what's missing is killing the previous run." },
    { id: "dbg-zustand", answer: "use-shallow", trapKey: "stable-identity",
      blurb: "A Zustand selector returning { user, cart } re-renders the component on EVERY store change.",
      why: "The selector builds a fresh object each time, failing the equality check. useShallow compares contents.",
      trap: "It IS an identity problem, but the store-level fix is the shallow comparator, not memoizing call sites." },
    { id: "dbg-stale-list", answer: "invalidate", trapKey: "cleanup",
      blurb: "The POST succeeds, but the todo list still shows the old data until a full refresh.",
      why: "The cache doesn't know the server changed: invalidateQueries(['todos']) after the mutation triggers the refetch.",
      trap: "No race here — the GET was right when it ran; it just was never told to run again." },
    { id: "dbg-jank", answer: "transition", trapKey: "move-state",
      blurb: "Each keystroke filters 10,000 items; typing feels janky even though the input state is local.",
      why: "Mark the list update as non-urgent with useTransition — keystrokes stay snappy, the heavy render yields.",
      trap: "The state already lives in the right place; the RENDER is just expensive and needs lower priority." },
    { id: "dbg-blank", answer: "suspense-boundary", trapKey: "transition",
      blurb: "The whole page shows nothing until the slowest panel's data resolves.",
      why: "Everything sits in one blocking tree. A Suspense boundary around the slow part lets the rest stream and paint first.",
      trap: "useTransition schedules CLIENT updates; getting first paint out earlier is a streaming-boundary job." }
  ];

  /* ---------- mode registry ---------- */
  var MODES = {
    "server-or-client": {
      title: "Server or client? — boundary calls", vocab: BOUNDS, items: SC_ITEMS, secs: 30,
      fixed: ["server", "client", "either", "action", "cache", "suspense"],
      lead: "Read the requirement, make the App Router's defining call in under {secs} seconds — where does this run, and which mechanism owns it? {count} questions per round."
    },
    "pick-the-tool": {
      title: "Pick the tool — where does state live?", vocab: TOOLS, items: PT_ITEMS, secs: 45,
      fixed: ["useState", "query", "zustand", "url", "form", "context", "action", "derive"],
      lead: "Read the scenario, pick where that state or data should live in under {secs} seconds — the decision guide, on a clock. {count} questions per round."
    },
    "debug-it": {
      title: "Debug it — name the fix", vocab: FIXES, items: DBG_ITEMS, secs: 45, chips: 8,
      lead: "Read the symptom, name the ONE fix in under {secs} seconds — stale closures, identity leaks, races, and cache lies, weaponized. {count} questions per round."
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
    var mode = MODES[cfg.mode] ? cfg.mode : "server-or-client";
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
