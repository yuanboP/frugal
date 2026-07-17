---
name: frugal
description: >
  Cloud cost awareness for agents. Metered services (Vercel, Cloudflare
  Workers/R2/KV/D1, Neon, Railway, Fly.io, E2B, Browserbase, GitHub
  Actions/Codespaces, Supabase, AWS, GCP, Azure, Terraform/Pulumi) silently
  bill by usage, and the user may not understand why the bill exploded. Use
  whenever the user asks about cloud costs, billing, usage, quotas, free
  tiers, "check the bill", "why is my bill so high", reducing cloud spend,
  or before deploying/provisioning to any metered service. Scope is normal
  usage that runs up a bill unnoticed (wrong tier, forgotten resource, loop
  that hits a paid meter) — not credential leaks or fraud, that's a security
  concern. Do NOT use for questions about application pricing models or
  unrelated finance topics.
license: MIT
---

# Frugal

You are cost-aware. Agents burn users' money silently on metered cloud
services; the user may be non-technical and only discover it on the monthly
bill. Every deploy, sandbox, database, and API loop you run can cost real
money that is not yours.

## Rules

- **First touch**: one short line on how it bills (hard-pause vs fail-open).
  Optional dig if a cheap CLI exists — skip if no credentials. Do not lecture.
- **Lasting paid resources**: one-line notice; prefer free/local first
  (`wrangler dev`, `vercel dev`, Neon branch, `supabase start`).
- **Ephemeral dies in-session**: sandboxes, test resources, idle Codespaces.
- **Escalate only for scary spend**: unattended loops, no-cap meters,
  recursive triggers, open OTP/send, real `apply`/provision. One sentence.
- **Alerts are not brakes**; **paid plans fail open** unless a spend cap
  actually stops service — details in `references/providers.md`.
- **Never silently spend for the user.** Work first; one-line reminders.

## Intensity

| Level | Inject |
|-------|--------|
| **quiet** | Free-tier / key quota numbers only |
| **normal** (default) | Numbers + one trap; dig optional |
| **strict** | + real-bill dollar context; confirm scary actions |

`/frugal quiet|normal|strict|off` · `/frugal default <level>` · `FRUGAL_MODE`

## Free-tier cheat-sheet (researched 2026-07)

Numbers below are the **free-tier** walls agent-built apps hit — check which
plan the user is actually on before applying them. Paid plan tables, overage
prices, and sources: `references/providers.md` (core cloud) and
`references/indie-services.md` (Firebase, PaaS, email, auth, maps, AI APIs,
GPU, observability) in this skill.

| Provider | Free tier key numbers | What blows first | Check usage |
|---|---|---|---|
| Vercel | 1M edge reqs, 1M invocations, 360 GB-hr memory, 100 GB transfer, 100 deploys/day; non-commercial only | deploy cap in agent loops; memory GB-hrs — bills through I/O waits, so LLM streaming/polling burns it with zero CPU | `vercel usage` |
| Cloudflare | per-DAY quotas, hard-fail: 100k Worker reqs + 10ms CPU; KV 1k writes; D1 100k writes; R2 10 GB storage + $0 egress | KV's 1k writes/day — minutes under load | dashboard Billable Usage; `wrangler d1 info` |
| Neon | 100 CU-hr/mo/project, 0.5 GB storage, 5 GB egress | compute hours: polling defeats autosuspend → DB SUSPENDS until next month at ~day 17 | console / consumption API |
| Railway | $1/mo credit (Hobby: $5) | the credit — RAM is $10/GB-mo; always-on app+DB ≈ $15-25/mo | railway.com/workspace/usage |
| Fly.io | NO free tier; trial = 2 VM-hours total | trial gone in 2h always-on; `fly launch` silently creates 2 machines | `fly machine list` + dashboard |
| E2B | $100 one-time credit, 1h session cap, 20 concurrent | leaked sandboxes: ~$2.6-4/day each while running | `e2b sandbox list --state running` |
| Browserbase | 1 browser-hr/MONTH, 15-min max session, 3 concurrent | that single hour, in one afternoon of dev | API `/projects/{id}/usage` |
| GitHub | 2,000 private Actions min/mo (public unlimited), 120 Codespaces core-hr, 500 MB storage | Actions minutes in 2-3 weeks of auto-deploys — then workflows SILENTLY fail at the $0 default limit | `gh api /users/{u}/settings/billing/usage` |
| Supabase | 2 active projects, 500 MB DB, 5 GB egress, 50k MAU | 7-day idle AUTO-PAUSE kills deploy-and-forget apps; Pro: each extra project/branch bills ~$10/mo uncapped by Spend Cap | dashboard org usage |
| AWS/GCP/Azure | Lambda/Az Functions 1M req + 400K GB-s/mo; Cloud Run 2M req but 1 GB egress; AWS $200 credit / 6-mo auto-close | NAT gateway (~$33/mo idle), forgotten instances, egress | `aws ce get-cost-and-usage` / `az consumption usage list` |
| Firebase | Spark: 50K Firestore reads + 20K writes/day, hard stop (but no Functions/Storage); Blaze: NO cap | unbounded onSnapshot loops, recursive triggers, unset maxInstances | console usage pages; no CLI spend command |
| Heroku / Render | Heroku: NO free tier, NO cap; Render Hobby: 5 GB/mo bandwidth | zombie add-ons billing 24/7; AI-crawler bandwidth | `heroku addons` / Render dashboard |
| Netlify / DigitalOcean | Netlify: 300 credits/mo, hard-pauses; DO: NO cap, non-static component $5+/mo | prod deploy = 15 credits (~20/mo); orphan droplets/DBs | `doctl balance get` |
| MongoDB Atlas / PlanetScale | M0 free 512 MB throttled; Flex caps $30/mo; Dedicated UNCAPPED; PlanetScale: no free tier | autoscale up-in-10min-down-after-24h; $0.09/GB egress | `atlas api invoices` |
| Email (Resend/SendGrid/Mailgun) | SendGrid free DEAD (60-day trial); others 100/day hard stop | contact-storage overage recurs monthly; Mailgun cap OFF by default | provider dashboards |
| Auth (Clerk/Auth0/Firebase) | 50K MRU / 25K MAU (bots COUNT) / 50K MAU | phone-OTP is a second, easy-to-miss meter — SMS bills per message on top of MAU | provider dashboards |
| Maps (Google/Mapbox) | per-SKU free calls (10K/5K/1K, NOT pooled); Mapbox 50K loads | unrestricted client keys, map remounts; NO caps on either | GCP console / Mapbox stats |
| AI APIs (OpenAI/Anthropic/Replicate) | Anthropic: tier ceiling (real cap); OpenAI: alerts only; Replicate: credit | env API key flips agent CLIs to per-token billing without warning | `claude /status`; console usage pages |
| GPU (RunPod/Modal/Vast) | prepaid balance = de facto cap UNTIL auto-top-up; Modal $30/mo credit | idle pods, warm min_containers, stop != destroy | `runpodctl get pod` / `modal app list` / `vastai show instances` |
| Observability (Datadog/CloudWatch/Sentry) | DD/CW: NO caps (alerts only); Sentry 5K errors/mo | tracesSampleRate 1.0, ID metric tags, Never-Expire retention | DD usage monitors / CW billing |
| Media/vector (Cloudinary/Pinecone/Upstash) | 25 credits / 2 GB + 1M RU / 500K cmds | legacy Pinecone pods $81+/mo idle; Upstash hard cap exists but OFF | dashboards; `cld admin usage` |

## Paid-plan tripwires (fail-open walls)

When the user IS on a paid plan, these are the researched danger spots:

- **Vercel Pro**: Spend Management defaults to a **$200 notification**, not a
  stop; auto-pause is opt-in and paused projects never auto-unpause. Builds
  bill by default (Elastic machines) — every agent push costs CPU-minutes.
- **Neon Launch/Scale**: pure pay-as-you-go, $0 base. The free-tier suspend
  becomes a **silent bill**: one always-on 1 CU compute ≈ $77/mo (Launch);
  egress past 500 GB bills $0.10/GB; autosuspend CAN be disabled — make sure
  it isn't, and set Neon's spend limit (alerts at ~80%/100%).
- **Cloudflare Workers Paid**: $5/mo floor, then open-ended — KV writes
  $5/M, Durable Objects duration $12.50/M GB-s, D1 writes $1/M.
- **Supabase Pro**: Spend Cap exists but does **not** cover per-project
  compute — each extra project/branch bills ~$10/mo regardless.
- **GitHub**: raising the $0 Actions spending limit opens unbounded
  per-minute billing; macOS runners ~10x Linux.
- **E2B Pro**: $150/mo raises concurrency/session limits only — sandbox
  seconds still bill on top.
- **Fly.io**: pure PAYG with **no billing alerts at all** — inventory
  machines/volumes regularly (`fly machine list`, `fly volumes list`).
- **AWS/GCP/Azure**: no default caps — set `aws budgets` / `gcloud billing
  budgets` / Azure cost alerts before provisioning anything (and remember
  they only email, on lagged data).
- **Firebase Blaze**: NO hard cap exists; Firestore read loops and
  recursive triggers bill unbounded — set functions maxInstances before
  going live.
- **No-cap vendors**: Mapbox (and several metered SaaS) offer no spend cap
  at all — viral traffic means unbounded exposure; prefer cappable or
  self-hostable alternatives for public pages.
