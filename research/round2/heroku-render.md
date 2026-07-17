# Research archive (round 2): heroku-render

Raw dual-engine research (2026-07-17). Engine A = Claude web search; Engine B = grok CLI. Merged factsheet cross-checks both.

## Merged factsheet

```json
{
  "provider": "Heroku + Render (merged factsheet, verified 2026-07-17; Render workspace/free/bandwidth numbers re-confirmed live against render.com docs; Heroku Eco numbers re-confirmed live against devcenter.heroku.com)",
  "billing_dimensions": [
    "HEROKU dyno runtime: wall-clock seconds while scaled >0, prorated to the second — traffic/CPU irrelevant; each dyno type has a monthly price cap (e.g. Basic never exceeds $7/mo)",
    "HEROKU Eco: flat $5/mo subscription draining a shared 1,000 dyno-hour/mo pool across ALL Eco dynos in the account; sleeping web dynos consume no hours",
    "HEROKU add-on time: Postgres/Key-Value/Kafka/marketplace add-ons bill 24/7 from provision until destroyed, independent of dyno state",
    "HEROKU metered add-ons: Managed Inference AI tokens (per 1M), storage, bandwidth-style partner meters — base fee + uncapped consumption",
    "HEROKU one-off/Scheduler/review-app dynos: billed by runtime; Eco review apps + CI draw from the same 1,000-hr pool",
    "HEROKU has NO public-bandwidth/request metering (unlike Render)",
    "RENDER workspace plan: flat $/mo (Hobby $0, Pro $25, Scale $499) + usage",
    "RENDER compute: per-instance per-second while running (Free/Starter $7/Standard $25/Pro $85/Pro Plus $175/Pro Max $225/Pro Ultra $450)",
    "RENDER outbound bandwidth: included per plan (5 GB/25 GB/1 TB) then $0.15/GB; counts HTTP+WebSocket responses, service-initiated egress to public internet, DB query responses leaving Render (since Oct 2025); excludes inbound, same-region private traffic, log streams",
    "RENDER build pipeline minutes: 500/1,000/5,000 included, then $5 per 1,000",
    "RENDER persistent disks $0.25/GB/mo; Postgres storage $0.30/GB/mo (increase-only, 5 GB steps); custom domains $0.25/mo over included; Private Link $0.03/GB"
  ],
  "free_tier": "HEROKU: NONE — all free plans (dynos, Postgres, Redis) removed 2022-11-28; still none as of 2026-07. Cheapest floor: Eco $5/mo (1,000 pooled hrs, 512 MB, web sleeps after 30 min idle, personal accounts only) + Essential-0 Postgres $5/mo (1 GB) = ~$10/mo for app+DB. RENDER Hobby ($0/mo): free web services 512 MB/0.1 CPU, 750 free instance-hours/workspace/mo (spin down after 15 min idle, ~1 min cold start, suspended when hours exhausted); 5 GB outbound bandwidth/mo (cut from 100 GB in the April 2026 replan); 500 build minutes; 2 custom domains; 25 services max; 1 team member; free Postgres 1 GB/256 MB EXPIRES 30 days after creation (+14-day grace, then deleted, no backups); free Key Value 25 MB in-memory only (data lost on restart); static sites free but count against bandwidth+build minutes; no disks/SSH/scaling on Free.",
  "plans": [
    {
      "name": "Heroku Eco",
      "price": "$5/mo flat",
      "included": "1,000 shared dyno-hrs/mo, 0.5 GB RAM; web sleeps after 30 min no traffic; workers NEVER sleep; personal accounts only",
      "overage": "None purchasable — at 100% ALL Eco dynos in account forced asleep until month end (emails at 80% and 100%)"
    },
    {
      "name": "Heroku Basic",
      "price": "$7/mo max (~$0.01/hr)",
      "included": "0.5 GB, always-on, no horizontal scale",
      "overage": "N/A — prorated by second, capped at monthly max"
    },
    {
      "name": "Heroku Standard-1X / Standard-2X",
      "price": "$25 / $50 per mo max",
      "included": "0.5 GB / 1 GB, horizontal scaling, metrics, preboot",
      "overage": "N/A — monthly price cap per dyno"
    },
    {
      "name": "Heroku Performance M/L/L-RAM/XL/2XL",
      "price": "$250 / $500 / $500 / $750 / $1,500 per mo",
      "included": "2.5 / 14 / 30 / 62 / 126 GB, dedicated, autoscaling (bill follows scale-out)",
      "overage": "N/A per dyno, but autoscale adds dynos"
    },
    {
      "name": "Heroku Postgres Essential-0/1/2",
      "price": "$5 / $9 / $20 per mo",
      "included": "1 GB / 10 GB / 32 GB storage (20/20/40 connections)",
      "overage": "None — storage cap forces plan bump; Standard-0 is $50/mo (64 GB)"
    },
    {
      "name": "Heroku Key-Value Mini",
      "price": "$3/mo",
      "included": "25 MB; Premium tiers $15–$12,500/mo",
      "overage": "None — memory cap forces upgrade"
    },
    {
      "name": "Heroku Managed Inference",
      "price": "per 1M tokens (e.g. Claude 3 Haiku $0.25 in/$1.25 out; Claude 4.5 Sonnet $3.30/$16.50)",
      "included": "Nothing — pure metered",
      "overage": "Uncapped token billing"
    },
    {
      "name": "Render Hobby workspace",
      "price": "$0/mo + compute",
      "included": "5 GB bandwidth, 500 build min, 2 domains, 25 services, 1 member, 750 free instance-hrs",
      "overage": "$0.15/GB bandwidth, $5/1k build min, $0.25/domain — bills only if card on file, otherwise services suspend"
    },
    {
      "name": "Render Pro workspace",
      "price": "$25/mo flat",
      "included": "25 GB bandwidth, 1,000 build min, 15 domains, unlimited members/services, autoscaling",
      "overage": "$0.15/GB; $5/1k build min; $0.25/domain"
    },
    {
      "name": "Render Scale workspace",
      "price": "$499/mo flat",
      "included": "1 TB bandwidth, 5,000 build min, 25 domains, SSO/SCIM, HIPAA (+20% compute premium)",
      "overage": "$0.15/GB; $5/1k build min; $0.25/domain"
    },
    {
      "name": "Render compute instances",
      "price": "Starter $7 / Standard $25 / Pro $85 / Pro Plus $175 / Pro Max $225 / Pro Ultra $450 per mo",
      "included": "512MB-0.5CPU / 2GB-1CPU / 4GB-2CPU / 8GB-4 / 16GB-4 / 32GB-8; per-second proration; paid instances never sleep; workers/private services start at Starter (no free)",
      "overage": "N/A — fixed monthly ceiling per instance; max 100 instances/service"
    },
    {
      "name": "Render Postgres (flexible)",
      "price": "basic-256mb $6/mo, basic-1gb $19/mo, pro-4gb $55/mo + storage $0.30/GB/mo",
      "included": "Compute tier by RAM; storage separate, increase-only in 5 GB steps; HA doubles instance cost",
      "overage": "Storage grows billed per GB"
    },
    {
      "name": "Render Key Value",
      "price": "Starter $10/mo (256 MB), Standard $32/mo (1 GB)",
      "included": "Persistence on by default on paid; Free 25 MB is in-memory only",
      "overage": "None — tier upgrade"
    }
  ],
  "first_quota_blown": "RENDER (post-Apr-2026 Hobby): the 5 GB/mo outbound bandwidth cap — ~170 MB/day of responses/assets blows it; AI crawlers/bots (>50% of web traffic) can do it in days. With card: silent $0.15/GB fail-open. Without card: workspace services spin down until next month. Runners-up: free Postgres hard-expires day 30 (+14-day grace then DELETED); 750 free instance-hrs covers only ~1 always-awake free service (2 pinged services die ~day 15). HEROKU: the wallet first (no free tier); then the Eco 1,000-hr pool — one always-on web (~744 hrs in July) is fine, but web+worker or 2 workers exhausts it ~day 15–21 and ALL Eco dynos in the account sleep until the 1st; then Essential-0's 1 GB Postgres cap; and zombie add-ons (~$8/mo forever) after dynos are scaled to 0.",
  "spend_cap": "HEROKU: NO hard spend cap anywhere and no configurable billing alerts — only automatic Eco emails at 80%/100% with a hard stop (forced sleep) at 100% of the hour pool; per-dyno monthly price maxima are the sole natural ceiling; add-on and metered (AI token) spend is uncapped and fails open (billed next invoice). RENDER: partial — a hard spend limit exists ONLY for build-pipeline minutes (Workspace Settings → Build Pipeline → Set spend limit; disables new builds at the cap, services keep running) and it is OFF by default; bandwidth has NO cap once a payment method is on file ($0.15/GB fail-open, email alerts near/over included usage only); without a card, exceeding included bandwidth or free hours suspends services until next month (de facto cap on card-less Hobby); compute has no cap beyond fixed per-instance prices.",
  "traps": [
    "Heroku add-on ZOMBIE BILLING: Postgres/Redis/Kafka bill 24/7 from `addons:create` until `addons:destroy` or app deletion — even with dynos at 0 or Eco asleep; agents that provision while experimenting leave meters running forever",
    "Heroku wall-clock billing: a dyno scaled up with zero traffic bills full price; `heroku ps:scale web=2` forgotten = double bill; Basic+ dynos never sleep",
    "Heroku Eco workers never sleep — one worker eats ~744 of the 1,000 pool hrs; uptime pingers (cron/Pingdom) defeat Eco web sleep; review apps + CI drain the same pool; at 100% every Eco app in the account goes dark",
    "Heroku metered AI (Managed Inference) has no ceiling — a looping agent burns tokens per-1M with no cap and no alert",
    "Render AI-crawler bandwidth: all outbound HTTP responses billable, no bot carve-out; unprotected app + card = open-ended $0.15/GB (documented 73 TB/$5k+ crawler cases industry-wide); mitigate with robots.txt/Cloudflare/no card",
    "Render service-initiated egress billable since Oct 2025: agent loops calling external APIs, S3 pushes, LLM streaming over WebSockets all meter bandwidth",
    "Render fail-open with card: bandwidth and build-minute overages auto-bill once a payment method exists; no pre-charge hard stop except the optional build-minutes limit",
    "Render agent scaffolding sprawl: default-to-Starter = $7/mo per always-on service (paid instances never spin down); Postgres storage is increase-only; auto-deploy on every push burns build minutes; full-stack preview envs multiply compute",
    "Render free Postgres deletes your data at day 30+14 grace — not free forever",
    "Both: leaked HEROKU_API_KEY / RENDER_API_KEY lets anyone provision paid resources on your card ($1,500/mo Performance dynos, paid Render services)",
    "Render legacy workspaces ($19/$29 per-seat, 100/500 GB bandwidth) force-migrate to new plans 2026-08-01 — Hobby bandwidth drops 100 GB → 5 GB"
  ],
  "usage_check": "HEROKU — Dashboard: https://dashboard.heroku.com/account/billing → Current Usage (updated nightly through previous UTC day) + Invoices; metered add-ons in the app's Resources tab. CLI: `heroku ps -a <app>` (shows eco dyno hours % used), `heroku addons --all` (every add-on + price account-wide), `heroku apps --all`, `heroku pg:info`. API: Platform API invoices endpoint. RENDER — Dashboard: https://dashboard.render.com/billing#included-usage (bandwidth + pipeline minutes vs included) and #unbilled-charges; per-service Metrics → Outbound Bandwidth; Workspace Settings → Build Pipeline for the spend limit. CLI: `render services` / `render deploys list` / `render logs` — NO billing/usage subcommand; usage is dashboard/API only (api.render.com).",
  "keywords": [
    "heroku",
    "heroku ps",
    "heroku ps:scale",
    "heroku ps:autoscale",
    "heroku ps:type",
    "heroku addons",
    "heroku addons:create",
    "heroku addons:destroy",
    "heroku addons:info",
    "heroku apps",
    "heroku apps:info",
    "heroku pg",
    "heroku redis",
    "heroku run",
    "heroku logs",
    "heroku config",
    "heroku releases",
    "heroku auth:whoami",
    "git push heroku",
    "Procfile",
    "HEROKU_API_KEY",
    "render",
    "render login",
    "render whoami",
    "render services",
    "render deploys",
    "render deploys create",
    "render logs",
    "render ssh",
    "render psql",
    "render redis-cli",
    "render workspace",
    "render workspaces",
    "render blueprint",
    "render jobs",
    "render.yaml",
    "RENDER_API_KEY",
    "api.render.com",
    "onrender.com"
  ],
  "hint": "Heroku: NO free tier, NO spend cap; add-ons bill 24/7 until destroyed (#1 trap: zombie Postgres/Redis after scaling dynos to 0); Eco=1000h pool, workers never sleep. Render Hobby: 5GB/mo bandwidth blows first — $0.15/GB fail-open with card, suspend without; only build-min cap exists, off by default.",
  "conflicts": [
    "Always-on dyno hours/month: A said ~720, B said 744 — not a real conflict (672–744 depending on month; July 2026 = 744). Used 744 with 'always-on ≈ one full month of a 1,000-hr pool'.",
    "Eco alert thresholds: A's free-tier section said email at 80% only; A's spend-cap section and B said 80%+100%. RESOLVED by live fetch of devcenter.heroku.com/articles/eco-dyno-hours: emails at BOTH 80% and 100%, forced sleep at 100%.",
    "April 2026 Render replan source: A cited render.com/docs/new-workspace-plans + changelog; B cited render.com/blog/better-pricing-for-fast-growing-teams. RESOLVED: docs/new-workspace-plans fetched live and confirms all numbers (Hobby $0/5GB/500min/2 domains/25 services, Pro $25/25GB/1,000min/15, Scale $499/1TB/5,000min/25, $0.15/GB, $5/1k min, $0.25/domain, Aug 1 2026 migration) — both sources describe the same change; docs page preferred.",
    "A internally claimed 'no billing alerts before bandwidth charges accrue' while also citing 'approaching/exceeding' emails; live fetch of docs/outbound-bandwidth does not mention alert emails at all — treated alerts as unverified/best-effort, hard behavior (bill with card / spin down without card) confirmed.",
    "Render instance prices $7/$25/$85/$175/$225/$450: A flagged these as only confirmed via search-indexed copies (JS-rendered pricing page); B stated them directly. Two independent reports agree → accepted; flagged as the weakest-sourced numbers in the sheet.",
    "Single-sourced (no conflict, lower confidence): B-only — Render Postgres basic-1gb $19/pro-4gb $55, Key Value Standard $32, cron per-minute rates, Private Link $0.03/GB, Heroku Premium-0 KV 50 MB; A-only — Heroku Managed Inference token prices, Render Scale +20% HIPAA compute premium, legacy Render bandwidth figures (100/500 GB, $30/100 GB)."
  ],
  "sources": [
    "https://www.heroku.com/pricing/",
    "https://devcenter.heroku.com/articles/usage-and-billing",
    "https://devcenter.heroku.com/articles/eco-dyno-hours (re-verified live 2026-07-17)",
    "https://help.heroku.com/RSBRUH58/removal-of-heroku-free-product-plans-faq",
    "https://elements.heroku.com/addons/heroku-key-value-store",
    "https://render.com/pricing",
    "https://render.com/docs/free (re-verified live 2026-07-17)",
    "https://render.com/docs/new-workspace-plans (re-verified live 2026-07-17)",
    "https://render.com/docs/outbound-bandwidth (re-verified live 2026-07-17)",
    "https://render.com/docs/build-pipeline",
    "https://render.com/docs/postgresql-refresh",
    "https://render.com/docs/key-value",
    "https://render.com/changelog/updated-plans-for-render-workspaces",
    "https://render.com/blog/better-pricing-for-fast-growing-teams",
    "https://render.com/changelog/upcoming-changes-to-outbound-bandwidth"
  ]
}
```

## Engine A — Claude (raw)

FACTSHEET: HEROKU + RENDER — PRICING & QUOTAS, CURRENT AS OF 2026-07-17

================================================================
HEROKU
================================================================

1. METERED BILLING DIMENSIONS
- Dyno wall-clock time, prorated to the second (charged for elapsed time whenever a dyno is scaled >0, regardless of traffic; CPU usage is irrelevant). https://devcenter.heroku.com/articles/usage-and-billing
- Add-on time (Postgres, Key-Value/Redis, Kafka, marketplace add-ons): bills continuously while provisioned, prorated to the second. https://devcenter.heroku.com/articles/usage-and-billing
- Metered add-ons (storage, bandwidth, AI tokens via Managed Inference): base fee + consumption. https://devcenter.heroku.com/articles/usage-and-billing and https://www.heroku.com/pricing/
- Eco: flat $5/mo subscription draining a 1,000-dyno-hour pool. https://devcenter.heroku.com/articles/eco-dyno-hours

2. FREE TIER
- NONE. Heroku eliminated all free plans (free dynos, free Postgres, free Redis) effective November 28, 2022 (announced August 25, 2022); inactive-account deletion began October 26, 2022. There is still no free tier as of July 2026. https://help.heroku.com/RSBRUH58/removal-of-heroku-free-product-plans-faq and https://www.heroku.com/blog/next-chapter/
- Cheapest substitute: Eco, $5/mo flat for 1,000 pooled dyno hours across all Eco dynos in the account (personal accounts only); Eco web dynos sleep after 30 min of no web traffic and don't consume hours while asleep. At 100% of pool, ALL Eco dynos are force-slept until month end (no ability to buy more hours). Email alert at 80%. https://devcenter.heroku.com/articles/eco-dyno-hours

3. PAID PLANS (verified 2026-07-17 at https://www.heroku.com/pricing/)
Dynos (Cedar): Eco $5/mo (0.5 GB RAM, subscription); Basic $7/mo max (~$0.01/hr, 0.5 GB); Standard-1X $25/mo (~$0.03/hr, 0.5 GB); Standard-2X $50/mo (1 GB); Performance-M $250/mo (2.5 GB, ~$0.34/hr); Performance-L $500/mo (14 GB); Performance-L-RAM $500/mo (30 GB); Performance-XL $750/mo (62 GB); Performance-2XL $1,500/mo (126 GB). Private dynos $125–$1,500/mo; Shield $150–$1,800/mo. Fir (K8s-based) Classic 1CPU-0.5GB $25/mo, 2CPU-1GB $50/mo, other families $80–$1,500/mo.
Heroku Postgres: Essential-0 $5/mo (1 GB), Essential-1 $9/mo (10 GB), Essential-2 $20/mo (32 GB); Standard-0 $50/mo (64 GB storage) up to Standard-10 $12,000/mo; Premium $200–$24,000/mo; Advanced tier $150–$56,000/mo.
Key-Value Store (Redis): Mini $3/mo (25 MB); Premium 0–14 $15–$12,500/mo.
Kafka: Basic $100–$175/mo; Standard $1,500–$3,200/mo; Extended $4,000–$8,700/mo.
Managed Inference (per 1M tokens): e.g. Claude 3 Haiku $0.25 in/$1.25 out; Claude 4.5 Sonnet $3.30/$16.50; embeddings $0.10–$0.12/1M; images $0.04–$0.14 each.
Overage model: dynos have a monthly price cap (e.g. Basic never exceeds $7/mo) — hourly billing capped at monthly max; there's no per-request/bandwidth metering on dynos. https://devcenter.heroku.com/articles/usage-and-billing

4. FIRST QUOTA AN INDIE APP BLOWS
- Eco dyno-hour pool (1,000 hrs/mo). One always-awake web dyno = ~720 hrs/mo; add a worker dyno (workers never sleep on traffic — only web dynos sleep) and you burn 1,000 hrs around day ~21, then every Eco app in the account goes dark until the 1st. https://devcenter.heroku.com/articles/eco-dyno-hours
- Second: Essential-0 Postgres 1 GB storage cap forcing a plan bump. https://www.heroku.com/pricing/

5. COST TRAPS FOR AI-AGENT-BUILT APPS
- Add-on "zombie billing": add-ons bill 24/7 from provisioning until explicitly destroyed — even if dynos are scaled to zero, the app gets no traffic, or Eco dynos are asleep. Agents that run `heroku addons:create` while experimenting leave meters running forever. Deleting the app is the only other stop. https://devcenter.heroku.com/articles/usage-and-billing
- Wall-clock billing: a dyno scaled to 1 with zero traffic bills full price; agents that `heroku ps:scale web=2` and forget pay double. https://devcenter.heroku.com/articles/usage-and-billing
- Review apps and one-off dynos (`heroku run`) accrue billable hours while running. https://devcenter.heroku.com/articles/usage-and-billing
- Eco worker dynos never sleep, silently draining the 1,000-hr pool. https://devcenter.heroku.com/articles/eco-dyno-hours
- Metered add-ons (AI inference tokens) have no cap — a looping agent burning Claude tokens via Managed Inference bills per 1M tokens with no ceiling. https://www.heroku.com/pricing/
- Leaked HEROKU_API_KEY allows provisioning Performance dynos ($1,500/mo each) and paid add-ons on your card.

6. SPEND CAPS
- NO hard spend cap exists on Heroku, and no configurable billing alerts on standard accounts. Alerts only: Eco pool email at 80%/100%. Dyno monthly price maxima are the only natural ceiling per dyno; add-on and metered spend is uncapped. Monitoring is manual. https://devcenter.heroku.com/articles/usage-and-billing and https://devcenter.heroku.com/articles/eco-dyno-hours

7. CHECK USAGE/SPEND
- Dashboard: https://dashboard.heroku.com/account/billing → "Current Usage" (updated nightly, accurate through previous day 00:00 UTC). Metered add-on usage: app's Resources tab.
- CLI: `heroku ps -a <app>` (shows "X eco dyno hours (N%) used"); `heroku addons --all` (all add-ons + prices across account); `heroku apps --all`; `heroku pg:info`.
- API: Platform API (api.heroku.com) invoices endpoint. https://devcenter.heroku.com/articles/usage-and-billing

8. DETECTION KEYWORDS (shell)
`heroku`, `heroku ps`, `heroku ps:scale`, `heroku ps:autoscale`, `heroku addons`, `heroku addons:create`, `heroku addons:destroy`, `heroku apps`, `heroku pg`, `heroku redis`, `heroku run`, `heroku logs`, `heroku config`, `git push heroku`, `Procfile`, `HEROKU_API_KEY`

================================================================
RENDER
================================================================

MAJOR RECENT CHANGE: New workspace plans announced April 23, 2026 (Hobby free / Pro $25 flat / Scale $499 flat, per-seat pricing removed). Legacy workspaces (Professional $19/user, Organization $29/user, 100 GB/500 GB included bandwidth, $30-per-100GB overage) are force-migrated on August 1, 2026 — two weeks from today. New plans include far LESS bandwidth (Hobby 100 GB → 5 GB). Bandwidth was earlier repriced July 2025 from $30/100 GB to $0.15/GB and broadened to include service-initiated outbound + WebSocket + Private Link traffic (effective Oct 1, 2025 for affected users). https://render.com/docs/new-workspace-plans , https://render.com/changelog/updated-plans-for-render-workspaces , https://render.com/blog/new-bandwidth-pricing-on-render , https://render.com/changelog/upcoming-changes-to-outbound-bandwidth

1. METERED BILLING DIMENSIONS
- Compute instance time per service, prorated to the second. https://render.com/pricing
- Outbound bandwidth per workspace ($/GB over included; counts HTTP/WebSocket responses, service-initiated egress, DB query responses leaving Render; excludes same-region private traffic, inbound, log streams). https://render.com/docs/outbound-bandwidth
- Build pipeline minutes. https://render.com/docs/build-pipeline
- Custom domains beyond included count ($0.25/mo each). https://render.com/docs/new-workspace-plans
- Postgres: compute (per instance type) + storage $0.30/GB/mo, separately, prorated to the second (flexible plans, introduced Oct 2024). https://render.com/docs/postgresql-refresh
- Persistent disks: $0.25/GB/mo. https://render.com/pricing

2. FREE TIER (Hobby workspace — exists, with exact limits)
- Free web services: spin down after 15 minutes with no inbound traffic; ~1 minute cold-start spin-up; 750 free instance hours per workspace per calendar month (suspended after that); 512 MB RAM / 0.1 CPU. https://render.com/docs/free
- Hobby workspace: 5 GB outbound bandwidth/mo (was 100 GB pre-April 2026), 500 build pipeline minutes/mo, 2 custom domains, 25 services max, 1 team member. https://render.com/docs/new-workspace-plans
- Free Postgres: 1 GB storage, 256 MB RAM, expires 30 days after creation (14-day grace to upgrade before deletion), 1 per workspace, no backups, no connection pooling. https://render.com/docs/free
- Free Key Value: 25 MB, 50 connections, in-memory only (data lost on restart AND on upgrade), 1 per workspace. https://render.com/docs/free
- Static sites: free, but count against bandwidth + build minutes. https://render.com/docs/free

3. PAID PLANS
Workspace plans (https://render.com/docs/new-workspace-plans): Hobby $0 (above); Pro $25/mo flat — unlimited members, 25 GB bandwidth, 1,000 build min, 15 domains, unlimited services, autoscaling; Scale $499/mo flat — 1 TB bandwidth, 5,000 build min, 25 domains, SSO/SCIM, HIPAA (+20% compute premium); Enterprise custom. Overages on all: bandwidth $0.15/GB, build minutes $5 per 1,000, domains $0.25/mo each.
Per-service compute (unchanged by 2026 replan; billed per second; https://render.com/pricing): Free $0 (512 MB/0.1 CPU); Starter $7/mo (512 MB/0.5 CPU); Standard $25/mo (2 GB/1 CPU); Pro $85/mo (4 GB/2 CPU); Pro Plus $175/mo (8 GB/4 CPU); Pro Max $225/mo (16 GB/4 CPU); Pro Ultra $450/mo (32 GB/8 CPU). Workers/private services start at Starter (no free). Horizontal scale max 100 instances/service.
Postgres flexible plans (https://render.com/docs/postgresql-refresh): compute tiers Basic/Pro/Accelerated named by RAM (e.g. basic-256mb ~$6/mo, up to accelerated-64gb) + storage $0.30/GB/mo (increase-only, in 5 GB steps); HA (Pro/Accelerated only) doubles instance cost.
Key Value: Free 25 MB (no persistence); paid from ~$10/mo Starter (persistence on by default), up to 10 GB RAM standard. https://render.com/docs/key-value and https://render.com/pricing

4. FIRST QUOTA AN INDIE APP BLOWS
- On new (post-April-2026) Hobby: the 5 GB/mo bandwidth cap, by far. A modest site serving ~170 MB/day of responses/assets blows it; any image-heavy app or one crawled by bots does it in days. Without a card: services spin down until month start. With a card: $0.15/GB silently. https://render.com/docs/new-workspace-plans and https://render.com/docs/outbound-bandwidth
- Also early: free Postgres hard-expires at 30 days; 750 free instance hours only covers ~1 always-poked free web service.

5. COST TRAPS FOR AI-AGENT-BUILT APPS
- AI-crawler bandwidth: bot/AI-crawler traffic now exceeds ~50% of web traffic (AI crawlers +187% in 2025); Render bills all outbound HTTP responses with no bot carve-out (unlike WP Engine/Kinsta which exclude bot traffic). An unprotected app + card on file = open-ended $0.15/GB drain; documented industry cases include a crawler pulling 73 TB in a month (>$5,000). Mitigate with robots.txt, Cloudflare in front, or no payment method. https://render.com/docs/outbound-bandwidth , https://webhosting.today/2026/03/20/ai-crawlers-are-eating-your-bandwidth-how-hosting-companies-are-fighting-back/ , https://web60.ie/blog/ai-bots-half-website-traffic
- Service-initiated egress is billable since Oct 2025: an agent loop calling external APIs, pushing to S3, or streaming LLM responses over WebSockets all meters bandwidth. https://render.com/changelog/upcoming-changes-to-outbound-bandwidth
- Keep-alive pingers (the classic anti-spin-down hack, e.g. cron-hitting the app every 14 min) burn the 750 free hours and generate bandwidth.
- Agents scaffolding one-service-per-experiment: each paid Starter service is $7/mo each until suspended; Postgres storage is increase-only ($0.30/GB/mo forever unless you migrate).
- Auto-deploy on git push burns build minutes; monorepo agents pushing constantly can exceed 500 free minutes.
- Leaked RENDER_API_KEY: API can create paid services/instances.
- No billing alerts before charges accrue for bandwidth; per-seat removal means adding collaborators is free, but bandwidth/build overages are the new variable spend. https://render.com/docs/new-workspace-plans

6. SPEND CAPS
- Partial. HARD cap exists ONLY for build pipeline minutes: Workspace Settings → Build Pipeline → "Set spend limit"; at the limit, new builds are disabled for the month (services keep running on existing artifacts). NOT on by default. https://render.com/docs/build-pipeline
- Bandwidth: NO hard cap and no spend limit if a payment method is on file — billed per GB, alerts by email when "approaching" and when exceeding included usage. Without a payment method, exceeding included bandwidth spins services down until next month (a de facto cap). https://render.com/docs/outbound-bandwidth
- Compute: no cap; fixed per-instance monthly prices are the only ceiling.

7. CHECK USAGE/SPEND
- Dashboard: https://dashboard.render.com → Billing page → "Monthly Included Usage" (bandwidth + pipeline minutes) and current-month charges; Workspace Settings for spend limit. https://render.com/docs/build-pipeline
- CLI: `render` CLI — `render services`, `render deploys list`, `render logs`, `render workspace set` (no billing subcommand; billing is dashboard/API only). https://render.com/docs/cli
- API: api.render.com REST API (services, instances); billing data primarily via dashboard.

8. DETECTION KEYWORDS (shell)
`render`, `render login`, `render services`, `render deploys`, `render deploys create`, `render logs`, `render psql`, `render redis-cli`, `render ssh`, `render workspace`, `render.yaml` (Blueprints), `RENDER_API_KEY`, `api.render.com`, `onrender.com`

================================================================
AUTO-SLEEP OPTIONS (both platforms)
- Heroku: only Eco web dynos auto-sleep (30 min idle; hours not consumed while asleep). Basic/Standard/Performance never sleep — you pay wall-clock unless you `heroku ps:scale web=0`. Third-party add-ons (e.g. AutoIdle) exist for scheduled scale-down. https://devcenter.heroku.com/articles/eco-dyno-hours
- Render: only Free web services auto-sleep (15 min idle, ~1 min wake). Paid instances run 24/7; no scale-to-zero — options are manual suspend of the service in the dashboard, or cron-based scaling via the API. https://render.com/docs/free

KEY SOURCE URLS
- https://www.heroku.com/pricing/
- https://devcenter.heroku.com/articles/eco-dyno-hours
- https://devcenter.heroku.com/articles/usage-and-billing
- https://help.heroku.com/RSBRUH58/removal-of-heroku-free-product-plans-faq
- https://www.heroku.com/blog/next-chapter/
- https://render.com/pricing
- https://render.com/docs/free
- https://render.com/docs/new-workspace-plans
- https://render.com/changelog/updated-plans-for-render-workspaces
- https://render.com/docs/outbound-bandwidth
- https://render.com/blog/new-bandwidth-pricing-on-render
- https://render.com/changelog/upcoming-changes-to-outbound-bandwidth
- https://render.com/docs/build-pipeline
- https://render.com/docs/postgresql-refresh
- https://render.com/docs/key-value
- https://webhosting.today/2026/03/20/ai-crawlers-are-eating-your-bandwidth-how-hosting-companies-are-fighting-back/
- https://web60.ie/blog/ai-bots-half-website-traffic

CAVEATS: Render web-service instance prices ($7–$450) and Key Value Starter ($10) were confirmed against render.com/pricing via search-indexed copies (the pricing page is JS-rendered and returned no numbers on direct fetch); all other Render numbers come from official Render docs/changelog pages fetched directly. Legacy Render plan figures ($19/$29 per user, 100/500 GB, $30/100 GB) are valid only until the August 1, 2026 forced migration.

## Engine B — grok (raw)

# Pricing / Quota Factsheet — Heroku + Render  
**As of July 2026** (verified against official pricing/docs)

---

## Recent changes (dates matter)

| Date | Change | Source |
|------|--------|--------|
| **2022-11-28** | Heroku removed free dynos, free Postgres, free Key-Value Store permanently | [Heroku free-plans FAQ](https://help.heroku.com/RSBRUH58/removal-of-heroku-free-product-plans-faq) |
| **2022-09** (announced) | Eco dynos + Mini data plans introduced as paid replacements | [Heroku low-cost plans blog](https://www.heroku.com/blog/new-low-cost-plans/) |
| **2026-04-23** | Render new workspace plans: no seat fees; bandwidth **per-GB $0.15** (was 100 GB blocks); Hobby **5 GB**, Pro **25 GB**, Scale **1 TB** included | [Render pricing blog](https://render.com/blog/better-pricing-for-fast-growing-teams), [outbound bandwidth docs](https://render.com/docs/outbound-bandwidth) |
| **2026-08-01** | Remaining Render legacy workspaces auto-convert to new plans | [Render pricing blog](https://render.com/blog/better-pricing-for-fast-growing-teams) |

---

# HEROKU

## 1. Metered billing dimensions

| Meter | Unit | Notes |
|-------|------|--------|
| **Dyno runtime** | wall-clock seconds (prorated) | Billed while scaled > 0, **not** CPU time |
| **Eco dyno hours** | hours from shared 1,000 h pool | Flat $5/mo subscription; sleeps don’t consume hours |
| **Data add-ons** | wall-clock while provisioned | Postgres, Key-Value Store, Kafka — bill until destroyed |
| **Marketplace add-ons** | per-add-on plan + metered (tokens, storage, etc.) | Partner pricing on Elements |
| **One-off / Scheduler dynos** | runtime of the one-off | `heroku run`, Scheduler jobs |

**Not metered separately:** public bandwidth / request count (unlike Render).  
Sources: [Usage & Billing](https://devcenter.heroku.com/articles/usage-and-billing), [Eco dyno hours](https://devcenter.heroku.com/articles/eco-dyno-hours)

---

## 2. Free tier

**None since 2022-11-28.** No free dynos, free Postgres, or free Key-Value Store.  
Source: [Removal FAQ](https://help.heroku.com/RSBRUH58/removal-of-heroku-free-product-plans-faq)

Cheapest floor for a personal “hello world + DB”:

| Piece | Price |
|-------|-------|
| Eco dyno plan | **$5/mo** (1,000 shared hours) |
| Essential-0 Postgres | **$5/mo** |
| Key-Value Mini (optional) | **$3/mo** |
| **Typical minimum** | **~$10/mo** (app + DB) |

---

## 3. Paid plans (indie-relevant)

### Dynos (Cedar common runtime)  
Source: [heroku.com/pricing](https://www.heroku.com/pricing/), [Usage & Billing](https://devcenter.heroku.com/articles/usage-and-billing)

| Plan | Price | RAM | Included / notes | Overage |
|------|-------|-----|------------------|---------|
| **Eco** | **$5/mo flat** | 0.5 GB | 1,000 dyno hours **shared** across all Eco apps; sleeps after **30 min** no web traffic | Cannot buy more hours; must upgrade |
| **Basic** | **$7/mo** (~$0.01/h) | 0.5 GB | Always-on; no horizontal scale | N/A (prorated by second) |
| **Standard-1X** | **$25/mo** (~$0.03/h) | 0.5 GB | Horizontal scale, metrics, preboot | N/A |
| **Standard-2X** | **$50/mo** (~$0.06/h) | 1 GB | Same + more RAM | N/A |
| **Performance-M** | **$250/mo** (~$0.34/h) | 2.5 GB | Dedicated, autoscaling | N/A |
| **Performance-L** | **$500/mo** (~$0.69/h) | 14 GB | … | N/A |
| Performance-L-RAM / XL / 2XL | $500 / $750 / $1,500 | 30–126 GB | … | N/A |

**Eco rules** ([docs](https://devcenter.heroku.com/articles/eco-dyno-hours)):

- Personal accounts only (not Teams/Enterprise).
- Full $5 charged even if subscribed mid-month or unused.
- Worker-only Eco dynos **do not sleep** → burn hours 24/7.
- At 100% of 1,000 h, **all Eco dynos forced to sleep** for rest of month.

### Postgres (entry tiers)  
Source: [heroku.com/pricing](https://www.heroku.com/pricing/)

| Plan | Price | Disk | Connections |
|------|-------|------|-------------|
| Essential-0 | **$5/mo** | 1 GB | 20 |
| Essential-1 | **$9/mo** | 10 GB | 20 |
| Essential-2 | **$20/mo** | 32 GB | 40 |
| Standard-0 | **$50/mo** | 64 GB, 4 GB RAM | 120 |

### Key-Value Store  
Source: [Elements: heroku-key-value-store](https://elements.heroku.com/addons/heroku-key-value-store), [Help cheapest plans](https://help.heroku.com/1CDF2VHY/what-are-your-cheapest-heroku-postgres-and-heroku-data-for-redis-plans)

| Plan | Price | Memory |
|------|-------|--------|
| Mini | **$3/mo** (~$0.004/h) | 25 MB |
| Premium-0 | **$15/mo** | 50 MB |

---

## 4. What an indie app blows first

| Order | What | At what usage |
|-------|------|----------------|
| **1st (always)** | **Wallet / credit card** — no free tier | First paid resource |
| **Eco hours** | Shared 1,000 h pool | ~1 always-on Eco web dyno ≈ 744 h/mo (OK); **2 always-on workers** or pinger-kept-awake apps exhaust pool ~mid-month → **hard sleep** |
| **Zombie add-ons** | Postgres/Redis still provisioned | Scale dynos to 0 but leave Essential-0 + Mini → still **~$8/mo forever** |
| **Dyno tier jump** | Agent defaults to Standard/Performance | One Standard-1X + Essential-0 = **$30/mo** before traffic |

**Practical “blows first” for hobby:** Eco hour pool if multiple apps/workers stay awake; otherwise **forgotten add-ons** after dynos are scaled down.

---

## 5. Cost traps (AI-agent-built apps)

| Trap | Why it bills |
|------|----------------|
| **Add-on zombie billing** | Data add-ons accrue **while enabled**, independent of dynos ([billing docs](https://devcenter.heroku.com/articles/usage-and-billing#heroku-data-add-ons-usage-and-costs)) |
| **Eco worker never sleeps** | Workers don’t idle-sleep → 1 worker ≈ 744 h of the 1,000 pool |
| **Uptime pingers** | Pingdom/New Relic/cron pings prevent Eco sleep ([eco docs](https://devcenter.heroku.com/articles/eco-dyno-hours#dyno-sleeping)) |
| **Review apps / CI** | Eco review apps + Heroku CI consume the **same** Eco hour pool |
| **`heroku run` loops** | Agent one-off dynos bill by runtime |
| **Autoscaling (Performance only)** | Scales up for load; bill follows peak formation |
| **Metered AI add-ons** | Heroku Managed Inference etc. — tokens/storage on top of plan |
| **Leaked `HEROKU_API_KEY`** | Attacker can provision dynos/add-ons on your account |
| **Staging/tutorial apps** | All usage billed — nothing is “free sandbox” |

---

## 6. Spend caps

| Control | Exists? | Default |
|---------|---------|---------|
| **Account-wide hard $ cap** | **No** | — |
| **Eco hours hard stop** | **Yes** (sleep all Eco apps at 100%) | On when subscribed to Eco |
| **Budget alerts** | Eco emails at **80%** and **100%** of hours only | Eco-only |
| **Paid dynos / add-ons** | Fail **open** — bill next month for all wall-clock usage | No auto-stop |

Source: [Eco dyno hours](https://devcenter.heroku.com/articles/eco-dyno-hours), [Usage & Billing](https://devcenter.heroku.com/articles/usage-and-billing)

---

## 7. How to check usage / spend

| Method | Where |
|--------|--------|
| **Dashboard** | https://dashboard.heroku.com/account/billing — **Current Usage** (nightly, through previous UTC day) |
| **Eco hours remaining** | Billing page, or CLI `heroku ps -a <app>` (shows “X eco dyno hours used / remaining”) |
| **Invoices** | Billing page → Invoices |
| **Metered add-ons** | App/Team **Resources** tab |
| **API** | Platform API resources; no simple “spend remaining” for paid dynos |

Sources: [Usage & Billing](https://devcenter.heroku.com/articles/usage-and-billing), [Eco docs](https://devcenter.heroku.com/articles/eco-dyno-hours)

---

## 8. Shell keywords (CLI only)

```
heroku
heroku auth:whoami
heroku apps
heroku apps:info
heroku ps
heroku ps:scale
heroku ps:type
heroku addons
heroku addons:destroy
heroku addons:info
heroku run
heroku logs
heroku config
heroku releases
```

---

## Auto-sleep (Heroku)

| Type | Sleep? |
|------|--------|
| **Eco web** | Yes — **30 min** no HTTP traffic; hours not consumed while sleeping |
| **Eco worker** | **No** — runs until scaled down |
| **Basic+** | **No** — always-on until `ps:scale web=0` |
| Manual | `heroku ps:scale web=0 worker=0` |

---

# RENDER

## 1. Metered billing dimensions

| Meter | Unit | Notes |
|-------|------|--------|
| **Workspace plan** | $/mo flat | Hobby $0, Pro $25, Scale $499 |
| **Compute instance** | per-second while running | Web / private / worker / cron / workflows |
| **Outbound bandwidth** | GB egress to public internet | Plan-included then **$0.15/GB** |
| **Build pipeline minutes** | minutes | Builds + pre-deploy |
| **Persistent disks** | GB-month | **$0.25/GB/mo** |
| **Postgres extra storage** | GB | **$0.30/GB** (paid) |
| **Custom domains** | count | Included N then **$0.25/domain/mo** |
| **Private link BW** | GB | **$0.03/GB** (Pro+) |

Sources: [render.com/pricing](https://render.com/pricing), [outbound bandwidth](https://render.com/docs/outbound-bandwidth), [free tier docs](https://render.com/docs/free)

---

## 2. Free tier — exact quotas

**Hobby workspace: $0/mo + free compute options**  
Source: [Deploy for Free](https://render.com/docs/free), [Pricing](https://render.com/pricing)

| Quota | Exact number |
|-------|----------------|
| **Free instance hours** | **750 hours / workspace / calendar month** (shared across Free web services; spun-down time does **not** count) |
| **Free web instance** | **512 MB RAM**, **0.1 CPU**, **$0** |
| **Spin-down** | After **15 minutes** idle (HTTP/WebSocket inactivity); ~**1 min** cold start |
| **Free Postgres** | **1** per workspace; **1 GB** storage; **256 MB RAM**; **expires 30 days** after creation (+14-day upgrade grace, then **deleted**) |
| **Free Key Value** | **1** per workspace; **25 MB**; **in-memory only** (data lost on restart) |
| **Static sites** | Free (count against bandwidth + pipeline) |
| **Outbound bandwidth (Hobby)** | **5 GB/mo** included |
| **Build pipeline (Hobby)** | **500 minutes/mo** |
| **Custom domains (Hobby)** | **2** included |
| **Max services (Hobby)** | **25** |
| **Persistent disks on Free** | **Not supported** |
| **SSH / scaling / edge cache on Free** | Not supported |

If Free hours exhausted → Free web services **suspended** until next month.  
If bandwidth exhausted **with no payment method** → Free services **suspended**.  
If bandwidth exhausted **with payment method** → **$0.15/GB** overage (fail open).

---

## 3. Paid plans

### Workspace plans  
Source: [render.com/pricing](https://render.com/pricing), [Apr 2026 blog](https://render.com/blog/better-pricing-for-fast-growing-teams)

| Plan | Price | Bandwidth included | Overage | Pipeline mins | Domains |
|------|-------|--------------------|---------|---------------|---------|
| **Hobby** | **$0/mo** + compute | **5 GB** | **$0.15/GB** | **500** then **$5 / 1k min** | 2 then $0.25/mo |
| **Pro** | **$25/mo** + compute | **25 GB** | **$0.15/GB** | **1,000** then **$5 / 1k min** | 15 then $0.25/mo |
| **Scale** | **$499/mo** + compute | **1 TB** | **$0.15/GB** | **5,000** then **$5 / 1k min** | 25 then $0.25/mo |
| **Enterprise** | Custom | Custom | Custom | Custom | Custom |

### Web / private / worker instances  
Source: [Pricing compute table](https://render.com/pricing)

| Instance | Price | RAM | CPU |
|----------|-------|-----|-----|
| Free | $0/mo | 512 MB | 0.1 |
| **Starter** | **$7/mo** | 512 MB | 0.5 |
| **Standard** | **$25/mo** | 2 GB | 1 |
| **Pro** | **$85/mo** | 4 GB | 2 |
| Pro Plus | $175/mo | 8 GB | 4 |
| Pro Max | $225/mo | 16 GB | 4 |
| Pro Ultra | $450/mo | 32 GB | 8 |

Prorated **by the second** while running.

### Postgres (entry)  
| Tier | Price | RAM | Notes |
|------|-------|-----|-------|
| Free | $0 (30-day limit) | 256 MB | 1 GB storage |
| Basic-256mb | **$6/mo** | 256 MB | — |
| Basic-1gb | **$19/mo** | 1 GB | — |
| Pro-4gb | **$55/mo** | 4 GB | — |

### Key Value  
| Type | Price | RAM |
|------|-------|-----|
| Free | $0 | 25 MB |
| Starter | **$10/mo** | 256 MB |
| Standard | **$32/mo** | 1 GB |

### Cron (prorated by second while running)  
Starter **$0.00016/min**, Standard **$0.00058/min**, Pro **$0.00197/min**, …

---

## 4. What an indie app blows first

| Order | Meter | At what usage |
|-------|--------|----------------|
| **#1 after Apr 2026** | **Outbound bandwidth (Hobby 5 GB)** | One public marketing site + AI crawlers (GPTBot etc.) can exhaust **5 GB in days**; with card → **$0.15/GB** open-ended. Example: +100 GB overage ≈ **$15**; +500 GB ≈ **$75** |
| **#2 free only** | **750 Free instance hours** | 1 Free service awake 24/7 ≈ 744 h (OK); **2 always-awake Free services** exhaust ~day 15 → suspend |
| **#3 free DB** | **30-day Free Postgres expiry** | Day 30 + 14 grace → data **deleted** unless upgraded |
| **#4 agent loops** | **Pipeline minutes (500 Hobby)** | Heavy Next/Docker rebuilds every push; ~$5 per extra 1k min if card on file |
| **Paid always-on floor** | Starter web + Basic-256 Postgres | **~$13/mo** compute alone (before BW) |

**Indie “blows first” post–Apr 2026: bandwidth at 5 GB (Hobby) or 25 GB (Pro), often via bots/crawlers rather than real users.**

---

## 5. Cost traps (AI-agent-built apps)

| Trap | Mechanism |
|------|-----------|
| **AI crawler bandwidth** | GPTBot/ClaudeBot/etc. download HTML/assets → **outbound** BW; documented real overages on Render before bot blocking |
| **Fail-open with payment card** | BW and pipeline overages bill automatically once card linked ([free docs](https://render.com/docs/free), [BW docs](https://render.com/docs/outbound-bandwidth)) |
| **Agent deploy loops** | Every push burns **pipeline minutes**; auto-deploy on main |
| **Default paid instance** | Scaffold picks Starter/Standard instead of Free → **$7–25/mo** always-on |
| **Always-on workers + cron** | No spin-down on paid instances; crons bill while executing |
| **Preview environments** | Full-stack previews (Pro+) multiply compute |
| **Free Postgres forgotten** | Expires/deletes at 30 days — not free forever |
| **Service-initiated egress** | App calling external APIs/S3 (cross-region) counts as outbound BW |
| **Leaked Render API key** | Attacker can create paid services / suspend / redeploy |
| **Spin-down false security** | Free spins down, but **paid Starter does not** — still $7×N services |

---

## 6. Spend caps

| Control | Hard stop? | Default |
|---------|------------|---------|
| **Workspace $ hard cap** | **No** general hard cap | — |
| **Pipeline minutes spend limit** | **Yes** — optional max $ on pipeline overage | **Off** until you set it ([build pipeline](https://render.com/docs/build-pipeline#setting-a-spend-limit)) |
| **Free instance hours** | Hard suspend of Free web services | On (750 h) |
| **Bandwidth no card** | Hard suspend Free services | On |
| **Bandwidth with card** | **Fail open** — $0.15/GB forever | Card enables unlimited overage |
| **Email approaching limits** | Alerts near free/usage limits | On for Free usage |

---

## 7. How to check usage / spend

| Method | URL / command |
|--------|----------------|
| **Billing + included usage** | https://dashboard.render.com/billing#included-usage |
| **Unbilled charges** | https://dashboard.render.com/billing#unbilled-charges |
| **Per-service BW** | Service → **Metrics** → Outbound Bandwidth |
| **API** | https://api-docs.render.com (services, metrics; billing primarily dashboard) |
| **CLI** | Manage services; **usage is dashboard-primary** (no first-class `render usage` equivalent documented) |

Sources: [Free docs tracking](https://render.com/docs/free#tracking-usage), [Dashboard billing](https://render.com/docs/render-dashboard), [Outbound BW FAQ](https://render.com/docs/outbound-bandwidth)

---

## 8. Shell keywords (CLI only)

```
render
render login
render whoami
render workspaces
render services
render deploys
render deploy
render logs
render ssh
render psql
render blueprint
render jobs
```

(Full reference: [Render CLI docs](https://render.com/docs/cli))

---

## Auto-sleep options (Render)

| Service type | Auto-sleep |
|--------------|------------|
| **Free web** | Yes — **15 min** idle; spins up on next request (~1 min) |
| **Free spun-down `/robots.txt`** | Auto “disallow all” without waking service |
| **Paid web/worker** | **No** — always-on until suspended or deleted |
| **Manual** | Dashboard **Suspend** (bulk supported); API `POST …/suspend` |
| **Cron / Workflows** | Bill only while task runs (natural “sleep”) |

Sources: [Free spin-down](https://render.com/docs/free#spinning-down-on-idle), [Suspend changelog](https://render.com/changelog/suspend-and-resume-services-in-bulk-from-the-render-dashboard)

---

# Side-by-side (indie defaults)

| | **Heroku** | **Render** |
|--|------------|------------|
| Free compute | **None** (since Nov 2022) | Free web + 750 h + spin-down |
| Floor always-on web | Eco $5 (sleeps) or Basic **$7** | Free (sleeps) or Starter **$7** |
| Floor + DB | ~**$10–12/mo** | Free DB 30 days, then ~**$6+** |
| Bandwidth | Not line-item | **5 GB Hobby / 25 GB Pro** then **$0.15/GB** |
| Sleep | Eco **30 min** | Free **15 min** |
| Hard $ cap | **No** (Eco hours only) | Pipeline spend limit only; **BW fail-open with card** |
| Zombie risk | **Add-ons after scale-to-0** | Paid instances left running; Free DB expiry |
| Agent #1 risk | Forgotten Postgres/Redis + Eco workers | **BW overage from crawlers + auto-deploys** |

---

## Primary official sources (every number above)

1. https://www.heroku.com/pricing/  
2. https://devcenter.heroku.com/articles/usage-and-billing  
3. https://devcenter.heroku.com/articles/eco-dyno-hours  
4. https://help.heroku.com/RSBRUH58/removal-of-heroku-free-product-plans-faq  
5. https://elements.heroku.com/addons/heroku-key-value-store  
6. https://render.com/pricing  
7. https://render.com/docs/free  
8. https://render.com/docs/outbound-bandwidth  
9. https://render.com/docs/build-pipeline  
10. https://render.com/blog/better-pricing-for-fast-growing-teams (2026-04-23)

**Verify before committing spend** — workspace plan migration windows (Render Aug 2026) and Heroku Elements partner add-ons can change independently of platform dyno/instance tables.
