#!/usr/bin/env node
// Billable-provider table shared by the PreToolUse hook and tests.
// Quota numbers researched 2026-07 (dual-engine Claude + grok, cross-checked
// against official pricing pages); pitfall mechanisms mined from 272 X
// stories and re-verified against CURRENT billing models. Full tables:
// skills/frugal/references/providers.md; raw corpus: research/.

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
  { name: 'Exposed secret',
    pattern: /AIza[0-9A-Za-z_-]{35}|sk-ant-[A-Za-z0-9_-]{16,}|\bsk-[A-Za-z0-9_-]{20,}|r8_[A-Za-z0-9]{20,}|ghp_[A-Za-z0-9]{30,}|AKIA[0-9A-Z]{16}/,
    hint: 'an API key literal appears in this command — leaked keys are the #1 cause of 5-6 figure bills ($55k-$600k reported on X). Keep keys in untracked .env, rotate anything that may have left the machine, restrict scopes/quotas' },
  { name: 'Exposed secret',
    pattern: /(^|[;&|(]\s*)git\s+(add|commit)\b.*\.env\b/,
    hint: 'a .env file is being staged/committed — scrapers monitor repos and abuse leaked keys within hours. Keep .env in .gitignore; if it was ever pushed, rotate every key in it now' },
  { name: 'Agent CLI on API billing',
    pattern: cmd('claude|codex'),
    when: () => Boolean(process.env.ANTHROPIC_API_KEY || process.env.OPENAI_API_KEY),
    hint: 'ANTHROPIC_API_KEY / OPENAI_API_KEY is set in this environment — agent CLIs silently bill pay-per-token API instead of the flat subscription when a key is present ($100-$1,200 surprises reported). Unset it unless API billing is intended' },
  // ---- providers ----
  { name: 'Vercel', pattern: cmd('vercel|vc'),
    hint: 'Hobby (non-commercial only): 1M invocations + 1M edge reqs, 360 GB-hr memory, 100 GB transfer, 100 deploys/day — blown quotas hard-pause ~30 days. Pro fails OPEN: Spend Management is a $200 NOTIFICATION by default. Bot Protection is free but OFF by default — WAF-mitigated traffic is unbilled (2026-05+), unmitigated scanner/DDoS traffic bills invocations+bandwidth. LLM streaming/polling bills Provisioned Memory during I/O waits; audit leftover crons + preview deploys. Check: `vercel usage`' },
  { name: 'Cloudflare', pattern: cmd('wrangler|cloudflared'),
    hint: 'free tier is per-DAY and hard-fails: 100k Worker reqs + 10ms CPU; KV 1,000 writes/day blows first; D1 100k writes/day. Paid $5/mo fails OPEN with NO hard cap anywhere — guard queue/Workflow recursion (a re-enqueue loop billed 3.13B KV writes ≈ $36k/mo); Workflows adds per-step billing from 2026-08 (sleeps count as steps). Prefer `wrangler dev` locally' },
  { name: 'Cloudflare R2', pattern: cmd('wrangler\\s+r2'),
    hint: 'R2 free: 10 GB storage, zero egress fees, 1M class-A + 10M class-B ops/mo; past that storage is $0.015/GB-mo' },
  { name: 'Cloudflare KV', pattern: cmd('wrangler\\s+kv'),
    hint: 'KV free: only 1,000 writes/DAY — any per-request state writer blows it in minutes; $5/M writes on paid with no cap (the $36k loop was mostly KV writes)' },
  { name: 'Cloudflare D1', pattern: cmd('wrangler\\s+d1'),
    hint: 'D1 bills rows SCANNED not queries returned — an unindexed ORDER BY RANDOM() polled every 10s billed 400B reads ($700-3,000 hobby bills). Index hot paths; free: 100k writes / 5M reads per day' },
  { name: 'Neon', pattern: cmd('neonctl|neon'),
    hint: 'free: 100 CU-hr/mo per project — overrun SUSPENDS the DB until next month; polling defeats the 5-min autosuspend. Paid fails OPEN: default autoscale ceiling is 8 CU (a spike bills ~$20/day until you cap max CU), computes bill ≥0.25 CU while awake (~$19/mo floor), egress past 500 GB $0.10/GB — SET a spend limit. Use a branch for tests' },
  { name: 'Railway', pattern: cmd('railway'),
    hint: 'bills idle compute per-minute: $20/vCPU-mo + $10/GB-RAM-mo + $0.05/GB egress — an idle Next server at 400MB RAM alone eats the Hobby $5 credit in under a week. Enable serverless sleep; use railway.internal for DB traffic; failed-deploy loops also bill' },
  { name: 'Fly.io', pattern: cmd('flyctl|fly'),
    hint: 'NO free tier; trial = 2 total VM-hours. `fly launch` creates 2 machines by default; volumes bill $0.15/GB-mo even when stopped; no billing alerts exist — inventory `fly machine list` + `fly volumes list` before ending the session' },
  { name: 'E2B', pattern: cmd('e2b'),
    hint: 'bills per-second while RUNNING: a forgotten sandbox leaks ~$2.6-4/day against the one-time $100 credit; 1h session cap on free. Pro $150/mo only raises limits — usage still bills on top. `e2b sandbox list --state running`, kill when done' },
  { name: 'Browserbase', pattern: cmd('browserbase|browse-cli'),
    hint: 'free: 1 browser-hour per MONTH total (hard stop), 15-min max session, no proxies; leaked/keepAlive sessions bill wall-clock up to a 6-hr cap — release sessions explicitly' },
  { name: 'GitHub Actions', pattern: cmd('gh\\s+(?:workflow|run)'),
    hint: 'free: 2,000 private-repo minutes/mo (public unlimited); blown → workflows SILENTLY fail at the default $0 limit, raised limit fails OPEN. macOS runners bill ~10x Linux (agents love writing runs-on: macos), jobs default to a 6h timeout billing hung minutes — set timeout-minutes + concurrency cancel-in-progress. Check: `gh api /users/{user}/settings/billing/usage`' },
  { name: 'GitHub Actions', pattern: /(^|[;&|(]\s*)git\s+push\b/, when: hasWorkflows,
    hint: 'this push triggers GitHub Actions: private-repo free tier is 2,000 min/mo and every agent push runs full CI (per-push loops burned ~$700/mo). Set timeout-minutes + concurrency cancel-in-progress; when the $0 default limit is hit workflows silently fail' },
  { name: 'GitHub Codespaces', pattern: cmd('gh\\s+codespace'),
    hint: 'free: 120 core-hours/mo — a 4-core box left running ≈ 30 hours. Stop idle codespaces' },
  { name: 'Supabase', pattern: cmd('supabase'),
    hint: 'free: 2 active projects, 500 MB DB, AUTO-PAUSES after 7 idle days. Egress is POOLED across all services: 5 GB free then $0.09/GB — media served from Supabase Storage is the #1 burner ($600/mo cases); put files on R2/CDN. Pro: every extra project/branch bills ~$10/mo compute NOT blocked by Spend Cap. `supabase start` is local and free' },
  { name: 'Firebase', pattern: cmd('firebase'),
    hint: 'Blaze has NO hard cap, budgets only EMAIL (lag hrs-days); Spark hard-stops but cannot run Functions/Storage (Blaze forced since 2026-02). First blown: Firestore 50K reads/day — one unbounded onSnapshot on 500 docs x 100 DAU doubles it day one. Check onWrite triggers for recursion, SET maxInstances (1st-gen default is UNBOUNDED), restrict browser keys (/__/firebase/init.json is public)' },
  { name: 'Google GenAI enablement', pattern: cmd('gcloud\\s+services\\s+enable\\s+\\S*(?:generativelanguage|aiplatform)'),
    hint: 'enabling GenAI makes EVERY unrestricted key in this project a billable Gemini credential — including public Firebase browser keys and pre-2024 legacy keys ($15k-$160k abuse incidents). Restrict ALL keys and set per-day quotas BEFORE enabling; budgets only email' },
  { name: 'Twilio', pattern: cmd('twilio'),
    hint: 'SMS pumping turns open OTP endpoints into $2k-$18k/day fraud (refunds partial). Verify bills $0.05/success + SMS per ATTEMPT even undelivered, intl to ~$0.39/segment; NO spend-cap setting exists — the only stop is prepaid balance at $0, and auto-recharge (default) removes even that. Rate-limit sends, lock BOTH geo settings, Fraud Guard covers Verify only' },
  { name: 'GPU cloud', pattern: cmd('runpodctl|vastai|modal'),
    hint: 'GPU time bills wall-clock even idle/crashed ($23-$340 per forgotten night; warm min_containers ~$1,800/mo). RunPod/Vast prepaid is a de facto hard cap UNTIL auto-top-up is enabled; Modal budgets are OFF by default; stopped pods still bill disk, Vast stop != destroy. Verify dead before ending: `runpodctl pod list` / `modal app list` / `vastai show instances`' },
  { name: 'Observability/logs', pattern: cmd('datadog-agent|sentry-cli|aws\\s+logs\\s+create-log-group'),
    hint: 'no hard cap on Datadog or CloudWatch (alerts only; DD per-index daily quotas are the only real stop; Sentry drops overage unless a PAYG budget is set). CW $0.50/GB ingest, DD $1.70/M indexed events — $18k-$50k/mo blowups are the largest cluster on X. Agent scaffold traps: tracesSampleRate 1.0, user_id in metric tags, Never-Expire CW retention' },
  { name: 'AWS', pattern: cmd('aws|sam\\s+deploy|cdk\\s+deploy|serverless\\s+deploy|eb\\s+deploy'),
    hint: 'Lambda free: 1M req + 400K GB-s/mo, 100 GB egress; new accounts: $200 credit then AUTO-CLOSE at 6 months; idle NAT ≈ $33/mo. After teardown release Elastic IPs/public IPv4 in EVERY region ($0.005/hr each, hides under the VPC line item); stopped RDS still bills storage+IPs and restarts after 7 days. Check: `aws ce get-cost-and-usage`' },
  { name: 'GCP', pattern: cmd('gcloud|gsutil|bq'),
    hint: 'Cloud Run free: 2M req + 180K vCPU-s/mo BUT only 1 GB egress; min-instances bills 24/7 — avoid it. Budgets only EMAIL on 24-48h-old data — pair with quota caps or auto-disable. Check `gcloud billing budgets list`' },
  { name: 'Azure', pattern: cmd('az|azd\\s+up'),
    hint: 'Functions free: 1M req + 400K GB-s/mo; the auto-created Storage Account bills from day one; trial/student credits convert to paid with expensive defaults (idle Azure Firewall ~$900/mo). Check: `az consumption usage list`' },
  { name: 'Heroku', pattern: cmd('heroku'),
    hint: 'NO free tier, NO spend cap, no billing alerts. #1 trap: zombie add-ons — Postgres/Redis bill 24/7 until `heroku addons:destroy`, even with dynos scaled to 0. Eco = shared 1,000h pool and worker dynos never sleep' },
  { name: 'Render', pattern: cmd('render'),
    hint: 'Hobby free: 5 GB/mo bandwidth blows first (AI crawlers count) — with a card on file overage fails OPEN at $0.15/GB, without one the service suspends. Only a build-minute cap exists and it is OFF by default; free web services spin down, workers/DBs do not' },
  { name: 'Netlify', pattern: cmd('netlify|ntl'),
    hint: 'Free = 300 credits/mo and HARD-PAUSES at 0 (post-$104k-bill reform): a prod deploy is 15 credits (~20/mo), bandwidth 20 credits/GB (~15 GB). Iterate on preview deploys (free), never deploy-to-main per commit; paid tiers fail closed by default' },
  { name: 'DigitalOcean', pattern: cmd('doctl'),
    hint: 'NO spend cap anywhere. App Platform: any non-static component bills $5+/mo instantly; free static sites get 1 GiB egress then $0.02/GiB. Destroy orphan droplets/managed DBs — they bill until deleted. Check: `doctl balance get`' },
  { name: 'MongoDB Atlas', pattern: cmd('atlas'),
    hint: 'M0 free (512 MB, throttled 100 ops/s); Flex hard-caps at $30/mo — but Dedicated is UNCAPPED with autoscale ON by default (scales up in 10 min, down only after 24h) + $0.09/GB egress. Alerts are not preconfigured. PlanetScale has NO free tier ($5+/mo per DB+branch, card required)' },
  { name: 'Email API', pattern: cmd('resend|mailgun'),
    hint: 'SendGrid free is DEAD (60-day trial, then all sends die); Resend/Mailgun free = 100 emails/day hard stop. Resend caps overage at 5x quota BY DEFAULT; Mailgun\'s cap is OFF by default — set it. SendGrid Marketing: one CSV import = recurring monthly contact overage' },
  { name: 'Auth provider', pattern: cmd('auth0'),
    hint: 'MAU billing: Auth0 free 25K MAU and BOTS COUNT toward it; Clerk free 50K MRU (bots free); Firebase Auth 50K MAU but phone-OTP SMS bills separately after 10/day (US $0.01, intl to $0.46). #1 trap: phone-OTP scaffolds = SMS pumping surface. No hard caps on any paid tier' },
  { name: 'Media/vector store', pattern: cmd('cld|pinecone|upstash'),
    hint: 'legacy Pinecone pod indexes bill $81+/mo while idle (serverless free: 2 GB + 1M RU; Standard has a $50/mo floor, alerts only). Upstash has the ONLY real hard cap in this category (per-DB max monthly budget) but it is OFF by default — set it. Cloudinary free = 25 credits/rolling-30d, suspends instead of billing' },
  { name: 'IaC provisioning', pattern: cmd('terraform\\s+apply|tofu\\s+apply|pulumi\\s+up'),
    hint: 'provisions real billable resources — run plan first, read it, and confirm with the user before applying' },
];

function detectProviders(command, input) {
  const text = String(command || '');
  return PROVIDERS.filter((p) => p.pattern.test(text) && (!p.when || p.when(input)));
}

module.exports = { PROVIDERS, detectProviders };
