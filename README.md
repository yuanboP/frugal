# frugal

Cloud cost awareness for coding agents, as a Claude Code plugin.

Agents deploy to Vercel, spin up Neon databases, run E2B sandboxes — all
metered — and non-technical users only find out on the monthly bill. frugal
makes the agent spend consciously:

- **Session rules** (SessionStart hook): check usage on first touch of a
  metered service, announce paid resources in one line, kill sandboxes and
  delete test resources when done, never silently make a spend decision.
- **In-the-moment reminders** (PreToolUse hook): when a Bash command invokes
  a billable CLI (`vercel`, `wrangler`, `neonctl`, `railway`, `fly`, `e2b`,
  `browserbase`, `gh codespace`, `aws`, `gcloud`, `az`, `supabase`,
  `terraform apply`, `pulumi up`), a one-line reminder lands in the agent's
  context — throttled to once per provider per session.
- **/frugal**: cost cheat-sheet + audit of the current project's spend surface.

## Install

```
/plugin marketplace add <path-or-repo>
/plugin install frugal
```

## Test

```
npm test
```
