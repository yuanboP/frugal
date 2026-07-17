# frugal installed

Restart Claude Code (or start a new session). You should see
`FRUGAL MODE ACTIVE — cloud cost awareness` injected at session start.

What it does:

- **SessionStart**: injects cost-awareness rules (check usage on first touch
  of a metered service, announce paid resources, tear down test resources).
- **PreToolUse**: when a Bash command touches a metered provider CLI
  (`vercel`, `wrangler`, `neonctl`, `railway`, `fly`, `e2b`, `aws`, ...),
  a one-line reminder is injected — once per provider per session.
- **/frugal**: show the cost cheat-sheet and audit the current project's
  spend surface.

Disable by uninstalling or disabling the plugin.
