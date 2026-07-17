# Research archive (round 2): netlify-do

Raw dual-engine research (2026-07-17). Engine A = Claude web search; Engine B = grok CLI. Merged factsheet cross-checks both.

## Merged factsheet

```json
{
  "provider": "Netlify (credit-based plans, post-2025-09-04) + DigitalOcean App Platform — verified 2026-07 against official pricing/docs pages",
  "billing_dimensions": [
    "NETLIFY (single credit pool, all meters drain it): production deploys 15 credits each (preview/branch deploys, failed deploys, rollbacks = free)",
    "Netlify bandwidth (web + DB egress): 20 credits/GB",
    "Netlify web requests: 2 credits per 10,000 (pages, assets, redirects, serverless + edge function calls)",
    "Netlify compute: 10 credits/GB-hour (serverless/scheduled/background functions, preview servers, Agent Runners, Netlify DB) — NOT per-invocation; standalone function-invocation meter exists only on legacy plans (125k/site/mo)",
    "Netlify AI inference (Agent Runners + AI Gateway): 180 credits per $1 of model cost — fastest drain",
    "Netlify forms: free on credit plans",
    "Effective credit value ~$0.00667 (Pro pack $10/1,500): deploy ~$0.10, bandwidth ~$0.13/GB, compute ~$0.07/GB-hr",
    "Netlify LEGACY (pre-2025-09-04 accounts): bandwidth 100GB then $55/100GB, build minutes 300 then $7/500, functions 125k/site, edge functions 1M, forms 100/site",
    "DIGITALOCEAN: container instances per-second (1-min minimum) at fixed monthly-equivalent rates $5–$392/mo",
    "DO outbound transfer: per-instance allowance (50–900 GiB) pooled cumulatively across all apps at TEAM level; overage $0.02/GiB; inbound free; App Platform and Droplet bandwidth pools are separate",
    "DO extra static-site app beyond 3 free: $3.00/mo",
    "DO dev database: $7.00/mo per 512 MiB",
    "DO dedicated egress IP: billed per second up to $25.00/mo per app (60-sec minimum)",
    "DO builds/image storage: not billed on current plans (legacy pre-2024-05-07 plans had build-minute allowances)",
    "DO component renaming restarts the 28-day billing count → extra end-of-month charges (confirmed in official docs)"
  ],
  "free_tier": "NETLIFY Free: $0, no card required, 300 credits/mo HARD LIMIT, no rollover, no overage possible. ~ceilings if one meter only: 20 prod deploys OR 15 GB bandwidth OR 1.5M requests OR 30 GB-hr compute OR ~$1.67 of AI inference. At 0 credits ALL team projects pause ('Site not available') until next cycle/upgrade. 1 concurrent build, up to 500 projects sharing the pool. Legacy Free (pre-2025-09-04): 100 GB bandwidth + 300 build min + 125k function invocations + 1M edge invocations, hard-suspends. DIGITALOCEAN: 3 free apps with ONLY static-site components; 1 GiB outbound/app/mo, then $0.02/GiB BILLED to the card on file (not a hard free tier); no free tier for services/workers/jobs/containers ($5/mo floor) or databases or droplets.",
  "plans": [
    {
      "name": "Netlify Free (credit)",
      "price": "$0/mo",
      "included": "300 credits/mo, 1 concurrent build, no card required",
      "overage": "None possible — hard pause of all projects at 0 credits"
    },
    {
      "name": "Netlify Personal",
      "price": "$9/mo",
      "included": "1,000 credits/mo, no rollover",
      "overage": "No per-unit overage; opt-in auto-recharge pack: 500 credits/$5, no spend ceiling once enabled; otherwise sites pause"
    },
    {
      "name": "Netlify Pro",
      "price": "$20/mo",
      "included": "3,000 credits/mo, unlimited team seats (free since 2026-04-14). NOTE: pricing page shows only the $20/3,000 tier — higher Pro credit tiers (5k/$33 etc.) NOT confirmed",
      "overage": "Opt-in auto-recharge: 1,500 credits/$10, no ceiling; otherwise sites pause"
    },
    {
      "name": "Netlify Enterprise",
      "price": "Custom",
      "included": "Unlimited credits, SLA",
      "overage": "Contract"
    },
    {
      "name": "Netlify Legacy Pro (pre-2025-09-04)",
      "price": "$19/member/mo (official docs; not $20)",
      "included": "1 TB bandwidth, 25k build min",
      "overage": "$55/100GB bandwidth, $7/500 build min — the classic $104k vector"
    },
    {
      "name": "DO free static",
      "price": "$0",
      "included": "3 static-only apps, 1 GiB outbound each",
      "overage": "$0.02/GiB bandwidth; 4th static app $3/mo"
    },
    {
      "name": "DO shared CPU containers",
      "price": "$5 / $10 / $12 / $25 / $50 per mo",
      "included": "1vCPU-512MiB/50GiB, 1vCPU-1GiB/100GiB (fixed), 1vCPU-1GiB/150GiB (scalable), 1vCPU-2GiB/200GiB, 2vCPU-4GiB/250GiB; per-second billing",
      "overage": "$0.02/GiB transfer; each component/replica bills separately"
    },
    {
      "name": "DO dedicated CPU containers",
      "price": "$29–$392/mo per instance",
      "included": "up to 8 vCPU / 32 GiB, 100–900 GiB transfer, autoscaling",
      "overage": "$0.02/GiB; autoscaled replicas each bill full rate"
    },
    {
      "name": "DO add-ons",
      "price": "dev DB $7/mo per 512 MiB; dedicated egress IP up to $25/mo per app; extra static app $3/mo",
      "included": "n/a",
      "overage": "survive app teardown if not explicitly deleted"
    }
  ],
  "first_quota_blown": "NETLIFY Free: the shared 300-credit pool — for agent/CI workflows it's PRODUCTION DEPLOYS (15 credits each → ~20 pushes to main = month gone with zero traffic served); for traffic it's bandwidth (20 credits/GB → 15 GB total). Result: sites pause, no bill. DIGITALOCEAN: on free static, the 1 GiB/app outbound allowance (a few thousand pageviews of a fat SPA) → silently converts to $0.02/GiB on the card; and the moment an agent scaffolds any dynamic component the $5/mo always-on container floor starts billing immediately.",
  "spend_cap": "NETLIFY: Free = hard cap, on by default, cannot be exceeded (pause at 300 credits — post-$104k reform). Personal/Pro = fail-closed by default (sites pause at 0 credits) because auto-recharge is OFF by default; once a Team Owner enables auto-recharge there is NO dollar ceiling — packs re-bill indefinitely. No global 'never charge more than $X' switch on paid plans. Usage alert emails + in-app at 50%/75%/100% (official docs; the 90% threshold in one report is not on the page). DIGITALOCEAN: NO hard spend cap exists anywhere on the platform. Billing alerts are DISABLED by default (opt-in email, default threshold $20 when enabled) and do not stop resources; the payment 'threshold' is explicitly 'not a spending cap and does not limit how much you can use'. All overages bill the mandatory card/PayPal on file.",
  "traps": [
    "Netlify agent deploy loops: every push to the production branch = 15 credits; auto-deploy-on-commit 'fix & push' agents can empty Free in a day and 200 deploys/mo = an entire Pro allotment (~$20). Use preview/branch deploys (free) while iterating",
    "Netlify auto-recharge = uncapped: off by default, but once enabled it re-bills $5/$10 packs every time balance hits zero with no documented maximum — runaway function or bot traffic becomes open-ended spend",
    "Netlify AI Gateway/Agent Runners: 180 credits per $1 of inference — leaked key or chatty agent drains credits faster than any other meter (~$1.67 of model spend kills a whole Free month)",
    "Netlify compute is GB-hours not invocations on credit plans: always-on polling, long timeouts, scheduled/background functions burn 10 credits/GB-hr continuously",
    "Bot/scraper traffic double-bills Netlify: web-requests AND bandwidth meters simultaneously",
    "Legacy→credit plan switch is one-way; legacy Starter/Pro with card still has $55/100GB bandwidth overage (the Feb-2024 $104k mechanism, since fixed for Free by hard pause)",
    "DO: agent deploys a 'service' component where 'static_site' would be free → $5–$50/mo always-on immediately; each service/worker/job in the app spec is a separately billed instance",
    "DO autoscaling (dedicated CPU): traffic spike or bot loop scales replicas, each billing per-second up to $392/mo-equivalent",
    "DO orphans: dev DB ($7/mo) and dedicated egress IP (up to $25/mo) survive component removal; droplets created 'for debugging' bill at full rate even powered OFF until DESTROYED, plus snapshots/volumes/reserved IPs after deletion",
    "DO component rename restarts the 28-day billing count → surprise end-of-month charge (official docs)",
    "DO visibility gap: no built-in per-app outbound-transfer usage meter in the control panel (Insights shows ingress) — you can't see the bandwidth cliff coming; leaked DO API token = attacker spend with no cap to stop it"
  ],
  "usage_check": "NETLIFY: dashboard only — app.netlify.com > team > Usage & billing: 'Credit balance' (ledger + expiry), 'Credit usage breakdown' (by feature), 'Account usage insights' (daily per-meter chart: AI, bandwidth, compute, deploys, requests). No first-class CLI usage/credits command; `netlify status` for context, `netlify api` for raw API (no documented credits endpoint). Requires Owner/Billing Admin/Developer role. DIGITALOCEAN: `doctl balance get` (MonthToDateBalance/MonthToDateUsage), `doctl invoice list`, `doctl billing-history list`, `doctl apps list`, `doctl compute droplet list` (orphan sweep); API GET /v2/customers/my/balance; dashboard cloud.digitalocean.com/account/billing. Note: no per-app transfer-pool usage view.",
  "keywords": [
    "netlify",
    "ntl",
    "netlify deploy",
    "netlify dev",
    "netlify status",
    "netlify sites:list",
    "netlify sites:delete",
    "netlify functions:list",
    "netlify functions:invoke",
    "netlify env:list",
    "netlify api",
    "netlify open:admin",
    "netlify agents:list",
    "netlify agents:stop",
    "netlify.toml",
    "NETLIFY_AUTH_TOKEN",
    "NETLIFY_SITE_ID",
    "doctl",
    "doctl apps create",
    "doctl apps list",
    "doctl apps spec",
    "doctl compute droplet",
    "doctl compute snapshot list",
    "doctl balance get",
    "doctl billing-history list",
    "doctl invoice",
    "doctl databases",
    "doctl registry",
    ".do/app.yaml",
    "app.yaml",
    "DIGITALOCEAN_ACCESS_TOKEN",
    "DIGITALOCEAN_TOKEN",
    "DO_API_TOKEN"
  ],
  "hint": "Netlify Free=300 credits HARD-PAUSES (prod deploy 15cr → ~20/mo; BW 20cr/GB → 15GB); iterate on FREE preview deploys, never main. DO has NO spend cap: any non-static component = $5+/mo instantly, free static = 1GiB then $0.02/GiB on card; destroy orphan DBs/droplets. Check: doctl balance get.",
  "conflicts": [
    "Usage alert thresholds: Report A said 50/75/100%, Report B said 50/75/90/100% — RESOLVED for A: official docs state exactly 'usage update email and in-app notification when you are at 50%, 75%, and 100%'",
    "Netlify Pro credit tiers: Report B claimed a 2026-07-14 expansion to 5k/$33, 10k/$63, 15k/$95, 20k/$126 — REJECTED: the live official pricing page lists only Pro $20/mo with 3,000 credits and no tiered options; B's tier numbers do not appear",
    "Legacy Pro seat price: Report A said $20/seat, Report B said $19/member — RESOLVED for B: official legacy-pricing docs say $19/month per member",
    "Report B's claim that Netlify credit-plan rollover exists at >=5k plans (implied by A) is moot since no >=5k plan is on the pricing page",
    "DO dedicated egress IP: A/B implied flat $25/mo — official docs clarify 'billed per second, up to $25.00 per month' (60-sec minimum)",
    "Report B's Droplet claims (per-second billing since 2026-01-01, $4/mo floor, $0.01/GiB overage) were NOT verified against an official page in this pass — treat as plausible but unconfirmed; droplet details are secondary to App Platform",
    "Report B's 'AI Credit Usage Limit' control (Agent Runners) appears only in B and was not re-verified; treat as optional/unconfirmed",
    "Non-conflicts confirmed by fetch: DO 3 free static apps / 1 GiB each / $0.02/GiB / $3 extra app / $5-$50 shared / $29-$392 dedicated / $7 dev DB / team-level pooled transfer / 28-day rename quirk; DO alerts disabled by default with $20 default threshold and explicitly 'not a spending cap'"
  ],
  "sources": [
    "https://www.netlify.com/pricing/ (fetched 2026-07-17: Free 300cr, Personal $9/1000, Pro $20/3000 unlimited members, packs 500/$5 and 1500/$10, no Pro tiers)",
    "https://docs.netlify.com/manage/accounts-and-billing/billing/billing-for-credit-based-plans/monitor-usage-for-credit-based-plans/ (fetched: 50/75/100% alerts, dashboard locations)",
    "https://docs.netlify.com/manage/accounts-and-billing/billing/billing-for-legacy-plans/legacy-pricing-plans/ (fetched: $19/member legacy Pro, 100GB/300min free hard limits, $55/100GB and $7/500min overages)",
    "https://docs.netlify.com/manage/accounts-and-billing/billing/billing-for-credit-based-plans/how-credits-work/ (credit meter rates)",
    "https://docs.netlify.com/manage/accounts-and-billing/billing/billing-for-credit-based-plans/billing-faq-for-credit-based-plans/ (no hard spending limit on paid)",
    "https://www.netlify.com/changelog/netlify-pricing-update-introducing-credit-based-plans/ (2025-09-04 switch)",
    "https://www.netlify.com/blog/introducing-netlify-free-plan/ (post-$104k free plan policy)",
    "https://news.ycombinator.com/item?id=39521986 ($104k incident, CEO statement)",
    "https://docs.digitalocean.com/products/app-platform/details/pricing/ (fetched 2026-07-17: 3 free static/1GiB, $0.02/GiB, $3 extra app, $5-$50 shared, $29-$392 dedicated, $7 DB, egress IP per-second up to $25, team-pooled transfer, 28-day rename)",
    "https://docs.digitalocean.com/platform/billing/billing-alerts/ (fetched: alerts disabled by default, $20 default, 'not a spending cap')",
    "https://www.digitalocean.com/pricing/app-platform",
    "https://docs.digitalocean.com/platform/billing/bandwidth/ (separate App Platform vs Droplet pools)",
    "https://docs.digitalocean.com/products/droplets/details/pricing/ (droplet leftovers — not re-fetched)",
    "https://docs.digitalocean.com/reference/doctl/reference/balance/get/"
  ]
}
```

## Engine A — Claude (raw)

NETLIFY + DIGITALOCEAN APP PLATFORM — PRICING/QUOTA FACTSHEET (verified July 2026)

==================================================================
PART A: NETLIFY
==================================================================

MAJOR CHANGE NOTICE: On 2025-09-04 Netlify replaced its metric-based plans (100GB bandwidth / 300 build minutes / 125k function invocations) with CREDIT-BASED plans for all new accounts. Accounts created before that date remain on "Legacy" plans. Rates were changed again on 2026-04-14. The famous "100GB bandwidth, 300 build minutes" free tier now only applies to legacy accounts.
Sources: https://www.netlify.com/changelog/netlify-pricing-update-introducing-credit-based-plans/ , https://www.netlify.com/changelog/2026-04-14-pricing-updates-april-2026/

1. METERED BILLING DIMENSIONS (credit plans — everything drains one credit balance)
- Production deploys: 15 credits per successful deploy (failed deploys/rollbacks free)
- Compute: 10 credits per GB-hour (functions, scheduled/background functions, preview servers, Agent Runners, Netlify DB)
- Bandwidth: 20 credits per GB (web + database bandwidth)
- Web requests: 2 credits per 10,000 requests (page views, API calls, assets, redirects, edge functions)
- AI inference: 180 credits per $1 of model-provider cost (Agent Runners + AI Gateway)
- Forms: FREE (changed from 1 credit/submission on 2026-04-14)
- Deploy previews / branch deploys: FREE
Effective credit value: ~$0.00667/credit → deploy ≈ $0.10, bandwidth ≈ $0.13/GB, compute ≈ $0.07/GB-hr, requests ≈ $0.01/10k.
Note: "function invocations" is no longer a standalone meter on credit plans — invocations bill via the web-requests and compute meters. (Legacy free plan retains 125,000 function invocations/month.)
Sources: https://docs.netlify.com/manage/accounts-and-billing/billing/billing-for-credit-based-plans/how-credits-work/ , https://www.netlify.com/pricing/

2. FREE TIER (credit plans)
- 300 credits/month, HARD LIMIT. No rollover. No credit card required to hit the wall.
- 300 credits ≈ 15 GB bandwidth OR 1.5M web requests OR 30 GB-hr compute OR 20 production deploys — mixed in practice.
- When credits hit 0: ALL projects pause (visitors see "Site not available") until the next monthly cycle. No overage billing possible on Free.
- Legacy free plan (pre-2025-09-04 accounts): 100 GB bandwidth, 300 build minutes, 125k function invocations, 1M edge function invocations, 10 GB storage; site suspended for the rest of the month if exceeded.
Sources: https://docs.netlify.com/manage/accounts-and-billing/billing/billing-for-credit-based-plans/how-credits-work/ , https://www.netlify.com/blog/introducing-netlify-free-plan/

3. PAID PLANS
- Personal: $9/mo, 1,000 credits. Auto-recharge available: 500 credits for $5. No rollover of monthly credits.
- Pro: $20/mo, 3,000 credits, unlimited team seats (seats became free 2026-04-14; previously $20/seat). Auto-recharge: 1,500 credits for $10. Rollover only if plan ≥5,000 monthly credits.
- Enterprise: custom, unlimited credits, 99.99% SLA.
- Overage mechanism: there are no per-unit overages; you either buy credit packs / enable auto-recharge, or sites pause when credits run out (paused even on paid plans if auto-recharge is off).
Sources: https://www.netlify.com/pricing/ , https://docs.netlify.com/manage/accounts-and-billing/billing/billing-for-credit-based-plans/how-credits-work/ , https://www.netlify.com/changelog/2026-04-14-pricing-updates-april-2026/

4. FIRST QUOTA AN INDIE DEV BLOWS
Bandwidth, via the 300-credit pool. At 20 credits/GB, just 15 GB of transfer exhausts the entire free month — one modest traffic spike, one 5MB hero image with 3,000 views, or a few large downloads. Second killer: production deploys at 15 credits each — an AI agent or CI pipeline that pushes to main 20 times burns the whole month's credits on deploys alone. Result on Free: site pauses (no bill).
Source: https://docs.netlify.com/manage/accounts-and-billing/billing/billing-for-credit-based-plans/how-credits-work/

5. COST TRAPS FOR AI-AGENT-BUILT APPS
- Deploy loops: agents that "fix and redeploy" repeatedly — 15 credits per production deploy; 200 auto-deploys/mo = 3,000 credits = an entire Pro allotment (~$20).
- Auto-recharge with no ceiling: once a Team Owner enables it, it re-bills the card every time balance hits zero with NO documented maximum — an infinite-loop function or bot traffic becomes an open-ended charge.
- AI Gateway/Agent Runners: 180 credits per $1 of inference — a leaked key or runaway agent drains credits fastest of any meter.
- Scheduled/background functions left running: bill compute (10 credits/GB-hr) continuously.
- Bot/scraper traffic bills both web requests AND bandwidth meters simultaneously.
- Historical context ($104k story, Feb 2024): a free-tier static site got a $104,500 bill from 190TB of traffic (old overage: $55/100GB). CEO Matt Biilmann forgave it and pledged to "never let free sites incur overages" — that is now codified: free sites hard-pause instead of billing.
Sources: https://news.ycombinator.com/item?id=39521986 , https://www.netlify.com/blog/introducing-netlify-free-plan/ , https://docs.netlify.com/manage/accounts-and-billing/billing/billing-for-credit-based-plans/how-credits-work/

6. SPEND CAPS
- Free: HARD CAP, on by default, cannot be exceeded — sites pause at 300 credits. This is the direct aftermath of the $104k incident.
- Personal/Pro: hard cap by default too (sites pause at 0 credits) UNLESS auto-recharge is enabled — auto-recharge is OFF by default, Team-Owner-only, and has no spend ceiling once on.
- Usage alerts: automatic email + in-app notifications at 50% / 75% / 100% of credit allotment.
Sources: https://docs.netlify.com/manage/accounts-and-billing/billing/billing-for-credit-based-plans/how-credits-work/ , https://docs.netlify.com/manage/accounts-and-billing/billing/billing-for-credit-based-plans/monitor-usage-for-credit-based-plans/

7. HOW TO CHECK USAGE/SPEND
- Dashboard: https://app.netlify.com/teams/{team_name}/billing/general (credit balance + usage breakdown) and https://app.netlify.com/teams/{team_name}/billing/usage (daily per-meter charts).
- CLI: no official usage command; `netlify status` shows account/site context; `netlify api getAccount --data '{"account_id":"..."}'` reaches the API (no documented credits endpoint).
- Requires Team Owner / Billing Admin / Developer role.
Source: https://docs.netlify.com/manage/accounts-and-billing/billing/billing-for-credit-based-plans/monitor-usage-for-credit-based-plans/

8. DETECTION KEYWORDS (shell)
`netlify`, `ntl`, `netlify deploy`, `netlify dev`, `netlify functions:invoke`, `netlify api`, `netlify status`, `netlify sites:list`, `netlify env:list`, `netlify.toml`, env vars `NETLIFY_AUTH_TOKEN`, `NETLIFY_SITE_ID`

==================================================================
PART B: DIGITALOCEAN APP PLATFORM
==================================================================

1. METERED BILLING DIMENSIONS
- Container instances: billed per second (1-minute minimum) at fixed monthly-equivalent rates
- Outbound data transfer: per-instance/app monthly allowance, overage $0.02/GiB
- Static-site apps beyond the 3 free: $3.00/app/mo
- Databases: dev DB $7.00/mo per 512 MiB, billed hourly (1-hour minimum)
- Dedicated egress IP: per second up to $25.00/mo per app
- Build minutes: NOT currently billed — DO does not charge for builds or image storage on current plans (legacy pre-2024-05-07 Starter/Basic plans had build-minute allowances; legacy plans are being deprecated)
Sources: https://docs.digitalocean.com/products/app-platform/details/pricing/ , https://www.digitalocean.com/pricing/app-platform , https://www.digitalocean.com/community/questions/where-can-i-find-bandwidth-and-build-minute-usage-of-app-platform

2. FREE TIER
- 3 free apps containing ONLY static-site components. $0/mo forever.
- 1 GiB outbound transfer per free app per month; beyond that, $0.02/GiB overage IS billed (requires payment method on account — DO accounts require a card/PayPal at signup).
- No free tier for containers/services/workers/functions-in-apps; no free database.
Source: https://docs.digitalocean.com/products/app-platform/details/pricing/

3. PAID PLANS (per-component instance pricing, no plan subscription)
Shared CPU containers:
- 1 vCPU / 512 MiB, 50 GiB transfer, no scaling: $5.00/mo (apps-s-1vcpu-0.5gb)
- 1 vCPU / 1 GiB, 100 GiB transfer, fixed: $10.00/mo
- 1 vCPU / 1 GiB, 150 GiB transfer, scalable: $12.00/mo
- 1 vCPU / 2 GiB, 200 GiB transfer: $25.00/mo
- 2 vCPU / 4 GiB, 250 GiB transfer: $50.00/mo
Dedicated CPU: $29.00–$392.00/mo (1–8 vCPU, up to 32 GiB RAM), 100–900 GiB transfer, autoscaling supported.
Overages: bandwidth $0.02/GiB; extra static-site app $3.00/mo; dev database $7.00/mo; dedicated egress IP $25.00/mo.
Source: https://docs.digitalocean.com/products/app-platform/details/pricing/

4. FIRST QUOTA AN INDIE DEV BLOWS
Outbound data transfer on the free static tier: 1 GiB/app/month is tiny — ~10,000 page views of a 100KB page, or a handful of downloads of a 100MB asset. It converts silently to $0.02/GiB overage on your card. On the $5 container it's 50 GiB, still easily blown by media serving. (Overage cost is gentle though: even 1 TiB over ≈ $20.)
Source: https://docs.digitalocean.com/products/app-platform/details/pricing/

5. COST TRAPS FOR AI-AGENT-BUILT APPS
- No free container tier: an agent that deploys a "service" component instead of "static_site" in the app spec starts billing $5–$50/mo immediately.
- Component duplication: each service/worker/job in an app spec is a separately billed instance; agents that add workers, cron jobs, or autoscaling (dedicated-CPU) multiply cost silently.
- Autoscaling on dedicated instances: traffic spike or a bot loop scales replicas up — each replica bills per second at up to $392/mo-equivalent.
- Orphaned dev databases ($7/mo) and dedicated egress IPs ($25/mo) survive component removal if not explicitly deleted.
- Droplet leftovers: App Platform doesn't create user-visible droplets, but agents that also provision droplets via doctl/Terraform leave them billing — DO charges powered-OFF droplets at full rate until DESTROYED, and snapshots/volumes/reserved IPs bill separately after droplet deletion (https://docs.digitalocean.com/products/droplets/details/pricing/).
- Renaming a component restarts its billing-lifecycle count (components bill for first 28 days after creation per the pricing doc's proration rules).
- Leaked DO API token = attacker can spin up droplets/apps billed to your card; no hard cap will stop it.
Sources: https://docs.digitalocean.com/products/app-platform/details/pricing/ , https://docs.digitalocean.com/products/droplets/details/pricing/

6. SPEND CAPS
NO hard spend cap exists anywhere on DigitalOcean. Alerts only: "You can set up billing alerts and we will email you if the monthly spending exceeds an amount you specify" — off until you configure one, and it does not stop resources. All overages (bandwidth, instances) bill to the card on file.
Source: https://www.digitalocean.com/pricing/app-platform (billing alerts note); alert setup: https://docs.digitalocean.com/platform/billing/

7. HOW TO CHECK USAGE/SPEND
- CLI: `doctl balance get` (MonthToDateBalance, AccountBalance, MonthToDateUsage), `doctl invoice list`, `doctl invoice summary <uuid>`, `doctl apps list`
- API: GET https://api.digitalocean.com/v2/customers/my/balance and /v2/customers/my/invoices
- Dashboard: https://cloud.digitalocean.com/account/billing ; per-app Insights tab shows bandwidth. Note: DO staff confirmed there is no built-in per-app build-minute/outbound-transfer usage meter beyond the billing page.
Sources: https://docs.digitalocean.com/reference/doctl/reference/balance/get/ , https://www.digitalocean.com/community/questions/where-can-i-find-bandwidth-and-build-minute-usage-of-app-platform

8. DETECTION KEYWORDS (shell)
`doctl`, `doctl apps`, `doctl apps create`, `doctl apps spec`, `doctl compute droplet`, `doctl balance get`, `doctl invoice`, `doctl databases`, `doctl registry`, `.do/app.yaml`, `app.yaml` (DO app spec), env vars `DIGITALOCEAN_ACCESS_TOKEN`, `DIGITALOCEAN_TOKEN`, `DO_API_TOKEN`

==================================================================
KEY CONTRAST
==================================================================
Netlify (post-$104k reform): free tier CANNOT bill you — hard pause at 300 credits; paid tiers only bill beyond subscription if auto-recharge is explicitly enabled (off by default), but then with no ceiling. DigitalOcean: no free-tier hard stop — 1 GiB free transfer silently rolls into $0.02/GiB card charges, and no hard cap exists platform-wide, only opt-in email alerts.

Sources index:
- https://www.netlify.com/pricing/
- https://docs.netlify.com/manage/accounts-and-billing/billing/billing-for-credit-based-plans/how-credits-work/
- https://docs.netlify.com/manage/accounts-and-billing/billing/billing-for-credit-based-plans/monitor-usage-for-credit-based-plans/
- https://www.netlify.com/changelog/netlify-pricing-update-introducing-credit-based-plans/
- https://www.netlify.com/changelog/2026-04-14-pricing-updates-april-2026/
- https://www.netlify.com/blog/introducing-netlify-free-plan/
- https://news.ycombinator.com/item?id=39521986 (CEO statement on $104k bill)
- https://www.digitalocean.com/pricing/app-platform
- https://docs.digitalocean.com/products/app-platform/details/pricing/
- https://docs.digitalocean.com/products/droplets/details/pricing/
- https://docs.digitalocean.com/reference/doctl/reference/balance/get/
- https://www.digitalocean.com/community/questions/where-can-i-find-bandwidth-and-build-minute-usage-of-app-platform

## Engine B — grok (raw)

# Pricing / quota factsheet — Netlify + DigitalOcean App Platform  
**As of July 2026** (verified against official pricing/docs pages)

---

## Timeline that matters (Netlify)

| Date | Change |
|------|--------|
| **Feb 2024** | Viral ~$104k bandwidth bill on a free/static site (card-on-file overages). CEO: forgive bills; work on default so free sites don’t incur overages. |
| **12 Nov 2024** | Official **Free plan**: no credit card, hard monthly limits, site **suspends** (not bill) when exceeded — 100 GB bandwidth, 300 build minutes, 125k functions, 1M edge functions. |
| **4 Sep 2025** | **Credit-based plans for all new accounts**. Free = **300 credits hard limit**. Legacy Free/Starter/Pro remain for pre-Sep-2025 teams. |
| **14 Apr 2026** | Credit Pro: unlimited seats (no per-seat charge). |
| **14 Jul 2026** | Pro monthly credit tiers expanded (3k–20k credits). |

Sources: [Introducing Free plan](https://www.netlify.com/blog/introducing-netlify-free-plan/), [Credit-based plans changelog](https://www.netlify.com/changelog/netlify-pricing-update-introducing-credit-based-plans/), [How credits work](https://docs.netlify.com/manage/accounts-and-billing/billing/billing-for-credit-based-plans/how-credits-work/), [Legacy plans](https://docs.netlify.com/manage/accounts-and-billing/billing/billing-for-legacy-plans/legacy-pricing-plans/), [Pricing](https://www.netlify.com/pricing/).

---

# 1. Netlify

## 1.1 Metered dimensions

### Current (credit-based — new accounts since 2025-09-04)

Single currency: **credits** drawn from a monthly allotment.

| Meter | Rate | Notes |
|-------|------|--------|
| Production deploys | **15 credits each** | Preview/branch deploys = **0**. Failed deploys & rollbacks free. |
| Bandwidth (web + DB egress) | **20 credits / GB** | Assets, Image CDN, function responses, downloads. |
| Web requests | **2 credits / 10,000 requests** | Pages, assets, redirects, serverless calls, **edge functions**. |
| Compute | **10 credits / GB-hour** | Serverless, scheduled, background functions; Preview servers; Agent Runners env; Netlify Database compute. **Not** per-invocation. |
| AI inference | **180 credits / $1 USD** of model usage | Agent Runners + AI Gateway. |
| Forms | **Free** (credit plans) | |

Sources: [How credits work](https://docs.netlify.com/manage/accounts-and-billing/billing/billing-for-credit-based-plans/how-credits-work/), [Pricing page](https://www.netlify.com/pricing/).

### Legacy (accounts opened before 2025-09-04)

Separate meters still documented:

| Meter | Free/Starter legacy | Pro legacy |
|-------|---------------------|------------|
| Bandwidth | **100 GB/mo** (Free = hard; Starter = **$55 / 100 GB** over) | **1 TB/mo** then **$55 / 100 GB** |
| Build minutes | **300 min/mo** (Free hard; Starter **$7 / 500 min**) | **25,000 min** then **$7 / 500** |
| Serverless functions | **125k invocations / site / mo** | same |
| Edge functions | **1M invocations / mo** | **2M** then **$2 / million** |
| Forms | **100 submissions / site / mo** | 100 then paid overages |

Source: [Legacy pricing plans](https://docs.netlify.com/manage/accounts-and-billing/billing/billing-for-legacy-plans/legacy-pricing-plans/).

---

## 1.2 Free tier — exact quotas

### Credit Free (default for new accounts) — **$0, no card required**

| Item | Exact quota |
|------|-------------|
| Credits | **300 / month, hard limit** (no auto-recharge, no overage charges) |
| Concurrent builds | **1** |
| Projects | up to **500** (shared credit pool) |
| When exhausted | **All team projects paused** → `Site not available` until next cycle or upgrade |

**Implied pure-usage ceilings if you burn 300 on one meter only:**

| If only this meter | Max from 300 credits |
|--------------------|----------------------|
| Production deploys | **20** deploys (20 × 15) |
| Bandwidth | **15 GB** (300 ÷ 20) |
| Web requests | **1.5M** requests (300 ÷ 2 × 10k) |
| Compute | **30 GB-hours** (300 ÷ 10) |
| AI inference | **~$1.67** of model spend (300 ÷ 180) |

Real apps mix meters — deploys + bandwidth usually win.

Sources: [Credit-based plans](https://docs.netlify.com/manage/accounts-and-billing/billing/billing-for-credit-based-plans/credit-based-pricing-plans/), [Billing FAQ](https://docs.netlify.com/manage/accounts-and-billing/billing/billing-for-credit-based-plans/billing-faq-for-credit-based-plans/).

### Legacy Free (pre-2025-09-04)

| Item | Quota |
|------|--------|
| Bandwidth | **100 GB/mo hard** |
| Build minutes | **300 min/mo hard** |
| Functions | **125k invocations / site / mo** |
| Edge functions | **1M / mo** |
| Forms | **100 / site / mo** |

Policy intent after $104k story (also stated Nov 2024 Free plan): Free **hard-limits and suspends**, does not auto-bill. Starter/Pro with card still had **dollar overages**.

Sources: [Legacy plans](https://docs.netlify.com/manage/accounts-and-billing/billing/billing-for-legacy-plans/legacy-pricing-plans/), [Free plan blog Nov 2024](https://www.netlify.com/blog/introducing-netlify-free-plan/).

---

## 1.3 Paid plans (credit-based)

| Plan | Price | Included | Overage / extra |
|------|-------|----------|-----------------|
| **Personal** | **$9/mo** | **1,000 credits** | Auto-recharge **off by default**: **500 credits / $5** |
| **Pro** | **$20/mo** (base) → higher tiers | **3,000 credits** base; tiers **5k ($33), 10k ($63), 15k ($95), 20k ($126)**; unlimited seats | Auto-recharge **off by default**: **1,500 credits / $10**; concurrent builds beyond included: **$40/mo** each; extra Live Preview Server **$15/mo** |
| **Enterprise** | Custom | Unlimited credits | Contract |

Approx unit costs at Pro pack rate ($10 / 1,500 ≈ **$0.00667/credit**): ~**$0.10/deploy**, ~**$0.13/GB** bandwidth, ~**$0.07/GB-hour** compute.

Sources: [Pricing](https://www.netlify.com/pricing/), [Credit-based plans](https://docs.netlify.com/manage/accounts-and-billing/billing/billing-for-credit-based-plans/credit-based-pricing-plans/), [How credits work](https://docs.netlify.com/manage/accounts-and-billing/billing/billing-for-credit-based-plans/how-credits-work/).

**Legacy Starter/Pro** (if still on them): seat **$19/member/mo** on Pro; bandwidth **$55/100 GB**; see legacy table above.

---

## 1.4 What an indie app blows first

| Plan | First wall | At what usage |
|------|------------|---------------|
| **Credit Free** | **Shared 300-credit pool** — almost always **production deploys** for agent/CI loops | **~20 production deploys/month** empties the pool with zero traffic left. Mix: e.g. 10 deploys (150 cr) + ~7.5 GB bandwidth (150 cr) = done. |
| **Legacy Free** | **Build minutes (300)** or **bandwidth (100 GB)** | Heavy CI → minutes first; viral/static assets → 100 GB first. |
| **Personal/Pro + auto-recharge ON** | **Wallet** (fail-open) | Packs rebuy until you disable recharge. |
| **Legacy Starter/Pro + card** | **Bandwidth $55/100 GB** (classic $104k vector) | DDoS/hotlink/large assets. |

---

## 1.5 Cost traps (AI-agent-built apps)

1. **Agent push loops** — every production deploy = **15 credits** (main-branch / prod only). Preview deploys free.
2. **Auto git deploy on every commit** to production branch burns the Free pool in a day of “fix & push.”
3. **AI Gateway / Agent Runners** — **180 credits per $1** model spend; Free has no recharge → one chatty agent session can wipe the month.
4. **Always-on / polling serverless** — billed as **GB-hours**, not free invocations (credit model). Long timeouts + memory inflate GB-hours.
5. **Leaked Netlify tokens / env keys** in client bundles → abuse of functions/API (requests + compute + bandwidth).
6. **Enabling auto-recharge** “to keep the site up” → silent $5/$10 top-ups that can chain.
7. **Switching Legacy → Credit is irreversible** — function limits move from free invocation buckets to always-on credit burn.
8. **Historical trap (legacy + card):** bandwidth overage **$55/100 GB** with no hard spend stop (the $104k story).

---

## 1.6 Spend caps

| Control | Exists? | Default |
|---------|---------|---------|
| Free credit hard cap | **Yes** — projects pause at 300 credits | On for Free |
| Auto-recharge hard $ cap | **No** dollar hard-stop | **Off by default** on Personal/Pro |
| AI Credit Usage Limit | **Yes** (Agent Runners; Enterprise also Gateway) | Optional, not on by default as a global $ cap |
| Alerts | **Yes** — 50% / 75% / 90% / 100% email + in-app | On by default |

**There is no global “never charge more than $X” kill switch** on paid plans beyond: leave auto-recharge off, stay Free, set AI limit, or disable projects.

Source: [Billing FAQ — hard spending limit](https://docs.netlify.com/manage/accounts-and-billing/billing/billing-for-credit-based-plans/billing-faq-for-credit-based-plans/).

---

## 1.7 How to check usage / spend

| Method | Where |
|--------|--------|
| Dashboard | [Usage & billing](https://app.netlify.com/teams/~/billing/) — Credit balance, Credit usage breakdown, Account usage insights (day-by-day since Mar 2026) |
| Calculator | [netlify.com/pricing/#calculator](https://www.netlify.com/pricing/#calculator) |
| CLI | **No first-class `netlify usage` / credits command** — use UI. Related: `netlify status`, `netlify sites:list`, `netlify open:admin`, `netlify api` (raw API) |
| API | Via `netlify api` / REST (billing meters primarily in UI/docs) |

Docs: [Monitor credit usage](https://docs.netlify.com/manage/accounts-and-billing/billing/billing-for-credit-based-plans/monitor-usage-for-credit-based-plans/).

---

## 1.8 Shell keywords (CLI names only)

```
netlify
netlify status
netlify sites:list
netlify sites:delete
netlify deploy
netlify open
netlify open:admin
netlify teams:list
netlify agents:list
netlify agents:stop
netlify functions:list
netlify env:list
netlify api
netlify login
netlify switch
```

---

# 2. DigitalOcean App Platform (+ Droplet leftovers)

## 2.1 Metered dimensions

| Dimension | How billed |
|-----------|------------|
| **Container instances** | Per instance size × count, **per-second** (1-minute min); monthly price is a cap |
| **Static-site-only apps** | First **3 free**; each additional static-only app **$3.00/mo** |
| **Outbound bandwidth (App Platform)** | Allowance per container (or **1 GiB/app** free static); overage **$0.02 / GiB**. Pooled at **team** level across apps. Inbound free. |
| **Development database** | **$7.00/mo** per 512 MiB Postgres (tied to app) |
| **Dedicated egress IP** | **$25.00/mo per app** (pair of IPs) |
| **Jobs** | Same size pricing, billed **only while running** |
| **Rename trick** | Renaming a component restarts the 28-day bill window → possible extra end-of-month charge |

Sources: [App Platform pricing](https://www.digitalocean.com/pricing/app-platform), [App Platform pricing docs](https://docs.digitalocean.com/products/app-platform/details/pricing/) (last updated 2026-07-13), [Bandwidth billing](https://docs.digitalocean.com/platform/billing/bandwidth/).

**App Platform vs Droplet bandwidth pools are separate** and **must not be combined**.

---

## 2.2 Free tier — exact quotas

| Item | Exact number |
|------|----------------|
| Free static apps | **Up to 3 apps** that contain **only** static site components |
| Bandwidth per free app | **1 GiB outbound / month** |
| Extra static-only apps | **$3.00 / app / month** |
| Bandwidth overage | **$0.02 / GiB** (still bills — free tier is **not** a hard free on traffic) |
| Dynamic components (web service, worker, job, container) | **No free tier** — paid from **$5/mo** |
| Droplets | **No free tier** |

Sources: [App Platform pricing FAQ](https://www.digitalocean.com/pricing/app-platform), [docs pricing](https://docs.digitalocean.com/products/app-platform/details/pricing/).

---

## 2.3 Paid plans (per-container, current)

**Shared (fixed = no scale-out):**

| Slug (API) | Spec | Bandwidth | Price |
|------------|------|-----------|-------|
| `apps-s-1vcpu-0.5gb` | 1 shared / 512 MiB | **50 GiB** | **$5.00/mo** |
| `apps-s-1vcpu-1gb-fixed` | 1 shared / 1 GiB | **100 GiB** | **$10.00/mo** |
| `apps-s-1vcpu-1gb` | 1 shared / 1 GiB | **150 GiB** | **$12.00/mo** |
| `apps-s-1vcpu-2gb` | 1 shared / 2 GiB | **200 GiB** | **$25.00/mo** |
| `apps-s-2vcpu-4gb` | 2 shared / 4 GiB | **250 GiB** | **$50.00/mo** |

**Dedicated (manual + auto scale):** **$29–$392/mo** depending on size (0.5–32 GiB RAM), bandwidth **100–900 GiB** per instance.

| Add-on | Price |
|--------|-------|
| Extra outbound transfer | **$0.02 / GiB** |
| Dev DB 512 MiB | **$7.00/mo** |
| Dedicated egress IP | **$25.00/mo per app** |

**Legacy App Platform sizes** (apps created **before 7 May 2024**) still exist with lower egress (e.g. basic 40 GiB); DO encourages migration.

Source: [App Platform pricing docs](https://docs.digitalocean.com/products/app-platform/details/pricing/).

---

## 2.4 Droplet leftovers (common App Platform companion)

| Item | Fact |
|------|------|
| Free tier | **None** |
| Cheapest Basic | **$4.00/mo** — 512 MiB, 1 vCPU, **500 GiB** transfer, 10 GiB disk |
| Next | **$6.00/mo** — 1 GiB RAM, **1,000 GiB** transfer |
| Billing | **Per-second** since **1 Jan 2026** (min 60s or $0.01) |
| Bandwidth overage | **$0.01 / GiB** (half of App Platform’s $0.02) |
| Pooling | Team-level Droplet transfer pool; **no rollover** |
| Snapshots | **$0.06 / GB / month** while retained |
| Backups | **20% weekly / 30% daily** of Droplet cost (or usage-based backup plans) |

Forgotten Droplets/snapshots are the classic “leftover” bill after an App Platform experiment.

Sources: [Droplet pricing](https://www.digitalocean.com/pricing/droplets), [Bandwidth billing](https://docs.digitalocean.com/platform/billing/bandwidth/).

---

## 2.5 What an indie app blows first

| Workload | First wall | At what usage |
|----------|------------|---------------|
| Free static only | **1 GiB outbound / app** | ~1–few thousand pageviews of a fat SPA/images; then **$0.02/GiB** forever |
| 4th static app | **App count** | **$3/mo** for the 4th static-only app |
| Any Node/Python/API | **Container floor** | First paid service = **$5/mo** (always-on) |
| Paid small API + traffic | **Bandwidth** after 50 GiB on $5 size | Overage **$0.02/GiB** (e.g. +50 GiB ≈ **$1**) |
| Agent defaults | **Forgotten instances / scale / dev DB / egress IP** | Idle $5–$12 container + optional **$7** DB + **$25** egress IP |
| Mixed DO account | **Orphan Droplets/snapshots** | **$4+/mo** each until destroyed |

**Note:** DO docs state you **cannot currently view** accrued App Platform transfer allowance/usage in the control panel (ingress insights only) — hard to see the bandwidth cliff coming.

---

## 2.6 Cost traps (AI-agent-built)

1. Scaffolding a **web service** when a static site would be free → **$5+/mo** forever.
2. **Autoscaling** (dedicated) or multi-instance workers left at 2+ copies.
3. Attaching **dev database** (+$7) then destroying the app incorrectly / leaving DB.
4. Enabling **dedicated egress IP** for “webhooks” (+$25/app).
5. Free static **1 GiB** is tiny; bots/scrapers/CDN-miss loops → uncapped **$0.02/GiB**.
6. **App Platform bandwidth $0.02** vs Droplet **$0.01** — wrong product for heavy egress.
7. **Card on file is normal** for DO; alerts off by default → surprise invoice.
8. Agent creates Droplet “for debugging” and never `destroy`s it + snapshots.
9. Component **rename** billing quirk adding days to the bill.

---

## 2.7 Spend caps

| Control | Exists? | Default |
|---------|---------|---------|
| Hard monthly spend cap that stops resources | **No** | N/A |
| Billing alerts (email when spend > $X) | **Yes** | **Disabled** (opt-in; UI default amount **$20**) |
| Monthly payment “threshold” re-charge | Exists for charging the card | **Not a spending cap** — docs: *“It is not a spending cap and does not limit how much you can use.”* |

Source: [Billing alerts](https://docs.digitalocean.com/platform/billing/billing-alerts/).

---

## 2.8 How to check usage / spend

| Method | Where |
|--------|--------|
| Dashboard | [Billing](https://cloud.digitalocean.com/account/billing) — balance, invoices, Droplet transfer overview, billing alerts settings |
| App insights | App → Insights (ingress bandwidth per app; not full AP transfer pool) |
| CLI | `doctl balance get`, `doctl billing-history list`, `doctl apps list`, `doctl compute droplet list` |
| API | DigitalOcean Billing / Apps APIs via `doctl` or REST |

---

## 2.9 Shell keywords (CLI names only)

```
doctl
doctl auth
doctl account get
doctl balance get
doctl billing-history list
doctl apps list
doctl apps get
doctl apps delete
doctl apps create
doctl apps update
doctl compute droplet list
doctl compute droplet delete
doctl compute snapshot list
doctl databases list
doctl invoice list
```

---

# 3. Side-by-side for indie / agent apps

| Question | Netlify (credit Free) | DO App Platform (static free) |
|----------|----------------------|-------------------------------|
| Truly $0 with no card? | **Yes** (new Free) | Account usually has payment method; **1 GiB overage can still bill** |
| Hard stop vs open bill | **Hard pause** at 300 credits | **Open-ended** $ overages (bandwidth, paid components) |
| First agent failure mode | **20 prod deploys** → sites offline | **$5 always-on service** or **1 GiB** scrape tax |
| Bandwidth free allotment | ~**15 GB** if only bandwidth (credit Free) | **1 GiB** per free static app |
| $104k-class risk | **Fixed for Free** (suspend); **paid + auto-recharge** still fail-open | No fixed $ cap; alerts **opt-in** |
| Best check | Dashboard Usage & billing | `doctl balance get` + Billing page + destroy leftovers |

---

# 4. Source index (primary)

**Netlify**  
- https://www.netlify.com/pricing/  
- https://docs.netlify.com/manage/accounts-and-billing/billing/billing-for-credit-based-plans/how-credits-work/  
- https://docs.netlify.com/manage/accounts-and-billing/billing/billing-for-credit-based-plans/credit-based-pricing-plans/  
- https://docs.netlify.com/manage/accounts-and-billing/billing/billing-for-credit-based-plans/billing-faq-for-credit-based-plans/  
- https://docs.netlify.com/manage/accounts-and-billing/billing/billing-for-legacy-plans/legacy-pricing-plans/  
- https://www.netlify.com/blog/introducing-netlify-free-plan/  
- https://www.netlify.com/changelog/netlify-pricing-update-introducing-credit-based-plans/  

**DigitalOcean**  
- https://www.digitalocean.com/pricing/app-platform  
- https://docs.digitalocean.com/products/app-platform/details/pricing/  
- https://docs.digitalocean.com/platform/billing/bandwidth/  
- https://docs.digitalocean.com/platform/billing/billing-alerts/  
- https://www.digitalocean.com/pricing/droplets  

**Numbers above are from those pages as of the July 2026 crawl of this research.** Legacy Netlify Free (100 GB / 300 build min) still applies only to pre–credit-era teams; new free means **300 credits**, not 100 GB.
