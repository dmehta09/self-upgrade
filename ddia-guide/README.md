# Designing Data-Intensive Applications

A sharp, **visual**, crisp guide to Martin Kleppmann's *Designing Data-Intensive Applications* (DDIA) — **not** a comprehensive re-telling, just the ideas that move the needle. Every concept is given **twice**: a plain-English analogy first, then the precise technical version, backed by **diagrams and trade-off tables** (the book's level), with short **Python** only where an algorithm makes it click.

> **Built in parts.** DDIA is a big book (3 parts, 12 chapters), so this guide ships **phase by phase**. The scaffold holds the whole roadmap from day one; each phase fills in more chapters.
>
> **Parts I & II are complete (chapters 1–9).** Part I · Foundations — *Reliable, scalable & maintainable*, *Data models*, *Storage & retrieval*, *Encoding & evolution*. Part II · Distributed Data — *Replication*, *Partitioning*, *Transactions*, *The trouble with distributed systems*, and *Consistency & consensus*. The home page shows the full 3-part roadmap; **Part III · Derived Data is next**, with its chapters marked **“soon.”**

Where topics overlap high-level system design (replication, partitioning, consistency, CAP), lessons carry a light **“see also”** link into the sibling **`sysdesign-guide`**.

## Open it
- Just open `index.html` in a browser, **or**
- `python3 -m http.server` then visit `http://localhost:8000` (so in-site search + progress behave exactly like production).

Works fully offline (Google Fonts degrade gracefully to system fonts). Dark/light theme toggle and per-lesson progress persist in your browser.

## What's inside
**Part I — Foundations (complete)**
- **Reliable, scalable & maintainable** — faults vs failures; percentiles & tail-latency amplification; operability/simplicity/evolvability
- **Data models & query languages** — relational vs document vs graph; the impedance mismatch; schema-on-read vs schema-on-write; declarative vs imperative
- **Storage & retrieval** — the append-only log; LSM-trees (memtable/SSTables/compaction) vs B-trees (pages/in-place); OLTP row stores vs OLAP column stores
- **Encoding & evolution** — textual vs binary-schema formats (Protobuf/Avro/Thrift); field tags; backward & forward compatibility for rolling deploys

**Part II — Distributed Data (complete)**
- **Replication** — single-leader / multi-leader / leaderless; synchronous vs asynchronous; replication lag and the read-your-writes / monotonic / consistent-prefix guarantees; failover & split brain; quorums (`w + r > n`)
- **Partitioning** — by key range vs by hash; skew & hot spots; consistent hashing & rebalancing; request routing; local vs global secondary indexes
- **Transactions** — what ACID really promises; the race conditions weak isolation allows (dirty/lost/write-skew); the isolation-level dial; serial / 2PL / SSI
- **The trouble with distributed systems** — unreliable networks (crashed vs slow), lying clocks (time-of-day vs monotonic), process pauses; fencing tokens; truth by majority
- **Consistency & consensus** — linearizability; the CAP trade-off during a partition; causal & total order; consensus on overlapping majority quorums

**Reference** — a Decisions & trade-offs cheatsheet (each recurring choice + a one-line heuristic) and flashcards.

## Interactive
`ddia-viz` (the guide's own engine — a **data-model explorer** (relational ⇄ document ⇄ graph), a **percentiles** scene for p50/p95/p99 & tail-latency amplification, a **storage** scene for LSM-tree vs B-tree, a **consistent-hashing ring** that shows only a fraction of keys move when the cluster grows, and a **quorum** widget for `w + r > n` overlap) · reused `reqflow` (single-leader write propagation; the fencing-token race) and `tradeoff` sliders · `flashcards` · in-site search · per-lesson progress. All dependency-free, theme-aware, and offline.

## Editing / regenerating
Content lives as **section-only fragments** in `tools/fragments/<dir>__<slug>.html` (double-underscore = path separator). The site map is inline in `tools/gen.js` (`PAGES`/`MOD`/`NAV`); the lesson registry is `assets/js/lessons.js`; the search file list is in `tools/build-search-index.js`. After editing:

```bash
node tools/gen.js                # assemble pages from fragments (sidebar, TOC, nav, "mark learned")
node tools/build-search-index.js # rebuild the search index
node tools/verify.js             # validate links, anchors, escaping, lesson wiring
node tools/reverify.js           # deep cross-checks: gen ↔ lessons ↔ fragments ↔ search, JSON configs, drift
```

### Adding the next phase
1. Add fragment(s) under `tools/fragments/` (e.g. `foundations__storage-engines.html`).
2. Append the page(s) to `PAGES` and the sidebar group to `NAV` in `tools/gen.js`.
3. Append the lesson(s) to `window.LESSONS` in `assets/js/lessons.js`.
4. Add the file(s) to `FILES` in `tools/build-search-index.js`.
5. On the **hand-authored `index.html`**: flip the matching **“soon”** roadmap items into real links, bump the "live now" stat + the "of N lessons" dashboard count, AND add the new lesson(s) to the home's sidebar nav-group (the home sidebar is NOT generated, so it must be edited to match gen.js's NAV).
6. Re-run the four commands above. `reverify.js` counts are derived, so it stays green.

Authoring rules and component/engine markup: **`tools/AUTHORING.md`**.
