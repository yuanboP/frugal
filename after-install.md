# frugal installed

Restart Claude Code (or start a new session). You should see
`FRUGAL MODE ACTIVE — level: normal` injected at session start.

What it does:

- **SessionStart**: injects short cost-awareness rules (mode-scaled).
- **PreToolUse**: when a Bash command touches a metered provider CLI
  (`vercel`, `wrangler`, `neonctl`, `railway`, `fly`, `e2b`, `aws`, ...),
  a short reminder is injected — once per provider per session.
  **normal** = billing shape + one trap; **quiet** = shape only;
  **strict** = + real-bill context.
- **/frugal**: cheat-sheet + spend audit, or set level
  (`/frugal quiet|normal|strict|off`, `/frugal default <level>`).

Disable with `/frugal off`, uninstall, or `FRUGAL_MODE=off`.
