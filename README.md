# frugal

<p align="center">
  <img src="assets/logo.png" width="280" alt="frugal — the guy who just found a $0.30 charge he does not recognize" />
</p>

**Cloud cost awareness for coding agents.** ([中文 README](README.zh.md)) Agents deploy to Vercel, spin up
Neon databases, run E2B sandboxes, push commits that trigger GitHub Actions —
all metered — and non-technical users only find out on the monthly bill.
frugal makes the agent spend consciously: check usage before spending,
announce paid resources in one line, tear down what it provisions.

Works across Claude Code, Codex, GitHub Copilot, Qoder, Gemini CLI, OpenCode,
pi, Cursor, Windsurf, Cline, and Kiro — one ruleset, one source of truth.

## What it does

**1. Session rules** — injected at session start:

- First touch of a metered service → check usage/quota, or at least say the
  service bills by usage.
- Before creating a paid resource → one-line notice; prefer free tier and
  local dev (`wrangler dev`, `vercel dev`, Neon branches, `supabase start`).
- Ephemeral things must die: kill sandboxes, delete test resources, stop
  idle Codespaces in the same session.
- Never silently make a spend decision for the user.

**2. In-the-moment reminders** — a PreToolUse hook watches shell commands.
When one touches a billable CLI, a one-line reminder with the decisive
numbers lands in the agent's context — once per provider per session, never
blocking:

```
frugal: this command touches Neon (metered billing — free: 100 CU-hr/mo per
project, 0.5 GB storage, 5 GB egress — overrun SUSPENDS the DB until next
month. Polling defeats the 5-min autosuspend...)
```

Detection is sub-service aware: `wrangler r2` gets the R2 free-tier numbers,
`gh workflow run` gets Actions minutes, and `git push` in a repo with
`.github/workflows/` warns that the push itself burns Actions minutes.

**3. Researched quota data** — the reminders and the skill's cheat-sheet
carry real numbers (researched 2026-07, dual-engine: parallel Claude web
research + grok CLI runs per provider, cross-checked against official
pricing pages). Full plan tables, overage prices, cost traps, and sources:
[`skills/frugal/references/providers.md`](skills/frugal/references/providers.md).
The complete raw research — both engines' reports per provider plus the
merged machine-readable factsheets — is archived in
[`research/`](research/).

Covered: Vercel, Cloudflare (Workers/R2/KV/D1), Neon, Railway, Fly.io, E2B,
Browserbase, GitHub (Actions/Codespaces), Supabase, AWS/GCP/Azure,
Terraform/Pulumi.

**4. `/frugal`** — show the cost cheat-sheet and audit the current project's
spend surface.

## Install

npm package: [`@yuanbopang/frugal`](https://www.npmjs.com/package/@yuanbopang/frugal)

### Claude Code

```
/plugin marketplace add yuanboP/frugal
/plugin install frugal
```

Start a new session; you should see `FRUGAL MODE ACTIVE`.

### Codex

```
codex plugin marketplace add yuanboP/frugal
codex plugin add frugal@frugal
```

Same hooks, Codex-shaped output (detected via `PLUGIN_DATA`). Covers the
Codex desktop app too — restart it after installing.

### GitHub Copilot CLI

```
copilot plugin marketplace add yuanboP/frugal
copilot plugin install frugal@frugal
```

Or the slash equivalents inside a session (`/plugin marketplace add ...`).
Session-start injection via `hooks/copilot-hooks.json`.

### grok

```
grok plugin install https://github.com/yuanboP/frugal.git --trust
```

The skill (rules + cheat-sheet) activates on billing/deploy topics; grok
does not execute Claude-style lifecycle hooks.

### Gemini CLI

```
gemini extensions install https://github.com/yuanboP/frugal
```

Loads `AGENTS.md` as always-on context via `gemini-extension.json`.

### OpenCode

```json
{ "plugin": ["@yuanbopang/frugal"] }
```

Or from a checkout: `{ "plugin": ["./.opencode/plugins/frugal.mjs"] }`.
Appends the ruleset every turn and registers the skills directory.

### pi

```
pi install git:github.com/yuanboP/frugal
```

Injects the ruleset via `before_agent_start`.

### Cursor / Windsurf / Cline / Kiro

Static rule copies ship in `.cursor/rules/`, `.windsurf/rules/`,
`.clinerules/`, `.kiro/steering/` — picked up automatically from a checkout.
Cursor user-level install: copy `.cursor/rules/frugal.mdc` to
`~/.cursor/rules/`.

### Qoder / CodeWhale / Swival (AGENTS.md hosts)

These auto-load `AGENTS.md` from the repo root — zero setup from a checkout.
Qoder can additionally wire the per-command reminder via
`hooks/qoder-hooks.json`.

## How it works

| Piece | Role |
|---|---|
| `skills/frugal/SKILL.md` | The ruleset + free-tier cheat-sheet. Single source of truth for all dynamic hosts. |
| `skills/frugal/references/providers.md` | Full researched quota/plan/trap tables with sources. |
| `hooks/frugal-runtime.js` | Host detection (env vars) + per-host hook output shapes. |
| `hooks/frugal-activate.js` | SessionStart: inject the SKILL.md body. |
| `hooks/frugal-pretool.js` | PreToolUse(Bash): detect billable CLIs via `hooks/providers.js`, throttled reminder (state in tmpdir, keyed by session). |
| `AGENTS.md` | Compact ruleset — canonical body for the static rule copies and Gemini context. |
| `scripts/check-rule-copies.js` | Drift guard: static copies must equal AGENTS.md. |
| `scripts/check-versions.js` | All 8 manifests share one version. |

### Static rule copies

Edit `AGENTS.md`, then regenerate:

```bash
BODY=$(cat AGENTS.md)
printf -- '---\ndescription: Cloud cost awareness — spend consciously on metered services\nglobs:\nalwaysApply: true\n---\n\n%s\n' "$BODY" > .cursor/rules/frugal.mdc
printf -- '---\ntitle: Frugal\ninclusion: always\n---\n\n%s\n' "$BODY" > .kiro/steering/frugal.md
for f in .windsurf/rules/frugal.md .clinerules/frugal.md .qoder/rules/frugal.md .github/copilot-instructions.md .agents/rules/frugal.md; do printf -- '%s\n' "$BODY" > "$f"; done
```

`npm test` fails if they drift.

## Development

```bash
npm test   # detection tests + rule-copy drift guard + version consistency
```

Pipe-test the hooks directly:

```bash
node hooks/frugal-activate.js
echo '{"session_id":"t1","tool_input":{"command":"npx vercel deploy"}}' | node hooks/frugal-pretool.js
```

## License

MIT
