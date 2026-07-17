#!/usr/bin/env node
// Billable-provider table shared by the PreToolUse hook and tests.

// Match only at command position: start of string, after ;|&( separators, or
// via a runner (npx / bunx / pnpm dlx). This keeps prose args like
// `git commit -m "fix vercel deploy"` from triggering.
// ponytail: quoted-string edge cases can still slip through; acceptable —
// the reminder is harmless and fires once per provider per session.
function cmd(names) {
  return new RegExp('(^|[;&|(]\\s*|\\b(?:npx|bunx)\\s+(?:-y\\s+)?|\\bpnpm\\s+dlx\\s+)(?:' + names + ')\\b');
}

const PROVIDERS = [
  { name: 'Vercel', pattern: cmd('vercel|vc'), hint: 'usage at vercel.com/<team>/~/usage — function invocations, bandwidth, edge requests' },
  { name: 'Cloudflare', pattern: cmd('wrangler'), hint: 'billing at dash.cloudflare.com; prefer `wrangler dev` locally before deploying' },
  { name: 'Neon', pattern: cmd('neonctl|neon'), hint: 'bills by compute hours; use a branch for testing instead of a new project' },
  { name: 'Railway', pattern: cmd('railway'), hint: 'check `railway status` / dashboard usage' },
  { name: 'Fly.io', pattern: cmd('flyctl|fly'), hint: 'billing via `fly dashboard`' },
  { name: 'E2B', pattern: cmd('e2b'), hint: 'sandboxes bill per second — kill them the moment you are done' },
  { name: 'Browserbase', pattern: cmd('browserbase'), hint: 'bills per session minute — close sessions when done' },
  { name: 'GitHub Codespaces', pattern: cmd('gh\\s+codespace'), hint: 'bills per core-hour while running' },
  { name: 'AWS', pattern: cmd('aws'), hint: 'check Cost Explorer; creating resources incurs real cost' },
  { name: 'GCP', pattern: cmd('gcloud'), hint: 'check the billing console' },
  { name: 'Azure', pattern: cmd('az'), hint: 'check cost management' },
  { name: 'Supabase', pattern: cmd('supabase'), hint: 'remote projects bill by usage; `supabase start` is local and free' },
  { name: 'IaC provisioning', pattern: cmd('terraform\\s+apply|tofu\\s+apply|pulumi\\s+up'), hint: 'provisions real billable resources — confirm with the user first' },
];

function detectProviders(command) {
  const text = String(command || '');
  return PROVIDERS.filter((p) => p.pattern.test(text));
}

module.exports = { PROVIDERS, detectProviders };
