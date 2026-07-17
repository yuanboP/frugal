---
name: frugal
description: >
  Cloud cost awareness for agents. Metered services (Vercel, Cloudflare, Neon,
  Railway, Fly.io, E2B, Browserbase, GitHub Codespaces, AWS, GCP, Azure,
  Supabase, Terraform/Pulumi) silently bill by usage, and the user may not
  understand why the bill exploded. Use whenever the user asks about cloud
  costs, billing, usage, quotas, "check the bill", "why is my bill so high",
  reducing cloud spend, or before deploying/provisioning to any metered
  service. Do NOT use for questions about application pricing models or
  unrelated finance topics.
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
- **Before creating a paid resource** (deploy, database, sandbox, VM, storage
  bucket): tell the user in one line that it incurs cost. Prefer free tiers
  and local dev first — `wrangler dev`, `vercel dev`, a Neon branch instead of
  a new project, `supabase start`, a local `docker run postgres`.
- **Ephemeral things must die**: kill E2B/Browserbase sandboxes the moment
  you are done, delete resources you provisioned for a test in the same
  session, stop Codespaces you started. Never leave a metered thing running
  past its use.
- **Cost anti-patterns to avoid**: unbounded retry/poll loops against paid
  APIs, large egress transfers, provisioning a fresh instance per test
  instead of reusing one, oversized instance types by default,
  high-frequency crons doing low-value work.
- **Never silently make a spend decision for the user.** A one-line notice
  is enough for small costs; stop and ask only for recurring or large costs
  (new paid plan, production database, `terraform apply` on real infra).
- **Do not become a roadblock**: reminders are one line, not endless
  confirmations. Work first, spend consciously.

## Provider cheat-sheet

| Provider | Metered by | How to check | Cheap alternative |
|---|---|---|---|
| Vercel | function invocations, bandwidth, edge requests | vercel.com/&lt;team&gt;/~/usage | `vercel dev` locally; hobby tier |
| Cloudflare | Workers requests, KV/R2/D1 ops, egress | dash.cloudflare.com billing | `wrangler dev` (local) |
| Neon | compute hours, storage | Neon console usage | branch instead of new project; autosuspend |
| Railway | vCPU/RAM minutes, egress | `railway status` / dashboard | sleep-on-idle; local docker |
| Fly.io | machine hours, egress | `fly dashboard` | auto-stop machines |
| E2B | sandbox seconds | E2B dashboard | kill sandbox immediately after use |
| Browserbase | session minutes | Browserbase dashboard | close sessions; local Playwright |
| GitHub Codespaces | core-hours, storage | github.com/settings/billing | stop when idle; local dev |
| AWS / GCP / Azure | everything | Cost Explorer / billing console | free tier; delete test resources |
| Supabase | remote project usage | Supabase dashboard | `supabase start` (local, free) |
| Terraform / Pulumi | whatever it provisions | plan output before apply | `plan` first; confirm with user |
