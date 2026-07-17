# Research archive (round 2): email

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

# Transactional Email Pricing/Quota Factsheet — Resend, SendGrid (Twilio), Mailgun
**Current as of 2026-07-17. All numbers verified against official pricing pages/docs on this date unless marked otherwise.**

---

## 1. Metered billing dimensions

**Resend** (https://resend.com/pricing)
- Emails/month (transactional plans; BOTH sent AND received/inbound emails count; each recipient of a multi-recipient email counts separately — per https://resend.com/docs/knowledge-base/account-quotas-and-limits)
- Contacts stored/month (separate "Marketing" plans, billed by contact count)
- Automation runs/month ($0.0015/run past included 10,000)
- AI credits/month
- Dedicated IP (flat add-on)

**SendGrid** (https://www.twilio.com/en-us/products/email-api/pricing)
- Email API: emails ("credits")/month — Requests = Processed + Dropped, so suppressed/dropped sends still consume credits (https://support.sendgrid.com/hc/en-us/articles/35466138799899-Understanding-the-Maximum-Credits-Exceeded-error)
- Marketing Campaigns: contacts stored AND emails sent — TWO meters, both can incur overage; MC sends are metered separately from Email API sends (separate purchases) (https://www.twilio.com/en-us/products/marketing-campaigns/pricing)
- Email validation credits; dedicated IPs; email testing credits

**Mailgun** (https://www.mailgun.com/pricing/)
- Emails/month (per plan, overage per 1,000)
- Email validations (per 100)
- Dedicated IPs (flat $/IP/month)
- Log/message retention is plan-gated (not metered, but a paywall dimension)

---

## 2. Free tiers (exact)

**Resend — real permanent free tier:** 3,000 emails/month AND 100 emails/day (both limits enforced; sent+received count), 1 domain, 1,000 marketing contacts, 10,000 automation runs/mo, 5 AI credits/mo, 30-day data retention. No overage possible on free — sending stops at quota. (https://resend.com/pricing, https://resend.com/docs/knowledge-base/account-quotas-and-limits)

**SendGrid — PERMANENT FREE TIER IS DEAD. Verified.** The free plan (100 emails/day forever) was retired starting **May 27, 2025**, with a 60-day wind-down ending **July 26, 2025**; non-upgraded accounts had sending disabled, and free accounts storing >100 contacts had contacts **deleted irrecoverably** (https://www.twilio.com/en-us/changelog/sendgrid-free-plan). Replacement: a one-time **60-day free trial, 100 emails/day, $0, no credit card** — after 60 days you must pay or sending stops (https://www.twilio.com/en-us/products/email-api/pricing, https://support.sendgrid.com/hc/en-us/articles/35270136965403-Twilio-SendGrid-Trial-Account-Plan). Note: the Marketing Campaigns pricing page still displays a legacy "free: 2,000 contacts / 6,000 emails/mo" table entry, but the changelog supersedes it — treat MC free as trial-only.

**Mailgun — free tier exists:** 100 emails/day, 1 custom sending domain, 2 API keys, 1 day log retention, 1 inbound route (https://www.mailgun.com/pricing/).

---

## 3. Paid plans, included volume, overage

**Resend transactional** (https://resend.com/pricing, https://resend.com/changelog/pay-as-you-go-pricing)
- Pro: $20/mo = 50k emails; $35/mo = 100k. Overage $0.90/1,000.
- Scale: $90/mo = 100k; $160/mo = 200k; $350/mo = 500k; $650/mo = 1M; $825/mo = 1.5M; $1,150/mo = 2.5M. Overage $0.90 → $0.46 per 1,000 (declines with tier). Overage billed in 1,000-email buckets, auto-charged to card.
- Marketing (contacts): Pro $40–$650/mo for 5,000–150,000 contacts. Enterprise: custom (3M+ emails).
- Dedicated IP: $30/mo (Scale plan only; requires 3,000+ emails/day).

**SendGrid Email API** (https://www.twilio.com/en-us/products/email-api/pricing)
- Essentials: $19.95/mo = 50k emails (overage $0.0013/email = $1.30/1k); 100k tier overage $0.0009/email.
- Pro: from $89.95/mo = 100k (includes 1 dedicated IP); tiers at 300k (overage $0.0009), 700k (overage $0.0008), 1.5M, 2.5M; ~$749/mo at 1.5M (third-party corroboration: https://www.sendx.io/blog/sendgrid-pricing).
- Premier: custom, ~5M+/mo.
- Validation credits: Essentials 2,500, Pro 5,000 included.
- Marketing Campaigns: Basic from $15/mo (5k–100k contacts, 15k–300k sends); Advanced from $60/mo (10k–200k contacts, 50k–1M sends, dedicated IP access). Contact overage: Basic $0.0040–$0.0028/contact, Advanced $0.0075–$0.0050/contact (https://www.twilio.com/en-us/products/marketing-campaigns/pricing).
- Overage billed in arrears on next month's invoice; upgrading does NOT erase already-incurred overage (https://support.sendgrid.com/hc/en-us/articles/40779261694875-Twilio-SendGrid-Overage-Rates).

**Mailgun** (https://www.mailgun.com/pricing/)
- Basic: $15/mo = 10k emails. Overage $1.80/1,000.
- Foundation: $35/mo = 50k emails, 1,000 domains, 5-day logs. Overage $1.80/1,000.
- Scale: $90/mo = 100k emails, 30-day logs, 5,000 validations, **1 dedicated IP included**, SAML SSO. Overage $1.10/1,000.
- Dedicated IPs: $59/IP/mo. Validations overage $0.80–$1.20 per 100. Enterprise: custom.

---

## 4. First quota an indie-dev app blows

- **Resend:** the **100 emails/day free cap** — a signup burst or a single newsletter to ~100 addresses kills it in one day (each recipient counts as one email, and inbound also counts). Second trap: 1,000-contact marketing limit. On paid Pro, 50k/mo ≈ 1,667/day sustained.
- **SendGrid:** the **60-day trial expiry** itself — the app dies on day 61 with "Maximum Credits Exceeded" regardless of volume. During trial, 100 credits/day. On Marketing Campaigns, the **contact-storage meter** blows before the send meter (importing a 6k-row CSV on Basic 5k immediately bills $0.0040/extra contact).
- **Mailgun:** the **100/day free cap** (same math as Resend); on Basic $15, the 10k/mo pool — then every extra 1k costs $1.80, the priciest overage of the three.

---

## 5. Cost traps for AI-agent-built apps

- **Retry/send loops:** SendGrid mail/send accepts up to **10,000 requests/second** (https://www.twilio.com/docs/sendgrid/for-developers/sending-email/v3-mail-send-faq) with overage auto-billed in arrears — a runaway loop on Essentials could historically rack up unbounded $1.30/1k charges; the new 10x cap (see §6) bounds it at ~9x plan price/month. Resend's 5–10 req/s team rate limit naturally throttles loops; overage still auto-charges the card up to 5x quota. Mailgun bills overage automatically unless you set the (off-by-default) custom message limit.
- **Suppression consumes money anyway:** SendGrid counts Dropped (suppressed) requests as credits — a loop hammering suppressed addresses still burns quota (https://support.sendgrid.com/hc/en-us/articles/35466138799899). All three auto-suppress hard bounces/complaints/unsubscribes by default (Mailgun: https://help.mailgun.com/hc/en-us/articles/360012287493; this is deliverability protection, not spend protection).
- **Reputation kill-switch:** Resend pauses sending if bounce rate ≥4% or spam rate ≥0.08% — an agent looping on fake/test addresses bricks the account (https://resend.com/docs/knowledge-base/account-quotas-and-limits).
- **Leaked keys:** all three use bearer API keys; a leaked SendGrid key on a Pro plan is a spammer's dream (overage in arrears). Mailgun free limits blast radius to 100/day; Resend to 100/day (free) or 5x quota (paid).
- **Contact-import loops:** SendGrid MC and Resend Marketing bill per stored contact — an agent that re-imports/duplicates contacts inflates a monthly recurring meter, not a one-time one.
- **Defaults:** Mailgun's custom message limit is NOT set by default; SendGrid has no cap by default (only the new 10x ceiling); Resend's 5x-quota cap IS on by default.

---

## 6. Spend caps

- **Resend: HARD CAP ON BY DEFAULT.** Paid overage stops at **5x monthly quota**, then sending pauses until next cycle (adjustable via support). Alerts at 80%/100% of quota. Free plan: hard stop, no overage. (https://resend.com/changelog/pay-as-you-go-pricing)
- **SendGrid: no user-configurable spend cap; alerts only** (`usage_limit` alert at custom %, https://www.twilio.com/docs/sendgrid/ui/account-and-settings/alerts). NEW as of **March 26, 2026**: automatic sending ceiling of **10x plan allotment** on Email API Essentials/Pro (e.g., Essentials 50k hard-stops at 500k requests/mo); reseller accounts capped at 2.5x. Not user-adjustable downward. (https://support.sendgrid.com/hc/en-us/articles/35466138799899)
- **Mailgun: hard cap available but OFF by default.** "Custom message limit" (Settings, or API `PUT /v5/accounts/limit/custom/monthly`) disables the whole account when the monthly message count is hit; alerts to owner at 50%/75%; auto re-enables next calendar month or via `PUT /v5/accounts/limit/custom/enable`. Message-count based, not dollar based. (https://help.mailgun.com/hc/en-us/articles/4402611589915, https://documentation.mailgun.com/docs/mailgun/api-reference/send/mailgun/custom-message-limit)

---

## 7. How to check usage/spend

- **Resend:** dashboard https://resend.com/settings/usage (quota, rate limit, billing history). No public usage API or official CLI.
- **SendGrid:** dashboard https://app.sendgrid.com/statistics ; alerts at https://app.sendgrid.com/settings/alerts ; API `curl -H "Authorization: Bearer $SENDGRID_API_KEY" https://api.sendgrid.com/v3/stats?start_date=2026-07-01` (Requests column = credits burned); plan under Account Settings > Account Details > Your Products.
- **Mailgun:** dashboard https://app.mailgun.com/ (Dashboard > usage; Settings for message limit); API `curl -s --user "api:$MAILGUN_API_KEY" "https://api.mailgun.net/v3/<domain>/stats/total?event=accepted"` ; current cap: `GET https://api.mailgun.net/v5/accounts/limit/custom/monthly`.

---

## 8. Shell-detection keywords

No vendor ships an official first-party CLI; detect via SDKs/endpoints/env vars:
- Packages: `resend`, `@sendgrid/mail`, `@sendgrid/client`, `sendgrid` (pip/gem), `mailgun.js`, `mailgun-js`, `mailgun-ruby`, `flask-mailgun`
- Endpoints in code/curl: `api.resend.com/emails`, `api.sendgrid.com/v3/mail/send`, `api.mailgun.net/v3`, `api.eu.mailgun.net`
- SMTP hosts: `smtp.resend.com`, `smtp.sendgrid.net`, `smtp.mailgun.org`
- Env vars/key prefixes: `RESEND_API_KEY` (keys start `re_`), `SENDGRID_API_KEY` (keys start `SG.`), `MAILGUN_API_KEY` / `MAILGUN_DOMAIN` (basic auth user `api:`)

---

**Primary sources:** https://resend.com/pricing · https://resend.com/docs/knowledge-base/account-quotas-and-limits · https://resend.com/changelog/pay-as-you-go-pricing · https://resend.com/docs/api-reference/introduction · https://www.twilio.com/en-us/products/email-api/pricing · https://www.twilio.com/en-us/products/marketing-campaigns/pricing · https://www.twilio.com/en-us/changelog/sendgrid-free-plan · https://support.sendgrid.com/hc/en-us/articles/35270136965403 · https://support.sendgrid.com/hc/en-us/articles/35466138799899 · https://support.sendgrid.com/hc/en-us/articles/40779261694875 · https://www.twilio.com/docs/sendgrid/for-developers/sending-email/v3-mail-send-faq · https://www.twilio.com/docs/sendgrid/ui/account-and-settings/alerts · https://www.mailgun.com/pricing/ · https://help.mailgun.com/hc/en-us/articles/4402611589915 · https://documentation.mailgun.com/docs/mailgun/api-reference/send/mailgun/custom-message-limit · https://help.mailgun.com/hc/en-us/articles/360012287493

## Engine B — grok (raw)

/Users/aaronpang/.zshenv:.:19: no such file or directory: /tmp/codex-cargo/env
I'll verify current Resend, SendGrid, and Mailgun pricing on official pages and assemble a July 2026 factsheet covering free tiers, overages, contact storage, IPs, and agent send-loop risks.# Email API Pricing & Quota Factsheet  
**Service group: Resend · SendGrid · Mailgun**  
**As of: July 2026** (verified against official pricing/docs; recent changes dated)

---

## Headline: SendGrid free tier status (your 2025 question)

**Yes — permanent free was killed in 2025.**

| Date | What happened | Source |
|------|----------------|--------|
| **Mar 25, 2025** | New signups get a **60-day timed trial** (not perpetual free) | [Trial Account Plan](https://support.sendgrid.com/hc/en-us/articles/35270136965403-Twilio-SendGrid-Trial-Account-Plan) |
| **May 27, 2025** | Twilio announces retirement of Free Email API + Free Marketing Campaigns; **60-day transition** | [Changelog](https://www.twilio.com/en-us/changelog/sendgrid-free-plan) |
| **~Jul 26, 2025** | Transition ends; free accounts that didn’t upgrade: **sending paused**; marketing contacts **>100 deleted** | Changelog + contemporary reports |

**Current free offering (July 2026):**  
**60-day free trial only** — **100 emails/day** (Email API) via web API or SMTP; **no permanent free tier**. After trial: must pick a paid plan or send stops.

Pricing-page FAQ still mentions older “free SMTP / free marketing” wording in places — treat the **changelog + trial article** as authoritative over marketing FAQ copy.

---

# 1. Resend

**Official:** [resend.com/pricing](https://resend.com/pricing) · [Pricing KB](https://resend.com/docs/knowledge-base/what-is-resend-pricing) · [Quotas & limits](https://resend.com/docs/knowledge-base/account-quotas-and-limits)

### 1) Metered billing dimensions
| Dimension | How billed |
|-----------|------------|
| **Transactional emails** | Sent **and received** (inbound) both count; multi-recipient To/CC/BCC = multiple emails |
| **Marketing contacts** | Contact count (not send volume); unlimited emails to those contacts |
| **Automation runs** | PAYG after included runs on paid plans |
| **AI credits** | Monthly pool for AI features |
| **Dedicated IP** | Flat add-on ($/mo) |

### 2) Free tier — exact quotas
| Quota | Number |
|-------|--------|
| Transactional emails | **3,000 / month** |
| Daily hard cap | **100 / day** |
| Marketing contacts | **1,000 / month** (unlimited emails to them) |
| Automation runs | **10,000 / month** (no overage on Free) |
| Domains | **1** |
| Data retention | **30 days** |
| AI credits | **5 / mo** |
| Overage | **Not available** — Free stops at quota |

Permanent free (not a timed trial). Introduced expanded free tier **Jun 12, 2023** (3k/mo, 100/day).

### 3) Paid plans

**Transactional**

| Plan | Price | Included | Overage / 1,000 emails |
|------|-------|----------|------------------------|
| Free | $0 | 3,000 | — |
| Pro | **$20/mo** | 50,000 | **$0.90** |
| Pro | **$35/mo** | 100,000 | **$0.90** |
| Scale | **$90/mo** | 100,000 | **$0.90** |
| Scale | **$160/mo** | 200,000 | **$0.80** |
| Scale | **$350/mo** | 500,000 | **$0.70** |
| Scale | **$650/mo** | 1,000,000 | **$0.65** |
| Scale | **$825/mo** | 1,500,000 | **$0.52** |
| Scale | **$1,150/mo** | 2,500,000 | **$0.46** |
| Enterprise | Custom | Custom | Custom |

Paid plans: **no daily sending limit**. Scale vs Pro at 100k: Scale unlocks Slack support, more domains (1,000), dedicated IP add-on.

**Marketing (contact-based)**

| Plan | Price | Contacts |
|------|-------|----------|
| Free | $0 | 1,000 |
| Pro Marketing | $40–$650/mo | 5k → 150k contacts |
| Enterprise | Custom | Custom |

**Automations:** all plans include **10,000 runs/mo**; paid overage **$0.0015 / run**.

**Dedicated IP:** **$30/mo** on Scale; requires **>3,000 emails/day**; includes auto-warmup/monitoring/autoscaling.

### 4) What an indie app blows first
| Wall | When it hits |
|------|----------------|
| **#1 Free: daily 100/day** | ~1 password-reset loop, agent spam, or signup burst in hours — long before 3k/mo |
| **#2 Free: 3k/mo** | ~100/day sustained (~30 days) |
| **#3 Rate limit** | **10 req/s per team** (all keys share pool) → `429` |
| **#4 Reputation pause** | Bounce **≥4%** or spam **≥0.08%** → sending may pause |
| **Paid overage bill** | Monthly emails past plan; e.g. Pro 50k + 10k overage ≈ **$9** at $0.90/1k |

### 5) AI-agent cost traps
- Agent **retry loops** on failed sends (each attempt + each recipient counts).
- **Inbound** email counting toward same quota (webhooks/forward loops).
- Batch of multi-recipient emails inflates quota (To+CC+BCC each count).
- Free = hard stop; paid = **fail-open until 5× quota**.
- Leaked `RESEND_API_KEY` → unlimited send until hard overage or reputation kill.
- Testing with real addresses → bounces → account pause (use Resend test addresses).

### 6) Spend caps
| | |
|--|--|
| Free | Hard stop at daily/monthly quota (no charge) |
| Paid | **Hard cap: overage capped at 5× monthly quota** by default; then **sending paused** until next cycle. Adjust via support |
| Alerts | Usage page; no separate “budget alert product” documented as primary control — the 5× is the hard stop |

### 7) Check usage / spend
| Method | Where |
|--------|--------|
| Dashboard | [resend.com/settings/usage](https://resend.com/settings/usage) · [billing](https://resend.com/settings/billing) · [metrics](https://resend.com/metrics) |
| CLI | `resend` ([docs](https://resend.com/docs/cli)) — `resend whoami`, `resend open`, emails/domains management |
| API | Emails list / dashboard usage (primary is UI usage page) |

### 8) Shell detection keywords
```
resend
resend emails
resend emails send
resend whoami
resend open
resend api-keys
resend domains
RESEND_API_KEY
api.resend.com
```

---

# 2. Twilio SendGrid

**Official:** [Email API pricing](https://www.twilio.com/en-us/products/email-api/pricing) · [Marketing pricing](https://www.twilio.com/en-us/products/marketing-campaigns/pricing) · [Overage rates](https://support.sendgrid.com/hc/en-us/articles/40779261694875-Twilio-SendGrid-Overage-Rates) · [Free plan retirement](https://www.twilio.com/en-us/changelog/sendgrid-free-plan) · [Trial plan](https://support.sendgrid.com/hc/en-us/articles/35270136965403-Twilio-SendGrid-Trial-Account-Plan) · [Dedicated IPs](https://support.sendgrid.com/hc/en-us/articles/9237413560219-Dedicated-IP-Addresses)

### 1) Metered billing dimensions
| Product | Meters |
|---------|--------|
| **Email API** | Emails sent (1 recipient = 1 credit; deferred/spam still count) |
| **Marketing Campaigns** | **Contacts stored** + **emails sent** (separate from API plan) |
| **Dedicated IP** | Included on Pro+; extras $/mo |
| **Email Validation** | Free allotment on Pro/Premier; then usage |
| **Email testing credits** | Pack add-ons |
| **Partner accounts** (Heroku/GCP) | Often **no overages** — hard stop at plan |

Email API and Marketing are **separate purchases** on the same account.

### 2) Free tier — exact status
| | |
|--|--|
| **Permanent free** | **None** (retired **May 27, 2025**, transition ended ~**Jul 26, 2025**) |
| **Trial (new accounts)** | **60 days**, **$0**, **no CC required** |
| Email API trial | **100 emails/day** (web API or SMTP) |
| Marketing trial | **100 emails/day** + **100 contacts** (trial article) |
| After trial | Send **stops** until paid upgrade (`Settings > Account Details > Your Products`) |

### 3) Paid plans

**Email API** (official “starting at” + overage table names):

| Plan | Price (list) | Included volume | Overage **per email** |
|------|--------------|-----------------|------------------------|
| Free Trial | $0 / 60 days | 100/day | Cannot exceed |
| **Essentials 50K** | **$19.95/mo** start | 50,000 | **$0.0013** |
| **Essentials 100K** | ~**$34.95/mo** (widely listed; volume tier on pricing slider) | 100,000 | **$0.0009** |
| **Pro 100K** | **$89.95/mo** start | 100,000 | **$0.0011** |
| Pro 300K | higher tier (slider) | 300,000 | **$0.0009** |
| Pro 700K | higher tier | 700,000 | **$0.0008** |
| Pro 1.5M | higher tier | 1,500,000 | **$0.0006** |
| Pro 2.5M | higher tier | 2,500,000 | **$0.0005** |
| Premier | Custom | Custom | Custom |

**Essentials:** 50k–100k range; **no dedicated IP**.  
**Pro:** starts ~100k; **1 dedicated IP included**, SSO, subusers, 2,500 free validations.  
**Additional dedicated IP: $30/mo** (1 new IP/month via console).

Overage example: Essentials 50K + 15,000 extra ≈ 15,000 × $0.0013 = **~$19.50** next invoice.

**Marketing Campaigns** (starts **Basic $15/mo**, **Advanced $60/mo**):

| Example plan | Contacts | Emails | Overage per extra email **or** contact |
|--------------|----------|--------|----------------------------------------|
| Basic 5K | 5,000 | 15,000 | **$0.0040** |
| Basic 10K | 10,000 | 30,000 | **$0.0030** |
| Basic 50K | 50,000 | 150,000 | **$0.0028** |
| Advanced 10K | 10,000 | 50,000 | **$0.0075** |
| Advanced 100K | 100,000 | 500,000 | **$0.0050** |

Contact storage overages are a **real trap** (import once, bill monthly).

### 4) What an indie app blows first
| Wall | Usage |
|------|--------|
| **#1 Trial clock** | Day 61 without upgrade → **all API/SMTP send dead** |
| **#2 Trial daily 100** | Agent loop / webhook storm same day |
| **#3 Paid: monthly email allotment** | Then **per-email overages fail-open** (unless partner plan) |
| **#4 Marketing: contact count** | CSV import of 10k users on Basic 5K → contact overages every month |
| **#5 API rate limits** | Per-endpoint; **429**; general v3 often **~600 req/min**; mail/send much higher; Validation ~**7/s**; Activity API tightened to **6/min** (Dec 9, 2025 changelog) |

### 5) AI-agent cost traps
- **Leaked `SENDGRID_API_KEY`** on paid plan → uncapped overages until you notice next month’s invoice.
- Agent **retry without backoff** → burn monthly quota + overages + 429s.
- Marketing + API dual billing if both wired.
- **Suppression lists** (bounces/blocks/spam/unsubscribes) — re-sending suppressed addresses still wastes attempts and hurts reputation; agent “retry forever” is worst case.
- Partner free tiers (GCP/Heroku legacy) may have been forced into conversion earlier in 2025.

### 6) Spend caps
| | |
|--|--|
| Trial / free end state | **Hard stop** (no send) |
| Paid direct accounts | **No hard $ spend cap** documented — overages **bill next month** (fail-open) |
| Partner accounts | Often **no overages** = hard quota stop |
| Alerts | Dashboard/billing; not a default hard kill-switch for overages |

### 7) Check usage / spend
| Method | Where |
|--------|--------|
| Dashboard | [app.sendgrid.com](https://app.sendgrid.com) → Stats, Activity, **Settings → Billing** / Plan & Billing |
| Upgrade path | Settings → Account Details → **Your Products** |
| API | Stats / Email Activity APIs (rate-limited) |
| CLI | Twilio CLI: `twilio email:send`, `twilio email:set` ([docs](https://www.twilio.com/docs/twilio-cli/examples/send-email-sendgrid)) |

### 8) Shell detection keywords
```
twilio email:send
twilio email:set
sendgrid
SENDGRID_API_KEY
api.sendgrid.com
app.sendgrid.com
```

---

# 3. Mailgun (Sinch)

**Official:** [mailgun.com/pricing](https://www.mailgun.com/pricing/) · [Free plan details](https://help.mailgun.com/hc/en-us/articles/203068914-What-does-the-Free-plan-offer)

### 1) Metered billing dimensions
| Dimension | Notes |
|-----------|--------|
| **Messages sent** | Primary meter on Free (daily) and paid (monthly) |
| **Email validations** | Separate; included on Scale (5,000); else add-on / overage |
| **Dedicated IP** | Included at Scale 100k+; add-on **$59/IP/mo** |
| **Log / message retention** | Plan-gated (1 day Free/Basic → 30 days Scale) |
| **Optimize / Inspect** | Separate product pricing |

Contact-list storage is **not** the primary Send-style marketing meter on core Send plans (unlike SendGrid Marketing / Resend Marketing).

### 2) Free tier — exact quotas
| Item | Free plan |
|------|-----------|
| Price | **$0/mo**, **no credit card** |
| Send volume | **100 emails/day** (hard) |
| Domains | **1** custom sending domain |
| API keys | **2** |
| Log retention | **1 day** |
| Inbound routes | **1** |
| Users | **1** per account |
| Overage | **N/A** — daily hard stop |

≈ **~3,000 emails/month** if you max every day; cannot bank unused days. Permanent free (as of July 2026 official pricing).

### 3) Paid plans (Mailgun Send)

| Plan | Price | Included | Extra emails | Validations overage |
|------|-------|----------|--------------|---------------------|
| Free | $0 | 100/day | — | — |
| **Basic** | **from $15/mo** | **10,000/mo** | **from $1.80 / 1,000** | **from $1.20 / 100** |
| **Foundation** | **$35/mo** (1 mo free trial) | **50,000/mo** | **from $1.30 / 1,000** | **from $1.20 / 100** |
| **Scale** | **$90/mo** (1 mo free trial) | **100,000/mo** | **from $1.10 / 1,000** | **from $0.80 / 100** (+ **5,000** included) |
| Enterprise | Custom | Custom | Custom | Custom |

**Dedicated IP:**  
- Access from **~50k** volumes; **1 included** on Scale **100k+**  
- **Extra IPs: $59 / IP / month** (control panel or support)

Paid plans: **no daily email limit** (monthly quota + overage options).

### 4) What an indie app blows first
| Wall | Usage |
|------|--------|
| **#1 Free: 100/day** | Same as Resend free daily wall |
| **#2 New-account / probation hourly limit** | Often **~100 messages/hour** until **Business Verification** (not the free daily plan — compliance gate) |
| **#3 Paid: monthly included emails** | Then overage **fail-open** at plan’s $/1k |
| **#4 Validation spend** | Agent bulk-validating lists without budget |

### 5) AI-agent cost traps
- Free daily wall = “works in tests, dies in prod loops.”
- Paid overages **from $1.10–$1.80 per 1,000** — cheaper per email than some peers at scale but **uncapped** without monitoring.
- **Suppression** (bounces/complaints/unsubscribes) — agents re-sending suppressed addresses waste quota and worsen probation risk.
- **Leaked Mailgun private API key + domain** → full account send.
- Short log retention on cheap plans → harder to debug agent loops after the fact (1-day logs on Free/Basic).

### 6) Spend caps
| | |
|--|--|
| Free | **Hard daily stop** at 100 |
| Paid | **Fail-open overages** (continue sending, bill extra) — **no universal hard $ cap** documented on pricing |
| Alerts | Historical: email notices at **~75% / 95%** of limits on limited plans; not a kill switch |

### 7) Check usage / spend
| Method | Where |
|--------|--------|
| Dashboard | [app.mailgun.com](https://app.mailgun.com) Control Panel → Sending / Analytics / Billing |
| API | Metrics / Stats APIs (`/v1/analytics/...`, domain stats); rate-limit headers on responses |
| Docs | [documentation.mailgun.com](https://documentation.mailgun.com/) |

### 8) Shell detection keywords
```
mailgun
MAILGUN_API_KEY
MAILGUN_DOMAIN
api.mailgun.net
api.eu.mailgun.net
curl.*mailgun
mg send
```

---

# Cross-service comparison (indie / agent lens)

| | **Resend** | **SendGrid** | **Mailgun** |
|--|------------|--------------|-------------|
| **Permanent free** | **Yes** — 3k/mo + **100/day** | **No** (killed 2025) | **Yes** — **100/day** |
| **Trial free** | N/A (forever free tier) | **60 days × 100/day** | Free plan itself |
| **Cheapest paid entry** | **$20**/50k | **$19.95**/50k | **$15**/10k |
| **Overage unit** | **$/1,000** ($0.46–$0.90) | **$/email** ($0.0005–$0.0013) | **$/1,000** (from $1.10–$1.80) |
| **Contact storage billing** | Marketing track only | **Yes** on Marketing (major trap) | Not primary on Send plans |
| **Dedicated IP** | **$30/mo** (Scale, >3k/day) | **Included Pro+**; extra **$30/mo** | **$59/mo** extra; 1 included Scale 100k+ |
| **Default rate limit** | **10 req/s / team** | Per-endpoint (mail/send high; others tighter) | Headers + plan/IP/probation |
| **Hard spend stop** | Paid: **5× quota** then pause | Trial hard stop; paid overages open | Free daily hard; paid open |
| **Agent loop risk** | High on paid until 5× | **Highest $** if key leaks | High on paid overages |

### Effective cost at common volumes (transactional only, list prices)

| Volume / mo | Resend | SendGrid | Mailgun |
|-------------|--------|----------|---------|
| ≤3k | **$0** (if ≤100/day) | **$0 only during 60-day trial** else paid min | **$0** (if ≤100/day) |
| 10k | **$20** (Pro 50k) | **$19.95** (Essentials 50k) | **$15** (Basic) |
| 50k | **$20** | **$19.95** | **$35** (Foundation) |
| 100k | **$35** Pro or **$90** Scale | **~$34.95** Ess. or **$89.95** Pro (+IP) | **$90** Scale (+IP) |

---

# Agent send-loop risk (all three)

| Risk | Mechanism | Mitigation |
|------|-----------|------------|
| **Infinite retry** | 5xx/timeout → agent resends without idempotency | Idempotent keys, max retries, dead-letter |
| **Rate limits** | Resend 10 rps; SendGrid 429; Mailgun hourly probation | Backoff on 429; batch APIs (Resend batch ≤100) |
| **Suppression defaults** | Bounces/complaints auto-suppressed; agent ignores | Check suppressions before send; stop on hard bounce |
| **Reputation kill** | Resend bounce/spam thresholds; all ESPs pause/probate | Never send to fake/generated addresses in prod |
| **Leaked keys** | Fail-open paid billing | Key rotation, least privilege, spend alerts, Resend 5× cap |
| **Daily free walls** | Resend/Mailgun 100/day; SendGrid trial 100/day | Circuit breaker in app; not just ESP limits |

---

# Sources (numbers above)

| Topic | URL |
|-------|-----|
| Resend pricing | https://resend.com/pricing |
| Resend pricing KB | https://resend.com/docs/knowledge-base/what-is-resend-pricing |
| Resend quotas / 5× cap / rate limits | https://resend.com/docs/knowledge-base/account-quotas-and-limits |
| Resend free tier history | https://resend.com/blog/new-free-tier |
| SendGrid Email API pricing + overages | https://www.twilio.com/en-us/products/email-api/pricing |
| SendGrid Marketing pricing + contact overages | https://www.twilio.com/en-us/products/marketing-campaigns/pricing |
| SendGrid free plan retirement (May 27, 2025) | https://www.twilio.com/en-us/changelog/sendgrid-free-plan |
| SendGrid 60-day trial | https://support.sendgrid.com/hc/en-us/articles/35270136965403-Twilio-SendGrid-Trial-Account-Plan |
| SendGrid overage article | https://support.sendgrid.com/hc/en-us/articles/40779261694875-Twilio-SendGrid-Overage-Rates |
| SendGrid dedicated IP $30 | https://support.sendgrid.com/hc/en-us/articles/9237413560219-Dedicated-IP-Addresses |
| SendGrid rate-limit headers | https://www.twilio.com/docs/sendgrid/api-reference/how-to-use-the-sendgrid-v3-api/rate-limits |
| Mailgun pricing | https://www.mailgun.com/pricing/ |
| Mailgun free plan | https://help.mailgun.com/hc/en-us/articles/203068914-What-does-the-Free-plan-offer |

---

### Bottom line for AI-built indie apps

1. **SendGrid is no longer free** after mid-2025 — only a **60-day × 100/day trial**, then **$19.95+**.  
2. **Resend and Mailgun still offer real free tiers**; both hard-stop at **100 emails/day** first.  
3. **First wall for agents:** daily 100 (Resend free / Mailgun free / SendGrid trial) or **SendGrid trial expiry**, not monthly volume.  
4. **First $ wall on paid:** monthly email overages (all three fail-open except **Resend’s 5× hard pause**).  
5. **Contact-storage trap:** SendGrid Marketing (and Resend Marketing) — not Mailgun Send.  
6. **Dedicated IP:** Resend **$30**, SendGrid **$30** extra / included on Pro, Mailgun **$59**.
