# Research archive (round 2): media-vector

Raw dual-engine research (2026-07-17). Engine A = Claude web search; Engine B = grok CLI. Merged factsheet cross-checks both.

## Merged factsheet

```json
{
  "provider": "Cloudinary + Pinecone + Upstash (merged factsheet, verified vs official pricing pages 2026-07-17)",
  "billing_dimensions": [
    "Cloudinary: single 'credits' meter — 1 credit = 1,000 transformations OR 1 GB managed storage OR 1 GB bandwidth (video bandwidth 1 GB/credit free plan, 2 GB/credit self-serve paid; video processing ~500s SD / 250s HD per credit); transforms+bandwidth on a ROLLING 30-day window, storage is a current snapshot",
    "Pinecone serverless: Read Units (~1 RU per GB of namespace scanned, min 0.25/query), Write Units (~1 WU per 1 KB, min 5 WU/request), storage GB-mo, egress GB; extras: backups $0.10/GB-mo, restore $0.15/GB, import $0.25/GB, Inference tokens",
    "Pinecone pods (LEGACY, closed to new signups since 2025-08-18): billed per-minute (15-min rounding) while the index EXISTS, regardless of activity — idle pods bill 24/7 (p1/s1.x1 $0.111/hr ≈ $81/mo)",
    "Upstash Redis PAYG: commands $0.20/100K (PING/AUTH free), storage $0.25/GB-mo after first 1 GB free, bandwidth free to 200 GB/mo then $0.03/GB, extra DBs $0.50/mo beyond 10; global-replication writes count as extra commands per read region",
    "Upstash Kafka: DISCONTINUED (deprecated 2024-09, gone ~2025-03) — any plan using it is dead on arrival; QStash/Workflow is the replacement"
  ],
  "free_tier": "Cloudinary Free: 25 credits/mo (any mix ≈ 25K transforms / 25 GB storage / 25 GB bandwidth), 3 users, 10 MB image / 100 MB video max, no card. Pinecone Starter: $0 — 2 GB storage, 2M WU/mo, 1M RU/mo, 1 GB egress/mo, 5 indexes, 100 namespaces/index, AWS us-east-1 only, 5M inference tokens/mo. Upstash Redis Free: 256 MB data, 500K commands/mo, 10 GB bandwidth/mo, up to 10 free databases. All three are free-forever, no card.",
  "plans": [
    {
      "name": "Cloudinary Plus",
      "price": "$99/mo ($89 yearly)",
      "included": "225 credits/mo, 3 users / 2 accounts",
      "overage": "No auto-billing: warn → nag → account disable. No published per-credit rate (Pro PAYG ~$0.45/credit is third-party-reported, sales-only)"
    },
    {
      "name": "Cloudinary Advanced",
      "price": "$249/mo ($224 yearly)",
      "included": "600 credits/mo, 5 users / 3 accounts, CNAME",
      "overage": "Same soft-limit/disable behavior; Enterprise is custom"
    },
    {
      "name": "Pinecone Builder",
      "price": "$20/mo flat",
      "included": "10 GB storage, 5M WU/mo, 2M RU/mo, 10 GB egress, 10 indexes/project",
      "overage": "Blocked at limits — no overage billing (verified on pricing page)"
    },
    {
      "name": "Pinecone Standard",
      "price": "$50/mo minimum, then PAYG",
      "included": "PAYG: WU $4–4.50/M, RU $16–18/M, storage $0.33/GB-mo, egress $0.10/GB after 100 GB included; $300 3-week trial credits",
      "overage": "Fail-open on dollars; $50 bills even at zero usage"
    },
    {
      "name": "Pinecone Enterprise",
      "price": "$500/mo minimum",
      "included": "WU $6–6.75/M, RU $24–27/M, 99.95% SLA, CMEK",
      "overage": "Fail-open on dollars"
    },
    {
      "name": "Upstash Redis PAYG",
      "price": "$0 base, usage-billed",
      "included": "$0.20/100K commands, 1 GB storage free then $0.25/GB, 200 GB bandwidth free then $0.03/GB, 100 GB max data",
      "overage": "Fail-open UNLESS you set the per-DB max monthly budget (real hard cap)"
    },
    {
      "name": "Upstash Redis Fixed",
      "price": "$10 (250MB) / $20 (1GB) / $100 (5GB) / $200 (10GB) / $400 (50GB) / $800 (100GB) / $1,500 (500GB) per mo",
      "included": "Unlimited commands; bandwidth 50 GB → 20 TB by tier; read regions +$5–$750/mo; Prod Pack +$200/DB/mo",
      "overage": "Capped by construction, but watch opt-in auto-upgrade to next tier"
    }
  ],
  "first_quota_blown": "Cloudinary: transformations or bandwidth out of the shared 25-credit pool — agent-generated unique transform URLs (per-width, f_auto/q_auto variants) burn transform credits first (50 imgs x 4 breakpoints x 2 formats = 400 transforms/render); image-heavy traffic with cached derivatives burns bandwidth first. Rolling 30-day window means a one-day spike haunts you for a month. Pinecone Starter: Read Units (1M/mo) — RU scales with namespace size, a RAG loop at 3 queries/message dies at ~20–60K messages/mo; egress (1 GB) dies even faster with include_values=true. Upstash: commands (500K/mo) — 3 Redis ops/request = exhausted at ~5,500 req/day; ONE 1-second polling loop = 2.6M commands/mo.",
  "spend_cap": "Upstash: YES — real hard cap (\"max monthly budget\", PAYG per-DB, console): alerts at 70%/90%, then rate-limited so cost never exceeds budget — but OFF by default, you must set it. Pinecone: Starter/Builder are hard-walled (blocked at quota, no dollars); Standard/Enterprise have NO cap — spend alerts only (Settings → Spend alerts) plus auto email at >2x last invoice, fail-open on dollars. Cloudinary self-serve: no dollar cap needed — soft limits with email warnings escalating to account disable (availability risk, not billing risk); Pro PAYG/Enterprise fail open on overage.",
  "traps": [
    "#1: Legacy Pinecone POD index scaffolded from tutorial-era code bills ~$81+/mo per-minute while completely IDLE (closed to new signups since 2025-08-18, but existing/grandfathered pods still bill 24/7)",
    "Pinecone Standard's $50/mo minimum bills at zero usage; agent creating Standard 'just for a region' eats the floor",
    "Pinecone: include_values=true burns egress; 1-vector-per-request upserts pay the 5 WU minimum each — batch instead; re-embedding+re-upserting the corpus every deploy burns WU linearly",
    "Upstash: setInterval polling Redis every 1s = 2.6M commands/mo (~$5) per loop; @upstash/ratelimit meters every bot request; global multi-region multiplies write commands per read region; leaked UPSTASH_REDIS_REST_URL+TOKEN = anyone burns commands (set the budget cap!)",
    "Upstash Kafka is DEAD (shut down ~2025-03) — reject any plan referencing it",
    "Cloudinary: every unique transformation URL (each width/format/DPR) is a billed transform — unbounded runtime parameterization = unbounded transforms; upload retry loops bill 1 transform + storage each; leaked unsigned upload preset lets bots stuff storage; rolling 30-day window means spikes linger; paid add-ons (auto-tagging etc.) bill separately and hard-stop",
    "Cloudinary failure mode on self-serve is account SUSPENSION mid-demo, not a bill"
  ],
  "usage_check": "Cloudinary: console.cloudinary.com dashboard; Admin API GET /v1_1/<cloud>/usage; CLI `cld admin usage`. Pinecone: app.pinecone.io → Settings → Usage/Billing; query responses carry usage.read_units; CLI `pc index list/describe` (ops only, no spend command). Upstash: console.upstash.com per-DB Usage/Metrics tab; management API GET api.upstash.com/v2/redis/stats/<db-id>; budget set in DB settings.",
  "keywords": [
    "cld",
    "cld admin usage",
    "cloudinary",
    "CLOUDINARY_URL",
    "pc",
    "pc index",
    "pc index create",
    "pinecone",
    "PINECONE_API_KEY",
    "PINECONE_ENVIRONMENT (legacy pod-era code smell)",
    "upstash",
    "upstash redis",
    "@upstash/ratelimit",
    "UPSTASH_REDIS_REST_URL",
    "UPSTASH_REDIS_REST_TOKEN",
    "QSTASH_TOKEN",
    "UPSTASH_KAFKA_ (dead product)"
  ],
  "hint": "Free: Cloudinary 25 credits(rolling 30d)/Pinecone 2GB+1M RU/Upstash 500K cmds. #1 trap: legacy Pinecone pod = $81+/mo idle; Standard=$50 floor, alerts only. Upstash has the ONLY real hard cap (per-DB budget, OFF by default — set it). Cloudinary suspends, doesn't bill. Kafka is dead.",
  "conflicts": [
    "Pods-legacy date: Report A said 'legacy as of ~April 2026'; Report B said Aug 2025. RESOLVED for B via docs.pinecone.io: 'Pod indexes are no longer available to new customers as of August 2025' (cutoff 2025-08-18). A's 'Dedicated Read Nodes GA April 2026' left unverified.",
    "Upstash free DB count: Report A hedged (docs 10 vs table 1). RESOLVED via upstash.com/pricing/redis: up to 10 free databases; $0.50/DB beyond.",
    "Pinecone Builder quotas: A had price only; B's 10 GB / 5M WU / 2M RU / 10 GB egress / 10 indexes CONFIRMED on pricing page, including blocked-not-billed at limits.",
    "Cloudinary plan lineup: B listed Advanced Extra ($549) and Pro ($1,099); official pricing page shows ONLY Free/Plus/Advanced/Enterprise — Advanced Extra/Pro sourced from compare-plans FAQ, UNVERIFIED here, treat as tentative.",
    "Cloudinary first-quota-blown: A said transforms, B said bandwidth. Both kept — depends on app shape; agent-built apps with dynamic per-width URLs hit transforms first, cached-image traffic hits bandwidth first.",
    "Cloudinary ~$0.45/extra-credit and Pinecone collections $0.000035/GB-mo: not on official pages, flagged as unverified/suspect in both reports — excluded from decisive numbers.",
    "Verified as consistent across both reports + live pages: Cloudinary Free 25/Plus $99/225cr/Advanced $249/600cr; Pinecone Starter quotas and Standard/Enterprise minimums+rates; Upstash PAYG rates, fixed tiers, budget-cap mechanics (70%/90% alerts, rate-limit at cap, not default)."
  ],
  "sources": [
    "https://cloudinary.com/pricing (fetched 2026-07-17)",
    "https://cloudinary.com/pricing/compare-plans",
    "https://cloudinary.com/documentation/admin_api#usage",
    "https://www.pinecone.io/pricing/ (fetched 2026-07-17)",
    "https://docs.pinecone.io/guides/indexes/pods/understanding-pod-based-indexes (fetched 2026-07-17)",
    "https://docs.pinecone.io/guides/manage-cost/manage-cost",
    "https://upstash.com/pricing/redis (fetched 2026-07-17)",
    "https://upstash.com/docs/redis/overall/pricing",
    "https://upstash.com/blog/workflow-kafka",
    "https://upstash.com/docs/devops/developer-api"
  ]
}
```

## Engine A — Claude (raw)

PRICING/QUOTA FACTSHEET — Cloudinary + Pinecone + Upstash (verified July 2026)

================================================================
CLOUDINARY
================================================================

1. METERED BILLING DIMENSIONS
Single unified meter: "credits". 1 credit = 1,000 transformations OR 1 GB managed storage OR 1 GB net viewing (CDN) bandwidth — interchangeable within your monthly credit pool. Transformations and bandwidth are counted on a ROLLING 30-day window (quota never "resets" on the 1st; it slides daily). An upload of a transformable asset (image/video) counts as 1 transformation; "raw" file uploads (CSS, CSV, etc.) do not count against transformations, only storage.
Sources: https://support.cloudinary.com/hc/en-us/community/posts/4402920338066-A-q-About-Free-Plan , https://cloudinary.com/blog/understanding_cloudinary_s_transformation_quotas , https://cloudinary.com/pricing

2. FREE TIER (exact)
- 25 credits/month = any mix of 25,000 transformations / 25 GB storage / 25 GB bandwidth
- 3 users, 1 account, no credit card required
Source: https://cloudinary.com/pricing

3. PAID PLANS
- Plus: $99/mo (or $89/mo billed yearly) — 225 credits/mo, 3 users, 2 accounts, S3 backup, access controls
- Advanced: $249/mo (or $224/mo yearly) — 600 credits/mo, 5 users, 3 accounts, custom CNAME, SSL
- Enterprise: custom pricing, multi-CDN, SLA, SSO
- Overage: NO published per-credit overage on Free/Plus/Advanced — limits are "soft": exceed them and Cloudinary emails you to upgrade; continued overage can block new uploads or suspend the account rather than bill you. (A Pro pay-as-you-go arrangement with ~$0.45/extra-credit exists only via sales, per third-party reporting — not on the public pricing page.)
Sources: https://cloudinary.com/pricing , https://cloudinary.com/pricing/compare-plans , https://theimagecdn.com/docs/cloudinary-pricing (third-party, for overage behavior)

4. FIRST QUOTA AN INDIE APP BLOWS
Transformations, via the 25k/rolling-30-day free allotment. Every unique transformation URL (each size/crop/format/quality variant) is a billed transformation, and f_auto/q_auto generate a separate derived asset per format/DPR/browser combo. A gallery page with 50 images x 4 responsive breakpoints x 2 formats = 400 transformations per first render. ~60–80 daily visitors on an image-heavy site can burn 25 credits in transformations alone; bandwidth (25 GB) usually goes second.

5. COST TRAPS FOR AI-AGENT-BUILT APPS
- Agents love to generate per-request dynamic transformation URLs (w_<runtime px>) — every unique width = a new billed transformation; unbounded parameterization = unbounded transformations.
- Re-uploading the same asset in a retry loop: each upload of a transformable file = 1 transformation + storage growth (versions).
- Leaked unsigned upload presets let bots stuff your storage and burn upload transformations.
- Video: video transcoding consumes credits far faster than images (video bandwidth and video transformations are weighted more heavily on some plans — check your plan's fine print).
- Because limits are "soft," the failure mode is service suspension mid-demo, not a bill — but on paid/contract plans overage is negotiated and can bill.

6. SPEND CAP
No user-configurable hard spend cap. Free/self-serve: effectively a hard cap via account blocking after warning emails (alerts first, then blocking). No auto-overage billing on self-serve plans. Alerts are automatic at quota-approach.
Source: https://support.cloudinary.com/hc/en-us/community/posts/4402920338066-A-q-About-Free-Plan

7. CHECK USAGE
- Dashboard: https://console.cloudinary.com/ (Dashboard tab shows credits, transformations, storage, bandwidth)
- Admin API: GET https://api.cloudinary.com/v1_1/<cloud_name>/usage (returns credits.usage, transformations, storage, bandwidth) — https://cloudinary.com/documentation/admin_api#usage
- CLI: `cld admin usage` (Cloudinary CLI, pip install cloudinary-cli)

8. DETECTION KEYWORDS (shell)
`cld`, `cld admin usage`, `cld uploader`, `cloudinary-cli`, env var `CLOUDINARY_URL`

================================================================
PINECONE
================================================================

1. METERED BILLING DIMENSIONS
Serverless (current architecture): Read Units (RU, per query, scales with namespace size/topK), Write Units (WU, per upsert/update/delete, scales with record size), Storage (GB/month), Egress (GB), plus backups ($0.10/GB/mo), restore ($0.15/GB), bulk import ($0.25/GB), and Inference (embedding/rerank, per token) if used.
Pods (LEGACY): billed per pod per minute (listed hourly), from pod creation until deletion, REGARDLESS OF ACTIVITY — an idle pod bills 24/7. Rounded to 15-minute increments. As of April 2026, pod-based indexes are legacy; serverless is the default and new users are steered away from pods entirely. Dedicated Read Nodes (flat-fee reserved read capacity) went GA April 2026 as the high-throughput alternative.
Sources: https://www.pinecone.io/pricing/ , https://docs.pinecone.io/guides/indexes/pods/understanding-pod-based-indexes , https://www.pinecone.io/pricing/pods/

2. FREE TIER (Starter — exact)
- 2 GB storage
- 2M Write Units/month
- 1M Read Units/month
- 1 GB egress/month
- 5 indexes max, 100 namespaces/index
- Serverless only, limited regions (AWS us-east-1). No pods on Starter.
Source: https://www.pinecone.io/pricing/

3. PAID PLANS
- Builder: $20/mo flat (new tier)
- Standard: $50/mo minimum, then pay-as-you-go: WU $4–$4.50/M, RU $16–$18/M (varies by cloud/region), storage $0.33/GB/mo, egress $0.10/GB (100 GB/mo included)
- Enterprise: $500/mo minimum; WU $6–$6.75/M, RU $24–$27/M; 99.95% SLA, private networking, CMEK
- Pods (legacy, Standard plan): s1/p1 $0.111/hr (1x) to $0.888/hr (8x); p2 $0.1666–$1.3332/hr; Enterprise ~1.5x those rates. Collections storage $0.000035/GB/mo (as listed; verify on page — historically ~$0.025/GB/mo).
Sources: https://www.pinecone.io/pricing/ , https://www.pinecone.io/pricing/pods/

4. FIRST QUOTA AN INDIE APP BLOWS
Read Units (1M/month on Starter). RUs scale with namespace size: querying a namespace holding a few hundred thousand 1536-dim records can cost 5–15+ RU per query. A RAG chatbot doing ~3 queries per user message: roughly 20k–60k user messages/month exhausts 1M RUs; a scraper/eval loop can do it in a day. On Starter the 2 GB storage cap is the second wall (~1–1.5M 1536-dim vectors with metadata).

5. COST TRAPS FOR AI-AGENT-BUILT APPS
- THE classic trap (legacy): agent scaffolds a pod-based index "for reliability" → $80+/mo (p1.x1 = $0.111/hr ≈ $81/mo) billing while completely idle. Any tutorial-era code creating pods still bills per-minute from creation.
- Agent retry loops re-upserting the same documents burn Write Units linearly; re-embedding + re-upserting a corpus on every deploy is a common generated-code pattern.
- topK=1000 or huge namespaces make each query cost many RUs.
- Leaked API key = attacker can run queries/upserts billed to you; Standard plan has no hard ceiling.
- Standard's $50/mo minimum bills even at zero usage.

6. SPEND CAP
- Starter: hard cap by design (operations fail/blocked when quota exceeded — free forever, no card).
- Standard/Enterprise: NO hard spend cap. Pay-as-you-go with monthly minimums. Dashboard offers usage visibility and budget alerts only — alerts, not enforcement.
Source: https://www.pinecone.io/pricing/

7. CHECK USAGE
- Dashboard: https://app.pinecone.io → Settings → Usage / Billing
- API: `describe_index_stats` per index for record counts; org-level usage via dashboard (Admin API for orgs on Enterprise)
- CLI: Pinecone CLI `pc` — `pc index list`, `pc index describe`; no direct spend command (dashboard for billing)

8. DETECTION KEYWORDS (shell)
`pc`, `pinecone`, `pc index`, `pc index create`, `pc login`, env vars `PINECONE_API_KEY`, `PINECONE_ENVIRONMENT` (old pod-era SDK marker — a strong "legacy pod code" smell)

================================================================
UPSTASH
================================================================

*** KAFKA: DISCONTINUED. Upstash Kafka was deprecated 2024-09-11 and fully shut down 2025-03-11 (Kafka Connectors removed 2024-10-01). It does not exist as of July 2026; Upstash points users to QStash/Workflow. Any plan involving Upstash Kafka is dead on arrival. ***
Sources: https://upstash.com/blog/workflow-kafka , https://upstash.com/docs/kafka/connect/deprecation

1. METERED BILLING DIMENSIONS (Redis)
Commands (per 100K), storage (GB, total including replicas), bandwidth (GB egress). QStash (separate product): per message. Vector: per 100K requests + storage.
Source: https://upstash.com/docs/redis/overall/pricing

2. FREE TIER (Redis — exact)
- 500,000 commands/month
- 256 MB data size
- 10 GB bandwidth/month
- Up to 10 free databases (pricing page also states max 1 free DB in one table — the docs say 10; verify in console), $0, no card
Sources: https://upstash.com/pricing , https://upstash.com/docs/redis/overall/pricing

3. PAID PLANS (Redis)
- Pay-as-you-go: $0.20 per 100K commands; storage $0.25/GB (first 1 GB free); bandwidth free to 200 GB/mo then $0.03/GB; 100 GB max data; up to 100 DBs
- Fixed plans (8 tiers, unlimited commands): 250 MB $10/mo (50 GB bw, 10K cmd/s) … 1 GB $20/mo … 100 GB $800/mo … 500 GB $1,500/mo; read-region replicas +50% of base per region ($5 on the $10 tier)
- Prod Pack add-on: +$200/mo per database (SLA, multi-zone HA, encryption at rest, advanced monitoring)
Sources: https://upstash.com/pricing , https://upstash.com/docs/redis/overall/pricing

4. FIRST QUOTA AN INDIE APP BLOWS
Commands: 500K/month free. Rate limiters, session stores, and cache layers issue multiple commands per HTTP request (a typical @upstash/ratelimit check = 2–4 commands). An app doing 3 Redis commands/request exhausts 500K at ~5,500 requests/day. Polling loops (checking a key every second = 2.6M commands/month from ONE loop) blow it in under a week.

5. COST TRAPS FOR AI-AGENT-BUILT APPS
- Agent-written polling/heartbeat loops: setInterval hitting Redis every second is 2.6M commands/mo per loop — at PAYG that's ~$5/loop/mo, but ten leaked loops or a hot retry loop scale linearly.
- @upstash/ratelimit in front of a bot-hammered endpoint: every bot request bills you commands (the rate limiter itself is metered).
- Leaked UPSTASH_REDIS_REST_URL + REST_TOKEN (REST API works from anywhere, no IP allowlist by default) = anyone can run commands on your dime.
- Large values: MGET/SCAN over big payloads chew the 200 GB free bandwidth, then $0.03/GB.
- Mitigation is unusually good here: the max-budget cap (below) makes Upstash the safest of the three for autonomous agents — but ONLY if you turn it on.

6. SPEND CAP — YES, A REAL HARD CAP (opt-in)
Pay-as-you-go databases support a user-set "max monthly budget": alerts at 70% and 90%, and once exceeded "your database will be rate limited and your total cost will not exceed the chosen budget" — a genuine hard cap that degrades service instead of billing. NOT enabled by default; you must set it per database in the console. Fixed plans cap by construction (fixed price, hard resource limits).
Source: https://upstash.com/docs/redis/overall/pricing

7. CHECK USAGE
- Dashboard: https://console.upstash.com (per-DB Usage tab: commands, storage, bandwidth, cost)
- Developer API: https://api.upstash.com (e.g., GET /v2/redis/stats/<db-id> with management API key) — https://upstash.com/docs/devops/developer-api
- CLI: `upstash` (@upstash/cli / Go CLI): `upstash redis list`, `upstash auth login`; usage detail is dashboard/API

8. DETECTION KEYWORDS (shell)
`upstash`, `upstash redis`, `upstash auth`, `@upstash/cli`, `redis-cli` (with .upstash.io host), env vars `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`, `QSTASH_TOKEN`

================================================================
CROSS-SERVICE SUMMARY FOR THE ORCHESTRATOR
================================================================
- Hard cap availability: Upstash = real opt-in hard cap (best); Cloudinary = de-facto cap via suspension (no billing risk on self-serve, availability risk instead); Pinecone = alerts only on paid plans, $50/mo minimum on Standard, and legacy pods bill while idle (worst billing-surprise risk).
- Recent changes to flag: Upstash Kafka dead since 2025-03-11; Pinecone pods legacy as of ~April 2026 with Dedicated Read Nodes GA April 2026; Pinecone added $20/mo Builder tier.
- Biggest single trap: an AI agent creating a Pinecone POD index (bills ~$81+/mo idle) or an unbudgeted Upstash PAYG DB behind a polling loop.

Source URLs (all cited inline above): https://cloudinary.com/pricing , https://cloudinary.com/pricing/compare-plans , https://support.cloudinary.com/hc/en-us/community/posts/4402920338066-A-q-About-Free-Plan , https://cloudinary.com/blog/understanding_cloudinary_s_transformation_quotas , https://cloudinary.com/documentation/admin_api#usage , https://www.pinecone.io/pricing/ , https://www.pinecone.io/pricing/pods/ , https://docs.pinecone.io/guides/indexes/pods/understanding-pod-based-indexes , https://upstash.com/pricing , https://upstash.com/docs/redis/overall/pricing , https://upstash.com/blog/workflow-kafka , https://upstash.com/docs/kafka/connect/deprecation

## Engine B — grok (raw)

I'll verify current Cloudinary, Pinecone, and Upstash pricing from official pages and assemble a July 2026 factsheet with exact quotas, meters, and spend-cap details.# Pricing / quota factsheet  
**Service group: Cloudinary · Pinecone · Upstash**  
**As of: 17 July 2026** (verified on official pricing/docs pages)

---

## Recent changes (dated)

| Date | Change |
|------|--------|
| **6 Sep 2024** | Upstash announces Kafka deprecation; no new Kafka users.[[1]](https://github.com/pinecone-io/cli) |
| **~11 Mar 2025** | Upstash Kafka fully discontinued (reported end of 6‑month window). |
| **12 Mar 2025** | Upstash Redis free tier: **500K commands/month** (was 10K/day); storage ceilings raised. |
| **18 Aug 2025** | Pinecone: **pod indexes unavailable to new Standard/Enterprise signups** (serverless-only for new customers). |
| **2025–2026** | Pinecone adds **Builder ($20 flat)**; Standard **$50/mo min**, Enterprise **$500/mo min**; one-time **1 TB import credit** for Standard/Enterprise **through 31 Jul 2026**. |

---

# 1. Cloudinary (Image & Video / Programmable Media)

**Sources:** [cloudinary.com/pricing](https://cloudinary.com/pricing) · [compare-plans](https://cloudinary.com/pricing/compare-plans) · [billing_and_plans](https://cloudinary.com/documentation/billing_and_plans)

### 1. Metered dimensions
Single meter: **credits** (shared bucket). One credit buys **any one of**:

| Resource | Per 1 credit |
|----------|----------------|
| **Transformations** | **1,000** image transforms (chained image transforms usually count as 1) |
| **Managed storage** | **1 GB** (originals + cached derivatives + backup revisions) |
| **Image bandwidth** | **1 GB** delivered |
| **Video bandwidth** | Free plan: **1 GB**; self-service paid: **2 GB** |
| **Video processing** (FAQ) | **500 s SD** or **250 s HD** processing |

Transforms + bandwidth use a **rolling 30-day window** on Free / Plus / Advanced / Advanced Extra (not a calendar-month reset). **Storage = current snapshot** (delete → usage drops immediately). Pro PAYG / Enterprise use billing-cycle months.

### 2. Free tier (exact)

| Item | Quota |
|------|--------|
| Price | **$0 forever**, no card |
| Credits | **25 / month** (rolling 30-day for transforms/bandwidth) |
| Users / accounts | **3 users / 1 product environment** |
| Max image / video file | **10 MB / 100 MB** |
| Admin API | **500 requests/hour** |
| Max image megapixels | **25 MP** |

**Theoretical all-in-one-bucket maxes (if you spent the whole 25 on one resource):** ~25K transforms **or** 25 GB storage **or** 25 GB bandwidth — in practice you mix all three.

### 3. Paid plans

| Plan | Price (monthly / yearly) | Credits | Users / envs | Notes |
|------|--------------------------|---------|--------------|--------|
| **Plus** | **$99 / $89** | **225** | 3 / 2 | S3 backup, paid add-ons, expedited support |
| **Advanced** | **$249 / $224** | **600** | 5 / 3 | CNAME, auth options |
| **Advanced Extra** | **$549 / $494** | **1,350** | 5 / 5 | Compare-plans FAQ |
| **Pro** | **$1,099 / $989** | **2,750** | 5 / 5 | Compare-plans FAQ |
| **Pro PAYG** | Fixed + included quota | (console) | — | **Overage billed** on top of fixed fee |
| **Enterprise** | Custom | **units** (1 unit ≈ 1M transforms **or** 1 TB storage **or** 1 TB bandwidth) | Custom | Volume pricing |

**Overage unit prices:** Fixed self-service tiers (**Free → Advanced Extra**) do **not** auto-bill overage credits; they **warn → nag → eventually disable**. **Pro PAYG** bills usage above included quota (third-party reports **~$0.45/credit** — confirm on your console invoice; not shown as a public rate on the main pricing page).

### 4. What an indie app blows first
**Bandwidth credits**, then **first-time transforms**.

- Free = 25 credits. A small product site with unoptimized images can burn **several GB CDN delivery** quickly; each GB ≈ 1 credit.
- **Rough wall:** ~**25 GB delivered bandwidth in 30 days** (if storage/transforms are small), **or** ~**25K first-time unique transforms** (eager/on-the-fly variants).
- Cached re-hits do **not** re-count transforms; **every delivery still counts bandwidth**.
- Agent default of "transform every upload 5 ways + serve originals" exhausts Free in days of light traffic.

### 5. AI-agent cost traps
- Eager / incoming transforms on every upload (multiplies transform credits).
- Hotlink / unauthenticated delivery URLs + bots scraping CDN (bandwidth).
- Keeping every derivative in storage (derived copies count toward storage).
- Leaked **API secret** → mass upload / Admin API abuse (Admin API is rate-limited; Upload API is not credit-capped the same way).
- Paid **add-ons** (AI vision, auto-tagging, etc.) bill **separately** and can **hard-stop** when add-on quota ends.
- Rolling window: a one-day spike stays in the meter for **up to 30 days**.

### 6. Spend caps
| Behavior | Detail |
|----------|--------|
| **Hard money cap?** | **No** on Free/Plus/Advanced (not pay-as-you-go dollars). |
| **Default** | Soft limits → **email warnings** → repeated upgrade prompts → **account disable** if ignored. |
| **Pro PAYG** | **Fail-open on $** (overage charges); no automatic hard dollar stop documented. |
| **Add-ons** | Hard stop when add-on quota exhausted. |

### 7. Check usage / spend
| Method | How |
|--------|-----|
| Dashboard | [console.cloudinary.com](https://console.cloudinary.com) → **Settings → Billing**; Home **Usage / Delivery reports** |
| API | `GET /v1_1/:cloud_name/usage` (Admin API) |
| CLI | `cld admin usage` |
| Email | Profile → enable **monthly account usage report** |

### 8. Shell detection keywords
```
cld
cld admin
cld admin usage
cld admin resources
cld config
cloudinary
```

---

# 2. Pinecone

**Sources:** [pinecone.io/pricing](https://www.pinecone.io/pricing/) · [pods pricing](https://www.pinecone.io/pricing/pods) · [understanding-cost](https://docs.pinecone.io/guides/manage-cost/understanding-cost) · [manage-cost](https://docs.pinecone.io/guides/manage-cost/manage-cost)

### 1. Metered dimensions

**Serverless (default for new customers)**  
| Meter | What it measures |
|-------|------------------|
| **Storage** | GB-month of vectors + metadata |
| **Write Units (WU)** | Upsert / update / delete (≈1 WU per 1 KB request body; **min 5 WU/request**) |
| **Read Units (RU)** | Query / fetch / list (query ≈ **1 RU per GB of namespace size**, **min 0.25 RU/query**) |
| **Egress** | GB of response bytes from reads |
| **Import** | $0.25/GB from object storage (Std/Ent: **1 TB free once**, through **31 Jul 2026**) |
| **Backups / restore** | $0.10/GB-mo backup; $0.15/GB restore |
| **Inference** | Embed tokens + rerank requests |
| **Assistant** | Tokens + ingestion units |

**Pods (legacy — not for new signups after ~18 Aug 2025)**  
| Meter | Behavior |
|-------|----------|
| **Pod-hours** | **Billed while the index exists**, **even at zero traffic** |
| Collections | $0.000035/GB-month |

**Standard pod hourly rates (AWS marketplace table, Standard plan):** e.g. s1/p1.x1 **$0.1110/hr** (~**$81/mo** always-on); p2.x1 **$0.1666/hr** (~**$122/mo**). Enterprise ~1.5×.

### 2. Free tier — **Starter** (exact included)

| Dimension | Starter (Free) |
|-----------|----------------|
| Price | **$0** (no monthly minimum) |
| Storage | **Up to 2 GB** |
| Write units | **Up to 2M / mo** |
| Read units | **Up to 1M / mo** |
| Egress | **Up to 1 GB / mo** |
| Indexes | **Up to 5** |
| Namespaces/index | **100** |
| Cloud/region | **AWS us-east-1 only** |
| Projects / users | **1 / up to 2** |
| Inference embeds | **5M tokens/mo** (listed models) |
| Rerank | **bge-reranker-v2-m3**: **500 req/mo** |
| Assistant | 1 GB storage; 500k in / 300k out / 500k context tokens; 1k ingestion units |

Idle **serverless** indexes: **$0** compute (storage still counts if data remains).

### 3. Paid plans

| Plan | Price model | Key included / overage |
|------|-------------|-------------------------|
| **Builder** (NEW) | **$20/mo flat** | Storage **10 GB**; WU **5M**; RU **2M**; egress **10 GB**; 10 indexes/project; **usage beyond limits blocked** (not overage-billed) |
| **Standard** | **$50/mo minimum** then PAYG | Storage **$0.33/GB/mo**; WU **$4–$4.50/M**; RU **$16–$18/M**; egress **$0.10/GB** after **100 GB included**; 3-week trial **$300 credits** |
| **Enterprise** | **$500/mo minimum** then PAYG | Same shape; WU **$6–$6.75/M**; RU **$24–$27/M**; SLA 99.95%; private net, CMEK, etc. |
| **HIPAA (Standard add-on)** | **$190/mo** (6‑mo min) | Included free on Enterprise |

### 4. What an indie app blows first
On **Starter**: usually **read units** or **egress**, not storage.

- Query cost scales with **namespace size**: 1 GB namespace ≈ **1 RU per query** (min 0.25).
- **1M RU/mo** ≈ ~**33K queries/day** if each query costs 1 RU (1 GB ns).
- **1 GB egress** dies fast if agents set `include_values=true` / large metadata.
- RAG agent that re-queries every tool step can exhaust RU long before storage.
- If someone still has a **pod**: **idle pod bill** is the first "wall" (~$80+/mo for a tiny p1/s1.x1) — bills 24/7.

### 5. AI-agent cost traps
- Agent loops: retrieve-on-every-token / every retry → RU storm.
- Full-vector returns (`include_values`) → egress + payload size.
- Re-embedding full corpora via Pinecone Inference on every deploy.
- Upserting one vector per request (min **5 WU** each) instead of batches.
- Creating Standard plan "just for a region" → **$50 floor even at low usage**.
- **Leaked API key** → unlimited queries until quota/bill hits (Std/Ent fail open on $).
- Legacy **pods left running** after migration → continuous idle charge.

### 6. Spend caps

| Plan | Cap behavior |
|------|----------------|
| **Starter / Builder** | **Hard quota walls** (429 `RESOURCE_EXHAUSTED`); **no overage $** |
| **Standard / Enterprise** | **Fail-open $** after minimum; **spend alerts only** (email), **not a hard stop by default** |
| Alerts UI | [Settings → Spend alerts](https://app.pinecone.io/organizations/-/settings/spend-alerts) |
| Auto spike alert | Email when spend **> 2× previous month's invoice** (threshold fixed; can mute recipients) |
| Pods | Project **pod count limit** can cap capacity; still bills for pods that exist |

### 7. Check usage / spend
| Method | How |
|--------|-----|
| Dashboard | [app.pinecone.io](https://app.pinecone.io) → **Settings → Usage** (Std/Ent owners); **Billing** |
| API responses | Query/fetch return `usage.read_units`, `usage.egressBytes`; embed returns `usage.total_tokens` |
| CLI | `pc index list`, `pc index describe`, `pc index stats` (ops, not dollar billing) |

### 8. Shell detection keywords
```
pc
pc index
pc index list
pc index describe
pc index create
pc index delete
pc index stats
pc config
pinecone
```

---

# 3. Upstash

## 3a. Redis (primary product)

**Sources:** [upstash.com/pricing/redis](https://upstash.com/pricing/redis) · Redis pricing FAQ on same page

### 1. Metered dimensions (PAYG)
| Meter | Rate |
|-------|------|
| **Commands** | **$0.20 / 100K** (reads = writes; ops like `PING`/`AUTH` free) |
| **Storage** | **$0.25 / GB-mo** after **first 1 GB free** (daily average across replicas/regions) |
| **Bandwidth** | **Free to 200 GB/mo**, then **$0.03/GB** |
| **Extra DBs** | First **10 free**; then **$0.50 / DB / mo** (up to 100) |
| **Global writes** | Write replicated to each read region **counts as extra commands** |

Fixed plans: **no per-command charge**; pay for data tier + bandwidth allowance + optional **Prod Pack +$200/DB/mo**.

### 2. Free tier (exact)

| Item | Quota |
|------|--------|
| Price | **$0** |
| Data size | **256 MB** |
| Commands | **500,000 / month** |
| Bandwidth | **10 GB / month** |
| Free databases | **Up to 10** |
| Throughput / request size (table) | **10K cmds/sec** class limits on free row of comparison; **10 MB** max request (PAYG row shows same 10 MB) |

### 3. Paid plans

| Plan | Price | Included highlights |
|------|-------|---------------------|
| **Pay as You Go** | **$0.20/100K cmds** + storage/BW above free allotments | Max data **100 GB**; unlimited cmds/BW (BW free to 200 GB) |
| **Fixed 250MB** | **$10/mo** (+**$5**/read region) | 250 MB, **50 GB** BW, unlimited cmds, 10K/s |
| **Fixed 1GB** | **$20** (+$10/region) | 1 GB, 100 GB BW |
| **Fixed 5GB** | **$100** (+$50/region) | 5 GB, 500 GB BW |
| … | … | … |
| **Fixed 500GB** | **$1,500** (+$750/region) | 500 GB, 20 TB BW, 16K cmds/s |
| **Prod Pack** | **+$200/DB/mo** | SLA, multi-zone HA, encryption at rest, SOC2, Prometheus/Datadog |
| **Enterprise** | Custom | 10 TB, unlimited BW/DB count, HIPAA, etc. |

### 4. What an indie app blows first
**Monthly command count (500K)** on Free — not storage.

- Rate-limit middleware that does **several Redis ops per HTTP request** (e.g. 5 cmds × 100K req = **500K**).
- **~167K HTTP reqs/month** if 3 Redis ops each; or **~16K reqs/day** at ~1 op each.
- Session/cache agents that `GET`+`SET`+`EXPIRE` on every hit burn commands 3×.
- Bandwidth **10 GB** is secondary for pure key-value; **storage 256 MB** hits if you store large blobs in Redis.

### 5. AI-agent cost traps
- Polling loops / heartbeat `GET`s every second → command explosion.
- Agent tool that redis-logs every LLM token.
- Enabling **Global** multi-region without realizing **write replication multiplies command bill**.
- Adding a card "just in case" → auto-upgrade to PAYG → **fail-open $** without budget.
- Creating many DBs (agent scaffolds) → **$0.50 each** after 10.
- Fixed plan **auto-upgrade** when BW/storage exceeded (if enabled) → surprise tier jump.
- Leaked REST token → unlimited command burn until budget/rate limit.

### 6. Spend caps (**Redis budget = real hard cap**)

| Feature | Detail |
|---------|--------|
| **Max monthly budget** | **PAYG only** — set per database in console |
| **On by default?** | **No** — must configure |
| When exceeded | **Rate limited**; **cost will not exceed budget** |
| Alerts | Email at **70%** and **90%** of budget |
| Free tier | Hard stop on free quotas (not a $ cap) |
| Fixed plans | Rate-limit or auto-upgrade; no per-command $ |

### 7. Check usage / spend
| Method | How |
|--------|-----|
| Dashboard | [console.upstash.com](https://console.upstash.com) → database → **Details / Metrics / Billing** |
| API | Upstash REST + console metrics (no single universal "bill CLI") |
| Budget | Database settings → **Budget** (PAYG) |

### 8. Shell detection keywords
```
upstash
upstash redis
@upstash/redis
UPSTASH_REDIS_REST_URL
UPSTASH_REDIS_REST_TOKEN
```

---

## 3b. Upstash Kafka — **DISCONTINUED**

| Status | Detail |
|--------|--------|
| Announced | **6 Sep 2024** — stop new users; 6 months support for existing |
| End | **~March 2025** fully gone from product surface |
| Replacement direction | **QStash / Upstash Workflow** (not Kafka-compatible pricing) |
| **Free / paid Kafka today** | **None** — product not offered |

**Historical model (for migration archaeology only):** per-message PAYG (~$0.2/100K single-zone, ~$0.6/100K multi-zone), storage ~$0.25/GB, **price caps** (~$120 / ~$360) — **no longer sellable**.

**Shell keywords (legacy):** `upstash kafka`, `UPSTASH_KAFKA_`, `kafka` + upstash REST.

---

# Cross-service comparison (indie / agent lens)

| Question | Cloudinary | Pinecone | Upstash Redis |
|----------|------------|----------|---------------|
| Free forever? | **Yes** (25 credits) | **Yes** (Starter quotas) | **Yes** (256 MB + 500K cmds) |
| First wall | **Bandwidth / transforms** | **RU or egress** (or **$50 floor** if Std) | **Commands (500K)** |
| Idle cost | Storage credits if assets kept | Serverless **storage only**; **pods 24/7 $** | **$0** if empty PAYG/free |
| Hard $ cap | **No** (disable account) | Alerts only on Std/Ent | **Yes, if budget set** (PAYG) |
| Agent default risk | Eager transforms + open CDN | Query loops + large namespaces | Rate-limit / poll loops |

---

# Primary source URLs (use for every number above)

1. https://cloudinary.com/pricing  
2. https://cloudinary.com/pricing/compare-plans  
3. https://cloudinary.com/documentation/billing_and_plans  
4. https://console.cloudinary.com/app/settings/billing  
5. https://www.pinecone.io/pricing/  
6. https://www.pinecone.io/pricing/pods  
7. https://docs.pinecone.io/guides/manage-cost/understanding-cost  
8. https://docs.pinecone.io/guides/manage-cost/manage-cost  
9. https://docs.pinecone.io/guides/manage-cost/monitor-usage-and-costs  
10. https://upstash.com/pricing/redis  
11. https://upstash.com/blog/redis-new-pricing  
12. https://upstash.com/blog/workflow-kafka  

**Caveat:** Marketplace (AWS/GCP/Azure) rates can differ slightly by region; always re-check the live pricing table before budgeting production. Pro PAYG per-credit overage should be confirmed on your Cloudinary invoice/console, not third-party blogs alone.
