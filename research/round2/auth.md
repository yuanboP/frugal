# Research archive (round 2): auth

Raw dual-engine research (2026-07-17). Engine A = Claude web search; Engine B = grok CLI. Merged factsheet cross-checks both.

## Merged factsheet

```json
{
  "provider": "Clerk + Auth0 (Okta CIC) + Firebase Auth / GCP Identity Platform (verified 2026-07-17)",
  "billing_dimensions": [
    "Clerk: MRU (Monthly Retained Users — only users active >24h after signup; 'First Day Free')",
    "Clerk: MRO (Monthly Retained Organizations)",
    "Clerk: SMS per message; Enterprise Connections per-connection/mo; satellite domains $10/mo; machine-auth (API-key/M2M creations+verifications); Clerk Billing 0.7% of volume",
    "Auth0: MAU (any active event in calendar month — one-shot bot signups count)",
    "Auth0: M2M tokens/mo; Organizations count-gated; Enterprise Connections count-gated; SMS NOT sold by Auth0 (BYO Twilio, bills on Twilio)",
    "Firebase: Tier-1 MAU (email/social/anon/phone); Tier-2 MAU (SAML/OIDC, separate meter); SMS per message, country-priced"
  ],
  "free_tier": "Clerk Hobby $0: 50,000 MRU/app (raised from 10K on 2026-02-05), 100 MRO/app, 20 members/org, 3 seats, no MFA/SMS, API keys 1,000 creations + 100K verifications/mo, M2M 2,500 creations + 100K verifications/mo, 1-day logs. Auth0 Free $0: 25,000 MAU, 5 organizations, 1 Enterprise Connection (new Feb 2026) + Self-Service SSO/SCIM, 1,000 M2M tokens/mo, 3 admins, no Pro MFA. Firebase Spark $0: 50,000 Tier-1 MAU, 50 SAML/OIDC MAU, phone auth NOT available (Blaze required); email quotas ~150 password-reset/day. On Blaze: first 10 SMS/day not billed (official Identity Platform wording).",
  "plans": [
    {
      "name": "Clerk Pro",
      "price": "$25/mo ($20/mo annual)",
      "included": "50K MRU, MFA, SMS auth available, 1 Enterprise Connection, 100 MRO, 7-day logs",
      "overage": "MRU $0.02 (50K–100K) → $0.018 → $0.015 → $0.012; MRO $1 (101–1K) → $0.90 → $0.75 → $0.60/org/mo; SMS $0.01 US/CA (intl market rate); EC $75/mo (2–15) → $60 → $30 → $15 (500+)"
    },
    {
      "name": "Clerk Business",
      "price": "$300/mo ($250/mo annual)",
      "included": "Pro + 10 seats (extra $20/mo), SOC 2, 30-day logs",
      "overage": "same meters as Pro; add-ons: B2B Auth $100/mo ($85 annual), Administration $100/mo, Billing 0.7% of volume"
    },
    {
      "name": "Auth0 B2C Essentials / Professional",
      "price": "$35/mo / $240/mo (at 500 MAU)",
      "included": "Essentials: Pro MFA, 10 orgs, higher API limits; Professional: Enterprise MFA, 5,000 M2M tokens",
      "overage": "NO per-MAU overage — 'If usage falls between tiers, you are billed at the next tier up' (buy bigger MAU tier); 3 consecutive months over can auto-upgrade"
    },
    {
      "name": "Auth0 B2B Essentials / Professional",
      "price": "$150/mo / $800/mo (at 500 MAU)",
      "included": "B2B org/SSO features; Professional ~5 ECs then ~$100/mo each",
      "overage": "tier-purchase model, same as B2C; SMS costs land on your Twilio bill, not Auth0's"
    },
    {
      "name": "Firebase Blaze (Identity Platform, pay-as-you-go)",
      "price": "$0 base",
      "included": "50K Tier-1 MAU free, 50 Tier-2 MAU free, first 10 SMS/day free, 99.95% SLA, MFA, multi-tenancy",
      "overage": "Tier-1 MAU $0.0055 (50K–100K) → $0.0046 → $0.0032 → $0.0025; Tier-2 $0.015/MAU; SMS per message after 10/day: US $0.01, GB $0.05, DE $0.10, IN $0.07, ID $0.35, all-other-regions $0.46"
    }
  ],
  "first_quota_blown": "Firebase: phone-auth SMS — bills after just 10 free SMS/day (hours-to-days with OTP login on; MAU free to 50K is nearly unreachable). Auth0: 5-org wall (multi-tenant), 1,000 M2M tokens/mo (agent backends), then the 25K-MAU cliff to a paid tier (bots count as MAU). Clerk: 100 MRO / 20 members-per-org for B2B (org #101 = $1/org/mo), or the MFA/SMS feature gate forcing Pro; pure B2C rarely hits 50K MRU since drive-by bot signups don't count.",
  "spend_cap": "Clerk: no dollar cap; Hobby has hard product limits (soft cap, no card) with ~1-month grace; on Pro all overage bills automatically, no spend-limit setting. Auth0: Free is quota-enforced (no overage billing, warnings then pressure to upgrade); paid self-serve has no hard cap and can auto-upgrade after 3 consecutive months over purchased MAU. Firebase: Spark = true hard cap (features stop); Blaze has NO cap — GCP budgets are ALERTS ONLY by default; kill-switch requires DIY budget Pub/Sub → Cloud Function that disables billing.",
  "traps": [
    "Bot-signup MAU inflation: Auth0 and Firebase bill any in-month signup as 1 MAU (Firebase even anonymous auth via signInAnonymously loops); Clerk's MRU is immune to one-shot bots — but Clerk SMS phone verification during bot signups still bills $0.01+ each",
    "SMS pumping fraud: scripted phone-OTP signups with premium-rate numbers — Firebase bills per SMS (up to $0.46 intl, incl. failed regions), Clerk bills per SMS, Auth0 drains your separate Twilio account (SMS invisible in Auth0 billing; Auth0 caps 10 SMS/user/hr)",
    "Agent scaffolds default-enabling phone/SMS auth and org auto-creation — both are the paid meters (Firebase SMS from message #11/day; Clerk $1/org after 100; Auth0 6th org needs paid)",
    "Auth0 pricing cliff: free 25K MAU but paid Essentials starts at 500 MAU/$35 — crossing free means buying a MAU tier, not paying cents of overage; agent CI runs creating users inflate MAU (no cleanup = billed)",
    "Agent loops: Auth0 client-credentials retries chew 1,000 free M2M tokens/mo; Clerk Hobby hard-caps API-key creations (1,000/mo) and verifications (100K/mo)",
    "Leaked keys: Firebase web API keys are public by design — exposed key + phone auth + no App Check = SMS bill attack; leaked Clerk sk_live_ / Auth0 Management tokens allow mass user creation",
    "Clerk Billing add-on takes 0.7% of payment volume on top of Stripe 2.9%+$0.30 — easy to miss when scaffolding payments",
    "Clerk enterprise SSO is metered per connection ($75/mo each at 2–15) since Feb 2026 — 3 SAML customers ≈ $150/mo over base"
  ],
  "usage_check": "Clerk: https://dashboard.clerk.com/billing (Usage/Billing tabs; CLI has no usage metrics — `clerk open`). Auth0: https://support.auth0.com/reports/quota and /reports/usage; Management API GET /api/v2/stats/active-users; CLI `auth0 api get stats/active-users` (no billing subcommand). Firebase: https://console.firebase.google.com/project/_/usage and Authentication → Usage (Sent/Verified/Blocked SMS in Metrics Explorer); billing at console.cloud.google.com/billing filtered to Identity Platform; `gcloud billing accounts list`, `gcloud billing budgets list --billing-account=X`, `firebase projects:list`.",
  "keywords": [
    "clerk",
    "CLERK_SECRET_KEY",
    "sk_live_",
    "pk_live_",
    "npx @clerk/upgrade",
    "clerk open",
    "auth0",
    "auth0 login",
    "auth0 tenants list",
    "auth0 api get stats/active-users",
    "auth0 apps list",
    "auth0 orgs",
    "firebase",
    "firebase projects:list",
    "firebase auth:export",
    "signInWithPhoneNumber",
    "signInAnonymously",
    "gcloud billing budgets list",
    "gcloud services list",
    "identitytoolkit.googleapis.com",
    "GOOGLE_APPLICATION_CREDENTIALS"
  ],
  "hint": "Free: Clerk 50K MRU (bots free, orgs $1 ea >100), Auth0 25K MAU (bots count; >free = buy tier, no cents-overage), Firebase 50K MAU but SMS bills after 10/day free (US $0.01, intl to $0.46). #1 trap: phone-OTP scaffolds = SMS pumping. No hard caps anywhere paid; GCP budgets alert-only.",
  "conflicts": [
    "Firebase free SMS allotment: Report A said 'no free SMS allotment, billed from message #1'; Report B said 'first 10 SMS/day free'. RESOLVED for B — official cloud.google.com/identity-platform/pricing states verbatim 'The first ten SMS that you send per day are not billed' with worked example 1,300 SMS → 300 free + 1,000×$0.01=$10. (firebase.google.com/pricing's terse 'Billed per SMS sent' caused A's error.)",
    "Auth0 overage model: Report A claimed continuous ~$0.07/MAU overage (sourced from third-party ssojet blog); Report B said tier-purchase. RESOLVED for B — official page: 'If usage falls between tiers, you are billed at the next tier up'; no per-MAU overage rate exists.",
    "Auth0 free Enterprise Connections: A said SSO is paid-only; B said 1 EC free since Feb 2026. RESOLVED for B — pricing page shows '1 Enterprise Connection (NEW)' on Free.",
    "Firebase intl SMS ceiling: A said ~$0.06–$0.34; B said up to $0.46. RESOLVED for B — official table: ID $0.35, UZ $0.41, 'All other regions (ZZ)' $0.46.",
    "Auth0 M2M included tokens: A said add-on 'from $30/mo per 7,500'; official page shows Free/Essentials 1,000 and Professional 5,000 included with add-ons available — A's add-on rates unverified, dropped.",
    "Auth0 orgs on paid: A said B2B Essentials 'unlimited orgs', B said Essentials 10 orgs. UNRESOLVED (page toggle-dependent); free tier = 5 orgs confirmed. Minor; re-check B2B toggle before relying on it.",
    "Clerk MRO overage placement: A lists it as a general meter, B places it under the $100/mo B2B add-on; official page lists both the $100/mo B2B add-on and MRO bands ($1→$0.60) — rates confirmed identical either way."
  ],
  "sources": [
    "https://clerk.com/pricing (fetched 2026-07-17: 50K MRU, 100 MRO, Pro $25/Business $300, MRU $0.02→$0.012, MRO $1→$0.60, EC $75→$15, SMS $0.01, B2B add-on $100/mo, machine-auth caps)",
    "https://auth0.com/pricing (fetched 2026-07-17: 25K MAU free, 5 orgs, 1 free EC, B2C $35/$240, B2B $150/$800 at 500 MAU, M2M 1K/5K, next-tier-up billing)",
    "https://cloud.google.com/identity-platform/pricing (fetched 2026-07-17: MAU $0.0055/$0.0046/$0.0032/$0.0025, Tier-2 $0.015, 'first ten SMS per day are not billed', country table US $0.01…ZZ $0.46)",
    "https://firebase.google.com/pricing (fetched 2026-07-17: Spark 50K MAU, 50 SAML/OIDC MAU, phone auth not on Spark)",
    "https://clerk.com/changelog/2026-02-05-new-plans-more-value (Clerk Feb 2026 repricing, per Report A)",
    "https://auth0.com/blog/auth0-b2b-plans-upgraded/ (Auth0 Feb 2026 B2B free-tier upgrade, per Report B)",
    "https://firebase.google.com/docs/projects/billing/avoid-surprise-bills + https://cloud.google.com/billing/docs/how-to/budgets (budgets are alerts-only)",
    "https://firebase.google.com/docs/auth/limits (email/day quotas, per-IP SMS caps)",
    "https://auth0.com/docs/secure/multi-factor-authentication/multi-factor-authentication-factors/configure-sms-voice-notifications-mfa (BYO Twilio, 10 SMS/user/hr)"
  ]
}
```

## Engine A — Claude (raw)

# Auth Providers Pricing/Quota Factsheet — Clerk, Auth0, Firebase Auth
**Current as of 2026-07-17. Verified against official pricing pages and changelogs.**

⚠️ MAJOR RECENT CHANGE: Clerk overhauled pricing on **2026-02-05** (free tier 10K → 50K, MAU → "MRU" metric). Most third-party content and LLM training data is stale for Clerk.

---

## 1. CLERK (clerk.com)

### Metered billing dimensions
- **Monthly Retained Users (MRU)** — NOT MAU. A user counts only if they return/sign in again **more than 24h after signup** ("First Day Free"). Sign-up-and-never-return users are free.
- **Monthly Retained Organizations (MRO)**
- **SMS messages** (phone auth/MFA) — billed per message
- **Enterprise Connections** (SAML/OIDC), per connection per month
- **Satellite domains**, **billing volume %** (Clerk Billing: 0.7% on top of Stripe's 2.9%+$0.30)
- Source: https://clerk.com/pricing , https://clerk.com/changelog/2026-02-05-new-plans-more-value

### Free tier (Hobby, $0)
- **50,000 MRU free** per application (raised from 10,000 on 2026-02-05); unlimited applications
- **100 Monthly Retained Organizations free**
- Up to 3 dashboard seats; 1-day log retention
- Source: https://clerk.com/pricing

### Paid plans
- **Pro: $25/mo** ($20/mo annual). Includes MFA, satellite domains, simultaneous sessions; Enterprise Connections metered (no longer unlimited — apps with 3+ SAML/OIDC connections cost more since Feb 2026).
- **Business: $300/mo** ($250/mo annual). Required for 4+ dashboard seats, SOC 2/HIPAA artifacts.
- **Enterprise: custom.**
- **Overages (MRU):** 50,001–100K: **$0.02/MRU/mo**; 100K–1M: $0.018; 1M–10M: $0.015; 10M+: $0.012
- **Overages (MRO):** 101–1,000 orgs: **$1/org/mo**; 1,001–10K: $0.90; 10K–100K: $0.75; 100K+: $0.60
- **SMS: $0.01/SMS (US/Canada)**, international at market rates — billed by Clerk
- **Enterprise Connections:** $75/mo each (2–15 connections), sliding to $15/mo each at 500+
- **Add-ons:** B2B Authentication $100/mo ($85 annual); Administration (unlimited impersonation) $100/mo; Satellite domains $10/mo each
- Source: https://clerk.com/pricing

### B2B gating
Organizations exist on free tier (100 MRO free) but orgs are their own meter — **$1/org/mo** after 100 is the steepest per-unit price in the stack. SAML/OIDC costs $75/mo/connection on Pro.

---

## 2. AUTH0 (auth0.com — Okta CIC)

### Metered billing dimensions
- **MAU** (any activity in a calendar month counts — including a bot that signs up once)
- **M2M (machine-to-machine) tokens/month**
- **Enterprise SSO connections** (count-gated per plan)
- **Organizations** (count-gated per plan)
- SMS is **NOT metered by Auth0 at all** — see SMS note below
- Source: https://auth0.com/pricing

### Free tier
- **25,000 MAU, $0** (raised from 7,500 in Sept 2024), B2C and B2B identical; no credit card
- 5 organizations, 3 admin/dashboard users, 1,000 M2M tokens/mo
- Source: https://auth0.com/pricing

### Paid plans (self-serve, monthly; annual = 11× monthly)
- **B2C Essentials: from $35/mo** at 500 MAU base (scales with MAU slider up to ~100K)
- **B2C Professional: from $240/mo** at 500 MAU base
- **B2B Essentials: from $150/mo** (unlimited orgs, 3 Enterprise SSO connections included)
- **B2B Professional: from $800/mo** (5 SSO connections included; **+$100/mo per extra connection, max 30**)
- **Enterprise: contact sales**
- M2M add-on: from $30/mo per 7,500 tokens (B2C) / $10/mo per 2,500 (B2B)
- **Overage:** within paid tiers overage bills at approx **$0.07/MAU** (B2C Essentials — rate tripled from $0.023 in late-2023 repricing); Free plan has NO overage billing — exceeding 25K forces a plan upgrade (enforcement is grace-period-ish and poorly documented; repeated excess can trigger auto-upgrade).
- Sources: https://auth0.com/pricing , https://community.auth0.com/t/what-will-be-happened-when-if-exceed-plan-limits/127175 , https://ssojet.com/blog/auth0-pricing-growth-penalty

### SMS/MFA — bills SEPARATELY
- Auth0 does **not sell SMS**. SMS/Voice MFA requires **your own Twilio account** (Account SID + Auth Token configured in Dashboard > Security > Multi-factor Auth). All message costs land on your **Twilio bill** (~$0.0079+/SMS US, worse internationally), invisible in Auth0 billing.
- Built-in abuse limit: max **10 SMS/voice messages per user per hour**; email/authenticator OTP: 5 requests per 5 min.
- Sources: https://auth0.com/docs/secure/multi-factor-authentication/multi-factor-authentication-factors/configure-sms-voice-notifications-mfa , https://auth0.com/blog/enable-mfa-with-twilio-and-auth0/

---

## 3. FIREBASE AUTH / GOOGLE CLOUD IDENTITY PLATFORM

### Metered billing dimensions
- **Tier-1 MAU** (email/password, social, anonymous)
- **Tier-2 MAU** (SAML/OIDC enterprise federation — separate, 273× pricier meter)
- **Phone-auth SMS, per message sent** (region-priced; **charged even for failed deliveries and even inside the 50K free MAU tier**)
- Sources: https://firebase.google.com/pricing , https://cloud.google.com/identity-platform/pricing

### Free tier
- **Spark (no card): 50,000 MAU free** (Tier 1); **50 MAU free for SAML/OIDC**; **phone/SMS auth NOT available on Spark** (Blaze required since the Sept 2024 policy change ended free daily SMS)
- Email quotas (Spark): verification 1,000/day, password reset 150/day, email-link sign-in 5/day
- Source: https://firebase.google.com/pricing , https://firebase.google.com/docs/auth/limits

### Paid (Blaze, pay-as-you-go via Identity Platform)
- Tier 1 MAU: first 50K free, then **$0.0055/MAU** (50K–100K), **$0.0046** (100K–1M), **$0.0032** (1M–10M), **$0.0025** (10M+)
- Tier 2 (SAML/OIDC): first 50 free, then **$0.015/MAU**
- **SMS: per message, region-based ~$0.01 (US) to ~$0.06–$0.34 (intl)**, from the first SMS — no free SMS allotment
- Includes 99.95% SLA, MFA, multi-tenancy at Identity Platform level
- Sources: https://cloud.google.com/identity-platform/pricing , https://firebase.google.com/pricing

---

## 4. What an indie-dev app blows FIRST
- **Firebase:** **phone-auth SMS spend** — it bills from message #1 even at 10 users; a global audience or SMS-pumping bot run hits dollars immediately. MAU meter is essentially unreachable (50K free). Second: Spark's **150 password-reset emails/day** and **5 email-link sign-ins/day**.
- **Auth0:** the **25,000 free-MAU wall** — the cliff from $0 to $35–$240+/mo (B2C) or $150–$800 (B2B) is the single worst step-function; before that, the **1,000 M2M tokens/mo** meter dies first if you use client-credentials flows (every backend service token counts).
- **Clerk:** the **100 free Monthly Retained Organizations** — a B2B app auto-creating an org per signup hits $1/org/mo at org #101 (i.e., 1,000 orgs = ~$900/mo), long before 50K MRU. Also SMS at $0.01 each if phone auth is default-on.

## 5. Cost traps for AI-agent-built apps
- **Bot-signup MAU inflation:** Auth0 counts a bot that signs up once as a full MAU → bots burn the 25K free tier and then bill $0.07/MAU in paid tiers. Firebase counts any authenticated user (even **anonymous auth** — an agent looping `signInAnonymously()` creates users; limit is 100M anonymous accounts, and each active one is a MAU). **Clerk's MRU is the exception:** signup-only bots never re-auth after 24h, so they cost $0 — but Clerk SMS phone verification during bot signups still bills $0.01+ each.
- **SMS pumping fraud (the big one):** attackers script your phone-auth signup with premium-rate numbers. Firebase: billed per SMS incl. failures. Clerk: billed per SMS. Auth0: hits your **Twilio** account (use Twilio Verify Fraud Guard). Agents that scaffold "phone OTP login" by default create this exposure.
- **Leaked keys:** Firebase web API keys are public by design, so an exposed key + phone auth + no App Check = SMS bill attack; leaked Clerk `sk_live_`/Auth0 Management API tokens allow mass user creation. Firebase per-IP caps (50 SMS/min, 500/hr per IP) blunt single-IP abuse only.
- **Agent loops:** retry loops calling Auth0 client-credentials grants chew M2M token quota (1,000/mo free); loops creating Clerk organizations per test run hit the $1/org meter; test scripts creating users at up to 100 accounts/hr/IP on Firebase inflate MAU.
- **Defaults:** scaffolds often enable phone auth + org auto-creation; both are the paid meters.

## 6. Spend caps
- **Clerk: NO hard cap on paid plans** — usage overage bills automatically. Free/Hobby has no card, so it functions as a soft cap (upgrade prompt). No documented spend-limit setting. https://clerk.com/pricing
- **Auth0: effectively capped on Free** (no card, no overage — service pressure/forced upgrade instead); paid self-serve plans bill overage automatically with **no hard cap**; alerts only via dashboard. https://auth0.com/pricing
- **Firebase: Spark plan = true hard cap** (features stop at quota; phone auth unavailable). **Blaze has NO hard cap** — Cloud Billing **budgets are alerts only by default**; a true kill-switch requires wiring a budget Pub/Sub notification to a Cloud Function that disables billing (DIY, off by default). https://firebase.google.com/docs/projects/billing/avoid-surprise-bills , https://cloud.google.com/billing/docs/how-to/budgets

## 7. How to check usage/spend
- **Clerk:** Dashboard → https://dashboard.clerk.com → (app) → **Usage** / **Billing**. No usage CLI. Programmatic proxy: Backend API `GET https://api.clerk.com/v1/users/count` (docs: https://clerk.com/docs/reference/backend-api).
- **Auth0:** Dashboard → https://manage.auth0.com → tenant → **Usage** (Settings). API: Management API `GET /api/v2/stats/active-users` and `GET /api/v2/stats/daily`. CLI: `auth0 api get "stats/active-users"` (auth0-cli: https://github.com/auth0/auth0-cli).
- **Firebase:** Console → https://console.firebase.google.com/project/_/usage and Auth → Usage tab; billing at https://console.cloud.google.com/billing. CLI: `gcloud billing accounts list`, `gcloud billing budgets list --billing-account=X`, `gcloud services list --enabled` (check `identitytoolkit.googleapis.com`); `firebase projects:list`.

## 8. Shell-command detection keywords (CLI names/subcommands)
- **Clerk:** `clerk` (dev CLI, no billing subcommands), `npx @clerk/upgrade`; grep for `CLERK_SECRET_KEY`, `sk_live_`, `pk_live_`
- **Auth0:** `auth0`, `auth0 login`, `auth0 tenants list`, `auth0 api get stats/active-users`, `auth0 apps list`, `auth0 users`
- **Firebase/GCP:** `firebase`, `firebase projects:list`, `firebase apps:list`, `gcloud`, `gcloud billing`, `gcloud billing budgets list`, `gcloud services list`, `gcloud identity-platform` (n/a — use `gcloud alpha identity`), `firebase auth:export`

---

### Source URLs (all numbers)
- https://clerk.com/pricing (Clerk all plans, MRU/MRO/SMS/connection prices)
- https://clerk.com/changelog/2026-02-05-new-plans-more-value (Feb 2026 change: 50K MRU, plan restructure)
- https://auth0.com/pricing (Auth0 free 25K MAU, plan prices, SSO connection $100/mo, M2M tokens)
- https://auth0.com/docs/secure/multi-factor-authentication/multi-factor-authentication-factors/configure-sms-voice-notifications-mfa (BYO-Twilio SMS, 10 SMS/user/hr limit)
- https://firebase.google.com/pricing (50K MAU free, 50 SAML/OIDC MAU, phone auth Blaze-only, per-SMS billing)
- https://firebase.google.com/docs/auth/limits (email/day quotas, SMS rate limits, 100 accounts/hr/IP)
- https://cloud.google.com/identity-platform/pricing (MAU tiers $0.0055→$0.0025, Tier-2 $0.015/MAU, regional SMS rates)
- https://firebase.google.com/docs/projects/billing/avoid-surprise-bills + https://cloud.google.com/billing/docs/how-to/budgets (budgets = alerts only)
- https://community.auth0.com/t/what-will-be-happened-when-if-exceed-plan-limits/127175 (free-plan enforcement behavior)
- Corroboration (non-official, for overage rate history): https://ssojet.com/blog/auth0-pricing-growth-penalty , https://supertokens.com/blog/firebase-pricing

## Engine B — grok (raw)

I'll verify current MAU pricing, free tiers, and org/B2B gating from each provider's official pages, then assemble a July 2026 factsheet.Fetching official pricing pages now to pin exact free quotas, overage rates, and add-ons.Pulling Auth0 paid MAU tiers, SMS add-on costs, and spend-cap / usage-check docs next.# Auth pricing/quota factsheet — July 2026  
**Service group:** Clerk · Auth0 · Firebase Authentication (Identity Platform)  
**Focus:** MAU/MRU meters · free quotas · overages · MFA/SMS · org/B2B gates · bot-signup inflation

Verified from official pricing/docs on **2026-07-17**. Secondary sources used only where noted.

---

## Recent pricing changes (with dates)

| When | What | Source |
|------|------|--------|
| **~Feb 2026** | **Clerk:** free allowance raised to **50,000 MRU/app** (from 10k); unlimited apps on all plans | [clerk.com/pricing](https://clerk.com/pricing), industry writeups of the Feb 2026 update |
| **2026-02-12** | **Auth0 B2B free/self-serve:** Free plan gains **1 Enterprise Connection**, **Self-Service SSO**, **SCIM**; Essentials gains a-la-carte EC / Enterprise MFA / M2M | [auth0.com/blog/auth0-b2b-plans-upgraded](https://auth0.com/blog/auth0-b2b-plans-upgraded/) |
| **2024-09 era** | **Auth0 Free** raised to **25,000 MAUs** (was 7.5k after Nov 2023 change) | Current [auth0.com/pricing](https://auth0.com/pricing); older change log [auth0.com/blog/upcoming-pricing-changes…](https://auth0.com/blog/upcoming-pricing-changes-for-the-customer-identity-cloud/) |
| **Ongoing** | **Firebase Auth** meters via **Google Cloud Identity Platform**; SMS is always per-message; Tier-1 MAU free to 50k | [firebase.google.com/pricing](https://firebase.google.com/pricing), [cloud.google.com/identity-platform/pricing](https://cloud.google.com/identity-platform/pricing) |

---

## Side-by-side snapshot

| Dimension | **Clerk** | **Auth0** | **Firebase Auth / Identity Platform** |
|-----------|-----------|-----------|----------------------------------------|
| Primary meter | **MRU** (Monthly Retained Users), not raw MAU | **MAU** (Monthly Active Users) | **MAU** (any sign-in in calendar month) |
| Free users | **50,000 MRU / app** | **25,000 MAU** | **50,000 MAU** (Tier 1: email/phone/anon/social) |
| Free orgs | **100 MRO / app**, max **20 members/org** | **5 Organizations** | N/A (no built-in multi-tenant org product) |
| Paid base | Pro **$25/mo** or **$20/mo annual**; Business **$300/mo** or **$250/mo annual** | Essentials **$35/mo** (from 500 MAU); Professional **$240/mo** (from 500 MAU on current page); Enterprise custom | **Blaze** pay-as-you-go (no auth-only plan fee) |
| User overage | Volume-priced **$0.02 → $0.012 / MRU / mo** after 50k | **Purchase next MAU tier** (not continuous overage); Free hard quota | Tiered **$0.0055 → $0.0025 / MAU** after 50k |
| MFA | Pro+ feature (TOTP/SMS/backup); **SMS billed per SMS** | Free: no Pro MFA; Essentials+: Pro MFA; Enterprise MFA / SMS factors plan-gated; **SMS via carrier/Twilio separately** | MFA SMS = **per SMS** same table as phone auth |
| SMS | US/CA **$0.01/SMS** + intl market rate (Pro+) | Not included in Auth0 price; use Marketplace/Twilio | US **$0.01/SMS**; first **10 SMS/day free**; country table |
| Hard spend cap? | No dollar cap; **plan/feature hard limits** + 1-month grace on MRU/MRO | Free: **quota + warnings**, risk of disruption; paid: auto-upgrade after **3 consecutive months** over | **No hard spend cap**; budget **alerts only** (optional kill-switch DIY) |

---

# 1. Clerk

**Official:** [https://clerk.com/pricing](https://clerk.com/pricing) · Billing: [https://dashboard.clerk.com/billing](https://dashboard.clerk.com/billing)

### 1) Metered billing dimensions
- **MRU** — Monthly Retained User: visits in a month **≥24h after signup** ("First Day Free"). One-time signups that never return **do not** bill.
- **MRO** — Monthly Retained Organization: org with **≥2 members** and **≥1 retained user** (FAQ wording varies slightly; pricing table defines retained-org rules).
- **SMS** — per message (Pro+)
- **Enterprise connections** — per connection after included 1
- **Satellite domains** — $10/mo each
- **Machine auth** — API key / M2M token creations & verifications
- **Dashboard seats** (Business+)
- **Clerk Billing** product fee: **0.7% of billing volume** (+ Stripe's fees) — separate from auth

### 2) Free tier (Hobby) — exact quotas
| Item | Quota |
|------|-------|
| Price | **$0** (no card required) |
| MRU | **50,000 / app** (hard limit; upgrade required past this) |
| Applications | **Unlimited** |
| Dashboard seats | **3** |
| Social connections | **Up to 3** |
| Organizations | **100 MRO / app**, **20 members / org**, Admin+Member roles, invitations |
| Impersonations | **5 / month** |
| Session lifetime | **Fixed 7 days** |
| Logs | **1 day** retention |
| API Keys | **1,000 creations** & **100,000 verifications / mo** (hard cap on Hobby) |
| M2M Tokens | **2,500 creations** & **100,000 verifications / mo** |
| MFA / SMS auth / passkeys / remove branding | **Not included** |

### 3) Paid plans

**Pro** — **$25/mo** monthly or **$20/mo** billed annually  
Included: Hobby + **50k MRU**, remove branding, **MFA**, passkeys, custom session, allowlist/blocklist, user ban, SMS auth *available*, **1 Enterprise connection**, logs 7d  

**MRU overage (Pro & Business):**

| Band | Price |
|------|-------|
| 50,001 – 100,000 | **$0.02 / MRU / mo** |
| 100,001 – 1,000,000 | **$0.018** |
| 1,000,001 – 10,000,000 | **$0.015** |
| 10,000,001+ | **$0.012** |

**Enterprise connections (after 1 included):** 2–15 → **$75/mo**; 16–100 → **$60**; 101–500 → **$30**; 500+ → **$15**

**SMS:** US & Canada **$0.01 / SMS**; International market rate  

**Machine auth overage (Pro+):** creations **$0.001** each after included; verifications **$0.00001** after included  

**Business** — **$300/mo** or **$250/mo** annual: Pro + **10 seats** (extra seats **$20/mo**), SOC2, priority support, logs 30d  

**Add-ons (all plans):**
| Add-on | Price | What you get |
|--------|-------|----------------|
| **B2B Authentication (Enhanced)** | **$100/mo** or **$85/mo** annual | Unlimited members/org, custom roles/rolesets, verified domains, link ECs to orgs; **100 MRO included**, then volume: 101–1k **$1**, 1k–10k **$0.90**, 10k–100k **$0.75**, 100k+ **$0.60** / MRO / mo |
| **Administration** | **$100/mo** or **$85/mo** annual | Unlimited impersonations |
| **Billing** | **0.7%** of volume | Subscription UI/webhooks; + Stripe 2.9% + $0.30 |

**Enterprise:** custom, annual, SLA, HIPAA/BAA, etc.

### 4) What an indie app blows first
| Scenario | First wall | At what usage |
|----------|------------|---------------|
| B2C email/social only | **50k MRU** → forced Pro | ~50k *returning* users/mo (bots that never return after day 1 often **don't** count) |
| Multi-tenant SaaS | **100 MRO** or **20 members/org** | 101st active org → B2B add-on; 21st member in one org → need Enhanced B2B |
| Need MFA / SMS OTP | **Feature gate** | Day 1 of enabling MFA/SMS → **Pro** (+ SMS $) |
| API-key heavy agent apps | **1k key creations / 100k verifications** on Hobby | Agents minting keys or high verify volume |
| SSO for one enterprise customer | **Enterprise connection** not on Hobby | Need **Pro** (1 EC included) |

### 5) AI-agent / cost traps
- **Bot signups:** Clerk's **First Day Free / MRU** reduces pure bot-signup inflation vs classic MAU — bots that sign up once and vanish **don't** bill as MRU. Returning bots / scrapers that re-auth **do**.
- **Leaked secret keys** → mass user create / session spam; enable bot protection, disposable-email block, require invitations.
- Agent loops calling **Backend API** or minting **API keys / M2M tokens** hit machine-auth meters fast.
- Enabling **SMS as default factor** → every OTP is cash (US $0.01; intl higher).
- **Organizations default on** in agent scaffolds → hit **100 MRO / 20 seats** before user count hurts.
- **Clerk Billing 0.7%** is easy to miss when scaffolding payments.

### 6) Spend caps
- **No hard dollar spend cap.**
- **Hard product limits** on Hobby (MRU, MRO, machine auth).
- Past free MRU/MRO: **required upgrade**; **one-month grace** so the app keeps running.
- Overage is **billable**, not alert-only, once on Pro.

### 7) How to check usage/spend
| Method | Where |
|--------|--------|
| Dashboard billing | [https://dashboard.clerk.com/billing](https://dashboard.clerk.com/billing) or `/last-active?path=/plan-billing` |
| Analytics / usage | Clerk Dashboard only — **CLI does not expose usage metrics** ([Clerk CLI docs](https://clerk.com/docs/cli)) |
| Open dashboard from CLI | `clerk open` |

### 8) Shell-command keywords (CLI only)
```
clerk
clerk auth login
clerk link
clerk open
clerk enable
clerk disable
clerk config pull
clerk config patch
clerk api
```

---

# 2. Auth0 (Okta Customer Identity Cloud)

**Official:** [https://auth0.com/pricing](https://auth0.com/pricing)  
**Usage reports:** [https://support.auth0.com/reports/quota](https://support.auth0.com/reports/quota) · [https://support.auth0.com/reports/usage](https://support.auth0.com/reports/usage)

### 1) Metered / gated dimensions
- **External Active Users (MAU)** — unique users with login/signup (active event) in a calendar month
- **Organizations** count
- **Enterprise Connections** (active if enabled *and* used that month)
- **M2M / client-credentials tokens** (API auth calls)
- **MFA events** (Pro vs Enterprise MFA counted separately)
- **Tenants**, admins, Actions/Forms, Event Streams, Token Vault, etc.
- **SMS delivery cost is not in Auth0 subscription** — Marketplace / Twilio / carrier bill separately

### 2) Free tier — exact quotas
| Item | Quota |
|------|-------|
| Price | **$0** (no card for signup; **card required for custom domain**) |
| MAU | **Up to 25,000** |
| Custom domain | **1** |
| Organizations | **5** |
| Enterprise Connections | **1** (new as of **Feb 2026** B2B upgrade) |
| Self-Service SSO + SCIM | **Included on Free** (Feb 2026) |
| Social / Okta connections | Unlimited* (*system limits) |
| Passwordless | Included |
| Pro MFA | **Not included** |
| Tenants | **1** |
| Admins/contributors | **3** |
| Actions + Forms | **5** |
| M2M auth | **1,000** (plan table) |
| Support | Community |

### 3) Paid plans (base prices from official page)

Pricing is **plan + selected MAU tier** (capacity purchase), not continuous per-user overage like Clerk.

| Plan | Listed base | Base MAU on page | Notable includes |
|------|-------------|------------------|------------------|
| **Essentials** | **$35 / month** | Up to **500** MAU (select higher tiers on page) | Higher API limits, **Pro MFA**, RBAC per org, **10 Organizations**, log streaming, separate prod/dev; B2B features (EC/SSO/SCIM) may require B2B path |
| **Professional** | **$240 / month** | Up to **500** MAU on current selector | Essentials + **Enterprise MFA factors**, enhanced attack protection, M2M add-on available |
| **Enterprise** | Custom | Custom tiers | SLA, private cloud, adaptive MFA add-on, etc. |

**Historical published ladder (still widely used; confirm with live selector on pricing page):**  
B2C Essentials roughly scales with MAU (e.g. ~**$35 @ 500**, ~**$70 @ 1k**, …); B2C Professional often starts ~**$240 @ 1k** historically. **B2B** self-serve was historically higher (e.g. Essentials from **~$150 @ 500 MAU**). Always re-check [auth0.com/pricing](https://auth0.com/pricing) for your use-case toggle (B2C/B2B) and MAU slider.

**MFA / SMS:**
- Free: **no Pro MFA**
- Essentials: **Pro MFA** (e.g. OTP apps, Duo)
- Professional: **Enterprise MFA** factors
- **SMS/Voice MFA:** plan-gated; **SMS messages billed by carrier/Twilio**, not "included free" in Auth0 MAU price
- Adaptive MFA: Enterprise add-on

**Orgs / B2B:** Free **5 orgs** · Essentials/Pro **10 orgs** on current feature table · Enterprise custom. Feb 2026 free B2B feature set is strong for **PoC**, not unlimited customer orgs.

### 4) What an indie app blows first
| Scenario | First wall | At what usage |
|----------|------------|---------------|
| Free B2C | **25,000 MAU** | 25k unique logins/signups in a calendar month |
| Need MFA | **Pro MFA feature gate** | First MFA enroll → **Essentials $35+** |
| Multi-tenant SaaS | **5 Organizations** | 6th org on Free |
| Enterprise SSO customers | **1 free EC**; more need paid + EC add-ons / Enterprise | 2nd customer IdP |
| M2M / agent backends | **1,000 M2M** free tier | Token-spam or many services |
| **Bot signups** | **MAU** | Every bot that completes signup/login in-month **counts 1 MAU** — no "first day free" |

**Classic trap:** Free gives **25k MAU**, but paid Essentials **starts at only 500 MAU for $35**. Crossing free means buying a **paid MAU package**, not "$0.02 more" — bill can jump.

### 5) AI-agent / cost traps
- **Bot-signup MAU inflation is severe:** Auth0 bills **any active event** in the month. Credential stuffing + open signup = burned free tier.
- No account linking on Free → same human on Google + email can be **2 MAU**.
- Agent e2e tests creating users every CI run inflate MAU unless using a separate tenant + cleanup.
- **SMS MFA** via Twilio: Auth0 plan fee **plus** per-SMS; bots requesting OTP can drain Twilio alone.
- Enabling **Organizations** early hits the **5-org** wall long before 25k MAU.
- Leaked Management API credentials → rate limits + chaos (not free).
- **Paid auto-upgrade:** subscriptions with card can **auto-upgrade after 3 consecutive months over quota** (community/support guidance).

### 6) Spend caps
- **Free:** soft warnings / email when over; **not a clean "hard stop at 25,001"** in all cases; risk of **service disruption** if chronically over; Free is **not** auto-upgraded to paid purely by card presence (community clarification Mar 2026).
- **Paid:** exceeding purchased MAU for **three consecutive months** can **auto-upgrade** subscription.
- **No global hard dollar cap** on the public cloud self-serve product.

### 7) How to check usage/spend
| Method | URL / path |
|--------|------------|
| Quota utilization | [https://support.auth0.com/reports/quota](https://support.auth0.com/reports/quota) |
| Tenant MAU / usage | [https://support.auth0.com/reports/usage](https://support.auth0.com/reports/usage) |
| Manage subscription | Dashboard → Tenant → Billing / subscription ([docs](https://auth0.com/docs/troubleshoot/customer-support/manage-subscriptions)) |
| MAU definition blog | [auth0.com/blog/auth0-monthly-active-user-mau-explained](https://auth0.com/blog/auth0-monthly-active-user-mau-explained/) |

### 8) Shell-command keywords (CLI only)
```
auth0
auth0 login
auth0 apps list
auth0 apps create
auth0 apis list
auth0 tenants list
auth0 tenants use
auth0 users
auth0 orgs
auth0 logs
auth0 api
auth0 test
auth0 logout
```
*(No dedicated `auth0 billing` / MAU CLI — usage is Support Center / Dashboard.)*

---

# 3. Firebase Authentication (+ Identity Platform)

**Official:** [https://firebase.google.com/pricing](https://firebase.google.com/pricing)  
**Auth rates:** [https://cloud.google.com/identity-platform/pricing](https://cloud.google.com/identity-platform/pricing)  
**Avoid surprise bills:** [https://firebase.google.com/docs/projects/billing/avoid-surprise-bills](https://firebase.google.com/docs/projects/billing/avoid-surprise-bills)

### 1) Metered dimensions
- **Tier 1 MAU:** Email, Phone, Anonymous, Social — free to **50,000**, then graduated rates
- **Tier 2 MAU:** **OIDC / SAML** — free to **50**, then **$0.015 / MAU**
- **SMS sent** (phone auth **and** MFA): **per message**, country-priced; **first 10 SMS/day free**
- Phone auth **requires Blaze** (not available on Spark)
- Cloud Functions / other GCP products bill separately if used for custom auth flows

### 2) Free tier
| Plan | Auth quotas |
|------|-------------|
| **Spark (no-cost)** | Other auth services free within project limits; **Phone Auth N/A**; **50k MAUs** listed for Identity Platform-style MAU; **SAML/OIDC 50 MAUs** |
| **Blaze free allowance** | Same no-cost buckets then pay-as-you-go |

**Exact Identity Platform free numbers:**
- Tier 1: **0–50,000 MAU = $0**
- Tier 2 (SAML/OIDC): **0–50 MAU = $0**
- SMS: **first 10 SMS per day not billed**

### 3) Paid (Blaze / Identity Platform) overage

**Tier 1 MAU (email/social/phone/anonymous):**

| MAU band | Price per MAU |
|----------|----------------|
| 0 – 50,000 | **$0** |
| 50,000 – 100,000 | **$0.0055** |
| 100,000 – 1,000,000 | **$0.0046** |
| 1,000,000 – 10,000,000 | **$0.0032** |
| 10,000,000+ | **$0.0025** |

**Tier 2 (OIDC/SAML):** **$0.015 / MAU** after 50  

**SMS examples (per SMS after free 10/day):**  
US **$0.01** · CA **$0.01** · GB **$0.05** · DE **$0.10** · IN **$0.07** · ID **$0.35** · "All other regions (ZZ)" **$0.46**  
Full table: [Identity Platform pricing](https://cloud.google.com/identity-platform/pricing)

**Worked example from Google's own page:** 1,300 US SMS → 300 free (30d×10) + 1,000 × $0.01 = **$10**.

### 4) What an indie app blows first
| Scenario | First wall | At what usage |
|----------|------------|---------------|
| Email/Google login only | **50k Tier-1 MAU** | 50,001st unique signer in a month → **$0.0055** each in next band |
| **Phone OTP default** (common AI scaffold) | **SMS budget** | Day 1 on Blaze: after **10 free SMS/day**, every OTP costs (**$0.01+**) — often **before** MAU matters |
| Enterprise SSO experiment | **50 SAML/OIDC MAU** | 51st federated user → **$0.015/user** |
| Open phone signup + bots | **SMS + MAU** | Bot OTP floods: hundreds–thousands $/day possible |

**Indie default that dies first:** **Phone Auth / SMS MFA**, not the 50k MAU free tier.

### 5) AI-agent / cost traps
- Scaffold enables **phone login** "because Firebase makes it easy" → SMS is the trap, not MAU.
- **Leaked Firebase config** is public by design (API keys in clients); without App Check + auth throttling, scrapers hammer **signInWithPhoneNumber**.
- **Anonymous auth** without auto-cleanup inflates MAU (auto-cleanup excludes them when enabled).
- Agent test suites creating users every run → MAU + SMS.
- Enabling **SAML/OIDC** for "enterprise readiness" → **$0.015/MAU after 50** while Tier 1 is still free to 50k.
- Blaze links **whole GCP project** — a runaway Function or Storage bug is not "auth pricing" but still your bill.

### 6) Spend caps
- **No hard spend cap on Blaze.** Official: *budgets and budget alerts do **not** cap usage or charges*; alerts can lag.
- Spark has **hard feature/quota ceilings** (e.g. no phone).
- Optional DIY hard stop: budget Pub/Sub → Cloud Function **disable billing** (destructive; can strand the project).

### 7) How to check usage/spend
| Method | Where |
|--------|--------|
| Firebase usage | [https://console.firebase.google.com/project/_/usage](https://console.firebase.google.com/project/_/usage) |
| Auth product usage | […/authentication/usage](https://console.firebase.google.com/project/_/authentication/usage) |
| GCP Billing reports | Filter products **Identity Platform** + **Firebase Authentication** — [console.cloud.google.com/billing](https://console.cloud.google.com/billing) |
| Metrics | Metrics Explorer: Sent/Verified/Blocked SMS |
| Budgets | Firebase Usage → Details & settings → Budgets, or GCP Billing budgets |

### 8) Shell-command keywords (CLI only)
```
firebase
firebase login
firebase projects:list
firebase use
gcloud
gcloud billing accounts list
gcloud billing projects describe
gcloud billing budgets list
gcloud billing budgets create
gcloud billing budgets describe
gcloud alpha billing
gcloud logging
gcloud monitoring
```

---

# Bot-signup MAU inflation trap (all three)

| Provider | Does a one-shot bot signup bill? | Why |
|----------|----------------------------------|-----|
| **Clerk** | **Usually no** if bot never returns after 24h | **MRU / First Day Free** |
| **Auth0** | **Yes** | Calendar-month **active event** = 1 MAU |
| **Firebase** | **Yes** (sign-in that month) | MAU; **SMS bots** bill even harder per message |

**Mitigations (all):** CAPTCHA/bot protection, disposable-email block, rate limits, App Check (Firebase), require invite-only for private betas, separate test tenants, disable phone/SMS until needed, monitor MAU daily during launch.

---

# "What do I blow first?" — indie defaults

| Your stack default | Most likely first fire | Rough trigger |
|--------------------|------------------------|---------------|
| Clerk, email/social, no orgs | **50k MRU** or **need MFA → Pro $20–25** | Growth or feature |
| Clerk + Organizations | **100 MRO** or **20 seats/org** | Early multi-tenant |
| Auth0 free, open signup | **25k MAU** (bots accelerate) | Viral or scraped signup |
| Auth0 free, needs MFA | **Essentials $35+** immediately | Security requirement |
| Firebase email/social | **50k MAU** then $0.0055 | Real scale |
| Firebase phone OTP on | **SMS** after **10/day free** | **Hours–days**, not months |
| Any + SMS MFA | **Carrier/SMS bill** separate from "auth free tier" | Always |

---

# Source index (primary)

| Service | URLs |
|---------|------|
| Clerk | [clerk.com/pricing](https://clerk.com/pricing) · [clerk.com/docs/cli](https://clerk.com/docs/cli) |
| Auth0 | [auth0.com/pricing](https://auth0.com/pricing) · [B2B plans upgraded (2026-02-12)](https://auth0.com/blog/auth0-b2b-plans-upgraded/) · [Monitor subscription usage](https://auth0.com/docs/troubleshoot/customer-support/manage-subscriptions/monitor-subscription-usage) · [Nov 2023 pricing changes (historical)](https://auth0.com/blog/upcoming-pricing-changes-for-the-customer-identity-cloud/) |
| Firebase / Identity Platform | [firebase.google.com/pricing](https://firebase.google.com/pricing) · [cloud.google.com/identity-platform/pricing](https://cloud.google.com/identity-platform/pricing) · [Avoid surprise bills](https://firebase.google.com/docs/projects/billing/avoid-surprise-bills) · [gcloud billing budgets](https://cloud.google.com/sdk/gcloud/reference/billing/budgets/create) |

---

**Bottom line for AI-built indie apps (July 2026):**  
- **Generous free user counts:** Clerk **50k MRU**, Firebase **50k MAU**, Auth0 **25k MAU**.  
- **SMS is never "free auth"** — all three bill SMS separately (Clerk $0.01 US/CA; Firebase country table + 10/day free; Auth0 via Twilio/etc.).  
- **Bot inflation:** Auth0 & Firebase count bots as MAU; Clerk's MRU softens pure drive-by signups.  
- **Hard dollar caps:** effectively **none** by default — Firebase is alerts-only; Auth0 uses quotas/auto-upgrade; Clerk uses plan limits + grace then metered Pro.  
- **B2B walls:** Clerk **100 orgs / 20 seats** free then $100 add-on; Auth0 **5 orgs** free (but free SSO/SCIM/1 EC as of Feb 2026); Firebase has no org product meter (SAML/OIDC hits **50 MAU** free then $0.015).

*Re-verify live prices on the three official pricing URLs before committing to a launch plan; Auth0's MAU-tier slider and B2C/B2B toggles change displayed totals dynamically.*
