/* ============================================================
   DSA Field Guide — pattern-picker trainer (.ptrainer)
   The #1 interview skill nobody practices: reading a problem and
   naming the right pattern FAST. Two modes share one engine:
     "pattern" — read a problem blurb, pick the pattern under time
     "bigo"    — read a code snippet, pick its Big-O under time
   Best scores persist to localStorage["dsa-ptrainer"].
   Offline, no deps, theme-aware, honors prefers-reduced-motion.

   Authoring:
     <div class="ptrainer" data-ptrainer>
       <script type="application/json" class="ptrainer-config">
       { "mode": "pattern", "count": 10, "secs": 45 }
       </script>
     </div>
   Config: mode "pattern"|"bigo" (default pattern), count = questions
   per round, secs = seconds per question (45 pattern / 60 bigo),
   patterns: [keys] optional filter for pattern mode.
   ============================================================ */
(function () {
  "use strict";
  var STORE = "dsa-ptrainer";
  var REDUCED = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function readStore() {
    try { var o = JSON.parse(localStorage.getItem(STORE)); return (o && o.v === 1) ? o : { v: 1, modes: {} }; }
    catch (e) { return { v: 1, modes: {} }; }
  }
  function writeStore(o) { try { localStorage.setItem(STORE, JSON.stringify(o)); } catch (e) {} }
  function el(t, c, html) { var e = document.createElement(t); if (c) e.className = c; if (html != null) e.innerHTML = html; return e; }
  function onReady(fn) { if (document.readyState !== "loading") fn(); else document.addEventListener("DOMContentLoaded", fn); }
  function shuffle(a) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)), t = a[i]; a[i] = a[j]; a[j] = t; } return a; }

  /* ---------- pattern vocabulary: key → chip label + lesson id ---------- */
  var PATTERNS = {
    "arrays-hashing":  { label: "Hash map / set",          lesson: "pat-arrays-hashing" },
    "two-pointers":    { label: "Two pointers",            lesson: "pat-two-pointers" },
    "sliding-window":  { label: "Sliding window",          lesson: "pat-sliding-window" },
    "stack":           { label: "Stack",                   lesson: "pat-stack" },
    "monotonic-stack": { label: "Monotonic stack",         lesson: "pat-stack" },
    "binary-search":   { label: "Binary search",           lesson: "pat-binary-search" },
    "bsearch-answer":  { label: "Binary search on answer", lesson: "pat-binary-search" },
    "linked-list":     { label: "Fast & slow pointers",    lesson: "pat-linked-list" },
    "bfs":             { label: "BFS",                     lesson: "pat-trees" },
    "dfs":             { label: "DFS / recursion",         lesson: "pat-trees" },
    "heap":            { label: "Heap / Top-K",            lesson: "pat-heap" },
    "backtracking":    { label: "Backtracking",            lesson: "pat-backtracking" },
    "topo-sort":       { label: "Topological sort",        lesson: "pat-graphs" },
    "dp":              { label: "Dynamic programming",     lesson: "pat-dp" },
    "greedy":          { label: "Greedy",                  lesson: "pat-greedy" },
    "intervals":       { label: "Intervals (sort & sweep)",lesson: "pat-intervals" },
    "trie":            { label: "Trie",                    lesson: "pat-tries" },
    "union-find":      { label: "Union-Find",              lesson: "pat-union-find" },
    "design":           { label: "Design (LRU / API)",      lesson: "pat-design" },
    "bits":            { label: "Bit manipulation",        lesson: "pat-bits" }
  };

  /* ---------- bank: pattern mode ---------- */
  var PATTERN_ITEMS = [
    { id: "pp-window-distinct", answer: "sliding-window", trapKey: "two-pointers",
      blurb: "Find the length of the longest substring that contains at most 2 distinct characters.",
      why: "A contiguous stretch that grows and shrinks while an invariant holds (≤2 distinct) is the variable sliding window.",
      trap: "Two pointers walk toward each other from the ends; a window's two edges both move forward, chasing an invariant." },
    { id: "pp-sorted-twosum", answer: "two-pointers", trapKey: "arrays-hashing",
      blurb: "In a SORTED array, find two numbers that add to a target — using O(1) extra space.",
      why: "Sorted + pair + O(1) space = pointers at both ends: too small → move left in, too big → move right in.",
      trap: "A hash map also works but spends O(n) memory — the problem's space constraint is pointing you at the pointers." },
    { id: "pp-unsorted-twosum", answer: "arrays-hashing", trapKey: "two-pointers",
      blurb: "In an UNSORTED array, decide in one pass whether any two numbers add to a target.",
      why: "One pass + \"have I seen my complement?\" is the hash-set question. Membership in O(1) is its superpower.",
      trap: "Two pointers need sorted input — sorting first costs O(n log n) and loses the original indices." },
    { id: "pp-warmer-day", answer: "monotonic-stack", trapKey: "heap",
      blurb: "For every day in a temperature list, how many days until a strictly warmer one?",
      why: "\"Next greater element to the right\" — days wait on a decreasing stack until a warmer day pops and answers them.",
      trap: "A heap finds the global min/max; here each day needs the NEXT warmer day in order, which is stack territory." },
    { id: "pp-koko", answer: "bsearch-answer", trapKey: "greedy",
      blurb: "Find the minimum eating speed that finishes all banana piles within h hours.",
      why: "If speed k works, every faster speed works — a monotonic NNNYYY boundary. Binary-search the answer space.",
      trap: "There's no greedy choice to make per pile; you're searching for one global number with a yes/no test." },
    { id: "pp-stream-kth", answer: "heap", trapKey: "binary-search",
      blurb: "Numbers arrive one at a time, forever. After each arrival, report the k-th largest so far.",
      why: "A size-k min-heap keeps exactly the top k with O(log k) per arrival — built for streams.",
      trap: "Binary search needs a sorted, finished array; a stream never finishes and re-sorting per arrival is O(n log n) each time." },
    { id: "pp-cycle-list", answer: "linked-list", trapKey: "arrays-hashing",
      blurb: "Detect whether a linked list contains a cycle, using O(1) extra space.",
      why: "Floyd's fast & slow pointers: if there's a loop, the runner laps the walker. No memory needed.",
      trap: "A visited set works but is O(n) space — the constraint rules it out." },
    { id: "pp-subsets", answer: "backtracking", trapKey: "dp",
      blurb: "Generate ALL subsets of a list of distinct numbers.",
      why: "\"Generate all…\" = walk the choice tree (take it / leave it), undoing each choice on the way back up.",
      trap: "DP counts or optimizes; when the output is every combination itself, you must actually walk the tree." },
    { id: "pp-coins", answer: "dp", trapKey: "greedy",
      blurb: "Given coin denominations, make an amount with the FEWEST coins.",
      why: "Overlapping subproblems (fewest for every smaller amount) + optimal substructure = DP table.",
      trap: "Greedy fails: coins [1,3,4], amount 6 — greedy takes 4+1+1 (3 coins), optimal is 3+3 (2 coins)." },
    { id: "pp-courses", answer: "topo-sort", trapKey: "dfs",
      blurb: "Courses have prerequisites. Find an order in which you can take them all, or say it's impossible.",
      why: "Dependencies form a DAG; \"a valid order\" IS a topological sort (Kahn's in-degree queue or DFS post-order).",
      trap: "Plain DFS visits nodes but doesn't by itself give you the dependency-respecting order or detect the cycle cleanly." },
    { id: "pp-maze", answer: "bfs", trapKey: "dfs",
      blurb: "Find the SHORTEST path from entrance to exit in an unweighted maze grid.",
      why: "BFS explores in rings — the first time you reach the exit is provably the shortest unweighted path.",
      trap: "DFS dives deep and finds A path, not the shortest one." },
    { id: "pp-accounts", answer: "union-find", trapKey: "dfs",
      blurb: "Accounts arrive as (name, emails). Any shared email means the same person — merge the groups as you scan.",
      why: "Incrementally merging groups and asking \"same group?\" is exactly union-find with near-O(1) unions.",
      trap: "DFS over an email graph works too, but you'd build the whole graph first; union-find merges on the fly." },
    { id: "pp-autocomplete", answer: "trie", trapKey: "arrays-hashing",
      blurb: "Implement autocomplete: given a prefix, list all stored words that start with it.",
      why: "Words sharing prefixes share trie paths — startsWith costs O(prefix length), independent of dictionary size.",
      trap: "A hash set answers exact lookups in O(1) but prefix queries force scanning every word." },
    { id: "pp-meetings", answer: "intervals", trapKey: "stack",
      blurb: "Given meeting time ranges, merge every overlapping pair into one combined range.",
      why: "Sort by start, sweep once, merge while current.start ≤ previous.end — the intervals template.",
      trap: "There's no nesting/most-recent structure here — overlap is decided by sorted neighbors, not a stack." },
    { id: "pp-peak", answer: "binary-search", trapKey: "two-pointers",
      blurb: "Find ANY peak element (bigger than both neighbors) in O(log n).",
      why: "O(log n) demands halving. Compare mid with mid+1: an uphill slope guarantees a peak on that side.",
      trap: "Two pointers move O(n) steps; the log bound forces you to discard half the array each step." },
    { id: "pp-lonely", answer: "bits", trapKey: "arrays-hashing",
      blurb: "Every number appears exactly twice except one. Find it in O(n) time and O(1) space.",
      why: "XOR the whole list: pairs cancel (x^x=0), the loner survives. One variable of state.",
      trap: "A counter dict is O(n) space — the O(1) constraint is the hint that bits are intended." },
    { id: "pp-erase-overlap", answer: "greedy", trapKey: "dp",
      blurb: "Remove the minimum number of intervals so that none of the rest overlap.",
      why: "Sort by END time and always keep the earliest finisher — the classic greedy exchange argument.",
      trap: "An LIS-style DP works in O(n²) but the sort-by-end greedy is O(n log n) and is the expected answer." },
    { id: "pp-jump", answer: "greedy", trapKey: "dp",
      blurb: "Each slot says how FAR you may jump from it. Can you reach the last index from the first?",
      why: "Carry one number — the farthest reach so far. Extending reach is never wrong: a one-pass greedy.",
      trap: "DP over \"is i reachable\" is O(n²); the single max-reach variable collapses it to O(n)." },
    { id: "pp-stairs", answer: "dp", trapKey: "backtracking",
      blurb: "You can climb 1 or 2 steps at a time. COUNT the distinct ways to reach step n.",
      why: "ways(n) = ways(n−1) + ways(n−2): overlapping subproblems, count not list — Fibonacci-shaped DP.",
      trap: "Backtracking enumerates each way — exponential. You only need the COUNT, so reuse subanswers." },
    { id: "pp-brackets", answer: "stack", trapKey: "arrays-hashing",
      blurb: "Check whether a string of ()[]{} is properly nested.",
      why: "\"Closes the most recently opened\" is literally LIFO — push openers, pop and match on closers.",
      trap: "Counting per bracket type misses interleaving: \"([)]\" balances counts but is invalid." },
    { id: "pp-topk-words", answer: "heap", trapKey: "arrays-hashing",
      blurb: "Return the k most frequent words in a large document.",
      why: "Count with a dict, then SELECT with a size-k heap: O(n log k) beats sorting everything.",
      trap: "The dict only counts; picking the top k efficiently is the heap's half of the job." },
    { id: "pp-word-ladder", answer: "bfs", trapKey: "backtracking",
      blurb: "Transform one word into another, one letter at a time, every step a valid word — FEWEST steps.",
      why: "Words are nodes, one-letter edits are edges, fewest steps = shortest unweighted path = BFS.",
      trap: "Backtracking explores all transformation paths — exponential; you only need the shortest." },
    { id: "pp-nqueens", answer: "backtracking", trapKey: "greedy",
      blurb: "Place n queens on an n×n board so none attack each other. Return all valid arrangements.",
      why: "Place a queen, recurse, hit a dead end, lift it back off — constraint-driven trial and error, all solutions.",
      trap: "No greedy placement rule survives — early \"safe-looking\" placements doom later rows; you must be able to undo." },
    { id: "pp-lca", answer: "dfs", trapKey: "bfs",
      blurb: "Find the lowest common ancestor of two nodes in a binary tree.",
      why: "Recursive DFS: a node returning \"found one in each subtree\" IS the answer bubbling up — depth-first structure.",
      trap: "BFS visits level by level, which tells you depth, not the subtree-containment relationships you need." }
  ];

  /* ---------- bank: Big-O mode ---------- */
  var BIGO_OPTIONS = ["O(1)", "O(log n)", "O(n)", "O(n log n)", "O(n²)", "O(2ⁿ)"];
  var BIGO_ITEMS = [
    { id: "bo-sum", answer: "O(n)",
      code: "total = 0\nfor x in nums:\n    total += x\nreturn total",
      why: "One loop, one pass, constant work per element." },
    { id: "bo-pairs", answer: "O(n²)",
      code: "for i in range(len(nums)):\n    for j in range(i + 1, len(nums)):\n        check(nums[i], nums[j])",
      why: "Every pair: n·(n−1)/2 iterations — the inner loop depends on n." },
    { id: "bo-halve", answer: "O(log n)",
      code: "while n > 1:\n    n //= 2\n    steps += 1",
      why: "n halves every iteration — that's the definition of log₂(n) steps." },
    { id: "bo-dict", answer: "O(1)",
      code: "def lookup(d, key):\n    return d.get(key, None)",
      why: "Hash, jump to the bucket, done — no loop over the data at all." },
    { id: "bo-sortscan", answer: "O(n log n)",
      code: "nums.sort()\nfor i in range(1, len(nums)):\n    if nums[i] == nums[i-1]:\n        return True",
      why: "The O(n) scan is dwarfed by the sort: O(n log n) + O(n) = O(n log n)." },
    { id: "bo-fib", answer: "O(2ⁿ)",
      code: "def fib(n):\n    if n < 2: return n\n    return fib(n-1) + fib(n-2)",
      why: "Each call spawns two more — the call tree doubles per level. No memo, no mercy." },
    { id: "bo-monostack", answer: "O(n)",
      code: "for i, x in enumerate(nums):\n    while stack and nums[stack[-1]] < x:\n        ans[stack.pop()] = i\n    stack.append(i)",
      why: "TRAP: the nested while looks quadratic, but each index pushes once and pops at most once — total pops ≤ n. Amortized O(n)." },
    { id: "bo-fibmemo", answer: "O(n)",
      code: "@lru_cache(None)\ndef fib(n):\n    if n < 2: return n\n    return fib(n-1) + fib(n-2)",
      why: "TRAP: same shape as the 2ⁿ version, but the memo means each n computes once — n distinct calls, O(1) each." },
    { id: "bo-alphabet", answer: "O(n)",
      code: "for ch in s:\n    for letter in \"abcdefghijklmnopqrstuvwxyz\":\n        if ch == letter: counts[ch] += 1",
      why: "The inner loop is a CONSTANT 26 — it doesn't grow with n. O(26·n) = O(n)." },
    { id: "bo-bsearch", answer: "O(log n)",
      code: "while lo <= hi:\n    mid = (lo + hi) // 2\n    if nums[mid] == t: return mid\n    if nums[mid] < t: lo = mid + 1\n    else: hi = mid - 1",
      why: "The live range halves every iteration — binary search's signature." },
    { id: "bo-slice", answer: "O(n²)",
      code: "for i in range(len(s)):\n    if target in s[i:]:\n        count += 1",
      why: "TRAP: one visible loop, but s[i:] copies AND `in` scans up to n chars — O(n) hidden work per iteration." },
    { id: "bo-heapbuild", answer: "O(n log n)",
      code: "h = []\nfor x in nums:\n    heapq.heappush(h, x)",
      why: "n pushes at O(log n) each. (Fun fact: heapify on a whole list at once is O(n) — pushing one-by-one isn't.)" }
  ];

  /* ---------- engine ---------- */
  function lessonUrl(key) {
    var meta = PATTERNS[key]; if (!meta) return null;
    var L = window.LESSONS || [];
    for (var i = 0; i < L.length; i++) if (L[i].id === meta.lesson) return (window.SITE_BASE || "./") + L[i].url;
    return null;
  }

  function init(host) {
    var cfgEl = host.querySelector(".ptrainer-config") || host.querySelector("script[type='application/json']");
    var cfg = {};
    if (cfgEl) { try { cfg = JSON.parse(cfgEl.textContent) || {}; } catch (e) { cfg = {}; } }
    var mode = cfg.mode === "bigo" ? "bigo" : "pattern";
    var SECS = cfg.secs || (mode === "bigo" ? 60 : 45);
    var bank = mode === "bigo" ? BIGO_ITEMS : PATTERN_ITEMS.filter(function (q) {
      return !cfg.patterns || cfg.patterns.indexOf(q.answer) !== -1;
    });
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
      head.appendChild(el("span", "pp-title", mode === "bigo" ? "Big-O speed quiz" : "Pattern recognition trainer"));
      var rec = modeRec();
      head.appendChild(el("span", "pp-best", rec.plays ? "best <b>" + rec.best + "%</b> · " + rec.plays + " round" + (rec.plays === 1 ? "" : "s") : "not attempted"));
      host.appendChild(head);
      host.appendChild(el("p", "pp-lead", mode === "bigo"
        ? "Read the snippet, name its time complexity in under " + SECS + " seconds. The bank includes the two classic traps interviewers love."
        : "Read the problem, name the pattern in under " + SECS + " seconds — the exact skill the first 5 minutes of a coding round measures. " + COUNT + " questions per round."));
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
      if (mode === "bigo") return BIGO_OPTIONS.slice();
      var keys = Object.keys(PATTERNS).filter(function (k) { return k !== q.answer && k !== q.trapKey; });
      var picked = shuffle(keys).slice(0, q.trapKey ? 6 : 7);
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

      /* countdown bar */
      var track = el("div", "pp-track");
      barEl = el("div", "pp-track-fill");
      track.appendChild(barEl);
      host.appendChild(track);

      if (mode === "bigo") {
        var pre = el("pre", "pp-code");
        pre.textContent = q.code;            /* textContent: no escaping pitfalls */
        host.appendChild(pre);
        host.appendChild(el("p", "pp-blurb", "What does this cost?"));
      } else {
        host.appendChild(el("p", "pp-blurb", "“" + q.blurb + "”"));
      }

      var grid = el("div", "pp-chips");
      options(q).forEach(function (opt, k) {
        var label = mode === "bigo" ? opt : (PATTERNS[opt] ? PATTERNS[opt].label : opt);
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

      /* arm the clock */
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
          var key = mode === "bigo" ? null : q.answer;
          var label = mode === "bigo" ? q.answer : (PATTERNS[q.answer] ? PATTERNS[q.answer].label : q.answer);
          if (mode !== "bigo" && dedup[key]) return;
          if (key) dedup[key] = true;
          var url = key ? lessonUrl(key) : null;
          box.appendChild(el("p", "pp-miss", url
            ? "✗ " + (mode === "bigo" ? "" : "“" + q.blurb + "” → ") + "<a href=\"" + url + "\">" + label + " →</a>"
            : "✗ " + (mode === "bigo" ? q.why : q.blurb)));
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

  onReady(function () { document.querySelectorAll(".ptrainer").forEach(init); });
})();
