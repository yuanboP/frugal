# Metered cloud providers — quotas, plans, traps (researched 2026-07)

Factsheets for 10 metered cloud providers, focused on what agent-built apps actually hit: free-tier walls, first-quota-blown scenarios, cost traps, and how to check usage. All numbers verified against official pricing/docs pages in July 2026.

**Providers:** [Vercel](#vercel) · [Cloudflare](#cloudflare-developer-platform) · [Neon](#neon) · [Railway](#railway) · [Fly.io](#flyio) · [E2B](#e2b) · [Browserbase](#browserbase) · [GitHub](#github-actions--codespaces--packages--git-lfs) · [Supabase](#supabase) · [AWS / GCP / Azure](#aws--gcp--azure-hyperscaler-slice)

---

## Vercel

### Billing dimensions
- Edge requests (CDN requests, every request incl. static)
- Edge request CPU duration (routing CPU, $/hr)
- Fast data transfer (CDN<->visitor egress, both directions)
- Fast origin transfer (CDN<->functions/blob/ISR, both directions)
- Function invocations
- Active CPU (CPU-hrs, pauses during I/O)
- Provisioned memory (GB-hrs, bills through I/O waits)
- ISR reads/writes (8 KB units, regional)
- Runtime cache reads/writes (8 KB units)
- Image transformations + image cache reads/writes
- Build CPU-minutes (Elastic/Enhanced/Turbo or on-demand concurrency)
- Blob (storage GB-mo, simple/advanced ops, transfer)
- Edge Config reads/writes
- Sandbox (active CPU, memory GB-hrs, creations, network GB, snapshot storage)
- Deploying seats ($20/mo each; viewers free)
- Web analytics / speed insights / observability events
- Drains ($/GB)
- Workflow events + data written/retained
- WAF rate limiting / OWASP inspection
- Queues + service requests (beta SKUs)
- Fixed DX add-ons (SAML, HIPAA, static IPs, etc.)

### Free tier (Hobby)
$0, non-commercial only. Hard caps — exceeding a quota pauses the feature / returns 402 until the 30-day window resets; no overage billing. Monthly quotas:
- 1M edge requests; 1M function invocations
- 4 active-CPU-hrs; 360 GB-hrs provisioned memory
- 100 GB fast data transfer; 10 GB fast origin transfer
- 1M ISR reads / 200K ISR writes (8 KB units)
- 5K image transformations; 300K/100K image cache reads/writes
- 100K/100 Edge Config reads/writes
- Blob: 1 GB storage, 10K simple + 2K advanced ops, 10 GB transfer
- 50K web analytics events; 10K speed insights events (1 project)
- Sandbox: 5 CPU-hrs, 420 GB-hrs memory, 5K creations, 20 GB network, 10 concurrent, 45-min max runtime
- Platform limits: 100 deployments/day, 200 projects, 1 concurrent build, 45-min max build, 300 s max function duration, 50 domains/project, 1-hr log retention
- Note: no monthly build-minute meter exists (old "6,000 build minutes" numbers are stale)

### Plans
| Plan | Price | Included | Overage |
|---|---|---|---|
| Hobby | $0/mo | Quotas above; non-commercial only; hard caps with ~30-day pause on overage | None — feature pauses or returns 402 until cycle resets |
| Pro | $20/mo platform fee (incl. 1 deploying seat) + $20/mo usage credit (expires monthly); extra deploying seats $20/mo; viewers free; 14-day trial | 10M edge requests + 1 TB fast data transfer/mo; everything else pure on-demand drawn against the $20 credit first. Limits: unlimited projects, 6,000 deploys/day, function duration 300 s default / 800 s max (1,800 s beta), up to 500 concurrent builds on-demand, build machines to 30 vCPU/60 GB, 2,000 concurrent sandboxes (24 h max runtime), 1-day log retention | On-demand, regional (cheapest US iad1/cle1/pdx1): invocations $0.60/1M; active CPU $0.128–0.221/CPU-hr; provisioned memory $0.0106–0.0183/GB-hr; edge requests $2.00–3.20/1M; edge request CPU $0.30–0.48/hr; FDT $0.15–0.35/GB; FOT $0.06–0.43/GB; ISR reads $0.40–0.64/1M units, writes $4.00–6.40/1M units; image transforms $0.05–0.0812/1K, cache reads $0.40–0.64/1M, writes $4.00–6.40/1M; builds $0.0035/CPU-min (rounded up per min × vCPUs; Elastic is DEFAULT for new Pro teams so builds bill by default; Standard=4 vCPU/8GB, Enhanced=8/16, Turbo=30/60); blob storage $0.023–0.041/GB-mo, simple ops $0.35–0.56/1M, advanced $4.50–7.00/1M, transfer $0.05–0.117/GB; sandbox CPU $0.128/hr, memory $0.0212/GB-hr, creations $0.60/1M, network $0.15/GB, snapshots $0.08/GB-mo; web analytics $0.03/1K (0 included); observability plus $1.20/1M; drains $0.50/GB; Edge Config reads $3.00/1M, writes $5.00. Add-ons: Speed Insights $10/project, Web Analytics Plus $10, Preview Suffix $100, Adv. Deployment Protection $150, Flags Explorer $250, SAML $300, HIPAA $350, Static IPs $100/project |
| Enterprise | Custom (unofficially ~$25k+/yr entry) | Custom quotas, 99.99% SLA, multi-region, SCIM, managed WAF, custom concurrency | Negotiated |

### What an agent app blows first
During agent iteration: Hobby's 100 deployments/day (push→deploy→fix loops at ~3-4 deploys/hr hit it in a workday; on Pro every push instead bills build CPU-minutes since Elastic is default). Once the app serves traffic: Provisioned Memory 360 GB-hrs — it bills through I/O waits, so a 2 GB instance kept warm by polling or 30-60 s LLM streams burns 360 GB-hrs in ~180 instance-hours (~6 hrs/day); 1M invocations + 1M edge requests fall next (8 browser tabs polling every 5 s ≈ 1.4M req/mo). Smallest absolute quota: 5K image transformations, gone almost immediately on any image-heavy page.

### Sweet spots
- **Hobby:** personal/demo Next.js, <~30k visitors/mo, light API traffic, strictly non-commercial (the fair-use ban on commercial apps is itself the first wall for shipped products).
- **Pro at $20-40/mo:** small production SaaS staying near included 10M edge requests + 1 TB FDT with functions/ISR/images covered by the $20 credit; watch $20/seat stacking.
- **Enterprise:** compliance/multi-region/negotiated egress — cost not the constraint.

### Cost traps
- Provisioned Memory bills during I/O waits while Active CPU pauses — long LLM streaming/proxy routes rack GB-hrs with near-zero CPU; this is the signature Vercel-agent cost trap
- Polling loops hit three meters at once (edge requests $2/1M + invocations $0.60/1M + permanently-warm memory); a poll-every-2s status endpoint ≈ 1.3M req/mo per client
- ISR write storms: short revalidate + non-deterministic output (new Date(), Math.random()) forces a write every revalidation, in 8 KB units at $4+/1M — one 80 KB page = 10 write units
- Every push bills a build on Pro: Elastic machines are the default for new teams, $0.0035/CPU-min rounded UP per minute × vCPUs (4-30); preview deploys count; ~200 commits/day at 2 min on 4 vCPU ≈ $5.60/day
- Sandbox leaks: no sandbox.stop() bills memory until timeout (up to 24 h on Pro, ~$2.73+/instance at 8 vCPU/16 GB); per-test sandbox provisioning burns Hobby's 5K creations and 5 CPU-hrs in an afternoon
- Spend Management is a $200 NOTIFICATION by default, not a cap; auto-pause is opt-in, checks run every few minutes, and paused projects never auto-unpause
- Hobby overage = hard stop: image optimization 402s, sandbox creation pauses, ~30-day lockout on the exceeded feature
- Hobby fair-use: commercial apps risk suspension
- Catch-all middleware without a matcher runs on static assets and can double Fast Origin Transfer
- Verbose JSON/streaming/base64 egress bills FDT $0.15-0.35/GB AND FOT $0.06-0.43/GB; unoptimized 3 MB heroes × 30k views ≈ 90 GB of Hobby's 100
- Forgotten preview deployments keep accruing edge/transfer/build usage per agent branch
- Regional multipliers: same traffic costs ~1.7x in gru1 ($0.221/CPU-hr) vs iad1 ($0.128)

### How to check usage
- CLI: `vercel usage` (current cycle); `vercel usage --from 2026-07-01 --to 2026-07-31 --breakdown daily --format json`; `--scope <team>`
- Dashboard: https://vercel.com/[team]/~/usage (charts per resource) and https://vercel.com/[team]/~/settings/billing (spend management)
- API: `GET https://api.vercel.com/v1/billing/charges?teamId=...&from=...&to=...` with Bearer token (FOCUS JSONL)
- Spend-management webhook fires at 50/75/100% of set amount

### Unresolved conflicts
Research-report disagreements, resolved as noted: Edge Request CPU on Pro has no included allotment (official regional-pricing page wins); Edge Config writes are $5.00 per official docs but the exact unit denominator is unresolved; Standard build machine is 4 vCPU/8 GB (official doc wins); Elastic builds ARE the default for paid teams so builds bill by default; first-quota-blown is phase-dependent (deploy thrash during iteration, memory once serving); several Hobby quotas (10 GB FOT, blob details, snapshot/workflow/WAF numbers) are single-sourced from docs/limits.

### Sources
- https://vercel.com/pricing
- https://vercel.com/docs/pricing (fetched 2026-07-17, last_updated 2026-06-16)
- https://vercel.com/docs/pricing/regional-pricing (fetched 2026-07-17)
- https://vercel.com/docs/builds/managing-builds (fetched 2026-07-17, last_updated 2026-06-24)
- https://vercel.com/docs/plans/hobby
- https://vercel.com/docs/plans/pro-plan
- https://vercel.com/docs/limits
- https://vercel.com/docs/functions/usage-and-pricing
- https://vercel.com/docs/manage-cdn-usage
- https://vercel.com/docs/incremental-static-regeneration/limits-and-pricing
- https://vercel.com/docs/image-optimization/limits-and-pricing
- https://vercel.com/docs/sandbox/pricing
- https://vercel.com/docs/spend-management
- https://vercel.com/docs/cli/usage
- https://vercel.com/docs/limits/fair-use-guidelines
- https://vercel.com/changelog/access-billing-usage-cost-data-api

---

## Cloudflare (Developer Platform)

Covers Workers, KV, D1, Durable Objects, Queues, R2, Pages, Containers, Workers Builds.

### Billing dimensions
- Workers/Pages Functions: requests (per M) + CPU time (per M CPU-ms); wall-clock duration NOT billed; egress free; static asset requests free
- R2: storage GB-month, Class A ops (writes/lists) per M, Class B ops (reads) per M, Infrequent Access retrieval $/GB; egress always $0; deletes free
- KV: keys read/written/deleted + list requests (per M each), storage GB-month
- D1: rows read + rows written (per M), storage GB-month; rows read = rows SCANNED not returned
- Durable Objects: requests, duration GB-s wall-clock while active (unlike Workers), SQLite rows read/written + stored GB (billed since Jan 7 2026), legacy KV-backend read/write units
- Queues: operations (1 op per 64 KB written/read/deleted; ~3 ops per delivered message)
- Workers Builds: build minutes over included; Pages: builds/month (plan-gated)
- Containers (Paid only): memory GiB-s, vCPU-s, disk GB-s while running + regional network egress (NOT free, unlike R2/Workers)
- Workers Logs: events per M; Hyperdrive: queries/day cap on free
- No per-seat billing on the developer platform

### Free tier
Daily quotas reset 00:00 UTC and HARD-FAIL (429/errors, never auto-bills):
- Workers: 100,000 req/day + 10 ms CPU/invocation
- KV: 100k reads, 1,000 writes, 1,000 deletes, 1,000 lists/day; 1 GB storage
- D1: 5M rows read, 100k rows written/day; 5 GB total, 10 DBs, 500 MB/DB
- Durable Objects (SQLite backend only): 100k req/day, 13,000 GB-s/day, 5M rows read/100k written/day, 5 GB
- Queues: 10,000 ops/day (~3,300 msgs), 24h retention
- Workers Logs: 200k events/day; Hyperdrive: 100k queries/day
- Monthly: R2 10 GB-month + 1M Class A + 10M Class B, egress $0 (Standard only; IA has no free tier); Workers Builds 3,000 min/mo (1 concurrent, 20-min timeout)
- Pages: 500 builds/mo, 1 concurrent, unlimited static requests
- Containers: not available on free

### Plans
| Plan | Price | Included | Overage |
|---|---|---|---|
| Workers Free | $0 | 100k req/day, 10 ms CPU/invocation; KV 1k writes/100k reads/day; D1 5M reads/100k writes/day, 5 GB; DO 100k req + 13k GB-s/day (SQLite only); Queues 10k ops/day; Builds 3,000 min/mo | None — limits hard-fail with errors instead of billing |
| Workers Paid | $5/month minimum (covers Workers, Pages Functions, KV, D1, DO, Queues, Containers, Hyperdrive) | 10M requests + 30M CPU-ms/mo (CPU cap 30 s default, up to 5 min); KV 10M reads/1M writes/1M deletes/1M lists, 1 GB; D1 25B rows read/50M written, 5 GB; DO 1M req + 400k GB-s + 25B rows read/50M written + 5 GB; Queues 1M ops, retention to 14 d; Builds 6,000 min, 6 concurrent; Logs 20M events; Containers 25 GiB-h mem + 375 vCPU-min + 200 GB-h disk | Req $0.30/M; CPU $0.02/M CPU-ms; KV reads $0.50/M, writes/deletes/lists $5.00/M, $0.50/GB-mo; D1 $0.001/M read, $1.00/M written, $0.75/GB-mo; DO req $0.15/M, duration $12.50/M GB-s, SQL storage $0.20/GB-mo (KV-backend: reads $0.20/M, writes $1.00/M); Queues $0.40/M; Builds $0.005/min; Logs $0.60/M; Container egress $0.025–0.05/GB by region |
| R2 (pay-as-you-go, no subscription) | $0 base, usage beyond free tier | 10 GB-mo + 1M Class A + 10M Class B free monthly; egress always $0 | Standard: $0.015/GB-mo, Class A $4.50/M, Class B $0.36/M. Infrequent Access: $0.01/GB-mo + 30-day minimum, Class A $9/M, Class B $0.90/M, retrieval $0.01/GB. Usage rounds UP to next billing unit |
| Pages (zone Pro / Business) | Pro $25/mo; Business $250/mo | Pro: 5,000 builds/mo, 5 concurrent; Business: 20,000 builds/mo, 20 concurrent (free: 500/mo) | Builds are plan-gated counts, not metered; Pages Functions bill as Workers requests |

### What an agent app blows first
Free tier: KV writes (1,000/day) blow first for any app writing session/state per request — dead at ~1k daily page views, often within minutes under load. Runners-up: Workers 100k req/day under polling (one 5s-poll client = 17,280 req/day), D1 100k rows written/day (indexes multiply writes; unindexed scans burn the 5M reads/day), Queues ~3,300 msgs/day, Pages 500 builds/mo at ~16 commits/day. Paid tier: the $5 floor holds until DO duration (400k GB-s ≈ one 128 MB object awake ~36 days) from non-hibernating WebSockets, or KV writes at $5/M.

### Sweet spots
- **Free:** prototypes/hobby APIs under ~1.1 req/s sustained with few writes.
- **Workers Paid $5:** nearly all small-to-medium production apps — 10M req + 30M CPU-ms is huge headroom; docs examples: 15M req @7ms ≈ $8/mo, 100M req @7ms ≈ $45/mo; most real bills stay $5–10. D1 paid inclusions (25B reads/50M writes) are effectively never the bottleneck.
- **R2:** $0 egress makes it the right home for large downloads (vs S3).
- Containers require Paid from request one.

### Cost traps
- KV write amplification: writes/deletes/lists cost $5.00/M on paid (reads 10x cheaper); a 1/sec heartbeat writer = 2.6M writes/mo ≈ $13. Free tier: 1,000 writes/day dies in minutes under load
- Durable Objects kept awake bill wall-clock GB-s at $12.50/M: WebSockets accepted without the Hibernation API, or tight setAlarm loops (each alarm = request + row written), accumulate silently
- DO SQLite storage bills since Jan 7 2026 (older estimates omit it): deleting rows isn't enough — call storage.deleteAll() or residual metadata keeps billing GB-month; forgotten per-test DOs charge forever
- D1 rows read = rows SCANNED, not returned: an unindexed SELECT in a polling loop reads millions of rows/hour; every index multiplies rows written per INSERT
- Per-test provisioning is billable: real `wrangler d1 execute` / KV put / R2 put in CI burns quota — use `--local` / Miniflare; R2 bucket churn and multipart parts each count as Class A ops ($4.50/M)
- R2 Infrequent Access is wrong for hot agent scratch data: no free tier, 30-day minimum charged even if deleted early, $0.01/GB retrieval
- Queues poison messages: each retry re-bills read ops on the 3-ops/message baseline at $0.40/M; tune max retries + DLQ
- Auto-deploy on every agent commit: eats Pages 500 free builds/mo (preview + prod each consume one) and Workers Builds 3,000 free min/mo (5-min builds × 20/day exhausts it); build main only
- Containers egress is NOT free ($0.025–0.05/GB by region) — don't assume R2's zero-egress applies platform-wide; don't route large downloads through Containers
- Cache hits and run_worker_first routes still count as Workers requests on the free 100k/day meter
- Free-tier limits hard-fail (429/errors) rather than auto-billing — good for cost control, bad for uptime

### How to check usage
- Dashboard (authoritative for spend): dash.cloudflare.com → Manage Account → Billing → Billable Usage (deep link https://dash.cloudflare.com/?to=/:account/billing) + Budget Alerts; per-product metrics under /:account/workers-and-pages, /:account/workers/d1, /:account/r2/overview
- No first-class `wrangler billing` command; partial CLI: `wrangler d1 info <DB>` (size, rows read/written this period), `wrangler r2 bucket info <bucket>`, `wrangler pages deployment list`, plus meta.rows_read/rows_written on every D1 response
- API: GraphQL Analytics at `POST https://api.cloudflare.com/client/v4/graphql` (datasets workersInvocationsAdaptive, r2StorageAdaptiveGroups, d1AnalyticsAdaptiveGroups, durableObjectsInvocationsAdaptiveGroups, queueConsumerMetricsAdaptiveGroups); billing history: `GET /client/v4/accounts/{account_id}/billing/history`

### Unresolved conflicts
No numeric contradictions — all shared quotas/prices matched and were re-verified live 2026-07-17. Notable resolutions: there is no wrangler billing/spend command (use Billable Usage dashboard/GraphQL); Pages builds (500 free/mo) and Workers Builds minutes (3,000 free/mo) are separate products, both real; Containers/Workers Logs/Hyperdrive numbers and DO SQLite billing (effective Jan 7 2026) verified against official pages though originally single-sourced.

### Sources
- https://developers.cloudflare.com/workers/platform/pricing/
- https://developers.cloudflare.com/r2/pricing/
- https://developers.cloudflare.com/kv/platform/pricing/
- https://developers.cloudflare.com/d1/platform/pricing/
- https://developers.cloudflare.com/durable-objects/platform/pricing/
- https://developers.cloudflare.com/queues/platform/pricing/
- https://developers.cloudflare.com/pages/functions/pricing/
- https://developers.cloudflare.com/pages/platform/limits/
- https://developers.cloudflare.com/workers/ci-cd/builds/limits-and-pricing/
- https://developers.cloudflare.com/changelog/post/2025-12-12-durable-objects-sqlite-storage-billing/
- https://developers.cloudflare.com/billing/manage/billable-usage/
- https://developers.cloudflare.com/analytics/graphql-api/

---

## Neon

Serverless Postgres, neon.com (formerly neon.tech; Databricks-owned).

### Billing dimensions
- Compute: CU-hours (1 CU ≈ 1 vCPU/4 GB RAM; billed only while running, scale-to-zero = $0; every branch compute and each read replica counts)
- Storage (root branches): GB-month, metered hourly, full logical size
- Storage (child branches): GB-month, copy-on-write — min(delta, logical size)
- Instant restore / history (WAL retention): GB-month
- Snapshot storage (manual + scheduled): GB-month
- Public network egress: GB above included allowance
- Private network transfer (Scale only): GB, bidirectional
- Extra branches beyond plan allowance: branch-month, prorated hourly (~$0.002/branch-hour)
- NOT billed: queries/requests, connections, seats/members, projects within limits; invoices under $0.50 not collected

### Free tier
$0, no card, permanent (not a trial).
- Per org: 100 projects
- Per project: 100 CU-hours compute/month (resets monthly), 0.5 GB storage, 10 branches (hard cap), autoscaling max 2 CU (8 GB RAM), autosuspend fixed at 5 min idle (cannot disable), instant restore 6 h (max 1 GB history), 1 manual snapshot, 1-day monitoring retention
- 5 GB public egress/month; Auth: up to 60k MAU; community support only
- Enforcement: exceeding CU-hours or egress SUSPENDS compute until next billing month (no overage billing — dead DB); exceeding 0.5 GB storage makes writes (INSERT/UPDATE/DELETE) fail while reads keep working; data is never deleted

### Plans
| Plan | Price | Included | Overage |
|---|---|---|---|
| Free | $0/mo | 100 projects; per project: 100 CU-hrs/mo, 0.5 GB storage, 10 branches, 2 CU max, 5-min forced autosuspend, 6 h restore; 5 GB egress/mo; 60k MAU auth | None — hard caps: compute/egress overrun suspends compute until next month; storage overrun fails writes |
| Launch | $0 base, pure pay-as-you-go (no monthly minimum since Dec 2025) | 100 projects; 10 branches/project (max 5,000); autoscale to 16 CU (64 GB RAM); autosuspend default 5 min, CAN be disabled; instant restore up to 7 days; 100 manual + scheduled snapshots; 500 GB egress; 1M MAU auth; 3-day monitoring; spend limits (alerts ~80%/100%) | $0.106/CU-hr compute; $0.35/GB-mo storage; $0.10/GB egress past 500 GB; $1.50/branch-mo extras; $0.20/GB-mo restore history; $0.09/GB-mo snapshots. Anchors: 0.25 CU always-on ~$19/mo, 1 CU always-on ~$77/mo compute |
| Scale | $0 base, pure pay-as-you-go (no monthly minimum) | 1,000 projects (soft); 25 branches/project; autoscale to 16 CU, fixed computes to 56 CU (224 GB RAM); autosuspend configurable 1 min → always-on; instant restore up to 30 days; 500 GB egress; 99.95% SLA, SOC 2, HIPAA (BAA), SSO, IP Allow, Private Link at no platform fee; 14-day monitoring + metrics/logs export | $0.222/CU-hr compute (2.1x Launch); $0.35/GB-mo storage; $0.10/GB egress past 500 GB; $0.01/GB private networking (bidirectional); $1.50/branch-mo extras; $0.20/GB-mo restore; $0.09/GB-mo snapshots. 1 CU always-on ~$162/mo |
| Agent plan (platforms provisioning DBs for end users, e.g. Replit/v0 model) | Apply at neon.com/programs/agents; requires Scale org with card on file | Sponsored free org (Neon pays for your free-tier users, ~Free-plan limits per project, 30k projects default) + paid org at $0.106/CU-hr with Scale features; up to ~$25k-30k starting credits | $0.106/CU-hr on the paid org |

### What an agent app blows first
Free plan: the 100 CU-hours/project/month compute budget. A chatty agent (polling, health checks, held-open connection pools) resets the 5-min idle timer so compute never suspends → effectively always-on. At the 0.25 CU floor that burns 100 CU-hrs in ~400 h (~16-17 days); if autoscaling drifts to 0.5-1 CU, ~4-8 days. Then the project is hard-suspended until next month. Second: 5 GB egress (big SELECT dumps, embeddings export, pg_dump, logical replication) — also suspends compute. Third: 0.5 GB storage from chat history/vector tables — writes start failing. On paid plans the same pattern becomes a silent bill instead (~$77/mo per always-on CU on Launch).

### Sweet spots
- **Free:** prototypes, demos, per-test/per-preview DBs, side projects that truly idle (scale-to-zero makes 100 CU-hrs plenty).
- **Launch:** early production/startups, variable traffic, want always-on option — no cliff, just usage billing; official examples ~$2.31 light / ~$23 medium / ~$48 heavier per month.
- **Scale:** production needing SLA/SOC 2/HIPAA/private networking/>16 CU fixed computes or >10 branches per project — only move for the features, since compute is 2.1x Launch's rate.

### Cost traps
- Polling/health-check/cron loops defeat the 5-min autosuspend — any query resets the idle timer; a 1-min cron = 24/7 compute. #1 trap: Free dies mid-month, Launch silently accrues ~$77/mo per always-on CU
- Held-open connection pools / idle clients block scale-to-zero even without queries — use short pool timeouts and Neon's pooled endpoint
- Disabling scale-to-zero "to fix cold starts" during debugging and leaving it off (Launch/Scale)
- Per-PR/per-test branch sprawl: branch #11+ (Launch) / #26+ (Scale) bills $1.50/branch-month each, plus each awake branch compute burns CU-hours and child storage grows — set branch TTL, delete after CI
- Forgotten projects keep billing $0.35/GB-month storage forever at zero compute
- Outbound logical replication: publisher compute never scales to zero while subscribers are connected, and replication traffic counts as egress
- Egress from chatty reads: SELECT *, full-table exports to agent context, vector scans returning whole documents, frequent pg_dump — Free suspends at 5 GB; paid $0.10/GB past 500 GB (prefer in-platform snapshots, which are not egress)
- Autoscaling spikes: parallel agent queries scale compute toward the 2/16 CU cap and CU-hours bill at the scaled size, not the floor
- Long instant-restore windows (7/30 days) on write-heavy/churny agent DBs bill $0.20/GB-month on WAL volume
- Read replicas are full extra computes billing their own CU-hours
- Mitigation: set org spend limits (Launch/Scale, alerts at ~80%/100%), cap autoscaling max CU, keep autosuspend at 5 min (1 min on Scale) for agent workloads

### How to check usage
- Dashboard: https://console.neon.tech → Organization → Billing (charges to date; network transfer only surfaces there after exceeding the included allowance) and Org → Projects page for per-project Compute/Storage/History/Network metrics (~1 h lag)
- API (paid plans): `GET https://console.neon.tech/api/v2/consumption_history/v2/projects?from=<RFC3339>&to=<RFC3339>&granularity=hourly|daily|monthly&org_id=<org>&metrics=compute_unit_seconds,root_branch_bytes_month,child_branch_bytes_month,instant_restore_bytes_month,snapshot_storage_bytes_month,public_network_transfer_bytes,extra_branches_month` with `Authorization: Bearer $NEON_API_KEY` (per-branch variant: .../v2/branches, requires project_ids; poll ≥ ~15 min; does not wake compute)
- CLI (`neon` / alias `neonctl`): NO usage/billing command — use `neon projects list` / `neon branches list` to find forgotten resources, console or API for spend

### Unresolved conflicts
Minor: scheduled snapshots confirmed on BOTH Launch and Scale at $0.09/GB-month (official pricing page); 1 CU always-on Launch ≈ $77/mo (730 h × $0.106 = $77.38, rounding differences only); one report's "186 CU-hrs at 0.25 CU floor" was an arithmetic slip (dropped) — the load-bearing figure of ~400 h / ~16-17 days stands. All headline numbers re-verified live against neon.com/pricing.

### Sources
- https://neon.com/pricing (re-verified via WebFetch 2026-07-17)
- https://neon.com/docs/introduction/plans
- https://neon.com/faqs/free-plan-limits-and-quotas
- https://neon.com/docs/introduction/cost-optimization
- https://neon.com/docs/introduction/monitor-usage
- https://neon.com/docs/guides/consumption-metrics
- https://neon.com/docs/introduction/usage-calculations
- https://neon.com/docs/introduction/spending-limit
- https://neon.com/docs/changelog/2025-12-12 ($5 minimum removed; Launch cut to $0.106/CU-hr)
- https://neon.com/blog/new-usage-based-pricing
- https://neon.com/docs/introduction/agent-plan and https://neon.com/programs/agents
- https://neon.com/docs/cli and https://neon.com/docs/reference/neon-cli

---

## Railway

### Billing dimensions
- CPU: $20/vCPU/mo ($0.000463/vCPU/min), billed per-minute while service runs (idle or not)
- Memory: $10/GB/mo ($0.000231/GB/min)
- Volume (persistent disk): $0.15/GB/mo
- Network egress from services: $0.05/GB (ingress free; private-network traffic between services free)
- Object storage (Buckets): $0.015/GB-month, rounded UP to whole GB-months; S3 ops and bucket egress free
- Railway Agent: LLM tokens passed through at Anthropic rates, drawn from same credit pool; default spend caps $5 (Hobby) / $20 (Pro), cannot be fully removed
- Seats: Pro is $20/mo per seat (official pricing page wording)
- NOT billed: HTTP requests, S3 API ops, bucket egress; builds/PR envs/replicas consume the same compute meters

### Free tier
Two stages:
- **TRIAL** (new signups, no card): one-time $5 credit, expires after ~30 days. Limits: 2 vCPU (shared) / 1 GB RAM / 2 replicas / 0.5 GB volume / 1 GB ephemeral / 4 GB image, 5 services/project, 3 buckets/project, 50 GB-month bucket max; unverified GitHub = Limited Trial (restricted outbound network, no buckets); trial volumes DELETED 30 days after credit expiry.
- **FREE PLAN** (post-trial, reinstated Aug 2025): $1/mo credit, non-rolling. Limits: 1 vCPU / 0.5 GB RAM / 1 replica / 0.5 GB volume / 1 GB ephemeral / 4 GB image, 1 bucket (10 GB-month), API rate limit 100 req/h. When the $1 is spent, workloads stop and bucket access suspends (files kept) until next cycle.
- Reality: 0.5 GB always-on RAM alone ≈ $5/mo = 5x the credit — Free only fits a sleep-heavy serverless toy.

### Plans
| Plan | Price | Included | Overage |
|---|---|---|---|
| Free | $0/mo | $1/mo resource credit (non-rolling); 1 vCPU, 0.5 GB RAM, 1 replica, 0.5 GB volume, 1 bucket (10 GB-mo) | None — workloads stop when the $1 is spent |
| Hobby | $5/mo (charged even if usage is lower; bill = max($5, usage)) | $5/mo usage credit; per-service caps 48 vCPU / 48 GB RAM, 6 replicas, 5 GB volume (self-serve), 100 GB ephemeral, single-developer workspace | $20/vCPU-mo, $10/GB-RAM-mo, $0.15/GB-mo volume, $0.05/GB egress, $0.015/GB-mo buckets |
| Pro | $20/mo per seat (official pricing page: "per seat") | $20/mo usage credit; 1,000 vCPU / 1 TB RAM caps, 42 replicas, volumes to 1 TB self-serve, 30-day logs, higher API limits (10,000 req/h) | Same metered unit rates as Hobby; annual committed-spend discounts available |
| Enterprise | Custom (third-party reports ~$2,000/mo minimum; unverified) | Custom; ~2,400 vCPU / 2.4 TB RAM / 50 replicas / 5 TB volumes, SSO, SLAs | Custom |

### What an agent app blows first
The included usage credit, not a hard resource cap. On Hobby, a typical agent stack (web app + Postgres, ~1-2 GB RAM total always-on) runs ~$15-25/mo metered, so the $5 credit is exhausted in under a week and real overage billing begins; RAM is usually the dominant meter ($10/GB-mo — 2×1 GB always-on ≈ $20/mo before CPU). On Free, the $1/mo credit dies in hours-to-days (0.5 GB always-on ≈ $5/mo). On Trial, the $5 one-time credit lasts ~5-10 days of an always-on app+DB. Second walls: public-URL DB egress at $0.05/GB, then PR/preview environments multiplying the whole stack, then Hobby's hard 5 GB volume cap.

### Sweet spots
- **Trial:** weekend demos only.
- **Free:** one sleep-heavy serverless toy endpoint (no always-on anything, 0 custom domains).
- **Hobby ($5):** solo dev with ONE small always-on service (~0.1 vCPU/256 MB ≈ $4.50/mo fits inside credit) or several serverless-slept services; app+DB pushes to ~$15-25/mo real spend.
- **Pro ($20/seat):** teams, staging+prod, PR previews, bigger volumes (1 TB vs Hobby's 5 GB hard cap), 10k req/h API limits; the $20 credit roughly covers one small always-on service, real agent stacks land $25-80+/mo.

### Cost traps
- Idle services bill per-minute regardless of traffic — a forgotten 1 vCPU/1 GB service costs ~$30/mo; enable Serverless (scale-to-zero) in Settings > Deploy
- Polling loops and health-check pingers defeat Serverless sleep entirely, keeping CPU/RAM billing continuous
- Connecting to your own DB via its public URL bills $0.05/GB egress — use the private *.railway.internal hostname (free)
- PR/preview environments duplicate every service and bill separately: 3 open PRs with full stack ≈ 4x baseline; agents that auto-open PRs multiply compute
- Service-to-bucket uploads pay service egress ($0.05/GB) even though bucket egress is free — buckets sit on the public network
- Railway Agent LLM tokens drain the same credit pool (default caps $5 Hobby / $20 Pro); sandboxes are full VMs billed while RUNNING and agents forget them
- Bucket GB-months round UP per bucket (5.1 → 6), so many tiny test buckets each add rounded charges
- Hard usage limit (minimum $10) takes ALL workloads offline when hit and suspends bucket reads; set the lower email soft alert too (alerts at 75/90/100%)
- Trial volumes are deleted 30 days after the trial credit expires; Free-plan workloads stop mid-cycle when the $1 credit runs out
- Memory leaks directly raise the bill since RAM bills on usage ($10/GB-mo)

### How to check usage
- Dashboard (primary): https://railway.com/workspace/usage — current + estimated billing-period spend per project/resource, and where soft/hard limits are set; billing at https://railway.com/workspace/billing
- No CLI usage/spend command exists (`railway status`/`logs`/`metrics` cover ops only)
- API: `POST https://backboard.railway.com/graphql/v2` with header `Authorization: Bearer <token>` (account token from Settings > Tokens; env vars RAILWAY_TOKEN / RAILWAY_API_TOKEN) — introspectable schema includes usage/estimatedUsage queries with measurements like CPU_USAGE, MEMORY_USAGE_GB, NETWORK_TX_GB

### Unresolved conflicts
Pro seat pricing resolved: official pricing page says "Pro: $20/month per seat" (docs page's flat-$20 framing misled one report). Enterprise minimum (~$2,000/mo) is third-party/unverified, unresolved. Free-plan structural limits (1 project, 3 services/project, 10-min build timeout, 3-day logs, 0 custom domains), Trial extras, and API rate limits (100 req/h Free / 10,000 req/h Pro) are single-sourced but cited to official docs.

### Sources
- https://railway.com/pricing
- https://docs.railway.com/pricing
- https://docs.railway.com/pricing/plans
- https://docs.railway.com/pricing/free-trial
- https://docs.railway.com/pricing/understanding-your-bill
- https://docs.railway.com/pricing/cost-control
- https://docs.railway.com/pricing/faqs
- https://docs.railway.com/storage-buckets/billing
- https://docs.railway.com/projects/project-usage
- https://docs.railway.com/integrations/api
- https://docs.railway.com/cli
- https://blog.railway.com/p/free-plan
- https://railway.com/workspace/usage

---

## Fly.io

### Billing dimensions
- Started Machines: per-second while in `started` state, priced by CPU/RAM preset, region-scaled (ams shared-cpu-1x 256MB = $2.02/mo 24/7; regions range $1.94 syd to $3.14 bom); extra RAM ~$5/GB per 30 days
- Stopped/suspended Machines: rootfs $0.15/GB per 30 days (stopped is not free)
- Volumes: $0.15/GB-month of PROVISIONED capacity, prorated hourly, billed even when detached or machine stopped
- Volume snapshots: $0.08/GB-month, first 10GB/mo free — new charge since Jan 1, 2026 (first invoice impact Feb 2026)
- Egress (public internet) per GB by region group: NA/EU $0.02, APAC/Oceania/SA $0.04, Africa/India $0.12; inbound free
- Private cross-region transfer (orgs created after 2024-07-18, "granular rates"): $0.006 / $0.015 / $0.050 per GB by same region groups; same-region private free
- Dedicated IPv4: $2/mo per app; static egress IP $0.005/hr (~$3.60/mo); shared IPv4 + IPv6 free
- SSL certs: first 10 single-hostname free per org, then $0.10/mo each; wildcard $1/mo
- Fly Kubernetes (FKS): $75/mo per cluster + compute/storage
- Managed Postgres: plan fee ($38–$1,922/mo) + $0.28/GB-month storage (max 1TB)
- Extensions (Tigris, Upstash Redis): partner list price passed through on Fly invoice; transfer to them bills as Fly transfer
- Support subscriptions: Standard $29/mo, Premium $199/mo, Enterprise from $2,500/mo; compliance/HIPAA package $99/mo
- Machine reservation blocks: annual prepay for monthly compute credit, 40% effective discount (e.g. $36/yr → $5/mo shared credit)
- NOT billed: HTTP requests, seats (unlimited org members), inbound transfer, builds

### Free tier
NO ongoing free tier for new accounts (plans/allowances deprecated Oct 7, 2024). One-time free trial only:
- 2 total VM-hours of runtime (per-second, shared across all machines) OR 7 days, whichever first
- Max 10 machines; max 2 vCPU / 4GB RAM per machine; 20GB volume storage
- Trial machines auto-stop after 5 min; no dedicated IPv4, performance CPUs, or GPUs
- Adding a credit card ends the trial and starts metered billing; no card by day 7 → apps stop
- Legacy grandfathered orgs (pre-Oct-2024 Hobby/Launch/Scale) keep: 3x shared-cpu-1x 256MB VMs, 3GB volumes, egress 100GB/mo NA+EU + 30GB APAC/Oceania/SA + 30GB Africa/India (lost permanently if org converts)
- Free for everyone: inbound transfer, same-region private transfer, shared IPv4 + IPv6, first 10 SSL certs, first 10GB/mo snapshot storage
- Allowances never cap the bill; no billing alerts exist

### Plans
| Plan | Price | Included | Overage |
|---|---|---|---|
| Pay As You Go (only plan for new orgs) | $0/mo base | Nothing after trial; unlimited seats; shared IPv4/IPv6, 10 SSL certs, 10GB snapshots free | All usage at full metered rates; prepaid credits available (min $25) in lieu of card |
| Machine reservation blocks | $36/yr (shared) or $144/yr (performance), up to $14,400/yr | $5/mo shared or $20/mo performance compute credit per block (CPU+RAM only, no rollover) | Usage beyond credit at normal rates; 40% effective discount on covered compute |
| Support Standard / Premium / Enterprise | $29 / $199 / from $2,500 per mo | Support only, no infra credits | n/a |
| Compliance (HIPAA) package | $99/mo | Compliance features | n/a |
| Managed Postgres (add-on): Basic/Starter/Launch/Scale/Performance | $38 / $72 / $282 / $962 / $1,922 per mo | Basic=shared-2x 1GB … Performance=perf-8x 64GB; no free/hobby DB plan | +$0.28/GB-month storage, max 1TB; cluster survives app deletion |
| Legacy Hobby/Launch/Scale (grandfathered only, closed since 2024-10-07) | $0–$5+/mo | 3x shared-cpu-1x 256MB, 3GB volumes, 100/30/30 GB regional egress | Metered at normal rates; leaving is one-way |

### What an agent app blows first
The trial's 2 total VM-hours: a single always-on shared-cpu-1x exhausts it in 2 wall-clock hours (5-min auto-stop masks it briefly), and any real deploy/test/redeploy loop burns it in an afternoon — then all apps stop until a card is added. After a card: first surprise line items are (1) `fly launch` creating 2 machines by default (HA), (2) provisioned volume GB billing 24/7 even when stopped/detached, (3) Managed Postgres minimum $38/mo.

### Sweet spots
- Pure PAYG, nothing to outgrow. Cheapest always-on: 1x shared-cpu-1x 256MB, shared IPv4, no volume = $1.94–$3.14/mo by region ($2.02 ams; ~$1.20 effective with reservation block); auto-stop staging can be <$1/mo.
- Typical 2-machine app + small self-managed Postgres ~$13–20/mo; MPG jumps that to $38+ minimum.
- Per-second billing makes ephemeral sandboxes/CI machines very cheap (~$0.0000008/s for 256MB) as long as they're destroyed, not just stopped.
- Reservation blocks (40% off) worth it once steady compute exceeds ~$5/mo. Colocate app+DB in one region so private transfer is free.

### Cost traps
- Auto-stop defeated by polling: health checks, uptime monitors, or the agent's own loop restart machines — docs warn "any random request might spin a machine up again"
- `fly launch` defaults to 2 machines (HA) — silently doubles compute on every scaffolded app; fix with `fly scale count 1`
- Stopped is not free: rootfs $0.15/GB-mo per stopped machine; a fleet of forgotten fat-image sandboxes adds up
- Volumes bill full provisioned size 24/7 even detached; deleting a machine does NOT always delete its volume — `fly volumes destroy` explicitly
- Deleting an app does NOT delete Managed Postgres ($38+/mo), Upstash Redis, or Tigris buckets — orphaned services keep billing
- No MPG free/hobby plan: "add a database" per project = $38/mo each
- Snapshots bill since Jan 1, 2026: default daily snapshots across many volumes can exceed the 10GB free band
- Egress region multiplier: Africa/India $0.12/GB is 6x NA/EU; cross-region private app<->DB traffic bills $0.006–$0.05/GB
- No billing alerts and no spend caps — a runaway loop bills until you check the dashboard
- Dedicated IPv4 $2/mo per app: real money across 50 preview/agent-scaffolded apps
- Metrics-based autoscaler can CREATE machines (FAS_CREATED_MACHINE_COUNT) — cap counts
- GPU machines deprecated, unavailable after Aug 1, 2026 (were $0.70–$1.50/hr)

### How to check usage
- No flyctl billing/usage command exists
- Dashboard: https://fly.io/dashboard/personal/billing (replace `personal` with org slug) — month-to-date bill, invoices (Stripe portal), Trial Status panel
- Inventory billable resources via `fly apps list`, `fly machine list`, `fly volumes list`, `fly ips list`, `fly scale show`
- Estimate with https://fly.io/calculator/; billing questions to billing@fly.io

### Unresolved conflicts
Resolved against the official pricing page: $1.94/mo shared-cpu-1x is the Sydney floor (not a US price; ams is $2.02, Mumbai $3.14); FKS $75/mo/cluster confirmed; GPUs unavailable after Aug 1, 2026; $99/mo package is the HIPAA compliance package. Per-region monthly figures from the official page are authoritative over derived per-second rates.

### Sources
- https://fly.io/docs/about/pricing/
- https://fly.io/docs/about/free-trial/
- https://fly.io/docs/about/billing/
- https://fly.io/docs/about/cost-management/
- https://fly.io/docs/mpg/
- https://fly.io/pricing/
- https://fly.io/calculator/

---

## E2B

### Billing dimensions
- Compute time of RUNNING sandboxes only, billed per second: vCPU-seconds at $0.000014/vCPU/s ($0.0504/vCPU/hr); tiers 1/2/4/6/8 vCPU = $0.000014/$0.000028/$0.000056/$0.000084/$0.000112 per s
- RAM GiB-seconds at $0.0000045/GiB/s ($0.0162/GiB/hr), configurable 512 MiB–8,192 MiB; default sandbox = 2 vCPU + 512 MiB ≈ $0.109/hr
- Billing stops the moment a sandbox is paused, killed, or times out; paused snapshots cost $0 compute
- Flat plan base fee (Pro $150/mo) buys LIMITS only, not credits; usage billed on top, charged at start of each month for prior month
- Storage: free allowance only (10 GiB Hobby / 20 GiB Pro); no published self-serve per-GiB overage — more is contact-us
- Concurrency add-ons as flat monthly fees (Pro+ +$500/mo for 600, Pro++ +$1,000/mo for 1,100)
- NOT metered: egress/bandwidth, API requests, seats, per-sandbox-create fees, template builds (concurrency limit only)

### Free tier (Hobby)
$0/mo, no credit card to start, ONE-TIME $100 usage credit (never refills). Limits:
- 1-hour max continuous session
- 20 concurrent running sandboxes; 1 sandbox created/sec; 20 concurrent template builds
- Max 8 vCPU + 8 GB RAM per sandbox; 10 GiB storage
- Same per-second rates as Pro
- $100 at default size (2 vCPU + 512 MiB, ~$0.1089/hr) ≈ 918 sandbox-hours (~38 days one always-on box, or ~5,500 ten-minute sessions)

### Plans
| Plan | Price | Included | Overage |
|---|---|---|---|
| Hobby | $0/mo + usage | One-time $100 credit; 1h max session; 20 concurrent sandboxes; 1 create/sec; 8 vCPU / 8 GB RAM max; 10 GiB storage; community support | Pure per-second usage: $0.000014/vCPU/s + $0.0000045/GiB-RAM/s after credit is gone |
| Pro | $150/mo + usage | NO usage credits (fee buys limits only); 24h max session; 100 concurrent sandboxes; 5 creates/sec; 20 GiB storage; customizable CPU/RAM (8+ via support) | Same per-second rates as Hobby, no discount |
| Pro+ (concurrency add-on) | +$500/mo on top of Pro | 600 concurrent sandboxes (official pricing.e2b.dev estimator) | Usage still metered at standard per-second rates |
| Pro++ (concurrency add-on) | +$1,000/mo on top of Pro | 1,100 concurrent sandboxes (official pricing.e2b.dev estimator) | Usage still metered at standard per-second rates |
| Enterprise | Custom, $3,000/mo minimum (official pricing.e2b.dev estimator) | 1,100+ concurrent, custom session length / CPU / RAM / disk / rate limits, volume discounts and bonus credits | Custom contract |
| Startups program (application, not retail) | Pro pricing | Pro plan + $20,000 one-time usage credits for qualifying AI startups (e2b.dev/startups) | — |

### What an agent app blows first
On Hobby the first hard wall is the 1-HOUR SESSION LIMIT: any dev-server/preview/long agent sandbox dies at 60 min (pause/resume resets the window but disrupts live servers). The first COST wall is forgotten running sandboxes eating the $100 credit: one default box left running 24/7 burns ~$2.61/day, and a 2vCPU+4GiB box ~$3.97/day drains the whole credit in ~26 days. Next walls: 20 concurrent sandboxes (~20 users each holding a live preview) and 1 create/sec throttling burst test matrices.

### Sweet spots
- **Hobby:** prototyping, demos, short code-exec/CI sandboxes — until you need >1h sessions, >20 concurrent, >1 create/sec, or the one-time $100 runs out.
- **Pro ($150):** any production agent product; required for 24h sessions, 100 concurrent, 5 creates/sec.
- **Pro+/Pro++ (+$500/+$1,000):** heavy parallel evals needing 600/1,100 concurrent — add-on fee dominates before raw CPU $ does.
- **Enterprise (≥$3k/mo):** 1,100+ concurrent or custom runtime.
- Always-on default box on Pro ≈ $150 + ~$80 usage ≈ $230/mo.

### Cost traps
- Forgotten running sandboxes: per-second billing until timeout/kill — default box $2.61/day (~$78-80/mo), 2vCPU+4GiB $3.97/day, 8vCPU+8GiB $12.79/day (~$384/mo, more than the Pro fee); 50 leaked boxes for a day ≈ $130
- set_timeout(24h) "as insurance" turns every abandoned sandbox into a $2.6-$12.8/day leak; keep the default 5-min timeout and extend only when needed
- Idle-while-thinking: sandbox bills during the agent's LLM turns and package installs (npm/pip on boot count as run time — cache deps in custom templates); pause between turns
- Polling/health-check loops reset the timeout clock and keep a should-be-dead sandbox billing forever
- Snapshot sprawl: paused sandboxes persist INDEFINITELY (no TTL), do not count toward concurrency, and their snapshots eat the 10/20 GiB storage allowance — easy to accumulate thousands silently; reap with `e2b sandbox list --state paused` + kill (keepMemory:false shrinks snapshots)
- Pro $150 includes ZERO compute — it only raises limits; all usage is metered on top
- Hobby 1h hard stop kills long agent sessions mid-task; even Pro caps continuous runtime at 24h, so always-on product UX needs pause/resume architecture
- Egress is unmetered (no published price) but big downloads still burn CPU-seconds and disk allowance
- No hard spend ceiling by default — set budget alerts/limits at the dashboard budget page before letting agents provision
- Likely (single-sourced): account is BLOCKED once the $100 credit is exhausted until a card is added (fail-closed mid-prod risk)
- Auth migration: E2B_ACCESS_TOKEN deprecated — no new tokens after 2026-07-01, all stop working 2026-08-01; use E2B_API_KEY

### How to check usage
- Spend is dashboard-only (no CLI/API spend endpoint): https://e2b.dev/dashboard?tab=usage (costs and sandbox-hours), ?tab=budget (spending limits/alerts), ?tab=billing, ?tab=keys
- Leak-hunting: `e2b sandbox list --state running --format json` (also `--state paused`, `--limit N`, `--metadata k=v`); kill with `e2b sandbox kill <id>`
- Cost estimator: https://pricing.e2b.dev/
- CLI install: `npm i -g @e2b/cli` or `brew install e2b`

### Unresolved conflicts
Pro+ (+$500/mo, 600 concurrent), Pro++ (+$1,000/mo, 1,100) and the Enterprise $3,000/mo minimum are confirmed on the official estimator pricing.e2b.dev but NOT listed on e2b.dev/pricing itself. The "account blocked when free credit exhausts" claim is unconfirmed by the official pricing page — kept as a flagged likely-true trap. $100-credit runway ≈ 918 hrs (exact math).

### Sources
- https://e2b.dev/pricing (re-verified via WebFetch 2026-07-17: plans, per-second rates, limits, storage, $100 credit)
- https://pricing.e2b.dev/ (official estimator, re-verified 2026-07-17: Pro+ +$500/mo @600, Pro++ +$1,000/mo @1,100, Enterprise $3,000/mo minimum)
- https://e2b.dev/docs/billing
- https://e2b.dev/docs/sandbox/persistence
- https://e2b.mintlify.app/docs/faq/paused-sandboxes-concurrency.md
- https://e2b.mintlify.app/docs/cli/list-sandboxes.md and https://e2b.dev/docs/cli
- https://e2b.dev/docs/api-key (access-token deprecation 2026-07-01/2026-08-01)
- https://e2b.dev/startups ($20,000 startup credits)
- Unofficial corroboration only: northflank.com/blog/e2b-vs-vercel-sandbox, beam.cloud/blog/e2b-pricing-explained

---

## Browserbase

### Billing dimensions
- Browser time (wall-clock, billed per minute, 1-minute minimum per session; allocated as browser hours/month, $/hr overage)
- Proxy bandwidth (billed per MB, 1-MB minimum per session; allocated as GB/month, $/GB overage)
- Search API calls (per 1k over included quota, $7/1k)
- Fetch API calls (per 1k over included quota; higher rate when proxied)
- Extract API calls (per 1k; $4/1k, $7/1k with proxies)
- Agent runs (fixed monthly call allocation per plan)
- Model Gateway LLM tokens (pay-as-you-go at market price; $5 credit on Free)
- NOT meters (hard limits, return 429s not charges): concurrent browsers, max session duration, session-creation rate/min, data retention days, project count

### Free tier
$0/mo, no credit card:
- 1 browser hour/month (60 min); 3 concurrent browsers; 15-min max session; 5 session creations/min
- 0 GB proxy (proxies unavailable); no CAPTCHA solving/Stealth/keepAlive
- 1,000 Search calls (2/sec); 1,000 Fetch calls (5/sec); 3 agent runs; $5 Model Gateway token credit
- 7-day data retention; 1 project
- No pay-as-you-go overage path: hitting 1 hr is a hard stop, not a charge

### Plans
| Plan | Price | Included | Overage |
|---|---|---|---|
| Free | $0/mo | 1 browser hr, 3 concurrent, 15-min max session, 5 creates/min, 0 GB proxy, 1k Search, 1k Fetch, 3 agent runs, $5 model-token credit, 7-day retention, 1 project | None — hard stop at allocation (no pay-as-you-go on Free) |
| Developer | $20/mo | 100 browser hrs, 25 concurrent, 6-hr max session, 25 creates/min, 1 GB proxy, 1k Search, 1k Fetch, 15 agent runs, Basic Stealth + auto CAPTCHA, up to 2 projects, retention 30d per pricing page (docs table says 7d) | $0.12/browser hr (~$0.002/min); $12/GB proxy; Search $7/1k; Fetch $1/1k ($4/1k proxied); Extract $4/1k ($7/1k proxied) |
| Startup | $99/mo (labeled Most Popular) | 500 browser hrs, 100 concurrent, 6-hr max session, 50 creates/min, 5 GB proxy, 1k Search, 10k Fetch, 50 agent runs, 30-day retention, up to 5 projects, priority support | $0.10/browser hr; $10/GB proxy; Search $7/1k; Fetch $0.5/1k ($4/1k proxied); Extract $4/1k ($7/1k proxied) |
| Scale | Custom (contact sales) | 250+ concurrent, 150+ creates/min, 6+ hr sessions, flexible/usage-based hours and proxy, Advanced Stealth + Verified Identity, HIPAA BAA/DPA/SSO, 30+ day retention, Slack/high-priority support | Custom / usage-based |

### What an agent app blows first
Free: browser hours — 1 hr/mo dies in one afternoon of agent dev (~30-60 short sessions at the 1-min floor, or 4 max-length 15-min sessions); the 15-min session cap also breaks any long agent task. Developer $20: browser hours (100) if agents loop or leak sessions, or proxy GB first if proxies are on by default (1 GB ≈ 200-500 proxied page loads at 2-5 MB/page — gone in days); parallel test suites hit the 25-concurrent cap (429s) before any dollar overage. Startup $99: proxy GB (5) for scraping-heavy agents, or browser hours for always-on keepAlive fleets.

### Sweet spots
- **Free:** demo/eval only.
- **Developer $20:** solo dev / one production agent: 100 hrs ≈ 3,000 sub-2-min page tasks (Browserbase's own FAQ math) or ~200 half-hour agent sessions.
- **Startup $99:** small team / production agent fleet / CI browser tests: 500 hrs ≈ 15k short tasks, 100 concurrent for parallel runs.
- Hour overage is cheap ($0.10-0.12/hr) so rarely upgrade for hours alone — upgrade Dev→Startup for concurrency (25→100), proxy volume (1→5 GB, $12→$10/GB), or 10x Fetch quota; break-even on hours alone is ~660 extra hrs/mo.
- **Scale:** 250+ concurrency, Verified Identity, compliance (HIPAA/SSO).

### Cost traps
- Leaked sessions run to the 6-hr max duration billing wall-clock the whole time ($0.72/leak Dev, $0.60 Startup); silent volume is the killer: 25 leaked sessions/day = ~4,500 hrs/mo ≈ $540 overage on Developer
- keepAlive sessions do NOT die on disconnect — a crashed agent with keepAlive:true bills until explicitly released; always sessions.update(id,{status:'REQUEST_RELEASE'}) in a finally block
- 1-minute billing minimum per session: 10,000 five-second CI/micro-sessions bill as ~167 hrs; reuse sessions instead of session-per-action/per-poll
- proxies:true globally meters every page load at $10-12/GB residential bandwidth (plus 1-MB per-session minimum inflating tiny sessions); media-heavy pages can burn 1 GB in one session — block images, enable proxies selectively
- Proxied Fetch API is $4/1k vs $0.5-1/1k unproxied — 4-8x for one flag; Extract $7/1k proxied vs $4/1k
- Concurrency ceiling (3 Free / 25 Dev) makes parallel agent swarms 429 and retry-storm into the session-creation rate limit (5/25/50 per min)
- Raising the project-wide default timeout in dashboard settings multiplies every leak's cost across all sessions
- Model Gateway is a separate market-price LLM bill, easy to miss next to browser hours; "Runtime/Functions free" still consumes browser minutes via auto-created sessions
- Free plan has no overage path: prototypes hard-stop mid-month at 1 hr

### How to check usage
- No official spend CLI
- API: `GET https://api.browserbase.com/v1/projects/{project_id}/usage` with header X-BB-API-Key (returns browserMinutes, proxyBytes); SDK: bb.projects.usage(projectId) (Node/Python)
- Dashboard: https://www.browserbase.com/overview (sessions, browser minutes, proxy data; 24h/7d/30d/billing-cycle ranges); plan/billing under Settings → Usage & billing
- Find runaway sessions: `GET /v1/sessions?status=RUNNING`; kill with `POST /v1/sessions/{id}` body {"status":"REQUEST_RELEASE"}
- Segment by tagging userMetadata on sessions

### Unresolved conflicts
Developer plan data retention is genuinely inconsistent between Browserbase's own sources: pricing page says 30 days, docs plan table says 7 days (both fetched live) — pricing page taken as canonical, but noted. Other conflicts resolved: "Most popular" label is on Startup; Startup Fetch overage is $0.5/1k; Free concurrent browsers = 3; Scale hours are flexible/usage-based.

### Sources
- https://www.browserbase.com/pricing (fetched 2026-07-17)
- https://docs.browserbase.com/account/billing/plans (fetched 2026-07-17)
- https://docs.browserbase.com/reference/api/get-project-usage
- https://docs.browserbase.com/optimizations/cost/measuring-usage
- https://docs.browserbase.com/optimizations/cost/cost-optimization
- https://docs.browserbase.com/platform/browser/long-sessions/keep-alive
- https://docs.browserbase.com/platform/browser/long-sessions/timeouts
- https://docs.browserbase.com/account/billing/plan-management
- https://www.browserbase.com/changelog/massive-price-decrease
- https://www.browserbase.com/blog/series-b-and-beyond

---

## GitHub (Actions / Codespaces / Packages / Git LFS)

### Billing dimensions
- Seats: $/user/month (Team, Enterprise; Pro is personal)
- Actions minutes: per-minute on GitHub-hosted runners for private repos, each job rounded UP to nearest whole minute; billed to repo owner; public repos free on standard runners; self-hosted free
- Actions larger runners: $/minute always billed, even on public repos; no included-minute pool
- Shared storage (Actions artifacts + Packages): GB-month, hourly accrual, $0.25/GB-month overage ($0.008/GB/day)
- Actions cache: $0.07/GB-month above 10 GB per repo
- Packages data transfer (egress): per GB downloaded, ~$0.50/GB; free via GITHUB_TOKEN inside Actions; GHCR container storage/bandwidth currently free (subject to 1-month-notice change)
- Codespaces compute: core-hours (wall time × cores), e.g. 2-core $0.18/hr up to 32-core $2.88/hr; storage $0.07/GB-month accrues even while stopped; prebuilds burn Actions minutes + storage
- Git LFS: metered storage $0.07/GiB-month + bandwidth $0.0875/GiB ($5 data packs discontinued)
- Copilot premium requests: separate per-request meter
- Default spending limit is $0 for metered products: overage is silently BLOCKED, not billed, until raised

### Free tier (GitHub Free — personal & orgs)
- 2,000 Actions min/mo for private repos on standard hosted runners (UNLIMITED free on public repos; larger runners always paid)
- 500 MB shared Actions-artifact + Packages storage; 10 GB Actions cache per repo; 1 GB Packages data transfer/mo
- Codespaces: 120 core-hours/mo (= 60 h 2-core / 30 h 4-core / 15 h 8-core) + 15 GB-month storage — PERSONAL accounts only, orgs get zero free Codespaces
- Git LFS: 10 GiB storage + 10 GiB bandwidth/mo
- Overage rates (when budget raised above $0): Linux 2-core $0.006/min, Windows 2-core $0.010/min, macOS $0.062/min, storage $0.25/GB-mo — but blocked at default $0 budget

### Plans
| Plan | Price | Included | Overage |
|---|---|---|---|
| GitHub Free | $0 (personal + orgs) | 2,000 private Actions min/mo; 500 MB shared artifact+Packages storage; 10 GB cache/repo; 1 GB Packages transfer/mo; Codespaces 120 core-h + 15 GB-mo (personal only, orgs none); LFS 10 GiB storage + 10 GiB bandwidth | Blocked at default $0 budget until raised; then Linux 2c $0.006/min, Win 2c $0.010/min, macOS $0.062/min, storage $0.25/GB-mo, Packages egress $0.50/GB, Codespaces 2c $0.18/hr, LFS $0.07/GiB-mo + $0.0875/GiB |
| GitHub Pro | $4/mo (personal only) | 3,000 private Actions min/mo; 2 GB shared storage (official product-usage-included page; some Actions docs said 1 GB — 2 GB confirmed); 10 GB Packages transfer/mo; Codespaces 180 core-h + 20 GB-mo; LFS 10 GiB / 10 GiB | Same unit rates as Free |
| GitHub Team | $4/user/mo (pricing page labels it "first 12 months" — verify renewal) | 3,000 private Actions min/mo; 2 GB shared storage; 10 GB Packages transfer/mo; NO free Codespaces (org-metered from $0 default budget); LFS 250 GiB / 250 GiB; larger runners available; 75 GB custom runner-image storage | Same unit rates; worked official example: 5,000 extra min (3k Linux + 2k Windows) = $38 |
| GitHub Enterprise Cloud | from $21/user/mo ("first 12 months" framing) | 50,000 Actions min/mo; 50 GB shared storage; 100 GB Packages transfer/mo; no free Codespaces; LFS 250 GiB / 250 GiB; 150 GB custom image storage | Same unit rates |

### What an agent app blows first
Actions minutes (2,000/mo private on Free). An auto-deploy pipeline of 8-15 min per push at ~10-12 pushes/day burns the whole month in ~2-3 weeks (~130-250 deploys total); one agent session of 20 CI re-run iterations × 10 min = 200 min. macOS jobs at $0.062/min (~10x Linux) make it far worse. Second casualty: 500 MB shared artifact/Packages storage — a 100 MB artifact per build at default 90-day retention blows it within a week of daily builds. Then Codespaces 120 core-hours (an 8-core box running 24/7 exhausts it in 15 hours) and LFS 10 GiB bandwidth if CI pulls large LFS files each run.

### Sweet spots
- **Free:** public-repo OSS (unlimited standard-runner minutes) and light private CI (~1-2 short Linux deploys/day).
- **Pro ($4):** solo dev with private repos + moderate Codespaces (180 core-h).
- **Team ($4/user):** small teams needing larger runners and 250 GiB LFS — but still only 3,000 Actions min, and org Codespaces bill from $0 with no free quota.
- **Enterprise ($21/user):** heavy CI/monorepos needing 50k min.
- High-frequency agent CI on private repos outgrows Free/Pro/Team minutes fast; consider public repos or self-hosted runners (still free) before upgrading.

### Cost traps
- Cron/polling workflows: `*/5 * * * *` running a 1-min private job = ~8,640 min/mo = 4.3x the entire Free quota; a 5-second job bills a full 60 seconds (per-job round-up)
- Matrix explosions: 3 OS × 4 versions = 12x minutes, with macOS legs at $0.062/min (~10x Linux) and Windows ~1.7x
- Larger runners have NO free pool and bill even on public repos — "spin a big box per PR" is pure spend
- Re-run loops: failed 5-min + successful 10-min run = 15 min charged; agents re-run CI constantly
- Forgotten Codespaces: compute stops at 30-min idle timeout but storage bills continuously ($0.07/GB-mo) until DELETED; prebuilds burn Actions minutes + storage per region
- Artifact hoarding: upload-artifact default 90-day retention accrues GB-hours at $0.008/GB/day; deleting doesn't refund past accrual — set retention-days: 1-7
- LFS in CI: every checkout with lfs:true / `git lfs pull` burns the OWNER's LFS bandwidth ($0.0875/GiB metered; data packs are gone); a 500 MB file pulled 20x kills the 10 GiB Free quota
- Private package/image pulls with a PAT (self-hosted runner, external server) bill ~$0.50/GB; the same pull with GITHUB_TOKEN inside Actions is free
- $0 default spending limit = silent outage: when Free quota exhausts mid-month, workflows just fail/queue until the 1st — no bill, no warning beyond 90%/100% emails
- Org accounts get ZERO free Codespaces core-hours — every core-hour bills (or blocks) from day one
- Copilot code review on private repos consumes Actions minutes + premium requests
- Copilot agent cloud sandboxes are a separate meter (compute-seconds/GiB-seconds), not Actions free minutes

### How to check usage
- CLI: `gh api /users/USERNAME/settings/billing/usage` or `gh api /organizations/ORG/settings/billing/usage` (enhanced billing platform; returns usageItems with product/sku/quantity/pricePerUnit/netAmount; fine-grained PAT needs "Plan: read" / org "Administration: read")
- Also `/…/usage/summary` (public preview); per-workflow `gh api repos/OWNER/REPO/actions/workflows/FILE.yml/timing`; cache `gh api repos/OWNER/REPO/actions/cache/usage`
- Dashboard: https://github.com/settings/billing (org: /organizations/ORG/settings/billing)
- Legacy /settings/billing/actions endpoints are deprecated. Alert emails at 90% and 100% of included usage

### Unresolved conflicts
Pro shared storage resolved to 2 GB (official product-usage-included page; older Actions docs said 1 GB). Per-OS minute multipliers on INCLUDED minutes: current docs show 1:1 wall-clock counting with per-OS rates applying only to paid overage — the old "macOS 10x multiplier depletes included minutes" model is disproven for current docs, though macOS overage is still ~10x Linux by price ($0.062 vs $0.006/min). Team/Enterprise "first 12 months" promo framing — verify renewal pricing.

### Sources
- https://github.com/pricing
- https://docs.github.com/en/billing/reference/product-usage-included
- https://docs.github.com/en/billing/reference/actions-runner-pricing
- https://docs.github.com/en/billing/managing-billing-for-your-products/about-billing-for-github-actions
- https://docs.github.com/en/billing/concepts/product-billing/github-codespaces
- https://docs.github.com/en/billing/concepts/product-billing/github-packages
- https://docs.github.com/billing/managing-billing-for-git-large-file-storage/about-billing-for-git-large-file-storage
- https://docs.github.com/en/rest/billing/usage
- https://github.com/pricing/calculator
- https://github.blog/changelog/2026-02-17-api-access-to-billing-usage-reports-in-public-preview/

---

## Supabase

### Billing dimensions
- Plan subscription (per ORGANIZATION, not per project; no seats — Team $599 is flat)
- Compute hours: dedicated Postgres per ACTIVE project, billed hourly with partial hours rounded UP; Nano free on Free plan but billed at Micro rate (~$10/mo) on paid orgs; Micro $0.01344/hr (~$10/mo) up to 16XL $5.12/hr (~$3,730/mo); paused projects bill $0; NOT covered by Spend Cap
- Disk size: 8 GB included per project (paid), then gp3 $0.125/GB-mo; io2 $0.195/GB-mo from first byte; does not auto-shrink
- Disk IOPS/throughput: 3,000 IOPS + 125 MB/s included (gp3), then $0.024/IOPS, $0.095/MB-s
- Egress (uncached, unified across DB/Auth/Storage/Realtime/Functions/Supavisor): $0.09/GB overage
- Cached egress (Storage CDN hits, separate quota since Jul 2025): $0.03/GB overage
- File storage: $0.0213/GB-mo overage
- Auth MAU: $0.00325/MAU overage; third-party MAU billed similarly; SSO MAU $0.015/MAU over 50 (Pro+)
- Edge Function invocations: $2 per 1M overage (OPTIONS free; failed invokes count)
- Realtime messages: $2.50 per 1M overage; Realtime peak concurrent connections: $10 per 1,000 overage
- Branching compute: each preview/persistent branch is its own hourly instance from $0.01344/hr + disk/egress; NOT covered by compute credits or Spend Cap
- Read replica compute: hourly like a project
- Image transforms: $5 per 1,000 origin images over 100 (Pro)
- Add-ons (flat/hourly per project): PITR ~$100/mo per 7d retention, custom domain $10/mo, IPv4 ~$4/mo ($0.0055/hr), Advanced MFA phone $75/mo first project then $10, log drains $60/drain/mo + $0.20/M events + $0.09/GB, pipelines $39/mo + $3/GB replicated
- NOT metered: Data API request count (unlimited on all plans)

### Free tier
$0/mo:
- 2 ACTIVE projects (paused don't count; pricing page says "Limit of 2 active projects")
- Projects AUTO-PAUSE after 7 days of inactivity, manual restore only
- Nano-class shared compute (~500 MB RAM); 500 MB database per project
- 50,000 Auth MAU (+50k third-party MAU)
- 5 GB egress + 5 GB cached egress/mo
- 1 GB file storage, 50 MB max upload
- 500,000 Edge Function invocations/mo
- Realtime: 200 peak concurrent connections, 2M messages/mo (256 KB max message)
- No backups/PITR/branching; 1-day log retention; unlimited API requests; unlimited team members
- Over quota: email warning (within ~20% of limits) + grace period, then requests rejected with 402 until next cycle or upgrade

### Plans
| Plan | Price | Included | Overage |
|---|---|---|---|
| Free | $0/mo per org | 2 active projects (7-day inactivity auto-pause), Nano compute, 500 MB DB/project, 50k MAU, 5 GB egress + 5 GB cached, 1 GB storage (50 MB uploads), 500k edge invocations, 200 realtime conns / 2M msgs, 1-day logs, no backups | None — grace period then 402 rejections until upgrade/next cycle |
| Pro | $25/mo per org | $10/mo compute credits (covers exactly ONE Micro instance; no rollover; not applicable to branches), 100k MAU, 8 GB disk/project, 250 GB egress + 250 GB cached, 100 GB storage (500 GB max upload), 2M edge invocations, 500 realtime peak conns / 5M msgs, 50 SSO MAU, 100 image transforms, daily backups 7d, 7-day logs, no pausing, Spend Cap ON by default | MAU $0.00325; disk $0.125/GB; egress $0.09/GB; cached egress $0.03/GB; storage $0.0213/GB; edge $2/1M; realtime $2.50/1M msgs, $10/1k conns; SSO MAU $0.015; transforms $5/1k; extra project compute ~$10+/mo each (Micro $0.01344/hr, hours rounded up) — compute/disk/branching NOT blocked by Spend Cap |
| Team | $599/mo per org | Same usage quotas/overage rates as Pro + SOC2 & ISO 27001, HIPAA add-on path, SSO for dashboard, project-scoped/read-only roles, 14-day backups, 28-day logs, priority support/SLAs, AWS PrivateLink | Same rates as Pro |
| Enterprise | Custom | Custom quotas, SLAs, BYO cloud, 24x7 support | Custom |

### What an agent app blows first
Free plan: the 7-day inactivity AUTO-PAUSE kills "deploy and forget" agent apps before any quota is touched (restore is manual). Next: 500 MB DB (~50-70k pgvector 1536-dim rows fills it) or the 2-active-project cap on the agent's 3rd project. On Pro the first real dollar surprise is compute: every extra project or forgotten branch is its own ~$10/mo (Micro, $0.01344/hr rounded up) instance, uncapped by Spend Cap — 10 stale branches ≈ $100/mo.

### Sweet spots
- **Free:** prototypes/demos with <500 MB data and traffic most days (to dodge the 7-day pause); fine for 1-2 toy apps.
- **Pro $25:** one small-to-mid production app; $25 all-in only at 1 Micro project inside quotas — realistic bill with 2-3 always-on projects is $35-$75 before overages (each extra Micro +$10/mo).
- **Team $599:** buy for compliance/SSO/RBAC, not usage.
- **Enterprise:** scale/custom SLAs.

### Cost traps
- Spend Cap illusion: cap only gates metered items (egress, MAU, edge, storage, realtime); COMPUTE, DISK, BRANCHING, read replicas, and add-ons (IPv4, PITR, custom domain) bill without limit even with the cap on
- Per-test provisioning: every `supabase projects create` on a paid org = new instance ≥$10/mo (Nano billed at Micro rate); every branch = $0.01344/hr; compute credits cover only ONE Micro — delete/pause after tests
- Round-up hourly billing: a branch/project alive 5 minutes bills a full hour; branch-per-PR CI stacks up
- Free-tier zombie: 7-day inactivity pause silently breaks deployed-and-forgotten demos; restore is manual
- Disk ratchet: autoscaled disk never shrinks automatically; a bulk-load spike keeps billing $0.125/GB-mo until manually reduced
- Polling loops: fat SELECTs/REST polls burn unified egress (100 KB polled every 5s ≈ 2.5 GB/mo per loop vs 5 GB free); use narrow selects, counts, or Realtime
- Storage without CDN cache (cache-busting params, private buckets) pays $0.09/GB uncached instead of $0.03/GB cached
- Auth in tests: each distinct/anonymous user authenticating in a cycle is an MAU; throwaway test users chew the 50k/100k quota
- Edge Functions as agent runtime: every tool call = 1 invocation; 1 invoke per 5s ≈ 500k/mo = entire free quota (cheap overage though: $2/1M)
- Vector/chat history without retention: embeddings + agent traces fill 500 MB free / 8 GB Pro disk far faster than normal CRUD
- Log drains and log queries count as egress/metered usage too

### How to check usage
- Dashboard (authoritative): https://supabase.com/dashboard/org/_/usage and .../org/_/billing (Upcoming Invoice, Spend Cap toggle)
- No `supabase billing`/`supabase usage` CLI exists — closest: `supabase projects list`, `supabase inspect db table-sizes|bloat`
- Management API: `curl -H "Authorization: Bearer sbp_..." https://api.supabase.com/v1/projects` (v0 analytics endpoints like /v0/projects/{ref}/analytics/endpoints/usage.api-counts are experimental)
- DB size via SQL: `select pg_size_pretty(pg_database_size('postgres'));`
- Supabase emails the billing contact when within 20% of plan limits

### Unresolved conflicts
File storage overage confirmed at $0.0213/GB (live pricing fetch). Free 2-active-project scope: per-org reading confirmed by the pricing page, but a cross-org (all orgs where user is Owner/Admin) nuance from billing docs is unresolved. Add-on prices (PITR ~$100/7d, custom domain $10, IPv4 ~$4, MFA $75, log drains $60, pipelines $39) are single-sourced but uncontested; io2 disk $0.195/GB-mo, 402 over-quota behavior, and the Jul 2025 cached-egress split are single-sourced from official docs.

### Sources
- https://supabase.com/pricing (fetched live 2026-07-17)
- https://supabase.com/docs/guides/platform/billing-on-supabase
- https://supabase.com/docs/guides/platform/manage-your-usage/compute
- https://supabase.com/docs/guides/platform/manage-your-usage/disk-size
- https://supabase.com/docs/guides/platform/manage-your-usage/branching
- https://supabase.com/docs/guides/platform/manage-your-usage/egress
- https://supabase.com/docs/guides/platform/cost-control
- https://supabase.com/docs/guides/platform/billing-faq
- https://supabase.com/docs/guides/functions/pricing
- https://supabase.com/docs/guides/platform/manage-your-usage/monthly-active-users
- https://supabase.com/blog/storage-500gb-uploads-cheaper-egress-pricing
- https://supabase.com/docs/reference/cli/introduction
- https://supabase.com/docs/reference/api/introduction

---

## AWS / GCP / Azure (hyperscaler slice)

Agent-relevant slice: serverless compute, storage, egress, VPC/NAT.

### Billing dimensions
- AWS Lambda: requests (per-1M) + GB-seconds duration (1ms granularity; INIT/cold-start phase billed since Aug 2025) + ephemeral storage >512MB + provisioned concurrency (not free-tier covered)
- AWS S3: GB-month by class + PUT/LIST-class ($0.005/1k) vs GET-class ($0.0004/1k) requests + data transfer out
- AWS EC2: instance-seconds (60s min) + EBS GB-month + public IPv4 $0.005/hr (in-use OR idle)
- AWS NAT Gateway: $0.045/hr provisioned + $0.045/GB processed, both directions
- AWS egress: GB to internet aggregated account-wide, first 100 GB/mo free (excl. China/GovCloud); cross-AZ/region $0.01-0.02/GB; inbound free
- GCP Cloud Run request-based: vCPU-seconds + GiB-seconds while serving + per-1M requests + egress; instance-based: whole instance lifetime at lower unit rates; min-instances bill idle time
- GCP egress: per GB, Premium tier (default, pricier) vs Standard tier, by destination; collateral: Cloud Build minutes, Artifact Registry storage, Serverless VPC Access compute
- Azure Functions Consumption: executions (per-1M) + GB-s (memory rounded up to 128MB buckets, min 100ms/128MB); Flex: on-demand meters + optional always-ready baseline; co-created Storage Account bills separately and is NOT in the free grant
- Azure bandwidth: GB out to internet by zone, first 100 GB/mo free; inbound free

### Free tier
- **AWS (accounts ≥2025-07-15):** NO 12-mo free tier — $100 credit + up to $100 more ($20×5 tasks) = $200 max, expires at 6 months OR exhaustion, then account auto-closes (90-day recovery). Always-free (all accounts, monthly): Lambda 1M requests + 400,000 GB-s, 100 GB internet egress, DynamoDB 25 GB, CloudFront 1 TB. Legacy pre-2025-07-15 accounts keep 750 hr/mo t2/t3.micro EC2 + RDS 12-mo offers.
- **GCP:** $300 trial credit / 90 days (resources pause at expiry, 30-day upgrade window; no GPUs on trial). Cloud Run always-free per billing account/mo: 2M requests + 180,000 vCPU-s + 360,000 GiB-s + only 1 GB NA egress (instance-based mode: 240K vCPU-s + 450K GiB-s); Cloud Run functions 2M invocations + 400K GB-s; 1 e2-micro (us-west1/central1/east1) + 30 GB PD; Cloud Storage 5 GB + 100 GB NA egress; BigQuery 1 TiB query + 10 GiB; Cloud Build 2,500 min.
- **Azure:** $200 credit / 30 days (lost if unused; 12-mo free services only if converted to PAYG). Functions Consumption always-free per subscription/mo: 1M executions + 400,000 GB-s (Flex grant smaller: 250K executions + 100K GB-s; Premium: none); Container Apps 180K vCPU-s + 360K GiB-s + 2M requests; 100 GB/mo internet egress free.

### Plans
| Plan | Price | Included | Overage |
|---|---|---|---|
| AWS pay-as-you-go (no seat plans) | $0 base; new-account Free plan = $100-$200 credits, hard 6-month expiry then account auto-close | Always-free monthly: Lambda 1M req + 400K GB-s, 100 GB egress, DynamoDB 25 GB, CloudFront 1 TB | Lambda $0.20/1M req + $0.0000166667/GB-s x86 (Arm $0.0000133334); S3 Standard $0.023/GB-mo, PUT $0.005/1k, GET $0.0004/1k; egress $0.09/GB first tier; NAT GW $0.045/hr + $0.045/GB (~$33/mo idle); public IPv4 $0.005/hr (~$3.60/mo) |
| GCP pay-as-you-go / Cloud Run (no seat plans) | $0 base; $300 trial credit / 90 days for new accounts | Cloud Run always-free/mo: 2M req + 180K vCPU-s + 360K GiB-s + 1 GB NA egress (request-based); 240K vCPU-s + 450K GiB-s (instance-based) | Request-based: $0.000024/vCPU-s + $0.0000025/GiB-s + $0.40/1M req; instance-based: $0.000018/vCPU-s + $0.000002/GiB-s; idle min-instances $0.0000025 per vCPU-s and GiB-s; Premium egress $0.12/GB first 1 TB, Standard ~$0.085/GB |
| Azure Functions Consumption | $0 base | 1M executions + 400,000 GB-s per subscription per month | $0.20/1M executions + $0.000016/GB-s; co-created Storage Account and bandwidth bill separately |
| Azure Functions Flex Consumption (new default) | $0 base | 250,000 executions + 100,000 GB-s/mo (on-demand meters only) | $0.40/1M executions + ~$0.000026/GB-s on-demand + $0.000004/GB-s always-ready baseline (region-dependent) |
| Azure Functions Premium | Always ≥1 instance billed, ~$0.173/vCPU-hr + $0.0123/GB-hr — bills at zero traffic | No free grant; no cold start; VNET support | vCPU-s + GB-s while allocated |

### What an agent app blows first
AWS new account: the $200-credit/6-month wall — one default VPC-with-NAT ($33/mo) + small RDS (~$15/mo) ≈ $50/mo burns credits in ~4 months at zero traffic, then the account auto-closes. GCP Cloud Run: the 1 GB NA free egress dies first if serving any assets; else 180K free vCPU-s (~360K req/mo at 500ms CPU each), or instantly with min-instances=1 (~$50+/mo, no free coverage). Azure: 400K GB-s grant (512MB × 1s × 800K executions), though the co-created Storage Account is usually the first nonzero line item; 1M free executions ≈ 0.4 RPS continuous — a 1s poller (2.6M/mo) blows every request grant.

### Sweet spots
- Hobby/demo apps: GCP Cloud Run has the most generous always-free compute (180K vCPU-s ≈ 50 vCPU-hrs/mo, forever) but near-zero free egress (1 GB); Lambda and Azure Functions Consumption have identical forever-free grants (1M req + 400K GB-s) plus 100 GB/mo egress — better for anything serving files.
- AWS new accounts are on a 6-month countdown: fine for prototypes, wrong for anything meant to keep running.
- Serverless WITHOUT VPC/NAT stays effectively free at hobby scale on all three; the moment an agent adds NAT, min-instances, Premium/Flex always-ready, or an always-on VM/DB, the bill starts regardless of traffic.
- Set a $5-20 budget alert day one; tear down agent-provisioned stacks in the same session.

### Cost traps
- AWS NAT Gateway: $0.045/hr forever + $0.045/GB (~$33/mo idle, 3x for 3 AZs); default "private Lambda in VPC" CDK/Terraform templates create it; S3/DynamoDB traffic through NAT double-bills unless gateway endpoints added — #1 surprise line item
- AWS free-plan auto-close: at 6 months the whole account and its data are scheduled for deletion — fatal for agent-provisioned "permanent" infra
- Forgotten per-test EC2/RDS: stopped RDS still bills storage and auto-restarts after 7 days; terminate don't stop; check all regions the agent touched; idle public IPv4s ($3.60/mo each) and EBS volumes/snapshots survive termination
- Cloud Run min-instances / CPU-always-allocated set "to fix cold starts" converts a free app into ~$50+/mo; instance-based billing has no request free line
- GCP trial cliff: everything pauses at day 90/$300; Premium egress is the default and ~40% pricier than Standard; Serverless VPC Access connector for private Cloud SQL is never free
- Azure: Storage Account co-created with every Function App always bills (not in free grant); Application Insights ingestion keeps billing after function deletion; per-test resource groups left behind = Azure's forgotten-EC2
- Azure Flex Consumption is the pushed default for new Functions: 4x smaller free grant (250K/100K), 2x per-execution price, ~1.6x GB-s rate vs classic Consumption; Premium/always-ready bills while idle
- Polling loops: 1s-interval poller = 2.6M req/mo, past every free request grant; on Cloud Run it also keeps the instance warm burning vCPU-s; 1-min timers × N apps add up
- Egress amplification: agents piping logs/artifacts/model weights/docker layers out — 3-4 GB/day kills the 100 GB/mo free (AWS/Azure); on Cloud Run only 1 GB is free; cross-AZ/region transfer ($0.01-0.02/GB) hides inside "internal" architectures
- CI thrash: image pushes bloat ECR/Artifact Registry (GCP free is only 0.5 GB) and Cloud Build/pipeline minutes beyond free

### How to check usage
- **AWS:** `aws ce get-cost-and-usage --time-period Start=2026-07-01,End=2026-07-17 --granularity MONTHLY --metrics UnblendedCost --group-by Type=DIMENSION,Key=SERVICE` (Cost Explorer API, $0.01/call); `aws freetier get-free-tier-usage`; `aws budgets describe-budgets --account-id <id>`; console: https://console.aws.amazon.com/costmanagement/home (Free Tier page, 85% alerts)
- **GCP:** no first-class spend CLI — `gcloud billing accounts list`, `gcloud billing budgets list --billing-account=<id>`; real spend at https://console.cloud.google.com/billing/reports (trial credit on billing overview)
- **Azure:** `az consumption usage list --start-date 2026-07-01 --end-date 2026-07-17`; `az costmanagement query --type ActualCost --timeframe MonthToDate --scope subscriptions/<sub-id>`; `az consumption budget list`; portal: https://portal.azure.com/#view/Microsoft_Azure_CostManagement/Menu/~/overview

### Unresolved conflicts
Azure account-wide 100 GB/mo free egress taken from the official bandwidth pricing page (WebFetch verification timed out — moderate confidence). Azure Flex Consumption on-demand GB-s rate resolved to ~$0.000026/GB-s + $0.40/1M (region-dependent; unverified live). S3 classic 5 GB free tier treated as legacy-only for new accounts (low confidence — verify in console). Single-report items kept uncontested: GCP Standard-tier 200 GiB/mo free egress, Cloud Run instance-based free tier (240K vCPU-s/450K GiB-s), T4g free trial until 2026-12-31, Azure Container Apps free slice.

### Sources
- https://aws.amazon.com/free/
- https://aws.amazon.com/blogs/aws/aws-free-tier-update-new-customers-can-get-started-and-explore-aws-with-up-to-200-in-credits/
- https://docs.aws.amazon.com/awsaccountbilling/latest/aboutv2/billing-free-tier.html
- https://aws.amazon.com/lambda/pricing/
- https://aws.amazon.com/s3/pricing/
- https://aws.amazon.com/ec2/pricing/on-demand/
- https://aws.amazon.com/vpc/pricing/
- https://cloud.google.com/free/docs/free-cloud-features
- https://cloud.google.com/run/pricing
- https://cloud.google.com/vpc/network-pricing
- https://cloud.google.com/network-tiers/pricing
- https://azure.microsoft.com/en-us/free/
- https://azure.microsoft.com/en-us/pricing/details/functions/
- https://azure.microsoft.com/en-us/pricing/details/bandwidth/
- https://learn.microsoft.com/en-us/azure/azure-functions/functions-consumption-costs
- https://learn.microsoft.com/en-us/azure/cost-management-billing/manage/avoid-charges-free-account
