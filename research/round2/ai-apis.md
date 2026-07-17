# Research archive (round 2): ai-apis

Raw dual-engine research (2026-07-17). Engine A = Claude web search; Engine B = grok CLI. Merged factsheet cross-checks both.

## Merged factsheet

```json
{
  "provider": "Merged factsheet (2026-07-17): OpenAI API + Anthropic (Claude) API + Google Gemini Developer API + Replicate. Cross-checked Report A (Claude) vs Report B (grok); ties broken via live WebFetch of developers.openai.com/api/docs/pricing and platform.claude.com/docs/en/about-claude/pricing on 2026-07-17.",
  "billing_dimensions": [
    "OpenAI: input / cached-input (10% of input) / output tokens per MTok per model; Batch & Flex ~50% off; long-context uplift columns on some models (~2x in / 1.5x out per Report B); tools metered separately (web search $10/1k calls + content tokens, file search storage $0.10/GB-day after 1 GB free, images, Realtime audio, Sora video $/sec); +10% uplift on regional/data-residency endpoints for models released on/after 2026-03-05 (VERIFIED on official page)",
    "Anthropic: base input + output tokens; prompt cache 5-min write 1.25x, 1-hr write 2x, cache hit 0.1x input (VERIFIED); Batch API 50% off; web search $10/1,000 searches; code execution $0.05/container-hr after 1,550 free hrs/mo — and FREE when used with web_search/web_fetch tools (official-page nuance neither report had); Managed Agents $0.08/session-hour (running time only); fast mode premium (Opus 4.8 $10/$50; Opus 4.7 $30/$150 removed 2026-07-24); inference_geo:'us' = 1.1x multiplier on Opus 4.6/Sonnet 4.6 and later; 1M-token context billed at standard rates (no long-context surcharge)",
    "Gemini: input/output tokens (thinking tokens billed as OUTPUT; Pro-class tiered by prompt size <=200k vs >200k); context caching per-MTok + storage $/hr ($1.00/hr Flash, $4.50/hr Pro); Batch ~50% off, Priority ~1.8x; Grounding with Google Search $14/1k queries after free monthly allowance (A: 5,000 free prompts/mo)",
    "Replicate: hardware-seconds by CPU/GPU type — public models bill active processing only (cold start free); private models & deployments bill setup + idle + active; some official models bill per image / per output token / per video-second; downstream model calls billed too"
  ],
  "free_tier": "OpenAI: no real free token pool — a \"Free\" rate-limit tier exists for allowed geographies with a $100/month org usage limit, but in practice you prepay from day one (min credit purchase ~$5). Anthropic: no standing free tier; new users get a small unspecified amount of trial credits (confirmed on official page); the one genuinely free meter is 1,550 code-execution container-hours/month per org. Gemini: real free tier (\"free input & output\") on Flash/Flash-Lite models only — Pro-class and image models excluded; Google no longer publishes fixed RPM/TPM/RPD (cut quotas 2025-12-07) — check live limits at https://aistudio.google.com/rate-limit (community order-of-magnitude: Flash ~10 RPM / ~250k TPM / ~1.5k RPD); RPD resets midnight Pacific; free-tier content may be used to train Google products (paid-tier not). Replicate: no formal free tier — select models trial-able free, then billing setup is forced; prepaid credits expire after 1 year, non-refundable.",
  "plans": [
    {
      "name": "OpenAI API (pure PAYG, prepaid credits; VERIFIED official page 2026-07-17 — both model families real)",
      "price": "prepaid credits, min ~$5; auto-recharge optional",
      "included": "Per MTok in/cached/out: gpt-5.6-sol $5.00/$0.50/$30; gpt-5.6-terra $2.50/$0.25/$15; gpt-5.6-luna $1.00/$0.10/$6; gpt-5.5 $5/$0.50/$30; gpt-5.5-pro $30/—/$180; gpt-5.4 $2.50/$0.25/$15; gpt-5.4-mini $0.75/$0.075/$4.50; gpt-5.4-nano $0.20/$0.02/$1.25; gpt-5.3-codex $1.75/$0.175/$14 (B only). Batch/Flex ~50% off.",
      "overage": "Usage-tier monthly ceilings (cumulative-spend graduation): Free/Tier1($5 paid) $100/mo; Tier2($50) $500; Tier3($100) $1,000; Tier4($250) $5,000; Tier5($1,000) $200,000. Requests fail at ceiling."
    },
    {
      "name": "Anthropic Claude API (PAYG, prepaid credits; tiers Start/Build/Scale; VERIFIED official page 2026-07-17)",
      "price": "prepaid credits",
      "included": "Per MTok in/out: Fable 5 & Mythos 5 $10/$50 (cache read $1; batch $5/$25); Opus 4.8/4.7/4.6/4.5 $5/$25 (cache read $0.50; batch $2.50/$12.50); Sonnet 5 INTRO $2/$10 through 2026-08-31, then $3/$15 from 2026-09-01 (intro cache hit $0.20, batch $1/$5); Sonnet 4.6/4.5 $3/$15; Haiku 4.5 $1/$5 (cache read $0.10; batch $0.50/$2.50). Tokenizer note: Opus 4.7+, Fable/Mythos 5, Sonnet 5 emit ~30% more tokens for same text.",
      "overage": "Tier monthly spend caps (hard — API pauses until next month): Start $500, Build $1,000, Scale $200,000, Custom negotiated. Self-set lower org/workspace limits available."
    },
    {
      "name": "Anthropic consumer subscriptions (separate rail from API)",
      "price": "Pro $20/mo ($17/mo annual); Max from $100/mo (5x/20x Pro usage)",
      "included": "Claude.ai + Claude Code plan usage via 5-hour rolling + weekly windows (limits raised ~2026-05-06)",
      "overage": "not API credit — never covers ANTHROPIC_API_KEY usage"
    },
    {
      "name": "Gemini Developer API (prepay default for new users since ~2026-03-23 per Report B; postpay mainly Tier 3)",
      "price": "prepaid credits min ~$10, expire 12 months, non-refundable; $300 GCP welcome credit NOT usable for Gemini API (B, unverified)",
      "included": "Per MTok in/out: 3.1 Flash-Lite $0.25/$1.50 ($0.50 audio in); 3 Flash Preview $0.50/$3; 3.5 Flash $1.50/$9 (caching $0.15 + $1.00/hr); 3.1 Pro Preview $2/$12 <=200k, $4/$18 >200k (caching $0.20–0.40 + $4.50/hr); legacy 2.5 Flash $0.30/$2.50, 2.5 Flash-Lite $0.10/$0.40, 2.5 Pro $1.25–2.50/$10–15. Batch ~half. Gemini 2.0 Flash shut down 2026-06-01.",
      "overage": "Tier billing caps: Tier1 (billing linked) $250/mo + $10-per-10-min spend limit; Tier2 ($100 paid + 3 days) $2,000 + $200/10-min; Tier3 ($1,000 + 30 days) $20,000–$100,000+. Project-level caps experimental with ~10-min lag."
    },
    {
      "name": "Replicate (no plans — pure usage; prepaid credit or legacy postpaid arrears)",
      "price": "prepaid credit; auto-reload threshold min $5 / reload min $15",
      "included": "Per sec ($/hr): CPU-small $0.000025 ($0.09); CPU $0.0001 ($0.36); T4 $0.000225 ($0.81); L40S $0.000975 ($3.51); A100-80GB $0.0014 ($5.04); 2xA100 $0.0028 ($10.08); H100 $0.001525 ($5.49); 8xH100 $0.0122 ($43.92). Fixed-price examples: FLUX 1.1 Pro $0.04/image, FLUX Dev $0.025/image, FLUX Schnell $3/1k images.",
      "overage": "new work stops at $0 balance (progressive rate-limiting near $0); rare overage billed end of month; monthly spend-limit feature deprecated ~2025-07"
    }
  ],
  "first_quota_blown": "OpenAI: the tier monthly usage ceiling — $100/mo at Free/Tier 1 (a modest agent app at ~$40/day hits it in ~2.5 days → insufficient_quota until tier graduation); then RPM/TPM on agent tool loops; then prepaid balance $0. Anthropic: the Start-tier $500/mo spend cap (hard pause until next month) — Sonnet 5 intro at ~$0.05/call ≈ 10k calls/mo; bursty agents hit OTPM first (output is 5x input price). Gemini free tier: RPD then RPM (classic \"works in dev, dies in prod at midnight PT reset\"); paid prepay: credit balance → $0 stops ALL keys on the billing account, then Tier 1 $250 cap and the $10-per-10-minutes spend limit on traffic spikes. Replicate: prepaid credit balance — H100 at ~30s/prediction ≈ $0.046 each, 1k/day ≈ $46/day ≈ $1,380/mo; a forgotten private deployment with min-instances >=1 bills idle 24/7 (~$121–132/day per always-on A100/H100).",
  "spend_cap": "OpenAI: NO reliable hard cap — usage-tier monthly ceilings ($100–$200k) are the only enforced stop; user-set project/org budgets are alerts-only (community-documented silent change; B concurs \"soft unless verified\"); prepaid $0 is a practical stop but with overshoot reports; auto-recharge re-opens spend; nothing protective on by default. Anthropic: YES, real hard cap on by default — tier monthly spend cap (Start $500) pauses API until next month; self-set lower org/workspace limits opt-in at Console Settings → Limits. Gemini: PARTIAL — tier caps ($250 Tier 1) and per-10-min spend limits are enforced automatically, and prepay $0 hard-stops (with ~10-min billing lag → overages past $0); but Google Cloud budgets are alerts-only (\"setting a budget does not cap spending\"); project spend caps experimental; auto-reload defeats caps. Replicate: cap = prepaid balance only ($0 stops new work; rare overage billed next month); monthly spend-limit feature deprecated ~2025-07; auto-reload silently defeats the cap; postpaid legacy accounts have no cap; nothing on by default.",
  "traps": [
    "#1 DUAL-RAIL: ANTHROPIC_API_KEY beats subscription login in Claude Code (precedence: Bedrock/Vertex/Foundry env > ANTHROPIC_AUTH_TOKEN > ANTHROPIC_API_KEY > apiKeyHelper > OAuth token > /login); with -p it's used without prompting — you pay per-token to Console even on $100+/mo Max (open bug anthropics/claude-code#16489 even with forceLoginMethod). Same for Codex: OPENAI_API_KEY (also picked up from project .env!) bills Platform per-token instead of ChatGPT plan; pin with preferred_auth_method='chatgpt' in ~/.codex/config.toml. Same session can cost 15–30x more on API rail. Check: /status (Claude), codex login status.",
    "Agent loops: retry-on-429 without backoff, re-reading whole codebases per turn, subagent/agent teams ~7x token usage, uncapped web-search loops ($10/1k searches + result tokens).",
    "Model defaults: leaving Opus/Fable/Pro/H100 default when Haiku/Flash-Lite/nano/T4 would do; extended-thinking tokens billed as OUTPUT (both Anthropic and Gemini) — output is 5–6x input price.",
    "Anthropic tokenizer inflation: Opus 4.7+/Fable 5/Sonnet 5 emit ~30% more tokens for identical text — old-token-count budgets undercount (VERIFIED on official page).",
    "Sonnet 5 price rise: $2/$10 intro ends 2026-08-31, $3/$15 from 2026-09-01 — budgets built on intro pricing jump 50% (VERIFIED).",
    "Replicate idle billing: private models/deployments bill setup + idle, not just active; min-instances >= 1 = always-on GPU bill; auto-reload ($5 threshold/$15 min) defeats credit-as-cap; credits expire after 1 year; models that call other models double-bill.",
    "Gemini free→paid cliff: linking a billing account makes ALL project usage paid; free-tier data may train Google products; ~10-min billing lag allows overspend past $0; Pro >200k-token prompts bill at double input rate; grounding $14/1k after free bucket.",
    "Leaked keys: OpenAI has no per-key limits and budgets are alerts-only, so a scraped key can burn the whole tier cap; a Replicate key can spin 8x H100 at $43.92/hr.",
    "OpenAI +10% regional data-residency uplift on models released on/after 2026-03-05 (VERIFIED); Anthropic inference_geo:'us' 1.1x on all token categories incl. cache (VERIFIED)."
  ],
  "usage_check": "OpenAI: https://platform.openai.com/usage and /settings/organization/limits; Admin API GET /v1/organization/usage/completions and /v1/organization/costs (Admin key; group_by=project_id,line_item,api_key_id); x-ratelimit-* headers; codex login status. Anthropic: https://platform.claude.com/usage and /settings/limits; Usage & Cost Admin API + Claude Code Analytics API; anthropic-ratelimit-* response headers; in Claude Code: /status (billing rail), /usage, /cost, /usage-credits. Gemini: https://aistudio.google.com/usage, /rate-limit (live limits), /billing, /spend; Cloud Billing reports (Gemini API SKU); gcloud billing accounts list / gcloud billing projects describe. Replicate: https://replicate.com/account/billing (credit balance, auto-reload, usage metrics); dashboard predictions; account HTTP API.",
  "keywords": [
    "OPENAI_API_KEY",
    "CODEX_API_KEY",
    "OPENAI_ORG_ID",
    "CODEX_HOME",
    "codex login status",
    "codex exec",
    "preferred_auth_method",
    "ANTHROPIC_API_KEY",
    "ANTHROPIC_AUTH_TOKEN",
    "CLAUDE_CODE_OAUTH_TOKEN",
    "CLAUDE_CODE_USE_BEDROCK",
    "CLAUDE_CODE_USE_VERTEX",
    "claude /status",
    "claude /usage",
    "claude /cost",
    "GEMINI_API_KEY",
    "GOOGLE_API_KEY",
    "GOOGLE_GENAI_USE_VERTEXAI",
    "gcloud billing",
    "REPLICATE_API_TOKEN",
    "cog",
    "curl api.openai.com",
    "curl api.anthropic.com",
    "curl generativelanguage.googleapis.com",
    "curl api.replicate.com",
    "env | grep -iE 'anthropic|openai|gemini|replicate'"
  ],
  "hint": "Sonnet5 $2/$10 (→$3/$15 Sep 1); gpt-5.4 $2.50/$15; Gemini 3 Flash $0.50/$3; H100 $5.49/hr. #1 trap: ANTHROPIC_API_KEY/OPENAI_API_KEY in env/.env flips Claude Code/Codex off subscription to per-token — run /status. Hard caps: Anthropic tier only (Start $500); OpenAI/GCP budgets=alerts; Replicate=credit $0.",
  "conflicts": [
    "OpenAI model lineup (A: gpt-5.6-sol/terra/luna vs B: gpt-5.4/5.5 series) — RESOLVED by WebFetch of official pricing page 2026-07-17: BOTH families are live simultaneously with matching prices (gpt-5.6-terra and gpt-5.4 both $2.50/$0.25/$15; gpt-5.6-sol and gpt-5.5 both $5/$0.50/$30). Not a real conflict; merged. B's gpt-5.3-codex $1.75/$14 not shown in fetch summary — kept with B attribution.",
    "Anthropic Sonnet 5 cache-hit intro $0.20/MTok (B only) — CONFIRMED on official page, which also gives intro cache writes $2.50 (5m)/$4 (1h) and intro batch $1/$5.",
    "Anthropic code execution — official page adds nuance both reports missed: code execution is FREE when used with web_search_20260209/web_fetch_20260209 tools; 1,550 free hrs/mo then $0.05/hr confirmed; 5-min minimum per execution; files preloaded bill even if tool not called.",
    "Fast mode: A said Opus 4.7 fast ($30/$150) removed 2026-07-24 — CONFIRMED; official page adds that since 2026-06-29 fast mode on Opus 4.6 silently runs at standard speed/rates.",
    "OpenAI spend-cap behavior: A asserts project budgets silently became alerts-only (community threads); B hedges 'often soft unless verified'. Merged conservatively: treat budgets as alerts-only; only tier ceilings and prepaid $0 actually stop requests. Not verifiable from the pricing page (help-center pages not fetched).",
    "Gemini billing overhaul ~2026-03-23 (prepay default, min $10 credit, 12-mo expiry, $300 GCP welcome credit excluded from Gemini API) is B-only and UNVERIFIED against ai.google.dev/gemini-api/docs/billing — flagged, kept with caveat.",
    "Anthropic Pro price: A '$17/mo annual ($20 monthly)' vs B '$20/mo ($17 annualized)' — same numbers, phrasing only.",
    "OpenAI cached-input: A '90% discount' vs B's explicit 10%-of-input column — equivalent; fetch confirmed exact cached prices.",
    "Gemini free-tier RPM/RPD numbers: A refuses to state (Google unpublished them 2025-12-07), B gives community snapshot ~10 RPM/250k TPM/1.5k RPD — merged as order-of-magnitude only, live source aistudio.google.com/rate-limit authoritative.",
    "Anthropic pricing doc path: A platform.claude.com/docs/en/docs/about-claude/pricing vs B .../docs/en/about-claude/pricing — B's path is the one that resolved on fetch."
  ],
  "sources": [
    "https://developers.openai.com/api/docs/pricing (WebFetched 2026-07-17 — model prices + 10% regional uplift verified)",
    "https://platform.claude.com/docs/en/about-claude/pricing (WebFetched 2026-07-17 — full model/cache/batch/fast-mode/code-exec/Managed-Agents pricing verified)",
    "https://developers.openai.com/api/docs/guides/rate-limits",
    "https://help.openai.com/en/articles/8264644-how-can-i-set-up-prepaid-billing",
    "https://platform.openai.com/settings/organization/limits",
    "https://platform.claude.com/docs/en/api/rate-limits",
    "https://claude.com/pricing",
    "https://code.claude.com/docs/en/authentication",
    "https://code.claude.com/docs/en/costs",
    "https://developers.openai.com/codex/auth",
    "https://ai.google.dev/gemini-api/docs/pricing",
    "https://ai.google.dev/gemini-api/docs/rate-limits",
    "https://ai.google.dev/gemini-api/docs/billing",
    "https://aistudio.google.com/rate-limit",
    "https://docs.cloud.google.com/billing/docs/how-to/budgets",
    "https://replicate.com/pricing",
    "https://replicate.com/docs/topics/billing",
    "https://replicate.com/docs/topics/billing/prepaid-credit",
    "https://github.com/anthropics/claude-code/issues/16489",
    "https://community.openai.com/t/monthly-budget-limit-silently-removed/1193635"
  ]
}
```

## Engine A — Claude (raw)

All research complete. Compiling the factsheet.

# AI API PRICING/QUOTA FACTSHEET — current as of 2026-07-17
Services: OpenAI API, Anthropic (Claude) API, Google Gemini API, Replicate. Verified against official pricing/docs pages on 2026-07-17. All prices USD, per 1M tokens (MTok) unless noted.

---

## 1. METERED BILLING DIMENSIONS

**OpenAI API** — input tokens, cached input tokens (90% discount), output tokens; per-model rates; Batch API at 50% off; extras metered separately (image gen, audio tokens, tool calls like web search). NEW (2026): regional/data-residency endpoints carry a 10% price uplift for models released on/after 2026-03-05. Source: https://developers.openai.com/api/docs/pricing

**Anthropic API** — base input tokens, output tokens, 5-min cache writes (1.25x input), 1-hr cache writes (2x input), cache hits (0.1x input); Batch API 50% off; web search $10/1,000 searches; code execution $0.05/container-hour after 1,550 free hrs/mo; Managed Agents session runtime $0.08/session-hour; "fast mode" premium (Opus 4.8: $10/$50); US-only `inference_geo` = 1.1x multiplier (Opus 4.6/Sonnet 4.6 and later). Source: https://platform.claude.com/docs/en/docs/about-claude/pricing

**Gemini API** — input tokens (tiered by prompt size on Pro: ≤200k vs >200k), output tokens, context caching (per-MTok + per-hour storage fee, e.g. $1.00/hr Flash, $4.50/hr Pro), Batch 50% off, Grounding with Google Search ($14/1,000 queries after 5,000 free prompts/mo). Source: https://ai.google.dev/gemini-api/docs/pricing

**Replicate** — per-second hardware time (CPU/GPU type determines rate) for public models; for private models/deployments you also pay setup + idle time; some hosted language models bill per token instead. Source: https://replicate.com/pricing and https://replicate.com/docs/topics/billing

---

## 2. FREE TIERS (exact numbers)

**OpenAI**: The rate-limit tier table includes a "Free" tier (allowed-geography requirement) with a **$100/month usage limit**; in practice new orgs get little/no trial credit and must prepay to use paid models — expect to pay from day one. Sources: https://developers.openai.com/api/docs/guides/rate-limits ; https://intuitionlabs.ai/articles/chatgpt-api-pricing-2026-token-costs-limits

**Anthropic**: No standing free tier. "New users receive a small amount of free credits to test the API" (unspecified amount). One genuinely free meter: **1,550 free hours/month of code-execution container time** per org (then $0.05/hr). Source: https://platform.claude.com/docs/en/docs/about-claude/pricing

**Gemini**: Real free tier ("free input & output tokens") on Flash/Flash-Lite models; **Google no longer publishes fixed RPM/TPM/RPD numbers** — as of 2026 the docs direct you to view your live limits at https://aistudio.google.com/rate-limit (a change from the old published tables; Google cut free quotas substantially on 2025-12-07, and Pro-class models like Gemini 3.1 Pro Preview are excluded from free tier). RPD resets midnight Pacific; limits are per project. Sources: https://ai.google.dev/gemini-api/docs/rate-limits ; https://ai.google.dev/gemini-api/docs/pricing

**Replicate**: No formal free tier — "select models" can be tried free "but after a bit you'll be asked to set up billing" (no published quota). Source: https://replicate.com/docs/topics/billing

---

## 3. PAID PLANS & UNIT PRICES

**OpenAI (pure pay-as-you-go, prepaid credits for self-serve)** — workhorse models (per MTok, standard tier):
- gpt-5.6-sol: $5.00 in / $30.00 out (cached input $0.50; batch $2.50/$15.00)
- gpt-5.6-terra: $2.50 in / $15.00 out
- gpt-5.6-luna: $1.00 in / $6.00 out
- gpt-5.4-mini: $0.75 / $4.50; gpt-5.4-nano: $0.20 / $1.25; gpt-5.5-pro: $30 / $180
Usage tiers (auto-graduate by cumulative spend): Tier 1 ($5 paid) → $100/mo cap; Tier 2 ($50) → $500/mo; Tier 3 ($100) → $1,000/mo; Tier 4 ($250) → $5,000/mo; Tier 5 ($1,000) → $200,000/mo. Sources: https://developers.openai.com/api/docs/pricing ; https://developers.openai.com/api/docs/guides/rate-limits
Subscriptions (separate rail): ChatGPT Plus/Pro include Codex usage via plan limits + purchasable credits. Source: https://developers.openai.com/codex/auth

**Anthropic (prepaid credits self-serve; tiers = Start/Build/Scale)** — per MTok:
- Claude Fable 5: $10 in / $50 out (cache write $12.50 5m / $20 1h; cache read $1; batch $5/$25)
- Claude Opus 4.8 (also 4.5–4.7): $5 in / $25 out (cache read $0.50; batch $2.50/$12.50)
- Claude Sonnet 5: **$2 in / $10 out intro pricing through 2026-08-31, rising to $3/$15 on 2026-09-01** (dated change!)
- Claude Sonnet 4.6/4.5: $3 / $15; Claude Haiku 4.5: $1 / $5 (cache read $0.10; batch $0.50/$2.50)
- Note: Opus 4.7+, Fable 5, Sonnet 5 use a new tokenizer producing ~30% more tokens for the same text — effective price is higher than the sticker rate suggests. 1M-token context billed at standard rates (no long-context surcharge).
Subscriptions: Claude Pro $17/mo annual ($20 monthly) includes Claude Code; Max from $100/mo (5x/20x Pro usage). Sources: https://platform.claude.com/docs/en/docs/about-claude/pricing ; https://claude.com/pricing

**Gemini (postpaid via Google Cloud Billing)** — per MTok:
- Gemini 3.5 Flash: $1.50 in / $9.00 out (caching $0.15 + $1.00/hr; batch $0.75/$4.50)
- Gemini 3.1 Flash-Lite: $0.25 / $1.50 (batch $0.125/$0.75)
- Gemini 3.1 Pro Preview: $2.00 in / $12.00 out ≤200k prompt tokens; $4.00 / $18.00 >200k (caching $0.20–0.40 + $4.50/hr)
- Gemini 2.5 Flash (legacy): $0.30 / $2.50
Paid tiers: Tier 1 (link billing account) → $250 billing cap, $10/10-min spend limit; Tier 2 ($100+ paid, 3+ days) → $2,000 cap, $200/10-min; Tier 3 ($1,000+, 30+ days) → $20,000–$100,000+ cap. Sources: https://ai.google.dev/gemini-api/docs/pricing ; https://ai.google.dev/gemini-api/docs/rate-limits

**Replicate (no plans — pure usage; prepaid credit or postpaid arrears)** — per second:
- CPU $0.000100/s ($0.36/hr); T4 $0.000225/s ($0.81/hr); L40S $0.000975/s ($3.51/hr); A100-80GB $0.001400/s ($5.04/hr); H100 $0.001525/s ($5.49/hr); 8x H100 $0.012200/s ($43.92/hr). Multi-GPU scales linearly. Source: https://replicate.com/pricing

---

## 4. FIRST METER AN INDIE APP BLOWS

- **OpenAI**: the **monthly usage-tier cap** — Tier 1 stops you at $100/month. A modest chat app doing 2k requests/day at ~5k in + 1k out tokens on gpt-5.6-terra ≈ $43/day → cap hit in ~2.3 days, then `insufficient_quota` until you've paid enough to graduate tiers. Second: prepaid credit balance hitting $0. Source: https://developers.openai.com/api/docs/guides/rate-limits
- **Anthropic**: **Start-tier $500/month spend cap** (API pauses until next month), and OTPM rate limit (100k output tokens/min on Fable 5, 400k on Sonnet at Start tier) for bursty agents. An agentic app on Sonnet 5 burning 20M in/4M out tokens/day ≈ $80/day → $500 cap in ~6 days. Source: https://platform.claude.com/docs/en/api/rate-limits
- **Gemini**: free-tier **RPD (requests/day)** quota — this is why "works in dev, dies in prod at midnight PT reset" is the classic Gemini failure; then Tier 1's **$10-per-10-minutes spend limit** throttles traffic spikes. Source: https://ai.google.dev/gemini-api/docs/rate-limits
- **Replicate**: **prepaid credit balance** — GPU-seconds burn fast; an image model on H100 at 10s/generation = $0.015/image; 1,000 images/day = $15/day, and a private-model deployment with min-instances ≥1 bills idle time 24/7 (~$132/day for 1 always-on H100). Source: https://replicate.com/pricing

---

## 5. COST TRAPS FOR AI-AGENT-BUILT APPS

1. **The subscription-vs-API dual-rail trap (biggest one)**:
   - **Claude Code**: credential precedence is Bedrock/Vertex/Foundry env vars > `ANTHROPIC_AUTH_TOKEN` > **`ANTHROPIC_API_KEY`** > `apiKeyHelper` > `CLAUDE_CODE_OAUTH_TOKEN` > subscription `/login`. If `ANTHROPIC_API_KEY` is exported in your shell profile, Claude Code bills per-token to the Console **even if you pay $100+/mo for Max**; with `-p` (non-interactive) the key is used without prompting. `CLAUDE_CODE_USE_BEDROCK=1` / `CLAUDE_CODE_USE_VERTEX=1` flip billing to AWS/GCP. There is even an open bug where API billing occurred despite `forceLoginMethod: claudeai` (anthropics/claude-code#16489). Check with `/status`. Sources: https://code.claude.com/docs/en/authentication ; https://github.com/anthropics/claude-code/issues/16489
   - **Codex CLI**: "Sign in with ChatGPT" = plan-included usage; **`OPENAI_API_KEY`** = per-token platform billing. Config keys `preferred_auth_method` / `forced_login_method` in `~/.codex/config.toml` pin the rail; `codex login status` shows which is active. Source: https://developers.openai.com/codex/auth
   - **Gemini CLI**: Google-account OAuth login uses free quota; setting `GEMINI_API_KEY` (or Vertex env vars) bills the API key's project.
2. **Agent loops**: retry-on-429 loops without backoff, agents that re-read whole codebases per turn, and agent teams/subagents (Claude Code agent teams ≈ 7x token usage; each teammate keeps consuming until shut down). Source: https://code.claude.com/docs/en/costs
3. **Model defaults**: leaving Opus/Fable as default ($5–$10 in / $25–$50 out) when Haiku/Flash-Lite ($0.25–$1 in) would do; extended-thinking tokens billed as output by default.
4. **Leaked keys**: OpenAI project budgets are now **alerts only** (see §6) and per-key limits don't exist, so a scraped key from a public repo/frontend bundle can burn the full tier cap; Replicate keys can spin 8x H100 jobs at $43.92/hr.
5. **Replicate idle billing**: private models/deployments bill setup + idle time, not just active compute; auto-reload on prepaid credit ($5 threshold/$15 minimum) silently defeats the "credit as hard cap" strategy; unused credit expires after 1 year. Sources: https://replicate.com/docs/topics/billing ; https://replicate.com/changelog/2025-07-29-prepaid-credit
6. **Gemini "free" → paid cliff**: once you link a billing account to a project, *all* usage in that project bills at paid rates — the free tier only applies to unbilled projects.
7. **Anthropic tokenizer change**: newer models emit ~30% more tokens for identical text — budget forecasts based on old token counts undercount. Source: https://platform.claude.com/docs/en/docs/about-claude/pricing

---

## 6. SPEND CAPS: HARD, DEFAULT, OR ALERTS ONLY?

| Service | Hard cap? | Default? | Notes |
|---|---|---|---|
| OpenAI | **No true hard cap.** Prepaid credits stop requests at $0 balance in theory, but community reports show soft-limit behavior/overshoot; the old "monthly budget = suspension" was **silently changed to alert-only** — requests continue past project budgets. Tier caps ($100–$200k/mo) are the only enforced ceiling. | Budget alert auto-created at 100% threshold when you set a project budget | Set at Settings → Limits (org) or per-project Limits. Sources: https://help.openai.com/en/articles/9186755-managing-your-work-in-the-api-platform-with-projects ; https://community.openai.com/t/monthly-budget-limit-silently-removed/1193635 ; https://community.openai.com/t/i-d-like-openai-to-allow-setting-a-hard-limit-as-well-since-the-openai-api-uses-prepaid-billing/1370125 |
| Anthropic | **Yes — real hard cap.** Tier spend caps (Start $500 / Build $1,000 / Scale $200,000/mo): "API usage pauses until the next month." You can also self-set a lower org spend limit and per-workspace spend/rate limits. | Tier cap is on by default; self-set limit is opt-in | Console → Settings → Limits. Source: https://platform.claude.com/docs/en/api/rate-limits |
| Gemini | **Partial.** Tier "billing caps" ($250 Tier 1) and per-10-minute spend limits ($10 Tier 1) throttle runaway spend; but Google Cloud **budgets are alerts only** — "setting a budget does not cap spending" unless you wire programmatic budget notifications to disable billing yourself. | Tier caps automatic; Cloud budgets/alerts opt-in | Sources: https://ai.google.dev/gemini-api/docs/rate-limits ; https://docs.cloud.google.com/billing/docs/how-to/budgets |
| Replicate | **Only via prepaid credit.** The monthly spend-limit feature was **deprecated (~2025-07-01)**. Prepaid balance ≈ hard cap (progressive rate-limiting as balance nears $0), BUT overages can still be billed next month and auto-reload defeats the cap. Postpaid accounts: no cap, fraud-detection early-charges only. | Nothing on by default | Sources: https://replicate.com/changelog/2022-10-17-set-a-monthly-spend-limit ; https://replicate.com/docs/topics/billing |

---

## 7. HOW TO CHECK USAGE/SPEND

**OpenAI**
- Dashboard: https://platform.openai.com/usage ; limits: https://platform.openai.com/settings/organization/limits
- API: `GET https://api.openai.com/v1/organization/usage/completions` and `GET https://api.openai.com/v1/organization/costs` (requires Admin key from https://platform.openai.com/settings/organization/admin-keys; supports `group_by=project_id,line_item,api_key_id`). Sources: https://developers.openai.com/api/reference/resources/admin/subresources/organization/subresources/usage/methods/costs ; https://cookbook.openai.com/examples/completions_usage_api
- CLI: `codex login status` (auth rail); Codex plan usage shown in ChatGPT settings.

**Anthropic**
- Dashboard: https://platform.claude.com/usage ; limits/tier: https://platform.claude.com/settings/limits ; Claude Code per-user dashboard: https://platform.claude.com/claude-code
- API: Admin Usage & Cost API and Claude Code Analytics API (https://platform.claude.com/docs/en/build-with-claude/claude-code-analytics-api); rate-limit response headers `anthropic-ratelimit-*` on every call.
- CLI: in Claude Code `/usage` (session tokens + plan bars), `/status` (which billing rail), `/usage-credits` (Pro/Max spend limit + credit purchases), `claude --version`. Source: https://code.claude.com/docs/en/costs

**Gemini**
- Live limits: https://aistudio.google.com/rate-limit ; usage/billing: AI Studio usage page + Google Cloud Console billing reports (project-level).
- CLI: `gcloud billing accounts list`, `gcloud billing projects describe PROJECT_ID`. Source: https://ai.google.dev/gemini-api/docs/rate-limits

**Replicate**
- Dashboard: https://replicate.com/account/billing (usage metrics, credit balance, auto-reload). Source: https://replicate.com/docs/topics/billing

---

## 8. SHELL-COMMAND DETECTION KEYWORDS

- OpenAI rail: `openai` (Python CLI), `codex`, `codex login`, `codex login status`, `codex logout`, env greps for `OPENAI_API_KEY`, `OPENAI_ORG_ID`, `CODEX_HOME`, `curl api.openai.com`
- Anthropic rail: `claude`, `claude --version`, slash commands `/status /usage /cost /usage-credits /login /logout /model /config`, env greps for `ANTHROPIC_API_KEY`, `ANTHROPIC_AUTH_TOKEN`, `CLAUDE_CODE_USE_BEDROCK`, `CLAUDE_CODE_USE_VERTEX`, `CLAUDE_CODE_OAUTH_TOKEN`, `curl api.anthropic.com`
- Gemini rail: `gemini` (Gemini CLI), `gcloud`, `gcloud auth`, `gcloud billing`, env greps for `GEMINI_API_KEY`, `GOOGLE_API_KEY`, `GOOGLE_GENAI_USE_VERTEXAI`, `curl generativelanguage.googleapis.com`
- Replicate: `replicate` (CLI), env grep `REPLICATE_API_TOKEN`, `curl api.replicate.com`
- Cross-cutting: `env | grep -iE 'anthropic|openai|gemini|replicate'` to find which billing rail a machine will silently use.

---

## KEY DATED CHANGES TO WATCH
- **2026-09-01**: Claude Sonnet 5 price rises $2/$10 → $3/$15 per MTok (intro pricing ends 2026-08-31). https://platform.claude.com/docs/en/docs/about-claude/pricing
- **2026-07-24**: Claude Opus 4.7 fast mode ($30/$150) removed. Same source.
- **2026-03-05+**: OpenAI 10% uplift for data-residency endpoints on new models. https://developers.openai.com/api/docs/pricing
- **2025-12-07**: Gemini free-tier quota cuts; numbers no longer published, view in AI Studio. https://ai.google.dev/gemini-api/docs/rate-limits
- **~2025-07**: Replicate deprecated monthly spend limits; introduced prepaid credit. https://replicate.com/changelog/2025-07-29-prepaid-credit
- OpenAI project budget hard-stop silently became alert-only (community-documented). https://community.openai.com/t/monthly-budget-limit-silently-removed/1193635

Caveat: OpenAI model-by-model prices above are from the official pricing page as summarized on fetch date; Gemini free-tier per-model RPM/RPD are intentionally not stated numerically because Google removed published numbers — check https://aistudio.google.com/rate-limit for the live values on your project.

## Engine B — grok (raw)

# AI API Pricing / Quota Factsheet  
**As of: 2026-07-17** · Verified against official pricing pages

---

## Dual-rail trap (CLIs) — read first

| CLI | Subscription rail | API rail (metered) | Flip variables / config |
|-----|-------------------|--------------------|-------------------------|
| **Claude Code** | Claude Pro / Max OAuth (`CLAUDE_CODE_OAUTH_TOKEN`) — fixed monthly | Console key → per-token API | **`ANTHROPIC_API_KEY` wins** if set, even while logged into Pro/Max. Also: `ANTHROPIC_AUTH_TOKEN` (gateway). Check with `/status`. Fix: `unset ANTHROPIC_API_KEY`. |
| **Codex CLI** | ChatGPT Plus/Pro/Business/Enterprise sign-in | Platform key → per-token | **`OPENAI_API_KEY`** (also loaded from project `.env`). Prefer subscription: `preferred_auth_method = "chatgpt"` in `~/.codex/config.toml`. Headless: `CODEX_API_KEY` / `codex exec`. ChatGPT plan **never** covers API-key spend. |

**Cost asymmetry:** same coding session can be ~15–30× more expensive on API tokens than on a Max/Pro subscription. Agents that inherit shell env or repo `.env` silently flip rails.

---

## 1. OpenAI API

**Sources:** [API pricing](https://developers.openai.com/api/docs/pricing) · [Rate limits / usage tiers](https://developers.openai.com/api/docs/guides/rate-limits) · [Prepaid billing help](https://help.openai.com/en/articles/8264644-how-can-i-set-up-prepaid-billing) · Limits UI: `platform.openai.com/settings/organization/limits`

### 1. Metered dimensions
- Input / output / cached-input tokens (per 1M)
- Long-context uplift on some models (separate short vs long columns)
- Tools: web search **$10 / 1k calls** (+ content tokens), file search storage **$0.10/GB-day** (1 GB free), containers (Shell/Code Interpreter) by size/session
- Images, Realtime audio, Sora video ($/sec), embeddings, etc.
- Batch / Flex ~50% off; Priority higher

### 2. Free tier
- **No free unlimited production API.** “Free” usage tier exists for allowed geos with **$100/month org usage limit** after geographic eligibility — still effectively prepaid/low-cap; not a generous free token pool like Gemini.  
- ChatGPT consumer free plan ≠ API.

### 3. Paid plans (API is PAYG, not a “plan”)

**Workhorse short-context Standard prices (USD / 1M tokens):**

| Model | Input | Cached in | Output |
|-------|------:|----------:|-------:|
| **gpt-5.4** (workhorse) | $2.50 | $0.25 | $15.00 |
| **gpt-5.4-mini** | $0.75 | $0.075 | $4.50 |
| **gpt-5.4-nano** | $0.20 | $0.02 | $1.25 |
| **gpt-5.5** | $5.00 | $0.50 | $30.00 |
| **gpt-5.5-pro / gpt-5.4-pro** | $30.00 | — | $180.00 |
| **gpt-5.3-codex** | $1.75 | $0.175 | $14.00 |

Long-context columns roughly **2× input / 1.5× output** (e.g. gpt-5.4 long: $5 / $22.50).  
Regional data-residency: **+10%** for eligible models released on/after **2026-03-05**.  
Batch/Flex: ~half Standard.

**Org monthly usage ceilings by spend tier** (qualification = cumulative paid):

| Tier | Qualify | Monthly usage limit |
|------|---------|---------------------|
| Free | allowed geo | **$100** |
| Tier 1 | $5 paid | **$100** |
| Tier 2 | $50 paid | **$500** |
| Tier 3 | $100 paid | **$1,000** |
| Tier 4 | $250 paid | **$5,000** |
| Tier 5 | $1,000 paid | **$200,000** |

**Billing:** prepaid credits + optional auto-recharge; usage draws credits; overage can invoice depending on setup. Minimum credit purchases commonly **$5+**.

### 4. What an indie app blows first
1. **Tier monthly usage limit** ($100 at Tier 1) — hard-ish org ceiling before rate tiers rise.  
2. **RPM/TPM** on the model (agent tool loops burn RPM first).  
3. **Output tokens** on gpt-5.4/5.5 (output is 6× input).

**Back-of-envelope:** gpt-5.4 at ~2k in + 1k out/request ≈ **$0.02/call**.  
→ ~**5,000 calls ≈ $100** → Tier-1 monthly wall.  
An agent doing 20 tool turns/user × 100 users/day ≈ **2,000 turns/day → $40/day → $100 in ~2.5 days**.

### 5. Cost traps
- Unbounded agent/retry loops; high `max_tokens` + long system prompts  
- Web search tool fees stacking with tokens  
- **Codex dual-rail:** `OPENAI_API_KEY` in `.env` bills Platform while you think ChatGPT covers it  
- Leaked keys; Priority processing by mistake  
- Realtime audio / Sora ($0.10–$0.70/sec video)

### 6. Spend caps
- **Org tier monthly usage limit:** enforced (requests fail when hit).  
- **User-set project/org budgets:** often **soft (alerts)** unless configured as hard stop — treat “Edit Budget” as **not guaranteed hard** without verifying it blocks requests.  
- Prepaid balance = practical hard stop when credits = 0 (with possible short overage lag).  
- **Default:** no personal hard cap until you set one; auto-recharge can keep spending.

### 7. Check usage
- Dashboard: https://platform.openai.com/usage · https://platform.openai.com/settings/organization/limits · billing overview  
- Headers: `x-ratelimit-*`  
- Admin/usage APIs (org)  
- Codex: ChatGPT usage vs Platform usage (separate)

### 8. Shell keywords
`openai`, `openai api`, `codex`, `codex login`, `codex exec`, `OPENAI_API_KEY`, `CODEX_API_KEY`

---

## 2. Anthropic Claude API

**Sources:** [Pricing](https://platform.claude.com/docs/en/about-claude/pricing) · [Rate limits / spend](https://platform.claude.com/docs/en/api/rate-limits) · [claude.com/pricing](https://claude.com/pricing) · Console: `console.anthropic.com` / Claude Console Limits

### 1. Metered dimensions
- Base input, output, **prompt cache** (5m write 1.25×, 1h write 2×, hits 0.1×)  
- Batch **50% off**  
- Web search **$10 / 1,000 searches**  
- Code execution: **1,550 free container-hours/mo**, then **$0.05/hr/container** (free when used with web search/fetch tools)  
- Managed Agents: tokens + **$0.08 / session-hour**  
- Fast mode (Opus): premium (Opus 4.8 fast **$10/$50** MTok)  
- US data residency **1.1×** on recent models  

### 2. Free tier
- **API:** new users get **small free credits** only — not a permanent free RPM product tier.  
- **Consumer Free** Claude.ai chat ≠ API for apps.

### 3. Paid (API PAYG + consumer subs)

**Workhorse API (USD / MTok):**

| Model | Input | Output | Notes |
|-------|------:|-------:|-------|
| **Claude Sonnet 5** | **$2** | **$10** | **Intro through 2026-08-31**; then **$3 / $15** from **2026-09-01** |
| **Claude Sonnet 4.6** | $3 | $15 | Stable workhorse |
| **Claude Opus 4.8 / 4.7 / 4.6** | $5 | $25 | Flagship agents |
| **Claude Haiku 4.5** | $1 | $5 | Cheap high-volume |

Cache hits: Sonnet 5 intro **$0.20** MTok; Haiku **$0.10**.  
**Tokenizer note (Opus 4.7+, Sonnet 5, Fable/Mythos):** ~**30% more tokens** for same text vs older models.

**Consumer (Claude Code on subscription):** Free; **Pro $20/mo** ($17 annualized); **Max from $100/mo** (5× / 20× usage). These are **not** the API price list.

**Org monthly spend caps (API):**

| Usage tier | Monthly spend **cap** |
|------------|----------------------|
| Start | **$500** |
| Build | **$1,000** |
| Scale | **$200,000** |
| Custom | negotiated |

You can set a **lower** spend limit in Settings → Limits.

### 4. What blows first
1. **Self-set or tier monthly spend cap** (hard pause until next month).  
2. **OTPM** on verbose agent replies (output is 5× input on Sonnet/Opus).  
3. **Claude Code:** if on API key, token burn; if on Max, **5-hour rolling + weekly** compute windows (doubled May 2026 for Pro/Max/Team).

**Example:** Sonnet 5 intro, 10k in + 3k out ≈ **$0.05/call**.  
→ **$500 Start cap ≈ 10k such calls/month**.  
Agent: 50 turns × 20k total tokens ≈ **$0.50–1.00/session** at Sonnet rates → **$500 ≈ 500–1,000 heavy sessions**.

### 5. Cost traps
- **`ANTHROPIC_API_KEY` dual-rail** on Claude Code  
- Fast mode / high “effort”  
- Uncapped web search loops ($10/1k + tokens for results)  
- Long context re-sent without cache  
- Tokenizer inflation on Sonnet 5 / new Opus  

### 6. Spend caps
- **Yes, hard monthly org spend cap by tier** (API pauses when hit).  
- User can set **lower** hard spend limit.  
- **Not on by default at $0** — default is the tier cap (Start **$500**).  
- Workspace limits available below org.

### 7. Check usage
- Console Usage / Limits: Claude Console → Usage, Settings → Limits  
- [Usage & Cost Admin API](https://platform.claude.com/docs/en/manage-claude/usage-cost-api)  
- Claude Code: `/status`, `/cost` (where available)

### 8. Shell keywords
`claude`, `claude auth`, `ANTHROPIC_API_KEY`, `CLAUDE_CODE_OAUTH_TOKEN`, `ANTHROPIC_AUTH_TOKEN`

---

## 3. Google Gemini Developer API

**Sources:** [Pricing](https://ai.google.dev/gemini-api/docs/pricing) · [Billing](https://ai.google.dev/gemini-api/docs/billing) · [Rate limits](https://ai.google.dev/gemini-api/docs/rate-limits) · AI Studio: usage, rate-limit, billing, spend

### 1. Metered dimensions
- Input / output (**thinking tokens count as output**)  
- Context cache + storage $/MTok-hour  
- Grounding (Search/Maps): free allowance then **$14 / 1k queries** (Gemini 3 family)  
- Batch / Flex ~50% off; Priority ~1.8×  
- Image/video/audio modality rates; Pro long-prompt (>200k) uplift  

### 2. Free tier — exact structure
- **Free of charge input & output** for models that list Free Tier on the pricing page (Flash / Flash-Lite family; **many Pro/image models: Free = Not available**).  
- Content on free tier **may train Google products** (paid: not).  
- **RPM / TPM / RPD are project- and model-specific** — official docs direct you to **live values** in AI Studio, not a single static table. Community snapshots often show Flash ~**10 RPM / ~250k TPM / ~1.5k RPD** order-of-magnitude; **always re-read** https://aistudio.google.com/rate-limit.  
- **Gemini 2.0 Flash shut down 2026-06-01** (pricing page note).

### 3. Paid plans

**Workhorse Standard (USD / 1M tokens), paid tier:**

| Model | Input | Output (incl. thinking) |
|-------|------:|------------------------:|
| **Gemini 3.1 Flash-Lite** | **$0.25** (text/image/video); $0.50 audio | **$1.50** |
| **Gemini 3 Flash Preview** | **$0.50** (text/image/video); $1.00 audio | **$3.00** |
| **Gemini 3.5 Flash** | **$1.50** | **$9.00** |
| **Gemini 2.5 Flash** | $0.30 (text/image/video) | $2.50 |
| **Gemini 2.5 Flash-Lite** | $0.10 | $0.40 |
| **Gemini 2.5 Pro** | $1.25 (≤200k) / $2.50 (>200k) | $10 / $15 |
| **Gemini 3.1 Pro Preview** | $2.00 (≤200k) / $4.00 (>200k) | $12 / $18 |

Batch ~half. Grounding after free bucket: **$14/1k** (Gemini 3).

**Billing (major change effective ~2026-03-23):**  
- **Prepay default** for new users: min **~$10** credits; unused expire **12 months**, non-refundable.  
- Auto-reload + optional **monthly auto-charge limit**.  
- **Postpay** mainly at Tier 3 (switch UI may be temporarily disabled).  
- **$300 GCP Welcome credit: NOT usable for Gemini API** (accounts after ~2026-03-02).

**Tier spend caps (billing account, monthly):**

| Tier | Qualify | Cap |
|------|---------|-----|
| Free | project | N/A |
| Tier 1 | billing + prepay | **$250** |
| Tier 2 | $100 paid + 3 days | **$2,000** |
| Tier 3 | $1,000 paid + 30 days | **$20,000–$100,000+** |

Project-level monthly spend caps (experimental; ~10 min lag overages).

### 4. What blows first
1. **Free:** **RPD then RPM** (agent multi-step dies on 5–10 RPM).  
2. **Paid Prepay:** **credit balance → $0** (all keys on that billing account stop).  
3. **Tier spend cap** ($250 Tier 1).  
4. **Spend rate limit** (Tier 1: **$10 / 10 minutes**).

**Example:** 3 Flash $0.50/$3, 2k in + 1k out ≈ **$0.004/call** → **$250 ≈ 60k calls**.  
Indie apps often hit **429 rate limits** before the dollar cap.

### 5. Cost traps
- Thinking tokens billed as output  
- Grounding after free monthly prompts  
- Pro >200k context double rates  
- Auto-reload without monthly auto-charge limit  
- Free→Paid data-use / terms change  
- ~10 min billing lag → **overages past $0**

### 6. Spend caps
- **Tier monthly caps:** hard pause for all linked projects.  
- **Project spend caps:** optional, experimental, lag.  
- **Prepay $0:** hard stop (with lag).  
- **Default:** free = rate walls; paid Prepay = spend until credits/cap — auto-reload can re-open spend.

### 7. Check usage
- https://aistudio.google.com/usage  
- https://aistudio.google.com/rate-limit  
- https://aistudio.google.com/billing · https://aistudio.google.com/spend  
- Cloud Billing reports (Gemini API SKU)

### 8. Shell keywords
`gcloud`, `gcloud billing`, `gemini`, `GOOGLE_API_KEY`, `GEMINI_API_KEY`, `aistudio`

---

## 4. Replicate

**Sources:** [Pricing](https://replicate.com/pricing) · [Billing](https://replicate.com/docs/topics/billing) · [Prepaid credit](https://replicate.com/docs/topics/billing/prepaid-credit)

### 1. Metered dimensions
- **Most models:** hardware **seconds** (public: active processing only; cold start free)  
- **Some official models:** per image / per output token / per video-second  
- **Private models & deployments:** setup + idle + active (always-on bill)  
- Downstream model calls billed too  

### 2. Free tier
- **No permanent free tier.**  
- **Select models** free to try; then forced to set billing.  
- Credits: buy upfront, **valid 1 year, non-refundable**.

### 3. Paid (pure PAYG + prepaid)

**GPU / CPU hardware (official):**

| Hardware | $/sec | $/hr |
|----------|------:|-----:|
| CPU Small | $0.000025 | $0.09 |
| CPU | $0.000100 | $0.36 |
| **T4** | **$0.000225** | **$0.81** |
| **L40S** | **$0.000975** | **$3.51** |
| **A100 80GB** | **$0.001400** | **$5.04** |
| **H100** | **$0.001525** | **$5.49** |
| 2× A100 | $0.002800 | $10.08 |
| 8× H100 | $0.012200 | $43.92 |

Example fixed-output models (from pricing page): FLUX 1.1 Pro **$0.04/image**, FLUX Dev **$0.025/image**, FLUX Schnell **$3/1k images**.

### 4. What blows first
1. **Prepaid credit balance** (new work stops at $0).  
2. **Deployments / private models idle time** (forgotten min instances).  
3. Video models ($/sec of output).

**Example:** H100 30s prediction ≈ **$0.046**.  
1,000 gens/day ≈ **$46/day ≈ $1,380/mo**.  
Always-on private A100 (if never scales to 0) ≈ **$5.04/hr ≈ $121/day**.

### 5. Cost traps
- Deployments with **min instances > 0**  
- Private model idle billing  
- Auto-reload without discipline  
- Agent image loops (FLUX $0.025–0.04 each)  
- Models that call other models (double bill)

### 6. Spend caps
- **Hard at credit $0** (stops new work; rare overage charged EOM).  
- Auto-reload re-opens spend; threshold min **$5**, reload balance min **$15**.  
- **No separate “budget alert only” product** — balance is the cap.  
- Older arrears billing still documented for some accounts.

### 7. Check usage
- https://replicate.com/account/billing  
- Dashboard predictions / usage  
- HTTP API account endpoints (token-auth)

### 8. Shell keywords
`replicate`, `REPLICATE_API_TOKEN`, `cog`

---

## Cross-provider comparison (indie defaults)

| | OpenAI | Anthropic | Gemini | Replicate |
|--|--------|-----------|--------|-----------|
| **Primary meter** | tokens | tokens | tokens | GPU-sec / outputs |
| **Workhorse $/M in·out** | 5.4: **2.50 / 15** | Sonnet5 intro: **2 / 10** (→3/15 Sep 1) | 3 Flash: **0.50 / 3** | N/A (sec) |
| **Real free build** | essentially no | tiny credits | **yes (rate-limited Flash)** | trial then prepaid |
| **Hard spend stop** | tier monthly + credits | **tier monthly cap** | prepay $0 + tier cap | **credits $0** |
| **Alerts-only risk** | project budgets | low if you set limit | project caps lag | auto-reload |
| **CLI dual-rail** | Codex + `OPENAI_API_KEY` | Claude Code + `ANTHROPIC_API_KEY` | — | — |

---

## Recent changes (date-stamped)

| When | What |
|------|------|
| **2026-03-05+** | OpenAI regional processing **+10%** on eligible new models |
| **~2026-03-23** | Gemini **Prepay/Postpay** system; new users prepaid; Welcome credit **not** for Gemini API |
| **2026-05-06** | Anthropic raised Claude Code 5-hour limits; higher Opus API rate limits |
| **2026-05-19** | Gemini **3.5 Flash** at **$1.50 / $9** (product coverage) |
| **2026-06-01** | **Gemini 2.0 Flash shut down** |
| **2026-06-30 / Jul** | **Claude Sonnet 5** launch; intro **$2/$10 through 2026-08-31**, then **$3/$15** |
| **2026-07** | OpenAI flagship stack **gpt-5.4 / 5.5 / 5.6-*** live on official pricing table |

---

## Agent-built app checklist (all four)

1. **Unset dual-rail env vars** in agent shells unless you intend API billing.  
2. **Set hard money stops:** OpenAI project limits + low auto-recharge; Anthropic spend limit; Gemini project cap + auto-charge limit; Replicate low balance, auto-reload off while testing.  
3. **Cap agent loops:** max steps, max tokens, no infinite tool retry.  
4. **Default cheap models:** nano/Flash-Lite/Haiku/T4 — not Opus/Pro/H100.  
5. **Rotate keys; never commit `.env`.**  
6. **Watch output tokens and thinking** — often 3–6× input cost.  
7. **Replicate:** prefer public models; never leave private deployment min replicas warm overnight.

---

## Primary source URLs (bookmark)

| Provider | Pricing | Limits / billing |
|----------|---------|------------------|
| OpenAI | https://developers.openai.com/api/docs/pricing | https://developers.openai.com/api/docs/guides/rate-limits · https://platform.openai.com/settings/organization/limits · https://help.openai.com/en/articles/8264644-how-can-i-set-up-prepaid-billing |
| Anthropic | https://platform.claude.com/docs/en/about-claude/pricing | https://platform.claude.com/docs/en/api/rate-limits · https://claude.com/pricing |
| Gemini | https://ai.google.dev/gemini-api/docs/pricing | https://ai.google.dev/gemini-api/docs/billing · https://ai.google.dev/gemini-api/docs/rate-limits · https://aistudio.google.com/rate-limit |
| Replicate | https://replicate.com/pricing | https://replicate.com/docs/topics/billing · https://replicate.com/docs/topics/billing/prepaid-credit |

**Caveat:** Free-tier RPM/RPD for Gemini and exact OpenAI project hard-cap UX change frequently — re-open the linked pages before budgeting a production launch.
