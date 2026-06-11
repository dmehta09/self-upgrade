# Claude &amp; Claude Code — a visual field guide

A static, offline, zero-dependency HTML guide that teaches **Claude** (the models &amp; API) and
**Claude Code** (the agentic coding tool) from first principles to power-user workflows. Built as a
sibling to the other `self-upgrade` guides (langstack, fastapi-guide, lld-guide, dsa-guide), in the
same house style. Content verified **June 2026**.

## Two tracks + reference

- **Using Claude** (`claude/`, 10 lessons) — what an LLM is, the model family (Fable 5 + the 4.x
  trio), talking to Claude, prompting (×2), the Messages API &amp; SDK, tool use, power features,
  shipping with the API (errors, retries, rate limits, tool-schema design, cost engineering), and
  building agents with MCP &amp; the Agent SDK.
- **Claude Code** (`code/`, 14 lessons) — install &amp; surfaces, your first session, context hygiene,
  the explore→plan→code→commit workflow, verification, CLAUDE.md, slash commands, permissions,
  subagents, hooks, skills &amp; plugins, MCP servers, headless &amp; CI, and power-user workflows.
- **Reference** (`reference/`) — a cheat sheet with an interactive command explorer, a glossary, and
  curated best GitHub references.

## Interactive pieces

- **Session player** (`assets/js/session-player.js`) — an animated faux-terminal that "plays" a
  Claude Code session step-by-step, with a teaching caption per step. Authored as JSON in a
  `<script class="sp-config">`.
- **Prompt lab** (`assets/js/promptlab.js`) — flip between prompt variants and see a *simulated*
  Claude reply plus a "why" note. Fully offline, no API key.
- **Command explorer** (`assets/js/command-explorer.js` + `commands-data.js`) — searchable,
  filterable reference of slash commands, settings, flags, hooks, and env vars.
- Plus the shared house features: offline full-text **search** (press `/`), **progress** tracking
  ("mark as learned"), light/dark **theme**, quizzes, and reveal-on-scroll.

## Run it

It's pure static HTML — just open `index.html` in a browser, or serve the folder:

```bash
cd claude-guide
python3 -m http.server 8000
# then visit http://localhost:8000
```

The only external request is Google Fonts (with system fallbacks); everything else works offline,
including at `file://`.

## Maintenance

- Lesson registry &amp; progress modules: `assets/js/lessons.js`.
- Per-track accent + component styles: `assets/css/theme.css` (loaded after the shared
  `assets/css/styles.css`). Track accents: Using Claude = coral, Claude Code = emerald,
  Reference = purple.
- After editing content, regenerate the search index:

```bash
node tools/build-search-index.js
node tools/verify.js   # link &amp; asset checks
```

Content accuracy was checked against the official docs (`code.claude.com/docs`,
`platform.claude.com/docs`) in June 2026. Claude Code ships often — verify version-specific details
against the live docs.
