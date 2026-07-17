#!/usr/bin/env node
// Billable-provider table shared by the PreToolUse hook and tests.
//
// Each entry is layered so mode can pick volume:
//   brief  — always (quiet+): free-tier / key quota NUMBERS + hard-pause vs
//            fail-open. Numbers are the product — not a vague "it bills".
//   trap   — normal+: one decisive gotcha (defaults, recursion, dual meters)
//   horror — strict only: real-bill dollar context (marketing/deep research)
//   dig    — normal+: optional read-only check; agent may skip if no creds
//
// Full plan tables: skills/frugal/references/providers.md; corpus: research/.

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
  // ---- cross-provider tripwires ----
  // ponytail: no secret/leak detection here — that's a security concern,
  // not a billing one. frugal only covers normal usage where the developer
  // (or their agent) forgot to check how a service is metered.
  { name: 'Agent CLI on API billing',
    pattern: cmd('claude|codex'),
    when: () => Boolean(process.env.ANTHROPIC_API_KEY || process.env.OPENAI_API_KEY),
    brief: 'API key in env → CLI bills pay-per-token API rates, not the flat $20/$100 subscription.',
    trap: 'Unset the key unless API billing is intended.',
    horror: 'Dual-rail surprises reported $100–$1,200.',
    dig: null },

  // ---- providers ----
  { name: 'Vercel', pattern: cmd('vercel|vc'),
    brief: 'Hobby (non-commercial): 1M inv + 1M edge reqs, 360 GB-hr mem, 100 GB transfer, 100 deploys/day — hard-pauses ~30d at quota. Pro fails open.',
    trap: 'Spend Management defaults to notify-only at $200 — enable its auto-pause for a real stop.',
    horror: 'Unmitigated viral/scanner traffic has hit ~$46k.',
    dig: 'vercel usage' },

  { name: 'Cloudflare', pattern: cmd('wrangler|cloudflared'),
    brief: 'Free (per-DAY, hard-fail): 100k Worker reqs + 10ms CPU; KV 1k writes/day; D1 100k writes/day. Paid $5/mo fails open — no account hard cap.',
    trap: 'Queue/Workflow re-enqueue recursion is the classic burn — guard the retry path.',
    horror: 'Re-enqueue loops billed ~$36k/mo (3.13B KV writes).',
    dig: null },

  { name: 'Cloudflare R2', pattern: cmd('wrangler\\s+r2'),
    brief: 'R2 free: 10 GB storage, $0 egress, 1M class-A + 10M class-B ops/mo; then $0.015/GB-mo storage.',
    trap: 'Class A ops (PUT/LIST) bill ~12× class B — small-file sync loops burn the 1M fast.',
    horror: null,
    dig: null },

  { name: 'Cloudflare KV', pattern: cmd('wrangler\\s+kv'),
    brief: 'KV free: 1k writes/day; paid $5/M writes, no cap.',
    trap: 'Per-request writers blow free tier in minutes.',
    horror: 'The $36k CF loop was mostly KV writes.',
    dig: null },

  { name: 'Cloudflare D1', pattern: cmd('wrangler\\s+d1'),
    brief: 'D1 free: 100k writes + 5M reads/day; bills rows SCANNED not returned.',
    trap: 'Unindexed scans + polling multiply reads massively.',
    horror: 'Hobby bills of $700–$3,000 from scan loops reported.',
    dig: null },

  { name: 'Neon', pattern: cmd('neonctl|neon'),
    brief: 'Free/project: 100 CU-hr/mo compute + 5 GB egress — overrun suspends compute until next month. 0.5 GB storage: when full, writes FAIL (no auto-billing).',
    trap: 'Polling defeats the 5-min autosuspend — the DB never sleeps.',
    horror: 'Default 8 CU ceiling can spike ~$20/day until capped.',
    dig: 'neonctl projects list' },

  { name: 'Railway', pattern: cmd('railway'),
    brief: 'Idle compute: ~$20/vCPU-mo + $10/GB-RAM-mo + $0.05/GB egress. Free $1 / Hobby $5 credit.',
    trap: 'Enable app sleep — idle services bill RAM + vCPU 24/7.',
    horror: null,
    dig: null },

  { name: 'Fly.io', pattern: cmd('flyctl|fly'),
    brief: 'No free tier; trial = 2 VM-hours total. Then pure PAYG (shared-1x 256MB ~$2/mo).',
    trap: '`fly launch` creates 2 machines by default — scale to 1 if unintended.',
    horror: null,
    dig: 'fly machine list' },

  { name: 'E2B', pattern: cmd('e2b'),
    brief: 'Free: $100 one-time credit, 1h session cap, 20 concurrent; bills per-second while RUNNING.',
    trap: 'Kill when done — leaked sandboxes drain the credit.',
    horror: 'Forgotten sandbox ~$2.6–4/day.',
    dig: 'e2b sandbox list --state running' },

  { name: 'Browserbase', pattern: cmd('browserbase|browse-cli'),
    brief: 'Free: 1 browser-hour/mo hard stop, 15-min max session, 3 concurrent.',
    trap: 'keepAlive bills wall-clock up to 6h — release sessions explicitly.',
    horror: null,
    dig: null },

  { name: 'GitHub Actions', pattern: cmd('gh\\s+(?:workflow|run)'),
    brief: 'Private free: 2,000 min/mo (public unlimited). $0 spend limit fails closed; raised limit fails open.',
    trap: 'macOS drains the pool at 10× — a 10-min macOS job costs 100 of the 2,000.',
    horror: null,
    dig: 'gh run list --limit 5' },

  { name: 'GitHub Actions', pattern: /(^|[;&|(]\s*)git\s+push\b/, when: hasWorkflows,
    brief: 'This push triggers Actions — private free 2,000 min/mo; each push can re-run full CI.',
    trap: 'Set timeout-minutes + concurrency cancel-in-progress before agent push loops.',
    horror: 'Per-push CI loops have burned ~$700/mo.',
    dig: null },

  { name: 'GitHub Codespaces', pattern: cmd('gh\\s+codespace'),
    brief: 'Personal accounts free: 120 core-hours/mo — a 4-core box left running ≈ 30 hours. Org-owned repos bill the org.',
    trap: 'Stop idle codespaces in-session.',
    horror: null,
    dig: null },

  { name: 'Supabase', pattern: cmd('supabase'),
    brief: 'Free: 2 projects, 500 MB DB, 5 GB egress, 50k MAU; auto-pauses after 7 idle days.',
    trap: 'Egress is pooled at $0.09/GB — Storage media is the #1 burner.',
    horror: '~$600/mo egress cases reported.',
    dig: null },

  { name: 'Firebase', pattern: cmd('firebase'),
    brief: 'Spark free: 50k Firestore reads + 20k writes/day hard-stop (no Functions/Storage). Blaze: NO hard cap.',
    trap: 'onWrite recursion with unbounded maxInstances is the classic burn (1st-gen default: unbounded).',
    horror: 'Read loops hit $5k/mo at ~100 users.',
    dig: null },

  { name: 'Twilio', pattern: cmd('twilio'),
    brief: 'Verify ~$0.05/success + channel fee per ATTEMPT (even failed/undelivered). No account spend-cap setting.',
    trap: 'Auto-recharge (default) removes the prepaid-zero brake — check balance before high-retry flows.',
    horror: 'OTP pumping hits $2k–$18k/day.',
    dig: 'twilio api:core:balance:fetch' },

  { name: 'Modal', pattern: cmd('modal'),
    brief: 'Bills per-second while containers run; free tier ~$30/mo credit, then PAYG.',
    trap: 'min_containers keeps GPUs warm (and billing) 24/7.',
    horror: 'Warm min_containers ~$1,800/mo reported.',
    dig: 'modal app list' },

  { name: 'RunPod', pattern: cmd('runpodctl'),
    brief: 'Bills wall-clock while pods are up (A100 ~$2/hr); prepaid is a hard cap only until auto-top-up.',
    trap: 'Stop ≠ destroy — stopped pods still bill storage.',
    horror: 'Forgotten pods run $23–$340 overnight.',
    dig: 'runpodctl get pod' },

  { name: 'Vast.ai', pattern: cmd('vastai'),
    brief: 'Bills wall-clock while instances are up (4090 ~$0.30/hr); prepaid balance is the only brake.',
    trap: 'Stopped instances still bill storage — destroy when done.',
    horror: null,
    dig: 'vastai show instances' },

  { name: 'Observability/logs', pattern: cmd('datadog-agent|sentry-cli|aws\\s+logs\\s+create-log-group'),
    brief: 'CW ~$0.50/GB ingest; DD ~$1.70/M indexed events — no hard cap (alerts only). Sentry free ~5k errors/mo.',
    trap: 'Default sample-rate 1.0 ships every event — set sampling before prod.',
    horror: '$18k–$50k/mo blowups are a common cluster.',
    dig: null },

  { name: 'AWS', pattern: cmd('aws|sam\\s+deploy|cdk\\s+deploy|serverless\\s+deploy|eb\\s+deploy'),
    brief: 'Lambda free: 1M req + 400k GB-s/mo, 100 GB egress. New free-plan accounts: up to $200 credit ($100 upfront), auto-close ~6 mo. PAYG after.',
    trap: 'Idle NAT gateways (~$33/mo each) are the classic leak — delete when done.',
    horror: null,
    dig: 'aws ce get-cost-and-usage' },

  { name: 'GCP', pattern: cmd('gcloud|gsutil|bq'),
    brief: 'Cloud Run free: 2M req + 180k vCPU-s/mo but only 1 GB egress. min-instances bill 24/7.',
    trap: 'Budgets only email on 24–48h-old data — pair with quota caps.',
    horror: 'Five-figure bills on accounts with $10 budgets are on record.',
    dig: 'gcloud billing budgets list' },

  { name: 'Azure', pattern: cmd('az|azd\\s+up'),
    brief: 'Functions free grant: 1M req + 400k GB-s/mo (classic Consumption; Flex plan: 250k + 100k). Auto-created Storage Account bills from day one.',
    trap: 'Trial/student credits convert to paid with expensive defaults.',
    horror: 'Idle Azure Firewall ~$900/mo class of trap.',
    dig: 'az consumption usage list' },

  { name: 'Heroku', pattern: cmd('heroku'),
    brief: 'No free tier, no spend cap, no billing alerts. Eco = shared 1,000h pool; workers never sleep.',
    trap: 'Zombie add-ons bill 24/7 until destroyed — even with dynos at 0.',
    horror: null,
    dig: 'heroku apps' },

  { name: 'Render', pattern: cmd('render'),
    brief: 'Hobby free: 5 GB/mo bandwidth (crawlers count); free web services spin down, workers/DBs do not.',
    trap: 'Card on file → bandwidth overage fails open at $0.15/GB.',
    horror: null,
    dig: null },

  { name: 'Netlify', pattern: cmd('netlify|ntl'),
    brief: 'Free: 300 credits/mo hard-pauses at 0. Prod deploy ≈ 15 credits (≈20 prod deploys/mo); bandwidth 20 credits/GB (~15 GB).',
    trap: 'Iterate on free preview deploys — never deploy-to-main per commit.',
    horror: null,
    dig: null },

  { name: 'DigitalOcean', pattern: cmd('doctl'),
    brief: 'No spend cap. App Platform non-static $5+/mo; free static 1 GiB egress then $0.02/GiB.',
    trap: 'Destroy orphan droplets/DBs — they bill until deleted.',
    horror: null,
    dig: 'doctl balance get' },

  { name: 'MongoDB Atlas', pattern: cmd('atlas'),
    brief: 'M0 free: 512 MB, throttled 100 ops/s. Flex hard-caps $30/mo. Dedicated uncapped + $0.09/GB egress.',
    trap: 'Dedicated autoscale ON by default (up in ~10 min, down after 24h).',
    horror: null,
    dig: 'atlas clusters list' },

  { name: 'Email API', pattern: cmd('resend|mailgun'),
    brief: 'Resend/Mailgun free ≈ 100 emails/day hard stop. SendGrid free is dead (60-day trial only).',
    trap: 'Mailgun spend cap is OFF by default — set it before send loops.',
    horror: null,
    dig: null },

  { name: 'Auth provider', pattern: cmd('auth0'),
    brief: 'Free: Auth0 25k MAU (bots count); Clerk 50k MRU (bots free); Firebase Auth 50k MAU.',
    trap: 'Phone-OTP SMS is a second uncapped meter (US ~$0.01, intl up to ~$0.46/msg).',
    horror: null,
    dig: null },

  { name: 'Media/vector store', pattern: cmd('cld|pinecone|upstash'),
    brief: 'Free: Cloudinary 25 credits/30d; Pinecone serverless 2 GB + 1M RU; Upstash 500k cmds.',
    trap: 'Upstash hard budget exists but is OFF by default — set it.',
    horror: 'Legacy Pinecone pods ~$81+/mo idle.',
    dig: null },

  { name: 'IaC provisioning', pattern: cmd('terraform\\s+apply|tofu\\s+apply|pulumi\\s+up'),
    brief: 'Applies real billable cloud resources (no free-tier shield at apply time).',
    trap: 'Run plan first; confirm with the user before apply.',
    horror: null,
    dig: null },
];

function detectProviders(command, input) {
  const text = String(command || '');
  const hits = PROVIDERS.filter((p) => p.pattern.test(text) && (!p.when || p.when(input)));
  // A sub-service hit ('Cloudflare KV') suppresses its base ('Cloudflare') so
  // `wrangler kv ...` injects one focused line, not two overlapping ones.
  return hits.filter((h) => !hits.some((o) => o !== h && o.name.startsWith(h.name + ' ')));
}

/** Build the inject line for a provider at a given mode. */
function formatReminder(provider, mode) {
  const m = mode === 'off' ? 'off' : (mode || 'normal');
  if (m === 'off') return null;

  const parts = [provider.brief];
  if ((m === 'normal' || m === 'strict') && provider.trap) {
    parts.push(provider.trap);
  }
  if (m === 'strict' && provider.horror) {
    parts.push(provider.horror);
  }
  // quiet = numbers only; dig suggestions start at normal.
  if (m !== 'quiet' && provider.dig) {
    parts.push('Optional: `' + provider.dig + '`.');
  }
  return 'frugal: ' + provider.name + ' — ' + parts.join(' ');
}

// Back-compat: composite "hint" for anything still reading .hint
for (const p of PROVIDERS) {
  if (!p.hint) {
    p.hint = [p.brief, p.trap, p.horror, p.dig ? 'Optional: `' + p.dig + '`' : null]
      .filter(Boolean)
      .join(' ');
  }
}

module.exports = { PROVIDERS, detectProviders, formatReminder };
