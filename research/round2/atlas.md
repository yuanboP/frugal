# Research archive (round 2): atlas

Raw dual-engine research (2026-07-17). Engine A = Claude web search; Engine B = grok CLI. Merged factsheet cross-checks both.

## Merged factsheet

```json
{
  "provider": "MongoDB Atlas + PlanetScale (as of 2026-07-17)",
  "billing_dimensions": [
    "Atlas Dedicated (M10+): compute $/hr per tier, varies by cloud+region; extra disk/IOPS and backup storage $/GB extra",
    "Atlas Flex: $/hr tiered by peak ops/sec band, hard-capped $30/mo per cluster; 5 GB storage incl; no data-transfer charges",
    "Atlas data transfer (Dedicated only): ~$0.01/GB same-region, ~$0.02/GB cross-region, ~$0.09/GB internet egress (provider pass-through); ingress free; Free/Flex egress not charged",
    "Atlas add-ons: Search/Vector Search nodes hourly (from ~$0.12/hr), Stream Processing $0.06–$2.49/hr, Data Federation/Atlas SQL $5/TB scanned (10 MB min/query), App Services per-request/compute/sync",
    "Atlas REMOVED meters: pay-per-RPU Serverless and M2/M5 shared tiers are gone (migrations 2025, final API EOL Jan 22, 2026) — auto-migrated to Free/Flex/Dedicated",
    "PlanetScale: cluster SKU per instance, prorated (PS-5…PS-2560, Metal M-*); HA = 3 instances; extra production branches = full cluster price each; read-only regions/replicas extra",
    "PlanetScale storage: 10 GB incl then $0.50/GB per instance/mo overage (plans page; ~$1.50/GB effective on 3-node HA); Postgres provisioned disk billed $0.125/GB-mo us-east-1 (regional); Metal = NVMe bundled in SKU",
    "PlanetScale egress (Postgres, verified): $0.060/GB us-east-1 beyond 100 GB/mo (production) or 10 GB/mo (single-node/dev); private link $0.01/GB; IOPS>3000 $0.009/IOPS-mo, throughput>125MiB/s $0.073/MiB/s-mo",
    "PlanetScale backups: automatic 12h backups free; user-scheduled $0.023/GB-mo (Postgres includes 2x disk); dev branches billed (Postgres PS-DEV $5/mo; Vitess included hours then ~$0.014/hr)",
    "PlanetScale REMOVED meter: row reads/writes billing is legacy Scaler only — current Base plan (ex-Scaler Pro) is resource-based; query volume does NOT bill"
  ],
  "free_tier": "Atlas M0 \"Free\": $0 forever (not a trial). Exact quotas: 512 MB storage (data+indexes), 100 ops/sec throttle, 500 max connections, 100 databases / 500 collections, 10 GB in + 10 GB out per rolling 7-day period (throttled, not billed), 3-node shared replica set, 1 free cluster/project, no backups/sharding/private endpoints, 32 MB sort memory, 50 aggregation stages max, no server-side JS; idle clusters get paused (Report A: after ~30 days of zero connections). PlanetScale: NO free tier since Apr 8, 2024 (Hobby/Developer removed); valid credit/debit card required for all orgs; cheapest entry = $5/mo Postgres single-node PS-5.",
  "plans": [
    {
      "name": "Atlas Free (M0)",
      "price": "$0 forever",
      "included": "512 MB, 100 ops/s, 500 conns, 10 GB in+out per 7 days",
      "overage": "none — throttles instead of billing"
    },
    {
      "name": "Atlas Flex",
      "price": "$0.011/hr (~$8/mo) base",
      "included": "5 GB storage, 100 ops/s, unlimited data transfer",
      "overage": "hourly rate steps up by ops/s band ($15/$21/$26 → $30/mo at 400–500 ops/s); HARD CAP $30/mo per cluster, throttles at 500 ops/s"
    },
    {
      "name": "Atlas Dedicated (M10 entry, AWS us-east-1)",
      "price": "$0.08/hr (~$57/mo); M20 $0.20, M30 $0.54, M40 $1.04 … M700 $33.26/hr",
      "included": "M10: 2 GB RAM, 2 vCPU, 10 GB disk (expandable to 128 GB); tier range up to 4 TB/768 GB RAM",
      "overage": "egress $0.01–$0.09+/GB, extra disk/IOPS, backup $/GB; autoscaling changes hourly rate — no spend cap"
    },
    {
      "name": "PlanetScale Base — Postgres single-node PS-5",
      "price": "$5/mo",
      "included": "1/16 vCPU, 512 MB RAM, 10 GB disk, 10 GB egress",
      "overage": "disk $0.125/GB-mo (us-east-1), egress $0.06/GB, backups $0.023/GB-mo past 2x disk"
    },
    {
      "name": "PlanetScale Base — Postgres HA PS-5 (3-node)",
      "price": "$15/mo (PS-10 $30, PS-20 $50 … PS-2560 $4,529)",
      "included": "3 nodes/3 AZs, 10 GB disk, 100 GB egress/mo, 12h backups, unmetered connections",
      "overage": "storage and egress as above ×instances; extra prod branch = full cluster price"
    },
    {
      "name": "PlanetScale Base — Vitess (MySQL) HA PS-10",
      "price": "$39/mo (PS-20 $59, PS-40 $99, PS-80 $179 … PS-2560 $5,599)",
      "included": "3-node HA only (no single-node Vitess), 10 GB storage, dev-branch hours incl",
      "overage": "storage $0.50/GB/instance/mo (~$1.50/GB HA), dev branches ~$0.014/hr past included"
    },
    {
      "name": "PlanetScale Metal",
      "price": "from $50/mo (M-10 arm64) up to ~$26.9k–$47.2k/mo (M-7680)",
      "included": "local NVMe storage bundled in SKU price",
      "overage": "none for storage (fixed drive); SKUs >M-320 gated until $100 invoices paid"
    },
    {
      "name": "Enterprise (both)",
      "price": "custom",
      "included": "Atlas: commitments/support tiers; PlanetScale: single-tenant or Managed in your AWS/GCP",
      "overage": "contract"
    }
  ],
  "first_quota_blown": "Atlas M0: 100 ops/sec is hit first by any real traffic (agent polling loops saturate instantly → throttle, not bill), then 512 MB storage, then 500 connections (serverless functions without pooling), then 10 GB/7-day transfer. Flex: cost silently climbs $8→$30 then throttles at 500 ops/s (cap is the safety net). Dedicated: DATA EGRESS + autoscale tier jumps blow first — documented cases of transfer bills exceeding the cluster bill. PlanetScale: there is no usage meter to blow — the first surprise is the flat SKU floor itself ($5 Postgres / $39 Vitess per database, card on file), then storage past 10 GB ($0.50/GB×3 nodes HA) and Postgres egress past 100 GB ($0.06/GB).",
  "spend_cap": "Atlas: NO hard cap on Dedicated — USD-threshold billing alerts only (daily billed amount, monthly bill threshold), NOT preconfigured by default. Structural caps per cluster type only: M0 is $0 forever (throttles); Flex is hard-capped at $30/mo per cluster (throttles at 500 ops/s instead of billing). Bound Dedicated via autoscaling max-tier + pause. PlanetScale: NO hard cap of any kind — email spend alerts OFF by default (opt-in on billing page; org admins emailed at 75% and 100% of a budget YOU set; nothing throttles or stops). Soft structural cap: SKUs limited to PS-160/M-320 until ≥$100 in paid invoices.",
  "traps": [
    "Atlas autoscaling is ON by default for UI-created clusters, up-fast/down-slow: CPU/mem >90% for 10 min (M10/M20 ~20 min per Report B) or >75% for 1 hr doubles the tier (M10 $58→M20 $146/mo); scale-down requires 24 hr since last change PLUS ~4 hr sustained low load; predictive autoscale (M30+) can jump 2 tiers pre-spike",
    "Atlas storage autoscaling can silently RAISE your max tier and DISABLE scale-down; storage never auto-shrinks — one runaway log write permanently raises the floor",
    "Atlas Dedicated egress is invisible and uncapped: $0.09/GB internet, $0.01/GB per cross-AZ direction — unprojected full-document reads / change-stream loops from another region rack it up with no throttle",
    "Leaked Atlas org API key → programmatic M700 at $33/hr ≈ $24k/mo; no hard cap will stop it (use API-key IP access lists + billing alerts)",
    "Stale tutorials/Terraform referencing Atlas Serverless or M2/M5 fail or land on Flex/Dedicated — those products are gone (final EOL Jan 22, 2026)",
    "PlanetScale has NO free tier since Apr 2024: an agent following an old 'Hobby is free' tutorial signs the card up at $5–$39/mo PER database; scaffolds default to Vitess HA PS-10 $39 when Postgres single-node $5 would do",
    "PlanetScale branch sprawl: each production branch = a full extra cluster; dev branches bill too (Postgres PS-DEV $5/mo each; Vitess ~$0.014/hr past included) — a branch-per-PR bot that never deletes compounds monthly; audit with `pscale branch list`",
    "PlanetScale storage growth: unbounded log/embedding tables bill $0.50/GB × 3 instances = ~$1.50/GB/mo on HA Vitess with spend alerts OFF by default",
    "PlanetScale query loops do NOT bill per-row (row-read/write billing removed with Scaler) — but Postgres public egress bills $0.06/GB past 100 GB, and hot loops force SKU step-ups",
    "Template defaults that add SSO ($199/mo), extra replicas, read-only regions, or Atlas Search/Vector nodes and multi-region clusters silently multiply meters"
  ],
  "usage_check": "Atlas: cloud.mongodb.com → Organization → Billing (pending invoice, Cost Explorer, per-line-item invoices); CLI `atlas api invoices listInvoices` / `listPendingInvoices` / `getInvoice` / `downloadInvoiceCsv` / `getCostExplorerUsage`; Admin API v2 GET /api/atlas/v2/orgs/{orgId}/invoices (Org Billing Viewer+). PlanetScale: dashboard only for billing — https://app.planetscale.com/<org>/settings/billing (per-database/branch line items, Stripe invoices); no `pscale billing` subcommand — inventory billed resources with `pscale database list` and `pscale branch list`; billing API endpoints exist (service token); Vantage integration for budgets.",
  "keywords": [
    "atlas",
    "atlas clusters",
    "atlas api invoices",
    "atlas setup",
    "atlas deployments",
    "mongosh",
    "mongodump",
    "mongorestore",
    "mongoimport",
    "mongodb+srv://",
    ".mongodb.net",
    "MONGODB_URI",
    "MONGODB_ATLAS_PUBLIC_API_KEY",
    "mongodbatlas (terraform)",
    "pscale",
    "pscale connect",
    "pscale shell",
    "pscale database create",
    "pscale branch create",
    "pscale deploy-request",
    "pscale service-token",
    ".psdb.cloud",
    "pscale_pw_",
    "PLANETSCALE_SERVICE_TOKEN",
    "@planetscale/database",
    "planetscale (terraform)"
  ],
  "hint": "PlanetScale: NO free tier ($5 Postgres/$39 Vitess floor per DB+branch, card req'd), no cap, alerts OFF by default. Atlas: M0 free (512MB/100ops/s throttle); Flex hard-caps $30/mo; Dedicated UNCAPPED + autoscale default-ON (up in 10min, down after 24h) + $0.09/GB egress = #1 trap.",
  "conflicts": [
    "PlanetScale egress: Report A claimed 'no usage meter to blow' and omitted egress; Report B listed $0.06/GB. RESOLVED via https://planetscale.com/docs/postgres/pricing — egress IS metered on Postgres: $0.060/GB us-east-1 beyond 100 GB/mo (production) or 10 GB/mo (single-node/dev); private link $0.01/GB. Report B correct; Vitess plans page shows no egress line.",
    "PlanetScale storage $0.50/GB/instance (A) vs $0.125/GB-mo (B): BOTH confirmed official, different meters — docs/planetscale-plans: '10 GB included; $0.50 per instance per additional 1 GB' (usage overage); docs/postgres/pricing: $0.125/GB-mo us-east-1 for provisioned Postgres disk. Not an error; label by engine/meter.",
    "Atlas M10 monthly: A ~$58/mo vs B ~$56.94/mo — same official $0.08/hr, different hours-per-month conventions; quote the hourly rate.",
    "Atlas autoscale scale-up window: A says 10 min universally; B says M10/M20 use ~20-min windows with burstable-CPU rules (M30+ 10 min). No official tie-break fetched; B is more granular, both agree on up-fast/down-slow (24 hr + ~4 hr sustained).",
    "Atlas M0 idle policy: A '30 days of zero connections → auto-pause' vs B 'may deactivate idle clusters (ToS)'. Not tie-broken; safe merged claim: idle M0 clusters get paused.",
    "PlanetScale Vitess dev-branch hours (B: ~1440 h incl, ~$0.014/hr after) appear only in Report B — plausible, unverified this pass.",
    "Verified identical in both (no fetch needed): Flex $8–$30 tiers + $30 hard cap, M0 quotas (512 MB/100 ops/s/500 conns/10 GB-7day), Postgres PS-5 $5/$15, Vitess PS-10 $39, Metal M-10 $50, backups $0.023/GB-mo, $100-invoice SKU gate, no-free-tier, 75%/100% opt-in alerts, serverless EOL Jan 22 2026, row-billing removal."
  ],
  "sources": [
    "https://www.mongodb.com/pricing",
    "https://www.mongodb.com/docs/atlas/reference/free-shared-limitations/",
    "https://www.mongodb.com/docs/atlas/billing/atlas-flex-costs/",
    "https://www.mongodb.com/docs/atlas/cluster-autoscaling/",
    "https://www.mongodb.com/docs/atlas/billing/data-transfer-costs/",
    "https://www.mongodb.com/docs/atlas/billing/",
    "https://www.mongodb.com/docs/atlas/flex-migration/",
    "https://www.mongodb.com/docs/atlas/reference/alert-conditions/",
    "https://www.mongodb.com/docs/atlas/cli/current/command/atlas-api-invoices/",
    "https://planetscale.com/pricing",
    "https://planetscale.com/pricing.md (fetched 2026-07-17: PS-5 $5/$15, PS-10 Vitess $39, M-10 $50)",
    "https://planetscale.com/docs/planetscale-plans (fetched 2026-07-17: no free plan, $0.50/GB/instance, $0.023/GB-mo backups, PS-160/M-320 gate)",
    "https://planetscale.com/docs/postgres/pricing (fetched 2026-07-17: $0.125/GB-mo disk, $0.060/GB egress after 100 GB, $0.01/GB private, IOPS/throughput rates)",
    "https://planetscale.com/docs/billing",
    "https://planetscale.com/docs/plans/hobby-plan-deprecation-faq",
    "https://planetscale.com/changelog/monthly-spend-alerts"
  ]
}
```

## Engine A — Claude (raw)

MONGODB ATLAS + PLANETSCALE — PRICING/QUOTA FACTSHEET (verified July 2026)

====================================================================
PART A: MONGODB ATLAS
====================================================================

A1. METERED BILLING DIMENSIONS
- Dedicated cluster compute: billed per hour per cluster tier (M10+), price varies by cloud provider/region. Source: https://www.mongodb.com/pricing
- Flex cluster: billed per hour, tiered by ops/sec usage, capped monthly. Source: https://www.mongodb.com/pricing
- Storage: included range per tier; extra storage and IOPS billed on dedicated tiers. Source: https://www.mongodb.com/docs/atlas/billing/cluster-configuration-costs/
- Data transfer (egress): per GB — same-region, cross-region, and internet rates at cloud-provider pass-through prices; ingress free. Source: https://www.mongodb.com/docs/atlas/billing/data-transfer-costs/
- Backup storage: per GB, region-dependent (dedicated only). Source: https://www.mongodb.com/pricing
- Atlas Data Federation / Atlas SQL: $5/TB processed, 10 MB minimum per query. Source: https://www.mongodb.com/pricing
- Search/Vector Search nodes: hourly (from ~$0.12/hr for S20). Atlas Stream Processing: hourly per SP tier ($0.06–$2.49/hr). App Services: per-request ($0.000002/request), compute ($0.000000005/ms), sync ($0.00000008/min). Source: https://www.mongodb.com/pricing
- RECENT CHANGE: "Serverless instances" (pay-per-RPU) are GONE. Creation blocked Feb 2025, unsupported March 2025, auto-migrated to Free/Flex/Dedicated starting May 5, 2025; final API end-of-life Jan 22, 2026. M2/M5 shared tiers also removed (auto-migrated to Flex May 25, 2025). Sources: https://www.mongodb.com/docs/atlas/flex-migration/ , https://registry.terraform.io/providers/mongodb/mongodbatlas/latest/docs/guides/serverless-shared-migration-guide

A2. FREE TIER (M0 / "Free cluster") — EXACT QUOTAS
Source: https://www.mongodb.com/docs/atlas/reference/free-shared-limitations/
- Storage: 512 MB (0.5 GB) max
- Throughput: 100 operations/sec max
- Data transfer: 10 GB in AND 10 GB out per rolling 7-day period (no charge; hard throttle)
- Connections: 500 max
- Databases: 100 max; Collections: 500 max total
- Sort in memory: 32 MB; aggregation pipeline max 50 stages; no allowDiskUse; no server-side JS ($where, map-reduce)
- 1 free cluster per project; shared RAM/vCPU; MongoDB version auto-upgraded (8.0)
- No backups, no sharding, no private endpoints/peering, limited metrics
- Auto-pauses after 30 days of zero connections
- Free forever, no time limit. Source: https://www.mongodb.com/pricing

A3. PAID PLANS
Source: https://www.mongodb.com/pricing
- Flex: $0.011/hr base (~$8/mo) for 0–100 ops/sec; $0.0205/hr (~$15/mo) 100–200; $0.0288/hr (~$21/mo) 200–300; $0.0356/hr (~$26/mo) 300–400; $0.0411/hr (~$30/mo) 400–500 ops/sec. 5 GB storage included. HARD-CAPPED at $30/mo per cluster; 500 ops/sec ceiling. No data-transfer charges on Free/Flex.
- Dedicated (hourly, AWS us-east-1 reference): M10 $0.08/hr (2 GB RAM, 2 vCPU, 10–128 GB) ≈ $58/mo; M20 $0.20/hr; M30 $0.54/hr; M40 $1.04/hr; M50 $2.00/hr; M60 $3.95/hr; M80 $7.30/hr; M140 $10.99/hr; M200 $14.59/hr; M300 $21.85/hr; M400 $22.40/hr; M700 $33.26/hr.
- Data transfer overage (AWS, dedicated tiers): ~$0.01/GB same region (and per cross-AZ direction), ~$0.02/GB+ cross-region, ~$0.09/GB internet egress (provider pass-through; up to ~$0.20/GB some regions/providers). Sources: https://www.mongodb.com/docs/atlas/billing/data-transfer-costs/ , https://www.mongodb.com/docs/atlas/billing/data-federation/ (confirms AWS $0.01/GB same-region), https://www.cloudzero.com/blog/mongodb-pricing/

A4. AUTOSCALING: UP-FAST, DOWN-SLOW (billing-relevant)
Source: https://www.mongodb.com/docs/atlas/cluster-autoscaling/
- ON BY DEFAULT for UI-created clusters (tier + storage + scale-down all enabled; API-created clusters need explicit enable).
- Scale UP (fast): triggers if CPU >90% for 10 min, CPU >75% for 1 hr, memory >90% for 10 min, or memory >75% for 1 hr. Predictive autoscaling (M30+) can jump 2 tiers BEFORE a forecasted spike.
- Scale DOWN (slow): requires ALL of: no scale-down in past 24 hr, no provision/unpause in past 24 hr, CPU <45% and cache <90% and projected memory <60% sustained over last 10 min AND last 4 hours.
- Trap: if storage autoscaling forces a bigger tier than your max bound, Atlas RAISES your max and DISABLES scale-down until you re-enable it. Storage autoscaling never scales storage back down.
- Net effect: one traffic spike doubles your hourly rate within ~10 minutes; you stay at that rate for at least 24 hours.

A6. SPEND CAPS
- NO hard spend cap on dedicated clusters. Alerts only: "Daily billed amount" and per-project monthly bill threshold alerts, configurable at org/project level; not preconfigured with dollar thresholds by default. Sources: https://www.mongodb.com/docs/atlas/reference/alert-conditions/ , https://www.mongodb.com/docs/atlas/billing/
- Structural caps exist only per-cluster-type: M0 is $0 forever; Flex is hard-capped at $30/mo per cluster (throttles at 500 ops/sec instead of billing more). Source: https://www.mongodb.com/pricing
- Bounding tools: set autoscaling max tier, pause clusters (`atlas clusters pause`, M10+ only), billing alerts via API eventTypeName PENDING_INVOICE_OVER_THRESHOLD.

A7. CHECK USAGE/SPEND
- Dashboard: https://cloud.mongodb.com → Organization → Billing (invoices, Cost Explorer). Docs: https://www.mongodb.com/docs/atlas/billing/invoices/
- CLI: `atlas api invoices listInvoices`, `atlas api invoices listPendingInvoices`, `atlas api invoices getInvoice`, `atlas api invoices downloadInvoiceCsv`, Cost Explorer via `atlas api invoices createCostExplorerQueryProcess` / `getCostExplorerUsage`. Docs: https://www.mongodb.com/docs/atlas/cli/current/command/atlas-api-invoices/
- Admin API: GET /api/atlas/v2/orgs/{orgId}/invoices (roles: Org Billing Viewer/Admin or Org Owner). Docs: https://www.mongodb.com/docs/atlas/architecture/current/billing-data/

A8. SHELL-COMMAND DETECTION KEYWORDS
- CLI names: `atlas` (Atlas CLI), `mongosh`, `mongodump`, `mongorestore`, `mongoexport`, `mongoimport`
- Subcommands: `atlas clusters create`, `atlas clusters list`, `atlas clusters pause`, `atlas api invoices`, `atlas setup`, `atlas deployments`
- Connection strings: `mongodb+srv://` , `.mongodb.net`
- Env/config: MONGODB_URI, MONGODB_ATLAS_PUBLIC_API_KEY, terraform provider `mongodbatlas`

====================================================================
PART B: PLANETSCALE
====================================================================

B1. METERED BILLING DIMENSIONS
Sources: https://planetscale.com/pricing , https://planetscale.com/docs/planetscale-plans
- Compute cluster size (SKU) per instance per month, prorated hourly (PS-5 … PS-2560; Metal M-10 … M-7680); price varies by arm64 vs x86-64, region, engine (Vitess/Postgres), HA vs single-node.
- Storage (network-attached): 10 GB included, then $0.50/GB per instance per month (so ~$1.50/GB effective on a 3-node HA production branch; $0.50/GB on a 1-node dev branch). Metal: storage bundled into the NVMe SKU price.
- User-scheduled backups: $0.023/GB-month.
- Read-only regions, extra branches: billed as additional instances/resources.
- ROW READS/WRITES BILLING: REMOVED. Historical context: the old Scaler plan ($29/mo) billed 500M row reads / 50M row writes included, overage $1.50 per 10M rows read and $1.50 per 1M rows written. Scaler was deprecated in favor of resource-based Scaler Pro (introduced 2023), and Scaler Pro was later renamed "Base." As of July 2026 there is NO per-row billing meter — you pay for cluster resources, not query volume. Sources: https://planetscale.com/docs/plans/scaler-pro-upgrade-faq , https://planetscale.com/blog/introducing-new-planetscale-pricing , https://planetscale.com/changelog/pricing-update

B2. FREE TIER
- NONE. "PlanetScale does not offer a free plan, previously known as the 'Developer' or 'Hobby' plan." Hobby tier was removed April 8, 2024. All orgs require a valid payment method (credit/debit; no prepaid cards). Sources: https://planetscale.com/docs/planetscale-plans , https://planetscale.com/docs/billing
- Cheapest entry: single-node Postgres PS-5 at $5/month. Source: https://planetscale.com/pricing

B3. PAID PLANS (verified on https://planetscale.com/pricing and https://planetscale.com/docs/planetscale-plans, July 2026)
- Base plan (self-serve; formerly "Scaler Pro" — renamed): resource-based. Includes 10 GB storage, 1 production branch, 3 AZs, unmetered connections, backups every 12 hr, 7-day Query Insights, 6-month audit logs.
  - Postgres single node: from $5/mo (PS-5).
  - Postgres HA 3-node (arm64, us-east-1): PS-5 $15, PS-10 $30, PS-20 $50, PS-40 $83, PS-80 $148, PS-160 $286, PS-320 $570, PS-640 $1,135, PS-1280 $2,265, PS-2560 $4,529/mo.
  - Vitess (MySQL) HA / x86-64 tiers: PS-10 $39, PS-20 $59, PS-40 $99, PS-80 $179, PS-160 $349, PS-320 $699 … PS-2560 $5,599/mo.
  - Metal (local NVMe, storage included): from M-10 at $50/mo (arm64) / $60 (x86-64) up to M-7680 at $26,869–$47,229/mo. Self-serve capped at PS-160 / M-320 SKUs until you've paid ≥$100 in invoices.
  - Overage: storage $0.50/GB/instance/mo beyond 10 GB; scheduled backups $0.023/GB-mo.
- Enterprise: custom pricing; single-tenant or PlanetScale Managed (your AWS/GCP account).

B4/A5 combined below.

B6. SPEND CAPS
- NO hard cap. Email spend alerts only, OFF by default: on the org billing page, check "Enable spend alerts" and set a max budget; org admins get email at 75% and 100% of that amount. Nothing is stopped or throttled. Sources: https://planetscale.com/docs/billing , https://planetscale.com/changelog/monthly-spend-alerts
- Soft structural cap: cluster sizes limited to PS-160/M-320 until $100 invoice history. Source: https://planetscale.com/docs/planetscale-plans

B7. CHECK USAGE/SPEND
- Dashboard: https://app.planetscale.com/<org>/settings/billing (usage + invoices with per-database/branch line items). Docs: https://planetscale.com/docs/billing
- API: invoices/billing endpoints in the PlanetScale API (OAuth or service token). Source: https://planetscale.com/changelog/billing-api-endpoints
- CLI: `pscale` has no billing subcommand; use `pscale database list`, `pscale branch list`, `pscale size-cluster list` / `pscale database show` for resource inventory; billing itself is dashboard/API.
- Third-party: Vantage integration for cost reports/budget alerts. https://planetscale.com/docs/integrations/vantage

B8. SHELL-COMMAND DETECTION KEYWORDS
- CLI name: `pscale`
- Subcommands: `pscale auth login`, `pscale database create`, `pscale branch create`, `pscale connect`, `pscale shell`, `pscale deploy-request`, `pscale password create`, `pscale service-token`, `pscale org switch`
- Connection strings: `.psdb.cloud` (Vitess), `.horizon.psdb.cloud` / postgres hosts on `psdb.cloud`; env vars PLANETSCALE_SERVICE_TOKEN, DATABASE_URL with `pscale_pw_` password prefix
- Mgmt tooling: terraform provider `planetscale`, `@planetscale/database` (JS serverless driver)

====================================================================
PART C: WHAT AN INDIE-DEV APP BLOWS FIRST (Q4)
====================================================================
- Atlas M0: the 100 ops/sec limit is hit first for any app with real traffic — a modest API doing ~10 req/sec with ~10 DB ops each saturates it and gets throttled (not billed). Next is 512 MB storage (~a few hundred thousand JSON docs), then the 10 GB out / 7 days transfer cap if serving large payloads. Source: https://www.mongodb.com/docs/atlas/reference/free-shared-limitations/
- Atlas Flex: the 500 ops/sec ceiling — cost silently climbs $8→$30/mo as ops rise, then throttles. Source: https://www.mongodb.com/pricing
- Atlas dedicated: DATA TRANSFER is the classic first blown meter — cross-AZ replica reads at $0.01/GB/direction and $0.09/GB internet egress; documented cases of a $500/mo M40 with a $1,200/mo transfer bill. Source: https://polystreak.com/blog/atlas-data-transfer-cost-optimization , https://www.mongodb.com/docs/atlas/billing/data-transfer-costs/
- PlanetScale: no usage meter to blow (no per-row billing) — the first surprise is the flat floor itself ($39/mo Vitess PS-10 HA; $5 minimum Postgres single node), then STORAGE beyond 10 GB at $0.50/GB × 3 instances = $1.50/GB/mo on an HA production branch (e.g., logging table grows to 110 GB → +$150/mo). Sources: https://planetscale.com/pricing , https://planetscale.com/docs/planetscale-plans

====================================================================
PART D: COST TRAPS FOR AI-AGENT-BUILT APPS (Q5)
====================================================================
Atlas:
1. Autoscaling default-ON + up-fast/down-slow: an agent's retry loop or unindexed collection scan pins CPU >90% for 10 min → tier doubles (M10 $58/mo → M20 $146/mo); scale-down waits ≥24 hr of sustained low usage. Storage autoscaling can silently raise your max tier AND disable scale-down. https://www.mongodb.com/docs/atlas/cluster-autoscaling/
2. Agent scaffolds "production-grade" defaults: choosing M30 ($0.54/hr ≈ $390/mo) instead of M0/Flex; multi-region clusters multiply data-transfer meters.
3. Polling/change-stream loops that read full documents from another region/AZ rack up per-GB egress invisibly (no ops throttle on dedicated). $0.09/GB internet egress.
4. Leaked Atlas API keys (org owner scope) allow creating clusters programmatically — cryptomining-sized M700 at $33/hr = ~$24k/mo; no hard cap will stop it. Mitigate: IP access lists on API keys, billing alerts.
5. Serverless-era code/Terraform still referencing serverless instances silently creates Flex/Dedicated post-migration (creation APIs removed Jan 22, 2026). https://www.mongodb.com/docs/atlas/flex-migration/
PlanetScale:
6. No free tier: an agent following an outdated tutorial ("PlanetScale Hobby is free") signs the card up for a minimum ~$5–$39/mo per database; every scratch/test database is a separate billed cluster.
7. Dev branches are extra instances: an agent that creates a branch per PR and never deletes them bills $0.50/GB storage + instance time each. Detection: `pscale branch list`.
8. Good news: infinite query loops / leaked read-heavy keys do NOT increase the bill (no row-read billing anymore) — they only degrade performance. But an agent-driven log/vector table blowing past 10 GB bills $1.50/GB/mo (HA) with alerts off by default.
9. Leaked `pscale_pw_` passwords or service tokens allow creating new (billed) databases/branches; spend alerts are opt-in email only.

====================================================================
KEY SOURCE URLS
====================================================================
- https://www.mongodb.com/pricing (Free/Flex/Dedicated prices, add-ons)
- https://www.mongodb.com/docs/atlas/reference/free-shared-limitations/ (M0 exact quotas)
- https://www.mongodb.com/docs/atlas/cluster-autoscaling/ (autoscaling thresholds/timing)
- https://www.mongodb.com/docs/atlas/billing/data-transfer-costs/ (egress meters)
- https://www.mongodb.com/docs/atlas/billing/data-federation/ (AWS $0.01/GB same-region confirmation)
- https://www.mongodb.com/docs/atlas/flex-migration/ (serverless/M2/M5 deprecation timeline; final EOL Jan 22, 2026)
- https://www.mongodb.com/docs/atlas/reference/alert-conditions/ + https://www.mongodb.com/docs/atlas/billing/ (alerts only, no hard cap)
- https://www.mongodb.com/docs/atlas/cli/current/command/atlas-api-invoices/ (CLI billing commands)
- https://planetscale.com/pricing (current SKU prices)
- https://planetscale.com/docs/planetscale-plans (Base plan contents, no free plan, storage $0.50/GB, backup $0.023/GB)
- https://planetscale.com/docs/billing + https://planetscale.com/changelog/monthly-spend-alerts (spend alerts 75%/100%, opt-in)
- https://planetscale.com/docs/plans/scaler-pro-upgrade-faq + https://planetscale.com/blog/introducing-new-planetscale-pricing (row reads/writes billing history and removal)
- https://planetscale.com/changelog/billing-api-endpoints (billing via API)

## Engine B — grok (raw)

# Pricing / Quota Factsheet  
**Service group: MongoDB Atlas + PlanetScale**  
**As of: July 2026** (verified against official pages; generated `2026-07-17`)

---

## Recent material changes (with dates)

| When | What |
|------|------|
| **Apr 8, 2024** | PlanetScale **Hobby/Developer free tier retired**. No free plan since. Databases not upgraded went to sleep mode. |
| **Feb 2025** | MongoDB Atlas: **Flex GA**; **new M2/M5 and Serverless instance creation stopped** in UI/CLI/API/IaC. |
| **Mar 2025** | Existing Serverless instances migrated to Free / Flex / Dedicated by usage. |
| **Jan 22, 2026** | Atlas **no longer supports M2, M5, or Serverless instances**. M2/M5 → Flex; Serverless → Free/Flex/Dedicated. |
| **Post-2024 (ongoing)** | PlanetScale **Scaler Pro renamed → Base**. Billing is **resource-based** (cluster + storage + egress). **Row reads/writes are no longer the primary billing meter** on current Base. |

Sources: [Hobby deprecation FAQ](https://planetscale.com/docs/plans/hobby-plan-deprecation-faq), [PlanetScale plans](https://planetscale.com/docs/planetscale-plans), [Flex migration](https://www.mongodb.com/docs/atlas/flex-migration/), [Flex announcement](https://www.mongodb.com/company/blog/product-release-announcements/dynamic-workloads-predictable-costs-mongodb-atlas-flex-tier).

---

# A. MongoDB Atlas

## 1. Metered billing dimensions

| Dimension | Applies to | Notes |
|-----------|------------|--------|
| **Cluster compute hours** | Dedicated (M10+) | Hourly; region + cloud provider dependent |
| **Flex usage (ops/sec tier)** | Flex | Billed hourly by peak ops/sec band; **hard $30/mo cap** |
| **Storage (disk)** | Dedicated | Default included in hourly tier; extra disk/IOPS extra |
| **Data transfer (egress / cross-region / multi-cloud)** | **Dedicated only** | Free & Flex: **not charged for outgoing data** |
| **Backups** | Dedicated (not Free) | Snapshot + continuous backup storage |
| **Add-ons** | Optional | Search, Vector Search, Stream Processing, Data Federation, Online Archive, support, Charts premium, etc. |

Sources: [mongodb.com/pricing](https://www.mongodb.com/pricing), [Flex costs](https://www.mongodb.com/docs/atlas/billing/atlas-flex-costs/), [Data transfer](https://www.mongodb.com/docs/atlas/billing/data-transfer-costs/), [Manage billing](https://www.mongodb.com/docs/atlas/billing/).

---

## 2. Free tier — exact quotas

**Plan name:** Free (formerly **M0**). **$0/hour, free forever** (not a trial).

| Quota | Exact limit |
|-------|-------------|
| Storage | **0.5 GB (512 MB)** — data + indexes (uncompressed BSON + index bytes) |
| Compute | Shared RAM, shared vCPU |
| Throughput | **100 operations/second** (throttled if exceeded) |
| Connections | **500** max |
| Databases / collections | **100 databases**, **500 collections** total |
| Data transfer (quota, not $) | **10 GB in + 10 GB out** per **rolling 7-day** period → throttle/cooldown if exceeded |
| Replica set | **3 nodes** fixed; no sharding |
| Free clusters per project | **1** |
| Backups | **None** (manual `mongodump` only) |
| Auto-scale storage | No |
| Server-side JS | No (`$where`, map-reduce unsupported) |
| Aggregation | Max **50 stages**; no `allowDiskUse` spill |
| Nested docs | Max **50** levels |
| Sort memory | **32 MB** |
| Idle policy | Atlas **may deactivate idle** Free clusters (ToS) |

Sources: [pricing](https://www.mongodb.com/pricing), [Free cluster limits](https://www.mongodb.com/docs/atlas/reference/free-shared-limitations/).

---

## 3. Paid plans — name, price, included, overage

### Flex (serverless-style replacement)

| Item | Value |
|------|--------|
| Base hourly | **$0.011/hour** (~**$8**/30 days at ≤100 ops/s) |
| **Hard monthly cap** | **$30/month** |
| Included | **5 GB** storage, **100 ops/s**, **unlimited data transfer** |
| Overage model | Higher ops/s bands raise hourly rate until cap |

| Ops/sec tier | Total monthly | Hourly |
|--------------|---------------|--------|
| 0–100 (base) | $8.00 | $0.0110 |
| 100–200 | $15.00 | $0.0205 |
| 200–300 | $21.00 | $0.0288 |
| 300–400 | $26.00 | $0.0356 |
| 400–500 | **$30.00 (cap)** | $0.0411 |

Source: [Atlas Flex costs](https://www.mongodb.com/docs/atlas/billing/atlas-flex-costs/), [pricing](https://www.mongodb.com/pricing).

### Dedicated (production)

| Item | Value (list / us-east-style list prices) |
|------|------------------------------------------|
| Entry | **$0.08/hour** → **~$56.94/month** (M10-class) |
| Storage range | **10 GB – 4 TB** (tier-dependent) |
| RAM / vCPU | **2 GB–768 GB RAM**, **2–96 vCPUs** (marketing range) |
| Example AWS historical list | M10 ~$0.08/hr; M20 ~$0.20/hr (region/provider vary; use calculator) |

**Data transfer (Dedicated, typical AWS list on MongoDB AWS page):**

| Type | Approx $/GB |
|------|-------------|
| Same region | **$0.01/GB** |
| Cross-region | **$0.02/GB** |
| Internet | **$0.09/GB** |

Exact rates **vary by cloud provider and region**; tabulate on [data transfer docs](https://www.mongodb.com/docs/atlas/billing/data-transfer-costs/). Free/Flex outgoing **not charged**.

Sources: [pricing](https://www.mongodb.com/pricing), [AWS Atlas pricing](https://www.mongodb.com/products/platform/atlas-cloud-providers/aws/pricing), [cluster config costs](https://www.mongodb.com/docs/atlas/billing/cluster-configuration-costs/).

### Autoscaling behavior (Dedicated only; **not Free/Flex**)

| Direction | Speed / conditions |
|-----------|-------------------|
| **Scale up (reactive)** | M30+: CPU/mem **>90% for 10 min** or **>75% for 1 hour**. M10/M20: similar with **20 min / 1 hour** and burstable “relative CPU” rules. |
| **Scale up (predictive)** | M30+ eligible; learns cyclical load over **≥2 weeks**; may scale **before** spikes; **up only** (no predictive down). |
| **Scale down** | **Slow by design:** requires **4 hours + 10 minutes** sustained low CPU (<45%) **and** memory projection OK; **no scale-down within 24h** of last downscale/provision/unpause; node restart cool-down **12h**. Storage **only scales up** automatically (manual shrink). |
| Default | UI new clusters: auto-scale **on by default**; API: **must enable explicitly**. Set min/max tier to bound cost. |

Source: [Configure auto-scaling](https://www.mongodb.com/docs/atlas/cluster-autoscaling/).

---

## 4. What an indie app blows first

| Path | First limiter | Typical blow point |
|------|---------------|--------------------|
| **Free (M0)** | **512 MB storage** or **100 ops/s** | Seed + indexes + chat/agent logs → storage in days/weeks; polling loops → 100 ops/s throttle immediately. Connections (**500**) next if serverless functions open a client per invoke. |
| **Flex** | Hits **$30 hard cap** before unbounded $ | Sustained **400–500 ops/s** for full month = max $30; storage soft ceiling ~**5 GB**. |
| **Dedicated** | **Hourly tier + auto-scale up**, then **egress** | Wrong default M10+ left on 24/7; auto-scale max too high; app ≠ cluster region → internet egress **~$0.09/GB**. |

---

## 5. Cost traps (AI-agent-built apps)

- **Agent/tool loops** hammering find/update → Free **ops/s throttle** or Flex bill → $30; Dedicated **auto-scales up fast**, **down slow** (hours–days of elevated spend).
- **No connection pooling** (Lambda/Vercel cold starts) → Free **500 connections**.
- **Leaked Atlas API/DB credentials** → cryptominer / dump traffic → Dedicated **egress + CPU scale-up** (no org hard spend stop).
- **Full-document returns / missing projections** → large egress on Dedicated.
- **Vector Search / Search nodes / Stream Processing** left on by scaffold defaults.
- **Multi-region or multi-cloud** clusters for “HA demo”.
- **Continuous backup + large disk** after storage auto-scale (disk **up only**).
- Creating **Dedicated** via UI defaults with auto-scale max far above M10.

---

## 6. Spend caps

| Mechanism | Hard stop? | Default? |
|-----------|------------|----------|
| **Flex monthly $30** | **Yes — hard cap** | Built into product |
| **Free M0** | N/A ($0); performance **throttles** | — |
| **Dedicated / org spend** | **No hard cap** — billing continues | **Alerts only** (you configure USD thresholds: e.g. monthly exceed, daily increase) |
| Auto-scale | Soft bound via **max cluster tier** you set | UI often enables scale-up with max = one tier above |

Source: [Flex costs](https://www.mongodb.com/docs/atlas/billing/atlas-flex-costs/), [Billing quota management](https://www.mongodb.com/docs/atlas/billing/) (“billing alerts … when a bill has exceeded a USD limit”), [billing breakdown](https://www.mongodb.com/docs/atlas/billing/billing-breakdown-optimization/).

---

## 7. How to check usage / spend

| Channel | Where / command |
|---------|-----------------|
| Dashboard | `https://cloud.mongodb.com` → **Organization → Billing → Overview** (pending invoice, Cost Explorer) |
| Invoices | Billing → Invoices (cluster, storage, transfer, backup line items) |
| CLI | `atlas api invoices listInvoices` · `atlas api invoices listInvoicePending` · `atlas api invoices getInvoice` · `atlas api invoices getCostExplorerUsage` |
| API | Atlas Admin API v2 invoices / cost explorer endpoints (same as CLI wrappers) |
| Calculator | https://www.mongodb.com/pricing/calculator |

Sources: [Manage billing](https://www.mongodb.com/docs/atlas/billing/), [atlas api invoices](https://www.mongodb.com/docs/atlas/cli/current/command/atlas-api-invoices/).

---

## 8. Shell-command keywords (CLI only)

```
atlas
atlas api invoices
atlas api invoices listInvoices
atlas api invoices listInvoicePending
atlas api invoices getInvoice
atlas api invoices getCostExplorerUsage
atlas clusters
atlas api clusters
atlas metrics
atlas processes
atlas alerts
atlas events
mongosh
mongodump
mongorestore
```

---

# B. PlanetScale

## 1. Metered billing dimensions (current Base model)

**As of 2026, PlanetScale is resource-based, not row-read/write metered.**

| Dimension | Meter |
|-----------|--------|
| **Cluster instance size** | PS-* / M-* SKU, prorated to the millisecond |
| **Architecture** | Single-node vs HA (1 primary + 2 replicas) |
| **Storage** | Network-attached: first **10 GB** included, then **$/GB/instance**; Metal storage **included in instance price** |
| **Egress** | Public egress beyond included GB; private link traffic |
| **Backups** | Included = **2× disk size**; overage **$0.023/GB-month** |
| **Extra production branches** | Full cluster price each |
| **Dev branches** | Vitess: included hours then ~$0.014/hr; Postgres: **$5/mo** per PS-DEV |
| **Add-ons** | SSO **$199/mo**, Business support, extra replicas (~1/3 of 3-node price), dedicated PgBouncer, read-only regions (Vitess) |
| **IOPS / throughput** (AWS EBS) | Only if raised above **3000 IOPS / 125 MiB/s** |

**Legacy (historical only):** Scaler-era **row reads / row writes** ($/billion reads, $/million writes). **Not how Base bills in 2026.**

Sources: [pricing.md](https://planetscale.com/pricing.md) (generated 2026-07-17), [plans](https://planetscale.com/docs/planetscale-plans), [Postgres pricing](https://planetscale.com/docs/postgres/pricing).

---

## 2. Free tier

**None.** Explicit docs: *“PlanetScale does not offer a free plan, previously known as the Developer or Hobby plan.”*  
Hobby retired **April 8, 2024**. All databases need a paid subscription (Base minimum).

Sources: [plans — Free plan](https://planetscale.com/docs/planetscale-plans), [Hobby deprecation FAQ](https://planetscale.com/docs/plans/hobby-plan-deprecation-faq).

---

## 3. Paid plans — name, price, included, overage

### Naming map (post-2024)

| Old name | Current |
|----------|---------|
| Hobby / Developer (free) | **Removed** |
| Scaler / Scaler Pro | **Base** (self-serve) |
| Enterprise | **Enterprise** / Managed |

### Base — Postgres (AWS us-east-1, from official `pricing.md` 2026-07-17)

| Config | Entry price | Includes (typical) |
|--------|-------------|---------------------|
| **Single node PS-5** | **$5/month** | 1/16 vCPU, 512 MB; **10 GB** disk included; **10 GB** egress (non-HA) |
| **HA PS-5** | **$15/month** | 3 nodes; **100 GB** egress |
| **Metal** | **from $50/month** (M-10 arm 10 GiB) | NVMe storage included in price |
| Storage overage (network-attached) | **$0.50 per GB per instance** (plans page); detailed regional EBS e.g. us-east-1 **$0.125/GB-month** on Postgres pricing page for configured disk | HA multiplies instances |
| Public egress overage | **~$0.06/GB** us-east-1 (table: $0.060) | After 100 GB (prod HA) or 10 GB (PS-5 non-HA / dev) |
| Private connection traffic | **$0.01/GB** in+out | After included private allowance |
| Backup overage | **$0.023/GB-month** | After 2× disk included |

### Base — Vitess / MySQL-compatible (us-east-1)

| SKU | Monthly (3-node) |
|-----|------------------|
| **PS-10** | **$39** |
| PS-20 | $59 |
| PS-40 | $99 |
| PS-80 | $179 |
| … | up to multi-k$ |
| Metal | from hundreds $ (e.g. M-160 configs) |

Vitess: **no single-node**; production HA only. Storage: **10 GB included**, then **$0.50/GB/instance** (HA ≈ **$1.50/GB** effective for 3 nodes). Dev branch hours: **2× hours in month** included (~**1440 h** / 30-day month), then ~**$0.014/h**.

### Enterprise

Custom / % of infra (Managed in your AWS/GCP). Not self-serve list prices.

Sources: [planetscale.com/pricing](https://planetscale.com/pricing), [pricing.md](https://planetscale.com/pricing.md), [Postgres pricing](https://planetscale.com/docs/postgres/pricing), [plans](https://planetscale.com/docs/planetscale-plans).

---

## 4. What an indie app blows first

| Path | First limiter | Usage sketch |
|------|---------------|--------------|
| **Cheapest path** | **Card-on-file + $5/mo minimum** (Postgres single-node) | No free sandbox; day-1 cost is the SKU, not queries |
| **Postgres $5 single-node** | **CPU/memory (1/16 vCPU, 512 MB)** then **10 GB egress** | Agent chatty reads or large result sets → egress $0.06/GB; OOM/throttle on tiny instance |
| **Vitess “prod-like”** | **$39/mo PS-10** fixed floor | Overkill for side projects; branch sprawl multiplies SKUs |
| **Storage autoscaling on** | Disk growth → **$0.50/GB × nodes** | Log tables / embeddings without retention |
| **Extra branches** | Each prod branch = **full cluster $** | AI scaffolds creating many production branches |

**Row reads/writes:** historical Scaler meter; **do not plan 2026 budgets on row IO** unless you are on a frozen legacy contract (unlikely).

---

## 5. Cost traps (AI-agent-built apps)

- Scaffold creates **Vitess HA PS-10+** instead of **Postgres $5 single-node**.
- **Leaked service token / password** → dump or spam writes; **no hard spend stop**, only email at 75%/100% of alert.
- **Infinite agent SQL loops** on under-indexed tables → need bigger SKU (fixed step-up, not per-row bill).
- **Storage autoscaling** left on with unbounded log/event tables.
- **Multiple production branches** from “preview env” bots.
- **Egress** when app region ≠ DB region or large unprojected SELECTs (100 GB free then **$0.06/GB**).
- Leaving **dev branches** running 24/7 past included hours (Vitess) or at $5 each (Postgres).
- Enabling **SSO ($199)** or dedicated **PgBouncer** from a template.

---

## 6. Spend caps

| Mechanism | Hard stop? | Default? |
|-----------|------------|----------|
| **Spend alerts** | **No** — email only at **75%** and **100%** of max monthly budget you set | **Off** until you enable on billing page |
| Cluster size | Soft (you pick SKU; max SKUs gated until **≥$100** paid invoice) | — |
| Card required | Yes for all plans | Required |

Source: [Billing — Spend management](https://planetscale.com/docs/billing).

---

## 7. How to check usage / spend

| Channel | Where |
|---------|--------|
| Dashboard | https://app.planetscale.com → **Org → Settings → Billing** (`https://app.planetscale.com/~/settings/billing/`) |
| Invoices | Billing table → Download (Stripe PDF) / View details |
| Insights | Per-DB **Insights** (rows read/written for **performance**, not bill meters) |
| CLI | No dedicated `pscale billing` subcommand in public CLI map; use dashboard. CLI: `pscale database`, `pscale branch`, `pscale org`, `pscale api` |
| Machine pricing | https://planetscale.com/pricing.md |

Sources: [Billing docs](https://planetscale.com/docs/billing), [CLI](https://planetscale.com/docs/cli).

---

## 8. Shell-command keywords (CLI only)

```
pscale
pscale auth
pscale org
pscale org list
pscale org show
pscale org switch
pscale database
pscale database list
pscale database create
pscale database delete
pscale branch
pscale branch list
pscale branch create
pscale deploy-request
pscale connect
pscale shell
pscale api
pscale audit-log
```

---

# Side-by-side (indie-relevant)

| | **MongoDB Atlas** | **PlanetScale** |
|--|-------------------|-----------------|
| Free forever? | **Yes — M0 512 MB** | **No (since Apr 2024)** |
| Cheapest paid | Flex **$8–$30** hard-capped | Postgres single-node **$5** |
| Serverless-ish | **Flex** (Serverless **gone** Jan 2026) | N/A — pick SKU |
| Classic trap | Egress + auto-scale on Dedicated | Paying $39+ HA for a hobby DB |
| Hard $ ceiling | **Flex $30 only** | **None** (alerts only) |
| Row R/W billing | No (ops/s or instance hours) | **Legacy only; not current Base** |

---

## Source index (primary)

**MongoDB**  
- https://www.mongodb.com/pricing  
- https://www.mongodb.com/docs/atlas/billing/atlas-flex-costs/  
- https://www.mongodb.com/docs/atlas/reference/free-shared-limitations/  
- https://www.mongodb.com/docs/atlas/billing/data-transfer-costs/  
- https://www.mongodb.com/docs/atlas/cluster-autoscaling/  
- https://www.mongodb.com/docs/atlas/billing/  
- https://www.mongodb.com/docs/atlas/flex-migration/  
- https://www.mongodb.com/products/platform/atlas-cloud-providers/aws/pricing  

**PlanetScale**  
- https://planetscale.com/pricing  
- https://planetscale.com/pricing.md  
- https://planetscale.com/docs/planetscale-plans  
- https://planetscale.com/docs/postgres/pricing  
- https://planetscale.com/docs/billing  
- https://planetscale.com/docs/plans/hobby-plan-deprecation-faq  

*Prices vary by region/cloud; always re-check `pricing` / `pricing.md` and the Atlas calculator before committing production spend.*
