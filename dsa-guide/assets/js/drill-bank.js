/* ============================================================
   DSA Field Guide — drill question bank
   Consumed by drill.js. Each drill mirrors a real 40-minute
   coding round: interviewer prompt, per-phase nudges + hints,
   a senior grading rubric keyed to the five phase keys, and a
   model answer (HTML string — ALL code entity-escaped: &lt; &gt;).
   `lesson` ids resolve against window.LESSONS for the
   "Study this" link; ids pointing at not-yet-shipped lessons
   simply render no link until those lessons exist.
   ============================================================ */

window.DSA_DRILL_PHASES = [
  { key: "clarify", label: "Restate & clarify", min: 5,
    doing: "Restate the problem in your own words. Pin down input ranges, empty inputs, duplicates, and exactly what you must return. Say one tiny worked example out loud." },
  { key: "brute",   label: "Brute force & Big-O", min: 5,
    doing: "State the dumbest correct solution and its exact time and space cost. That baseline is your credibility — and what your real solution must beat." },
  { key: "plan",    label: "Find the pattern", min: 10,
    doing: "Name the pattern, walk your tiny example through it by hand, and state the target complexity BEFORE you write any code." },
  { key: "code",    label: "Code it", min: 15,
    doing: "Write clean Python, narrating as you go. Working core logic beats a perfect skeleton — get the loop right first, tidy later." },
  { key: "test",    label: "Test & edge cases", min: 5,
    doing: "Trace your example through the code line by line, hit the edge cases from phase 1, and restate the final time and space complexity." }
];

window.DSA_DRILLS = [

  /* ---------------- WARM-UPS ---------------- */
  {
    id: "two-sum", level: "warm", lesson: "pat-arrays-hashing",
    title: "Two Sum",
    prompt: "Given a list of integers and a target, return the indices of the two numbers that add up to the target. Exactly one solution exists; you can't use the same element twice.",
    phaseNotes: {
      clarify: {
        prompts: ["Can the list contain negatives or duplicates? Is it sorted?", "Return indices or values? What if I'd find the same element twice?"],
        hints: ["It's unsorted, may contain negatives and duplicates, and you return the two indices in any order."]
      },
      brute: {
        prompts: ["What does checking every pair cost?", "Say the nested-loop shape out loud before improving it."],
        hints: ["Two nested loops over all pairs: O(n²) time, O(1) space. Always state it — it's your baseline."]
      },
      plan: {
        prompts: ["What single question does each element ask? (\"Has my partner already walked past?\")", "Which structure answers membership questions in O(1)?"],
        hints: ["One pass with a dict mapping value → index. For each x, look up target − x BEFORE inserting x — that also handles duplicates cleanly."]
      },
      code: {
        prompts: ["Look up the complement first, then insert — what bug does the other order cause?", "What do you return inside the loop?"],
        hints: ["Insert-before-lookup makes x pair with itself when target == 2x. Lookup first, insert second."]
      },
      test: {
        prompts: ["Trace [3, 3] with target 6 — does your duplicate handling hold?", "Restate final complexity: time AND space."],
        hints: ["O(n) time, O(n) space for the dict."]
      }
    },
    rubric: [
      { phase: "clarify", text: "Asked about sorted-ness, negatives, and duplicates before solving." },
      { phase: "clarify", text: "Restated the return value (indices, any order) and walked one tiny example." },
      { phase: "brute",   text: "Named the O(n²) all-pairs baseline out loud with its space cost." },
      { phase: "plan",    text: "Framed it as a one-pass hash lookup: \"has my complement already appeared?\"" },
      { phase: "plan",    text: "Stated O(n) time / O(n) space as the target before coding." },
      { phase: "code",    text: "Looked up target − x before inserting x (duplicate-safe order)." },
      { phase: "code",    text: "Wrote the full working function — loop, lookup, insert, return." },
      { phase: "test",    text: "Traced [3, 3] / target 6 (or similar duplicate case) through the code." },
      { phase: "test",    text: "Restated O(n) time and O(n) space at the end." }
    ],
    model: "<p><b>Shape:</b> one pass, dict of seen values &rarr; index; each element asks \"did my partner already pass by?\"</p><p><b>Core code:</b></p><p><code>seen = {}</code><br><code>for i, x in enumerate(nums):</code><br><code>&nbsp;&nbsp;if target - x in seen: return [seen[target - x], i]</code><br><code>&nbsp;&nbsp;seen[x] = i</code></p><p><b>The senior moves:</b> baseline O(n&sup2;) stated first; lookup-before-insert called out as the duplicate guard; [3,3]&rarr;6 traced; O(n)/O(n) restated at the end.</p>"
  },

  {
    id: "valid-parens", level: "warm", lesson: "pat-stack",
    title: "Valid Parentheses",
    prompt: "Given a string of just the characters ()[]{}, tell me whether it's valid: every bracket closes the most recently opened bracket of the same type.",
    phaseNotes: {
      clarify: {
        prompts: ["Is the empty string valid? Can other characters appear?", "What's the answer for \"(]\" and for \"([)]\"? Saying these aloud shows you get the nesting rule."],
        hints: ["Empty string is valid. Only the six bracket characters appear. \"([)]\" is invalid — interleaving breaks nesting."]
      },
      brute: {
        prompts: ["A repeated-replacement approach (delete \"()\" pairs until stuck) works — what does it cost?", "Why does that feel wasteful?"],
        hints: ["Repeatedly scanning and deleting adjacent pairs is O(n²). It re-reads the string once per deletion round."]
      },
      plan: {
        prompts: ["\"Closes the most recently opened\" — which structure is literally built for most-recent-first?", "What goes ON the stack, and what do you compare on a closer?"],
        hints: ["Push openers; on a closer, pop and compare. A map {')':'(', ']':'[', '}':'{'} keeps the comparison clean."]
      },
      code: {
        prompts: ["What happens when you see a closer and the stack is empty?", "What's the final check after the loop?"],
        hints: ["Empty-stack pop ⇒ invalid immediately. After the loop the stack must be empty — leftovers mean unclosed openers."]
      },
      test: {
        prompts: ["Trace \"([)]\" — where exactly does it fail?", "Test \"(((\" — does your end-of-loop check catch it?"],
        hints: ["On ')' the top is '[' — mismatch, return False. \"(((\" survives the loop but leaves a non-empty stack."]
      }
    },
    rubric: [
      { phase: "clarify", text: "Settled the empty string and gave \"([)]\" as an invalid example out loud." },
      { phase: "brute",   text: "Mentioned a correct-but-slow alternative (repeated pair deletion, O(n²))." },
      { phase: "plan",    text: "Connected \"most recently opened\" to a stack explicitly — LIFO is the problem statement." },
      { phase: "plan",    text: "Planned the closer→opener map instead of a 6-way if-chain." },
      { phase: "code",    text: "Handled the empty-stack pop (closer with nothing open)." },
      { phase: "code",    text: "Wrote the complete loop: push openers, pop-and-compare closers." },
      { phase: "code",    text: "Returned `not stack` (or equivalent) — leftovers fail." },
      { phase: "test",    text: "Traced one invalid interleaved case and one unclosed-opener case." },
      { phase: "test",    text: "Stated O(n) time / O(n) worst-case stack space." }
    ],
    model: "<p><b>Shape:</b> a stack IS the rule — \"most recently opened\" = LIFO.</p><p><b>Core code:</b></p><p><code>pairs = {')':'(', ']':'[', '}':'{'}</code><br><code>stack = []</code><br><code>for ch in s:</code><br><code>&nbsp;&nbsp;if ch in pairs:</code><br><code>&nbsp;&nbsp;&nbsp;&nbsp;if not stack or stack.pop() != pairs[ch]: return False</code><br><code>&nbsp;&nbsp;else: stack.append(ch)</code><br><code>return not stack</code></p><p><b>The senior moves:</b> the two failure modes named separately (mismatch mid-string vs leftovers at the end); \"([)]\" traced; empty-string answer settled in phase 1.</p>"
  },

  {
    id: "single-number", level: "warm", lesson: "pat-bits",
    title: "Single Number",
    prompt: "Every number in this list appears exactly twice — except one, which appears once. Find it in linear time using constant extra space.",
    phaseNotes: {
      clarify: {
        prompts: ["Did you notice the constraint sentence? It rules out the obvious answers.", "Can the numbers be negative? How many elements might there be?"],
        hints: ["O(1) space is the whole game — a counter dict is O(n) space and doesn't qualify (say so explicitly!)."]
      },
      brute: {
        prompts: ["Name two simpler solutions and why each violates a constraint.", "What would sorting cost?"],
        hints: ["Counter dict: O(n) time but O(n) space. Sorting then scanning pairs: O(1)-ish space but O(n log n) time. Both fail the brief."]
      },
      plan: {
        prompts: ["What does x XOR x equal? And x XOR 0?", "If XOR is commutative, what happens when you XOR the whole list together?"],
        hints: ["Pairs cancel to 0, 0 is the identity, so the fold leaves exactly the lonely number. Order never matters."]
      },
      code: {
        prompts: ["This is a 3-line function — spend the spare minutes narrating WHY it works.", "Could functools.reduce express it?"],
        hints: ["acc = 0; for x in nums: acc ^= x; return acc"]
      },
      test: {
        prompts: ["Trace [4, 1, 2, 1, 2] step by step — show the accumulator after each XOR.", "Does it work when the list has just one element?"],
        hints: ["4^1=5, 5^2=7, 7^1=6, 6^2=4. Single-element list returns that element — 0 ^ x = x."]
      }
    },
    rubric: [
      { phase: "clarify", text: "Called out that O(1) space forbids the counter-dict answer." },
      { phase: "clarify", text: "Confirmed every other value appears exactly twice (not \"at most twice\")." },
      { phase: "brute",   text: "Named the dict (O(n) space) and sort (O(n log n)) baselines and why each fails the brief." },
      { phase: "plan",    text: "Stated the two XOR identities: x^x = 0 and x^0 = x." },
      { phase: "plan",    text: "Explained that commutativity lets pairs cancel regardless of order." },
      { phase: "code",    text: "Wrote the fold cleanly (loop or reduce) with a zero accumulator." },
      { phase: "test",    text: "Traced a 5-element example showing the accumulator at each step." },
      { phase: "test",    text: "Stated O(n) time, O(1) space at the end." }
    ],
    model: "<p><b>Shape:</b> XOR-fold the list; pairs annihilate, the loner survives.</p><p><b>Core code:</b></p><p><code>acc = 0</code><br><code>for x in nums:</code><br><code>&nbsp;&nbsp;acc ^= x</code><br><code>return acc</code></p><p><b>The senior moves:</b> rejecting the dict explicitly because of the space constraint; both identities stated; the accumulator traced on [4,1,2,1,2]. Bonus: mention the follow-up \"every number appears three times\" needs bit-counting instead.</p>"
  },

  /* ---------------- CORE ---------------- */
  {
    id: "longest-substring", level: "core", lesson: "pat-sliding-window",
    title: "Longest Substring Without Repeating Characters",
    prompt: "Given a string, return the length of the longest substring that has no repeated characters.",
    phaseNotes: {
      clarify: {
        prompts: ["Substring or subsequence? Get this nailed down first.", "What's the answer for \"\" and for \"bbbbb\"? What characters can appear?"],
        hints: ["Contiguous substring. \"\" → 0, \"bbbbb\" → 1. Assume any characters (so use a dict/set, not a 26-slot array)."]
      },
      brute: {
        prompts: ["Cost of checking every substring for uniqueness?", "Even with a set per start index, what's the cost?"],
        hints: ["All substrings + uniqueness check is O(n³); one set per start index gives O(n²). State both."]
      },
      plan: {
        prompts: ["Why does a variable-size sliding window fit? What grows it, what shrinks it?", "What must be true inside the window at all times — your invariant?"],
        hints: ["Invariant: window holds no repeats. Right edge eats one char per step; when it would create a repeat, the left edge advances. last-seen-index map lets left JUMP instead of crawling."]
      },
      code: {
        prompts: ["With last[ch], how does left move — one step at a time or a jump?", "Why `left = max(left, last[ch] + 1)` and not just `last[ch] + 1`?"],
        hints: ["max() guards against stale indices: a previous occurrence BEHIND the current window must not drag left backwards."]
      },
      test: {
        prompts: ["Trace \"abba\" — the classic stale-index trap.", "Check \"\" and a single char. Restate complexity."],
        hints: ["At the final 'a': last['a'] = 0 but left is already 2 — without max(), left would jump backwards to 1. Answer: 2."]
      }
    },
    rubric: [
      { phase: "clarify", text: "Confirmed substring (contiguous), and answered \"\" and \"bbbbb\" out loud." },
      { phase: "brute",   text: "Gave the O(n³) (or per-start O(n²)) baseline with reasoning." },
      { phase: "plan",    text: "Named variable-size sliding window and stated the no-repeats invariant." },
      { phase: "plan",    text: "Planned the last-seen-index map so left jumps instead of crawling." },
      { phase: "code",    text: "Used left = max(left, last[ch] + 1) — the stale-index guard." },
      { phase: "code",    text: "Updated the best length at every step of the right pointer." },
      { phase: "code",    text: "Complete function: loop, map update, answer tracking." },
      { phase: "test",    text: "Traced \"abba\" and showed why max() saves it." },
      { phase: "test",    text: "Stated O(n) time / O(min(n, alphabet)) space." }
    ],
    model: "<p><b>Shape:</b> variable sliding window + last-seen map; the window never contains a repeat.</p><p><b>Core code:</b></p><p><code>last, left, best = {}, 0, 0</code><br><code>for right, ch in enumerate(s):</code><br><code>&nbsp;&nbsp;if ch in last: left = max(left, last[ch] + 1)</code><br><code>&nbsp;&nbsp;last[ch] = right</code><br><code>&nbsp;&nbsp;best = max(best, right - left + 1)</code></p><p><b>The senior moves:</b> the invariant stated before code; \"abba\" traced to justify the max(); the jump-don't-crawl optimization named as what makes it one pass.</p>"
  },

  {
    id: "daily-temps", level: "core", lesson: "pat-stack",
    title: "Daily Temperatures",
    prompt: "Given daily temperatures, return for each day how many days you'd wait until a warmer one. If none ever comes, put 0.",
    phaseNotes: {
      clarify: {
        prompts: ["Strictly warmer or warm-or-equal?", "Walk [73, 74, 75, 71, 69, 72, 76, 73] — what's the expected output?"],
        hints: ["Strictly warmer. Expected: [1, 1, 4, 2, 1, 1, 0, 0]."]
      },
      brute: {
        prompts: ["The obvious scan-forward-for-each-day — cost?", "When is that worst case hit?"],
        hints: ["O(n²) on a decreasing sequence: every day scans to the end and finds nothing."]
      },
      plan: {
        prompts: ["Think of days WAITING for an answer. When today is warm, who gets answered?", "Why is the stack of waiting days always decreasing in temperature?"],
        hints: ["Monotonic decreasing stack of indices. A warm day pops every colder waiting day and answers each with index arithmetic — each index pushes once and pops once."]
      },
      code: {
        prompts: ["Push indices or temperatures? Which do you need for the answer?", "Is your pop a `while`, not an `if`? One warm day can answer many."],
        hints: ["Indices — the answer is i - popped. The pop loop runs while the stack top is strictly colder than today."]
      },
      test: {
        prompts: ["Trace [73, 74, 75, 71, 69, 72, 76, 73]. Watch day 6 (76) pop three waiting days.", "Why is this O(n) despite the nested-looking while loop?"],
        hints: ["Amortized argument: each index enters and leaves the stack at most once, so total pops ≤ n."]
      }
    },
    rubric: [
      { phase: "clarify", text: "Pinned strictly-warmer and produced the expected output for the classic example." },
      { phase: "brute",   text: "Stated O(n²) and named the decreasing-sequence worst case." },
      { phase: "plan",    text: "Described the stack as \"days still waiting for a warmer day\"." },
      { phase: "plan",    text: "Explained why it stays monotonically decreasing." },
      { phase: "code",    text: "Stored indices (not temperatures) and computed waits as i - popped." },
      { phase: "code",    text: "Used a while-pop, so one warm day answers many cold ones." },
      { phase: "code",    text: "Initialized answers to 0 so never-answered days need no special case." },
      { phase: "test",    text: "Traced the example including a multi-pop step." },
      { phase: "test",    text: "Made the amortized O(n) argument: each index pushes and pops at most once." }
    ],
    model: "<p><b>Shape:</b> monotonic decreasing stack of waiting indices; warm days answer the queue.</p><p><b>Core code:</b></p><p><code>ans, stack = [0] * len(t), []</code><br><code>for i, temp in enumerate(t):</code><br><code>&nbsp;&nbsp;while stack and t[stack[-1]] &lt; temp:</code><br><code>&nbsp;&nbsp;&nbsp;&nbsp;j = stack.pop(); ans[j] = i - j</code><br><code>&nbsp;&nbsp;stack.append(i)</code></p><p><b>The senior moves:</b> the \"waiting days\" story makes the stack inevitable; amortized O(n) argued, not asserted; zeros pre-filled so the no-answer case is free.</p>"
  },

  {
    id: "num-islands", level: "core", lesson: "pat-graphs",
    title: "Number of Islands",
    prompt: "Given a grid of '1's (land) and '0's (water), count the islands. Land connects up, down, left, right — not diagonally.",
    phaseNotes: {
      clarify: {
        prompts: ["Diagonals — in or out? (Always ask; it changes the answer.)", "May I modify the input grid, or should I keep a separate visited set?"],
        hints: ["4-directional only. Asking about mutating the grid is a senior question — sinking visited land to '0' saves the visited set."]
      },
      brute: {
        prompts: ["There's no naive-vs-clever gap here — the insight IS flood fill. Use the time to plan traversal choice.", "DFS recursion vs BFS queue: what's the risk of each?"],
        hints: ["Recursion can hit Python's ~1000-frame limit on a huge all-land grid; an explicit stack or BFS deque avoids that. Naming this risk scores points."]
      },
      plan: {
        prompts: ["One sentence: what does the outer double loop do, and what does the flood fill do?", "Why does count = number of flood-fill launches?"],
        hints: ["Every unvisited '1' starts exactly one flood fill that consumes its whole island — so launches ≡ islands."]
      },
      code: {
        prompts: ["Where do you bounds-check: before recursing or at function entry?", "Mark visited BEFORE or AFTER pushing to the queue — which prevents double-adds?"],
        hints: ["Entry-guard (check r, c valid and land, else return) keeps the code shortest. With BFS, sink the cell when you ENQUEUE it, not when you pop."]
      },
      test: {
        prompts: ["Trace a 1-cell island and a snake-shaped island.", "What are time and space, including the recursion/queue worst case?"],
        hints: ["O(rows × cols) time — every cell touched a constant number of times. Space O(rows × cols) worst case (all land)."]
      }
    },
    rubric: [
      { phase: "clarify", text: "Asked about diagonals and about permission to mutate the grid." },
      { phase: "brute",   text: "Named the recursion-depth risk and the iterative alternative." },
      { phase: "plan",    text: "Stated the count = flood-fill-launches equivalence in one sentence." },
      { phase: "plan",    text: "Chose DFS or BFS deliberately and said why." },
      { phase: "code",    text: "Clean entry-guard flood fill (bounds + water check at function top)." },
      { phase: "code",    text: "Marked cells visited at the right moment (no double-enqueue)." },
      { phase: "code",    text: "Complete: outer scan, counter, flood fill consuming the island." },
      { phase: "test",    text: "Traced a single-cell and an irregular island." },
      { phase: "test",    text: "Stated O(m·n) time and the worst-case space honestly." }
    ],
    model: "<p><b>Shape:</b> scan every cell; each unvisited land cell launches one flood fill that sinks its whole island; count the launches.</p><p><b>Core code (DFS):</b></p><p><code>def sink(r, c):</code><br><code>&nbsp;&nbsp;if not (0 &lt;= r &lt; R and 0 &lt;= c &lt; C) or g[r][c] != \"1\": return</code><br><code>&nbsp;&nbsp;g[r][c] = \"0\"</code><br><code>&nbsp;&nbsp;sink(r+1, c); sink(r-1, c); sink(r, c+1); sink(r, c-1)</code></p><p><b>The senior moves:</b> asked to mutate the grid (visited set for free); flagged Python recursion depth and offered the iterative version; the launches ≡ islands argument stated crisply.</p>"
  },

  {
    id: "house-robber", level: "core", lesson: "pat-dp",
    title: "House Robber",
    prompt: "Houses on a street each hold some money. You can't rob two adjacent houses. What's the most you can steal?",
    phaseNotes: {
      clarify: {
        prompts: ["What's the answer for [], [5], and [2, 1]?", "Can amounts be zero? Negative?"],
        hints: ["[] → 0, [5] → 5, [2,1] → 2. Amounts are non-negative — worth confirming since it licenses \"skipping is never forced\"."]
      },
      brute: {
        prompts: ["Every house is a take-or-skip choice — how many combinations?", "Why does recursion without memo blow up?"],
        hints: ["O(2ⁿ) subsets (minus adjacency violations). rob(i) = max(rob(i+1), nums[i] + rob(i+2)) recomputes the same suffixes exponentially often."]
      },
      plan: {
        prompts: ["Define your state in words: \"best loot considering houses 0..i\".", "Write the recurrence on paper before any code. What are the base cases?"],
        hints: ["dp[i] = max(dp[i-1], dp[i-2] + nums[i]) — skip house i, or take it plus the best two back. Only two previous values are ever needed → two variables."]
      },
      code: {
        prompts: ["Can you do O(1) space with two rolling variables?", "Watch the update order — which variable becomes which?"],
        hints: ["prev2, prev1 = prev1, max(prev1, prev2 + x) — Python's tuple assignment dodges the temp-variable bug."]
      },
      test: {
        prompts: ["Trace [2, 7, 9, 3, 1] — expected 12 (2 + 9 + 1).", "Check [] and [5] against your base cases."],
        hints: ["Steps: (0,2) → (2,7) → (7,11) → (11,11) → (11,12). O(n) time, O(1) space."]
      }
    },
    rubric: [
      { phase: "clarify", text: "Answered [], [5], [2,1] before designing anything." },
      { phase: "brute",   text: "Framed it as take-or-skip and stated the O(2ⁿ) naive cost." },
      { phase: "plan",    text: "Defined the state in words (best for prefix ending at i)." },
      { phase: "plan",    text: "Wrote the recurrence max(dp[i-1], dp[i-2] + nums[i]) with base cases." },
      { phase: "plan",    text: "Noticed only two previous values matter → O(1) space plan." },
      { phase: "code",    text: "Implemented rolling variables with a correct simultaneous update." },
      { phase: "code",    text: "Handled empty and single-house inputs without special-case spaghetti." },
      { phase: "test",    text: "Traced [2,7,9,3,1] to 12 showing both variables each step." },
      { phase: "test",    text: "Stated O(n) time / O(1) space, and named the circular-street follow-up." }
    ],
    model: "<p><b>Shape:</b> 1-D DP; each house is skip (keep dp[i-1]) or take (dp[i-2] + money); only two trailing values survive.</p><p><b>Core code:</b></p><p><code>prev2 = prev1 = 0</code><br><code>for x in nums:</code><br><code>&nbsp;&nbsp;prev2, prev1 = prev1, max(prev1, prev2 + x)</code><br><code>return prev1</code></p><p><b>The senior moves:</b> recurrence stated in words first; the space squeeze from array to two variables narrated; House Robber II (circular street = run twice excluding first/last) offered as the follow-up.</p>"
  },

  {
    id: "jump-game", level: "core", lesson: "pat-greedy",
    title: "Jump Game",
    prompt: "Each array slot tells you the farthest you may jump forward from it. Starting at index 0, can you reach the last index?",
    phaseNotes: {
      clarify: {
        prompts: ["Is nums[i] the EXACT jump or the MAXIMUM jump? (It changes everything.)", "What's the answer for [0]? For [3, 2, 1, 0, 4]?"],
        hints: ["Maximum — you may jump any shorter distance. [0] → true (already there). [3,2,1,0,4] → false: everything funnels into the 0 at index 3."]
      },
      brute: {
        prompts: ["What graph hides here? What would BFS/DFS over \"index → reachable indices\" cost?", "What about DP on \"is index i reachable\"?"],
        hints: ["BFS/DP over all (index, jump) edges is O(n²) worst case. Name it, then beat it."]
      },
      plan: {
        prompts: ["What ONE number summarizes everything about the prefix you've processed?", "When exactly are you stuck?"],
        hints: ["Greedy: carry `reach`, the farthest index touchable so far. Stuck iff i &gt; reach. The exchange argument: any plan reaching X is matched by always-extend-reach."]
      },
      code: {
        prompts: ["Where does the loop end — and can you early-exit?", "This is 5 lines; spend the rest narrating WHY greedy is safe here."],
        hints: ["for i, x in enumerate(nums): if i &gt; reach: return False; reach = max(reach, i + x). Early-return True when reach ≥ last."]
      },
      test: {
        prompts: ["Trace [3, 2, 1, 0, 4] — show reach getting stuck at 3.", "Trace [2, 3, 1, 1, 4] — true. And the single-element list."],
        hints: ["reach: 3, 3, 3, 3 then i=4 &gt; 3 → False. O(n) time, O(1) space."]
      }
    },
    rubric: [
      { phase: "clarify", text: "Confirmed max-not-exact jumps and answered [0] and the funnel example." },
      { phase: "brute",   text: "Named the O(n²) BFS/DP baseline over jump edges." },
      { phase: "plan",    text: "Reduced all prefix state to one number: farthest reach." },
      { phase: "plan",    text: "Gave a why-greedy-is-safe argument (extending reach never hurts)." },
      { phase: "code",    text: "Wrote the one-pass loop with the i &gt; reach stuck-check first." },
      { phase: "code",    text: "Updated reach with max(reach, i + nums[i]) — not overwrite." },
      { phase: "test",    text: "Traced the false case showing where reach freezes." },
      { phase: "test",    text: "Stated O(n)/O(1) and mentioned Jump Game II (min jumps) as the follow-up." }
    ],
    model: "<p><b>Shape:</b> greedy single pass carrying `reach` = farthest touchable index; stuck the moment i outruns it.</p><p><b>Core code:</b></p><p><code>reach = 0</code><br><code>for i, x in enumerate(nums):</code><br><code>&nbsp;&nbsp;if i &gt; reach: return False</code><br><code>&nbsp;&nbsp;reach = max(reach, i + x)</code><br><code>return True</code></p><p><b>The senior moves:</b> the greedy-safety argument said out loud (more reach is never worse — the exchange argument); the funnel counex traced; Jump Game II named as the natural extension.</p>"
  },

  /* ---------------- ADVANCED ---------------- */
  {
    id: "coin-change", level: "advanced", lesson: "pat-dp",
    title: "Coin Change",
    prompt: "Given coin denominations and a target amount, return the fewest coins that make the amount exactly — or -1 if it can't be done. You have unlimited coins of each type.",
    phaseNotes: {
      clarify: {
        prompts: ["Amount 0 — answer 0? Can a coin be larger than the amount?", "Try greedy on coins [1, 3, 4], amount 6. What happens?"],
        hints: ["Greedy picks 4+1+1 = 3 coins; optimal is 3+3 = 2. Showing this counterexample unprompted is a hire signal — it's WHY this is DP."]
      },
      brute: {
        prompts: ["Full recursion: every coin at every step — what's the cost?", "What's being recomputed?"],
        hints: ["O(coinsᵃᵐᵒᵘⁿᵗ) branching. fewest(rem) is recomputed for the same remainder along different paths — the memo target."]
      },
      plan: {
        prompts: ["Define dp[a] in words. What's dp[0]? What does each dp[a] look back at?", "Unbounded coins — does coin order in the loops matter for THIS problem?"],
        hints: ["dp[a] = fewest coins for amount a = 1 + min(dp[a - c]) over usable coins; dp[0] = 0; infinity as \"unreachable\". For counting MIN (not combinations) the loop order doesn't matter."]
      },
      code: {
        prompts: ["What do you initialize the table with, and why infinity rather than -1?", "What's the final translation back to -1?"],
        hints: ["inf propagates harmlessly through min(); -1 would poison it. Convert once at the end: return dp[amount] if finite else -1."]
      },
      test: {
        prompts: ["Trace coins [1,3,4], amount 6 — confirm dp[6] = 2.", "Test amount 0, and coins [2] with amount 3 (the -1 case)."],
        hints: ["dp: [0,1,2,1,1,2,2]. O(amount × coins) time, O(amount) space."]
      }
    },
    rubric: [
      { phase: "clarify", text: "Settled amount-0 and produced the greedy counterexample ([1,3,4] → 6) unprompted." },
      { phase: "brute",   text: "Stated the exponential recursion cost and what gets recomputed." },
      { phase: "plan",    text: "Defined dp[a] in words with dp[0] = 0 base." },
      { phase: "plan",    text: "Chose infinity as the unreachable marker and justified it." },
      { phase: "plan",    text: "Stated target complexity O(amount × coins) before coding." },
      { phase: "code",    text: "Built the table bottom-up with the inner min over coins." },
      { phase: "code",    text: "Guarded c ≤ a (or ranged the loop) — no negative indices." },
      { phase: "code",    text: "Translated infinity → -1 exactly once at the end." },
      { phase: "test",    text: "Traced dp up to 6 on the counterexample coins." },
      { phase: "test",    text: "Hit the unreachable case ([2], 3) and amount 0." }
    ],
    model: "<p><b>Shape:</b> unbounded-knapsack DP over amounts; dp[a] = 1 + min(dp[a−c]); inf marks unreachable.</p><p><b>Core code:</b></p><p><code>dp = [0] + [float(\"inf\")] * amount</code><br><code>for a in range(1, amount + 1):</code><br><code>&nbsp;&nbsp;for c in coins:</code><br><code>&nbsp;&nbsp;&nbsp;&nbsp;if c &lt;= a: dp[a] = min(dp[a], dp[a - c] + 1)</code><br><code>return dp[amount] if dp[amount] != float(\"inf\") else -1</code></p><p><b>The senior moves:</b> greedy disproven with a 5-second counterexample; inf-vs-−1 design choice explained; the \"min doesn't care about loop order, counting combinations would\" distinction earns bonus depth.</p>"
  },

  {
    id: "rotated-search", level: "advanced", lesson: "pat-binary-search",
    title: "Search in Rotated Sorted Array",
    prompt: "A sorted array of distinct numbers was rotated at an unknown pivot — like [4,5,6,7,0,1,2]. Find the index of a target in O(log n), or -1.",
    phaseNotes: {
      clarify: {
        prompts: ["Distinct values? (Duplicates genuinely change the algorithm.)", "Could the rotation be zero — a fully sorted array?"],
        hints: ["Distinct, and yes — rotation by 0 must work. Asking about duplicates shows you know the degenerate O(n) variant exists."]
      },
      brute: {
        prompts: ["Linear scan is O(n) — why is it worth saying anyway?", "Could you find the pivot first, then do two binary searches?"],
        hints: ["Pivot-then-search is a valid O(log n) two-pass plan — naming it then improving to one pass is a great arc."]
      },
      plan: {
        prompts: ["Key insight: cut the array at mid — what's ALWAYS true about the two halves?", "Given the sorted half, how do you decide where target lives?"],
        hints: ["At least one half is properly sorted. Check if target lies within the sorted half's endpoints: if yes, search there; if no, the other half — certainty comes from the sorted side."]
      },
      code: {
        prompts: ["Which comparison identifies the sorted half — nums[lo] ≤ nums[mid]?", "Be surgical with ≤ vs &lt; here; off-by-ones are THE failure mode."],
        hints: ["if nums[lo] &lt;= nums[mid]: left half sorted → descend there iff nums[lo] &lt;= target &lt; nums[mid]; else right half sorted → mirror logic."]
      },
      test: {
        prompts: ["Trace target 0 in [4,5,6,7,0,1,2], then target 4 (first element) and 2 (last).", "Test the unrotated array and the single-element array."],
        hints: ["Each iteration halves the range → O(log n), O(1) space."]
      }
    },
    rubric: [
      { phase: "clarify", text: "Asked about duplicates and the zero-rotation case." },
      { phase: "brute",   text: "Offered the two-pass plan (find pivot, then binary search) before the one-pass." },
      { phase: "plan",    text: "Stated the invariant: one half of any cut is always sorted." },
      { phase: "plan",    text: "Decision rule via the sorted half's endpoints, stated before coding." },
      { phase: "code",    text: "Identified the sorted half with nums[lo] ≤ nums[mid]." },
      { phase: "code",    text: "Range checks use the right mix of ≤ and &lt; (no off-by-one)." },
      { phase: "code",    text: "Loop terminates correctly (lo ≤ hi with ±1 moves) — no infinite loop." },
      { phase: "test",    text: "Traced a target in the rotated tail AND at both array ends." },
      { phase: "test",    text: "Stated O(log n)/O(1) and what duplicates would break." }
    ],
    model: "<p><b>Shape:</b> binary search where each step first identifies the sorted half, then tests whether target lies inside it.</p><p><b>Core code:</b></p><p><code>while lo &lt;= hi:</code><br><code>&nbsp;&nbsp;mid = (lo + hi) // 2</code><br><code>&nbsp;&nbsp;if nums[mid] == target: return mid</code><br><code>&nbsp;&nbsp;if nums[lo] &lt;= nums[mid]:&nbsp;&nbsp;# left half sorted</code><br><code>&nbsp;&nbsp;&nbsp;&nbsp;if nums[lo] &lt;= target &lt; nums[mid]: hi = mid - 1</code><br><code>&nbsp;&nbsp;&nbsp;&nbsp;else: lo = mid + 1</code><br><code>&nbsp;&nbsp;else:&nbsp;&nbsp;# right half sorted</code><br><code>&nbsp;&nbsp;&nbsp;&nbsp;if nums[mid] &lt; target &lt;= nums[hi]: lo = mid + 1</code><br><code>&nbsp;&nbsp;&nbsp;&nbsp;else: hi = mid - 1</code></p><p><b>The senior moves:</b> the always-one-sorted-half invariant stated as the plan; certainty drawn only from the sorted side; duplicates named as the variant that degrades to O(n).</p>"
  },

  {
    id: "implement-trie", level: "advanced", lesson: "pat-tries",
    title: "Implement a Trie",
    prompt: "Build a prefix tree supporting insert(word), search(word) — exact words only — and startsWith(prefix). Lowercase letters.",
    phaseNotes: {
      clarify: {
        prompts: ["The crucial distinction: search(\"app\") after insert(\"apple\") — true or false?", "Empty string inserts/searches — defined?"],
        hints: ["False — \"app\" is a prefix, not an inserted word. That's exactly why nodes need an end-of-word flag. Empty string: startsWith(\"\") is true; treat search(\"\") per your stated convention."]
      },
      brute: {
        prompts: ["A set of words handles search — where does it fail?", "What would startsWith cost on a flat set?"],
        hints: ["startsWith on a set means scanning every word: O(N · L). The trie's whole point: prefix queries in O(L) regardless of dictionary size."]
      },
      plan: {
        prompts: ["What is a node, concretely, in Python? What two things does it hold?", "Why do search and startsWith share 90% of their code?"],
        hints: ["Node = {children: dict char→node, end: bool}. Both walk the prefix; search additionally checks node.end. Factor a _walk(prefix) helper."]
      },
      code: {
        prompts: ["insert: what happens at a missing child — setdefault or explicit check?", "Did you factor the shared walk, or copy-paste two loops?"],
        hints: ["node = node.children.setdefault(ch, TrieNode()) is the cleanest insert step. _walk returns the final node or None."]
      },
      test: {
        prompts: ["Run the classic script: insert apple → search apple ✓ / search app ✗ / startsWith app ✓ / insert app → search app ✓.", "State costs in terms of word length L."],
        hints: ["All three ops O(L) time; space O(total characters inserted)."]
      }
    },
    rubric: [
      { phase: "clarify", text: "Nailed the search-vs-startsWith semantics with the apple/app example." },
      { phase: "brute",   text: "Compared against a set and showed where startsWith collapses to O(N·L)." },
      { phase: "plan",    text: "Defined the node as children-dict + end flag (no 26-array premature optimization without saying why)." },
      { phase: "plan",    text: "Planned the shared _walk helper for search/startsWith." },
      { phase: "code",    text: "insert builds missing children cleanly (setdefault or equivalent)." },
      { phase: "code",    text: "search = walk ∧ end flag; startsWith = walk only — no duplication." },
      { phase: "code",    text: "All three methods complete and runnable." },
      { phase: "test",    text: "Ran the apple/app script in order, predicting each result." },
      { phase: "test",    text: "Stated O(L) per op and O(total chars) space." }
    ],
    model: "<p><b>Shape:</b> nodes are tiny dicts plus an end-of-word flag; every operation is \"walk the string one letter at a time\".</p><p><b>Core code:</b></p><p><code>class TrieNode:</code><br><code>&nbsp;&nbsp;def __init__(self): self.children, self.end = {}, False</code><br><br><code>def insert(self, word):</code><br><code>&nbsp;&nbsp;node = self.root</code><br><code>&nbsp;&nbsp;for ch in word: node = node.children.setdefault(ch, TrieNode())</code><br><code>&nbsp;&nbsp;node.end = True</code><br><br><code>def _walk(self, s):</code><br><code>&nbsp;&nbsp;node = self.root</code><br><code>&nbsp;&nbsp;for ch in s:</code><br><code>&nbsp;&nbsp;&nbsp;&nbsp;if ch not in node.children: return None</code><br><code>&nbsp;&nbsp;&nbsp;&nbsp;node = node.children[ch]</code><br><code>&nbsp;&nbsp;return node</code></p><p><b>The senior moves:</b> apple/app semantics settled in phase 1 (it IS the end-flag design); the _walk factoring; the honest set-comparison that motivates the structure.</p>"
  },

  {
    id: "koko-bananas", level: "advanced", lesson: "pat-binary-search",
    title: "Koko Eating Bananas",
    prompt: "Koko has piles of bananas and h hours. Each hour she picks one pile and eats up to k bananas from it. Find the minimum integer speed k that finishes all piles within h hours.",
    phaseNotes: {
      clarify: {
        prompts: ["If a pile is smaller than k, does the leftover hour carry over? (No — that's the ceiling.)", "Is h always ≥ the number of piles? What bounds k?"],
        hints: ["Hours per pile = ceil(pile / k); partial hours are wasted. h ≥ len(piles) or it's impossible. k ranges 1..max(piles)."]
      },
      brute: {
        prompts: ["Try every speed from 1 upward — cost?", "What's the reusable helper both brute force and the real solution share?"],
        hints: ["O(max(piles) × n). The helper hours(k) = Σ ceil(p/k) is the same either way — write it once."]
      },
      plan: {
        prompts: ["Key property: if speed k works, does k+1 work? What does that monotonic NNNYYY shape let you do?", "What are lo and hi, and what does the loop converge to?"],
        hints: ["Binary search ON THE ANSWER: search the smallest k where canFinish(k) is true — the boundary of a monotonic predicate. lo=1, hi=max(piles)."]
      },
      code: {
        prompts: ["Integer ceil without math.ceil — what's the idiom?", "When hours(mid) ≤ h, where does hi go — mid or mid−1?"],
        hints: ["-(-p // k) or (p + k - 1) // k. Feasible mid stays in range: hi = mid (not mid−1); infeasible: lo = mid+1. Converges when lo == hi."]
      },
      test: {
        prompts: ["Trace piles [3, 6, 7, 11], h = 8 — expected 4.", "Edge: h == len(piles) forces k = max(piles). Single pile?"],
        hints: ["O(n log max(piles)) time, O(1) space. The log is over the ANSWER range, not the array — say that explicitly."]
      }
    },
    rubric: [
      { phase: "clarify", text: "Pinned the ceiling rule (wasted partial hours) and the k bounds 1..max(piles)." },
      { phase: "brute",   text: "Stated try-every-speed O(max·n) and factored hours(k) as the shared helper." },
      { phase: "plan",    text: "Named the monotonic yes/no boundary → binary search on the ANSWER, not the array." },
      { phase: "plan",    text: "Set lo = 1, hi = max(piles) with a one-line justification each." },
      { phase: "code",    text: "Wrote hours(k) with correct integer ceiling." },
      { phase: "code",    text: "Feasible → hi = mid, infeasible → lo = mid + 1 (keeps the answer in range)." },
      { phase: "code",    text: "Loop converges (while lo &lt; hi) — no infinite loop, returns lo." },
      { phase: "test",    text: "Traced [3,6,7,11], h=8 to k=4." },
      { phase: "test",    text: "Stated O(n log max(piles)) and that the log is over the answer space." }
    ],
    model: "<p><b>Shape:</b> the answers form NNN…YYY as k grows — binary-search the boundary. Same template as ship-capacity and split-array problems.</p><p><b>Core code:</b></p><p><code>def hours(k): return sum((p + k - 1) // k for p in piles)</code><br><br><code>lo, hi = 1, max(piles)</code><br><code>while lo &lt; hi:</code><br><code>&nbsp;&nbsp;mid = (lo + hi) // 2</code><br><code>&nbsp;&nbsp;if hours(mid) &lt;= h: hi = mid</code><br><code>&nbsp;&nbsp;else: lo = mid + 1</code><br><code>return lo</code></p><p><b>The senior moves:</b> \"binary search on the answer\" named as a pattern, not improvised; the keep-feasible-mid-in-range rule (hi = mid) explained; the log-over-answer-space complexity nuance stated.</p>"
  },

  /* ---------------- EXPERT ---------------- */
  {
    id: "accounts-merge", level: "expert", lesson: "pat-union-find",
    title: "Accounts Merge",
    prompt: "Each account is a name plus a list of emails. Two accounts belong to the same person if they share ANY email (names can repeat across different people). Merge each person's accounts: output name + all their emails, sorted.",
    phaseNotes: {
      clarify: {
        prompts: ["Same name, no shared email — same person? Shared email, transitively (A–B share, B–C share)?", "What exactly is the output format — sorted emails, name from where?"],
        hints: ["Names never identify people; only shared emails do, and the relation is transitive (A∪B, B∪C ⇒ one person). Output: [name, sorted unique emails]."]
      },
      brute: {
        prompts: ["Pairwise compare accounts and merge until stable — what's the cost?", "What abstract problem is \"transitively grouped by shared element\"?"],
        hints: ["Repeated pairwise merging is O(n² · emails) and fiddly. The abstraction: connected components — solvable by graph DFS or union-find."]
      },
      plan: {
        prompts: ["What do you union — accounts or emails? What's the parent map keyed by?", "Where do path compression and union-by-rank fit? What's the final regroup step?"],
        hints: ["Union emails: first email of each account unions with the rest. find(email) with path compression; then one pass grouping every email under find(email), attaching the account's name."]
      },
      code: {
        prompts: ["Write find with path compression first — two lines, recursive or iterative.", "Track an email → name map as you scan; where does sorting happen?"],
        hints: ["def find(x): parent.setdefault(x, x); if parent[x] != x: parent[x] = find(parent[x]); return parent[x] — then union(a, b): parent[find(a)] = find(b)."]
      },
      test: {
        prompts: ["Trace two Johns sharing one email plus an unrelated Mary.", "What's the complexity in terms of total emails E (with α(E) ≈ constant)?"],
        hints: ["O(E · α(E) + E log E) — the sort dominates. Distinct people named John must NOT merge; check that case."]
      }
    },
    rubric: [
      { phase: "clarify", text: "Established that names don't identify people and shared-email is transitive." },
      { phase: "clarify", text: "Pinned the exact output shape (name + sorted unique emails)." },
      { phase: "brute",   text: "Recognized \"connected components\" as the abstraction (DFS or union-find both named)." },
      { phase: "plan",    text: "Chose to union EMAILS (not account indices) and justified it — or chose indices and handled it cleanly." },
      { phase: "plan",    text: "Planned the three passes: union, find-regroup, format/sort." },
      { phase: "code",    text: "find() with path compression written correctly." },
      { phase: "code",    text: "Union of each account's emails to its first email." },
      { phase: "code",    text: "Regroup by root with the email → name map; sorted output." },
      { phase: "test",    text: "Traced the two-Johns-one-shared-email case AND the same-name-different-person case." },
      { phase: "test",    text: "Stated O(E α(E) + E log E) with the sort called out as dominant." }
    ],
    model: "<p><b>Shape:</b> union-find over emails; each account chains its emails to its first; components = people; sort at the end.</p><p><b>Core code:</b></p><p><code>parent = {}</code><br><code>def find(x):</code><br><code>&nbsp;&nbsp;parent.setdefault(x, x)</code><br><code>&nbsp;&nbsp;if parent[x] != x: parent[x] = find(parent[x])</code><br><code>&nbsp;&nbsp;return parent[x]</code><br><br><code>for name, *emails in accounts:</code><br><code>&nbsp;&nbsp;for e in emails:</code><br><code>&nbsp;&nbsp;&nbsp;&nbsp;owner[e] = name</code><br><code>&nbsp;&nbsp;&nbsp;&nbsp;parent[find(e)] = find(emails[0])</code><br><br><code>groups = defaultdict(list)</code><br><code>for e in owner: groups[find(e)].append(e)</code><br><code>return [[owner[r]] + sorted(g) for r, g in groups.items()]</code></p><p><b>The senior moves:</b> the names-don't-identify trap defused in phase 1; \"connected components\" said before any code; path compression written without hesitation; the sort named as the true bottleneck.</p>"
  },

  {
    id: "largest-rect", level: "expert", lesson: "pat-stack",
    title: "Largest Rectangle in Histogram",
    prompt: "Given bar heights in a histogram (all width 1), return the area of the largest rectangle that fits entirely inside it.",
    phaseNotes: {
      clarify: {
        prompts: ["Must the rectangle sit on the floor and span contiguous bars? Can heights be zero?", "Hand-compute [2, 1, 5, 6, 2, 3] — what's the answer and which bars give it?"],
        hints: ["Yes — contiguous bars, height limited by the shortest in the span. Answer: 10, from bars 5 and 6 (height 5 × width 2)."]
      },
      brute: {
        prompts: ["For every pair (i, j): area = min-height × width — cost?", "For each bar as the SHORTEST: how far can it extend? Still O(n²), but it's the reframe that unlocks O(n)."],
        hints: ["All-pairs is O(n²) (O(n³) if you recompute mins naively). The \"each bar as the limiting height\" view is the bridge to the stack."]
      },
      plan: {
        prompts: ["For each bar: who is the first shorter bar to the left, and to the right? Those are its walls.", "Which structure finds first-shorter-on-each-side in one pass? When does a bar's area get finalized?"],
        hints: ["Monotonic increasing stack of indices. A bar pops (finalizes) when a shorter bar arrives — the new bar is its right wall, the new stack top its left wall. Width = i − stack[-1] − 1, or i if the stack emptied."]
      },
      code: {
        prompts: ["Append a sentinel 0 height (or flush after the loop) so every bar finalizes.", "Get the width formula EXACTLY right — it's the classic off-by-one."],
        hints: ["for i, h in enumerate(heights + [0]): while stack and heights[stack[-1]] &gt; h: top = stack.pop(); width = i - stack[-1] - 1 if stack else i; best = max(best, heights[top] * width)"]
      },
      test: {
        prompts: ["Trace [2, 1, 5, 6, 2, 3] to 10, narrating each pop.", "Test increasing [1,2,3], decreasing [3,2,1], all-equal [4,4,4], and a single bar."],
        hints: ["The sentinel flushes [3,2,1]-style stacks. Each index pushes/pops once → amortized O(n), O(n) stack."]
      }
    },
    rubric: [
      { phase: "clarify", text: "Pinned contiguity + min-height rule and hand-computed the classic example to 10." },
      { phase: "brute",   text: "Gave the O(n²) all-pairs baseline AND the per-bar-as-shortest reframe." },
      { phase: "plan",    text: "Framed it as first-shorter-to-left/right walls per bar." },
      { phase: "plan",    text: "Chose a monotonic increasing stack and stated WHEN a bar finalizes (on pop)." },
      { phase: "code",    text: "Used a sentinel (or explicit flush) so the stack fully drains." },
      { phase: "code",    text: "Width formula correct including the emptied-stack case (width = i)." },
      { phase: "code",    text: "Complete working loop with best-area tracking." },
      { phase: "test",    text: "Traced the example narrating at least two pops." },
      { phase: "test",    text: "Hit increasing/decreasing/all-equal edges and argued amortized O(n)." }
    ],
    model: "<p><b>Shape:</b> each bar's best rectangle is bounded by the first shorter bar on each side; a monotonic increasing stack discovers both walls in one pass.</p><p><b>Core code:</b></p><p><code>best, stack = 0, []</code><br><code>for i, h in enumerate(heights + [0]):&nbsp;&nbsp;# sentinel flushes everyone</code><br><code>&nbsp;&nbsp;while stack and heights[stack[-1]] &gt; h:</code><br><code>&nbsp;&nbsp;&nbsp;&nbsp;top = stack.pop()</code><br><code>&nbsp;&nbsp;&nbsp;&nbsp;width = i - stack[-1] - 1 if stack else i</code><br><code>&nbsp;&nbsp;&nbsp;&nbsp;best = max(best, heights[top] * width)</code><br><code>&nbsp;&nbsp;stack.append(i)</code><br><code>return best</code></p><p><b>The senior moves:</b> the walls reframe before any stack talk; the sentinel trick named; the empty-stack width case handled and tested; amortized O(n) argued via push-once-pop-once.</p>"
  }
];
