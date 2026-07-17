#!/usr/bin/env node
// Billable-provider table shared by the PreToolUse hook and tests.
// Quota numbers researched 2026-07 (dual-engine: Claude web research + grok,
// cross-checked against official pricing pages). Full tables with sources:
// skills/frugal/references/providers.md

const fs = require('fs');
const path = require('path');

// Match only at command position: start of string, after ;|&( separators, or
// via a runner (npx / bunx / pnpm dlx). This keeps prose args like
// `git commit -m "fix vercel deploy"` from triggering.
// ponytail: quoted-string edge cases can still slip through; acceptable —
// the reminder is harmless and fires once per provider per session.
function cmd(names) {
  return new RegExp('(^|[;&|(]\\s*|\\b(?:npx|bunx)\\s+(?:-y\\s+)?|\\bpnpm\\s+dlx\\s+)(?:' + names + ')\\b');
}

// `git push` only costs money when it triggers workflows.
function hasWorkflows(input) {
  try {
    const cwd = (input && input.cwd) || process.cwd();
    return fs.existsSync(path.join(cwd, '.github', 'workflows'));
  } catch {
    return false;
  }
}

const PROVIDERS = [
  { name: 'Vercel', pattern: cmd('vercel|vc'),
    hint: 'Hobby (non-commercial only): 1M invocations + 1M edge reqs, 360 GB-hr memory, 100 GB transfer, 100 deploys/day — blown quotas hard-pause ~30 days. #1 trap: LLM streaming/polling bills Provisioned Memory during I/O waits. Check: `vercel usage`' },
  { name: 'Cloudflare', pattern: cmd('wrangler|cloudflared'),
    hint: 'free tier is per-DAY and hard-fails: 100k Worker reqs + 10ms CPU; KV 1,000 writes/day blows first; D1 100k writes/day. Paid $5/mo = 10M reqs. Prefer `wrangler dev` locally; spend via dashboard Billable Usage' },
  { name: 'Cloudflare R2', pattern: cmd('wrangler\\s+r2'),
    hint: 'R2 free: 10 GB storage, zero egress fees, 1M class-A + 10M class-B ops/mo; past that storage is $0.015/GB-mo' },
  { name: 'Cloudflare KV', pattern: cmd('wrangler\\s+kv'),
    hint: 'KV free: only 1,000 writes/DAY — any per-request state writer blows it in minutes; $5/M writes on paid' },
  { name: 'Cloudflare D1', pattern: cmd('wrangler\\s+d1'),
    hint: 'D1 free: 100k writes / 5M reads per day; full-table scans bill every scanned row — index or pay' },
  { name: 'Neon', pattern: cmd('neonctl|neon'),
    hint: 'free: 100 CU-hr/mo per project, 0.5 GB storage, 5 GB egress — overrun SUSPENDS the DB until next month. Polling defeats the 5-min autosuspend: a 0.25 CU always-on compute is dead in ~17 days. Use a branch for tests, not a new project' },
  { name: 'Railway', pattern: cmd('railway'),
    hint: 'bills idle compute per-minute: $20/vCPU-mo + $10/GB-RAM-mo + $0.05/GB egress; Hobby $5 credit dies in under a week always-on. Enable serverless sleep; use railway.internal for DB traffic' },
  { name: 'Fly.io', pattern: cmd('flyctl|fly'),
    hint: 'NO free tier; trial = 2 total VM-hours. `fly launch` creates 2 machines by default; volumes bill $0.15/GB-mo even when stopped; no billing alerts exist' },
  { name: 'E2B', pattern: cmd('e2b'),
    hint: 'bills per-second while RUNNING: a forgotten sandbox leaks ~$2.6-4/day against the one-time $100 credit; 1h session cap on free. `e2b sandbox list --state running`, kill when done' },
  { name: 'Browserbase', pattern: cmd('browserbase|browse-cli'),
    hint: 'free: 1 browser-hour per MONTH total (hard stop), 15-min max session, no proxies; leaked/keepAlive sessions bill wall-clock up to a 6-hr cap — release sessions explicitly' },
  { name: 'GitHub Actions', pattern: cmd('gh\\s+(?:workflow|run)'),
    hint: 'free: 2,000 private-repo minutes/mo (public repos unlimited); an auto-deploy pipeline eats that in 2-3 weeks, then workflows SILENTLY fail at the default $0 spending limit; macOS runners cost ~10x Linux. Check: `gh api /users/{user}/settings/billing/usage`' },
  { name: 'GitHub Actions', pattern: /(^|[;&|(]\s*)git\s+push\b/, when: hasWorkflows,
    hint: 'this push triggers GitHub Actions: private-repo free tier is 2,000 min/mo; when blown, workflows silently fail at the default $0 spending limit' },
  { name: 'GitHub Codespaces', pattern: cmd('gh\\s+codespace'),
    hint: 'free: 120 core-hours/mo — a 4-core box left running ≈ 30 hours. Stop idle codespaces' },
  { name: 'Supabase', pattern: cmd('supabase'),
    hint: 'free: 2 active projects, 500 MB DB, 5 GB egress, AUTO-PAUSES after 7 idle days; on Pro every extra project/branch bills ~$10/mo compute that Spend Cap does NOT block. `supabase start` is local and free' },
  { name: 'AWS', pattern: cmd('aws|sam\\s+deploy|cdk\\s+deploy|serverless\\s+deploy|eb\\s+deploy'),
    hint: 'Lambda free: 1M req + 400K GB-s/mo, 100 GB egress; new accounts get $200 credit then AUTO-CLOSE at 6 months; an idle NAT gateway alone is ~$33/mo. Check: `aws ce get-cost-and-usage`' },
  { name: 'GCP', pattern: cmd('gcloud|gsutil|bq|firebase\\s+deploy'),
    hint: 'Cloud Run free: 2M req + 180K vCPU-s/mo BUT only 1 GB egress; min-instances bills 24/7 — avoid it. Spend via billing console' },
  { name: 'Azure', pattern: cmd('az|azd\\s+up'),
    hint: 'Functions free: 1M req + 400K GB-s/mo; the auto-created Storage Account bills from day one. Check: `az consumption usage list`' },
  { name: 'IaC provisioning', pattern: cmd('terraform\\s+apply|tofu\\s+apply|pulumi\\s+up'),
    hint: 'provisions real billable resources — run plan first, read it, and confirm with the user before applying' },
];

function detectProviders(command, input) {
  const text = String(command || '');
  return PROVIDERS.filter((p) => p.pattern.test(text) && (!p.when || p.when(input)));
}

module.exports = { PROVIDERS, detectProviders };
