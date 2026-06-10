/* ============================================================
   The Design Field Guide — drill bank
   The question bank for the machine-coding drill engine (drill.js).
   Each drill: id · title · level (warm|core|advanced|expert) ·
   lesson (a window.LESSONS id, for the "Study this" link) ·
   prompt · phaseNotes { <phase-key>: { prompts:[], hints:[] } } ·
   rubric [{ phase, text }] · model (HTML, entity-escape generics).
   ============================================================ */

/* The 45-minute machine-coding loop. Total = sum of min. */
window.LLD_DRILL_PHASES = [
  { key: "requirements", label: "Requirements",      min: 5,
    doing: "Clarify actors, the core flows, and what is OUT of scope. Name the 2–3 invariants the design must protect (the things that must never be wrong)." },
  { key: "entities",     label: "Entities & API",    min: 10,
    doing: "List the classes and enums, then the public API surface: the exact method signatures a caller would use. Say which class owns which piece of state." },
  { key: "uml",          label: "UML & patterns",    min: 10,
    doing: "Sketch the relationships — composition vs inheritance, multiplicities — and name the design patterns you're reaching for and WHY each one earns its place." },
  { key: "code",         label: "Core code",         min: 15,
    doing: "Write the 2–3 hardest methods for real: the state transition, the concurrency-sensitive path, the central algorithm. Working core code beats broad stubs." },
  { key: "wrap",         label: "Extensions & wrap", min: 5,
    doing: "Walk one scenario end to end, call out thread-safety gaps honestly, and pitch two extensions you'd build next." }
];

window.LLD_DRILLS = [

  /* ============ WARM ============ */
  {
    id: "vending-machine",
    title: "Vending machine",
    level: "warm",
    lesson: "lld-vending-machine",
    prompt: "Design a vending machine: insert coins, select a product, dispense with change, cancel for a refund. Show me the state handling — no if-ladders.",
    phaseNotes: {
      requirements: {
        prompts: [
          "What happens when select() is pressed while no money is in?",
          "Is exact change required? Can the user cancel mid-dispense?"
        ],
        hints: ["Invariants: balance never negative; a product is dispensed at most once per payment; refund returns exactly the balance."]
      },
      entities: {
        prompts: ["Who owns the inventory — the machine or the states?", "What is the full public API? (insert_coin, select, dispense, cancel)"],
        hints: ["Keep shared data (balance, inventory) on the machine (the context); states hold behavior, not data."]
      },
      uml: {
        prompts: ["Draw the State interface and its three concrete states.", "Why State and not Strategy here?"],
        hints: ["State objects drive their own transitions via machine.set_state(...); a Strategy is picked by the client and stays put."]
      },
      code: {
        prompts: ["Write HasMoneyState.select() with both rejection paths (out of stock, insufficient balance).", "Write the dispense + reset-to-idle transition."],
        hints: ["Give the abstract state rejecting defaults so each state only overrides what it allows."]
      },
      wrap: {
        prompts: ["Walk: insert 100c, insert 25c, select cola(125c).", "Extensions: SoldOut state? Card payments as a Strategy?"]
      }
    },
    rubric: [
      { phase: "requirements", text: "Asked what each event means in each state (select while idle, coin while dispensing) instead of assuming." },
      { phase: "requirements", text: "Named the invariants: non-negative balance, at-most-once dispense, exact refund." },
      { phase: "entities", text: "Context (VendingMachine) owns balance + inventory; states are stateless behavior objects." },
      { phase: "entities", text: "Public API is event-shaped: insert_coin / select / dispense / cancel — no setState exposed to callers." },
      { phase: "uml", text: "Drew VendingState «interface» with one concrete class per state implementing it." },
      { phase: "uml", text: "Explained State vs Strategy: states swap THEMSELVES via set_state; strategies don't." },
      { phase: "code", text: "Wrote a real select() with both rejections (stock, balance) and the transition to Dispensing." },
      { phase: "code", text: "Dispense decrements stock, returns change, resets balance, transitions back to Idle." },
      { phase: "wrap", text: "Walked one full purchase out loud, ending back in Idle with correct inventory." },
      { phase: "wrap", text: "Pitched extensions as new states/strategies (SoldOut, card payment) — no edits to existing states." }
    ],
    model: "<p><b>Shape:</b> a <code>VendingMachine</code> context holding <code>balance</code>, <code>inventory</code>, <code>selected</code> and a current <code>VendingState</code>; an abstract <code>VendingState</code> whose default for every event is a printed rejection; three concrete states — <code>Idle</code>, <code>HasMoney</code>, <code>Dispensing</code> — each overriding only the events it allows and calling <code>machine.set_state(...)</code> to move on.</p><p><b>The senior moves:</b> rejecting defaults on the ABC (each state stays tiny), transitions owned by the states themselves, money in integer cents, and <code>HasMoneyState.select</code> checking stock <i>then</i> balance with specific error messages. Extensions land as new classes: a <code>SoldOutState</code> entered from dispense when inventory hits zero, and <code>cancel()</code> as a default-rejected event overridden only in <code>HasMoney</code>.</p>"
  },

  /* ============ CORE ============ */
  {
    id: "parking-lot",
    title: "Parking lot",
    level: "core",
    lesson: "lld-parking-lot",
    prompt: "Design a parking lot: multiple floors, different spot sizes, ticket on entry, fee on exit. I want clean entities and a pricing approach that survives a product change.",
    phaseNotes: {
      requirements: {
        prompts: [
          "Vehicle types? Can a motorcycle take a large spot? Can a truck take two spots?",
          "How is the fee computed — flat, hourly, per vehicle type?"
        ],
        hints: ["Invariants: one vehicle per spot; a ticket maps to exactly one parked vehicle; fee is computed from the ticket's own timestamps."]
      },
      entities: {
        prompts: ["List: ParkingLot, Floor, ParkingSpot (sizes), Vehicle (types), Ticket, a pricing object.", "What does park() return and what does unpark() take?"],
        hints: ["park(vehicle) → Ticket and unpark(ticket) → fee keeps the API two calls wide; everything else is internal."]
      },
      uml: {
        prompts: ["Composition spine: Lot ◆ Floors ◆ Spots. Where is the only inheritance?", "Which pattern isolates pricing?"],
        hints: ["Strategy for pricing (HourlyPricing, WeekendPricing…) injected into the lot — product can change fees without touching allocation."]
      },
      code: {
        prompts: ["Write the spot-allocation method: smallest free spot that fits the vehicle.", "Write unpark(): free the spot, compute fee via the strategy."],
        hints: ["fits() logic belongs on the spot (or a size-ordering table), not in a type-switch inside the lot."]
      },
      wrap: {
        prompts: ["Walk: car parks on floor 0, leaves after 2h, pays.", "Extensions: EV spots with chargers? Reservations? Thread safety at the entry gate?"]
      }
    },
    rubric: [
      { phase: "requirements", text: "Pinned vehicle/spot size matrix (can small vehicles take big spots?) before designing." },
      { phase: "requirements", text: "Asked how pricing varies — the cue that pricing must be swappable." },
      { phase: "entities", text: "Two-method public API: park(vehicle) → Ticket, unpark(ticket) → fee." },
      { phase: "entities", text: "Ticket records spot + entry time so the fee needs no global lookup state." },
      { phase: "uml", text: "Drew Lot ◆ Floor ◆ Spot as composition (filled diamonds), inheritance only at spot/vehicle leaves." },
      { phase: "uml", text: "Named Strategy for pricing and said why: open for new fee schemes, closed for allocation changes." },
      { phase: "code", text: "Allocation finds the smallest fitting free spot (ordered sizes), not first-anything." },
      { phase: "code", text: "unpark() frees the spot, computes duration from the ticket, delegates fee to the strategy." },
      { phase: "wrap", text: "Mentioned the concurrency hazard: two gates allocating the same spot → need a lock or per-floor locks." },
      { phase: "wrap", text: "Extensions are additive: EVSpot subclass + ChargingPricing decorator/strategy; no allocation rewrite." }
    ],
    model: "<p><b>Shape:</b> <code>ParkingLot</code> ◆ <code>Floor</code> ◆ <code>ParkingSpot</code> by composition; <code>SpotSize</code>/<code>VehicleType</code> enums with an ordered fits-table; <code>Ticket(id, spot, entered_at)</code>; <code>PricingStrategy</code> with <code>fee(ticket, now) → int</code> injected into the lot. Public API: <code>park(vehicle) → Ticket</code>, <code>unpark(ticket) → fee</code>.</p><p><b>The senior moves:</b> allocation walks floors asking each for the <i>smallest</i> free spot ≥ the vehicle's size; the spot itself answers <code>fits(vehicle)</code>; pricing is a Strategy so \"weekend rates\" is a new class, not an edit; and the entry path is guarded (one lock per floor is the easy honest answer) because two gates can race for the last spot. A ticket is the single source of truth for the fee — spot id, vehicle, entry time.</p>"
  },

  /* ============ WARM (data-structure) ============ */
  {
    id: "lru-cache",
    title: "LRU cache",
    level: "warm",
    lesson: "adv-lru-cache",
    prompt: "Build an LRU cache with O(1) get and put, capacity eviction, and then tell me how you'd make it thread-safe.",
    phaseNotes: {
      requirements: {
        prompts: ["What does 'recently used' mean — does get() count as use?", "What happens on put() of an existing key?"],
        hints: ["Invariants: size ≤ capacity always; the evicted key is exactly the least-recently-used one; get/put both refresh recency."]
      },
      entities: {
        prompts: ["Two structures: which gives O(1) lookup, which gives O(1) reorder?", "API: get(key) → value | None, put(key, value) → None."],
        hints: ["dict (key → node) + doubly-linked list (recency order). Sentinels (head/tail dummies) remove all the edge-case ifs."]
      },
      uml: {
        prompts: ["Node has key, value, prev, next — why does the node store its KEY too?"],
        hints: ["Eviction walks from the tail: you have the node and need to delete its dict entry — that needs the key on the node."]
      },
      code: {
        prompts: ["Write _unlink(node) and _push_front(node).", "Write put(): existing-key update, new-key insert, eviction at capacity."],
        hints: ["Every get/put = unlink + push_front. Eviction = unlink(tail.prev) + del dict[node.key]."]
      },
      wrap: {
        prompts: ["Thread safety: where does one RLock go and why is the whole op the critical section?", "Extensions: TTL per key? LFU instead?"]
      }
    },
    rubric: [
      { phase: "requirements", text: "Confirmed get() refreshes recency and put() on an existing key updates + refreshes." },
      { phase: "requirements", text: "Stated the invariant pair: size ≤ capacity, evictee = least-recently-used." },
      { phase: "entities", text: "Chose dict + doubly-linked list and said which O(1) each provides." },
      { phase: "entities", text: "Used head/tail sentinel nodes to kill empty/single-node edge cases." },
      { phase: "uml", text: "Node stores its own key — explained it's required for O(1) eviction's dict delete." },
      { phase: "code", text: "Wrote real _unlink/_push_front pointer surgery (four pointer writes, no list scans)." },
      { phase: "code", text: "put() handles all three branches: update-existing, insert-with-room, insert-evict." },
      { phase: "wrap", text: "Thread safety: one RLock around the whole get/put — read-modify-write of two structures must be atomic." },
      { phase: "wrap", text: "Mentioned functools.lru_cache / OrderedDict as the Pythonic shortcut and why interviews want the raw version." }
    ],
    model: "<p><b>Shape:</b> <code>dict[key → Node]</code> for O(1) lookup + a doubly-linked list with head/tail sentinels for O(1) recency order. <code>get</code> = lookup, unlink, push-front. <code>put</code> = (update | insert), push-front, evict from <code>tail.prev</code> if over capacity — and the node carries its <i>key</i> so eviction can delete the dict entry in O(1).</p><p><b>The senior moves:</b> sentinels so unlink never branches on None; all three put() branches handled explicitly; one <code>threading.RLock</code> wrapping each public method because the dict and the list must change <i>together</i> (a torn update corrupts both structures); and the closing note that <code>OrderedDict.move_to_end</code> exists but the raw pointer version is what proves you can build it.</p>"
  },

  /* ============ WARM (added in Phase 3) ============ */
  {
    id: "traffic-light",
    title: "Traffic light controller",
    level: "warm",
    lesson: "lld-traffic-light",
    prompt: "Design a traffic light controller: timed RED/GREEN/YELLOW cycle, a pedestrian request button, and an emergency override. Tell me how you'd encode the state machine — and why.",
    phaseNotes: {
      requirements: {
        prompts: ["Is the pedestrian request served immediately or at the next red?", "What must NEVER happen (think 4-way)?"],
        hints: ["Invariant: exactly one state at all times; in the 4-way extension, never two crossing greens."]
      },
      entities: {
        prompts: ["Light enum, Event enum, the controller, subscribers. What is the full public surface?"],
        hints: ["handle(event) is the single choke point; subscribe(fn) for displays."]
      },
      uml: {
        prompts: ["Table-driven FSM or State classes — argue the choice.", "Where do Observer and Strategy slot in?"],
        hints: ["Thin uniform states → a (state, event) → next dict beats six classes. Timing plans are a Strategy."]
      },
      code: {
        prompts: ["Write the TRANSITIONS dict and handle().", "Handle the pedestrian flag and the emergency path (GREEN must clear via YELLOW)."]
      },
      wrap: {
        prompts: ["Walk: green → ped press → cycle to red → crossing served.", "Extend to a 4-way intersection: who owns the safety invariant?"]
      }
    },
    rubric: [
      { phase: "requirements", text: "Pinned that pedestrian requests wait for the next RED, and named the never-two-greens invariant unprompted." },
      { phase: "entities", text: "Enums for states and events; one handle(event) choke point; Observer list for displays." },
      { phase: "uml", text: "Chose table-driven FSM and justified it: thin uniform states → data beats classes." },
      { phase: "uml", text: "Knew when to graduate to State classes (rich per-state behaviour, guards with side effects)." },
      { phase: "code", text: "Wrote the transition dict; missing keys are no-ops, making illegal moves unrepresentable." },
      { phase: "code", text: "Pedestrian press sets a flag (no transition); emergency from GREEN routes via YELLOW." },
      { phase: "wrap", text: "4-way answer: a controller FSM over direction-pairs owns the invariant — never four composed lights." },
      { phase: "wrap", text: "Pitched timing plans (rush hour / night) as a Strategy without touching the FSM." }
    ],
    model: "<p><b>Shape:</b> <code>Light</code>/<code>Event</code> enums, <code>DURATIONS</code> map, a <code>TRANSITIONS: dict[(state, event), state]</code>, and a <code>TrafficLight</code> whose <code>handle()</code> is the only path to change state, notifying plain-callable observers on every change. Pedestrian requests set a flag the RED state consumes; emergency maps GREEN→YELLOW→RED.</p><p><b>The senior moves:</b> arguing table vs State classes out loud; the safety invariant carried by construction (no table row produces a bad state); the 4-way version as one controller FSM over pair-states; timing plans extracted behind a <code>TimingPlan</code> Strategy.</p>"
  },

  /* ============ CORE (added in Phase 3) ============ */
  {
    id: "atm",
    title: "ATM",
    level: "core",
    lesson: "lld-atm",
    prompt: "Design an ATM: card in, PIN with three attempts then capture, withdraw with balance AND cash-tray checks, eject. Show me where the guards live.",
    phaseNotes: {
      requirements: {
        prompts: ["What happens on the third wrong PIN?", "Can the machine have money but still fail to pay 80?"],
        hints: ["Denominations: three 50s hold 150 but cannot pay 80 — can_dispense is a combination check, not a sum check."]
      },
      entities: {
        prompts: ["States, the Atm context, and the injected hardware Protocols (reader, dispenser, screen, bank)."],
        hints: ["The attempt counter lives on the context/session, never on a state object."]
      },
      uml: {
        prompts: ["State pattern with guards; Chain of Responsibility for note dispensing — why each?"]
      },
      code: {
        prompts: ["Write AuthenticatingState.enter_pin with both guards (verify, attempts).", "Write withdraw with the two checks and the debit-before-dispense ordering."],
        hints: ["Debit first, refund on jam — the reverse hands out unrecorded cash."]
      },
      wrap: {
        prompts: ["Walk the three-wrong-PINs path.", "Daily limits: which side of the bank interface? Two ATMs, one account: which lesson's race is that?"]
      }
    },
    rubric: [
      { phase: "requirements", text: "Asked about denominations and named the capture-card path before designing." },
      { phase: "entities", text: "Hardware behind injected Protocols — the FSM is testable with fakes." },
      { phase: "entities", text: "Attempt counter on the context, with the why (state objects get recreated)." },
      { phase: "uml", text: "State pattern justified by guards: same event, multiple destinations." },
      { phase: "uml", text: "Note dispensing as Chain of Responsibility, run dry first as the can_dispense guard." },
      { phase: "code", text: "enter_pin handles correct / wrong-below-limit / third-failure distinctly." },
      { phase: "code", text: "withdraw checks balance AND tray, debits before dispensing, explains the ordering." },
      { phase: "wrap", text: "Daily limit placed bank-side (users hop machines)." },
      { phase: "wrap", text: "Cross-ATM concurrent withdrawal identified as a check-then-act race on the account." }
    ],
    model: "<p><b>Shape:</b> vending-machine skeleton (ABC with rejecting defaults, states drive transitions via <code>set_state</code>) plus guards: <code>Authenticating</code> counts attempts on the context and exits to <code>CardCaptured</code> on the third failure; <code>SelectingTxn.withdraw</code> guards on balance then tray (a dry run of the 100/50/20 note chain), debits, then dispenses.</p><p><b>The senior moves:</b> injected hardware Protocols, debit-before-dispense with the jam-refund rationale, the denomination subtlety, and naming the cross-machine account race as out-of-scope-but-known.</p>"
  },
  {
    id: "elevator",
    title: "Elevator system",
    level: "core",
    lesson: "adv-elevator-system",
    prompt: "Design an elevator system for a building: N cars, hall calls, car calls. I care about the scheduling — no starvation — and where the 'which car answers' decision lives.",
    phaseNotes: {
      requirements: {
        prompts: ["One car or N? What does 'fair' mean — can a rider starve?"],
        hints: ["The killer requirement: a car finishing its direction before reversing (SCAN/LOOK), or riders mid-route starve."]
      },
      entities: {
        prompts: ["Elevator (state + target set), ElevatorController, SelectionStrategy. Public API: hall_call(floor, dir), car_call(car, floor), step()."]
      },
      uml: {
        prompts: ["Direction FSM per car (IDLE/UP/DOWN); Strategy for car selection — why is selection NOT in the controller?"]
      },
      code: {
        prompts: ["Write step(): serve current floor, continue direction if targets remain that way, else flip or idle.", "Write NearestStrategy.pick()."],
        hints: ["Targets as two sorted sets (above/below) makes the sweep logic read cleanly."]
      },
      wrap: {
        prompts: ["Walk: car at 3 going up, hall call at 1 — when is it served?", "Thread safety of the target set; same-direction strategy as a swap-in."]
      }
    },
    rubric: [
      { phase: "requirements", text: "Raised starvation unprompted and proposed SCAN/LOOK sweeps as the fix." },
      { phase: "entities", text: "Car owns its state + targets; controller owns dispatch; selection is its own object." },
      { phase: "uml", text: "Direction FSM with flips decided inside step(), not by an external scheduler." },
      { phase: "uml", text: "SelectionStrategy named as Strategy with the OCP payoff (nearest → same-direction without controller edits)." },
      { phase: "code", text: "step() handles: serve floor, continue, flip, settle to idle — all four branches." },
      { phase: "code", text: "A call against the current direction queues for the return pass (no flip mid-sweep)." },
      { phase: "wrap", text: "Walked the down-call-during-up-sweep scenario correctly." },
      { phase: "wrap", text: "Flagged the target-set as shared state needing a lock if calls arrive from another thread." }
    ],
    model: "<p><b>Shape:</b> <code>Elevator</code> with a direction FSM and an up/down target split, sweeping SCAN-style inside <code>step()</code>; <code>ElevatorController</code> holding N cars and delegating hall calls to an injected <code>SelectionStrategy</code> (nearest by default).</p><p><b>The senior moves:</b> starvation named early; flips owned by the car; calls against direction queued not chased; selection swappable; the lock on the target set called out honestly.</p>"
  },
  {
    id: "notification-service",
    title: "Notification service",
    level: "core",
    lesson: "lld-notification",
    prompt: "Design a notification service: users subscribe to topics with a preferred channel (email/SMS/push); publishing to a topic delivers to every subscriber. Adding a new channel must touch zero existing code.",
    phaseNotes: {
      requirements: {
        prompts: ["Per-user channel preference or per-subscription?", "Is delivery synchronous? What if one channel is slow?"]
      },
      entities: {
        prompts: ["NotificationService, Channel Protocol, ChannelFactory, Subscription. API: subscribe(topic, user, channel), publish(topic, msg)."]
      },
      uml: {
        prompts: ["Three patterns cooperate — name each and its exact job."],
        hints: ["Observer (topic fan-out), Strategy (interchangeable channels), Factory (build channels by name)."]
      },
      code: {
        prompts: ["Write publish() with the fan-out loop.", "Write ChannelFactory.register/create so Slack is a registration, not an edit."]
      },
      wrap: {
        prompts: ["Prove OCP: list every artifact that changes when Slack arrives.", "10K subscribers × 800ms emails — what now?"],
        hints: ["A bounded worker pool / async fan-out; failed sends go to a retry queue."]
      }
    },
    rubric: [
      { phase: "requirements", text: "Asked whether delivery blocks publish() — latency of fan-out surfaced early." },
      { phase: "entities", text: "Channel as a Protocol; service stores subscriptions per topic; clean two-method API." },
      { phase: "uml", text: "All three patterns named with their precise jobs (not just 'I'll use Observer')." },
      { phase: "code", text: "publish() walks subscribers and dispatches via the channel interface — no isinstance ladder." },
      { phase: "code", text: "Factory keeps a name→class registry; new channels register themselves." },
      { phase: "wrap", text: "OCP proof: SlackChannel + one register() call, zero edits elsewhere." },
      { phase: "wrap", text: "Scaled fan-out with a bounded queue + workers (backpressure named), retries for failed sends." }
    ],
    model: "<p><b>Shape:</b> <code>NotificationService</code> (topic → subscriptions), <code>Channel</code> Protocol with Email/SMS/Push, <code>ChannelFactory</code> registry. <code>publish</code> = Observer fan-out; each delivery dispatches through the Strategy channel.</p><p><b>The senior moves:</b> the OCP proof said as a checklist; async/bounded-pool fan-out for slow channels with the word <i>backpressure</i>; dead-letter/retry for failures.</p>"
  },
  {
    id: "logging-framework",
    title: "Logging framework",
    level: "core",
    lesson: "adv-logging-framework",
    prompt: "Design a logging framework: levels, multiple destinations (console/file), formatters, and logger hierarchies where app.db inherits app's handlers. Like stdlib logging, smaller.",
    phaseNotes: {
      requirements: {
        prompts: ["Does a record sent to app.db also reach app's handlers (propagation)?", "Level filtering at the logger, the handler, or both?"]
      },
      entities: {
        prompts: ["Logger, Handler ABC, Formatter, LogRecord, the registry. API: getLogger(name), logger.info(msg), addHandler()."]
      },
      uml: {
        prompts: ["Which pattern gives the dotted-name hierarchy its power? Which makes destinations pluggable?"],
        hints: ["Composite-ish parent chain for propagation; Strategy for handlers/formatters; the registry is a managed singleton-by-name."]
      },
      code: {
        prompts: ["Write log(): level check → build record → walk handlers → propagate to parent.", "Write a Handler.emit + Formatter.format pair."]
      },
      wrap: {
        prompts: ["Two threads logging to one file — what breaks?", "Pitch: JSON formatter, rotating file handler — what changes?"],
        hints: ["Nothing changes but a new class each — that's the design working."]
      }
    },
    rubric: [
      { phase: "requirements", text: "Clarified propagation semantics and double-filtering (logger level vs handler level)." },
      { phase: "entities", text: "Record as a data object separate from formatting — format late, at the handler." },
      { phase: "uml", text: "Parent-chain propagation drawn; handlers/formatters as swap points." },
      { phase: "code", text: "log() short-circuits below-level records before building anything expensive." },
      { phase: "code", text: "Walk: handlers at this logger, then the parent's, honoring propagate=False." },
      { phase: "wrap", text: "File handler emit guarded by a lock (interleaved writes corrupt lines)." },
      { phase: "wrap", text: "New formatter/handler shown to be additive classes only." }
    ],
    model: "<p><b>Shape:</b> <code>getLogger(\"app.db\")</code> returns registry singletons wired into a dotted-name parent chain; a <code>LogRecord</code> flows level-check → this logger's handlers → parent's, each <code>Handler</code> pairing a destination with an injected <code>Formatter</code>.</p><p><b>The senior moves:</b> format-late rationale, propagation with an off switch, per-handler lock for file writes, and extensions that are pure additions.</p>"
  },

  /* ============ ADVANCED (added in Phase 3) ============ */
  {
    id: "splitwise",
    title: "Splitwise",
    level: "advanced",
    lesson: "adv-splitwise",
    prompt: "Design Splitwise: groups, expenses split equally/exactly/by percent, running balances, and 'settle up' with the minimum number of payments.",
    phaseNotes: {
      requirements: {
        prompts: ["Do balances need to be exact (money!)?", "Is settle-up minimal-transaction or just any valid plan?"],
        hints: ["Integer cents everywhere; floats lose pennies and auditors notice."]
      },
      entities: {
        prompts: ["User, Group, Expense, SplitStrategy, BalanceSheet. API: add_expense(payer, amount, split), balances(), settle_up()."]
      },
      uml: {
        prompts: ["Split policies as Strategy; why is the balance sheet a derived view of the expense log?"],
        hints: ["Append-only expense log = source of truth; balances are a fold over it (event-sourcing in miniature)."]
      },
      code: {
        prompts: ["Write the percent/exact split with the rounding-remainder distribution.", "Write settle_up: net balances, then greedily match max debtor with max creditor."]
      },
      wrap: {
        prompts: ["Walk one group of 3 through two expenses and a settle.", "Concurrency: two members adding expenses at once — what protects the log?"]
      }
    },
    rubric: [
      { phase: "requirements", text: "Integer cents declared, and rounding remainder policy pinned (who eats the odd cent)." },
      { phase: "entities", text: "Append-only expense log as the source of truth; balances derived, not stored-and-updated." },
      { phase: "uml", text: "Equal/exact/percent as SplitStrategy implementations behind one interface." },
      { phase: "code", text: "Split math distributes the remainder deterministically (first k participants get the extra cent)." },
      { phase: "code", text: "settle_up nets to per-user totals, then two-pointer/heap matches debtors to creditors." },
      { phase: "wrap", text: "Knew greedy gives at most n-1 payments and that true minimum-count is NP-hard — said the trade." },
      { phase: "wrap", text: "Append-only log means add_expense needs only an append lock; no read-modify-write on balances." }
    ],
    model: "<p><b>Shape:</b> expenses appended to a log with an injected <code>SplitStrategy</code> computing per-user shares in integer cents (remainder distributed deterministically); balances are a fold over the log; <code>settle_up</code> nets balances and greedily pairs largest debtor with largest creditor via two heaps.</p><p><b>The senior moves:</b> derived-not-mutated balances, the NP-hard caveat on minimal settlement with greedy ≤ n−1 as the practical answer, and concurrency reduced to an append lock.</p>"
  },
  {
    id: "movie-booking",
    title: "Movie ticket booking",
    level: "advanced",
    lesson: "adv-movie-booking",
    prompt: "Design seat booking for a cinema: browse shows, pick seats, pay. Two users grabbing seat A1 at the same instant must not both get it.",
    phaseNotes: {
      requirements: {
        prompts: ["What happens if payment fails or times out after seats are picked?"],
        hints: ["Hold-then-pay: seats lock for ~5 minutes during payment, then confirm or release."]
      },
      entities: {
        prompts: ["Show (owns seats + THE lock), Seat with a state, BookingService (orchestration, no locks). API: hold(seats), confirm(hold), release(hold)."]
      },
      uml: {
        prompts: ["Seat FSM: FREE → HELD → BOOKED, HELD → FREE on failure/timeout. Why does only Show touch seat state?"]
      },
      code: {
        prompts: ["Write hold(): check ALL requested seats free AND mark them held inside one critical section.", "Write the timeout release path."],
        hints: ["Check-then-act must be atomic; all-or-nothing per seat group."]
      },
      wrap: {
        prompts: ["Walk the double-click race and show why the second hold fails cleanly.", "Scale-out: optimistic versions vs pessimistic locks?"]
      }
    },
    rubric: [
      { phase: "requirements", text: "Hold-then-pay flow with expiry proposed before being prompted." },
      { phase: "entities", text: "Single owner of seat state (Show) with the lock; service holds no state." },
      { phase: "uml", text: "Seat FSM drawn with the HELD → FREE failure edge — not just the happy path." },
      { phase: "code", text: "hold() validates every seat and marks them inside ONE with-lock block (all-or-nothing)." },
      { phase: "code", text: "Expired holds released by sweep or lazily at next read — and said which." },
      { phase: "wrap", text: "Narrated the race: both read FREE without the lock; with it, the loser sees HELD." },
      { phase: "wrap", text: "Named optimistic locking (version per seat, retry on conflict) as the multi-node story." }
    ],
    model: "<p><b>Shape:</b> <code>Show</code> owns the seat map and one <code>threading.Lock</code>, exposing atomic <code>hold</code>/<code>confirm</code>/<code>release</code>; <code>BookingService</code> orchestrates hold → pay → confirm-or-release. Seats follow FREE→HELD→BOOKED with HELD expiring back to FREE.</p><p><b>The senior moves:</b> check-and-hold as one critical section, the payment-failure release path treated as first-class, and the single-node lock honestly upgraded to versioned optimistic locking for scale-out.</p>"
  },
  {
    id: "rate-limiter",
    title: "Rate limiter",
    level: "advanced",
    lesson: "adv-rate-limiter",
    prompt: "Design a rate limiter: at most N requests per client per window. Implement token bucket AND sliding window behind one interface, thread-safe.",
    phaseNotes: {
      requirements: {
        prompts: ["Bursts: should a quiet client be allowed a burst (bucket) or strictly smoothed (window)?", "Per-user, per-IP, both?"]
      },
      entities: {
        prompts: ["RateLimiter Protocol: allow(client_id) → bool; TokenBucket and SlidingWindow implementations; a per-client registry."]
      },
      uml: {
        prompts: ["Strategy for the algorithms; what creates per-client limiter instances (Factory / defaultdict)?"]
      },
      code: {
        prompts: ["Write TokenBucket.allow(): lazy refill from elapsed time, then check-and-decrement under the lock.", "Write SlidingWindow.allow() with a deque of timestamps."],
        hints: ["Refill math: tokens = min(cap, tokens + elapsed * rate); monotonic clock."]
      },
      wrap: {
        prompts: ["Why does the refill share the SAME lock as allow()?", "Distributed version: where does the counter live?"]
      }
    },
    rubric: [
      { phase: "requirements", text: "Articulated bucket-vs-window semantics (burst tolerance) and let the requirement pick." },
      { phase: "entities", text: "One Protocol, two Strategies; per-client instances via a registry, isolated state." },
      { phase: "uml", text: "Drew the seam so ops can swap algorithms per route/client." },
      { phase: "code", text: "Lazy refill computed from elapsed monotonic time — no background thread needed." },
      { phase: "code", text: "Check-and-decrement (and deque prune+append) inside one lock; explained the over-admit race." },
      { phase: "wrap", text: "Refill and consume share one lock — separate locks still interleave on tokens." },
      { phase: "wrap", text: "Distributed answer: counters move to Redis (INCR/EXPIRE or a Lua token bucket); local locks stop being enough." }
    ],
    model: "<p><b>Shape:</b> <code>RateLimiter</code> Protocol with <code>TokenBucket</code> (capacity, rate, lazy refill on each call) and <code>SlidingWindow</code> (timestamp deque, prune-then-count), each guarding its read-modify-write with its own lock, registered per client id.</p><p><b>The senior moves:</b> lazy refill from monotonic elapsed time, the one-lock-for-both-paths point, burst semantics argued, and the Redis hand-off for the distributed follow-up.</p>"
  },
  {
    id: "chess",
    title: "Chess",
    level: "advanced",
    lesson: "adv-chess",
    prompt: "Design chess for two players: legal-move validation, check and checkmate, undo. Walk me through where inheritance is justified and where it isn't.",
    phaseNotes: {
      requirements: {
        prompts: ["Scope: AI? clocks? castling/en-passant now or parked?"],
        hints: ["Park the special moves explicitly as extensions; in: validation, check/mate/stalemate, undo."]
      },
      entities: {
        prompts: ["Game, Board, Square, Piece hierarchy, Move record. The ONLY inheritance: where and why?"]
      },
      uml: {
        prompts: ["Composition spine Game◆Board◆Square; pieces polymorphic. legal_moves(): subclass vs injected Strategy — argue it."]
      },
      code: {
        prompts: ["Write the shared sliding-ray helper and Rook/Queen on top of it.", "Write make_move: pseudo-legal check → apply → is_check? revert : record."],
        hints: ["Move stores the captured piece — that's what makes revert/undo exact."]
      },
      wrap: {
        prompts: ["Where does king-safety filtering live and why not in each piece?", "Checkmate via try-every-move + the same apply/revert."]
      }
    },
    rubric: [
      { phase: "requirements", text: "Cut scope explicitly and parked special moves as named extensions." },
      { phase: "entities", text: "Inheritance confined to the Piece leaves; everything structural is composition." },
      { phase: "uml", text: "Argued subclass polymorphism over Strategy (fixed-by-rules hierarchy) and knew when Strategy wins (variants)." },
      { phase: "code", text: "One ray-walk helper; Rook/Bishop/Queen differ only by direction sets." },
      { phase: "code", text: "make_move validates king safety by apply → is_check → revert; Move carries the captured piece." },
      { phase: "code", text: "Knight as offsets (jumps), not rays — the two movement shapes distinguished." },
      { phase: "wrap", text: "Check is global, pieces are local — the pseudo-legal/legal split stated cleanly." },
      { phase: "wrap", text: "Undo = pop history + revert; PGN/AI named as the same mechanism reused." }
    ],
    model: "<p><b>Shape:</b> <code>Game</code> (turns, history, status) ◆ <code>Board</code> (position, is_check, apply/revert) ◆ 64 <code>Square</code>s; abstract <code>Piece.legal_moves()</code> with six leaves — sliders share one ray-walk helper, Knight enumerates offsets. <code>Move</code> records origin, target, and captured piece (Command).</p><p><b>The senior moves:</b> the do/undo trick powering validation AND undo AND future AI; pseudo-legal vs legal layering; the pawn named as the abstraction's stress test.</p>"
  },

  /* ============ EXPERT (added in Phase 3) ============ */
  {
    id: "kv-store",
    title: "In-memory KV store · TTL + transactions",
    level: "expert",
    lesson: "adv-kv-store",
    prompt: "Build an in-memory key-value store: get/put/delete, per-key TTL, and NESTED transactions with begin/commit/rollback. Thread-safe. No O(n) snapshots on begin.",
    phaseNotes: {
      requirements: {
        prompts: ["Read-your-writes inside a transaction?", "What exactly does rollback restore?"],
        hints: ["Invariant: after rollback the store is byte-identical to before begin."]
      },
      entities: {
        prompts: ["Base dict of (value, expires_at), a stack of delta maps, an injected Clock, one RLock."]
      },
      uml: {
        prompts: ["Why delta-overlays instead of copy-on-begin? What plays Memento/Command here?"]
      },
      code: {
        prompts: ["Write get() walking the stack top-down with a TOMBSTONE sentinel.", "Write commit() merging the top delta down, and rollback() (one pop)."],
        hints: ["Three meanings per key in a delta: value, TOMBSTONE, absent (fall through)."]
      },
      wrap: {
        prompts: ["TTL: lazy expiry + heap sweeper + the stale-heap-entry trick.", "Why RLock, and what atomic primitive would you add next?"]
      }
    },
    rubric: [
      { phase: "requirements", text: "Pinned read-your-writes and the exact-restore invariant before coding." },
      { phase: "entities", text: "Clock injected as a Protocol — TTL tests use a FakeClock, no sleeps." },
      { phase: "uml", text: "Rejected copy-on-begin with the O(n)-per-transaction argument; chose delta overlays." },
      { phase: "code", text: "TOMBSTONE distinguishes deleted-here from no-opinion — deletes overlay correctly." },
      { phase: "code", text: "rollback is a single pop; nesting falls out of the stack for free." },
      { phase: "code", text: "commit merges down one level; tombstones only delete for real at the base." },
      { phase: "wrap", text: "Lazy expiry on get + min-heap sweeper, with the re-check-on-pop trick for stale entries." },
      { phase: "wrap", text: "RLock because get→delete reenters; pitched incr/cas as the atomic extension." },
      { phase: "wrap", text: "Used monotonic time for TTL math and said why wall clocks lie." }
    ],
    model: "<p><b>Shape:</b> base dict of <code>(value, expires_at)</code> + a stack of delta maps; reads walk deltas top-down (TOMBSTONE = deleted here) then the base; writes land in the top delta; <code>commit</code> merges one level down, <code>rollback</code> pops. TTL = lazy check on read + a (expires_at, key) min-heap sweeper that re-validates on pop. One RLock around every public method; Clock injected.</p><p><b>The senior moves:</b> O(changes) transactions instead of O(n) snapshots, the three-state delta semantics, monotonic-vs-wall clocks, and the cas/incr extension that pushes atomicity into the store where it belongs.</p>"
  },
  {
    id: "task-scheduler",
    title: "Task scheduler",
    level: "expert",
    lesson: "adv-task-scheduler",
    prompt: "Build a task scheduler: one-shot and recurring jobs, priorities, cancel, retry with backoff, N workers. No polling loops — workers must sleep exactly until there is work.",
    phaseNotes: {
      requirements: {
        prompts: ["At-most-once per due time? What does shutdown do to queued work?"],
        hints: ["The no-polling requirement is the real question: it forces Condition.wait(timeout=…)."]
      },
      entities: {
        prompts: ["ScheduledTask (Command) ordered by (run_at, priority); a heapq; threading.Condition; SchedulePolicy + RetryPolicy Strategies."]
      },
      uml: {
        prompts: ["Why a min-heap and not queue.Queue/PriorityQueue?", "Which seams are Strategies, which events are Observer hooks?"]
      },
      code: {
        prompts: ["Write the worker loop: wait-with-timeout on the root's due time, re-check after every wake, pop inside the lock, run outside it.", "Write submit() with notify() and explain why it can wake a sleeper early."],
        hints: ["wait() returning means MAYBE — always re-evaluate the condition in a loop."]
      },
      wrap: {
        prompts: ["Trace: sleeper waiting 300s, an earlier task arrives at +120 — what happens?", "Lazy cancel; shutdown's notify_all; the asyncio translation."]
      }
    },
    rubric: [
      { phase: "requirements", text: "Named at-most-once-per-due-time and zero-polling as the two hard requirements." },
      { phase: "entities", text: "Task as Command with run_at/priority ordering; policies injected as Strategies." },
      { phase: "uml", text: "Rejected Queue/PriorityQueue with the peek-and-sleep argument; heap chosen for time order." },
      { phase: "code", text: "The Condition wait-loop re-checks after EVERY wake (new root / spurious / shutdown)." },
      { phase: "code", text: "Pop under the lock, execute outside it — and said why (a slow task would serialize the pool)." },
      { phase: "code", text: "submit() notifies so an earlier task interrupts a long sleep — the wake-up traced correctly." },
      { phase: "code", text: "Retry path: catch, ask RetryPolicy for backoff, resubmit with bumped attempt." },
      { phase: "wrap", text: "Cancel as a lazy flag checked after pop (O(1)) instead of O(n) heap surgery." },
      { phase: "wrap", text: "Shutdown uses notify_all with the reason; recurring tasks resubmit via SchedulePolicy.next_run." }
    ],
    model: "<p><b>Shape:</b> a <code>heapq</code> of <code>ScheduledTask</code>s ordered by <code>(run_at, priority)</code>, N workers in a <code>Condition</code> wait-with-timeout loop (sleep until the root is due OR a notify), pop inside the lock, execute outside, resubmit per <code>SchedulePolicy</code>/<code>RetryPolicy</code>.</p><p><b>The senior moves:</b> the re-check-after-wake loop, executing outside the lock, lazy cancellation, notify vs notify_all reasoned per event, monotonic time — and the closer that the same structure survives an asyncio rewrite untouched.</p>"
  }
];
