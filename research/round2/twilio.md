# Research archive (round 2): twilio

Raw dual-engine research (2026-07-17). Engine A = Claude web search; Engine B = grok CLI. Merged factsheet cross-checks both.

## Merged factsheet

```json
{
  "provider": "Resend · SendGrid (Twilio) · Mailgun (Sinch) — transactional email APIs (verified 2026-07-17)",
  "billing_dimensions": [
    "Resend: emails/mo (sent AND inbound both count; each To/CC/BCC recipient = 1 email), marketing contacts stored, automation runs ($0.0015/run past 10k), AI credits, dedicated IP flat add-on",
    "SendGrid Email API: emails ('credits')/mo — Requests = Processed + Dropped, so suppressed/dropped sends still burn credits",
    "SendGrid Marketing Campaigns: TWO meters, contacts stored AND emails sent — separate purchase/meter from Email API; plus validation credits, dedicated IPs, testing credits",
    "Mailgun: emails/mo (overage per 1,000), email validations (per 100), dedicated IPs ($59/IP/mo), log retention plan-gated (1 day free/Basic → 30 days Scale); contact storage NOT metered on core Send plans"
  ],
  "free_tier": "Resend: PERMANENT — 3,000 emails/mo AND 100/day (both enforced; sent+inbound count), 1 domain, 1,000 marketing contacts, 10k automation runs, 30-day retention; hard stop, no overage. SendGrid: NONE — permanent free (100/day) retired May 27, 2025, wind-down ended ~Jul 26, 2025 (non-upgraded accounts: sending disabled, contacts >100 deleted irrecoverably); replacement is a one-time 60-day trial, 100 emails/day, $0, no CC — pay or die on day 61. Mailgun: PERMANENT — 100 emails/day (≈3k/mo max, can't bank days), 1 domain, 2 API keys, 1-day logs, 1 inbound route; hard daily stop.",
  "plans": [
    {
      "name": "Resend Pro",
      "price": "$20/mo (or $35/mo)",
      "included": "50k emails (100k at $35)",
      "overage": "$0.90/1,000, auto-charged in 1k buckets, hard-capped at 5x quota"
    },
    {
      "name": "Resend Scale",
      "price": "$90–$1,150/mo",
      "included": "100k → 2.5M emails ($90/100k, $160/200k, $350/500k, $650/1M, $825/1.5M, $1,150/2.5M)",
      "overage": "$0.90→$0.46/1,000 declining by tier ($0.80, $0.70, $0.65, $0.52, $0.46); dedicated IP $30/mo add-on (needs 3k+/day)"
    },
    {
      "name": "Resend Marketing (contacts)",
      "price": "$40–$650/mo",
      "included": "5,000–150,000 contacts, unlimited sends to them"
    },
    {
      "name": "SendGrid Trial",
      "price": "$0, one-time 60 days",
      "included": "100 emails/day",
      "overage": "none — hard stop; all sending dead on day 61 without upgrade"
    },
    {
      "name": "SendGrid Essentials",
      "price": "from $19.95/mo",
      "included": "50k emails (100k tier ~$34.95)",
      "overage": "$0.0013/email at 50k, $0.0009 at 100k; billed in arrears next invoice; no dedicated IP"
    },
    {
      "name": "SendGrid Pro",
      "price": "from $89.95/mo",
      "included": "100k → 2.5M emails; 1 dedicated IP + SSO + subusers + 5k validations",
      "overage": "$0.0011/email at 100k → $0.0009 (300k) → $0.0008 (700k) → $0.0006 (1.5M) → $0.0005 (2.5M)"
    },
    {
      "name": "SendGrid Marketing Campaigns Basic/Advanced",
      "price": "Basic from $15/mo, Advanced from $60/mo",
      "included": "Basic 5k–100k contacts / 15k–300k sends; Advanced 10k–200k contacts / 50k–1M sends",
      "overage": "per extra email OR contact: Basic $0.0040–$0.0028, Advanced $0.0075–$0.0050 — contact storage bills EVERY month after one import"
    },
    {
      "name": "Mailgun Basic",
      "price": "from $15/mo",
      "included": "10,000 emails/mo",
      "overage": "from $1.80/1,000 (priciest of the three); validations from $1.20/100"
    },
    {
      "name": "Mailgun Foundation",
      "price": "$35/mo (1st month free)",
      "included": "50,000 emails/mo, 5-day logs",
      "overage": "from $1.30/1,000 (verified on official pricing page; Report A's $1.80 was wrong)"
    },
    {
      "name": "Mailgun Scale",
      "price": "$90/mo (1st month free)",
      "included": "100,000 emails/mo, 30-day logs, 5,000 validations, 1 dedicated IP, SAML SSO",
      "overage": "from $1.10/1,000; validations from $0.80/100; extra IPs $59/IP/mo"
    }
  ],
  "first_quota_blown": "Free tiers: the 100 emails/day cap (Resend AND Mailgun) — one signup burst, password-reset loop, or a newsletter to ~100 addresses kills it in hours (each recipient counts; Resend counts inbound too). SendGrid: the 60-day trial clock itself — app dies on day 61 with 'Maximum Credits Exceeded' regardless of volume. On paid: SendGrid Marketing's contact-storage meter blows before the send meter (importing a 6k CSV on Basic 5K = recurring monthly overage); Mailgun new accounts may also hit an ~100 msgs/hour probation limit until business verification.",
  "spend_cap": "Resend: HARD CAP ON BY DEFAULT — paid overage stops at 5x monthly quota, then sending pauses until next cycle (adjustable via support); free tier hard-stops, no charge. SendGrid: NO user-configurable spend cap, alerts only (usage_limit alert); BUT since Mar 26, 2026 an automatic non-adjustable ceiling of 10x plan allotment applies to Email API Essentials/Pro (e.g. Essentials 50K hard-stops at 500k requests/mo; resellers 2.5x) — verified on official support article; overage still bills in arrears up to that ceiling, and upgrading does NOT erase incurred overage. Mailgun: hard cap AVAILABLE but OFF BY DEFAULT — 'custom message limit' (Settings or API PUT /v5/accounts/limit/custom-monthly) disables the account when the monthly message count hits; message-count based, not dollars; re-enable via PUT /v5/accounts/limit/custom-enable or auto next month; without it, overage is fail-open.",
  "traps": [
    "SendGrid counts Dropped/suppressed requests as consumed credits (Requests = Processed + Dropped) — a loop hammering suppressed addresses burns quota and money anyway",
    "Runaway retry loops: SendGrid mail/send accepts up to ~10,000 req/s and bills overage in arrears — bounded only by the new 10x ceiling (~9x plan price worst case); Mailgun overage is fully fail-open unless the off-by-default custom limit is set; Resend's 10 req/s team rate limit + 5x cap naturally bound loops",
    "Contact-import loops: SendGrid Marketing and Resend Marketing bill per STORED contact — re-importing/duplicating contacts inflates a recurring monthly meter, not a one-time charge",
    "Reputation kill-switch: Resend pauses sending at bounce >=4% or spam >=0.08% — an agent testing with fake addresses bricks the account; all three auto-suppress bounces/complaints (deliverability protection, not spend protection)",
    "Leaked API keys (bearer, prefixes re_ / SG. / basic-auth api:) — worst on SendGrid paid (arrears billing); blast radius limited to 100/day on free tiers, 5x quota on Resend paid",
    "Resend counts INBOUND email and every To/CC/BCC recipient against the same quota — webhook/forward loops and multi-recipient batches inflate usage invisibly",
    "SendGrid dual billing: Email API and Marketing Campaigns are separate purchases with separate meters — wiring both doubles exposure",
    "Mailgun 1-day log retention on Free/Basic makes post-mortem debugging of an agent loop nearly impossible",
    "SendGrid trial expiry is a silent prod outage: day 61 all API+SMTP sends fail"
  ],
  "usage_check": "Resend: dashboard resend.com/settings/usage + /settings/billing; official CLI EXISTS (Report A wrong): `npm i -g resend-cli` or `brew install resend/cli/resend` — `resend whoami`, `resend emails list`, `resend open` (resend.com/docs/cli). SendGrid: app.sendgrid.com/statistics + Settings>Alerts; API: curl -H \"Authorization: Bearer $SENDGRID_API_KEY\" \"https://api.sendgrid.com/v3/stats?start_date=2026-07-01\" (Requests column = credits burned; Activity API rate-limited to ~6/min); Twilio CLI: `twilio email:send`. Mailgun: app.mailgun.com dashboard (Sending/Analytics/Billing); API: curl -s --user \"api:$MAILGUN_API_KEY\" \"https://api.mailgun.net/v3/<domain>/stats/total?event=accepted\"; check cap: GET https://api.mailgun.net/v5/accounts/limit/custom-monthly (hyphenated path per official docs).",
  "keywords": [
    "resend",
    "resend-cli",
    "resend whoami",
    "resend emails send",
    "RESEND_API_KEY",
    "re_",
    "api.resend.com",
    "smtp.resend.com",
    "@sendgrid/mail",
    "@sendgrid/client",
    "sendgrid",
    "SENDGRID_API_KEY",
    "SG.",
    "api.sendgrid.com/v3/mail/send",
    "smtp.sendgrid.net",
    "twilio email:send",
    "mailgun.js",
    "mailgun-js",
    "mailgun-ruby",
    "MAILGUN_API_KEY",
    "MAILGUN_DOMAIN",
    "api.mailgun.net",
    "api.eu.mailgun.net",
    "smtp.mailgun.org"
  ],
  "hint": "SendGrid free is DEAD: 60-day trial only, all sends die day 61. Resend/Mailgun free = 100/day hard stop. Caps: Resend 5x quota ON by default; SendGrid alerts-only + auto 10x ceiling (Mar'26); Mailgun cap OFF by default. #1 trap: one CSV import on SendGrid Marketing = recurring monthly contact overage.",
  "conflicts": [
    "Mailgun Foundation overage: A said $1.80/1k, B said $1.30/1k — RESOLVED via mailgun.com/pricing fetch: from $1.30/1,000 (B correct)",
    "Resend official CLI: A said 'no official CLI', B listed one — RESOLVED via resend.com/docs/cli fetch: official resend-cli exists (npm/brew/curl installers, resend whoami/emails/domains) (B correct)",
    "SendGrid automatic 10x sending ceiling: A claimed it (effective Mar 26, 2026), B said 'no hard cap, fail-open' — RESOLVED via support.sendgrid.com article 35466138799899 fetch: confirmed 10x plan allotment cap on Essentials/Pro, 2.5x for resellers, starting Mar 26, 2026 (A correct); note billing-vs-request-count nuance: article frames it as Requests = Processed + Dropped",
    "SendGrid Pro 100K overage: B said $0.0011/email (A left unstated) — RESOLVED via twilio.com email-api pricing fetch: $0.0011 confirmed, declining to $0.0005 at 2.5M",
    "Mailgun custom-limit API path: A wrote /v5/accounts/limit/custom/monthly — official docs use hyphenated /v5/accounts/limit/custom-monthly and /v5/accounts/limit/custom-enable (docs win)",
    "Mailgun cap alert percentages: A said 50%/75%, B said ~75%/95% — UNRESOLVED (help.mailgun.com article returned 403); treat exact percentages as unverified, cap behavior itself confirmed via API docs",
    "SendGrid Pro 1.5M ~$749/mo price: A's figure is third-party (sendx.io) only — unverified, use pricing-page slider for real quotes",
    "SendGrid trial 'includes 1 dedicated IP' appeared in one pricing-page fetch — contradicts both reports and the dedicated-IP support article (Pro+ only); treated as page-summarization noise, dedicated IP remains Pro+"
  ],
  "sources": [
    "https://resend.com/pricing",
    "https://resend.com/docs/knowledge-base/account-quotas-and-limits",
    "https://resend.com/changelog/pay-as-you-go-pricing",
    "https://resend.com/docs/cli (fetched 2026-07-17)",
    "https://www.twilio.com/en-us/products/email-api/pricing (fetched 2026-07-17)",
    "https://www.twilio.com/en-us/products/marketing-campaigns/pricing",
    "https://www.twilio.com/en-us/changelog/sendgrid-free-plan",
    "https://support.sendgrid.com/hc/en-us/articles/35270136965403 (trial plan)",
    "https://support.sendgrid.com/hc/en-us/articles/35466138799899 (10x cap + credits; fetched 2026-07-17)",
    "https://support.sendgrid.com/hc/en-us/articles/40779261694875 (overage in arrears; fetched 2026-07-17)",
    "https://support.sendgrid.com/hc/en-us/articles/9237413560219 (dedicated IPs)",
    "https://www.twilio.com/docs/sendgrid/ui/account-and-settings/alerts",
    "https://www.mailgun.com/pricing/ (fetched 2026-07-17)",
    "https://documentation.mailgun.com/docs/mailgun/api-reference/send/mailgun/custom-message-limit (fetched 2026-07-17)",
    "https://help.mailgun.com/hc/en-us/articles/4402611589915 (403 on fetch — cap %s unverified)",
    "https://help.mailgun.com/hc/en-us/articles/360012287493 (suppressions)"
  ]
}
```

## Engine A — Claude (raw)

TWILIO / SMS-OTP PROVIDERS — PRICING & QUOTA FACTSHEET (verified 2026-07-17)

=== 1. METERED BILLING DIMENSIONS ===

Twilio Programmable Messaging:
- Per SMS SEGMENT sent (160 GSM-7 chars / 70 UCS-2 chars per segment; long messages billed as multiple segments), per segment received, per MMS, plus per-segment US carrier pass-through fees, plus per-failed-message processing fee, plus monthly phone-number lease. Source: https://www.twilio.com/en-us/sms/pricing/us
- US base rates: $0.0083/SMS outbound AND inbound (long code, toll-free, short code all $0.0083); MMS $0.022 out / $0.0165–$0.02 in. Carrier fees on top: AT&T $0.0035–$0.0045, T-Mobile $0.0025–$0.0045, Verizon $0.0045–$0.007, US Cellular $0.0025–$0.005 per SMS. Failed-message fee $0.001. Numbers: $1.15/mo local, $2.15/mo toll-free; short codes $1,000–$1,500/quarter. Source: https://www.twilio.com/en-us/sms/pricing/us
- International SMS: priced per destination country, roughly $0.0083 (US) up to ~$0.29 (Afghanistan $0.2907/msg, ~35x US); other high-cost examples: Andorra $0.1317, UAE $0.1092, satellite networks $0.10, Japan ~$0.0795. Full rate card CSV: https://www.twilio.com/content/dam/twilio-com/pricing-data/en/csv/PMded94a0dae30eaaec0f115f22859bd38_SMSPricing.csv ; per-country pages: https://www.twilio.com/en-us/sms/pricing ; API: https://www.twilio.com/docs/messaging/api/pricing

Twilio Verify (managed OTP):
- $0.05 per SUCCESSFUL verification + channel fees per ATTEMPT (SMS attempts are always charged regardless of delivery: $0.05 + $0.0083/SMS at US rates; WhatsApp auth template $0.0034 US; voice/email at standard rates; Push & TOTP channel fee included in the $0.05). No monthly minimums; volume discounts via sales. Source: https://www.twilio.com/en-us/verify/pricing

=== 2. FREE TIER ===
- No permanent free tier. Trial model CHANGED (docs current 2026): instead of the legacy ~$15 dollar credit, new accounts get a 30-DAY trial with product-specific free units: 100 SMS, 100 WhatsApp messages, 75 voice minutes, 3,000 emails. No credit card required. Source: https://www.twilio.com/docs/usage/trials
- Trial restrictions: send only to max 5 verified numbers, 1 phone number, messages prefixed "Sent from a Twilio Trial account", messaging limited to sign-up country, no custom message bodies during trial. Sources: https://www.twilio.com/docs/usage/trials , https://help.twilio.com/articles/360036052753-Twilio-Free-Trial-Limitations
- Post-Upgrade Free Units (PUFU) granted fresh on upgrade, never expire: 100 SMS, 75 voice min + 1,750 transcription min, 3,000 emails, 100 WhatsApp + 30 templates, 30 RCS. Source: https://www.twilio.com/docs/usage/trials

=== 3. PAID PLANS ===
- No named plans/tiers. Pure pay-as-you-go prepaid balance (or invoicing for enterprise). "Included" = the one-time PUFU units above; everything else is overage at the unit prices in section 1. Sources: https://www.twilio.com/en-us/pricing , https://help.twilio.com/articles/223135487-How-Twilio-billing-works
- Comparators (official pages): Vonage Verify: $0.0572 (EUR 0.052) per successful verification + messaging/voice rates per attempt (https://www.vonage.com/communications-apis/verify/pricing/). AWS End User Messaging: per-country SMS rates (US roughly $0.006–$0.007/segment + carrier fees; no monthly minimum), toll-free $2/mo, 10DLC campaign $10/mo ($2 low-volume), $1/mo per 10DLC number; SMS Protect ("filter" mode: AIT-flagged messages blocked and not charged) (https://aws.amazon.com/end-user-messaging/pricing/ , https://aws.amazon.com/sns/sms-pricing/).

=== 4. FIRST QUOTA AN INDIE APP BLOWS ===
- Trial: the 100-SMS trial unit cap — a single OTP flow tested with retries burns it in a day; also the 5-verified-recipient cap blocks any real user signup. Source: https://www.twilio.com/docs/usage/trials
- Upgraded: the prepaid BALANCE, via SMS pumping. At ~$0.05 + SMS fee per Verify attempt, a bot hammering your unprotected /send-otp endpoint toward premium routes (e.g., $0.29/msg destinations) drains a $20 top-up in a few hundred requests and then triggers auto-recharge (default recharges whenever balance < $10, refill up to $2,000 max). US-only legit traffic: 1,000 OTPs/mo ≈ $58 Verify ($0.05+$0.0083, ignoring carrier fees) — the meter that dominates is per-successful-verification. Sources: https://www.twilio.com/en-us/verify/pricing , https://help.twilio.com/articles/223135607-How-do-I-set-an-automatic-payment-recharge-trigger-

=== 5. COST TRAPS FOR AI-AGENT-BUILT APPS ===
- SMS pumping/AIT: unauthenticated OTP endpoints get farmed by bots sending to premium international prefixes. Twilio's own mitigation docs exist because this is the #1 trap. Fix: Geo Permissions + Verify Fraud Guard + rate limiting. Sources: https://www.twilio.com/docs/messaging/guides/sms-geo-permissions , https://www.twilio.com/docs/verify/preventing-toll-fraud/sms-fraud-guard
- Geo Permissions default only allows your HOME country — but agents/devs often enable "all countries" to make a test pass, opening pumping exposure. Source: https://www.twilio.com/docs/messaging/guides/sms-geo-permissions
- Auto-recharge default: upgraded accounts default to auto-recharging when balance < $10 (max refill $2,000) — a runaway loop or pumped endpoint bills your card repeatedly instead of stopping. Source: https://help.twilio.com/articles/223135607-How-do-I-set-an-automatic-payment-recharge-trigger-
- Retry loops: Verify SMS attempts are billed even if undelivered; agent code that retries on non-delivery multiplies cost. Source: https://www.twilio.com/en-us/verify/pricing
- Segment surprise: emoji/unicode in OTP body drops segment size to 70 chars; multi-segment = multi-billed. Source: https://www.twilio.com/en-us/sms/pricing/us
- Leaked Account SID + Auth Token = full send capability; Auth Token can't be scoped. Use API keys and rotate; Geo Permissions changes are deliberately NOT possible via API, so a leaked key can't widen countries. Source: https://www.twilio.com/docs/messaging/guides/sms-geo-permissions
- Fraud Guard only covers the SMS channel of VERIFY — raw Programmable Messaging OTP (hand-rolled codes via Messages API) gets NO Fraud Guard, and Fraud Guard default-on does NOT apply to custom verification codes. Source: https://www.twilio.com/docs/verify/preventing-toll-fraud/sms-fraud-guard , https://www.twilio.com/en-us/changelog/fraud-guard-is-now-enabled-by-default-for-all-new-existing-verify-customers

=== 6. SPEND CAPS ===
- NO true hard spend cap setting. Behavior: prepaid balance depletes → email alert at $5 (default notification trigger) → account SUSPENDED at $0/negative. So the prepaid balance is a de facto hard cap ONLY IF auto-recharge is OFF; with auto-recharge ON (the default state for upgraded projects: recharge when < $10), spend is uncapped up to card limits. Sources: https://help.twilio.com/articles/223135607-How-do-I-set-an-automatic-payment-recharge-trigger- , https://help.twilio.com/articles/360015760053-Manually-Add-Funds-and-Refill-your-Twilio-Project-Balance
- Usage Triggers are ALERTS ONLY (webhook fired ~once/minute evaluation when a usage/price threshold crossed); they do not suspend or block anything — but your webhook can call the Accounts API to set the account to "suspended", which is the standard DIY kill switch. Source: https://www.twilio.com/docs/usage/api/usage-trigger
- Fraud protections that limit damage: Verify Fraud Guard — FREE, included with Verify, ON BY DEFAULT for all new & existing Verify services (changelog; not applicable to custom-code users), 3 levels (Basic / Standard=default <1% FP / Max <2% FP), SMS channel only, with a "100% guaranteed protection against SMS pumping" offer subject to T&Cs. Sources: https://www.twilio.com/docs/verify/preventing-toll-fraud/sms-fraud-guard , https://www.twilio.com/en-us/changelog/fraud-guard-is-now-enabled-by-default-for-all-new-existing-verify-customers , https://www.twilio.com/en-us/blog/twilio-verify-fraud-guard-a-powerful-defense-against-sms-pumping-fraud
- Geo Permissions: default allows only sign-up home country; console-only (no API changes allowed, by design); Console > Messaging > Settings > Geo Permissions. Source: https://www.twilio.com/docs/messaging/guides/sms-geo-permissions

=== 7. HOW TO CHECK USAGE/SPEND ===
- Dashboard: https://console.twilio.com/us1/billing/manage-billing/billing-overview (balance, auto-recharge) and Monitor > Usage: https://console.twilio.com/us1/monitor/usage ; trial "Free units tracker" in Console. Sources: https://help.twilio.com/articles/360015760053 , https://www.twilio.com/docs/usage/trials
- CLI: `twilio api:core:balance:fetch` (current balance); `twilio api:core:usage:records:list` (and variants `.../records/today|this-month|last-month`); `twilio api:core:usage:triggers:create --usage-category sms --trigger-value 1000 --trigger-by price --callback-url <url>`; `twilio api:core:messages:list`. CLI ref: https://www.twilio.com/docs/twilio-cli/general-usage ; Usage Records API: https://www.twilio.com/docs/usage/api/usage-record ; Balance: https://www.twilio.com/docs/iam/api/balance
- REST: GET /2010-04-01/Accounts/{SID}/Balance.json ; GET /2010-04-01/Accounts/{SID}/Usage/Records.json ; audit Geo Permission changes via Monitor Events API (event `sms-geographic-permissions.updated`). Sources: https://www.twilio.com/docs/usage/api/usage-record , https://www.twilio.com/docs/messaging/guides/sms-geo-permissions

=== 8. SHELL-COMMAND DETECTION KEYWORDS ===
twilio ; twilio-cli ; twilio api:core:messages:create ; twilio api:core:messages:list ; twilio api:verify:v2:services:verifications:create ; twilio api:core:balance:fetch ; twilio api:core:usage:records:list ; twilio api:core:usage:triggers:create ; twilio phone-numbers:list ; twilio profiles:list ; npm i twilio ; pip install twilio ; env vars TWILIO_ACCOUNT_SID / TWILIO_AUTH_TOKEN / TWILIO_API_KEY. Alternates: vonage / nexmo CLI ; aws pinpoint-sms-voice-v2 / aws sns publish (SMS).

=== INDIE-DEV PRE-SHIP CHECKLIST (OTP) ===
1. Use Verify (not raw Messages API) so Fraud Guard (free, default-on) applies; keep Standard/Max level. 2. Lock Geo Permissions to countries you actually serve (default = home country only; do not blanket-enable). 3. Decide auto-recharge: OFF = balance is a hard cap (service stops at $0); ON = set low refill + create Usage Trigger webhooks (trigger-by price) that auto-suspend the account. 4. Rate-limit /send-otp per IP+phone, add bot protection (CAPTCHA/Turnstile) before the send. 5. Use scoped API keys, never ship the Auth Token. 6. Watch segments (keep OTP body GSM-7). 7. Trial won't work for real users (5 verified recipients max) — upgrade required.

Key recent changes noted: Twilio trial moved from ~$15 dollar credit to 30-day free-unit model (100 SMS / 75 voice min / 3,000 emails) with never-expiring post-upgrade units — reflected in docs current as of 2026 (https://www.twilio.com/docs/usage/trials). Fraud Guard made GA and later enabled-by-default for all Verify customers (https://www.twilio.com/en-us/changelog/verify-fraud-guard-is-now-generally-available , https://www.twilio.com/en-us/changelog/fraud-guard-is-now-enabled-by-default-for-all-new-existing-verify-customers).

## Engine B — grok (raw)

# Twilio / SMS-OTP pricing & quota factsheet  
**Current as of July 2026** (verified on official Twilio pricing/docs pages)

Service group: **Twilio Programmable SMS + Twilio Verify** (primary OTP stack).  
Pricing is **pay-as-you-go / prepaid balance** for self-serve—not a fixed monthly SaaS plan for Verify or SMS.

---

## 1. Metered billing dimensions

| Service | What is metered | Notes |
|--------|------------------|--------|
| **Programmable SMS** | Per **segment** outbound/inbound by **destination country**, **sender type** (long code / toll-free / short code / alpha), plus **US/CA carrier fees** | Segments, not "messages"; long OTP templates can be multi-segment. Failed-status processing fee **$0.001**/msg. |
| **US phone numbers** | Monthly lease: long code **$1.15**/mo, toll-free **$2.15**/mo | Plus A2P 10DLC registration/onboarding fees for US long codes. |
| **Verify API** | **$0.05 per successful verification** + **channel fee per attempt** (SMS/Voice always charged even if not delivered; WhatsApp when delivered) | Session: default **10 min**, up to **5** send attempts. Custom codes: charged per **created** verification. |
| **Verify SMS channel (US)** | Success fee + **$0.0083**/SMS + standard international rates for non-US | International SMS rates from per-country SMS pages. |
| **Verify WhatsApp (US)** | Success fee + **$0.0034** / auth template message (pricing page) | Product FAQ also cites different Meta-linked figures; **use pricing page for billing**. |
| **SMS Pumping Protection (Programmable Messaging)** | Often **$0.025** per outbound SMS (features line on many country pages); **US & Canada: no extra charge** | Separate from Verify Fraud Guard. |
| **Engagement Suite** | **$0.015**/outbound (first **1,000**/mo free) | Link shortener/scheduling. |

**Sources:** [Verify pricing](https://www.twilio.com/en-us/verify/pricing), [US SMS pricing](https://www.twilio.com/en-us/sms/pricing/us), [Verify product FAQ (billing rules)](https://www.twilio.com/en-us/user-authentication-identity/verify), [SMS Pumping Protection docs](https://www.twilio.com/docs/messaging/features/sms-pumping-protection-programmable-messaging).

---

## 2. Free tier — exact quotas

### Trial account (no credit card)
| Item | Quota |
|------|--------|
| Duration | **30 days**, then expires unless upgraded |
| **SMS messages** | **100** free units |
| **WhatsApp messages** | **100** free units |
| Voice | **75** minutes |
| Email | **3,000** emails |
| Verify listed as free units? | **Not in the free-units table** (trial is product-unit based, not a shared $ balance) |
| Recipients | Only **verified** numbers; max **5** verified recipients |
| Geography | SMS/voice restricted to **sign-up country** |
| Content | **Pre-defined templates only** (no custom OTP body on trial Messaging) |

### Post-upgrade free units (PUFU)
Granted automatically on upgrade; **never expire**; consumed before paid usage:

| Feature | Free units |
|---------|------------|
| Messaging (messages) | **100** |
| WhatsApp messages | **100** |
| WhatsApp templates | **30** |
| RCS | **30** |
| Voice minutes | **75** |
| Email | **3,000** |

**There is no ongoing free monthly Verify OTP allowance** after trial/PUFU are gone.  
**Sources:** [Trial account docs](https://www.twilio.com/docs/usage/trials), [Free trial how-to](https://www.twilio.com/docs/usage/tutorials/how-to-use-your-free-trial-account).

**Note (model change):** Trial is **product free units**, not a shared dollar credit (older docs/blogs often still say "$15 credit").

---

## 3. Paid "plans" — names, price, included, overage

Twilio Messaging/Verify for indies is **not** Starter/Pro SaaS tiers.

| Offering | Price | Included | Overage / unit rates |
|----------|-------|----------|----------------------|
| **Pay-as-you-go (self-serve)** | $0 fixed plan fee | PUFU once; then prepaid balance | See unit prices below |
| **Verify base** | **$0.05** / successful verification | Rate limiting, managed number pool, Fraud Guard (included) | + channel fees |
| **Verify volume** | **Custom** (sales) | Negotiated | Contact sales; no public self-serve tier table |
| **SMS volume discounts** | Automatic at monthly volume thresholds (per Messaging product) | Lower per-segment rates | See country pricing / volume section |
| **Committed-use discounts** | Enterprise/sales | Annual commit | Sales only |

### Verify unit stack (list, self-serve)

| Channel | Platform fee | Channel fee (list examples) |
|---------|--------------|-----------------------------|
| SMS | $0.05 / success | **US $0.0083**/SMS + destination rates |
| WhatsApp | $0.05 / success | **US $0.0034**/auth template (pricing page) |
| Voice | $0.05 / success | Voice per-minute rates apply to attempts |
| Email | $0.05 / success | Email product rates |
| Push / TOTP | Included in verification fee | Charged on approve (Push: approve/deny) |

**Sources:** [Verify pricing](https://www.twilio.com/en-us/verify/pricing), [Verify FAQ](https://www.twilio.com/en-us/user-authentication-identity/verify).

### Per-SMS outbound ranges by country (list prices, July 2026)

| Destination | Outbound SMS (approx list) | Source |
|-------------|----------------------------|--------|
| **United States** | **$0.0083**/segment + carrier ~**$0.0035–$0.005** (long code) | [US SMS pricing](https://www.twilio.com/en-us/sms/pricing/us) |
| **United Kingdom** | **$0.056**/segment (mobile / alpha) | [UK SMS pricing](https://www.twilio.com/en-us/sms/pricing/gb) |
| **France** | **$0.0798**/segment | [FR SMS pricing](https://www.twilio.com/en-us/sms/pricing/fr) |
| **India** | **$0.0832**/segment | [IN SMS pricing](https://www.twilio.com/en-us/sms/pricing/in) |
| **Philippines** | **$0.241**/segment | [PH SMS pricing](https://www.twilio.com/en-us/sms/pricing/ph) |
| **Nigeria** | **$0.3868**/segment | [NG SMS pricing](https://www.twilio.com/en-us/sms/pricing/ng) |

**Practical OTP band:** ~**$0.01–$0.40+ per SMS segment** destination-dependent; high-risk/high-rate countries (NG, PH, parts of LATAM/Africa) dominate pumping bills. Full matrix: [SMSPricing.csv](https://assets.cdn.prod.twilio.com/pricing-csv/SMSPricing.csv).

### Illustrative all-in Verify OTP cost (US, 1 SMS, success)
≈ **$0.05 + $0.0083 + ~$0.004 carrier ≈ $0.06–$0.065** per successful US SMS OTP.  
Failed attempts still burn **SMS channel fees** (and retries up to 5).

---

## 4. Which meter an indie app blows first

| Stage | First cliff | At what usage |
|-------|-------------|----------------|
| **Trial** | **100 SMS free units** (Messaging) and/or **30-day expiry** | ~100 OTP texts if using Messaging SMS; Verify not in free-unit table |
| **Upgrade / PUFU** | Another **100 messages** | Same order of magnitude |
| **Production OTP (Verify)** | **Prepaid account balance** + **auto-recharge** (not a free quota) | Balance → $0 stops traffic; auto-recharge can keep spending |
| **Fraud path (worst)** | **International SMS channel fees** to high-rate countries | Hundreds–thousands of pump attempts × **$0.05–$0.40+**/SMS; success fee only if codes are checked |
| **US compliance** | **10DLC / toll-free verification** friction before scale | Blocks reliable US delivery before cost, not a usage meter |

**Most common production blow-up for OTP apps:** open signup/OTP endpoint + default geo → **SMS pumping to expensive countries**, not the $0.05 Verify fee alone.

---

## 5. Cost traps for AI-agent-built apps

| Trap | Why it hurts |
|------|----------------|
| **SMS pumping / open OTP form** | Bots request OTP to carrier-controlled numbers; you pay channel fees even when codes are never completed. |
| **Auto-recharge left on defaults** | Balance never stays at $0; card is refilled when balance is low → unbounded spend until you notice. |
| **All geos enabled** | Messaging & Verify Geo Permissions often allow broad destinations; high-rate countries first. |
| **Leaked `TWILIO_AUTH_TOKEN` / Account SID** | Full send capability; agents commit keys to git/env dumps. |
| **Agent/retry loops** | Unbounded resend on timeout; Verify allows **5 attempts / 10 min** per entity but many entities = many sessions. |
| **Custom codes via Messaging API** | Skip Verify Fraud Guard; pay only SMS rates with weaker defaults unless SMS Pumping Protection is enabled. |
| **Multi-segment OTPs** | Long messages = 2–5× segments × country rate. |
| **"Test" to real numbers in prod** | Seed scripts / Playwright hitting live Verify with real SIDs. |
| **US A2P 10DLC** | Brand/campaign fees + throughput limits if shipping US long-code OTP without registration. |
| **WhatsApp auth without templates** | Delivery/billing surprises vs SMS path. |
| **No app-level rate limit** | Trusting only Twilio's 5/10-min limit while attackers rotate numbers. |

---

## 6. Spend caps: hard cap vs alerts

| Control | Hard stop? | Default? |
|---------|------------|----------|
| **Prepaid balance = $0** | **Yes** — usage stops when balance is exhausted (if auto-recharge **off**) | After upgrade you fund a balance; empty balance suspends usage |
| **Auto-recharge** | **No hard global cap** | Help Center: upgraded projects **default to auto-recharge when balance falls under ~$10**; recharges keep service up |
| **Maximum spend limit** | **No account-wide hard max spend** (official payment FAQ: *"There is no maximum spend limit setting"*) | Alerts/triggers only |
| **Usage Triggers** | **Alerts only** (webhook); do **not** stop traffic by themselves | Off until you create them |
| **Verify Fraud Guard** | Blocks **fraudulent SMS sends** (not a $ cap) | **On by default** for Verify customers |
| **Verify / Messaging Geo Permissions** | Blocks destinations you disable | Must configure; not a dollar cap |
| **Service rate limits (Verify)** | Can throttle OTP generation | Must configure |

**Indie takeaway:** The only reliable hard stop is **low prepaid balance + auto-recharge disabled** (or a card/limit you control). Usage Triggers are **notify-only**.

**Sources:** [Payment types / auto-recharge FAQ snippets](https://help.twilio.com/articles/49507358452635), [Manual funds / auto-recharge default under $10](https://help.twilio.com/articles/360015760053-Manually-Add-Funds-and-Refill-your-Twilio-Project-Balance), [Zero balance behavior](https://help.twilio.com/articles/223183248), [Usage Triggers API](https://www.twilio.com/docs/usage/api/usage-trigger), [Verify FAQ spend section](https://www.twilio.com/en-us/user-authentication-identity/verify), [Fraud Guard](https://www.twilio.com/docs/verify/preventing-toll-fraud/sms-fraud-guard).

---

## 7. How to check usage / spend

| Method | Where / what |
|--------|----------------|
| **Dashboard** | [Console billing overview](https://1console.twilio.com/us1/billing/manage-billing/billing-overview) — Admin → Account billing |
| **Usage UI** | Console → Monitor / Usage (Usage & Spend, Free Units Tracker) |
| **Verify fraud** | [Verify SMS Fraud Insights](https://console.twilio.com/us1/monitor/insights/verify/verify-fraud-insights) |
| **Verify geo** | [Verify Geo permissions](https://console.twilio.com/us1/develop/verify/settings/geopermissions) |
| **Usage Triggers UI** | Console Usage Triggers ([docs link via Verify FAQ](https://www.twilio.com/en-us/user-authentication-identity/verify)) |
| **REST API** | `GET /2010-04-01/Accounts/{Sid}/Usage/Records.json` — [Usage Records](https://www.twilio.com/docs/usage/api/usage-record) |
| **Usage Triggers API** | `POST .../Usage/Triggers.json` — [UsageTrigger](https://www.twilio.com/docs/usage/api/usage-trigger) |
| **CLI** | See §8 |

---

## 8. Shell-command keywords (CLI names / subcommands only)

```text
twilio
twilio login
twilio api:core:usage
twilio api:core:usage:records
twilio api:core:usage:records:list
twilio api:core:usage:records:today
twilio api:core:usage:records:today:list
twilio api:core:usage:records:this-month
twilio api:core:usage:records:last-month
twilio api:core:usage:records:daily
twilio api:core:usage:records:monthly
twilio api:core:usage:records:yearly
twilio api:core:usage:records:all-time
twilio api:core:usage:records:yesterday
twilio api:core:usage:triggers
twilio api:core:usage:triggers:create
twilio api:core:usage:triggers:list
twilio api:core:usage:triggers:remove
twilio api:core:messages:list
twilio api:core:messages:create
```

Common flags (for detection scripts): `--category sms`, `--trigger-by price|count|usage`, `--trigger-value`, `--callback-url`, `--recurring daily|monthly`.

**Source:** [Twilio CLI usage alert blog](https://www.twilio.com/en-us/blog/trigger-usage-alert-twilio-cli), [UsageTrigger docs](https://www.twilio.com/docs/usage/api/usage-trigger).

---

## SMS pumping protection features (must lock before shipping OTP)

### Verify Fraud Guard
- **On by default** for Verify customers; SMS channel only.  
- Levels: **Basic / Standard (default) / Max**.  
- Blocks suspicious destination prefixes; **Error 60410**.  
- Pair with **Safe List** for known good numbers.  
- **Source:** [Fraud Guard docs](https://www.twilio.com/docs/verify/preventing-toll-fraud/sms-fraud-guard).

### Verify Geo Permissions
- Per-country: **Disable / Allow / Monitor for Fraud Guard (SMS)**.  
- Immediate effect; safe-listed numbers not blocked by geo.  
- **Source:** [Verify Geo Permissions](https://www.twilio.com/docs/verify/preventing-toll-fraud/verify-geo-permissions).

### Programmable Messaging SMS Pumping Protection
- Optional enable in Messaging Settings.  
- **US/CA: free**; many other countries **$0.025**/outbound SMS.  
- Prefer **Verify + Fraud Guard** for OTP (no extra Fraud Guard fee).  
- **Source:** [SMS Pumping Protection](https://www.twilio.com/docs/messaging/features/sms-pumping-protection-programmable-messaging).

### Messaging Geographic Permissions
- Separate from Verify; restrict Programmable SMS destinations.  
- Mentioned in trial docs for international send after upgrade.  
- **Source:** [Trial / messaging geo](https://www.twilio.com/docs/usage/tutorials/how-to-use-your-free-trial-account).

---

## Auto-recharge defaults & free trial credit (summary)

| Topic | Fact (July 2026) |
|-------|------------------|
| Trial "credit" | **Not a dollar balance** — **product free units** (e.g. **100 SMS**), **30 days**, no card required |
| On upgrade | **PUFU** free units (e.g. **100** messages) never expire |
| Auto-recharge | **Enabled by default on many upgraded projects** when balance **&lt; ~$10** (Help Center) |
| Hard $ cap | **None** platform-wide; use balance control + triggers + fraud/geo |
| Verify free units on trial | **Not listed** in free-units table—plan as paid after PUFU/Messaging units |

---

## Indie pre-ship checklist (OTP)

1. Prefer **Verify** over raw Messaging for OTP (Fraud Guard included, on by default).  
2. **Disable Verify Geo** for every country you do not serve; same for Messaging Geo Permissions.  
3. Set Fraud Guard to **Standard or Max** if global.  
4. **Disable auto-recharge** (or set tiny recharge + low max) until you have monitoring.  
5. Create **Usage Triggers** on `price` / `sms` (daily + monthly)—alerts only.  
6. App-level: rate limit by IP, device, phone; CAPTCHA; progressive delays; block VOIP if Lookup warrants.  
7. Never commit **Auth Token**; use API keys with least privilege.  
8. Keep prepaid balance low in staging.  
9. US: complete **10DLC or toll-free verification** before production SMS.  
10. Monitor [Verify Fraud Insights](https://console.twilio.com/us1/monitor/insights/verify/verify-fraud-insights) and Error **60410** / **30450**.

---

## Primary source index

| Topic | URL |
|-------|-----|
| Verify pricing | https://www.twilio.com/en-us/verify/pricing |
| US SMS pricing | https://www.twilio.com/en-us/sms/pricing/us |
| Global SMS CSV | https://assets.cdn.prod.twilio.com/pricing-csv/SMSPricing.csv |
| Trial free units | https://www.twilio.com/docs/usage/trials |
| Fraud Guard | https://www.twilio.com/docs/verify/preventing-toll-fraud/sms-fraud-guard |
| Verify Geo | https://www.twilio.com/docs/verify/preventing-toll-fraud/verify-geo-permissions |
| SMS Pumping Protection | https://www.twilio.com/docs/messaging/features/sms-pumping-protection-programmable-messaging |
| Usage Triggers | https://www.twilio.com/docs/usage/api/usage-trigger |
| Usage Records | https://www.twilio.com/docs/usage/api/usage-record |
| Billing console docs | https://www.twilio.com/docs/usage/billing |
| Verify product / billing FAQ | https://www.twilio.com/en-us/user-authentication-identity/verify |
| Country samples | [GB](https://www.twilio.com/en-us/sms/pricing/gb) · [FR](https://www.twilio.com/en-us/sms/pricing/fr) · [IN](https://www.twilio.com/en-us/sms/pricing/in) · [PH](https://www.twilio.com/en-us/sms/pricing/ph) · [NG](https://www.twilio.com/en-us/sms/pricing/ng) |

**Caveat:** Carrier fees and international rates change without notice; re-check the CSV and country pages before budgeting. Volume discounts for Verify are sales-only and not published as fixed self-serve tiers as of this check (July 2026).
