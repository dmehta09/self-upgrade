/* ============================================================
   A Philosophy of Software Design — quiz drills (.trainer)
   Timed chip quizzes for the judgment the book actually trains:
     "spot-the-flag"      — read a symptom, name the red flag
     "pick-the-principle" — read a scenario, pick the principle
     "fix-it-how"         — read a smelly design, choose the move
   Best scores persist to localStorage["senior-backend-drill"].
   Offline, no deps, theme-aware, honors prefers-reduced-motion.

   Authoring:
     <div class="trainer" data-trainer>
       <script type="application/json" class="trainer-config">
       { "mode": "spot-the-flag", "count": 10 }
       </script>
     </div>
   Config: mode "spot-the-flag"|"pick-the-principle"|"fix-it-how",
   count = questions per round (default 10), secs = seconds per
   question (default 45).
   ============================================================ */
(function () {
  "use strict";
  var STORE = "senior-backend-drill";
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
  var FLAGS = {
    "shallow":          { label: "Shallow module",             lesson: "md-deep" },
    "leakage":          { label: "Information leakage",        lesson: "md-hiding" },
    "temporal":         { label: "Temporal decomposition",     lesson: "md-hiding" },
    "passthrough":      { label: "Pass-through method",        lesson: "md-layers" },
    "overexposure":     { label: "Overexposure",               lesson: "md-pull" },
    "vague-name":       { label: "Vague name",                 lesson: "cf-names" },
    "comment-echo":     { label: "Comment repeats the code",   lesson: "cf-comments" },
    "exception-normal": { label: "Exception for a normal case", lesson: "cf-errors" }
  };

  var PRINCIPLES = {
    "deep":           { label: "Make the module deep",            lesson: "md-deep" },
    "hide":           { label: "Hide the information",            lesson: "md-hiding" },
    "general":        { label: "Make it somewhat general-purpose", lesson: "md-general" },
    "pull-down":      { label: "Pull complexity downwards",       lesson: "md-pull" },
    "errors-away":    { label: "Define the error out of existence", lesson: "cf-errors" },
    "twice":          { label: "Design it twice",                 lesson: "jd-twice" },
    "comments-first": { label: "Write the comments first",        lesson: "cf-comments" },
    "strategic":      { label: "Invest — stay strategic",         lesson: "cx-tactical" }
  };

  var MOVES = {
    "collapse-layer":   { label: "Collapse the pass-through layer",       lesson: "md-layers" },
    "one-owner":        { label: "Give that knowledge one owner",         lesson: "md-hiding" },
    "together":         { label: "Bring the pieces together",            lesson: "md-pull" },
    "split-special":    { label: "Separate special from general",        lesson: "md-general" },
    "default-common":   { label: "Default the common case",              lesson: "md-pull" },
    "redefine":         { label: "Redefine semantics — no error case",   lesson: "cf-errors" },
    "rename":           { label: "Choose a precise name",                lesson: "cf-names" },
    "comment-contract": { label: "Write the contract comment",           lesson: "cf-comments" },
    "redesign-touched": { label: "Redesign the part you're touching",    lesson: "cf-modify" },
    "profile-first":    { label: "Profile before optimising",            lesson: "jd-perf" },
    "second-design":    { label: "Sketch a second, different design",    lesson: "jd-twice" },
    "deepen":           { label: "Swallow the rule into a deep method",  lesson: "md-deep" }
  };

  /* ---------- bank: spot-the-flag ---------- */
  var SF_ITEMS = [
    { id: "sf-getters", answer: "shallow", trapKey: "overexposure",
      blurb: "A class exposes get_x/set_x for every private field; callers re-implement the same update rules around them.",
      why: "The interface is nearly as big as the implementation and hides nothing — the definition of a shallow module.",
      trap: "Overexposure forces RARE features on common callers; here nothing is hidden in the first place." },
    { id: "sf-lockstep", answer: "leakage", trapKey: "temporal",
      blurb: "Changing the file format means editing the reader class AND the writer class — every single time.",
      why: "One design decision (the format) is reflected in two modules: the textbook leak, betrayed by lockstep changes.",
      trap: "Temporal decomposition is often the CAUSE — but the smell you observe (one decision, two homes) is leakage." },
    { id: "sf-steps", answer: "temporal", trapKey: "leakage",
      blurb: "The pipeline is organised as ReadStep, ValidateStep, TransformStep, WriteStep — one class per stage of execution.",
      why: "Structure mirrors the order things HAPPEN, not what each module KNOWS — knowledge gets scattered along the timeline.",
      trap: "It usually produces leakage downstream, but the structural smell — classes named after execution order — is temporal decomposition." },
    { id: "sf-forward", answer: "passthrough", trapKey: "shallow",
      blurb: "UserService.get_user(id) does nothing but call UserRepo.get_user(id) — same signature, nothing added.",
      why: "A method that forwards with the same interface adds a layer to learn without adding power: pass-through.",
      trap: "It IS shallow, but the precise flag for same-signature forwarding between layers is the pass-through method." },
    { id: "sf-config7", answer: "overexposure", trapKey: "shallow",
      blurb: "To create a client for the everyday case, callers must supply seven config values they don't understand.",
      why: "The common case forces callers to learn rarely-needed knobs — overexposure. Defaults should hide them.",
      trap: "The module may be deep inside; the smell is that its SETUP exposes rare complexity to everyone." },
    { id: "sf-tmp", answer: "vague-name", trapKey: "comment-echo",
      blurb: "A function called process() fills a list called tmp; you must read every line to know what it returns.",
      why: "process, tmp — names that create no image. Vague names are obscurity in disguise.",
      trap: "There's no comment at all here — the smell is the names forcing you to decode the body." },
    { id: "sf-incr", answer: "comment-echo", trapKey: "vague-name",
      blurb: "Above the line i += 1 sits the comment: “increment i by one.”",
      why: "The comment restates the code word for word — zero information, pure maintenance debt.",
      trap: "i is fine as a loop index; the noise is the comment that repeats it." },
    { id: "sf-eof", answer: "exception-normal", trapKey: "overexposure",
      blurb: "Every caller of read_line() wraps it in try/except for the end-of-file case — which happens on every file.",
      why: "EOF isn't exceptional, it's certain. Raising for a normal case multiplies handling code in every caller.",
      trap: "Nothing rare is being exposed — a NORMAL outcome was defined as an error." },
    { id: "sf-clamp", answer: "exception-normal", trapKey: "passthrough",
      blurb: "substring() raises on out-of-range indices, so every caller clamps its indices before calling it.",
      why: "Defining out-of-range as an error pushed work into every caller; returning the overlap defines the error away.",
      trap: "No forwarding here — the API's semantics manufacture an error callers must dodge." },
    { id: "sf-wide", answer: "shallow", trapKey: "vague-name",
      blurb: "A “helper” class has 30 public methods, each doing one tiny thing to the same dict.",
      why: "Thirty entry points over trivial behaviour: huge interface, little functionality — shallow.",
      trap: "“Helper” is indeed vague, but the structural smell is the interface-to-power ratio." },
    { id: "sf-dates", answer: "leakage", trapKey: "temporal",
      blurb: "The date format string \"%Y-%m-%d\" appears in four modules; changing it broke three of them.",
      why: "One decision living in four places — they were secretly coupled all along. Leakage.",
      trap: "There's no execution-order structure here — just duplicated knowledge." },
    { id: "sf-phases", answer: "temporal", trapKey: "leakage",
      blurb: "Setup is split into connect(), then prepare(), then finish() — they must run in exactly that order and pass half-built state along.",
      why: "Modules carved by WHEN things happen share state and order constraints — temporal decomposition.",
      trap: "The shared half-built state will leak knowledge, but the root smell is organising by time." },
    { id: "sf-handle", answer: "vague-name", trapKey: "shallow",
      blurb: "A method named handle() takes a dict called info and returns a dict called result.",
      why: "handle/info/result rule nothing out — the reader learns nothing until they read the implementation.",
      trap: "Depth can't save a module nobody can name precisely — and this one's smell is the words." },
    { id: "sf-sendstack", answer: "passthrough", trapKey: "leakage",
      blurb: "Each layer of the stack defines send(), which calls the next layer's send() with the same arguments.",
      why: "Same abstraction repeated down the stack: each layer adds interface, none adds value — pass-throughs.",
      trap: "Nothing secret is duplicated; the layers just fail to change the abstraction." },
    { id: "sf-push", answer: "comment-echo", trapKey: "vague-name",
      blurb: "The docstring of push() reads: “Pushes the item onto the stack by appending it to the list.”",
      why: "Half restates the name, half leaks the implementation — neither is what an interface comment is for.",
      trap: "push() is a fine, precise name; it's the comment that adds nothing." },
    { id: "sf-render", answer: "overexposure", trapKey: "shallow",
      blurb: "render(text) can't be called without also choosing a font engine, a hyphenation policy, and a cache strategy.",
      why: "Rare-case knobs made mandatory for the common case — the author should pick defaults and absorb them.",
      trap: "The implementation may be powerful; the smell is what the COMMON caller is forced to learn." }
  ];

  /* ---------- bank: pick-the-principle ---------- */
  var PP_ITEMS = [
    { id: "pp-rule-callers", answer: "deep", trapKey: "pull-down",
      blurb: "Every caller of Cursor must remember that “moving to a new line resets the column.”",
      why: "A rule leaking to every caller belongs inside one deep method (move_to_next_line) — small interface, rule hidden.",
      trap: "Close cousin — but the classic fix here is named by depth: swallow the rule behind a smaller interface." },
    { id: "pp-five-calls", answer: "deep", trapKey: "general",
      blurb: "Designing a file API. Option A: five calls that hide buffering and permissions. Option B: fourteen calls exposing each step.",
      why: "Benefit over cost: the small interface commanding big machinery is the deep choice — and the book's favourite example.",
      trap: "Both options could be 'general'; what separates them is interface size versus hidden power." },
    { id: "pp-format", answer: "hide", trapKey: "general",
      blurb: "Three classes parse the same config format; a change to the format touches all three.",
      why: "The format is one design decision — bury it in one module so changing it touches one place.",
      trap: "Generalising the parsers doesn't help while the knowledge still lives in three homes." },
    { id: "pp-windows", answer: "hide", trapKey: "deep",
      blurb: "A network client must handle timeouts, slow starts, and dropped packets — none of which callers should ever see.",
      why: "Those are design decisions to encapsulate: bury the protocol behind connect/send/recv and keep the freedom to change it.",
      trap: "The result will BE deep — but the operative principle for 'callers never see it' is information hiding." },
    { id: "pp-editor", answer: "general", trapKey: "deep",
      blurb: "You're writing text-editor operations for backspace and delete; cut and paste arrive next sprint.",
      why: "insert(pos, text) and delete(range) serve all four features — the somewhat-general interface is simpler AND deeper.",
      trap: "Depth is the outcome; the design move is choosing general primitives over per-feature methods." },
    { id: "pp-two-callers", answer: "general", trapKey: "hide",
      blurb: "Two features need almost-the-same text search; you're tempted to write two specialised copies.",
      why: "One somewhat-general function beats two special-purpose twins — fewer interfaces, no duplicated knowledge.",
      trap: "There's no secret to bury here; the choice is about the shape of the interface." },
    { id: "pp-defaults", answer: "pull-down", trapKey: "general",
      blurb: "Your HTTP client takes nine required constructor parameters; most callers copy-paste the same values.",
      why: "The author should pick sensible defaults and absorb that complexity — don't make every caller an expert.",
      trap: "It's already general — too much so for the common case. Pull the burden down into the module." },
    { id: "pp-retry", answer: "pull-down", trapKey: "deep",
      blurb: "Callers of send() must each implement their own retry and backoff logic.",
      why: "Retry policy is the module author's complexity to absorb once — not every caller's to reinvent.",
      trap: "Pulling it down WILL deepen send(), but the principle that says 'the author eats it' is pull-complexity-down." },
    { id: "pp-eof", answer: "errors-away", trapKey: "deep",
      blurb: "Designing file reading: what should happen at end of file?",
      why: "Make EOF normal — return empty/sentinel — and the error handling in every caller evaporates.",
      trap: "Depth won't remove the try/except in callers; redefining the semantics will." },
    { id: "pp-unsub", answer: "errors-away", trapKey: "pull-down",
      blurb: "unsubscribe(email) crashes when that address was never subscribed. Choose its behaviour.",
      why: "Define it as 'ensure not subscribed' — already-absent becomes a success, and the error ceases to exist.",
      trap: "There's nothing to absorb — the fix is changing what the operation MEANS." },
    { id: "pp-first-idea", answer: "twice", trapKey: "strategic",
      blurb: "Your first architecture for the cache feels fine. Ship it?",
      why: "Sketch a genuinely different second design first — the comparison is cheap and routinely beats the first idea.",
      trap: "Being strategic says invest; design-it-twice says HOW to invest at decision time: compare real alternatives." },
    { id: "pp-deadline", answer: "strategic", trapKey: "twice",
      blurb: "Deadline pressure: a hack ships today; the clean change costs about 20% more time.",
      why: "This is the investment mindset itself — pay the small steady premium or pay compound interest later.",
      trap: "No alternative designs in question here; it's the working-code-isn't-enough call." },
    { id: "pp-tactic-pr", answer: "strategic", trapKey: "deep",
      blurb: "A teammate's PR works but adds the fourth special case to price(). Your review verdict?",
      why: "Working code isn't enough — each 'harmless' special case is tactical debt; ask for the small redesign.",
      trap: "Depth might be the eventual shape, but the judgment being tested is strategic vs tactical." },
    { id: "pp-hard-to-doc", answer: "comments-first", trapKey: "twice",
      blurb: "You're about to implement a method but can't write a short comment describing what it does.",
      why: "The comment is the design canary: if it won't come out crisp, the abstraction is muddled — fix it before coding.",
      trap: "A second design may follow, but the tool that EXPOSED the problem is writing the comment first." },
    { id: "pp-comment-design", answer: "comments-first", trapKey: "hide",
      blurb: "You want cheap, early feedback on an abstraction before writing any implementation.",
      why: "Write the interface comments first — they make the abstraction concrete enough to judge and review.",
      trap: "Hiding is a property of the final design; comments-first is how you test the design today." },
    { id: "pp-cache-iface", answer: "hide", trapKey: "general",
      blurb: "Your cache exposes get_bucket(), rehash(), and load_factor() publicly, “just in case.”",
      why: "Those are implementation decisions — exposing them forfeits the freedom to ever change them. Hide them.",
      trap: "This isn't about how general get/put are — it's internals escaping through the interface." }
  ];

  /* ---------- bank: fix-it-how ---------- */
  var FX_ITEMS = [
    { id: "fx-forwarding", answer: "collapse-layer", trapKey: "deepen",
      blurb: "Controller.save() calls Service.save() calls Repo.save() — identical signatures all the way down.",
      why: "Layers must change the abstraction; ones that don't should be removed or given a real job.",
      trap: "You can't deepen a layer that has no work of its own — first decide whether it should exist." },
    { id: "fx-two-formats", answer: "one-owner", trapKey: "together",
      blurb: "The CSV column order is hard-coded in both the exporter and the importer.",
      why: "That's one decision living in two modules — give the format a single owning module both sides call.",
      trap: "Merging exporter and importer is heavy-handed; the leak is the FORMAT, so house that knowledge once." },
    { id: "fx-conjoined", answer: "together", trapKey: "one-owner",
      blurb: "You can't understand validate() without reading normalize() — they pass half-built state to each other.",
      why: "Conjoined methods that only make sense jointly are one unit split in two — bring them together.",
      trap: "There's no single fact to relocate; the functions themselves are two halves of one idea." },
    { id: "fx-special-if", answer: "split-special", trapKey: "redesign-touched",
      blurb: "A general comparison function has if filename.endswith(\".tmp\") buried inside it — for exactly one caller.",
      why: "Special-purpose code inside a general mechanism: move the special case out to the caller that owns it.",
      trap: "No broad redesign needed — just unmix the special from the general." },
    { id: "fx-9-params", answer: "default-common", trapKey: "collapse-layer",
      blurb: "make_server() requires nine arguments; every call site copy-pastes the same seven values.",
      why: "Give the seven sensible defaults and let experts override — the common case becomes trivial.",
      trap: "The layer is fine; it's the mandatory knobs that tax every caller." },
    { id: "fx-gone", answer: "redefine", trapKey: "comment-contract",
      blurb: "delete(path) raises if the file is already gone, so every caller wraps it in try/except: pass.",
      why: "Define delete as 'ensure absent': already-gone is success, and all that handling code evaporates.",
      trap: "Documenting the exception still leaves every caller writing the same boilerplate." },
    { id: "fx-result2", answer: "rename", trapKey: "comment-contract",
      blurb: "Reviewers keep asking what result2 holds in your function.",
      why: "Reader confusion is the verdict: pick a name precise enough that the question never comes up.",
      trap: "A comment can explain result2 once — a precise name explains it at every mention." },
    { id: "fx-blocking", answer: "comment-contract", trapKey: "rename",
      blurb: "Callers of fetch() can't tell whether it blocks, retries, or what it returns on failure.",
      why: "That's interface contract — behaviour a signature can't express. Write the comment that pins it down.",
      trap: "No rename encodes 'retries twice, returns None on timeout' — the contract needs prose." },
    { id: "fx-third-case", answer: "redesign-touched", trapKey: "second-design",
      blurb: "Your bug-fix adds the third special case to the same function this month.",
      why: "Chapter 16's rule: when a change fights the design, redesign the part you're touching so the fix looks designed-in.",
      trap: "You don't need two fresh architectures — you need to stop patching and reshape the touched function." },
    { id: "fx-slow-guess", answer: "profile-first", trapKey: "redesign-touched",
      blurb: "A teammate wants to rewrite the JSON layer in Rust because it “feels slow.”",
      why: "Intuition lies — measure where time actually goes before buying permanent complexity.",
      trap: "Redesign may come later; nothing should happen before a profile says this code matters." },
    { id: "fx-first-arch", answer: "second-design", trapKey: "profile-first",
      blurb: "You have one workable design for the new module and you're about to start typing.",
      why: "Sketch a genuinely different alternative first — the contrast is the cheapest design review there is.",
      trap: "There's nothing to measure yet — the leverage is at the whiteboard." },
    { id: "fx-caller-rule", answer: "deepen", trapKey: "comment-contract",
      blurb: "Every caller of advance() must remember to also call reset_column() right after.",
      why: "A rule every caller must remember belongs inside one deep method that does both — callers say what they mean.",
      trap: "Documenting the trap still lets people fall into it; swallowing the rule removes it." }
  ];

  /* ---------- mode registry ---------- */
  var MODES = {
    "spot-the-flag": {
      title: "Spot the flag — name the smell", vocab: FLAGS, items: SF_ITEMS, secs: 45,
      fixed: ["shallow", "leakage", "temporal", "passthrough", "overexposure", "vague-name", "comment-echo", "exception-normal"],
      lead: "Read the symptom, name the red flag in under {secs} seconds — the mid-review reflex this book exists to build. {count} questions per round."
    },
    "pick-the-principle": {
      title: "Pick the principle", vocab: PRINCIPLES, items: PP_ITEMS, secs: 45,
      fixed: ["deep", "hide", "general", "pull-down", "errors-away", "twice", "comments-first", "strategic"],
      lead: "Read the scenario, pick the ONE principle that decides it in under {secs} seconds. Deep vs hide vs pull-down — the confusables, on a clock. {count} questions per round."
    },
    "fix-it-how": {
      title: "Fix it — choose the move", vocab: MOVES, items: FX_ITEMS, secs: 45, chips: 8,
      lead: "You've spotted the smell — now choose the right move in under {secs} seconds, with the tempting near-miss sitting right next to it. {count} questions per round."
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
    var mode = MODES[cfg.mode] ? cfg.mode : "spot-the-flag";
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
