/* ============================================================
   Go — a visual guide — quiz drills (.trainer)
   Timed chip quizzes for the judgment Go interviews actually test:
     "spot-the-bug"        — read a symptom, name the gotcha
     "pick-the-primitive"  — read a scenario, pick the sync tool
     "fix-it-how"          — read a buggy design, choose the move
   Best scores persist to localStorage["go-drill"].
   Offline, no deps, theme-aware, honors prefers-reduced-motion.

   Authoring:
     <div class="trainer" data-trainer>
       <script type="application/json" class="trainer-config">
       { "mode": "spot-the-bug", "count": 10 }
       </script>
     </div>
   Config: mode "spot-the-bug"|"pick-the-primitive"|"fix-it-how",
   count = questions per round (default 10), secs = seconds per
   question (default per-mode).
   ============================================================ */
(function () {
  "use strict";
  var STORE = "go-drill";
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
  /* the gotcha catalog (spot-the-bug answers) */
  var GOTCHAS = {
    "loopvar":      { label: "Loop-variable capture",            lesson: "co-goroutines" },
    "nil-iface":    { label: "nil interface ≠ nil pointer",      lesson: "ty-nil-iface" },
    "alias":        { label: "Slice re-slice aliasing",          lesson: "lang-slices" },
    "shared-app":   { label: "append onto a shared slice",       lesson: "lang-slices" },
    "map-order":    { label: "Map iteration order is random",    lesson: "lang-maps" },
    "nil-map":      { label: "Write to a nil map panics",        lesson: "lang-maps" },
    "defer-loop":   { label: "defer stacking up in a loop",      lesson: "lang-defer" },
    "defer-args":   { label: "defer args evaluated immediately", lesson: "lang-defer" },
    "range-copy":   { label: "range copies the element",         lesson: "lang-slices" },
    "receiver":     { label: "Value vs pointer receiver",        lesson: "ty-methods" },
    "send-closed":  { label: "Send on a closed channel",         lesson: "co-channels" },
    "uncomparable": { label: "Comparing uncomparable types",     lesson: "lang-structs" },
    "nil-chan":     { label: "nil channel blocks forever",       lesson: "co-channels" },
    "data-race":    { label: "Unsynchronized shared variable",   lesson: "co-memory" },
    "no-cancel":    { label: "Forgot to call cancel()",          lesson: "co-context" },
    "copy-mutex":   { label: "Copied a Mutex / WaitGroup",       lesson: "co-sync" },
    "wg-add":       { label: "WaitGroup.Add inside the goroutine",lesson: "co-sync" },
    "json-tags":    { label: "JSON: unexported / float64",       lesson: "std-json" }
  };

  /* the concurrency primitives (pick-the-primitive answers) */
  var PRIMITIVES = {
    "channel":   { label: "Channel",        lesson: "co-channels" },
    "mutex":     { label: "sync.Mutex",     lesson: "co-sync" },
    "rwmutex":   { label: "sync.RWMutex",   lesson: "co-sync" },
    "waitgroup": { label: "sync.WaitGroup", lesson: "co-sync" },
    "once":      { label: "sync.Once",      lesson: "co-sync" },
    "atomic":    { label: "atomic",         lesson: "co-memory" },
    "context":   { label: "context",        lesson: "co-context" },
    "errgroup":  { label: "errgroup",       lesson: "co-errgroup" }
  };

  /* the right moves (fix-it-how answers) */
  var FIXES = {
    "copy-slice":     { label: "copy() into a fresh slice",            lesson: "lang-slices" },
    "three-index":    { label: "Cap the re-slice: s[:n:n]",            lesson: "lang-slices" },
    "make-map":       { label: "make() the map before writing",       lesson: "lang-maps" },
    "ptr-receiver":   { label: "Use a pointer receiver",              lesson: "ty-methods" },
    "return-nil":     { label: "Return a nil error, not a typed nil", lesson: "ty-nil-iface" },
    "shadow-loopvar": { label: "Per-iteration var (1.22) / shadow it", lesson: "co-goroutines" },
    "defer-closure":  { label: "Defer a closure: defer func(){…}()",   lesson: "lang-defer" },
    "mutex-guard":    { label: "Guard it with a Mutex",               lesson: "co-sync" },
    "atomic-op":      { label: "Use an atomic operation",             lesson: "co-memory" },
    "defer-cancel":   { label: "defer cancel() right away",           lesson: "co-context" },
    "pass-pointer":   { label: "Share the lock by pointer",           lesson: "co-sync" },
    "add-before-go":  { label: "wg.Add before the go statement",      lesson: "co-sync" },
    "close-sender":   { label: "Close from the sole sender, once",    lesson: "co-channels" },
    "sort-keys":      { label: "Collect & sort the keys",             lesson: "lang-maps" },
    "errgroup-fix":   { label: "Use errgroup (wait + first error)",   lesson: "co-errgroup" },
    "select-timeout": { label: "select with a ctx.Done()/timeout",    lesson: "co-select" }
  };

  /* ---------- bank: spot-the-bug ---------- */
  var SB_ITEMS = [
    { id: "sb-loopvar", answer: "loopvar", trapKey: "range-copy",
      blurb: "Before Go 1.22: for _, u := range urls { go func(){ fetch(u) }() } — every goroutine fetches the SAME url.",
      why: "Pre-1.22 the loop variable was one shared cell; all the closures captured it and ran after the loop, seeing its final value.",
      trap: "range does copy each element — but the bug here is the single loop variable shared across closures, not the copy." },
    { id: "sb-nil-iface", answer: "nil-iface", trapKey: "receiver",
      blurb: "func do() error { var e *AppErr; return e } — callers find err != nil even though e is nil.",
      why: "An interface is (type, value). Returning a nil *AppErr stores a non-nil TYPE, so the error interface is non-nil.",
      trap: "Receiver kind is irrelevant here; the issue is the interface holding a concrete type with a nil value." },
    { id: "sb-shared-app", answer: "shared-app", trapKey: "alias",
      blurb: "b := a[:2]; b = append(b, 99) — and now a[2] is unexpectedly 99.",
      why: "b shares a's backing array and had spare cap, so append wrote in place — straight over a[2].",
      trap: "It IS aliasing, but the precise bug is appending into the shared array's spare capacity. Use a[:2:2] or copy." },
    { id: "sb-nil-map", answer: "nil-map", trapKey: "map-order",
      blurb: "var m map[string]int; m[\"x\"] = 1 → panic: assignment to entry in nil map.",
      why: "A nil map reads fine (zero values) but writing to one panics — it was never allocated with make.",
      trap: "Iteration order is a different map gotcha; this one panics purely because the map is nil." },
    { id: "sb-map-order", answer: "map-order", trapKey: "data-race",
      blurb: "A test prints a map and compares to a fixed string; it passes locally but fails in CI ~half the time.",
      why: "Go randomizes map iteration order on purpose. Any code that depends on it is a latent bug.",
      trap: "It looks flaky like a race, but a single-goroutine map range is simply unordered — sort the keys." },
    { id: "sb-defer-loop", answer: "defer-loop", trapKey: "defer-args",
      blurb: "for _, f := range files { fd, _ := os.Open(f); defer fd.Close() } — in a 10k-file loop.",
      why: "Defers fire when the FUNCTION returns, not each iteration — so thousands of fds stay open until the end.",
      trap: "Arg-evaluation timing is a real defer trap, but here the leak is defers piling up. Close inside a helper/closure per iteration." },
    { id: "sb-defer-args", answer: "defer-args", trapKey: "defer-loop",
      blurb: "x := 1; defer fmt.Println(x); x = 2 — it prints 1, not 2.",
      why: "A deferred call's arguments are evaluated when defer runs, not when the call fires — x was read as 1 immediately.",
      trap: "Nothing to do with loops; capture the final value with a closure: defer func(){ fmt.Println(x) }()." },
    { id: "sb-range-copy", answer: "range-copy", trapKey: "receiver",
      blurb: "for _, p := range people { p.Seen = true } — afterwards every Seen is still false.",
      why: "range copies each element into p; mutating the copy never touches the slice. Index it: people[i].Seen = true.",
      trap: "It isn't a receiver problem — range hands you a value copy, so the write is lost." },
    { id: "sb-receiver", answer: "receiver", trapKey: "nil-iface",
      blurb: "func (c Counter) Inc() { c.n++ } — calling Inc() a hundred times leaves n at 0.",
      why: "A value receiver operates on a COPY; the increment dies with it. Use a pointer receiver: func (c *Counter).",
      trap: "No interfaces involved; the method just mutated a copy of the struct." },
    { id: "sb-send-closed", answer: "send-closed", trapKey: "nil-chan",
      blurb: "After close(ch), a straggler goroutine does ch <- v → panic: send on closed channel.",
      why: "Sending on a closed channel always panics. Only the sole sender should close, and only after all sends.",
      trap: "A nil channel BLOCKS forever; a CLOSED one panics on send — different failure, different cause." },
    { id: "sb-uncomparable", answer: "uncomparable", trapKey: "map-order",
      blurb: "type Key struct{ tags []string }; m := map[Key]int{} → compile error: invalid map key type.",
      why: "Structs containing slices/maps/funcs are not comparable, so they can't be map keys or compared with ==.",
      trap: "Not about ordering — the type simply isn't comparable; use a comparable key (e.g. a joined string)." },
    { id: "sb-nil-chan", answer: "nil-chan", trapKey: "send-closed",
      blurb: "A select reads from a channel field that is still nil; the goroutine hangs and never makes progress.",
      why: "Send/recv on a nil channel block forever — handy to DISABLE a select case, deadly by accident.",
      trap: "A closed channel is the opposite — recv returns immediately. nil = blocks; closed = ready." },
    { id: "sb-data-race", answer: "data-race", trapKey: "loopvar",
      blurb: "One goroutine sets done = true; main loops `for !done {}` with no sync — and sometimes spins forever.",
      why: "Without a happens-before edge there's no guarantee main ever observes the write. -race flags it.",
      trap: "It isn't loop-var capture; it's an unsynchronized shared variable — use a channel, Mutex, or atomic." },
    { id: "sb-no-cancel", answer: "no-cancel", trapKey: "data-race",
      blurb: "ctx, _ := context.WithTimeout(parent, time.Second) — the cancel func is dropped; vet warns, timers leak.",
      why: "Every WithCancel/WithTimeout returns a cancel you MUST call (usually defer cancel()) to release resources.",
      trap: "No race here — it's a leak from never cancelling the context." },
    { id: "sb-copy-mutex", answer: "copy-mutex", trapKey: "receiver",
      blurb: "type Set struct{ mu sync.Mutex; m map[...] }; func (s Set) Add() { s.mu.Lock(); … }",
      why: "A value receiver COPIES the Mutex on every call — each call locks a different, useless lock. go vet flags it.",
      trap: "It looks like a plain value-receiver miss, but the danger is the copied Mutex. Use a pointer receiver." },
    { id: "sb-wg-add", answer: "wg-add", trapKey: "data-race",
      blurb: "for … { go func(){ wg.Add(1); work(); wg.Done() }() }; wg.Wait() — Wait sometimes returns too early.",
      why: "Add must run BEFORE the goroutine might be scheduled — call wg.Add(1) before the go statement, not inside it.",
      trap: "It manifests like a race, but the precise fix is ordering Add ahead of the goroutine." },
    { id: "sb-json", answer: "json-tags", trapKey: "map-order",
      blurb: "json.Unmarshal leaves your lowercase fields empty, and numbers decoded into map[string]any are float64.",
      why: "json only sees EXPORTED fields (and json tags); into an interface, all JSON numbers become float64.",
      trap: "Nothing to do with iteration order — export the fields / add tags, and expect float64 for untyped numbers." }
  ];

  /* ---------- bank: pick-the-primitive ---------- */
  var PP_ITEMS = [
    { id: "pp-wait-all", answer: "waitgroup", trapKey: "channel",
      blurb: "Launch N workers and block until ALL of them finish. You don't need their return values.",
      why: "sync.WaitGroup is exactly 'wait for N goroutines to finish' — Add(N), each Done(), then Wait().",
      trap: "A channel can signal completion, but WaitGroup is the direct, idiomatic tool for join-all." },
    { id: "pp-handoff", answer: "channel", trapKey: "mutex",
      blurb: "Stream jobs from one producer to a pool of consumers, with backpressure when consumers fall behind.",
      why: "A buffered channel IS the queue + backpressure: senders block when it's full, receivers when it's empty.",
      trap: "A Mutex guards shared state in place; it doesn't move values between goroutines." },
    { id: "pp-counter", answer: "atomic", trapKey: "mutex",
      blurb: "A hot request counter incremented by thousands of goroutines; you only ever Add and Load one int64.",
      why: "atomic.Int64 is lock-free for a single word — the lightest correct tool for one integer.",
      trap: "A Mutex is correct but heavier than needed when the shared state is a single machine word." },
    { id: "pp-map-guard", answer: "mutex", trapKey: "atomic",
      blurb: "Several goroutines read and write a shared map[string]T throughout a request.",
      why: "A map update is multi-word; serialize the critical section with a Mutex (or use sync.Map).",
      trap: "Atomics only cover a single word — they can't make a whole-map update safe." },
    { id: "pp-read-heavy", answer: "rwmutex", trapKey: "mutex",
      blurb: "A config map read on nearly every request but rewritten only once a minute.",
      why: "sync.RWMutex lets many readers proceed concurrently, taking the exclusive lock only for the rare write.",
      trap: "A plain Mutex serializes even readers — wasteful when reads vastly dominate writes." },
    { id: "pp-init-once", answer: "once", trapKey: "mutex",
      blurb: "A package-level client must be initialized exactly once, lazily, even if many goroutines call first concurrently.",
      why: "sync.Once.Do runs the init exactly once and makes the result visible to all callers.",
      trap: "A Mutex + bool can work but invites the double-checked-locking trap; Once is the idiom." },
    { id: "pp-cancel", answer: "context", trapKey: "channel",
      blurb: "Propagate a request deadline and cancellation down a deep call tree so in-flight work stops promptly.",
      why: "context carries cancellation + deadlines across API boundaries — the standard plumbing for it.",
      trap: "A done channel is the building block, but context standardizes deadline+cancel through the whole tree." },
    { id: "pp-fanout-err", answer: "errgroup", trapKey: "waitgroup",
      blurb: "Fan out 10 fetches; if ANY fails, cancel the rest and return the first error.",
      why: "errgroup.WithContext bundles wait + first-error + cancellation in a few lines.",
      trap: "A WaitGroup waits for all, but carries no error and no cancellation — you'd rebuild errgroup by hand." },
    { id: "pp-first-result", answer: "channel", trapKey: "waitgroup",
      blurb: "Race three replicas and take the FIRST response; abandon the slower two.",
      why: "A buffered channel collects results; the first receive wins and you move on.",
      trap: "WaitGroup waits for ALL to finish — the opposite of first-response-wins." },
    { id: "pp-semaphore", answer: "channel", trapKey: "atomic",
      blurb: "Cap outbound calls at no more than 5 concurrently in flight.",
      why: "A buffered channel of size 5 is a counting semaphore: acquire a token before, release after.",
      trap: "An atomic counter can count, but it can't BLOCK the sixth caller; the channel does." },
    { id: "pp-broadcast", answer: "channel", trapKey: "once",
      blurb: "Tell many waiting goroutines to stop, all at once.",
      why: "close(done): every receiver observes the closed channel simultaneously — the broadcast idiom.",
      trap: "Once runs an action a single time; it doesn't fan a signal out to many waiters." },
    { id: "pp-deadline", answer: "context", trapKey: "errgroup",
      blurb: "A handler must abort its own work if it runs longer than 2 seconds.",
      why: "context.WithTimeout gives a Done() channel that fires at the deadline; check it in your loops/selects.",
      trap: "errgroup adds cancellation across siblings, but the deadline itself comes from context." },
    { id: "pp-transfer", answer: "mutex", trapKey: "rwmutex",
      blurb: "Transferring between two account balances must update both fields with no one seeing a half-done state.",
      why: "Wrap the multi-field critical section in a Mutex so the transfer is atomic to observers.",
      trap: "RWMutex helps read-heavy loads, but a write transfer needs the exclusive lock anyway." },
    { id: "pp-collect", answer: "errgroup", trapKey: "channel",
      blurb: "Run 4 independent queries in parallel, collect all results, and fail fast on the first error.",
      why: "errgroup runs each with Go(), Wait() returns the first error and cancels the shared context.",
      trap: "Raw channels work, but you'd reimplement the error + cancel bookkeeping errgroup already gives you." },
    { id: "pp-flag", answer: "atomic", trapKey: "mutex",
      blurb: "A single boolean flag flipped and checked across goroutines — nothing else shared.",
      why: "atomic.Bool gives a race-free single-word flag with no locking.",
      trap: "A Mutex works but is overkill for one independent boolean." },
    { id: "pp-memoize", answer: "once", trapKey: "context",
      blurb: "Compute one expensive value the first time it's needed and reuse it safely thereafter.",
      why: "sync.Once.Do memoizes the computation exactly once under concurrency.",
      trap: "context is about cancellation/deadlines, not one-time memoization." }
  ];

  /* ---------- bank: fix-it-how ---------- */
  var FX_ITEMS = [
    { id: "fx-return-internal", answer: "copy-slice", trapKey: "three-index",
      blurb: "Your method returns a sub-slice of an internal buffer; later, callers' data mutates under them.",
      why: "Hand back an independent copy(make([]T,len), src) so the caller can't reach (or be reached through) your buffer.",
      trap: "A 3-index cap stops growth from clobbering, but the buffer is still shared for in-range writes — copy to fully detach." },
    { id: "fx-append-clobber", answer: "three-index", trapKey: "copy-slice",
      blurb: "A helper appends to a slice it was passed and occasionally clobbers the caller's next element.",
      why: "Cap the input with s[:n:n] so the very next append is forced to allocate a fresh array.",
      trap: "Copying works too, but the minimal fix to stop the clobber is forcing a realloc with the 3-index slice." },
    { id: "fx-nil-map", answer: "make-map", trapKey: "mutex-guard",
      blurb: "Writing to a struct's map field panics: 'assignment to entry in nil map'.",
      why: "Initialize the map (make) in the constructor or before first write — a nil map can be read but not written.",
      trap: "Locking can't help a map that was never allocated; the panic is about nil, not concurrency." },
    { id: "fx-value-receiver", answer: "ptr-receiver", trapKey: "mutex-guard",
      blurb: "Inc() on your counter type never changes the stored value.",
      why: "Use a pointer receiver, func (c *Counter) Inc(), so the method mutates the original, not a copy.",
      trap: "A Mutex addresses races, not why a value-receiver mutation is silently discarded." },
    { id: "fx-typed-nil", answer: "return-nil", trapKey: "ptr-receiver",
      blurb: "A function returns a nil *MyErr, yet every caller's `if err != nil` fires.",
      why: "Return a bare nil error (return nil) on success — never a typed nil pointer wrapped in the interface.",
      trap: "The receiver kind is unrelated; the interface is non-nil because it carries the *MyErr type." },
    { id: "fx-loopvar", answer: "shadow-loopvar", trapKey: "defer-closure",
      blurb: "On Go 1.21, all your spawned goroutines observe the last loop index.",
      why: "Add v := v inside the loop (or pass v as an argument); on 1.22+ the loop var is already per-iteration.",
      trap: "A closure wrapper fixes defer-arg timing, not loop-variable capture — you need a fresh binding per iteration." },
    { id: "fx-defer-arg", answer: "defer-closure", trapKey: "shadow-loopvar",
      blurb: "defer record(time.Since(start)) logs a near-zero duration instead of the elapsed time.",
      why: "Wrap it: defer func(){ record(time.Since(start)) }() — so the expression is evaluated when the defer runs.",
      trap: "Shadowing is for loop variables; this is about WHEN a deferred call's arguments are evaluated." },
    { id: "fx-multi-race", answer: "mutex-guard", trapKey: "atomic-op",
      blurb: "Two goroutines update several fields of a shared struct; -race lights up.",
      why: "Guard the whole multi-field critical section with a Mutex so updates are seen all-or-nothing.",
      trap: "Atomics fix single words; they can't make a multi-field update race-free." },
    { id: "fx-counter-race", answer: "atomic-op", trapKey: "mutex-guard",
      blurb: "A single int64 total is incremented from many goroutines and comes out short.",
      why: "Use atomic.AddInt64 / atomic.Int64 — a lock-free read-modify-write for one word.",
      trap: "A Mutex is correct but heavier than needed for a lone integer counter." },
    { id: "fx-no-cancel", answer: "defer-cancel", trapKey: "select-timeout",
      blurb: "go vet warns the context's cancel function is never used, and timers pile up under load.",
      why: "defer cancel() immediately after WithCancel/WithTimeout to release the context's resources on every path.",
      trap: "A timeout select is about waiting for work; it doesn't release the context you created." },
    { id: "fx-copy-mutex", answer: "pass-pointer", trapKey: "ptr-receiver",
      blurb: "A struct embeds sync.Mutex but is passed around by value; locking it protects nothing.",
      why: "Share one lock by pointer (store/pass *T and use pointer receivers) so all holders contend on the same Mutex.",
      trap: "Pointer receivers are part of it, but the root rule is: never copy a Mutex — share it by pointer." },
    { id: "fx-wg-add", answer: "add-before-go", trapKey: "pass-pointer",
      blurb: "wg.Wait() returns before the workers have actually run.",
      why: "Call wg.Add(1) BEFORE the go statement; adding inside the goroutine races with Wait.",
      trap: "Passing the WaitGroup by pointer matters too, but the early-return bug is Add ordering." },
    { id: "fx-double-close", answer: "close-sender", trapKey: "select-timeout",
      blurb: "Under load you hit 'panic: send on closed channel' (and sometimes a double close).",
      why: "Establish a single owner: only the sole sender closes, exactly once, after all sends are done.",
      trap: "A timeout case doesn't stop a second sender/close from panicking — fix ownership of the close." },
    { id: "fx-map-order", answer: "sort-keys", trapKey: "copy-slice",
      blurb: "Your report's line order changes every run because you range over a map.",
      why: "Collect the keys into a slice, sort them, then range the sorted keys for deterministic output.",
      trap: "Copying the slice doesn't impose an order — you must sort the keys explicitly." },
    { id: "fx-handrolled-fanout", answer: "errgroup-fix", trapKey: "add-before-go",
      blurb: "You hand-rolled WaitGroup + an error channel + cancel for parallel fetches and it's leaky and buggy.",
      why: "Replace the lot with errgroup.WithContext: Go() per task, Wait() returns the first error and cancels the rest.",
      trap: "Fixing Add-ordering doesn't give you error propagation or cancellation — that's what errgroup bundles." },
    { id: "fx-leaky-recv", answer: "select-timeout", trapKey: "close-sender",
      blurb: "A goroutine blocks forever waiting on a channel that may never deliver, leaking on every timeout.",
      why: "Give it an escape hatch: select over the channel AND ctx.Done()/time.After so it can give up and return.",
      trap: "Closing from the sender addresses send-on-closed, not a receiver that needs a way out." }
  ];

  /* ---------- mode registry ---------- */
  var MODES = {
    "spot-the-bug": {
      title: "Spot the bug — name the gotcha", vocab: GOTCHAS, items: SB_ITEMS, secs: 45, chips: 8,
      lead: "Read the Go symptom, name the gotcha in under {secs} seconds — the code-review reflex this guide builds. {count} questions per round."
    },
    "pick-the-primitive": {
      title: "Pick the primitive", vocab: PRIMITIVES, items: PP_ITEMS, secs: 40,
      fixed: ["channel", "mutex", "rwmutex", "waitgroup", "once", "atomic", "context", "errgroup"],
      lead: "Read the concurrency scenario, pick the ONE right primitive in under {secs} seconds. Channel vs Mutex vs WaitGroup vs atomic vs context vs errgroup — the confusables, on a clock. {count} questions per round."
    },
    "fix-it-how": {
      title: "Fix it — choose the move", vocab: FIXES, items: FX_ITEMS, secs: 45, chips: 8,
      lead: "You've spotted the bug — now choose the right fix in under {secs} seconds, with the tempting near-miss sitting right next to it. {count} questions per round."
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
    var mode = MODES[cfg.mode] ? cfg.mode : "spot-the-bug";
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
