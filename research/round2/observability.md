# Research archive (round 2): observability

Raw dual-engine research (2026-07-17). Engine A = Claude web search; Engine B = grok CLI. Merged factsheet cross-checks both.

## Merged factsheet

```json
{
  "provider": "Datadog + AWS CloudWatch Logs + Sentry (merged factsheet, verified 2026-07-17, US-list/us-east-1/annual)",
  "billing_dimensions": [
    "Datadog: infra hosts (hourly count, high-watermark = peak of lower 99% of hours)",
    "Datadog: custom metric series (unique metric+tag combos, monthly avg of hourly counts; 100/host Pro, 200/host Ent pooled)",
    "Datadog: log ingestion $/GB (separate meter from log indexing $/million events by retention)",
    "Datadog: APM hosts + ingested span GB + indexed span millions",
    "CloudWatch Logs: ingest $/GB by class (Standard/IA; vended/Lambda logs volume-tiered since 2025-05)",
    "CloudWatch Logs: storage $/GB-mo (compressed), Logs Insights $/GB scanned per query, Live Tail $/min",
    "Sentry: errors/event, spans/span, replays/replay, attachments GB, logs GB, cron+uptime monitors, profile hours; reserved volume + shared PAYG budget"
  ],
  "free_tier": "Datadog Free: 5 hosts, 1-day metric retention, NO logs/APM/alerting (14-day trial only). CloudWatch always-free: 5 GB/mo shared across ingest+archive storage+Insights scan, 1,800 Live Tail min, 10 custom metrics, 10 alarms, 3 dashboards, 1M API req. Sentry Developer $0: 1 user, 5,000 errors/mo, 5M spans, 50 replays, 5 GB logs, 1 GB attachments, 1 cron + 1 uptime monitor; excess dropped, never billed.",
  "plans": [
    {
      "name": "Datadog Free",
      "price": "$0",
      "included": "up to 5 hosts, 1-day metric retention; no logs/APM",
      "overage": "hard product limits"
    },
    {
      "name": "Datadog Infrastructure Pro",
      "price": "$15/host/mo annual ($18 on-demand)",
      "included": "15-mo metrics, 100 custom metrics/host (pooled), 5 containers/host",
      "overage": "ingested custom metrics $0.10/100 series; indexed custom-metric overage contract-priced; containers $0.002/hr"
    },
    {
      "name": "Datadog Infrastructure Enterprise",
      "price": "$23/host/mo annual ($27 on-demand)",
      "included": "200 custom metrics/host, 10 containers/host",
      "overage": "same pattern as Pro"
    },
    {
      "name": "Datadog Log Management",
      "price": "usage-based",
      "included": "n/a",
      "overage": "ingest $0.10/GB; Standard index 15-day $1.70/M events annual ($2.55 on-demand); Flex storage $0.05/M annual ($0.075 OD)"
    },
    {
      "name": "Datadog APM",
      "price": "$31/host/mo annual ($36 on-demand); APM Pro $35/$41; APM Enterprise $40/$47",
      "included": "per APM host: 150 GB ingested spans + 1M indexed spans (15-day)",
      "overage": "ingested $0.10/GB; indexed $1.70/M (15-day annual)"
    },
    {
      "name": "CloudWatch Logs (pure PAYG, no named plans)",
      "price": "$0 base",
      "included": "5 GB/mo free pool (ingest+storage+Insights scan)",
      "overage": "Standard ingest $0.50/GB (IA $0.25; vended tiered $0.50→$0.05 by TB); storage $0.03/GB-mo; Insights $0.005/GB scanned; Live Tail $0.01/min over free"
    },
    {
      "name": "Sentry Developer",
      "price": "$0 (1 user)",
      "included": "5k errors, 5M spans, 50 replays, 5 GB logs, 1 GB attachments, 1 cron + 1 uptime",
      "overage": "none — excess data dropped"
    },
    {
      "name": "Sentry Team",
      "price": "$26/mo annual",
      "included": "50k errors, 5M spans, 50 replays, 5 GB logs, 1 GB attachments; unlimited users",
      "overage": "PAYG (only if budget set): errors $0.00029→$0.00012/event by band; spans $0.0000020→$0.0000014; replays $0.00375→$0.00196; logs $0.50/GB; attachments $0.3125/GB"
    },
    {
      "name": "Sentry Business",
      "price": "$80/mo annual",
      "included": "same base volumes as Team + advanced quotas/spend allocation, SAML",
      "overage": "PAYG: errors $0.00089→$0.00024/event; spans $0.0000040→$0.0000029; replays/logs/attachments same as Team"
    }
  ],
  "first_quota_blown": "Order of pain: (1) Sentry free 5,000 errors/mo — one crash/retry loop burns it in minutes-to-hours; then 5M spans if tracesSampleRate:1.0. (2) CloudWatch 5 GB free ingest — debug-logging Lambda/container exhausts it in days (~7 KB/s ≈ 18 GB/mo ≈ $6.50+). (3) Datadog — 6th host ends Free; once paid, custom-metric cardinality (user_id tag = 1 series per user vs 100/host allotment) and log indexing ($1.70/M: 50 events/sec ≈ 130M/mo ≈ $220/mo) are the silent bills; one autoscale burst day can set the whole month's host high-watermark.",
  "spend_cap": "Datadog: NO hard cap — post-paid fail-open; only usage-alert monitors (datadog.estimated_usage.*) plus per-index LOG DAILY QUOTAS (a real per-index hard stop — set them). CloudWatch: NO hard cap — AWS Budgets/billing alarms alert only (optional budget actions exist, not on by default); mitigations = retention policies, IA class, quotas. Sentry: YES, effectively ON by default — reserved volume + explicit PAYG budget; if PAYG unset or $0, overage is dropped and never billed; worst case bounded by the budget you set.",
  "traps": [
    "High-cardinality metric tags (user_id/request_id/session_id via DogStatsD/OTel) → Datadog custom-metric series explosion billed per combo",
    "Datadog: indexing all logs with no exclusion filters; ship debug logs ingest-only instead; rehydrating archives costs $0.10/GB scanned + re-index",
    "Datadog host high-watermark: brief autoscaling/test bursts bill the whole month; one Agent per container can count each as a host",
    "Datadog APM: tracing libs at 100% sample rate blow the 150 GB/host span allotment (Agent default is 10 traces/s, DD_APM_TARGET_TPS)",
    "CloudWatch: log-group retention defaults to Never Expire — storage bills forever until you put-retention-policy",
    "CloudWatch: Lambda console.log/debug + START/END/REPORT lines all bill $0.50/GB ingest; retry/error loops multiply it; VPC Flow/ALB vended logs add multi-GB/day",
    "CloudWatch: auto-refreshing dashboards or broad Logs Insights queries re-scan GBs at $0.005/GB each run; GetMetricData polling by 3rd-party tools bills $0.01/1k",
    "Sentry: scaffolds setting tracesSampleRate:1.0 and replaysSessionSampleRate:1.0 burn span/replay quota; captureException inside polling-loop catch blocks",
    "Sentry: DSN is public by design — anyone can spam your quota; set inbound filters/rate limits per key; ignored issues still consume quota",
    "Leaked DD_API_KEY or AWS keys with PutLogEvents/PutMetricData let outsiders bill you directly; no per-service kill switch on Datadog/AWS"
  ],
  "usage_check": "Datadog: https://app.datadoghq.com/billing/usage (Plan & Usage); API GET /api/v1/usage/summary and /api/v2/usage/hourly_usage; datadog.estimated_usage.* metrics. CloudWatch: console Log groups → storedBytes + Cost Explorer; CLI: aws logs describe-log-groups --query 'logGroups[*].[logGroupName,storedBytes]'; aws cloudwatch get-metric-statistics --namespace AWS/Logs --metric-name IncomingBytes; aws ce get-cost-and-usage --filter '{\"Dimensions\":{\"Key\":\"SERVICE\",\"Values\":[\"AmazonCloudWatch\"]}}'; aws budgets describe-budgets. Sentry: https://<org>.sentry.io/settings/billing/overview/ + /stats/; API GET /api/0/organizations/{org}/stats_v2/ (sentry-cli has no billing subcommand).",
  "keywords": [
    "datadog-agent",
    "dd-agent",
    "dog",
    "datadog-ci",
    "DD_API_KEY",
    "DD_APP_KEY",
    "DD_SITE",
    "DD_APM_TARGET_TPS",
    "helm install datadog",
    "aws logs",
    "aws cloudwatch",
    "put-log-events",
    "put-retention-policy",
    "start-query",
    "aws ce get-cost-and-usage",
    "aws budgets",
    "amazon-cloudwatch-agent",
    "awslogs",
    "sentry-cli",
    "SENTRY_DSN",
    "SENTRY_AUTH_TOKEN",
    "Sentry.init",
    "@sentry/",
    "sentry-sdk"
  ],
  "hint": "No hard cap on Datadog or CloudWatch (alerts only; DD log-index daily quotas = only real stop); Sentry drops overage unless PAYG budget set. #1 trap: agent scaffolds with tracesSampleRate:1.0 + user_id metric tags + Never-Expire CW retention. CW $0.50/GB ingest, DD $1.70/M indexed, Sentry 5k free errors.",
  "conflicts": [
    "Datadog APM on-demand: Report A said $48/host; official pricing page says $36 standalone ($31 annual) — Report B correct, A rejected",
    "Datadog indexed-span overage: A said $1.27–$2.50/M; official page says $1.70/M at 15-day annual — B correct (other retentions vary but 15-day baseline is $1.70)",
    "Sentry Team error PAYG: B's band table ($0.0003625→$0.00015/event) contradicted by docs.sentry.io/pricing which shows $0.00029→$0.00012 — Report A correct, B's table rejected (likely stale/mis-scaled)",
    "Sentry span PAYG Team: official $0.0000020→$0.0000014/span — A correct; B only had the top bands",
    "Sentry replay PAYG: A cited ~$0.00196, B ~$0.00375; official shows the range $0.00375→$0.00196 by volume band — merged as range, both partially right",
    "Datadog CLI: B claimed Dogshell deprecated in favor of 'pup' — unverified against official docs and no such CLI is documented; kept dog/dogshell + datadog-ci, dropped 'pup'",
    "Sentry Developer 5k errors: docs.sentry.io/pricing fetch surfaced a 50k figure but that is the Team included volume; both reports and sentry.io/pricing agree Developer free = 5k errors"
  ],
  "sources": [
    "https://www.datadoghq.com/pricing/ (re-fetched 2026-07-17: APM $31/$36, indexed spans $1.70/M, log index $1.70/$2.55/M)",
    "https://docs.datadoghq.com/account_management/billing/",
    "https://docs.datadoghq.com/account_management/billing/custom_metrics/",
    "https://docs.datadoghq.com/account_management/billing/apm_tracing_profiler/",
    "https://docs.datadoghq.com/tracing/trace_pipeline/ingestion_mechanisms/",
    "https://aws.amazon.com/cloudwatch/pricing/",
    "https://docs.aws.amazon.com/AmazonCloudWatch/latest/logs/Working-with-log-groups-and-streams.html",
    "https://aws.amazon.com/about-aws/whats-new/2025/05/amazon-cloudwatch-tiered-pricing-additional-destinations-aws-lambda-logs/",
    "https://docs.aws.amazon.com/cost-management/latest/userguide/budgets-managing-costs.html",
    "https://sentry.io/pricing/",
    "https://docs.sentry.io/pricing/ (re-fetched 2026-07-17: PAYG errors/spans/replays/logs bands)",
    "https://docs.sentry.io/pricing/quotas/",
    "https://docs.sentry.io/pricing/quotas/spend-allocation/",
    "https://sentry.zendesk.com/hc/en-us/articles/33563182442523"
  ]
}
```

## Engine A — Claude (raw)

# Observability Pricing & Quota Factsheet — Datadog / AWS CloudWatch Logs / Sentry
**Current as of 2026-07-17. All prices verified against official pricing pages/docs on that date. US-list / us-east-1 / annual-billing prices unless noted.**

---

## 1. DATADOG

Sources: https://www.datadoghq.com/pricing/ · https://docs.datadoghq.com/account_management/billing/ · https://docs.datadoghq.com/account_management/billing/custom_metrics/ · https://docs.datadoghq.com/tracing/trace_pipeline/ingestion_mechanisms/

### 1.1 Metered billing dimensions
- Infrastructure **hosts** (per host/month, high-watermark method)
- **Log ingestion** ($/GB) — separate from **log indexing** ($/million events, by retention tier)
- **APM hosts** + **ingested span volume** (GB) + **indexed span count** (millions)
- **Custom metrics** (cardinality = unique metric-name + tag-value combos, monthly hourly average)
- Many per-product meters (RUM sessions, synthetics runs, Flex Logs events, etc.)

### 1.2 Free tier
- Free plan: **up to 5 hosts, 1-day metric retention**. No log management, no APM, no alerting on the free plan. (https://www.datadoghq.com/pricing/)

### 1.3 Paid plans & unit prices
- **Infrastructure Pro: $15/host/mo annual ($18 on-demand)**; Enterprise **$23/host/mo ($27 on-demand)**. DevSecOps bundles $22/$34 annual.
- **Log ingest: from $0.10/GB** (uncompressed).
- **Log Standard Indexing: $1.70/million events/mo annual ($2.55 on-demand)** at 15-day retention; 3/7/30+ day tiers priced differently. **Flex Logs storage $0.05/M events/mo ($0.075 on-demand)**, Flex Starter $0.60/M ($0.90 on-demand), up to 15-month retention.
- **APM: $31/host/mo annual bundled ($48 on-demand)**; APM Pro $35, APM Enterprise $40. Included per APM host: **150 GB ingested spans + 1M indexed spans (15-day retention)**. Overage: **ingested spans $0.10/GB; indexed spans $1.27–$2.50/million** depending on retention.
- **Custom metrics: Pro includes 100/host, Enterprise 200/host** (pooled across all hosts). Overage: **ingested custom metrics $0.10 per 100**; **indexed** custom metric overage is "specified in your contract" (list-price rule of thumb historically ~$5/100/mo — confirm on your contract). (https://docs.datadoghq.com/account_management/billing/custom_metrics/)
- **Host billing = high-watermark**: hosts counted hourly; billing uses the **peak of the lower 99% of hourly counts** (top 1% of spike-hours excluded). One burst *day* still bills the whole month at that level. (https://docs.datadoghq.com/account_management/billing/)
- **APM span sampling defaults**: Agent head-based sampling targets **10 traces/sec per Agent** (`DD_APM_TARGET_TPS=10`), error sampler up to 10 traces/s (`DD_APM_ERROR_TPS`), rare sampler (5/s) off by default. Tracing libraries left at 100% sample rate can massively exceed the 150 GB allotment. (https://docs.datadoghq.com/tracing/trace_pipeline/ingestion_mechanisms/)

### 1.4 First quota an indie dev blows
**Log indexing and custom-metric cardinality.** A single chatty container logging 50 events/sec ≈ 130M events/mo ≈ **$220/mo indexed** at $1.70/M — before the $0.10/GB ingest. Second: tagging one custom metric with `user_id` at 10k users = 10,000 custom metrics = 100 hosts' worth of Pro allotment.

### 1.5 Cost traps for AI-agent-built apps
- Agent adds `user_id`/`request_id`/`session_id` as metric tags → cardinality explosion billed per combo.
- Default tracing = every span ingested; agent-generated retry loops multiply span volume.
- Autoscaling test bursts set the monthly high-watermark for host billing.
- Leaked `DD_API_KEY` lets anyone submit metrics/logs billed to you.
- Debug-level logging shipped to indexes instead of "ingest-only + exclusion filters."

### 1.6 Spend caps
**No hard cap exists.** Datadog is post-paid/on-demand; you can only set **usage alert monitors** (`datadog.estimated_usage.*` metrics) and index **daily quotas on log indexes** (a real per-index hard stop — set them). Billing itself: alerts only.

### 1.7 Check usage/spend
- Dashboard: **https://app.datadoghq.com/billing/usage** (Plan & Usage)
- API: `GET /api/v1/usage/summary`, `GET /api/v2/usage/hourly_usage` (https://docs.datadoghq.com/api/latest/usage-metering/)
- CLI: `dog` (dogshell, from `datadog` Python package); `datadog-ci` for CI products.

### 1.8 Detection keywords
`datadog-agent`, `dd-agent`, `dog` (dogshell), `datadog-ci`, `DD_API_KEY`, `DD_APM_TARGET_TPS`, `helm install datadog`

---

## 2. AWS CLOUDWATCH LOGS

Sources: https://aws.amazon.com/cloudwatch/pricing/ · https://docs.aws.amazon.com/AmazonCloudWatch/latest/logs/Working-with-log-groups-and-streams.html · https://aws.amazon.com/about-aws/whats-new/2025/05/amazon-cloudwatch-tiered-pricing-additional-destinations-aws-lambda-logs/

### 2.1 Metered billing dimensions
Log **ingestion** ($/GB, by log class), **storage** ($/GB-mo), **Logs Insights queries** ($/GB scanned), Live Tail minutes, data-protection scanning, plus adjacent meters: custom metrics, alarms, dashboards, API calls.

### 2.2 Free tier (always-free, monthly)
- **5 GB combined** across ingestion + archive storage + Logs Insights scanned data
- 1,800 Live Tail minutes; 10 custom metrics + 10 alarms; 3 dashboards; 1M API requests. (https://aws.amazon.com/cloudwatch/pricing/)

### 2.3 Pay-as-you-go prices (us-east-1)
- **Ingest, Standard class: $0.50/GB** (Infrequent Access class: **$0.25/GB**, fewer features)
- **Recent change (May 1, 2025):** Lambda/vended logs got volume-tiered ingest: $0.50 first 10 TB → $0.25 next 20 TB → $0.10 next 20 TB → $0.05 beyond; IA class from $0.25 tiering to $0.05. (https://aws.amazon.com/about-aws/whats-new/2025/05/amazon-cloudwatch-tiered-pricing-additional-destinations-aws-lambda-logs/)
- **Storage: $0.03/GB-month**
- **Logs Insights: $0.005/GB scanned per query** (pay for GB scanned, not matched)
- **Retention default: "Never Expire"** — log groups store data indefinitely (and bill storage forever) unless you set a retention policy. (https://docs.aws.amazon.com/AmazonCloudWatch/latest/logs/Working-with-log-groups-and-streams.html)
- Adjacent: custom metrics $0.30/metric/mo (first 10k), alarms $0.10, dashboards $3.50/mo, `GetMetricData` $0.01/1,000 metrics requested.

### 2.4 First quota an indie dev blows
**The 5 GB ingest free tier.** One Lambda/app with debug logging at ~7 KB/s of log output ≈ 18 GB/mo → ~$6.50 ingest, trivially 10x that with stack traces in a loop. Ingest at $0.50/GB is almost always the #1 line item — 16x the storage price.

### 2.5 Cost traps for AI-agent-built apps
- Agent scaffolds `console.log`/debug logging in Lambda → every invocation's logs are billed ingest at $0.50/GB, START/END/REPORT lines included.
- Retention "Never Expire" default → storage compounds forever.
- Dashboards/agents running broad Logs Insights queries on auto-refresh: each refresh re-scans GBs at $0.005/GB.
- Infinite retry/error loops in agent code → log volume explosion (ingest bills before you notice).
- Third-party monitoring tools polling `GetMetricData` → surprise API charges.
- No per-service kill switch: a leaked AWS key that can `PutLogEvents`/`PutMetricData` bills you directly.

### 2.6 Spend caps
**No hard cap. Alerts only.** AWS Budgets / billing alarms notify but never stop ingestion. Only mitigations: retention policies, IA log class, account-level Service Quotas (throttle PutLogEvents), or deleting the log group.

### 2.7 Check usage/spend
- Console: https://console.aws.amazon.com/cloudwatch/ (Log groups → Stored bytes) and Cost Explorer https://console.aws.amazon.com/costmanagement/
- CLI: `aws logs describe-log-groups --query 'logGroups[*].[logGroupName,storedBytes]'`; ingest volume: `aws cloudwatch get-metric-statistics --namespace AWS/Logs --metric-name IncomingBytes ...`; spend: `aws ce get-cost-and-usage --filter '{"Dimensions":{"Key":"SERVICE","Values":["AmazonCloudWatch"]}}' ...`

### 2.8 Detection keywords
`aws logs`, `aws cloudwatch`, `put-log-events`, `start-query` (Logs Insights), `aws ce get-cost-and-usage`, `amazon-cloudwatch-agent`, `awslogs`

---

## 3. SENTRY

Sources: https://sentry.io/pricing/ · https://docs.sentry.io/pricing/ · https://docs.sentry.io/pricing/quotas/ · https://sentry.zendesk.com/hc/en-us/articles/33563182442523-How-do-I-disable-pay-as-you-go-spend · https://docs.sentry.io/pricing/quotas/spend-allocation/

### 3.1 Metered billing dimensions
**Errors (per event)**, **spans (per span)**, **session replays (per replay)**, **attachments (GB)**, **logs (GB)**, cron monitors, uptime monitors, profiling hours, user seats (Team+ unlimited).

### 3.2 Free tier — Developer plan ($0, 1 user)
- **5,000 errors/mo, 5M spans/mo, 50 replays/mo, 1 GB attachments, 1 cron monitor**, error monitoring + tracing, 10 dashboards. No PAYG budget configurable on free plan — excess data is simply dropped. (https://sentry.io/pricing/)

### 3.3 Paid plans
- **Team: $26/mo annual** — 50k errors, 5M spans, 50 replays, 1 GB attachments included; unlimited users.
- **Business: $80/mo annual** — same base volumes, unlimited dashboards, advanced features. Enterprise: custom.
- **Pay-as-you-go overage unit prices** (tiered by volume; docs.sentry.io/pricing/): errors **Team $0.000120–$0.000290/event; Business $0.000240–$0.000890/event**; spans Team $0.0000014–$0.0000020, Business $0.0000029–$0.0000040/span; replays from ~$0.00196/replay; attachments $0.3125/GB; **logs/metrics $0.50/GB** (all plans include 5 GB logs — Sentry Logs pricing added 2025, https://sentry.zendesk.com/hc/en-us/articles/37503692223003). You can also pre-buy reserved volume cheaper than PAYG.
- **Pricing model change note:** current PAYG model replaced "on-demand" for plans after **June 11, 2024** (legacy: https://docs.sentry.io/pricing/legacy-pricing/).

### 3.4 First quota an indie dev blows
**5,000 errors/month on the free plan.** One unhandled exception in a render/request loop emits thousands of identical events — 5k can be gone in minutes. Second: 5M spans, if tracesSampleRate is set to 1.0 (many AI scaffolds do exactly this).

### 3.5 Cost traps for AI-agent-built apps
- Scaffolds setting `tracesSampleRate: 1.0` (and `replaysSessionSampleRate: 1.0`) in generated `Sentry.init()` → span/replay burn.
- Crash loops / retry loops → error quota exhausted, then either dropped data (cap) or PAYG spend.
- DSN is public by design (in client JS) — anyone can spam events into your quota; use inbound filters/rate limits per key.
- Agents wiring `captureException` inside `catch` in a polling loop.
- Upside vs the other two: worst case is bounded by your PAYG budget.

### 3.6 Spend caps
**YES — a true hard cap, and it is effectively ON by default.** You pay only reserved plan volume + a PAYG budget you explicitly set; **if you never set a PAYG budget, overage data is dropped and you're charged nothing extra**. Budget is shared across categories by default (first-come-first-served) or per-category; set it to $0 to disable overage spend entirely. When reserved + PAYG are exhausted, "events... will not be accepted." (https://docs.sentry.io/pricing/quotas/, https://sentry.zendesk.com/hc/en-us/articles/33563182442523)

### 3.7 Check usage/spend
- Dashboard: `https://<org>.sentry.io/settings/billing/overview/` and Stats page `https://<org>.sentry.io/stats/`
- API: `GET https://sentry.io/api/0/organizations/{org}/stats_v2/` (https://docs.sentry.io/api/organizations/)
- CLI: `sentry-cli` (no billing subcommand; use API for usage).

### 3.8 Detection keywords
`sentry-cli`, `sentry-cli releases`, `sentry-cli sourcemaps`, `SENTRY_DSN`, `SENTRY_AUTH_TOKEN`, `Sentry.init`, `@sentry/` (npm), `sentry-sdk` (pip)

---

## Cross-service summary

| | Hard spend cap? | Free tier | Most dangerous meter |
|---|---|---|---|
| Datadog | **No** (log-index daily quotas only; usage alerts) | 5 hosts, 1-day retention, no logs/APM | Log indexing $1.70/M events; custom-metric cardinality; host high-watermark |
| CloudWatch Logs | **No** (AWS Budgets = alerts only) | 5 GB/mo combined ingest+storage+scan | Ingest $0.50/GB + "Never Expire" retention default + $0.005/GB-scanned queries |
| Sentry | **Yes** (reserved + PAYG budget; overage dropped if budget unset/$0) | 5k errors, 5M spans, 50 replays, 1 GB attachments, 5 GB logs | Errors 5k/mo (crash loop); spans at tracesSampleRate 1.0 |

**Key source URLs:** https://www.datadoghq.com/pricing/ · https://docs.datadoghq.com/account_management/billing/ · https://docs.datadoghq.com/account_management/billing/custom_metrics/ · https://docs.datadoghq.com/tracing/trace_pipeline/ingestion_mechanisms/ · https://aws.amazon.com/cloudwatch/pricing/ · https://docs.aws.amazon.com/AmazonCloudWatch/latest/logs/Working-with-log-groups-and-streams.html · https://aws.amazon.com/about-aws/whats-new/2025/05/amazon-cloudwatch-tiered-pricing-additional-destinations-aws-lambda-logs/ · https://sentry.io/pricing/ · https://docs.sentry.io/pricing/ · https://docs.sentry.io/pricing/quotas/ · https://docs.sentry.io/pricing/quotas/spend-allocation/ · https://sentry.zendesk.com/hc/en-us/articles/33563182442523 · https://sentry.zendesk.com/hc/en-us/articles/37503692223003

## Engine B — grok (raw)

# Observability pricing factsheet — July 2026

Verified against official pages on **2026-07-17**. Region for AWS figures: **US East (N. Virginia)** unless noted. List prices change; re-check before committing.

---

## Cross-service summary (indie-dev mental model)

| Service | Free wall | Paid model | Hard spend stop? | Blows first for agent apps |
|---|---|---|---|---|
| **Datadog** | Free plan: **≤5 hosts**, 1-day metrics; no free full Logs/APM | Host high-watermark + per-GB/per-M add-ons | **No** (alerts/monitors only) | **Custom-metric cardinality** or **log index $**/host floor |
| **CloudWatch Logs** | **5 GB**/mo (ingest + archive + Insights scan share) | $/GB ingest + $/GB-mo storage + $/GB scanned | **No** (Budgets = alerts; optional actions) | **Log ingest 5 GB** (Lambda/verbose defaults) |
| **Sentry** | **Developer $0**: 5k errors, 5M spans, 50 replays, 5 GB logs | Plan base + reserved + PAYG budget | **Yes**, if PAYG budget set; then **drop events** | **5k errors/mo** (error loops / unsampled crashes) |

---

# 1. Datadog

**Sources:** [Pricing](https://www.datadoghq.com/pricing/), [Billing/Pricing docs](https://docs.datadoghq.com/account_management/billing/pricing/), [APM billing](https://docs.datadoghq.com/account_management/billing/apm_tracing_profiler/), [Custom metrics billing](https://docs.datadoghq.com/account_management/billing/custom_metrics/), [Usage details](https://docs.datadoghq.com/account_management/plan_and_usage/usage_details/), [14-day free trial](https://www.datadoghq.com/free-datadog-trial/)

### 1. Metered dimensions (focus set)

| Dimension | How metered | Public list rate (typical) |
|---|---|---|
| **Infrastructure hosts** | Hourly unique hosts; **HWMP** = 99th-percentile high-water (drops top 1% of hours); Feb uses 8th-highest in some APM wording | Free ≤5; Pro **$15**/host/mo annual / **$18** on-demand; Ent **$23** / **$27** |
| **Custom metrics (cardinality)** | Unique `{metric name + tags (+ host)}` series; **monthly avg of hourly counts** | Allotment **100/host Pro**, **200/host Ent** (account-wide pool). Ingested overage (Metrics without Limits): **$0.10 per 100** series over allotment. Indexed overage: **contract-priced** (not a fixed public SKU) |
| **Log ingest** | Uncompressed GB ingested (or compressed GB scanned on rehydrate) | **$0.10/GB**/mo (annual or on-demand listed as $0.10) |
| **Log index (Standard)** | Per **million log events** indexed, by retention | **15-day: $1.70/M** annual; **$2.55/M** on-demand; other retentions (3/7/30/30+) on pricing page / contact |
| **Flex Logs** | Per million events stored + Flex Compute instance-hours | Storage from **$0.05/M**/mo annual; Starter **$0.60/M**; compute from **$0.05**/instance-hour |
| **APM hosts** | Same HWMP host model on hosts sending traces | APM **$31**/host/mo annual (pricing + APM docs); Pro **$35**; Enterprise **$40**; on-demand often **~$36** for base APM (marketing list) |
| **APM ingested spans** | GB of spans ingested | **150 GB/host/mo** included; overage **$0.10/GB** |
| **APM indexed spans** | Million spans kept via retention filters | **1M indexed spans/host/mo** included; overage **$1.70/M** |
| **Containers (infra)** | Beyond allotment (5 Pro / 10 Ent per host) | **$0.002**/container/hour on-demand path |

**Host high-watermark (HWMP):** count hosts each hour → sort → bill the max of the **lower 99%** (spike shield). Alternative **MHP**: monthly commit + hourly overage.

### 2. Free tier — exact quotas

| Item | Quota |
|---|---|
| **Infrastructure Free** | **$0**, **up to 5 hosts**, **1-day** metric retention, core collection/visualization |
| **Logs / APM / full custom-metrics scale** | **Not free** as a full product; trial only |
| **Free trial** | **14 days** “unlimited monitoring” trial (then Free 5-host or paid) |

There is **no** permanent free allotment for production Logs indexing or APM hosts beyond trial + Free infra limits.

### 3. Paid plans (names, price, included, overage)

| Plan | Base price | Included (highlights) | Overage / extras |
|---|---|---|---|
| **Free** | $0 | ≤5 hosts, 1-day metrics | Hard product limits |
| **Infrastructure Pro** | **$15**/host/mo annual · **$18** on-demand | 15-mo metrics, 100 custom metrics/host, 5 containers/host, 500 custom events/host | Custom metrics / containers / logs / APM billed separately |
| **Infrastructure Enterprise** | **$23** / **$27** | 200 custom metrics/host, 10 containers/host, ML alerts, Live Processes, etc. | Same pattern |
| **Log Management** | Usage | Ingest **$0.10/GB**; Index 15d **$1.70/M** (ann) / **$2.55/M** (OD) | Flex tiers; forward custom dest **$0.25/GB**/destination |
| **APM / APM Pro / APM Enterprise** | **$31 / $35 / $40** per APM host/mo (list) | **1M indexed + 150 GB ingested spans** per APM host | Indexed **$1.70/M**; ingest **$0.10/GB**; Fargate APM **$6**/task/mo (195k indexed + 30 GB ingest) |

### 4. What an indie app blows first (and at what usage)

1. **Leaving Free:** 6th concurrent host → must pay Pro (~**$15–18**/host) or drop hosts.  
2. **On Pro + Agent defaults:** **custom metrics cardinality** — allotment **100 series/host**. Tagging `user_id` / `request_id` on gauges can create **tens of thousands** of series; billable = monthly average of hourly cardinality. Even without public fixed indexed $/metric, this is the classic “silent bill” line after hosts.  
3. **Logs:** Ingest is cheap (**$0.10/GB**); **indexing** dominates. Example: **10M** events/mo at 15-day index ≈ **10 × $1.70 = $17** annual rate (plus ingest).  
4. **APM on:** **1 host APM ≈ $31+/mo** floor before span overages; default high sampling can burn **indexed span** allotment (1M/host) if retention filters keep everything.

### 5. Cost traps (AI-agent-built apps)

- Agent installs **Infra + Logs + APM** with default sampling → host + span + log triple bill.  
- **One Agent per container** treated as **one host each** (huge bill).  
- DogStatsD / OTel with high-cardinality tags → custom metrics explosion.  
- Index **all** logs (no exclusion filters / Logging without Limits routing).  
- Rehydrate archives: **$0.10/GB scanned** + re-index.  
- Kubernetes: APM billed by **nodes**, but profiler container allotments can add **$2**/extra profiled container.  
- Leaked `DD_API_KEY` → anyone can submit metrics/logs/traces to your org.

### 6. Spend caps

| | |
|---|---|
| **Hard cap that stops billing?** | **No** product-wide hard $ cap by default |
| **Default** | Usage bills open-ended after commit; AI Credits: overage auto-bills on-demand |
| **What exists** | Usage dashboards, estimated-usage metrics, **cost monitors** (alerts) — opt-in |

### 7. How to check usage / spend

| Path | Where |
|---|---|
| Dashboard | [https://app.datadoghq.com/billing/usage](https://app.datadoghq.com/billing/usage) · Plan & Usage |
| API | Usage Metering: billable / hourly / custom-metrics endpoints (`/api/v1/usage/...`, `/api/v2/usage/...`) |
| Metrics | `datadog.estimated_usage.apm.ingested_bytes`, logs/metrics estimated usage series |
| CLI | Prefer **Pup** (Dogshell deprecated); no first-class “show my bill” one-liner — use API keys + curl |

### 8. Shell-command keywords (detection only)

```
datadog-ci
pup
dog
DD_API_KEY
DD_APP_KEY
DD_SITE
```

---

# 2. Amazon CloudWatch Logs

**Sources:** [CloudWatch pricing](https://aws.amazon.com/cloudwatch/pricing/), [Log groups retention docs](https://docs.aws.amazon.com/AmazonCloudWatch/latest/logs/Working-with-log-groups-and-streams.html), [AWS Budgets](https://docs.aws.amazon.com/cost-management/latest/userguide/budgets-managing-costs.html), [Billing alarm](https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/monitor_estimated_charges_with_cloudwatch.html)

### 1. Metered dimensions (logs focus)

| Dimension | Unit | US-East example rate |
|---|---|---|
| **Ingest — Standard class** | $/GB ingested | **$0.50/GB** (examples use flat $0.50; vended logs use tiered $0.50→$0.05 by TB) |
| **Ingest — Infrequent Access** | $/GB | **$0.25/GB** (examples) |
| **Archive storage** | $/GB-month (compressed) | **$0.03/GB-mo** |
| **Logs Insights** | $/GB **scanned** | **$0.005/GB** (widely cited on pricing materials / third-party mirrors of the Insights line; confirm region tab) |
| **Live Tail** | $/minute after free | **$0.01/min** after free allotment |
| **Data protection scan** | $/GB scanned | **$0.12/GB** (examples) |
| **Vended logs** (VPC/ALB/etc. delivery) | Tiered $/GB to CW/S3/Firehose | e.g. 0–10 TB **$0.50**, 10–30 **$0.25**, 30–50 **$0.10**, 50+ **$0.05** |

### 2. Free tier — exact quotas (CloudWatch Logs)

From official free-tier table:

| Item | Exact free amount |
|---|---|
| **Logs data** | **5 GB** of data covering **ingestion, archive storage, and data scanned by Logs Insights** (shared pool wording on pricing page) |
| **Live Tail** | **1,800 minutes**/month |
| **Contributor Insights** | **1 rule**/mo + first **1M** matched events |

Also free (broader CloudWatch, not only Logs): 10 custom/detailed metrics, 1M API requests (with exclusions), 3 dashboards, 10 standard alarms, etc.

### 3. Paid plans

CloudWatch Logs is **pure pay-as-you-go** — no named “Team/Pro” log plan.

| After free tier | Price (US-East examples) |
|---|---|
| Standard ingest | **$0.50/GB** |
| Infrequent Access ingest | **$0.25/GB** |
| Storage | **$0.03/GB-mo** |
| Insights | **$0.005/GB scanned** |
| Live Tail | **$0.01/min** over 1,800 free minutes |

### 4. What an indie app blows first

**5 GB/month Logs free pool** — usually **ingest**, sometimes **Insights scan**.

Rough thresholds:

| Source | Approx. when free 5 GB dies |
|---|---|
| Lambda `console.log` every request | ~**5 GB** raw logs ≈ **few hundred MB–several GB** of app traffic depending on verbosity; a chatty API can exhaust free tier in **days** |
| Retention **Never Expire** | Storage climbs every month (after free 5 GB storage) at **$0.03/GB-mo** forever |
| Incident dashboards with Insights | Re-scan of multi-GB log groups → **scan $** even if ingest was free earlier |

### 5. Cost traps (AI-agent apps)

- **Default retention = never expire** (“Never Expire”) → storage accumulates forever.  
- Framework/Lambda **debug logging** left on in prod.  
- VPC Flow Logs / ALB access logs → multi-GB/day vended log bills.  
- Unbounded **Logs Insights** queries (`fields @message` over long windows) → scan entire groups.  
- EMF / Container Insights “enhanced” → metrics **and** log ingest.  
- Cross-region copy / centralization extras.  
- No org-level stop → bill fails open.

### 6. Spend caps

| | |
|---|---|
| **Hard cap by default?** | **No** |
| **AWS Budgets** | **Alerts** by default; optional **budget actions** (e.g. apply SCP, stop instances) — **not** auto-on |
| **Billing alarm** | CloudWatch alarm on `EstimatedCharges` — **notify only** |
| **Free Tier** | Auto usage alerts near limits exist for Free Tier tracking; **does not hard-stop** paid CloudWatch usage |

### 7. How to check usage / spend

| Path | Command / URL |
|---|---|
| Cost Explorer | Console → Billing → Cost Explorer; filter service **AmazonCloudWatch** |
| CLI cost | `aws ce get-cost-and-usage` |
| Free Tier | `aws ce get-free-tier-usage` (where supported) |
| Log groups size/retention | `aws logs describe-log-groups` |
| Insights | Console Log Insights (bills scan) |
| Budgets | `aws budgets describe-budgets` |
| Dashboard | [https://console.aws.amazon.com/cloudwatch/](https://console.aws.amazon.com/cloudwatch/) · [https://console.aws.amazon.com/costmanagement/home](https://console.aws.amazon.com/costmanagement/home) |

### 8. Shell-command keywords

```
aws logs
aws ce
aws budgets
aws cloudwatch
describe-log-groups
put-retention-policy
start-query
get-cost-and-usage
get-free-tier-usage
```

---

# 3. Sentry

**Sources:** [sentry.io/pricing](https://sentry.io/pricing/), [docs.sentry.io/pricing](https://docs.sentry.io/pricing/), [Quota management](https://docs.sentry.io/pricing/quotas/)

### 1. Metered dimensions

| Category | Unit |
|---|---|
| **Errors** | Per error event |
| **Spans (Tracing)** | Per span |
| **Logs** | Per GB |
| **Application metrics** | Per GB |
| **Session Replay** | Per replay |
| **Attachments** | Per GB |
| **Cron / Uptime monitors** | Per monitor |
| **Continuous / UI profiling** | Per profile-hour (PAYG only) |
| **Seer (AI)** | **$40 / active contributor / mo** (not drawn from PAYG) |

Billing model: **reserved volume** (in plan or prepaid) + shared **PAYG budget** → excess after both is **dropped**, not billed.

### 2. Free tier — Developer plan (exact)

| Item | Quota |
|---|---|
| Price | **$0** |
| Users | **1** |
| Errors | **5,000 / month** |
| Logs | **5 GB** |
| Application metrics | **5 GB** |
| Spans | **5,000,000** |
| Replays | **50** |
| Uptime monitors | **1** |
| Cron monitors | **1** |
| Attachments | **1 GB** |
| Size analysis builds | **100** |
| Dashboards | **10** custom |
| Retention lookback | **30 days** |
| Alerts | Email only |

### 3. Paid plans

| Plan | Price (annual list) | Included (default prepaid) | Notable extras |
|---|---|---|---|
| **Team** | **$26/mo** | 50k errors, 5M spans, 50 replays, 5 GB logs, 5 GB app metrics, 1 cron, 1 uptime, 1 GB attachments, 100 size builds | Unlimited users; integrations; PAYG overages |
| **Business** | **$80/mo** | Same volume defaults as Team | Advanced quotas, SAML/SCIM, unlimited dashboards/monitors features |
| **Enterprise** | Custom | Custom volumes | TAM, custom |

**Team error PAYG (per error, rounded in docs):**

| Volume band | Team PAYG $/error |
|---|---|
| >50k–100k | **$0.0003625** |
| >100k–500k | **$0.0002188** |
| >500k–10M | **$0.0001875** |
| >10M–20M | **$0.0001625** |
| >20M | **$0.0001500** |

**Logs / app metrics PAYG:** **$0.50/GB** (Team & Business).  
**Spans PAYG (Team):** **$0.0000020** /span (5M–100M), then **$0.0000018**.  
**Replay PAYG:** from **~$0.00375**/replay in first band.  
**Cron +$0.78**, **Uptime +$1.00** per extra monitor.  
**Cont. profile $0.0315/hr**, **UI profile $0.25/hr**.

**Recent change (dated):** **Seer** — as of **January 2026**, legacy Seer (**$20/mo + $25 credits**) no longer offered as add-on; current is **$40/active contributor/mo** (2+ PRs to a Seer-enabled repo).

**Legacy note:** Pricing docs for **transactions / performance units** apply only to **plans before 2024-06-11**; current is **span-based**.

### 4. What an indie app blows first

On **Developer free**:

1. **5,000 errors/month** — first wall for almost every crash-looping or poorly filtered app.  
   - Example: unhandled exception on **1% of 500k monthly requests** → **5,000 errors** → free quota gone.  
2. **50 replays** — if Session Replay enabled with high sample rate.  
3. **5M spans** — if tracing sample rate stays at default high / 100% on a busy API.  
4. **5 GB logs** — if Sentry Logs product is turned on with chatty logging.

On **Team $26** without PAYG budget: same categories at **50k errors / 5M spans** then **drop**.

### 5. Cost traps (AI-agent apps)

- Scaffold enables **errors + performance + replay + profiling** at high sample rates.  
- Error loop (retry storm, health-check 500s) burns **error** quota in hours.  
- `send_default_pii` / huge breadcrumbs → payload size / attachment pressure.  
- **Ignored** issues still count if events keep arriving.  
- Enabling **Seer** → separate **$40/contributor** line (not covered by PAYG).  
- Raising PAYG without a ceiling → **fail-open billing** until budget number.  
- Leaked **DSN** → public clients can inject events (quota theft / noise).

### 6. Spend caps

| | |
|---|---|
| **Hard cap?** | **Yes, effectively** via **PAYG budget + reserved volume** |
| **On by default?** | Free: hard quota. Paid: you set PAYG; **zero/unset PAYG** means reserved only then **drop** |
| **Behavior past budget** | Data **dropped**; **not charged** for overage beyond budget |
| **Spike Protection** | Per-project; drops spike volume for errors/spans/attachments when enabled |
| **Spend notifications** | Available on paid plans (alerts ≠ automatic raise of budget) |

Business adds **advanced quota management** / spend allocation.

### 7. How to check usage / spend

| Path | Where |
|---|---|
| UI Stats | `https://sentry.io/organizations/<org>/stats/` |
| Subscription | Settings → **Usage & Billing** → **Subscription** |
| Docs | Quota mgmt under Settings; project rate limits under Client Keys (DSN) |
| CLI | `sentry-cli` (releases, sourcemaps, logs stream — **not** primary billing UI) |
| API | Organization stats / billing endpoints via auth token |

### 8. Shell-command keywords

```
sentry-cli
sentry-cli info
sentry-cli releases
sentry-cli sourcemaps
sentry-cli logs
SENTRY_AUTH_TOKEN
SENTRY_DSN
```

---

# Side-by-side: free tiers (numbers only)

| Meter | Datadog Free | CloudWatch Logs Free | Sentry Developer |
|---|---|---|---|
| Hosts / users | **5 hosts** | n/a (AWS account) | **1 user** |
| Logs | **None** (paid product) | **5 GB** (ingest+storage+Insights scan) | **5 GB** |
| Errors / events | n/a | n/a | **5,000 errors** |
| Traces / spans | Paid APM | X-Ray has separate free 100k traces (not CW Logs) | **5M spans** |
| Replays | Paid RUM | n/a | **50** |
| Retention default | Free metrics **1 day** | Logs **never expire** until you set | **30-day** lookback |

---

# Side-by-side: spend control

| | Datadog | CloudWatch | Sentry |
|---|---|---|---|
| Hard $ stop default | **No** | **No** | **Quota/PAYG budget** (events drop) |
| Alerts only by default | Yes | Yes (Budgets/alarms) | Spend notifications + hard drop at budget |
| Fail-open overage | **Yes** | **Yes** | **Only inside PAYG budget** |

---

# Indie-dev “order of pain” for a typical agent-scaffolded stack

1. **Sentry free errors (5k)** — crash loops / unfiltered browser SDK.  
2. **CloudWatch Logs 5 GB** — Lambda/container stdout left at debug.  
3. **Datadog** — either **5-host Free wall** or, once paid, **host + APM floor ($15–$31+/host)** and **custom metric tags** / **log indexing**.

---

# Detection cheat-sheet (CLI names only)

```
# Datadog
datadog-ci  pup  dog

# AWS / CloudWatch
aws logs  aws ce  aws budgets  aws cloudwatch

# Sentry
sentry-cli
```

---

### Source index (every number family)

| Topic | URL |
|---|---|
| Datadog product pricing | https://www.datadoghq.com/pricing/ |
| Datadog billing units / HWMP | https://docs.datadoghq.com/account_management/billing/pricing/ |
| Datadog APM host/spans | https://docs.datadoghq.com/account_management/billing/apm_tracing_profiler/ |
| Datadog custom metrics | https://docs.datadoghq.com/account_management/billing/custom_metrics/ |
| Datadog usage UI/API | https://docs.datadoghq.com/account_management/plan_and_usage/usage_details/ |
| Datadog free trial | https://www.datadoghq.com/free-datadog-trial/ |
| CloudWatch pricing / free tier | https://aws.amazon.com/cloudwatch/pricing/ |
| CW log retention default | https://docs.aws.amazon.com/AmazonCloudWatch/latest/logs/Working-with-log-groups-and-streams.html |
| AWS Budgets | https://docs.aws.amazon.com/cost-management/latest/userguide/budgets-managing-costs.html |
| Sentry plans UI | https://sentry.io/pricing/ |
| Sentry pricing & PAYG tables | https://docs.sentry.io/pricing/ |
| Sentry quotas / drop behavior | https://docs.sentry.io/pricing/quotas/ |

**Caveats:** Datadog **indexed** custom-metric overage and some multi-year discounts are **contract-specific**. CloudWatch **region** rates differ. Sentry calculator on pricing page is authoritative for live Team/Business PAYG tiers; always open the live page before budgeting.
