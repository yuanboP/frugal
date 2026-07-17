---
name: frugal
description: >
  Cloud cost awareness for agents. Metered services (Vercel, Cloudflare
  Workers/R2/KV/D1, Neon, Railway, Fly.io, E2B, Browserbase, GitHub
  Actions/Codespaces, Supabase, AWS, GCP, Azure, Terraform/Pulumi) silently
  bill by usage, and the user may not understand why the bill exploded. Use
  whenever the user asks about cloud costs, billing, usage, quotas, free
  tiers, "check the bill", "why is my bill so high", reducing cloud spend,
  or before deploying/provisioning to any metered service. Do NOT use for
  questions about application pricing models or unrelated finance topics.
license: MIT
---

# Frugal

You are cost-aware. Agents burn users' money silently on metered cloud
services; the user may be non-technical and only discover it on the monthly
bill. Every deploy, sandbox, database, and API loop you run can cost real
money that is not yours.

## Rules

- **First touch of a metered service in a session**: if a read-only
  usage/quota command or dashboard exists, check it (or tell the user how to);
  at minimum say in one line that this service bills by usage.
- **Before creating a paid resource** (deploy, database, sandbox, VM, bucket):
  tell the user in one line that it incurs cost. Prefer free tiers and local
  dev first — `wrangler dev`, `vercel dev`, a Neon branch instead of a new
  project, `supabase start`, a local `docker run postgres`.
- **Ephemeral things must die**: kill E2B/Browserbase sandboxes the moment
  you are done, delete resources you provisioned for a test in the same
  session, stop idle Codespaces. Never leave a metered thing running past
  its use.
- **Cost anti-patterns to avoid**: unbounded retry/poll loops against paid
  APIs (polling also defeats DB autosuspend and keeps serverless functions
  warm — it bills THREE ways), large egress transfers, provisioning a fresh
  instance per test instead of reusing one, oversized instance defaults,
  high-frequency crons doing low-value work.
- **Never silently make a spend decision for the user.** A one-line notice
  is enough for small costs; stop and ask only for recurring or large costs
  (new paid plan, production database, `terraform apply` on real infra).
- **Do not become a roadblock**: reminders are one line, not endless
  confirmations. Work first, spend consciously.

## Free-tier cheat-sheet (researched 2026-07)

Numbers below are the walls agent-built apps actually hit. Full plan tables,
overage prices, and sources: `references/providers.md` in this skill.

| Provider | Free tier key numbers | What blows first | Check usage |
|---|---|---|---|
| Vercel | 1M edge reqs, 1M invocations, 360 GB-hr memory, 100 GB transfer, 100 deploys/day; non-commercial only | deploy cap in agent loops; memory GB-hrs — bills through I/O waits, so LLM streaming/polling burns it with zero CPU | `vercel usage` |
| Cloudflare | per-DAY quotas, hard-fail: 100k Worker reqs + 10ms CPU; KV 1k writes; D1 100k writes; R2 10 GB storage + $0 egress | KV's 1,000 writes/day — minutes under load | dashboard Billable Usage; `wrangler d1 info` |
| Neon | 100 CU-hr/mo/project, 0.5 GB storage, 5 GB egress | compute hours: polling defeats autosuspend → DB SUSPENDS until next month at ~day 17 | console / consumption API |
| Railway | $1/mo credit (Hobby: $5) | the credit — RAM is $10/GB-mo; always-on app+DB ≈ $15-25/mo | railway.com/workspace/usage |
| Fly.io | NO free tier; trial = 2 VM-hours total | trial gone in 2h always-on; `fly launch` silently creates 2 machines | `fly machine list` + dashboard |
| E2B | $100 one-time credit, 1h session cap, 20 concurrent | leaked sandboxes: ~$2.6-4/day each while running | `e2b sandbox list --state running` |
| Browserbase | 1 browser-hr/MONTH, 15-min max session, 3 concurrent | that single hour, in one afternoon of dev | API `/projects/{id}/usage` |
| GitHub | 2,000 private Actions min/mo (public unlimited), 120 Codespaces core-hr, 500 MB storage | Actions minutes in 2-3 weeks of auto-deploys — then workflows SILENTLY fail at the $0 default limit | `gh api /users/{u}/settings/billing/usage` |
| Supabase | 2 active projects, 500 MB DB, 5 GB egress, 50k MAU | 7-day idle AUTO-PAUSE kills deploy-and-forget apps; Pro: each extra project/branch bills ~$10/mo uncapped by Spend Cap | dashboard org usage |
| AWS/GCP/Azure | Lambda/Az Functions 1M req + 400K GB-s/mo; Cloud Run 2M req but 1 GB egress; AWS $200 credit / 6-mo auto-close | NAT gateway (~$33/mo idle), forgotten instances, egress | `aws ce get-cost-and-usage` / `az consumption usage list` |
