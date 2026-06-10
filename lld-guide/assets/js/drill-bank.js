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
  }
];
