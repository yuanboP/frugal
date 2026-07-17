# Indie-dev metered services — quotas, plans, traps (researched 2026-07)

12 service groups researched dual-engine (Claude web search + grok CLI), cross-checked against official pricing pages 2026-07-17. Raw engine reports: `research/round2/` at the repo root.

## Firebase (Google Cloud) — Spark/Blaze plans, verified 2026-07-17

**Billing dimensions**

- Firestore Standard: doc reads/writes/deletes (per 100K), GiB-month stored (incl. indexes), network egress; billed-only: TTL deletes, PITR, backups, restore/clone; min 1 read per query even if empty; offset bills skipped docs
- Firestore Enterprise (MongoDB-compatible): read units (4 KiB), write units (1 KiB), real-time update units
- Cloud Functions 1st gen: invocations, GB-seconds, GHz-seconds, egress GB, Cloud Build minutes, Artifact Registry storage; 2nd gen bills as Cloud Run: vCPU-s + GiB-s + requests
- Cloud Storage: GB-month stored, GB downloaded, upload ops, download ops (Blaze-only since Feb 3 2026)
- Hosting: GB stored, GB CDN transfer
- App Hosting (separate, Blaze-only): uncached/cached bandwidth GiB, storage, plus underlying Cloud Run/Build/Artifact Registry/Logging
- Realtime Database: GB stored, GB downloaded (connections capped at 200K/db, not billed per-connection)
- Authentication: MAU; phone auth per SMS (Blaze)

**Free tier**

Spark $0, no card; quotas are HARD stops (service refuses until reset ~midnight PT / month rollover). Firestore: 1 GiB stored, 50K reads/day, 20K writes/day, 20K deletes/day, 10 GiB egress/mo (ONE free DB per project; extra named DBs get no free quota). Enterprise ed.: 50K read units/40K write units/day, 1 GiB. Hosting: 10 GB stored + free transfer (pricing page: 360 MB/day; Hosting docs: 10 GB/mo — same ~10 GB/mo volume; Spark site disabled after grace period when hit). RTDB: 1 GB stored, 10 GB/mo download, 100 connections. Auth: 50K MAU, 50 SAML/OIDC MAU. Functions: CANNOT deploy on Spark (Blaze required); free allowance lives on Blaze: 2M invocations/mo, 400K GB-s, 200K GHz-s, 5 GB egress, 500 MB Artifact Registry. Cloud Storage: NONE on Spark since Feb 3 2026 (Blaze required); on Blaze legacy *.appspot.com buckets: 5 GB stored + 1 GB/day download + 20K upload ops/day + 50K download ops/day; new *.firebasestorage.app buckets (US regions only): 5 GB-months + 100 GB/mo download + 5K upload ops/mo + 50K download ops/mo. All free amounts carry over to Blaze as included allowance, then open-ended metering.

**Plans**

| Plan | Price | Included | Overage |
|---|---|---|---|
| Spark | $0 (no payment method) | All free quotas above; hard fail-closed ceilings; no Cloud Functions deploys, no Cloud Storage (since Feb 3 2026), phone-auth SMS unavailable | None — service stops/deploy blocked until quota reset or upgrade |
| Blaze | $0/month base, pay-as-you-go; $300 GCP credit for eligible new upgrades | Same free quotas as Spark as monthly/daily allowances (incl. Functions 2M invocations/400K GB-s/200K GHz-s/5 GB egress and Storage no-cost buckets) | Firestore us-central1: $0.03/100K reads, $0.09/100K writes, $0.01/100K deletes, ~$0.15/GiB-mo stored ($0.000205479/GiB/hr), egress ~$0.12/GiB after 10 GiB (nam5 multi-region ~2x ops). Functions 1st gen: $0.40/M invocations, $0.0000025/GB-s + $0.0000100/GHz-s (Tier 1; $0.0000035/$0.0000140 Tier 2), $0.12/GB egress; Artifact Registry $0.10/GB-mo after 500 MB. 2nd gen (Cloud Run T1): $0.000024/vCPU-s, $0.0000025/GiB-s, $0.40/M requests. Storage: $0.026/GB-mo, $0.12/GB download, $0.05/10K uploads, $0.004/10K downloads (new buckets at standard GCS rates). Hosting: $0.026/GB stored, $0.15/GB transfer. App Hosting: $0.20/GiB uncached + $0.15/GiB cached after 10 GiB/mo, $0.10/GB storage after 5 GB. RTDB: $5/GB-mo stored, $1/GB downloaded. Auth: Identity Platform tiers past 50K MAU; SMS per message |

**What blows first**: Firestore document reads, 50,000/day. One unbounded onSnapshot/getDocs on a ~500-doc collection with ~100 DAU opening twice = ~100K reads/day (2x quota day one); ~0.6 reads/s continuous or one bad 50K-doc query does it. Next: Firestore 20K writes/day (chat/telemetry/updatedAt spam, agent retry loops), then Hosting transfer (~10 GB/mo: one 2 MB bundle x ~180 visits/day) and Storage 1 GB/day download. On Blaze the overage is deceptively cheap ($0.03/100K reads ≈ $9/mo per 1M reads/day) — the real explosions come from loops, not unit prices.

**Spend cap status**: NO hard dollar cap exists on Blaze and nothing is on by default. Official docs: budgets and budget alerts do NOT cap usage or charges, and alerts can lag actual spend by hours to days; Google explicitly won't shut services off at budget. Blaze upgrade flow prompts a budget alert — email only, not enforcement. Spark quotas are the only built-in hard stops (but Spark can't run Functions/Storage). Only DIY kill switch: budget Pub/Sub notification -> Cloud Function calling Cloud Billing API to detach billing (kills all project services, can lose data): https://cloud.google.com/billing/docs/how-to/disable-billing-with-notifications

**Cost traps**

- Recursive Firestore triggers: onWrite/onDocumentUpdated writing back to the triggering doc/collection loops forever — docs warn of infinite loops; use onCreate, compare before/after and exit early, write idempotent handlers (at-least-once delivery). Real multi-$10K incident reports exist (anecdotal, unverified)
- maxInstances unset: 1st gen HTTP functions have NO default max (unbounded to project/region capacity); 2nd gen defaults to 100 (raiseable to 1,000). Always set setGlobalOptions({maxInstances}) (v2) / runWith({maxInstances}) (v1)
- minInstances left on: idle instances bill continuously (CLI shows cost estimate at deploy)
- 2nd gen CPU default is 1 full vCPU even at 128–512 MB memory — costlier per ms than 1st gen fractional CPU unless cpu:'gcf_gen1'
- Open Security Rules are the real exposure, not 'leaked' API keys: web API keys are public by design and auto-restricted since May 2024; test-mode 'allow read, write: if true' lets anyone run your meters. Never allowlist Generative Language (Gemini) on a public browser key — real multi-$10k Gemini-key incidents
- /__/firebase/init.json: every Hosting site publicly serves project config at this reserved URL, cannot be disabled — bots scan it to find open Firestore; only defenses are Rules + App Check + key API restrictions
- Client-side unbounded queries: getDocs(collection(...)) with no limit(); offset() bills skipped docs; security-rule get()/exists() multiply reads; listeners re-read on reconnect
- Storage now forces Blaze (Feb 3 2026): adding Storage puts a card on file and removes the Spark fail-closed safety net for the whole project — every loop becomes billable instead of blocked
- Unauthenticated HTTP functions: any bot drives invocations + egress + downstream API calls (DoS = your bill)
- Deploy thrash: every 'firebase deploy --only functions' burns Cloud Build minutes and piles Artifact Registry images past the 500 MB free — set firebase functions:artifacts:setpolicy
- Extra named Firestore databases get NO free quota — all usage billed from op 1

**How to check usage**: Console: https://console.firebase.google.com/project/_/usage (and /usage/details); per-product: /firestore/usage, /functions/usage, /hosting/usage, /storage/usage, /authentication/usage. Dollars live only in GCP Billing: https://console.cloud.google.com/billing -> Reports (+ BigQuery billing export); quotas at https://console.cloud.google.com/iam-admin/quotas. CLI: no 'firebase usage' spend command exists — use gcloud billing accounts list; gcloud billing projects describe PROJECT_ID; gcloud billing budgets list --billing-account=X; gcloud monitoring (e.g. firestore.googleapis.com/document/read_count); firebase functions:log. APIs: cloudbilling.googleapis.com, billingbudgets.googleapis.com, Cloud Monitoring. Blaze calculator: https://firebase.google.com/pricing#blaze-calculator

**Unresolved conflicts**

- Hosting free transfer: Report A said 360 MB/day, Report B said 10 GB/month — BOTH official pages verified live 2026-07-17 and they disagree with each other: firebase.google.com/pricing shows '360 MB/day' while docs/hosting/usage-quotas-pricing shows '10 GB/month'. Equivalent volume (~10.8 vs 10 GB/mo); pricing page preferred per instructions -> 360 MB/day, monthly framing noted
- Cloud Storage new *.firebasestorage.app bucket free tier: A gave 5 GB-months / 100 GB-mo download / 5K upload ops-mo / 50K download ops-mo; B said only 'GCS Always Free, US regions' — pricing page CONFIRMS A's exact numbers (US regions only)
- maxInstances defaults: A said 2nd gen=100 and 1st gen 'scales far higher'; B said 1st gen HTTP has NO default max, 2nd gen 100 (raiseable to 1,000) — merged using B's precise wording, consistent with A
- Second quota blown: A ranked Hosting 360 MB/day second; B ranked Firestore 20K writes/day second — judgment call, both kept (writes second for write-heavy apps, Hosting for asset-heavy)
- App Hosting product absent from A — B's rows ($0.20/GiB uncached, $0.15 cached after 10 GiB/mo, $0.10/GB after 5 GB, from Aug 1 2025) CONFIRMED on pricing page, included
- Storage ops overage prices ($0.05/10K upload, $0.004/10K download) only in B — CONFIRMED on pricing page
- A's incident dollar figures ($10K single-function, $121K/2 days, B's multi-$10k Gemini bills) are community anecdotes, not official — labeled anecdotal/unverified
- Firestore Enterprise free writes: A said 40K write-unit/day plus 50K realtime-update units — pricing page confirms 50K read units + 40K write units/day; realtime-update free number not shown in fetch, kept unquantified

**Sources**

- https://firebase.google.com/pricing
- https://firebase.google.com/docs/firestore/pricing
- https://cloud.google.com/firestore/pricing
- https://cloud.google.com/functions/pricing-1stgen
- https://cloud.google.com/run/pricing
- https://firebase.google.com/docs/hosting/usage-quotas-pricing
- https://firebase.google.com/docs/projects/billing/avoid-surprise-bills
- https://firebase.google.com/docs/projects/api-keys
- https://firebase.google.com/docs/storage/faqs-storage-changes-announced-sept-2024
- https://firebase.google.com/docs/functions/firestore-events
- https://firebase.google.com/docs/functions/manage-functions
- https://docs.cloud.google.com/functions/docs/configuring/max-instances
- https://firebase.google.com/docs/hosting/reserved-urls
- https://cloud.google.com/billing/docs/how-to/disable-billing-with-notifications
- https://firebase.google.com/docs/app-hosting/costs

---

## Datadog + AWS CloudWatch Logs + Sentry (merged factsheet, verified 2026-07-17, US-list/us-east-1/annual)

**Billing dimensions**

- Datadog: infra hosts (hourly count, high-watermark = peak of lower 99% of hours)
- Datadog: custom metric series (unique metric+tag combos, monthly avg of hourly counts; 100/host Pro, 200/host Ent pooled)
- Datadog: log ingestion $/GB (separate meter from log indexing $/million events by retention)
- Datadog: APM hosts + ingested span GB + indexed span millions
- CloudWatch Logs: ingest $/GB by class (Standard/IA; vended/Lambda logs volume-tiered since 2025-05)
- CloudWatch Logs: storage $/GB-mo (compressed), Logs Insights $/GB scanned per query, Live Tail $/min
- Sentry: errors/event, spans/span, replays/replay, attachments GB, logs GB, cron+uptime monitors, profile hours; reserved volume + shared PAYG budget

**Free tier**

Datadog Free: 5 hosts, 1-day metric retention, NO logs/APM/alerting (14-day trial only). CloudWatch always-free: 5 GB/mo shared across ingest+archive storage+Insights scan, 1,800 Live Tail min, 10 custom metrics, 10 alarms, 3 dashboards, 1M API req. Sentry Developer $0: 1 user, 5,000 errors/mo, 5M spans, 50 replays, 5 GB logs, 1 GB attachments, 1 cron + 1 uptime monitor; excess dropped, never billed.

**Plans**

| Plan | Price | Included | Overage |
|---|---|---|---|
| Datadog Free | $0 | up to 5 hosts, 1-day metric retention; no logs/APM | hard product limits |
| Datadog Infrastructure Pro | $15/host/mo annual ($18 on-demand) | 15-mo metrics, 100 custom metrics/host (pooled), 5 containers/host | ingested custom metrics $0.10/100 series; indexed custom-metric overage contract-priced; containers $0.002/hr |
| Datadog Infrastructure Enterprise | $23/host/mo annual ($27 on-demand) | 200 custom metrics/host, 10 containers/host | same pattern as Pro |
| Datadog Log Management | usage-based | n/a | ingest $0.10/GB; Standard index 15-day $1.70/M events annual ($2.55 on-demand); Flex storage $0.05/M annual ($0.075 OD) |
| Datadog APM | $31/host/mo annual ($36 on-demand); APM Pro $35/$41; APM Enterprise $40/$47 | per APM host: 150 GB ingested spans + 1M indexed spans (15-day) | ingested $0.10/GB; indexed $1.70/M (15-day annual) |
| CloudWatch Logs (pure PAYG, no named plans) | $0 base | 5 GB/mo free pool (ingest+storage+Insights scan) | Standard ingest $0.50/GB (IA $0.25; vended tiered $0.50→$0.05 by TB); storage $0.03/GB-mo; Insights $0.005/GB scanned; Live Tail $0.01/min over free |
| Sentry Developer | $0 (1 user) | 5k errors, 5M spans, 50 replays, 5 GB logs, 1 GB attachments, 1 cron + 1 uptime | none — excess data dropped |
| Sentry Team | $26/mo annual | 50k errors, 5M spans, 50 replays, 5 GB logs, 1 GB attachments; unlimited users | PAYG (only if budget set): errors $0.00029→$0.00012/event by band; spans $0.0000020→$0.0000014; replays $0.00375→$0.00196; logs $0.50/GB; attachments $0.3125/GB |
| Sentry Business | $80/mo annual | same base volumes as Team + advanced quotas/spend allocation, SAML | PAYG: errors $0.00089→$0.00024/event; spans $0.0000040→$0.0000029; replays/logs/attachments same as Team |

**What blows first**: Order of pain: (1) Sentry free 5,000 errors/mo — one crash/retry loop burns it in minutes-to-hours; then 5M spans if tracesSampleRate:1.0. (2) CloudWatch 5 GB free ingest — debug-logging Lambda/container exhausts it in days (~7 KB/s ≈ 18 GB/mo ≈ $6.50+). (3) Datadog — 6th host ends Free; once paid, custom-metric cardinality (user_id tag = 1 series per user vs 100/host allotment) and log indexing ($1.70/M: 50 events/sec ≈ 130M/mo ≈ $220/mo) are the silent bills; one autoscale burst day can set the whole month's host high-watermark.

**Spend cap status**: Datadog: NO hard cap — post-paid fail-open; only usage-alert monitors (datadog.estimated_usage.*) plus per-index LOG DAILY QUOTAS (a real per-index hard stop — set them). CloudWatch: NO hard cap — AWS Budgets/billing alarms alert only (optional budget actions exist, not on by default); mitigations = retention policies, IA class, quotas. Sentry: YES, effectively ON by default — reserved volume + explicit PAYG budget; if PAYG unset or $0, overage is dropped and never billed; worst case bounded by the budget you set.

**Cost traps**

- High-cardinality metric tags (user_id/request_id/session_id via DogStatsD/OTel) → Datadog custom-metric series explosion billed per combo
- Datadog: indexing all logs with no exclusion filters; ship debug logs ingest-only instead; rehydrating archives costs $0.10/GB scanned + re-index
- Datadog host high-watermark: brief autoscaling/test bursts bill the whole month; one Agent per container can count each as a host
- Datadog APM: tracing libs at 100% sample rate blow the 150 GB/host span allotment (Agent default is 10 traces/s, DD_APM_TARGET_TPS)
- CloudWatch: log-group retention defaults to Never Expire — storage bills forever until you put-retention-policy
- CloudWatch: Lambda console.log/debug + START/END/REPORT lines all bill $0.50/GB ingest; retry/error loops multiply it; VPC Flow/ALB vended logs add multi-GB/day
- CloudWatch: auto-refreshing dashboards or broad Logs Insights queries re-scan GBs at $0.005/GB each run; GetMetricData polling by 3rd-party tools bills $0.01/1k
- Sentry: scaffolds setting tracesSampleRate:1.0 and replaysSessionSampleRate:1.0 burn span/replay quota; captureException inside polling-loop catch blocks
- Sentry: DSN is public by design — anyone can spam your quota; set inbound filters/rate limits per key; ignored issues still consume quota
- Leaked DD_API_KEY or AWS keys with PutLogEvents/PutMetricData let outsiders bill you directly; no per-service kill switch on Datadog/AWS

**How to check usage**: Datadog: https://app.datadoghq.com/billing/usage (Plan & Usage); API GET /api/v1/usage/summary and /api/v2/usage/hourly_usage; datadog.estimated_usage.* metrics. CloudWatch: console Log groups → storedBytes + Cost Explorer; CLI: aws logs describe-log-groups --query 'logGroups[*].[logGroupName,storedBytes]'; aws cloudwatch get-metric-statistics --namespace AWS/Logs --metric-name IncomingBytes; aws ce get-cost-and-usage --filter '{"Dimensions":{"Key":"SERVICE","Values":["AmazonCloudWatch"]}}'; aws budgets describe-budgets. Sentry: https://<org>.sentry.io/settings/billing/overview/ + /stats/; API GET /api/0/organizations/{org}/stats_v2/ (sentry-cli has no billing subcommand).

**Unresolved conflicts**

- Datadog APM on-demand: Report A said $48/host; official pricing page says $36 standalone ($31 annual) — Report B correct, A rejected
- Datadog indexed-span overage: A said $1.27–$2.50/M; official page says $1.70/M at 15-day annual — B correct (other retentions vary but 15-day baseline is $1.70)
- Sentry Team error PAYG: B's band table ($0.0003625→$0.00015/event) contradicted by docs.sentry.io/pricing which shows $0.00029→$0.00012 — Report A correct, B's table rejected (likely stale/mis-scaled)
- Sentry span PAYG Team: official $0.0000020→$0.0000014/span — A correct; B only had the top bands
- Sentry replay PAYG: A cited ~$0.00196, B ~$0.00375; official shows the range $0.00375→$0.00196 by volume band — merged as range, both partially right
- Datadog CLI: B claimed Dogshell deprecated in favor of 'pup' — unverified against official docs and no such CLI is documented; kept dog/dogshell + datadog-ci, dropped 'pup'
- Sentry Developer 5k errors: docs.sentry.io/pricing fetch surfaced a 50k figure but that is the Team included volume; both reports and sentry.io/pricing agree Developer free = 5k errors

**Sources**

- https://www.datadoghq.com/pricing/ (re-fetched 2026-07-17: APM $31/$36, indexed spans $1.70/M, log index $1.70/$2.55/M)
- https://docs.datadoghq.com/account_management/billing/
- https://docs.datadoghq.com/account_management/billing/custom_metrics/
- https://docs.datadoghq.com/account_management/billing/apm_tracing_profiler/
- https://docs.datadoghq.com/tracing/trace_pipeline/ingestion_mechanisms/
- https://aws.amazon.com/cloudwatch/pricing/
- https://docs.aws.amazon.com/AmazonCloudWatch/latest/logs/Working-with-log-groups-and-streams.html
- https://aws.amazon.com/about-aws/whats-new/2025/05/amazon-cloudwatch-tiered-pricing-additional-destinations-aws-lambda-logs/
- https://docs.aws.amazon.com/cost-management/latest/userguide/budgets-managing-costs.html
- https://sentry.io/pricing/
- https://docs.sentry.io/pricing/ (re-fetched 2026-07-17: PAYG errors/spans/replays/logs bands)
- https://docs.sentry.io/pricing/quotas/
- https://docs.sentry.io/pricing/quotas/spend-allocation/
- https://sentry.zendesk.com/hc/en-us/articles/33563182442523

---

## Twilio — Programmable Messaging + Verify (SMS OTP stack); comparators: Vonage Verify, AWS End User Messaging

**Billing dimensions**

- Per SMS SEGMENT (160 GSM-7 / 70 UCS-2 chars) outbound AND inbound, priced per destination country and sender type — US base $0.0083/seg all sender types (verified)
- US/CA carrier pass-through fees on top: ~$0.0025–$0.0045/SMS per official US page (Report A cited Verizon up to $0.007; treat as variable)
- Failed-message processing fee $0.001/msg (verified)
- MMS: $0.022 out / $0.0165–$0.02 in (US, verified)
- Phone number lease: $1.15/mo local, $2.15/mo toll-free, short codes $1,000–$1,500/quarter (verified); + US A2P 10DLC registration fees
- Verify: $0.05 per SUCCESSFUL verification + channel fee per ATTEMPT (US SMS $0.0083, WhatsApp auth template $0.0034 — both verified on pricing page); SMS attempts billed even if undelivered; up to 5 attempts per 10-min session; Push/TOTP channel fee included in the $0.05
- International SMS: US $0.0083 up to ~$0.39/seg — Nigeria $0.3868 verified on official page (Report A's ~$0.29 Afghanistan ceiling understated the range); PH $0.241, FR $0.0798, IN $0.0832, GB $0.056 per B's country pages
- SMS Pumping Protection add-on (Programmable Messaging only): free US/CA, $0.025/outbound SMS elsewhere (verified on NG page + docs); opt-in, NOT default-on
- Engagement Suite $0.015/outbound after first 1,000/mo free (Report B, US pricing page features)

**Free tier**

No permanent free tier. Trial (verified on docs/usage/trials): 30 days, no credit card, product free units — 100 SMS, 100 WhatsApp, 75 voice min, 3,000 emails (NOT a $15 dollar credit; that model is legacy). Verify has NO trial free units. Restrictions: max 5 verified recipients, sign-up-country only, Twilio-provided templates only (no custom OTP body), trial-account message prefix. Post-Upgrade Free Units (PUFU), granted on upgrade, never expire: 100 SMS, 100 WhatsApp + 30 templates, 30 RCS, 75 voice min (+1,750 transcription min per A), 3,000 emails. No ongoing monthly free allowance after that.

**Plans**

| Plan | Price | Included | Overage |
|---|---|---|---|
| Pay-as-you-go (self-serve, only real plan) | $0 fixed fee; prepaid balance | One-time PUFU units (100 SMS, 100 WhatsApp, 30 WA templates, 30 RCS, 75 voice min, 3,000 emails; never expire), consumed before paid usage | US SMS $0.0083/seg + carrier fees (~$0.003–$0.005) + $0.001 per failed msg; intl $0.0083–$0.3868+/seg; numbers $1.15–$2.15/mo |
| Twilio Verify (managed OTP) | $0.05 per successful verification | Fraud Guard (free, ON by default, SMS channel only), rate limiting, managed number pool; Push/TOTP channel fees included | + channel fee per ATTEMPT: SMS $0.0083 US (charged even if undelivered; 5 attempts/10-min session), WhatsApp $0.0034 US, voice/email at standard rates; all-in US SMS OTP ≈ $0.06–$0.065/success |
| Volume / committed-use | Custom (sales only) | Negotiated discounts; no published self-serve tier table | n/a |

**What blows first**: Trial: the 100-SMS free-unit cap (one OTP flow with retries burns it in a day) and the 5-verified-recipient cap, which blocks any real signup. Production: the prepaid BALANCE via SMS pumping — bots hitting an open /send-otp endpoint toward high-rate countries (NG $0.3868/seg verified) drain a $20 top-up in ~50–500 sends, then default auto-recharge keeps billing the card. Legit US-only traffic: 1,000 OTPs/mo ≈ $58–$65 (Verify success fee dominates). US 10DLC/toll-free verification is the non-cost cliff that blocks delivery before scale.

**Spend cap status**: NO hard cap — official FAQ: "there is no maximum spend limit setting." De facto hard stop = prepaid balance hitting $0 (service suspends), but ONLY if auto-recharge is OFF; upgraded accounts default to auto-recharge when balance < ~$10 (refill up to $2,000 per A), making spend uncapped by default. Usage Triggers = ALERTS ONLY (webhook, ~1-min evaluation); standard DIY kill switch is a trigger webhook that suspends the account via the Accounts API. Damage limiters: Verify Fraud Guard (free, default-on, SMS channel only, levels Basic/Standard/Max, error 60410) and Geo Permissions (default = sign-up country only; console-only, deliberately no API).

**Cost traps**

- SMS pumping / AIT on open OTP endpoints: channel fees billed per attempt even when codes are never checked; premium-route destinations (NG $0.3868 verified) multiply damage ~45x vs US
- Auto-recharge default ON after upgrade (balance < $10 refills card) — a runaway loop bills indefinitely instead of stopping at $0
- Geo Permissions default = home country only, but devs/agents enable all countries to make a test pass, opening pumping exposure; note Verify Geo Permissions and Messaging Geo Permissions are SEPARATE settings
- Fraud Guard covers ONLY the Verify SMS channel — hand-rolled OTP via raw Messages API gets no Fraud Guard; the Messaging-side SMS Pumping Protection is opt-in and costs $0.025/msg outside US/CA (verified)
- Verify SMS attempts billed even if undelivered; retry-on-timeout agent code multiplies cost (5 attempts per 10-min session, but many entities = many sessions)
- Unicode/emoji in OTP body drops segments to 70 chars → multi-segment = multi-billed
- Leaked TWILIO_ACCOUNT_SID + TWILIO_AUTH_TOKEN = full unscoped send capability; use API keys (Geo Permissions intentionally not changeable via API, limiting blast radius)
- Usage Triggers do NOT stop traffic — alerts only unless you wire a suspend webhook
- US A2P 10DLC/toll-free registration fees + throughput limits surprise US long-code OTP at ship time
- Seed scripts/Playwright hitting live Verify with real credentials in CI

**How to check usage**: Dashboard: console.twilio.com/us1/billing/manage-billing/billing-overview (balance, auto-recharge — note Report B's '1console.twilio.com' was a typo), Monitor > Usage at console.twilio.com/us1/monitor/usage, Free Units Tracker, Verify Fraud Insights (console.twilio.com/us1/monitor/insights/verify/verify-fraud-insights). CLI: `twilio api:core:balance:fetch`; `twilio api:core:usage:records:list` (+ :today/:this-month/:last-month/:daily); `twilio api:core:usage:triggers:create --usage-category sms --trigger-by price --trigger-value N --callback-url URL`. REST: GET /2010-04-01/Accounts/{SID}/Balance.json and /Usage/Records.json; audit geo changes via Monitor Events (sms-geographic-permissions.updated).

**Unresolved conflicts**

- Max intl SMS rate: A capped range at ~$0.29 (Afghanistan, '35x US'); B listed Nigeria $0.3868. VERIFIED via official NG page: $0.3868/seg — B correct, range is ~$0.008–$0.39+.
- Global SMS CSV URL: A gave twilio.com/content/dam/.../PMded94a0d..._SMSPricing.csv, B gave assets.cdn.prod.twilio.com/pricing-csv/SMSPricing.csv. VERIFIED: both return HTTP 200; either works.
- SMS Pumping Protection $0.025/msg fee: only in B. VERIFIED on official NG pricing page ($0.025) and docs (free US/CA, opt-in, not default). A omitted it.
- US carrier fees: A claimed Verizon up to $0.007; live fetch of official US page summarized $0.0025–$0.0045. Kept the verified page range, flagged higher figures as variable/unconfirmed.
- B's billing console URL 'https://1console.twilio.com/...' is a typo; correct host is console.twilio.com.
- Fraud Guard inclusion + attempts-billed-even-if-undelivered are NOT stated on the Verify pricing page itself (live fetch); both reports agree from Fraud Guard docs / Verify FAQ, so retained with docs as source.
- A says 'no custom message bodies' on trial; B says 'pre-defined templates only' — same fact, verified on trial docs (Twilio-provided templates required).
- Only A lists 1,750 transcription minutes in PUFU and $2,000 auto-recharge refill max; not contradicted by B, retained as A-only, unverified live.

**Sources**

- https://www.twilio.com/en-us/verify/pricing (fetched 2026-07-17: $0.05/success, US SMS $0.0083, WA $0.0034)
- https://www.twilio.com/en-us/sms/pricing/us (fetched: $0.0083 in/out all sender types, carrier fees $0.0025–$0.0045, $0.001 failed fee, $1.15/$2.15 numbers, $1,000–$1,500/qtr short codes)
- https://www.twilio.com/docs/usage/trials (fetched: 30-day trial, 100 SMS/100 WA/75 min/3,000 email, no card, 5 verified recipients, perpetual PUFU)
- https://www.twilio.com/en-us/sms/pricing/ng (fetched: $0.3868/seg, $0.025 pumping protection)
- https://www.twilio.com/docs/messaging/features/sms-pumping-protection-programmable-messaging (fetched: free US/CA, opt-in)
- https://assets.cdn.prod.twilio.com/pricing-csv/SMSPricing.csv (HTTP 200 verified)
- https://www.twilio.com/docs/verify/preventing-toll-fraud/sms-fraud-guard
- https://www.twilio.com/docs/verify/preventing-toll-fraud/verify-geo-permissions
- https://www.twilio.com/docs/messaging/guides/sms-geo-permissions
- https://www.twilio.com/docs/usage/api/usage-trigger
- https://www.twilio.com/docs/usage/api/usage-record
- https://help.twilio.com/articles/223135607-How-do-I-set-an-automatic-payment-recharge-trigger- (fetch failed; auto-recharge default <$10 agreed by both reports)
- https://help.twilio.com/articles/360015760053-Manually-Add-Funds-and-Refill-your-Twilio-Project-Balance
- https://www.twilio.com/en-us/changelog/fraud-guard-is-now-enabled-by-default-for-all-new-existing-verify-customers
- https://www.vonage.com/communications-apis/verify/pricing/
- https://aws.amazon.com/end-user-messaging/pricing/

---

## Google Maps Platform (Maps/Places/Routes) + Mapbox

**Billing dimensions**

- Google: billable events per SKU, priced per 1,000 (map loads, API requests, tile requests, autocomplete requests, routes computed); each SKU meters independently, aggregated per billing account per calendar month
- Google: SKU price category (Essentials/Pro/Enterprise) is chosen by the FIELDS requested (field mask), not the endpoint — highest-tier field in the request wins
- Google: automatic volume discounts after free cap (100K/500K/1M/5M+ tiers); Legacy APIs (old Places, Directions, Distance Matrix) capped at the 100K discount tier and cannot be newly enabled since 2025-03-01
- Mapbox: map loads for GL JS web (1 per new Map() init, includes the session's vector/raster tiles), MAUs for mobile SDKs, tile requests (vector/raster/static tiles used standalone), API requests (geocoding, directions, matrix elements, isochrone, static images), and sessions (Search Box, Address Autofill)

**Free tier**

Google (since 2025-03-01, replaced pooled $200/mo credit; NOT pooled, resets 1st of month Pacific): 10,000 free calls/SKU/mo for Essentials SKUs (Dynamic Maps, Static Maps, Geocoding, Autocomplete Requests, Place Details Essentials, Compute Routes Essentials), 5,000/mo for Pro SKUs (Text/Nearby Search Pro $32/1K after, Place Details Pro, Address Validation), 1,000/mo for Enterprise SKUs; Map Tiles 2D + Street View Tiles 100,000/mo; unlimited $0: Embed, mobile Maps SDKs, Street View Metadata, Text Search/Place Details (IDs only). Plus $300/90-day new-GCP-customer trial credit. Mapbox (per billing period, card required): 50,000 web map loads; 25,000 mobile MAU; 200,000 vector tile + 200,000 static tile + 750,000 raster tile requests; 50,000 static images; 100,000 temporary geocoding; 100,000 each Directions/Map Matching/Isochrone/Optimization; 100,000 Matrix elements; Search Box sessions only 500 free (preview pricing) or 2,500 (standard pricing); Address Autofill 1,000 sessions; Permanent Geocoding has NO free tier ($5/1K from request 1).

**Plans**

| Plan | Price | Included | Overage |
|---|---|---|---|
| Google Maps Platform pay-as-you-go (default) | $0/mo base; per-SKU rates after free quota (0-100K volume) | Per-SKU free monthly quota: 10K (Essentials) / 5K (Pro) / 1K (Enterprise); Map Tiles 2D 100K | Per 1,000: Dynamic Maps $7; Static Maps $2; Geocoding $5; Autocomplete Requests $2.83; Place Details Essentials $5; Compute Routes Essentials $5 / Pro $10; Text & Nearby Search Pro $32; Place Details Pro $17; Address Validation $17; Dynamic Street View $14; Text/Nearby Search Enterprise $35; Place Details Enterprise $20; Map Tiles 2D $0.60; Photorealistic 3D Tiles $6; auto volume discounts above 100K (up to ~80% at 5M+) |
| Google Maps subscription: Starter | $100/mo | 50,000 pooled calls across plan SKUs (Dynamic Maps + Geocoding focus) | Falls back to PAYG rates; service NOT blocked at plan limit |
| Google Maps subscription: Essentials | $275/mo | 100,000 pooled calls | PAYG rates beyond plan; non-plan SKUs always PAYG |
| Google Maps subscription: Pro | $1,200/mo | 250,000 pooled calls (Enterprise plan: custom) | PAYG rates beyond plan |
| Mapbox pay-as-you-go (only model; no product tiers) | $0/mo base, card required at signup, billed monthly in arrears | Free tiers per product as listed (50K map loads, 25K MAU, 100K geocoding/directions, 500 preview / 2,500 standard Search Box sessions, etc.) | Per 1,000: map loads $5 (50-100K) → $4 → $3 → $2.50; mobile MAU $4; vector/raster tiles $0.25; static tiles $0.50; static images $1; temp geocoding $0.75 (permanent $5, no free); directions/isochrone $2; Search Box sessions $3 preview / $11.50 standard; Address Autofill $12.50; optional support: Individual $50/mo, Business max(10% of spend, $500/mo) |

**What blows first**: Mapbox: Search Box API sessions — only 500 free (preview) / 2,500 (standard); any app with a POI/address search box blows it at ~17-83 searches/day, then $3-$11.50/1K. Google: stack-dependent — search-heavy apps blow Places Text/Nearby Search Pro first (5,000 free, then $32/1K: 50K searches/mo ≈ $1,440); map-display apps blow Dynamic Maps first (10,000 free loads ≈ 333/day, then $7/1K, and every JS map re-init = 1 load). Reference shock: 20K geocodes/mo was $0 pre-March-2025, now $50.

**Spend cap status**: Google: NO hard dollar cap; budgets/alerts are notify-only ("Setting a budget does not automatically cap Google Cloud or Google Maps Platform usage or spending"). Only hard stop = per-API request quotas (console.cloud.google.com/google/maps-apis/quotas) which cut service when hit — NOT set by default, defaults very high, must lower manually. A "Project Spend Caps" feature was announced at Next '26 but is preview/not default-on. Subscription plan limits do NOT block usage (overage bills PAYG). Mapbox: NO spend cap exists and none can be configured (official FAQ); no configurable alerts — one automatic email per product per billing period on first free-tier overage; only mitigations are rotating/deactivating access tokens or prepaid credit, and usage data lags ~24h.

**Cost traps**

- Google field masks silently escalate the SKU: one Pro field (rating, openingHours) on a Place request jumps $5/1K → $17-32/1K; one Enterprise field → $35/1K. AI agents defaulting to 'all fields' hit the 1,000-free Enterprise bucket immediately
- Autocomplete without session tokens: every keystroke = 1 billable request at $2.83/1K after 10K free (5-10x multiplier on a search box)
- Re-instantiating the map on React re-render/remount/strict-mode double-init: each init = 1 billable map load on BOTH platforms (Google $7/1K after 10K; Mapbox $5/1K after 50K)
- Leaked/unrestricted keys: Google keys need HTTP-referrer + API restrictions (browser) or IP (server) — you pay for abuse; Mapbox default pk token CANNOT take URL restrictions (must create a new token; URL restrictions max 100 URLs, no wildcards, not for mobile SDKs)
- Mapbox Search Box vs Geocoding: 500-2,500 free sessions vs 100,000 free geocoding requests, and standard session price $11.50/1K vs $0.75/1K — 200x gap agents won't notice
- Mapbox Permanent Geocoding has no free tier: $5/1K from the first request (temporary is 100K free)
- Agent/batch loops (geocode-every-row, retry storms) burn Google's 10K free in one run; nothing stops them by default on either platform
- Bots/scrapers on a public map page count as real map loads; Mapbox usage dashboard lags ~24h so a runaway loop bills a full day before it is visible
- Google $300 trial credit masks real costs for the first weeks; Legacy Places/Directions APIs still bill with discounts capped at the 100K tier
- Enabling all Maps APIs on a project enlarges blast radius of a leaked key — enable only what is used

**How to check usage**: Google: console.cloud.google.com/google/maps-apis/metrics (per-API usage), /google/maps-apis/quotas, /google/maps-apis/credentials, console.cloud.google.com/billing/reports (group by SKU), /billing/budgets. CLI: gcloud services list --enabled; gcloud billing accounts list; gcloud billing projects describe PROJECT_ID; gcloud billing budgets list; gcloud beta quotas info list; metrics via Monitoring API (serviceruntime.googleapis.com/api/request_count). Mapbox: console.mapbox.com/account/statistics/ (~24h lag) and console.mapbox.com/account/settings/billing/ (invoices); tokens at account.mapbox.com/access-tokens/. No official billing/usage CLI — mapbox/tilesets CLIs cover uploads only.

**Unresolved conflicts**

- Mapbox Search Box sessions — A: 500 free then $3/2.75/2.50 per 1K; B: 500 preview / 2,500 standard free, standard up to $11.50/1K. RESOLVED via official mapbox.com/pricing (fetched 2026-07-17): both pricing tracks are listed — introductory preview: 500 free then $3.00/1K (501-100K); standard: 2,500 free then $11.50/1K (2,501-100K). A captured only the preview track; B was correct about the dual listing
- Google first-quota-blown — A: Places Text/Nearby Search Pro (5K free @ $32/1K); B: Dynamic Maps (10K free @ $7/1K). Judgment call, not a number conflict; merged as stack-dependent (search-heavy → Places Pro, map-display → Dynamic Maps)
- Google spend caps — B alone cites a 'Project Spend Caps' preview announced at Next '26; A says flatly no cap exists. Merged: no default/GA hard cap; treat the preview as not available for indie PAYG; quota limits remain the only hard stop
- B-only Mapbox items (Static Tiles 200K free @ $0.50/1K; Permanent Geocoding no free tier @ $5/1K; Address Autofill 1,000 free sessions @ $12.50/1K; Search Box requests 50K free @ $1/1K) — CONFIRMED against the official pricing page and kept
- All Google SKU prices and free quotas agree between A and B ($7/$5/$2.83/$32/$17/$35/$20/$0.60/$6 per 1K; 10K/5K/1K/100K free) — no tie-break needed; both cite developers.google.com pricing pages stamped 2026-07

**Sources**

- https://developers.google.com/maps/billing-and-pricing/pricing
- https://developers.google.com/maps/billing-and-pricing/march-2025
- https://developers.google.com/maps/billing-and-pricing/faq
- https://developers.google.com/maps/billing-and-pricing/manage-costs
- https://developers.google.com/maps/billing-and-pricing/subscriptions
- https://developers.google.com/maps/billing-and-pricing/pricing-categories
- https://developers.google.com/maps/api-security-best-practices
- https://mapsplatform.google.com/pricing/
- https://cloud.google.com/billing/docs/how-to/budgets
- https://www.mapbox.com/pricing (fetched 2026-07-17 to break Search Box tie)
- https://docs.mapbox.com/accounts/guides/pricing/
- https://docs.mapbox.com/accounts/faq/can-i-set-up-a-cap-for-monthly-spending/
- https://docs.mapbox.com/accounts/guides/invoices/
- https://docs.mapbox.com/accounts/guides/tokens/
- https://docs.mapbox.com/accounts/guides/statistics/

---

## Merged factsheet (2026-07-17): OpenAI API + Anthropic (Claude) API + Google Gemini Developer API + Replicate. Cross-checked Report A (Claude) vs Report B (grok); ties broken via live WebFetch of developers.openai.com/api/docs/pricing and platform.claude.com/docs/en/about-claude/pricing on 2026-07-17.

**Billing dimensions**

- OpenAI: input / cached-input (10% of input) / output tokens per MTok per model; Batch & Flex ~50% off; long-context uplift columns on some models (~2x in / 1.5x out per Report B); tools metered separately (web search $10/1k calls + content tokens, file search storage $0.10/GB-day after 1 GB free, images, Realtime audio, Sora video $/sec); +10% uplift on regional/data-residency endpoints for models released on/after 2026-03-05 (VERIFIED on official page)
- Anthropic: base input + output tokens; prompt cache 5-min write 1.25x, 1-hr write 2x, cache hit 0.1x input (VERIFIED); Batch API 50% off; web search $10/1,000 searches; code execution $0.05/container-hr after 1,550 free hrs/mo — and FREE when used with web_search/web_fetch tools (official-page nuance neither report had); Managed Agents $0.08/session-hour (running time only); fast mode premium (Opus 4.8 $10/$50; Opus 4.7 $30/$150 removed 2026-07-24); inference_geo:'us' = 1.1x multiplier on Opus 4.6/Sonnet 4.6 and later; 1M-token context billed at standard rates (no long-context surcharge)
- Gemini: input/output tokens (thinking tokens billed as OUTPUT; Pro-class tiered by prompt size <=200k vs >200k); context caching per-MTok + storage $/hr ($1.00/hr Flash, $4.50/hr Pro); Batch ~50% off, Priority ~1.8x; Grounding with Google Search $14/1k queries after free monthly allowance (A: 5,000 free prompts/mo)
- Replicate: hardware-seconds by CPU/GPU type — public models bill active processing only (cold start free); private models & deployments bill setup + idle + active; some official models bill per image / per output token / per video-second; downstream model calls billed too

**Free tier**

OpenAI: no real free token pool — a "Free" rate-limit tier exists for allowed geographies with a $100/month org usage limit, but in practice you prepay from day one (min credit purchase ~$5). Anthropic: no standing free tier; new users get a small unspecified amount of trial credits (confirmed on official page); the one genuinely free meter is 1,550 code-execution container-hours/month per org. Gemini: real free tier ("free input & output") on Flash/Flash-Lite models only — Pro-class and image models excluded; Google no longer publishes fixed RPM/TPM/RPD (cut quotas 2025-12-07) — check live limits at https://aistudio.google.com/rate-limit (community order-of-magnitude: Flash ~10 RPM / ~250k TPM / ~1.5k RPD); RPD resets midnight Pacific; free-tier content may be used to train Google products (paid-tier not). Replicate: no formal free tier — select models trial-able free, then billing setup is forced; prepaid credits expire after 1 year, non-refundable.

**Plans**

| Plan | Price | Included | Overage |
|---|---|---|---|
| OpenAI API (pure PAYG, prepaid credits; VERIFIED official page 2026-07-17 — both model families real) | prepaid credits, min ~$5; auto-recharge optional | Per MTok in/cached/out: gpt-5.6-sol $5.00/$0.50/$30; gpt-5.6-terra $2.50/$0.25/$15; gpt-5.6-luna $1.00/$0.10/$6; gpt-5.5 $5/$0.50/$30; gpt-5.5-pro $30/—/$180; gpt-5.4 $2.50/$0.25/$15; gpt-5.4-mini $0.75/$0.075/$4.50; gpt-5.4-nano $0.20/$0.02/$1.25; gpt-5.3-codex $1.75/$0.175/$14 (B only). Batch/Flex ~50% off. | Usage-tier monthly ceilings (cumulative-spend graduation): Free/Tier1($5 paid) $100/mo; Tier2($50) $500; Tier3($100) $1,000; Tier4($250) $5,000; Tier5($1,000) $200,000. Requests fail at ceiling. |
| Anthropic Claude API (PAYG, prepaid credits; tiers Start/Build/Scale; VERIFIED official page 2026-07-17) | prepaid credits | Per MTok in/out: Fable 5 & Mythos 5 $10/$50 (cache read $1; batch $5/$25); Opus 4.8/4.7/4.6/4.5 $5/$25 (cache read $0.50; batch $2.50/$12.50); Sonnet 5 INTRO $2/$10 through 2026-08-31, then $3/$15 from 2026-09-01 (intro cache hit $0.20, batch $1/$5); Sonnet 4.6/4.5 $3/$15; Haiku 4.5 $1/$5 (cache read $0.10; batch $0.50/$2.50). Tokenizer note: Opus 4.7+, Fable/Mythos 5, Sonnet 5 emit ~30% more tokens for same text. | Tier monthly spend caps (hard — API pauses until next month): Start $500, Build $1,000, Scale $200,000, Custom negotiated. Self-set lower org/workspace limits available. |
| Anthropic consumer subscriptions (separate rail from API) | Pro $20/mo ($17/mo annual); Max from $100/mo (5x/20x Pro usage) | Claude.ai + Claude Code plan usage via 5-hour rolling + weekly windows (limits raised ~2026-05-06) | not API credit — never covers ANTHROPIC_API_KEY usage |
| Gemini Developer API (prepay default for new users since ~2026-03-23 per Report B; postpay mainly Tier 3) | prepaid credits min ~$10, expire 12 months, non-refundable; $300 GCP welcome credit NOT usable for Gemini API (B, unverified) | Per MTok in/out: 3.1 Flash-Lite $0.25/$1.50 ($0.50 audio in); 3 Flash Preview $0.50/$3; 3.5 Flash $1.50/$9 (caching $0.15 + $1.00/hr); 3.1 Pro Preview $2/$12 <=200k, $4/$18 >200k (caching $0.20–0.40 + $4.50/hr); legacy 2.5 Flash $0.30/$2.50, 2.5 Flash-Lite $0.10/$0.40, 2.5 Pro $1.25–2.50/$10–15. Batch ~half. Gemini 2.0 Flash shut down 2026-06-01. | Tier billing caps: Tier1 (billing linked) $250/mo + $10-per-10-min spend limit; Tier2 ($100 paid + 3 days) $2,000 + $200/10-min; Tier3 ($1,000 + 30 days) $20,000–$100,000+. Project-level caps experimental with ~10-min lag. |
| Replicate (no plans — pure usage; prepaid credit or legacy postpaid arrears) | prepaid credit; auto-reload threshold min $5 / reload min $15 | Per sec ($/hr): CPU-small $0.000025 ($0.09); CPU $0.0001 ($0.36); T4 $0.000225 ($0.81); L40S $0.000975 ($3.51); A100-80GB $0.0014 ($5.04); 2xA100 $0.0028 ($10.08); H100 $0.001525 ($5.49); 8xH100 $0.0122 ($43.92). Fixed-price examples: FLUX 1.1 Pro $0.04/image, FLUX Dev $0.025/image, FLUX Schnell $3/1k images. | new work stops at $0 balance (progressive rate-limiting near $0); rare overage billed end of month; monthly spend-limit feature deprecated ~2025-07 |

**What blows first**: OpenAI: the tier monthly usage ceiling — $100/mo at Free/Tier 1 (a modest agent app at ~$40/day hits it in ~2.5 days → insufficient_quota until tier graduation); then RPM/TPM on agent tool loops; then prepaid balance $0. Anthropic: the Start-tier $500/mo spend cap (hard pause until next month) — Sonnet 5 intro at ~$0.05/call ≈ 10k calls/mo; bursty agents hit OTPM first (output is 5x input price). Gemini free tier: RPD then RPM (classic "works in dev, dies in prod at midnight PT reset"); paid prepay: credit balance → $0 stops ALL keys on the billing account, then Tier 1 $250 cap and the $10-per-10-minutes spend limit on traffic spikes. Replicate: prepaid credit balance — H100 at ~30s/prediction ≈ $0.046 each, 1k/day ≈ $46/day ≈ $1,380/mo; a forgotten private deployment with min-instances >=1 bills idle 24/7 (~$121–132/day per always-on A100/H100).

**Spend cap status**: OpenAI: NO reliable hard cap — usage-tier monthly ceilings ($100–$200k) are the only enforced stop; user-set project/org budgets are alerts-only (community-documented silent change; B concurs "soft unless verified"); prepaid $0 is a practical stop but with overshoot reports; auto-recharge re-opens spend; nothing protective on by default. Anthropic: YES, real hard cap on by default — tier monthly spend cap (Start $500) pauses API until next month; self-set lower org/workspace limits opt-in at Console Settings → Limits. Gemini: PARTIAL — tier caps ($250 Tier 1) and per-10-min spend limits are enforced automatically, and prepay $0 hard-stops (with ~10-min billing lag → overages past $0); but Google Cloud budgets are alerts-only ("setting a budget does not cap spending"); project spend caps experimental; auto-reload defeats caps. Replicate: cap = prepaid balance only ($0 stops new work; rare overage billed next month); monthly spend-limit feature deprecated ~2025-07; auto-reload silently defeats the cap; postpaid legacy accounts have no cap; nothing on by default.

**Cost traps**

- #1 DUAL-RAIL: ANTHROPIC_API_KEY beats subscription login in Claude Code (precedence: Bedrock/Vertex/Foundry env > ANTHROPIC_AUTH_TOKEN > ANTHROPIC_API_KEY > apiKeyHelper > OAuth token > /login); with -p it's used without prompting — you pay per-token to Console even on $100+/mo Max (open bug anthropics/claude-code#16489 even with forceLoginMethod). Same for Codex: OPENAI_API_KEY (also picked up from project .env!) bills Platform per-token instead of ChatGPT plan; pin with preferred_auth_method='chatgpt' in ~/.codex/config.toml. Same session can cost 15–30x more on API rail. Check: /status (Claude), codex login status.
- Agent loops: retry-on-429 without backoff, re-reading whole codebases per turn, subagent/agent teams ~7x token usage, uncapped web-search loops ($10/1k searches + result tokens).
- Model defaults: leaving Opus/Fable/Pro/H100 default when Haiku/Flash-Lite/nano/T4 would do; extended-thinking tokens billed as OUTPUT (both Anthropic and Gemini) — output is 5–6x input price.
- Anthropic tokenizer inflation: Opus 4.7+/Fable 5/Sonnet 5 emit ~30% more tokens for identical text — old-token-count budgets undercount (VERIFIED on official page).
- Sonnet 5 price rise: $2/$10 intro ends 2026-08-31, $3/$15 from 2026-09-01 — budgets built on intro pricing jump 50% (VERIFIED).
- Replicate idle billing: private models/deployments bill setup + idle, not just active; min-instances >= 1 = always-on GPU bill; auto-reload ($5 threshold/$15 min) defeats credit-as-cap; credits expire after 1 year; models that call other models double-bill.
- Gemini free→paid cliff: linking a billing account makes ALL project usage paid; free-tier data may train Google products; ~10-min billing lag allows overspend past $0; Pro >200k-token prompts bill at double input rate; grounding $14/1k after free bucket.
- Leaked keys: OpenAI has no per-key limits and budgets are alerts-only, so a scraped key can burn the whole tier cap; a Replicate key can spin 8x H100 at $43.92/hr.
- OpenAI +10% regional data-residency uplift on models released on/after 2026-03-05 (VERIFIED); Anthropic inference_geo:'us' 1.1x on all token categories incl. cache (VERIFIED).

**How to check usage**: OpenAI: https://platform.openai.com/usage and /settings/organization/limits; Admin API GET /v1/organization/usage/completions and /v1/organization/costs (Admin key; group_by=project_id,line_item,api_key_id); x-ratelimit-* headers; codex login status. Anthropic: https://platform.claude.com/usage and /settings/limits; Usage & Cost Admin API + Claude Code Analytics API; anthropic-ratelimit-* response headers; in Claude Code: /status (billing rail), /usage, /cost, /usage-credits. Gemini: https://aistudio.google.com/usage, /rate-limit (live limits), /billing, /spend; Cloud Billing reports (Gemini API SKU); gcloud billing accounts list / gcloud billing projects describe. Replicate: https://replicate.com/account/billing (credit balance, auto-reload, usage metrics); dashboard predictions; account HTTP API.

**Unresolved conflicts**

- OpenAI model lineup (A: gpt-5.6-sol/terra/luna vs B: gpt-5.4/5.5 series) — RESOLVED by WebFetch of official pricing page 2026-07-17: BOTH families are live simultaneously with matching prices (gpt-5.6-terra and gpt-5.4 both $2.50/$0.25/$15; gpt-5.6-sol and gpt-5.5 both $5/$0.50/$30). Not a real conflict; merged. B's gpt-5.3-codex $1.75/$14 not shown in fetch summary — kept with B attribution.
- Anthropic Sonnet 5 cache-hit intro $0.20/MTok (B only) — CONFIRMED on official page, which also gives intro cache writes $2.50 (5m)/$4 (1h) and intro batch $1/$5.
- Anthropic code execution — official page adds nuance both reports missed: code execution is FREE when used with web_search_20260209/web_fetch_20260209 tools; 1,550 free hrs/mo then $0.05/hr confirmed; 5-min minimum per execution; files preloaded bill even if tool not called.
- Fast mode: A said Opus 4.7 fast ($30/$150) removed 2026-07-24 — CONFIRMED; official page adds that since 2026-06-29 fast mode on Opus 4.6 silently runs at standard speed/rates.
- OpenAI spend-cap behavior: A asserts project budgets silently became alerts-only (community threads); B hedges 'often soft unless verified'. Merged conservatively: treat budgets as alerts-only; only tier ceilings and prepaid $0 actually stop requests. Not verifiable from the pricing page (help-center pages not fetched).
- Gemini billing overhaul ~2026-03-23 (prepay default, min $10 credit, 12-mo expiry, $300 GCP welcome credit excluded from Gemini API) is B-only and UNVERIFIED against ai.google.dev/gemini-api/docs/billing — flagged, kept with caveat.
- Anthropic Pro price: A '$17/mo annual ($20 monthly)' vs B '$20/mo ($17 annualized)' — same numbers, phrasing only.
- OpenAI cached-input: A '90% discount' vs B's explicit 10%-of-input column — equivalent; fetch confirmed exact cached prices.
- Gemini free-tier RPM/RPD numbers: A refuses to state (Google unpublished them 2025-12-07), B gives community snapshot ~10 RPM/250k TPM/1.5k RPD — merged as order-of-magnitude only, live source aistudio.google.com/rate-limit authoritative.
- Anthropic pricing doc path: A platform.claude.com/docs/en/docs/about-claude/pricing vs B .../docs/en/about-claude/pricing — B's path is the one that resolved on fetch.

**Sources**

- https://developers.openai.com/api/docs/pricing (WebFetched 2026-07-17 — model prices + 10% regional uplift verified)
- https://platform.claude.com/docs/en/about-claude/pricing (WebFetched 2026-07-17 — full model/cache/batch/fast-mode/code-exec/Managed-Agents pricing verified)
- https://developers.openai.com/api/docs/guides/rate-limits
- https://help.openai.com/en/articles/8264644-how-can-i-set-up-prepaid-billing
- https://platform.openai.com/settings/organization/limits
- https://platform.claude.com/docs/en/api/rate-limits
- https://claude.com/pricing
- https://code.claude.com/docs/en/authentication
- https://code.claude.com/docs/en/costs
- https://developers.openai.com/codex/auth
- https://ai.google.dev/gemini-api/docs/pricing
- https://ai.google.dev/gemini-api/docs/rate-limits
- https://ai.google.dev/gemini-api/docs/billing
- https://aistudio.google.com/rate-limit
- https://docs.cloud.google.com/billing/docs/how-to/budgets
- https://replicate.com/pricing
- https://replicate.com/docs/topics/billing
- https://replicate.com/docs/topics/billing/prepaid-credit
- https://github.com/anthropics/claude-code/issues/16489
- https://community.openai.com/t/monthly-budget-limit-silently-removed/1193635

---

## RunPod + Modal + Vast.ai (GPU clouds, merged factsheet, verified 2026-07-17)

**Billing dimensions**

- RunPod: pod GPU per-second while Running; serverless per-second from worker start to full stop (init + exec + idle timeout, rounded UP to nearest sec); container disk $0.10/GB/mo; volume disk $0.10/GB/mo running, $0.20/GB/mo stopped (2x); network volume $0.07/GB/mo <1TB, $0.05/GB/mo >1TB, high-perf $0.14/GB/mo [VERIFIED runpod.io/pricing]. $0 egress claimed by Report B only — not shown on pricing page fetch, treat as unverified
- Modal: GPU per-second (no minimum increment); CPU $0.0000131/physical-core-sec (min 0.125 cores); memory $0.00000222/GiB-sec; Sandboxes/Notebooks ~3x: CPU $0.00003942/core-sec, mem $0.00000667/GiB-sec; Volumes $0.09/GiB/mo (first 1 TiB/mo free); region selection 1.5-1.75x multiplier; non-preemptible 3x multiplier [ALL VERIFIED modal.com/pricing]. Default scale-to-zero = no idle charge unless warm capacity requested
- Vast.ai: GPU per-second while active/connected; storage per GB-hour in ALL states except host-offline (stopped != free, verbatim: 'Stopping an instance does not avoid storage costs'); bandwidth per byte sent OR received regardless of state [ALL VERIFIED docs.vast.ai/billing]. No static price list — marketplace, host-set rates

**Free tier**

Modal Starter: $0/mo + $30/month recurring free compute credits; payment method REQUIRED (verified on pricing page — Report A's "no card" scenario is wrong); limits: 100 concurrent containers, 10 concurrent GPUs, 3 seats, 200 deployed apps, 5 cron jobs, 1-day log retention. RunPod: NONE — prepaid credit model, no free credits on pricing page (referral promos and startup program exist but are not a free tier). Vast.ai: NONE — prepaid; $5 minimum deposit cited by both reports but NOT confirmed in official billing docs.

**Plans**

| Plan | Price | Included | Overage |
|---|---|---|---|
| RunPod Pods on-demand (Secure/Community, per GPU-hr) | prepaid balance, per-second billing | Secure: RTX4090 $0.69 / RTX3090 $0.46 / L4 $0.39 / A40 $0.44 / L40S $0.99 / RTX6000Ada $0.77 / A100 PCIe $1.39 / SXM $1.49 / H100 PCIe $2.89 / SXM $2.99 / NVL $3.19 / H200 $4.39 / B200 $5.89 / B300 $7.39. Community: RTX4090 $0.34 / A100 PCIe $1.19 / SXM $1.39 / H100 PCIe $1.99 / SXM $2.69 / NVL $2.59 / H200 $3.59 / B200 $5.89 / B300 $6.94 (all verified 2026-07-17) | n/a (prepaid); storage billed separately; savings plans 3/6-mo prepaid non-refundable |
| RunPod Serverless flex (per hr display, billed per-sec) | usage only | H200 $5.93 / H100 $4.55 / A100 $2.72 / L40S $1.75 / RTX4090 $1.10 / L4 $0.69 (verified); active/always-on workers discounted via sales | idle-timeout time (default 5s) is billed; no default execution timeout |
| Modal Starter | $0/mo (card required) | $30/mo credits, 100 containers, 10 GPUs, 3 seats, 200 apps, 5 crons, 1-day logs | usage rates: T4 $0.000164/s (~$0.59/hr) / L4 $0.000222 (~$0.80) / A10 $0.000306 (~$1.10) / A100-40 $0.000583 (~$2.10) / A100-80 $0.000694 (~$2.50) / L40S $0.000542 (~$1.95) / H100 $0.001097 (~$3.95) / H200 $0.001261 (~$4.54) / B200 $0.001736 (~$6.25) / B300 $0.001972 (~$7.10) — all verified; no RTX 4090 on Modal |
| Modal Team | $250/mo + usage | $100/mo credits, 1,000 containers, 50 GPUs, unlimited seats, 30-day logs, modal billing CLI/API | same unit rates |
| Modal Enterprise | custom | custom limits, SSO/HIPAA | custom |
| Vast.ai marketplace (no plans) | host-set, per-second; prepaid balance | On-Demand (full-price, guaranteed) / Interruptible (~50%+ cheaper, preemptible bid) / Reserved (up to ~50% off, 1/3/6-mo commit). NO official static rates — reports' H100 figures ($0.90-1.90 vs ~$2/hr) are third-party indicative only; live truth = vastai search offers / vast.ai/pricing grid | storage $/GB/hr in every state until destroy; bandwidth $/TB both directions |

**What blows first**: Modal: the $30 Starter credit via warm pools — one min_containers=1 H100 (~$3.95/hr) kills it in ~7.6h (A100-80GB ~12h), then the card bills ~$1,800-2,844/mo; 10-GPU concurrency sometimes hits first on agent fan-out. RunPod: prepaid balance via a forgotten pod (H100 SXM $2.99/hr ≈ $72/day, RTX4090 ≈ $16.56/day); sneaky #2 = stopped-pod volume disk at 2x ($0.20/GB/mo → 500GB stopped = $100/mo); pods need >=1hr of credit to launch and stop near $0 balance (terminated + data loss if no network volume). Vast: balance drained by GPU-sec, then silently by storage on stopped-not-destroyed instances until $0 → grace period → instance deletion (data loss).

**Spend cap status**: RunPod: de facto HARD cap via prepaid balance (pods stop/terminate at $0) + default $80/hour spend-rate limit across all resources; auto-pay top-up (opt-in) removes the hard cap. Modal: real budgets exist — Workspace monthly budget is documented as "the hard outer cap", Environment budgets (alpha) nest under it — but they are OFF until an Owner/Manager sets them under Usage & Billing (docs verified; enforcement wording is thin); card is required on Starter so credits alone are not a hard stop. Vast.ai: no budget feature at all — prepaid balance is the only hard stop (grace period may go negative), low-balance email alerts recommended at ~75% of top-up threshold; enabling autobilling ("credit card will be periodically and automatically charged") removes the hard stop.

**Cost traps**

- Idle compute is trap #1 on all three: RunPod pods have NO auto-stop/TTL (DIY: nohup sleep 2h; runpodctl stop pod $RUNPOD_POD_ID); Modal min_containers/keep_warm/buffer_containers/long scaledown_window (2s-20min) bill 24/7 despite 'never pay for idle' branding; Vast running instances bill until stopped
- Stopped != free: RunPod stopped pods bill volume disk at 2x running rate ($0.20/GB/mo); Vast stopped instances bill storage per GB-hour forever — only destroy ends charges (verified verbatim in docs)
- Modal card required on Starter: exhausting $30 credit does NOT halt compute — it bills the card. Budgets are opt-in; set a Workspace budget immediately
- Auto-top-up converts prepaid hard caps into unbounded spend on both RunPod (auto-pay) and Vast (autobilling) — leaked API key + auto-top-up = open-ended bill (RunPod default rate limit $80/hr ≈ $1,900/day ceiling)
- RunPod serverless: idle timeout (default 5s) is billed per request burst; no default execution timeout — docs say set one to prevent runaway jobs; agent loops keep flex workers alive at up to $4.55/hr each x max_workers
- modal deploy persists forever until modal app stop; cron functions and .map() fan-out multiply GPU cost; Sandboxes bill ~3x CPU/mem; region pinning 1.5-1.75x, non-preemptible 3x
- Vast bandwidth billed per byte both directions in every state — dataset/checkpoint sync loops surprise-bill; interruptible instances outbid to 'inactive' still bill storage
- Marketplace numbers rot in days: never trust a written-down Vast price; re-query vastai search offers

**How to check usage**: RunPod: runpodctl pod list (and pod list --all for stopped-but-storing), runpodctl billing; console.runpod.io/user/billing; serverless endpoints only visible in console; GraphQL api.runpod.io/graphql. Modal: modal app list + modal container list (then modal app stop <id>); modal billing CLI / modal.billing API (Team+ only); dashboard modal.com/settings -> Usage & Billing. Vast: vastai show instances (ANY listed row, even stopped, is accruing storage — must be destroyed), vastai show user (balance), vastai show invoices; cloud.vast.ai/billing/. Zero-burn assertion: runpodctl pod list empty + modal app/container list empty + vastai show instances empty.

**Unresolved conflicts**

- Modal Starter card requirement: Report A claimed no-card credit exhaustion = hard stop; Report B said payment method required. RESOLVED for B — modal.com/pricing verified 'Payment method: Required', so Starter overage bills the card
- Modal budget semantics: B's 'hard outer cap' wording CONFIRMED verbatim in modal.com/docs/guide/budgets; both reports correct that budgets are unset/off until configured; docs do not spell out enforcement action at limit
- Modal Starter extras (200 apps, 5 crons, 1-day logs) in B only: CONFIRMED on official pricing page — A was incomplete, not wrong
- Modal region 1.5-1.75x and non-preemptible 3x multipliers (B only) and Sandbox ~3x rates (A only): BOTH confirmed on pricing page — complementary omissions
- RunPod Community rates (B only: 4090 $0.34, H100 PCIe $1.99, SXM $2.69, NVL $2.59) and H200 $4.39 / B200 $5.89 / B300 $7.39 (A only): ALL confirmed on runpod.io/pricing; also verified Community H200 $3.59, B200 $5.89 (same as Secure), B300 $6.94. Oddity: page shows L4 Community $0.44 > Secure $0.39
- RunPod $0 egress (B only): NOT shown on the pricing page fetch — left unverified, do not rely on it
- RunPod min deposit ~$10 and referral $5-500 promos (B only): plausible from billing docs but not re-verified; A's core claim 'no free tier' confirmed (pricing page lists no free credits)
- Vast H100 rate: A ~$0.90-1.90/hr vs B ~$2/hr — UNRESOLVABLE by design: marketplace has no official static prices; both figures are third-party indicative; only vastai search offers / live grid is authoritative
- Vast $5 minimum deposit (both reports): NOT found in official docs.vast.ai/billing — treat as unofficial
- Vast stop!=free, per-byte bandwidth in all states, autobilling removing the hard stop, low-balance alerts (~75% threshold): all CONFIRMED verbatim against docs.vast.ai/billing

**Sources**

- https://www.runpod.io/pricing (fetched 2026-07-17, Secure+Community+serverless+storage verified)
- https://docs.runpod.io/pods/pricing
- https://docs.runpod.io/serverless/pricing
- https://docs.runpod.io/accounts-billing/billing
- https://modal.com/pricing (fetched 2026-07-17, plans+GPU rates+multipliers+sandbox rates verified)
- https://modal.com/docs/guide/budgets (fetched 2026-07-17, 'hard outer cap' verified)
- https://modal.com/docs/guide/billing
- https://modal.com/docs/guide/cold-start
- https://docs.vast.ai/billing (fetched 2026-07-17, stop/storage/bandwidth/autobilling verified)
- https://vast.ai/pricing (live marketplace grid — only authoritative Vast price source)
- https://docs.vast.ai/cli/commands
- Indicative-only (not authoritative): gpus.io, computeprices.com Vast snapshots

---

## Heroku + Render (merged factsheet, verified 2026-07-17; Render workspace/free/bandwidth numbers re-confirmed live against render.com docs; Heroku Eco numbers re-confirmed live against devcenter.heroku.com)

**Billing dimensions**

- HEROKU dyno runtime: wall-clock seconds while scaled >0, prorated to the second — traffic/CPU irrelevant; each dyno type has a monthly price cap (e.g. Basic never exceeds $7/mo)
- HEROKU Eco: flat $5/mo subscription draining a shared 1,000 dyno-hour/mo pool across ALL Eco dynos in the account; sleeping web dynos consume no hours
- HEROKU add-on time: Postgres/Key-Value/Kafka/marketplace add-ons bill 24/7 from provision until destroyed, independent of dyno state
- HEROKU metered add-ons: Managed Inference AI tokens (per 1M), storage, bandwidth-style partner meters — base fee + uncapped consumption
- HEROKU one-off/Scheduler/review-app dynos: billed by runtime; Eco review apps + CI draw from the same 1,000-hr pool
- HEROKU has NO public-bandwidth/request metering (unlike Render)
- RENDER workspace plan: flat $/mo (Hobby $0, Pro $25, Scale $499) + usage
- RENDER compute: per-instance per-second while running (Free/Starter $7/Standard $25/Pro $85/Pro Plus $175/Pro Max $225/Pro Ultra $450)
- RENDER outbound bandwidth: included per plan (5 GB/25 GB/1 TB) then $0.15/GB; counts HTTP+WebSocket responses, service-initiated egress to public internet, DB query responses leaving Render (since Oct 2025); excludes inbound, same-region private traffic, log streams
- RENDER build pipeline minutes: 500/1,000/5,000 included, then $5 per 1,000
- RENDER persistent disks $0.25/GB/mo; Postgres storage $0.30/GB/mo (increase-only, 5 GB steps); custom domains $0.25/mo over included; Private Link $0.03/GB

**Free tier**

HEROKU: NONE — all free plans (dynos, Postgres, Redis) removed 2022-11-28; still none as of 2026-07. Cheapest floor: Eco $5/mo (1,000 pooled hrs, 512 MB, web sleeps after 30 min idle, personal accounts only) + Essential-0 Postgres $5/mo (1 GB) = ~$10/mo for app+DB. RENDER Hobby ($0/mo): free web services 512 MB/0.1 CPU, 750 free instance-hours/workspace/mo (spin down after 15 min idle, ~1 min cold start, suspended when hours exhausted); 5 GB outbound bandwidth/mo (cut from 100 GB in the April 2026 replan); 500 build minutes; 2 custom domains; 25 services max; 1 team member; free Postgres 1 GB/256 MB EXPIRES 30 days after creation (+14-day grace, then deleted, no backups); free Key Value 25 MB in-memory only (data lost on restart); static sites free but count against bandwidth+build minutes; no disks/SSH/scaling on Free.

**Plans**

| Plan | Price | Included | Overage |
|---|---|---|---|
| Heroku Eco | $5/mo flat | 1,000 shared dyno-hrs/mo, 0.5 GB RAM; web sleeps after 30 min no traffic; workers NEVER sleep; personal accounts only | None purchasable — at 100% ALL Eco dynos in account forced asleep until month end (emails at 80% and 100%) |
| Heroku Basic | $7/mo max (~$0.01/hr) | 0.5 GB, always-on, no horizontal scale | N/A — prorated by second, capped at monthly max |
| Heroku Standard-1X / Standard-2X | $25 / $50 per mo max | 0.5 GB / 1 GB, horizontal scaling, metrics, preboot | N/A — monthly price cap per dyno |
| Heroku Performance M/L/L-RAM/XL/2XL | $250 / $500 / $500 / $750 / $1,500 per mo | 2.5 / 14 / 30 / 62 / 126 GB, dedicated, autoscaling (bill follows scale-out) | N/A per dyno, but autoscale adds dynos |
| Heroku Postgres Essential-0/1/2 | $5 / $9 / $20 per mo | 1 GB / 10 GB / 32 GB storage (20/20/40 connections) | None — storage cap forces plan bump; Standard-0 is $50/mo (64 GB) |
| Heroku Key-Value Mini | $3/mo | 25 MB; Premium tiers $15–$12,500/mo | None — memory cap forces upgrade |
| Heroku Managed Inference | per 1M tokens (e.g. Claude 3 Haiku $0.25 in/$1.25 out; Claude 4.5 Sonnet $3.30/$16.50) | Nothing — pure metered | Uncapped token billing |
| Render Hobby workspace | $0/mo + compute | 5 GB bandwidth, 500 build min, 2 domains, 25 services, 1 member, 750 free instance-hrs | $0.15/GB bandwidth, $5/1k build min, $0.25/domain — bills only if card on file, otherwise services suspend |
| Render Pro workspace | $25/mo flat | 25 GB bandwidth, 1,000 build min, 15 domains, unlimited members/services, autoscaling | $0.15/GB; $5/1k build min; $0.25/domain |
| Render Scale workspace | $499/mo flat | 1 TB bandwidth, 5,000 build min, 25 domains, SSO/SCIM, HIPAA (+20% compute premium) | $0.15/GB; $5/1k build min; $0.25/domain |
| Render compute instances | Starter $7 / Standard $25 / Pro $85 / Pro Plus $175 / Pro Max $225 / Pro Ultra $450 per mo | 512MB-0.5CPU / 2GB-1CPU / 4GB-2CPU / 8GB-4 / 16GB-4 / 32GB-8; per-second proration; paid instances never sleep; workers/private services start at Starter (no free) | N/A — fixed monthly ceiling per instance; max 100 instances/service |
| Render Postgres (flexible) | basic-256mb $6/mo, basic-1gb $19/mo, pro-4gb $55/mo + storage $0.30/GB/mo | Compute tier by RAM; storage separate, increase-only in 5 GB steps; HA doubles instance cost | Storage grows billed per GB |
| Render Key Value | Starter $10/mo (256 MB), Standard $32/mo (1 GB) | Persistence on by default on paid; Free 25 MB is in-memory only | None — tier upgrade |

**What blows first**: RENDER (post-Apr-2026 Hobby): the 5 GB/mo outbound bandwidth cap — ~170 MB/day of responses/assets blows it; AI crawlers/bots (>50% of web traffic) can do it in days. With card: silent $0.15/GB fail-open. Without card: workspace services spin down until next month. Runners-up: free Postgres hard-expires day 30 (+14-day grace then DELETED); 750 free instance-hrs covers only ~1 always-awake free service (2 pinged services die ~day 15). HEROKU: the wallet first (no free tier); then the Eco 1,000-hr pool — one always-on web (~744 hrs in July) is fine, but web+worker or 2 workers exhausts it ~day 15–21 and ALL Eco dynos in the account sleep until the 1st; then Essential-0's 1 GB Postgres cap; and zombie add-ons (~$8/mo forever) after dynos are scaled to 0.

**Spend cap status**: HEROKU: NO hard spend cap anywhere and no configurable billing alerts — only automatic Eco emails at 80%/100% with a hard stop (forced sleep) at 100% of the hour pool; per-dyno monthly price maxima are the sole natural ceiling; add-on and metered (AI token) spend is uncapped and fails open (billed next invoice). RENDER: partial — a hard spend limit exists ONLY for build-pipeline minutes (Workspace Settings → Build Pipeline → Set spend limit; disables new builds at the cap, services keep running) and it is OFF by default; bandwidth has NO cap once a payment method is on file ($0.15/GB fail-open, email alerts near/over included usage only); without a card, exceeding included bandwidth or free hours suspends services until next month (de facto cap on card-less Hobby); compute has no cap beyond fixed per-instance prices.

**Cost traps**

- Heroku add-on ZOMBIE BILLING: Postgres/Redis/Kafka bill 24/7 from `addons:create` until `addons:destroy` or app deletion — even with dynos at 0 or Eco asleep; agents that provision while experimenting leave meters running forever
- Heroku wall-clock billing: a dyno scaled up with zero traffic bills full price; `heroku ps:scale web=2` forgotten = double bill; Basic+ dynos never sleep
- Heroku Eco workers never sleep — one worker eats ~744 of the 1,000 pool hrs; uptime pingers (cron/Pingdom) defeat Eco web sleep; review apps + CI drain the same pool; at 100% every Eco app in the account goes dark
- Heroku metered AI (Managed Inference) has no ceiling — a looping agent burns tokens per-1M with no cap and no alert
- Render AI-crawler bandwidth: all outbound HTTP responses billable, no bot carve-out; unprotected app + card = open-ended $0.15/GB (documented 73 TB/$5k+ crawler cases industry-wide); mitigate with robots.txt/Cloudflare/no card
- Render service-initiated egress billable since Oct 2025: agent loops calling external APIs, S3 pushes, LLM streaming over WebSockets all meter bandwidth
- Render fail-open with card: bandwidth and build-minute overages auto-bill once a payment method exists; no pre-charge hard stop except the optional build-minutes limit
- Render agent scaffolding sprawl: default-to-Starter = $7/mo per always-on service (paid instances never spin down); Postgres storage is increase-only; auto-deploy on every push burns build minutes; full-stack preview envs multiply compute
- Render free Postgres deletes your data at day 30+14 grace — not free forever
- Both: leaked HEROKU_API_KEY / RENDER_API_KEY lets anyone provision paid resources on your card ($1,500/mo Performance dynos, paid Render services)
- Render legacy workspaces ($19/$29 per-seat, 100/500 GB bandwidth) force-migrate to new plans 2026-08-01 — Hobby bandwidth drops 100 GB → 5 GB

**How to check usage**: HEROKU — Dashboard: https://dashboard.heroku.com/account/billing → Current Usage (updated nightly through previous UTC day) + Invoices; metered add-ons in the app's Resources tab. CLI: `heroku ps -a <app>` (shows eco dyno hours % used), `heroku addons --all` (every add-on + price account-wide), `heroku apps --all`, `heroku pg:info`. API: Platform API invoices endpoint. RENDER — Dashboard: https://dashboard.render.com/billing#included-usage (bandwidth + pipeline minutes vs included) and #unbilled-charges; per-service Metrics → Outbound Bandwidth; Workspace Settings → Build Pipeline for the spend limit. CLI: `render services` / `render deploys list` / `render logs` — NO billing/usage subcommand; usage is dashboard/API only (api.render.com).

**Unresolved conflicts**

- Always-on dyno hours/month: A said ~720, B said 744 — not a real conflict (672–744 depending on month; July 2026 = 744). Used 744 with 'always-on ≈ one full month of a 1,000-hr pool'.
- Eco alert thresholds: A's free-tier section said email at 80% only; A's spend-cap section and B said 80%+100%. RESOLVED by live fetch of devcenter.heroku.com/articles/eco-dyno-hours: emails at BOTH 80% and 100%, forced sleep at 100%.
- April 2026 Render replan source: A cited render.com/docs/new-workspace-plans + changelog; B cited render.com/blog/better-pricing-for-fast-growing-teams. RESOLVED: docs/new-workspace-plans fetched live and confirms all numbers (Hobby $0/5GB/500min/2 domains/25 services, Pro $25/25GB/1,000min/15, Scale $499/1TB/5,000min/25, $0.15/GB, $5/1k min, $0.25/domain, Aug 1 2026 migration) — both sources describe the same change; docs page preferred.
- A internally claimed 'no billing alerts before bandwidth charges accrue' while also citing 'approaching/exceeding' emails; live fetch of docs/outbound-bandwidth does not mention alert emails at all — treated alerts as unverified/best-effort, hard behavior (bill with card / spin down without card) confirmed.
- Render instance prices $7/$25/$85/$175/$225/$450: A flagged these as only confirmed via search-indexed copies (JS-rendered pricing page); B stated them directly. Two independent reports agree → accepted; flagged as the weakest-sourced numbers in the sheet.
- Single-sourced (no conflict, lower confidence): B-only — Render Postgres basic-1gb $19/pro-4gb $55, Key Value Standard $32, cron per-minute rates, Private Link $0.03/GB, Heroku Premium-0 KV 50 MB; A-only — Heroku Managed Inference token prices, Render Scale +20% HIPAA compute premium, legacy Render bandwidth figures (100/500 GB, $30/100 GB).

**Sources**

- https://www.heroku.com/pricing/
- https://devcenter.heroku.com/articles/usage-and-billing
- https://devcenter.heroku.com/articles/eco-dyno-hours (re-verified live 2026-07-17)
- https://help.heroku.com/RSBRUH58/removal-of-heroku-free-product-plans-faq
- https://elements.heroku.com/addons/heroku-key-value-store
- https://render.com/pricing
- https://render.com/docs/free (re-verified live 2026-07-17)
- https://render.com/docs/new-workspace-plans (re-verified live 2026-07-17)
- https://render.com/docs/outbound-bandwidth (re-verified live 2026-07-17)
- https://render.com/docs/build-pipeline
- https://render.com/docs/postgresql-refresh
- https://render.com/docs/key-value
- https://render.com/changelog/updated-plans-for-render-workspaces
- https://render.com/blog/better-pricing-for-fast-growing-teams
- https://render.com/changelog/upcoming-changes-to-outbound-bandwidth

---

## MongoDB Atlas + PlanetScale (as of 2026-07-17)

**Billing dimensions**

- Atlas Dedicated (M10+): compute $/hr per tier, varies by cloud+region; extra disk/IOPS and backup storage $/GB extra
- Atlas Flex: $/hr tiered by peak ops/sec band, hard-capped $30/mo per cluster; 5 GB storage incl; no data-transfer charges
- Atlas data transfer (Dedicated only): ~$0.01/GB same-region, ~$0.02/GB cross-region, ~$0.09/GB internet egress (provider pass-through); ingress free; Free/Flex egress not charged
- Atlas add-ons: Search/Vector Search nodes hourly (from ~$0.12/hr), Stream Processing $0.06–$2.49/hr, Data Federation/Atlas SQL $5/TB scanned (10 MB min/query), App Services per-request/compute/sync
- Atlas REMOVED meters: pay-per-RPU Serverless and M2/M5 shared tiers are gone (migrations 2025, final API EOL Jan 22, 2026) — auto-migrated to Free/Flex/Dedicated
- PlanetScale: cluster SKU per instance, prorated (PS-5…PS-2560, Metal M-*); HA = 3 instances; extra production branches = full cluster price each; read-only regions/replicas extra
- PlanetScale storage: 10 GB incl then $0.50/GB per instance/mo overage (plans page; ~$1.50/GB effective on 3-node HA); Postgres provisioned disk billed $0.125/GB-mo us-east-1 (regional); Metal = NVMe bundled in SKU
- PlanetScale egress (Postgres, verified): $0.060/GB us-east-1 beyond 100 GB/mo (production) or 10 GB/mo (single-node/dev); private link $0.01/GB; IOPS>3000 $0.009/IOPS-mo, throughput>125MiB/s $0.073/MiB/s-mo
- PlanetScale backups: automatic 12h backups free; user-scheduled $0.023/GB-mo (Postgres includes 2x disk); dev branches billed (Postgres PS-DEV $5/mo; Vitess included hours then ~$0.014/hr)
- PlanetScale REMOVED meter: row reads/writes billing is legacy Scaler only — current Base plan (ex-Scaler Pro) is resource-based; query volume does NOT bill

**Free tier**

Atlas M0 "Free": $0 forever (not a trial). Exact quotas: 512 MB storage (data+indexes), 100 ops/sec throttle, 500 max connections, 100 databases / 500 collections, 10 GB in + 10 GB out per rolling 7-day period (throttled, not billed), 3-node shared replica set, 1 free cluster/project, no backups/sharding/private endpoints, 32 MB sort memory, 50 aggregation stages max, no server-side JS; idle clusters get paused (Report A: after ~30 days of zero connections). PlanetScale: NO free tier since Apr 8, 2024 (Hobby/Developer removed); valid credit/debit card required for all orgs; cheapest entry = $5/mo Postgres single-node PS-5.

**Plans**

| Plan | Price | Included | Overage |
|---|---|---|---|
| Atlas Free (M0) | $0 forever | 512 MB, 100 ops/s, 500 conns, 10 GB in+out per 7 days | none — throttles instead of billing |
| Atlas Flex | $0.011/hr (~$8/mo) base | 5 GB storage, 100 ops/s, unlimited data transfer | hourly rate steps up by ops/s band ($15/$21/$26 → $30/mo at 400–500 ops/s); HARD CAP $30/mo per cluster, throttles at 500 ops/s |
| Atlas Dedicated (M10 entry, AWS us-east-1) | $0.08/hr (~$57/mo); M20 $0.20, M30 $0.54, M40 $1.04 … M700 $33.26/hr | M10: 2 GB RAM, 2 vCPU, 10 GB disk (expandable to 128 GB); tier range up to 4 TB/768 GB RAM | egress $0.01–$0.09+/GB, extra disk/IOPS, backup $/GB; autoscaling changes hourly rate — no spend cap |
| PlanetScale Base — Postgres single-node PS-5 | $5/mo | 1/16 vCPU, 512 MB RAM, 10 GB disk, 10 GB egress | disk $0.125/GB-mo (us-east-1), egress $0.06/GB, backups $0.023/GB-mo past 2x disk |
| PlanetScale Base — Postgres HA PS-5 (3-node) | $15/mo (PS-10 $30, PS-20 $50 … PS-2560 $4,529) | 3 nodes/3 AZs, 10 GB disk, 100 GB egress/mo, 12h backups, unmetered connections | storage and egress as above ×instances; extra prod branch = full cluster price |
| PlanetScale Base — Vitess (MySQL) HA PS-10 | $39/mo (PS-20 $59, PS-40 $99, PS-80 $179 … PS-2560 $5,599) | 3-node HA only (no single-node Vitess), 10 GB storage, dev-branch hours incl | storage $0.50/GB/instance/mo (~$1.50/GB HA), dev branches ~$0.014/hr past included |
| PlanetScale Metal | from $50/mo (M-10 arm64) up to ~$26.9k–$47.2k/mo (M-7680) | local NVMe storage bundled in SKU price | none for storage (fixed drive); SKUs >M-320 gated until $100 invoices paid |
| Enterprise (both) | custom | Atlas: commitments/support tiers; PlanetScale: single-tenant or Managed in your AWS/GCP | contract |

**What blows first**: Atlas M0: 100 ops/sec is hit first by any real traffic (agent polling loops saturate instantly → throttle, not bill), then 512 MB storage, then 500 connections (serverless functions without pooling), then 10 GB/7-day transfer. Flex: cost silently climbs $8→$30 then throttles at 500 ops/s (cap is the safety net). Dedicated: DATA EGRESS + autoscale tier jumps blow first — documented cases of transfer bills exceeding the cluster bill. PlanetScale: there is no usage meter to blow — the first surprise is the flat SKU floor itself ($5 Postgres / $39 Vitess per database, card on file), then storage past 10 GB ($0.50/GB×3 nodes HA) and Postgres egress past 100 GB ($0.06/GB).

**Spend cap status**: Atlas: NO hard cap on Dedicated — USD-threshold billing alerts only (daily billed amount, monthly bill threshold), NOT preconfigured by default. Structural caps per cluster type only: M0 is $0 forever (throttles); Flex is hard-capped at $30/mo per cluster (throttles at 500 ops/s instead of billing). Bound Dedicated via autoscaling max-tier + pause. PlanetScale: NO hard cap of any kind — email spend alerts OFF by default (opt-in on billing page; org admins emailed at 75% and 100% of a budget YOU set; nothing throttles or stops). Soft structural cap: SKUs limited to PS-160/M-320 until ≥$100 in paid invoices.

**Cost traps**

- Atlas autoscaling is ON by default for UI-created clusters, up-fast/down-slow: CPU/mem >90% for 10 min (M10/M20 ~20 min per Report B) or >75% for 1 hr doubles the tier (M10 $58→M20 $146/mo); scale-down requires 24 hr since last change PLUS ~4 hr sustained low load; predictive autoscale (M30+) can jump 2 tiers pre-spike
- Atlas storage autoscaling can silently RAISE your max tier and DISABLE scale-down; storage never auto-shrinks — one runaway log write permanently raises the floor
- Atlas Dedicated egress is invisible and uncapped: $0.09/GB internet, $0.01/GB per cross-AZ direction — unprojected full-document reads / change-stream loops from another region rack it up with no throttle
- Leaked Atlas org API key → programmatic M700 at $33/hr ≈ $24k/mo; no hard cap will stop it (use API-key IP access lists + billing alerts)
- Stale tutorials/Terraform referencing Atlas Serverless or M2/M5 fail or land on Flex/Dedicated — those products are gone (final EOL Jan 22, 2026)
- PlanetScale has NO free tier since Apr 2024: an agent following an old 'Hobby is free' tutorial signs the card up at $5–$39/mo PER database; scaffolds default to Vitess HA PS-10 $39 when Postgres single-node $5 would do
- PlanetScale branch sprawl: each production branch = a full extra cluster; dev branches bill too (Postgres PS-DEV $5/mo each; Vitess ~$0.014/hr past included) — a branch-per-PR bot that never deletes compounds monthly; audit with `pscale branch list`
- PlanetScale storage growth: unbounded log/embedding tables bill $0.50/GB × 3 instances = ~$1.50/GB/mo on HA Vitess with spend alerts OFF by default
- PlanetScale query loops do NOT bill per-row (row-read/write billing removed with Scaler) — but Postgres public egress bills $0.06/GB past 100 GB, and hot loops force SKU step-ups
- Template defaults that add SSO ($199/mo), extra replicas, read-only regions, or Atlas Search/Vector nodes and multi-region clusters silently multiply meters

**How to check usage**: Atlas: cloud.mongodb.com → Organization → Billing (pending invoice, Cost Explorer, per-line-item invoices); CLI `atlas api invoices listInvoices` / `listPendingInvoices` / `getInvoice` / `downloadInvoiceCsv` / `getCostExplorerUsage`; Admin API v2 GET /api/atlas/v2/orgs/{orgId}/invoices (Org Billing Viewer+). PlanetScale: dashboard only for billing — https://app.planetscale.com/<org>/settings/billing (per-database/branch line items, Stripe invoices); no `pscale billing` subcommand — inventory billed resources with `pscale database list` and `pscale branch list`; billing API endpoints exist (service token); Vantage integration for budgets.

**Unresolved conflicts**

- PlanetScale egress: Report A claimed 'no usage meter to blow' and omitted egress; Report B listed $0.06/GB. RESOLVED via https://planetscale.com/docs/postgres/pricing — egress IS metered on Postgres: $0.060/GB us-east-1 beyond 100 GB/mo (production) or 10 GB/mo (single-node/dev); private link $0.01/GB. Report B correct; Vitess plans page shows no egress line.
- PlanetScale storage $0.50/GB/instance (A) vs $0.125/GB-mo (B): BOTH confirmed official, different meters — docs/planetscale-plans: '10 GB included; $0.50 per instance per additional 1 GB' (usage overage); docs/postgres/pricing: $0.125/GB-mo us-east-1 for provisioned Postgres disk. Not an error; label by engine/meter.
- Atlas M10 monthly: A ~$58/mo vs B ~$56.94/mo — same official $0.08/hr, different hours-per-month conventions; quote the hourly rate.
- Atlas autoscale scale-up window: A says 10 min universally; B says M10/M20 use ~20-min windows with burstable-CPU rules (M30+ 10 min). No official tie-break fetched; B is more granular, both agree on up-fast/down-slow (24 hr + ~4 hr sustained).
- Atlas M0 idle policy: A '30 days of zero connections → auto-pause' vs B 'may deactivate idle clusters (ToS)'. Not tie-broken; safe merged claim: idle M0 clusters get paused.
- PlanetScale Vitess dev-branch hours (B: ~1440 h incl, ~$0.014/hr after) appear only in Report B — plausible, unverified this pass.
- Verified identical in both (no fetch needed): Flex $8–$30 tiers + $30 hard cap, M0 quotas (512 MB/100 ops/s/500 conns/10 GB-7day), Postgres PS-5 $5/$15, Vitess PS-10 $39, Metal M-10 $50, backups $0.023/GB-mo, $100-invoice SKU gate, no-free-tier, 75%/100% opt-in alerts, serverless EOL Jan 22 2026, row-billing removal.

**Sources**

- https://www.mongodb.com/pricing
- https://www.mongodb.com/docs/atlas/reference/free-shared-limitations/
- https://www.mongodb.com/docs/atlas/billing/atlas-flex-costs/
- https://www.mongodb.com/docs/atlas/cluster-autoscaling/
- https://www.mongodb.com/docs/atlas/billing/data-transfer-costs/
- https://www.mongodb.com/docs/atlas/billing/
- https://www.mongodb.com/docs/atlas/flex-migration/
- https://www.mongodb.com/docs/atlas/reference/alert-conditions/
- https://www.mongodb.com/docs/atlas/cli/current/command/atlas-api-invoices/
- https://planetscale.com/pricing
- https://planetscale.com/pricing.md (fetched 2026-07-17: PS-5 $5/$15, PS-10 Vitess $39, M-10 $50)
- https://planetscale.com/docs/planetscale-plans (fetched 2026-07-17: no free plan, $0.50/GB/instance, $0.023/GB-mo backups, PS-160/M-320 gate)
- https://planetscale.com/docs/postgres/pricing (fetched 2026-07-17: $0.125/GB-mo disk, $0.060/GB egress after 100 GB, $0.01/GB private, IOPS/throughput rates)
- https://planetscale.com/docs/billing
- https://planetscale.com/docs/plans/hobby-plan-deprecation-faq
- https://planetscale.com/changelog/monthly-spend-alerts

---

## Resend · SendGrid (Twilio) · Mailgun (Sinch) — transactional email APIs (verified 2026-07-17)

**Billing dimensions**

- Resend: emails/mo (sent AND inbound both count; each To/CC/BCC recipient = 1 email), marketing contacts stored, automation runs ($0.0015/run past 10k), AI credits, dedicated IP flat add-on
- SendGrid Email API: emails ('credits')/mo — Requests = Processed + Dropped, so suppressed/dropped sends still burn credits
- SendGrid Marketing Campaigns: TWO meters, contacts stored AND emails sent — separate purchase/meter from Email API; plus validation credits, dedicated IPs, testing credits
- Mailgun: emails/mo (overage per 1,000), email validations (per 100), dedicated IPs ($59/IP/mo), log retention plan-gated (1 day free/Basic → 30 days Scale); contact storage NOT metered on core Send plans

**Free tier**

Resend: PERMANENT — 3,000 emails/mo AND 100/day (both enforced; sent+inbound count), 1 domain, 1,000 marketing contacts, 10k automation runs, 30-day retention; hard stop, no overage. SendGrid: NONE — permanent free (100/day) retired May 27, 2025, wind-down ended ~Jul 26, 2025 (non-upgraded accounts: sending disabled, contacts >100 deleted irrecoverably); replacement is a one-time 60-day trial, 100 emails/day, $0, no CC — pay or die on day 61. Mailgun: PERMANENT — 100 emails/day (≈3k/mo max, can't bank days), 1 domain, 2 API keys, 1-day logs, 1 inbound route; hard daily stop.

**Plans**

| Plan | Price | Included | Overage |
|---|---|---|---|
| Resend Pro | $20/mo (or $35/mo) | 50k emails (100k at $35) | $0.90/1,000, auto-charged in 1k buckets, hard-capped at 5x quota |
| Resend Scale | $90–$1,150/mo | 100k → 2.5M emails ($90/100k, $160/200k, $350/500k, $650/1M, $825/1.5M, $1,150/2.5M) | $0.90→$0.46/1,000 declining by tier ($0.80, $0.70, $0.65, $0.52, $0.46); dedicated IP $30/mo add-on (needs 3k+/day) |
| Resend Marketing (contacts) | $40–$650/mo | 5,000–150,000 contacts, unlimited sends to them | — |
| SendGrid Trial | $0, one-time 60 days | 100 emails/day | none — hard stop; all sending dead on day 61 without upgrade |
| SendGrid Essentials | from $19.95/mo | 50k emails (100k tier ~$34.95) | $0.0013/email at 50k, $0.0009 at 100k; billed in arrears next invoice; no dedicated IP |
| SendGrid Pro | from $89.95/mo | 100k → 2.5M emails; 1 dedicated IP + SSO + subusers + 5k validations | $0.0011/email at 100k → $0.0009 (300k) → $0.0008 (700k) → $0.0006 (1.5M) → $0.0005 (2.5M) |
| SendGrid Marketing Campaigns Basic/Advanced | Basic from $15/mo, Advanced from $60/mo | Basic 5k–100k contacts / 15k–300k sends; Advanced 10k–200k contacts / 50k–1M sends | per extra email OR contact: Basic $0.0040–$0.0028, Advanced $0.0075–$0.0050 — contact storage bills EVERY month after one import |
| Mailgun Basic | from $15/mo | 10,000 emails/mo | from $1.80/1,000 (priciest of the three); validations from $1.20/100 |
| Mailgun Foundation | $35/mo (1st month free) | 50,000 emails/mo, 5-day logs | from $1.30/1,000 (verified on official pricing page; Report A's $1.80 was wrong) |
| Mailgun Scale | $90/mo (1st month free) | 100,000 emails/mo, 30-day logs, 5,000 validations, 1 dedicated IP, SAML SSO | from $1.10/1,000; validations from $0.80/100; extra IPs $59/IP/mo |

**What blows first**: Free tiers: the 100 emails/day cap (Resend AND Mailgun) — one signup burst, password-reset loop, or a newsletter to ~100 addresses kills it in hours (each recipient counts; Resend counts inbound too). SendGrid: the 60-day trial clock itself — app dies on day 61 with 'Maximum Credits Exceeded' regardless of volume. On paid: SendGrid Marketing's contact-storage meter blows before the send meter (importing a 6k CSV on Basic 5K = recurring monthly overage); Mailgun new accounts may also hit an ~100 msgs/hour probation limit until business verification.

**Spend cap status**: Resend: HARD CAP ON BY DEFAULT — paid overage stops at 5x monthly quota, then sending pauses until next cycle (adjustable via support); free tier hard-stops, no charge. SendGrid: NO user-configurable spend cap, alerts only (usage_limit alert); BUT since Mar 26, 2026 an automatic non-adjustable ceiling of 10x plan allotment applies to Email API Essentials/Pro (e.g. Essentials 50K hard-stops at 500k requests/mo; resellers 2.5x) — verified on official support article; overage still bills in arrears up to that ceiling, and upgrading does NOT erase incurred overage. Mailgun: hard cap AVAILABLE but OFF BY DEFAULT — 'custom message limit' (Settings or API PUT /v5/accounts/limit/custom-monthly) disables the account when the monthly message count hits; message-count based, not dollars; re-enable via PUT /v5/accounts/limit/custom-enable or auto next month; without it, overage is fail-open.

**Cost traps**

- SendGrid counts Dropped/suppressed requests as consumed credits (Requests = Processed + Dropped) — a loop hammering suppressed addresses burns quota and money anyway
- Runaway retry loops: SendGrid mail/send accepts up to ~10,000 req/s and bills overage in arrears — bounded only by the new 10x ceiling (~9x plan price worst case); Mailgun overage is fully fail-open unless the off-by-default custom limit is set; Resend's 10 req/s team rate limit + 5x cap naturally bound loops
- Contact-import loops: SendGrid Marketing and Resend Marketing bill per STORED contact — re-importing/duplicating contacts inflates a recurring monthly meter, not a one-time charge
- Reputation kill-switch: Resend pauses sending at bounce >=4% or spam >=0.08% — an agent testing with fake addresses bricks the account; all three auto-suppress bounces/complaints (deliverability protection, not spend protection)
- Leaked API keys (bearer, prefixes re_ / SG. / basic-auth api:) — worst on SendGrid paid (arrears billing); blast radius limited to 100/day on free tiers, 5x quota on Resend paid
- Resend counts INBOUND email and every To/CC/BCC recipient against the same quota — webhook/forward loops and multi-recipient batches inflate usage invisibly
- SendGrid dual billing: Email API and Marketing Campaigns are separate purchases with separate meters — wiring both doubles exposure
- Mailgun 1-day log retention on Free/Basic makes post-mortem debugging of an agent loop nearly impossible
- SendGrid trial expiry is a silent prod outage: day 61 all API+SMTP sends fail

**How to check usage**: Resend: dashboard resend.com/settings/usage + /settings/billing; official CLI EXISTS (Report A wrong): `npm i -g resend-cli` or `brew install resend/cli/resend` — `resend whoami`, `resend emails list`, `resend open` (resend.com/docs/cli). SendGrid: app.sendgrid.com/statistics + Settings>Alerts; API: curl -H "Authorization: Bearer $SENDGRID_API_KEY" "https://api.sendgrid.com/v3/stats?start_date=2026-07-01" (Requests column = credits burned; Activity API rate-limited to ~6/min); Twilio CLI: `twilio email:send`. Mailgun: app.mailgun.com dashboard (Sending/Analytics/Billing); API: curl -s --user "api:$MAILGUN_API_KEY" "https://api.mailgun.net/v3/<domain>/stats/total?event=accepted"; check cap: GET https://api.mailgun.net/v5/accounts/limit/custom-monthly (hyphenated path per official docs).

**Unresolved conflicts**

- Mailgun Foundation overage: A said $1.80/1k, B said $1.30/1k — RESOLVED via mailgun.com/pricing fetch: from $1.30/1,000 (B correct)
- Resend official CLI: A said 'no official CLI', B listed one — RESOLVED via resend.com/docs/cli fetch: official resend-cli exists (npm/brew/curl installers, resend whoami/emails/domains) (B correct)
- SendGrid automatic 10x sending ceiling: A claimed it (effective Mar 26, 2026), B said 'no hard cap, fail-open' — RESOLVED via support.sendgrid.com article 35466138799899 fetch: confirmed 10x plan allotment cap on Essentials/Pro, 2.5x for resellers, starting Mar 26, 2026 (A correct); note billing-vs-request-count nuance: article frames it as Requests = Processed + Dropped
- SendGrid Pro 100K overage: B said $0.0011/email (A left unstated) — RESOLVED via twilio.com email-api pricing fetch: $0.0011 confirmed, declining to $0.0005 at 2.5M
- Mailgun custom-limit API path: A wrote /v5/accounts/limit/custom/monthly — official docs use hyphenated /v5/accounts/limit/custom-monthly and /v5/accounts/limit/custom-enable (docs win)
- Mailgun cap alert percentages: A said 50%/75%, B said ~75%/95% — UNRESOLVED (help.mailgun.com article returned 403); treat exact percentages as unverified, cap behavior itself confirmed via API docs
- SendGrid Pro 1.5M ~$749/mo price: A's figure is third-party (sendx.io) only — unverified, use pricing-page slider for real quotes
- SendGrid trial 'includes 1 dedicated IP' appeared in one pricing-page fetch — contradicts both reports and the dedicated-IP support article (Pro+ only); treated as page-summarization noise, dedicated IP remains Pro+

**Sources**

- https://resend.com/pricing
- https://resend.com/docs/knowledge-base/account-quotas-and-limits
- https://resend.com/changelog/pay-as-you-go-pricing
- https://resend.com/docs/cli (fetched 2026-07-17)
- https://www.twilio.com/en-us/products/email-api/pricing (fetched 2026-07-17)
- https://www.twilio.com/en-us/products/marketing-campaigns/pricing
- https://www.twilio.com/en-us/changelog/sendgrid-free-plan
- https://support.sendgrid.com/hc/en-us/articles/35270136965403 (trial plan)
- https://support.sendgrid.com/hc/en-us/articles/35466138799899 (10x cap + credits; fetched 2026-07-17)
- https://support.sendgrid.com/hc/en-us/articles/40779261694875 (overage in arrears; fetched 2026-07-17)
- https://support.sendgrid.com/hc/en-us/articles/9237413560219 (dedicated IPs)
- https://www.twilio.com/docs/sendgrid/ui/account-and-settings/alerts
- https://www.mailgun.com/pricing/ (fetched 2026-07-17)
- https://documentation.mailgun.com/docs/mailgun/api-reference/send/mailgun/custom-message-limit (fetched 2026-07-17)
- https://help.mailgun.com/hc/en-us/articles/4402611589915 (403 on fetch — cap %s unverified)
- https://help.mailgun.com/hc/en-us/articles/360012287493 (suppressions)

---

## Netlify (credit-based plans, post-2025-09-04) + DigitalOcean App Platform — verified 2026-07 against official pricing/docs pages

**Billing dimensions**

- NETLIFY (single credit pool, all meters drain it): production deploys 15 credits each (preview/branch deploys, failed deploys, rollbacks = free)
- Netlify bandwidth (web + DB egress): 20 credits/GB
- Netlify web requests: 2 credits per 10,000 (pages, assets, redirects, serverless + edge function calls)
- Netlify compute: 10 credits/GB-hour (serverless/scheduled/background functions, preview servers, Agent Runners, Netlify DB) — NOT per-invocation; standalone function-invocation meter exists only on legacy plans (125k/site/mo)
- Netlify AI inference (Agent Runners + AI Gateway): 180 credits per $1 of model cost — fastest drain
- Netlify forms: free on credit plans
- Effective credit value ~$0.00667 (Pro pack $10/1,500): deploy ~$0.10, bandwidth ~$0.13/GB, compute ~$0.07/GB-hr
- Netlify LEGACY (pre-2025-09-04 accounts): bandwidth 100GB then $55/100GB, build minutes 300 then $7/500, functions 125k/site, edge functions 1M, forms 100/site
- DIGITALOCEAN: container instances per-second (1-min minimum) at fixed monthly-equivalent rates $5–$392/mo
- DO outbound transfer: per-instance allowance (50–900 GiB) pooled cumulatively across all apps at TEAM level; overage $0.02/GiB; inbound free; App Platform and Droplet bandwidth pools are separate
- DO extra static-site app beyond 3 free: $3.00/mo
- DO dev database: $7.00/mo per 512 MiB
- DO dedicated egress IP: billed per second up to $25.00/mo per app (60-sec minimum)
- DO builds/image storage: not billed on current plans (legacy pre-2024-05-07 plans had build-minute allowances)
- DO component renaming restarts the 28-day billing count → extra end-of-month charges (confirmed in official docs)

**Free tier**

NETLIFY Free: $0, no card required, 300 credits/mo HARD LIMIT, no rollover, no overage possible. ~ceilings if one meter only: 20 prod deploys OR 15 GB bandwidth OR 1.5M requests OR 30 GB-hr compute OR ~$1.67 of AI inference. At 0 credits ALL team projects pause ('Site not available') until next cycle/upgrade. 1 concurrent build, up to 500 projects sharing the pool. Legacy Free (pre-2025-09-04): 100 GB bandwidth + 300 build min + 125k function invocations + 1M edge invocations, hard-suspends. DIGITALOCEAN: 3 free apps with ONLY static-site components; 1 GiB outbound/app/mo, then $0.02/GiB BILLED to the card on file (not a hard free tier); no free tier for services/workers/jobs/containers ($5/mo floor) or databases or droplets.

**Plans**

| Plan | Price | Included | Overage |
|---|---|---|---|
| Netlify Free (credit) | $0/mo | 300 credits/mo, 1 concurrent build, no card required | None possible — hard pause of all projects at 0 credits |
| Netlify Personal | $9/mo | 1,000 credits/mo, no rollover | No per-unit overage; opt-in auto-recharge pack: 500 credits/$5, no spend ceiling once enabled; otherwise sites pause |
| Netlify Pro | $20/mo | 3,000 credits/mo, unlimited team seats (free since 2026-04-14). NOTE: pricing page shows only the $20/3,000 tier — higher Pro credit tiers (5k/$33 etc.) NOT confirmed | Opt-in auto-recharge: 1,500 credits/$10, no ceiling; otherwise sites pause |
| Netlify Enterprise | Custom | Unlimited credits, SLA | Contract |
| Netlify Legacy Pro (pre-2025-09-04) | $19/member/mo (official docs; not $20) | 1 TB bandwidth, 25k build min | $55/100GB bandwidth, $7/500 build min — the classic $104k vector |
| DO free static | $0 | 3 static-only apps, 1 GiB outbound each | $0.02/GiB bandwidth; 4th static app $3/mo |
| DO shared CPU containers | $5 / $10 / $12 / $25 / $50 per mo | 1vCPU-512MiB/50GiB, 1vCPU-1GiB/100GiB (fixed), 1vCPU-1GiB/150GiB (scalable), 1vCPU-2GiB/200GiB, 2vCPU-4GiB/250GiB; per-second billing | $0.02/GiB transfer; each component/replica bills separately |
| DO dedicated CPU containers | $29–$392/mo per instance | up to 8 vCPU / 32 GiB, 100–900 GiB transfer, autoscaling | $0.02/GiB; autoscaled replicas each bill full rate |
| DO add-ons | dev DB $7/mo per 512 MiB; dedicated egress IP up to $25/mo per app; extra static app $3/mo | n/a | survive app teardown if not explicitly deleted |

**What blows first**: NETLIFY Free: the shared 300-credit pool — for agent/CI workflows it's PRODUCTION DEPLOYS (15 credits each → ~20 pushes to main = month gone with zero traffic served); for traffic it's bandwidth (20 credits/GB → 15 GB total). Result: sites pause, no bill. DIGITALOCEAN: on free static, the 1 GiB/app outbound allowance (a few thousand pageviews of a fat SPA) → silently converts to $0.02/GiB on the card; and the moment an agent scaffolds any dynamic component the $5/mo always-on container floor starts billing immediately.

**Spend cap status**: NETLIFY: Free = hard cap, on by default, cannot be exceeded (pause at 300 credits — post-$104k reform). Personal/Pro = fail-closed by default (sites pause at 0 credits) because auto-recharge is OFF by default; once a Team Owner enables auto-recharge there is NO dollar ceiling — packs re-bill indefinitely. No global 'never charge more than $X' switch on paid plans. Usage alert emails + in-app at 50%/75%/100% (official docs; the 90% threshold in one report is not on the page). DIGITALOCEAN: NO hard spend cap exists anywhere on the platform. Billing alerts are DISABLED by default (opt-in email, default threshold $20 when enabled) and do not stop resources; the payment 'threshold' is explicitly 'not a spending cap and does not limit how much you can use'. All overages bill the mandatory card/PayPal on file.

**Cost traps**

- Netlify agent deploy loops: every push to the production branch = 15 credits; auto-deploy-on-commit 'fix & push' agents can empty Free in a day and 200 deploys/mo = an entire Pro allotment (~$20). Use preview/branch deploys (free) while iterating
- Netlify auto-recharge = uncapped: off by default, but once enabled it re-bills $5/$10 packs every time balance hits zero with no documented maximum — runaway function or bot traffic becomes open-ended spend
- Netlify AI Gateway/Agent Runners: 180 credits per $1 of inference — leaked key or chatty agent drains credits faster than any other meter (~$1.67 of model spend kills a whole Free month)
- Netlify compute is GB-hours not invocations on credit plans: always-on polling, long timeouts, scheduled/background functions burn 10 credits/GB-hr continuously
- Bot/scraper traffic double-bills Netlify: web-requests AND bandwidth meters simultaneously
- Legacy→credit plan switch is one-way; legacy Starter/Pro with card still has $55/100GB bandwidth overage (the Feb-2024 $104k mechanism, since fixed for Free by hard pause)
- DO: agent deploys a 'service' component where 'static_site' would be free → $5–$50/mo always-on immediately; each service/worker/job in the app spec is a separately billed instance
- DO autoscaling (dedicated CPU): traffic spike or bot loop scales replicas, each billing per-second up to $392/mo-equivalent
- DO orphans: dev DB ($7/mo) and dedicated egress IP (up to $25/mo) survive component removal; droplets created 'for debugging' bill at full rate even powered OFF until DESTROYED, plus snapshots/volumes/reserved IPs after deletion
- DO component rename restarts the 28-day billing count → surprise end-of-month charge (official docs)
- DO visibility gap: no built-in per-app outbound-transfer usage meter in the control panel (Insights shows ingress) — you can't see the bandwidth cliff coming; leaked DO API token = attacker spend with no cap to stop it

**How to check usage**: NETLIFY: dashboard only — app.netlify.com > team > Usage & billing: 'Credit balance' (ledger + expiry), 'Credit usage breakdown' (by feature), 'Account usage insights' (daily per-meter chart: AI, bandwidth, compute, deploys, requests). No first-class CLI usage/credits command; `netlify status` for context, `netlify api` for raw API (no documented credits endpoint). Requires Owner/Billing Admin/Developer role. DIGITALOCEAN: `doctl balance get` (MonthToDateBalance/MonthToDateUsage), `doctl invoice list`, `doctl billing-history list`, `doctl apps list`, `doctl compute droplet list` (orphan sweep); API GET /v2/customers/my/balance; dashboard cloud.digitalocean.com/account/billing. Note: no per-app transfer-pool usage view.

**Unresolved conflicts**

- Usage alert thresholds: Report A said 50/75/100%, Report B said 50/75/90/100% — RESOLVED for A: official docs state exactly 'usage update email and in-app notification when you are at 50%, 75%, and 100%'
- Netlify Pro credit tiers: Report B claimed a 2026-07-14 expansion to 5k/$33, 10k/$63, 15k/$95, 20k/$126 — REJECTED: the live official pricing page lists only Pro $20/mo with 3,000 credits and no tiered options; B's tier numbers do not appear
- Legacy Pro seat price: Report A said $20/seat, Report B said $19/member — RESOLVED for B: official legacy-pricing docs say $19/month per member
- Report B's claim that Netlify credit-plan rollover exists at >=5k plans (implied by A) is moot since no >=5k plan is on the pricing page
- DO dedicated egress IP: A/B implied flat $25/mo — official docs clarify 'billed per second, up to $25.00 per month' (60-sec minimum)
- Report B's Droplet claims (per-second billing since 2026-01-01, $4/mo floor, $0.01/GiB overage) were NOT verified against an official page in this pass — treat as plausible but unconfirmed; droplet details are secondary to App Platform
- Report B's 'AI Credit Usage Limit' control (Agent Runners) appears only in B and was not re-verified; treat as optional/unconfirmed
- Non-conflicts confirmed by fetch: DO 3 free static apps / 1 GiB each / $0.02/GiB / $3 extra app / $5-$50 shared / $29-$392 dedicated / $7 dev DB / team-level pooled transfer / 28-day rename quirk; DO alerts disabled by default with $20 default threshold and explicitly 'not a spending cap'

**Sources**

- https://www.netlify.com/pricing/ (fetched 2026-07-17: Free 300cr, Personal $9/1000, Pro $20/3000 unlimited members, packs 500/$5 and 1500/$10, no Pro tiers)
- https://docs.netlify.com/manage/accounts-and-billing/billing/billing-for-credit-based-plans/monitor-usage-for-credit-based-plans/ (fetched: 50/75/100% alerts, dashboard locations)
- https://docs.netlify.com/manage/accounts-and-billing/billing/billing-for-legacy-plans/legacy-pricing-plans/ (fetched: $19/member legacy Pro, 100GB/300min free hard limits, $55/100GB and $7/500min overages)
- https://docs.netlify.com/manage/accounts-and-billing/billing/billing-for-credit-based-plans/how-credits-work/ (credit meter rates)
- https://docs.netlify.com/manage/accounts-and-billing/billing/billing-for-credit-based-plans/billing-faq-for-credit-based-plans/ (no hard spending limit on paid)
- https://www.netlify.com/changelog/netlify-pricing-update-introducing-credit-based-plans/ (2025-09-04 switch)
- https://www.netlify.com/blog/introducing-netlify-free-plan/ (post-$104k free plan policy)
- https://news.ycombinator.com/item?id=39521986 ($104k incident, CEO statement)
- https://docs.digitalocean.com/products/app-platform/details/pricing/ (fetched 2026-07-17: 3 free static/1GiB, $0.02/GiB, $3 extra app, $5-$50 shared, $29-$392 dedicated, $7 DB, egress IP per-second up to $25, team-pooled transfer, 28-day rename)
- https://docs.digitalocean.com/platform/billing/billing-alerts/ (fetched: alerts disabled by default, $20 default, 'not a spending cap')
- https://www.digitalocean.com/pricing/app-platform
- https://docs.digitalocean.com/platform/billing/bandwidth/ (separate App Platform vs Droplet pools)
- https://docs.digitalocean.com/products/droplets/details/pricing/ (droplet leftovers — not re-fetched)
- https://docs.digitalocean.com/reference/doctl/reference/balance/get/

---

## Clerk + Auth0 (Okta CIC) + Firebase Auth / GCP Identity Platform (verified 2026-07-17)

**Billing dimensions**

- Clerk: MRU (Monthly Retained Users — only users active >24h after signup; 'First Day Free')
- Clerk: MRO (Monthly Retained Organizations)
- Clerk: SMS per message; Enterprise Connections per-connection/mo; satellite domains $10/mo; machine-auth (API-key/M2M creations+verifications); Clerk Billing 0.7% of volume
- Auth0: MAU (any active event in calendar month — one-shot bot signups count)
- Auth0: M2M tokens/mo; Organizations count-gated; Enterprise Connections count-gated; SMS NOT sold by Auth0 (BYO Twilio, bills on Twilio)
- Firebase: Tier-1 MAU (email/social/anon/phone); Tier-2 MAU (SAML/OIDC, separate meter); SMS per message, country-priced

**Free tier**

Clerk Hobby $0: 50,000 MRU/app (raised from 10K on 2026-02-05), 100 MRO/app, 20 members/org, 3 seats, no MFA/SMS, API keys 1,000 creations + 100K verifications/mo, M2M 2,500 creations + 100K verifications/mo, 1-day logs. Auth0 Free $0: 25,000 MAU, 5 organizations, 1 Enterprise Connection (new Feb 2026) + Self-Service SSO/SCIM, 1,000 M2M tokens/mo, 3 admins, no Pro MFA. Firebase Spark $0: 50,000 Tier-1 MAU, 50 SAML/OIDC MAU, phone auth NOT available (Blaze required); email quotas ~150 password-reset/day. On Blaze: first 10 SMS/day not billed (official Identity Platform wording).

**Plans**

| Plan | Price | Included | Overage |
|---|---|---|---|
| Clerk Pro | $25/mo ($20/mo annual) | 50K MRU, MFA, SMS auth available, 1 Enterprise Connection, 100 MRO, 7-day logs | MRU $0.02 (50K–100K) → $0.018 → $0.015 → $0.012; MRO $1 (101–1K) → $0.90 → $0.75 → $0.60/org/mo; SMS $0.01 US/CA (intl market rate); EC $75/mo (2–15) → $60 → $30 → $15 (500+) |
| Clerk Business | $300/mo ($250/mo annual) | Pro + 10 seats (extra $20/mo), SOC 2, 30-day logs | same meters as Pro; add-ons: B2B Auth $100/mo ($85 annual), Administration $100/mo, Billing 0.7% of volume |
| Auth0 B2C Essentials / Professional | $35/mo / $240/mo (at 500 MAU) | Essentials: Pro MFA, 10 orgs, higher API limits; Professional: Enterprise MFA, 5,000 M2M tokens | NO per-MAU overage — 'If usage falls between tiers, you are billed at the next tier up' (buy bigger MAU tier); 3 consecutive months over can auto-upgrade |
| Auth0 B2B Essentials / Professional | $150/mo / $800/mo (at 500 MAU) | B2B org/SSO features; Professional ~5 ECs then ~$100/mo each | tier-purchase model, same as B2C; SMS costs land on your Twilio bill, not Auth0's |
| Firebase Blaze (Identity Platform, pay-as-you-go) | $0 base | 50K Tier-1 MAU free, 50 Tier-2 MAU free, first 10 SMS/day free, 99.95% SLA, MFA, multi-tenancy | Tier-1 MAU $0.0055 (50K–100K) → $0.0046 → $0.0032 → $0.0025; Tier-2 $0.015/MAU; SMS per message after 10/day: US $0.01, GB $0.05, DE $0.10, IN $0.07, ID $0.35, all-other-regions $0.46 |

**What blows first**: Firebase: phone-auth SMS — bills after just 10 free SMS/day (hours-to-days with OTP login on; MAU free to 50K is nearly unreachable). Auth0: 5-org wall (multi-tenant), 1,000 M2M tokens/mo (agent backends), then the 25K-MAU cliff to a paid tier (bots count as MAU). Clerk: 100 MRO / 20 members-per-org for B2B (org #101 = $1/org/mo), or the MFA/SMS feature gate forcing Pro; pure B2C rarely hits 50K MRU since drive-by bot signups don't count.

**Spend cap status**: Clerk: no dollar cap; Hobby has hard product limits (soft cap, no card) with ~1-month grace; on Pro all overage bills automatically, no spend-limit setting. Auth0: Free is quota-enforced (no overage billing, warnings then pressure to upgrade); paid self-serve has no hard cap and can auto-upgrade after 3 consecutive months over purchased MAU. Firebase: Spark = true hard cap (features stop); Blaze has NO cap — GCP budgets are ALERTS ONLY by default; kill-switch requires DIY budget Pub/Sub → Cloud Function that disables billing.

**Cost traps**

- Bot-signup MAU inflation: Auth0 and Firebase bill any in-month signup as 1 MAU (Firebase even anonymous auth via signInAnonymously loops); Clerk's MRU is immune to one-shot bots — but Clerk SMS phone verification during bot signups still bills $0.01+ each
- SMS pumping fraud: scripted phone-OTP signups with premium-rate numbers — Firebase bills per SMS (up to $0.46 intl, incl. failed regions), Clerk bills per SMS, Auth0 drains your separate Twilio account (SMS invisible in Auth0 billing; Auth0 caps 10 SMS/user/hr)
- Agent scaffolds default-enabling phone/SMS auth and org auto-creation — both are the paid meters (Firebase SMS from message #11/day; Clerk $1/org after 100; Auth0 6th org needs paid)
- Auth0 pricing cliff: free 25K MAU but paid Essentials starts at 500 MAU/$35 — crossing free means buying a MAU tier, not paying cents of overage; agent CI runs creating users inflate MAU (no cleanup = billed)
- Agent loops: Auth0 client-credentials retries chew 1,000 free M2M tokens/mo; Clerk Hobby hard-caps API-key creations (1,000/mo) and verifications (100K/mo)
- Leaked keys: Firebase web API keys are public by design — exposed key + phone auth + no App Check = SMS bill attack; leaked Clerk sk_live_ / Auth0 Management tokens allow mass user creation
- Clerk Billing add-on takes 0.7% of payment volume on top of Stripe 2.9%+$0.30 — easy to miss when scaffolding payments
- Clerk enterprise SSO is metered per connection ($75/mo each at 2–15) since Feb 2026 — 3 SAML customers ≈ $150/mo over base

**How to check usage**: Clerk: https://dashboard.clerk.com/billing (Usage/Billing tabs; CLI has no usage metrics — `clerk open`). Auth0: https://support.auth0.com/reports/quota and /reports/usage; Management API GET /api/v2/stats/active-users; CLI `auth0 api get stats/active-users` (no billing subcommand). Firebase: https://console.firebase.google.com/project/_/usage and Authentication → Usage (Sent/Verified/Blocked SMS in Metrics Explorer); billing at console.cloud.google.com/billing filtered to Identity Platform; `gcloud billing accounts list`, `gcloud billing budgets list --billing-account=X`, `firebase projects:list`.

**Unresolved conflicts**

- Firebase free SMS allotment: Report A said 'no free SMS allotment, billed from message #1'; Report B said 'first 10 SMS/day free'. RESOLVED for B — official cloud.google.com/identity-platform/pricing states verbatim 'The first ten SMS that you send per day are not billed' with worked example 1,300 SMS → 300 free + 1,000×$0.01=$10. (firebase.google.com/pricing's terse 'Billed per SMS sent' caused A's error.)
- Auth0 overage model: Report A claimed continuous ~$0.07/MAU overage (sourced from third-party ssojet blog); Report B said tier-purchase. RESOLVED for B — official page: 'If usage falls between tiers, you are billed at the next tier up'; no per-MAU overage rate exists.
- Auth0 free Enterprise Connections: A said SSO is paid-only; B said 1 EC free since Feb 2026. RESOLVED for B — pricing page shows '1 Enterprise Connection (NEW)' on Free.
- Firebase intl SMS ceiling: A said ~$0.06–$0.34; B said up to $0.46. RESOLVED for B — official table: ID $0.35, UZ $0.41, 'All other regions (ZZ)' $0.46.
- Auth0 M2M included tokens: A said add-on 'from $30/mo per 7,500'; official page shows Free/Essentials 1,000 and Professional 5,000 included with add-ons available — A's add-on rates unverified, dropped.
- Auth0 orgs on paid: A said B2B Essentials 'unlimited orgs', B said Essentials 10 orgs. UNRESOLVED (page toggle-dependent); free tier = 5 orgs confirmed. Minor; re-check B2B toggle before relying on it.
- Clerk MRO overage placement: A lists it as a general meter, B places it under the $100/mo B2B add-on; official page lists both the $100/mo B2B add-on and MRO bands ($1→$0.60) — rates confirmed identical either way.

**Sources**

- https://clerk.com/pricing (fetched 2026-07-17: 50K MRU, 100 MRO, Pro $25/Business $300, MRU $0.02→$0.012, MRO $1→$0.60, EC $75→$15, SMS $0.01, B2B add-on $100/mo, machine-auth caps)
- https://auth0.com/pricing (fetched 2026-07-17: 25K MAU free, 5 orgs, 1 free EC, B2C $35/$240, B2B $150/$800 at 500 MAU, M2M 1K/5K, next-tier-up billing)
- https://cloud.google.com/identity-platform/pricing (fetched 2026-07-17: MAU $0.0055/$0.0046/$0.0032/$0.0025, Tier-2 $0.015, 'first ten SMS per day are not billed', country table US $0.01…ZZ $0.46)
- https://firebase.google.com/pricing (fetched 2026-07-17: Spark 50K MAU, 50 SAML/OIDC MAU, phone auth not on Spark)
- https://clerk.com/changelog/2026-02-05-new-plans-more-value (Clerk Feb 2026 repricing, per Report A)
- https://auth0.com/blog/auth0-b2b-plans-upgraded/ (Auth0 Feb 2026 B2B free-tier upgrade, per Report B)
- https://firebase.google.com/docs/projects/billing/avoid-surprise-bills + https://cloud.google.com/billing/docs/how-to/budgets (budgets are alerts-only)
- https://firebase.google.com/docs/auth/limits (email/day quotas, per-IP SMS caps)
- https://auth0.com/docs/secure/multi-factor-authentication/multi-factor-authentication-factors/configure-sms-voice-notifications-mfa (BYO Twilio, 10 SMS/user/hr)

---

## Cloudinary + Pinecone + Upstash (merged factsheet, verified vs official pricing pages 2026-07-17)

**Billing dimensions**

- Cloudinary: single 'credits' meter — 1 credit = 1,000 transformations OR 1 GB managed storage OR 1 GB bandwidth (video bandwidth 1 GB/credit free plan, 2 GB/credit self-serve paid; video processing ~500s SD / 250s HD per credit); transforms+bandwidth on a ROLLING 30-day window, storage is a current snapshot
- Pinecone serverless: Read Units (~1 RU per GB of namespace scanned, min 0.25/query), Write Units (~1 WU per 1 KB, min 5 WU/request), storage GB-mo, egress GB; extras: backups $0.10/GB-mo, restore $0.15/GB, import $0.25/GB, Inference tokens
- Pinecone pods (LEGACY, closed to new signups since 2025-08-18): billed per-minute (15-min rounding) while the index EXISTS, regardless of activity — idle pods bill 24/7 (p1/s1.x1 $0.111/hr ≈ $81/mo)
- Upstash Redis PAYG: commands $0.20/100K (PING/AUTH free), storage $0.25/GB-mo after first 1 GB free, bandwidth free to 200 GB/mo then $0.03/GB, extra DBs $0.50/mo beyond 10; global-replication writes count as extra commands per read region
- Upstash Kafka: DISCONTINUED (deprecated 2024-09, gone ~2025-03) — any plan using it is dead on arrival; QStash/Workflow is the replacement

**Free tier**

Cloudinary Free: 25 credits/mo (any mix ≈ 25K transforms / 25 GB storage / 25 GB bandwidth), 3 users, 10 MB image / 100 MB video max, no card. Pinecone Starter: $0 — 2 GB storage, 2M WU/mo, 1M RU/mo, 1 GB egress/mo, 5 indexes, 100 namespaces/index, AWS us-east-1 only, 5M inference tokens/mo. Upstash Redis Free: 256 MB data, 500K commands/mo, 10 GB bandwidth/mo, up to 10 free databases. All three are free-forever, no card.

**Plans**

| Plan | Price | Included | Overage |
|---|---|---|---|
| Cloudinary Plus | $99/mo ($89 yearly) | 225 credits/mo, 3 users / 2 accounts | No auto-billing: warn → nag → account disable. No published per-credit rate (Pro PAYG ~$0.45/credit is third-party-reported, sales-only) |
| Cloudinary Advanced | $249/mo ($224 yearly) | 600 credits/mo, 5 users / 3 accounts, CNAME | Same soft-limit/disable behavior; Enterprise is custom |
| Pinecone Builder | $20/mo flat | 10 GB storage, 5M WU/mo, 2M RU/mo, 10 GB egress, 10 indexes/project | Blocked at limits — no overage billing (verified on pricing page) |
| Pinecone Standard | $50/mo minimum, then PAYG | PAYG: WU $4–4.50/M, RU $16–18/M, storage $0.33/GB-mo, egress $0.10/GB after 100 GB included; $300 3-week trial credits | Fail-open on dollars; $50 bills even at zero usage |
| Pinecone Enterprise | $500/mo minimum | WU $6–6.75/M, RU $24–27/M, 99.95% SLA, CMEK | Fail-open on dollars |
| Upstash Redis PAYG | $0 base, usage-billed | $0.20/100K commands, 1 GB storage free then $0.25/GB, 200 GB bandwidth free then $0.03/GB, 100 GB max data | Fail-open UNLESS you set the per-DB max monthly budget (real hard cap) |
| Upstash Redis Fixed | $10 (250MB) / $20 (1GB) / $100 (5GB) / $200 (10GB) / $400 (50GB) / $800 (100GB) / $1,500 (500GB) per mo | Unlimited commands; bandwidth 50 GB → 20 TB by tier; read regions +$5–$750/mo; Prod Pack +$200/DB/mo | Capped by construction, but watch opt-in auto-upgrade to next tier |

**What blows first**: Cloudinary: transformations or bandwidth out of the shared 25-credit pool — agent-generated unique transform URLs (per-width, f_auto/q_auto variants) burn transform credits first (50 imgs x 4 breakpoints x 2 formats = 400 transforms/render); image-heavy traffic with cached derivatives burns bandwidth first. Rolling 30-day window means a one-day spike haunts you for a month. Pinecone Starter: Read Units (1M/mo) — RU scales with namespace size, a RAG loop at 3 queries/message dies at ~20–60K messages/mo; egress (1 GB) dies even faster with include_values=true. Upstash: commands (500K/mo) — 3 Redis ops/request = exhausted at ~5,500 req/day; ONE 1-second polling loop = 2.6M commands/mo.

**Spend cap status**: Upstash: YES — real hard cap ("max monthly budget", PAYG per-DB, console): alerts at 70%/90%, then rate-limited so cost never exceeds budget — but OFF by default, you must set it. Pinecone: Starter/Builder are hard-walled (blocked at quota, no dollars); Standard/Enterprise have NO cap — spend alerts only (Settings → Spend alerts) plus auto email at >2x last invoice, fail-open on dollars. Cloudinary self-serve: no dollar cap needed — soft limits with email warnings escalating to account disable (availability risk, not billing risk); Pro PAYG/Enterprise fail open on overage.

**Cost traps**

- #1: Legacy Pinecone POD index scaffolded from tutorial-era code bills ~$81+/mo per-minute while completely IDLE (closed to new signups since 2025-08-18, but existing/grandfathered pods still bill 24/7)
- Pinecone Standard's $50/mo minimum bills at zero usage; agent creating Standard 'just for a region' eats the floor
- Pinecone: include_values=true burns egress; 1-vector-per-request upserts pay the 5 WU minimum each — batch instead; re-embedding+re-upserting the corpus every deploy burns WU linearly
- Upstash: setInterval polling Redis every 1s = 2.6M commands/mo (~$5) per loop; @upstash/ratelimit meters every bot request; global multi-region multiplies write commands per read region; leaked UPSTASH_REDIS_REST_URL+TOKEN = anyone burns commands (set the budget cap!)
- Upstash Kafka is DEAD (shut down ~2025-03) — reject any plan referencing it
- Cloudinary: every unique transformation URL (each width/format/DPR) is a billed transform — unbounded runtime parameterization = unbounded transforms; upload retry loops bill 1 transform + storage each; leaked unsigned upload preset lets bots stuff storage; rolling 30-day window means spikes linger; paid add-ons (auto-tagging etc.) bill separately and hard-stop
- Cloudinary failure mode on self-serve is account SUSPENSION mid-demo, not a bill

**How to check usage**: Cloudinary: console.cloudinary.com dashboard; Admin API GET /v1_1/<cloud>/usage; CLI `cld admin usage`. Pinecone: app.pinecone.io → Settings → Usage/Billing; query responses carry usage.read_units; CLI `pc index list/describe` (ops only, no spend command). Upstash: console.upstash.com per-DB Usage/Metrics tab; management API GET api.upstash.com/v2/redis/stats/<db-id>; budget set in DB settings.

**Unresolved conflicts**

- Pods-legacy date: Report A said 'legacy as of ~April 2026'; Report B said Aug 2025. RESOLVED for B via docs.pinecone.io: 'Pod indexes are no longer available to new customers as of August 2025' (cutoff 2025-08-18). A's 'Dedicated Read Nodes GA April 2026' left unverified.
- Upstash free DB count: Report A hedged (docs 10 vs table 1). RESOLVED via upstash.com/pricing/redis: up to 10 free databases; $0.50/DB beyond.
- Pinecone Builder quotas: A had price only; B's 10 GB / 5M WU / 2M RU / 10 GB egress / 10 indexes CONFIRMED on pricing page, including blocked-not-billed at limits.
- Cloudinary plan lineup: B listed Advanced Extra ($549) and Pro ($1,099); official pricing page shows ONLY Free/Plus/Advanced/Enterprise — Advanced Extra/Pro sourced from compare-plans FAQ, UNVERIFIED here, treat as tentative.
- Cloudinary first-quota-blown: A said transforms, B said bandwidth. Both kept — depends on app shape; agent-built apps with dynamic per-width URLs hit transforms first, cached-image traffic hits bandwidth first.
- Cloudinary ~$0.45/extra-credit and Pinecone collections $0.000035/GB-mo: not on official pages, flagged as unverified/suspect in both reports — excluded from decisive numbers.
- Verified as consistent across both reports + live pages: Cloudinary Free 25/Plus $99/225cr/Advanced $249/600cr; Pinecone Starter quotas and Standard/Enterprise minimums+rates; Upstash PAYG rates, fixed tiers, budget-cap mechanics (70%/90% alerts, rate-limit at cap, not default).

**Sources**

- https://cloudinary.com/pricing (fetched 2026-07-17)
- https://cloudinary.com/pricing/compare-plans
- https://cloudinary.com/documentation/admin_api#usage
- https://www.pinecone.io/pricing/ (fetched 2026-07-17)
- https://docs.pinecone.io/guides/indexes/pods/understanding-pod-based-indexes (fetched 2026-07-17)
- https://docs.pinecone.io/guides/manage-cost/manage-cost
- https://upstash.com/pricing/redis (fetched 2026-07-17)
- https://upstash.com/docs/redis/overall/pricing
- https://upstash.com/blog/workflow-kafka
- https://upstash.com/docs/devops/developer-api

---
