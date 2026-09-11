# Senior Backend Scenario Q&A

Interview rehearsal guide: **120 production scenario cards** across 12 domains, FastAPI-first with Nest/Node contrast notes.

## Use

Open `index.html` (or via the hub). Recommended loop: **method → one domain closed-book → drills/flashcards**.

## Authoring / extending

Questions live in `tools/banks/dNN-*.json`. Each card uses the Senior Answer Card schema (`first30s`, `modelAnswer`, `sayIt`, `traps`, `followUps`, …).

```bash
# from repo root
./bin/guide build senior-backend-guide
# or
cd senior-backend-guide && node tools/gen.js && node tools/build-search-index.js && node tools/verify.js
```

`gen.js` runs `render-banks.js` first (JSON → domain HTML fragments + `assets/js/sbe-bank.js`).

To add a later pack: new bank JSON + manifest page + domain slug.
