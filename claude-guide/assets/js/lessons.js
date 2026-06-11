/* ============================================================
   Claude & Claude Code — Field Guide · canonical lesson registry
   Single source of truth for progress tracking. Lesson ids are
   STABLE keys (never derived from URLs/titles, which move). Each
   page sets <body data-lesson="<id>" data-tool="<module>">; progress.js
   maps sidebar links to lessons by resolving url against SITE_BASE.
   ============================================================ */
window.LESSONS = [
  /* ---- TRACK A · USING CLAUDE ---- */
  { id: "claude-what",            title: "What is Claude (and an LLM)?",      url: "claude/what-is-claude.html",        module: "claude",    tool: "claude" },
  { id: "claude-models",          title: "The model family",                  url: "claude/models.html",                module: "claude",    tool: "claude" },
  { id: "claude-talk",            title: "Talking to Claude",                 url: "claude/talking-to-claude.html",     module: "claude",    tool: "claude" },
  { id: "claude-prompt-basics",   title: "Prompting 1 · be clear",            url: "claude/prompting-basics.html",      module: "claude",    tool: "claude" },
  { id: "claude-prompt-advanced", title: "Prompting 2 · examples & thinking", url: "claude/prompting-advanced.html",    module: "claude",    tool: "claude" },
  { id: "claude-api",             title: "The API & SDK",                     url: "claude/api-basics.html",            module: "claude",    tool: "claude" },
  { id: "claude-tools",           title: "Tool use (function calling)",       url: "claude/tool-use.html",              module: "claude",    tool: "claude" },
  { id: "claude-power",           title: "Power features",                    url: "claude/power-features.html",        module: "claude",    tool: "claude" },
  { id: "claude-production",      title: "Shipping with the API",             url: "claude/production.html",            module: "claude",    tool: "claude" },
  { id: "claude-agents-mcp",      title: "Agents, MCP & the Agent SDK",       url: "claude/agents-and-mcp.html",        module: "claude",    tool: "claude" },

  /* ---- TRACK B · CLAUDE CODE ---- */
  { id: "code-what",          title: "What is Claude Code?",          url: "code/what-is-claude-code.html",        module: "code", tool: "code" },
  { id: "code-first-session", title: "Your first session",            url: "code/first-session.html",              module: "code", tool: "code" },
  { id: "code-context",       title: "Context is currency",           url: "code/context.html",                    module: "code", tool: "code" },
  { id: "code-epcc",          title: "Explore → Plan → Code → Commit", url: "code/explore-plan-code-commit.html",   module: "code", tool: "code" },
  { id: "code-verify",        title: "Closing the loop (verify)",     url: "code/verify.html",                     module: "code", tool: "code" },
  { id: "code-memory",        title: "Project memory · CLAUDE.md",    url: "code/claude-md.html",                  module: "code", tool: "code" },
  { id: "code-commands",      title: "Slash commands",                url: "code/commands.html",                   module: "code", tool: "code" },
  { id: "code-permissions",   title: "Permissions & settings.json",   url: "code/permissions.html",                module: "code", tool: "code" },
  { id: "code-subagents",     title: "Subagents",                     url: "code/subagents.html",                  module: "code", tool: "code" },
  { id: "code-hooks",         title: "Hooks",                         url: "code/hooks.html",                      module: "code", tool: "code" },
  { id: "code-skills",        title: "Skills & plugins",              url: "code/skills-plugins.html",             module: "code", tool: "code" },
  { id: "code-mcp",           title: "MCP servers",                   url: "code/mcp.html",                        module: "code", tool: "code" },
  { id: "code-headless",      title: "Headless & CI",                 url: "code/headless-ci.html",                module: "code", tool: "code" },
  { id: "code-power",         title: "Power-user workflows",          url: "code/power-user.html",                 module: "code", tool: "code" },

  /* ---- REFERENCE ---- */
  { id: "ref-cheatsheet", title: "Cheat sheet & explorer", url: "reference/cheatsheet.html", module: "reference", tool: "reference" },
  { id: "ref-glossary",   title: "Glossary",               url: "reference/glossary.html",   module: "reference", tool: "reference" },
  { id: "ref-github",     title: "Best GitHub references",  url: "reference/resources.html",  module: "reference", tool: "reference" }
];

/* Ordered module groups for the home dashboard. */
window.LESSON_MODULES = [
  { key: "claude",    label: "Using Claude" },
  { key: "code",      label: "Claude Code" },
  { key: "reference", label: "Reference" }
];
