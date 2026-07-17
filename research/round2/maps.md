# Research archive (round 2): maps

Raw dual-engine research (2026-07-17). Engine A = Claude web search; Engine B = grok CLI. Merged factsheet cross-checks both.

## Merged factsheet

```json
{
  "provider": "Google Maps Platform (Maps/Places/Routes) + Mapbox",
  "billing_dimensions": [
    "Google: billable events per SKU, priced per 1,000 (map loads, API requests, tile requests, autocomplete requests, routes computed); each SKU meters independently, aggregated per billing account per calendar month",
    "Google: SKU price category (Essentials/Pro/Enterprise) is chosen by the FIELDS requested (field mask), not the endpoint — highest-tier field in the request wins",
    "Google: automatic volume discounts after free cap (100K/500K/1M/5M+ tiers); Legacy APIs (old Places, Directions, Distance Matrix) capped at the 100K discount tier and cannot be newly enabled since 2025-03-01",
    "Mapbox: map loads for GL JS web (1 per new Map() init, includes the session's vector/raster tiles), MAUs for mobile SDKs, tile requests (vector/raster/static tiles used standalone), API requests (geocoding, directions, matrix elements, isochrone, static images), and sessions (Search Box, Address Autofill)"
  ],
  "free_tier": "Google (since 2025-03-01, replaced pooled $200/mo credit; NOT pooled, resets 1st of month Pacific): 10,000 free calls/SKU/mo for Essentials SKUs (Dynamic Maps, Static Maps, Geocoding, Autocomplete Requests, Place Details Essentials, Compute Routes Essentials), 5,000/mo for Pro SKUs (Text/Nearby Search Pro $32/1K after, Place Details Pro, Address Validation), 1,000/mo for Enterprise SKUs; Map Tiles 2D + Street View Tiles 100,000/mo; unlimited $0: Embed, mobile Maps SDKs, Street View Metadata, Text Search/Place Details (IDs only). Plus $300/90-day new-GCP-customer trial credit. Mapbox (per billing period, card required): 50,000 web map loads; 25,000 mobile MAU; 200,000 vector tile + 200,000 static tile + 750,000 raster tile requests; 50,000 static images; 100,000 temporary geocoding; 100,000 each Directions/Map Matching/Isochrone/Optimization; 100,000 Matrix elements; Search Box sessions only 500 free (preview pricing) or 2,500 (standard pricing); Address Autofill 1,000 sessions; Permanent Geocoding has NO free tier ($5/1K from request 1).",
  "plans": [
    {
      "name": "Google Maps Platform pay-as-you-go (default)",
      "price": "$0/mo base; per-SKU rates after free quota (0-100K volume)",
      "included": "Per-SKU free monthly quota: 10K (Essentials) / 5K (Pro) / 1K (Enterprise); Map Tiles 2D 100K",
      "overage": "Per 1,000: Dynamic Maps $7; Static Maps $2; Geocoding $5; Autocomplete Requests $2.83; Place Details Essentials $5; Compute Routes Essentials $5 / Pro $10; Text & Nearby Search Pro $32; Place Details Pro $17; Address Validation $17; Dynamic Street View $14; Text/Nearby Search Enterprise $35; Place Details Enterprise $20; Map Tiles 2D $0.60; Photorealistic 3D Tiles $6; auto volume discounts above 100K (up to ~80% at 5M+)"
    },
    {
      "name": "Google Maps subscription: Starter",
      "price": "$100/mo",
      "included": "50,000 pooled calls across plan SKUs (Dynamic Maps + Geocoding focus)",
      "overage": "Falls back to PAYG rates; service NOT blocked at plan limit"
    },
    {
      "name": "Google Maps subscription: Essentials",
      "price": "$275/mo",
      "included": "100,000 pooled calls",
      "overage": "PAYG rates beyond plan; non-plan SKUs always PAYG"
    },
    {
      "name": "Google Maps subscription: Pro",
      "price": "$1,200/mo",
      "included": "250,000 pooled calls (Enterprise plan: custom)",
      "overage": "PAYG rates beyond plan"
    },
    {
      "name": "Mapbox pay-as-you-go (only model; no product tiers)",
      "price": "$0/mo base, card required at signup, billed monthly in arrears",
      "included": "Free tiers per product as listed (50K map loads, 25K MAU, 100K geocoding/directions, 500 preview / 2,500 standard Search Box sessions, etc.)",
      "overage": "Per 1,000: map loads $5 (50-100K) → $4 → $3 → $2.50; mobile MAU $4; vector/raster tiles $0.25; static tiles $0.50; static images $1; temp geocoding $0.75 (permanent $5, no free); directions/isochrone $2; Search Box sessions $3 preview / $11.50 standard; Address Autofill $12.50; optional support: Individual $50/mo, Business max(10% of spend, $500/mo)"
    }
  ],
  "first_quota_blown": "Mapbox: Search Box API sessions — only 500 free (preview) / 2,500 (standard); any app with a POI/address search box blows it at ~17-83 searches/day, then $3-$11.50/1K. Google: stack-dependent — search-heavy apps blow Places Text/Nearby Search Pro first (5,000 free, then $32/1K: 50K searches/mo ≈ $1,440); map-display apps blow Dynamic Maps first (10,000 free loads ≈ 333/day, then $7/1K, and every JS map re-init = 1 load). Reference shock: 20K geocodes/mo was $0 pre-March-2025, now $50.",
  "spend_cap": "Google: NO hard dollar cap; budgets/alerts are notify-only (\"Setting a budget does not automatically cap Google Cloud or Google Maps Platform usage or spending\"). Only hard stop = per-API request quotas (console.cloud.google.com/google/maps-apis/quotas) which cut service when hit — NOT set by default, defaults very high, must lower manually. A \"Project Spend Caps\" feature was announced at Next '26 but is preview/not default-on. Subscription plan limits do NOT block usage (overage bills PAYG). Mapbox: NO spend cap exists and none can be configured (official FAQ); no configurable alerts — one automatic email per product per billing period on first free-tier overage; only mitigations are rotating/deactivating access tokens or prepaid credit, and usage data lags ~24h.",
  "traps": [
    "Google field masks silently escalate the SKU: one Pro field (rating, openingHours) on a Place request jumps $5/1K → $17-32/1K; one Enterprise field → $35/1K. AI agents defaulting to 'all fields' hit the 1,000-free Enterprise bucket immediately",
    "Autocomplete without session tokens: every keystroke = 1 billable request at $2.83/1K after 10K free (5-10x multiplier on a search box)",
    "Re-instantiating the map on React re-render/remount/strict-mode double-init: each init = 1 billable map load on BOTH platforms (Google $7/1K after 10K; Mapbox $5/1K after 50K)",
    "Leaked/unrestricted keys: Google keys need HTTP-referrer + API restrictions (browser) or IP (server) — you pay for abuse; Mapbox default pk token CANNOT take URL restrictions (must create a new token; URL restrictions max 100 URLs, no wildcards, not for mobile SDKs)",
    "Mapbox Search Box vs Geocoding: 500-2,500 free sessions vs 100,000 free geocoding requests, and standard session price $11.50/1K vs $0.75/1K — 200x gap agents won't notice",
    "Mapbox Permanent Geocoding has no free tier: $5/1K from the first request (temporary is 100K free)",
    "Agent/batch loops (geocode-every-row, retry storms) burn Google's 10K free in one run; nothing stops them by default on either platform",
    "Bots/scrapers on a public map page count as real map loads; Mapbox usage dashboard lags ~24h so a runaway loop bills a full day before it is visible",
    "Google $300 trial credit masks real costs for the first weeks; Legacy Places/Directions APIs still bill with discounts capped at the 100K tier",
    "Enabling all Maps APIs on a project enlarges blast radius of a leaked key — enable only what is used"
  ],
  "usage_check": "Google: console.cloud.google.com/google/maps-apis/metrics (per-API usage), /google/maps-apis/quotas, /google/maps-apis/credentials, console.cloud.google.com/billing/reports (group by SKU), /billing/budgets. CLI: gcloud services list --enabled; gcloud billing accounts list; gcloud billing projects describe PROJECT_ID; gcloud billing budgets list; gcloud beta quotas info list; metrics via Monitoring API (serviceruntime.googleapis.com/api/request_count). Mapbox: console.mapbox.com/account/statistics/ (~24h lag) and console.mapbox.com/account/settings/billing/ (invoices); tokens at account.mapbox.com/access-tokens/. No official billing/usage CLI — mapbox/tilesets CLIs cover uploads only.",
  "keywords": [
    "gcloud",
    "maps.googleapis.com",
    "places.googleapis.com",
    "routes.googleapis.com",
    "googlemaps",
    "@googlemaps/js-api-loader",
    "@googlemaps/google-maps-services-js",
    "@react-google-maps/api",
    "@vis.gl/react-google-maps",
    "GOOGLE_MAPS_API_KEY",
    "gcloud services enable",
    "gcloud billing",
    "api-keys",
    "mapbox",
    "mapbox-gl",
    "react-map-gl",
    "@rnmapbox/maps",
    "api.mapbox.com",
    "MAPBOX_ACCESS_TOKEN",
    "pk.eyJ",
    "sk.eyJ",
    "tilesets"
  ],
  "hint": "GMaps per-SKU free 10K/5K/1K, NOT pooled; Search Pro $32/1K after 5K and field mask (not endpoint) picks the SKU. Mapbox 50K loads free but Search Box only 500-2,500 free sessions. #1 trap: unrestricted keys + map remounts. No hard $ cap on either; GMaps API quotas = only hard stop.",
  "conflicts": [
    "Mapbox Search Box sessions — A: 500 free then $3/2.75/2.50 per 1K; B: 500 preview / 2,500 standard free, standard up to $11.50/1K. RESOLVED via official mapbox.com/pricing (fetched 2026-07-17): both pricing tracks are listed — introductory preview: 500 free then $3.00/1K (501-100K); standard: 2,500 free then $11.50/1K (2,501-100K). A captured only the preview track; B was correct about the dual listing",
    "Google first-quota-blown — A: Places Text/Nearby Search Pro (5K free @ $32/1K); B: Dynamic Maps (10K free @ $7/1K). Judgment call, not a number conflict; merged as stack-dependent (search-heavy → Places Pro, map-display → Dynamic Maps)",
    "Google spend caps — B alone cites a 'Project Spend Caps' preview announced at Next '26; A says flatly no cap exists. Merged: no default/GA hard cap; treat the preview as not available for indie PAYG; quota limits remain the only hard stop",
    "B-only Mapbox items (Static Tiles 200K free @ $0.50/1K; Permanent Geocoding no free tier @ $5/1K; Address Autofill 1,000 free sessions @ $12.50/1K; Search Box requests 50K free @ $1/1K) — CONFIRMED against the official pricing page and kept",
    "All Google SKU prices and free quotas agree between A and B ($7/$5/$2.83/$32/$17/$35/$20/$0.60/$6 per 1K; 10K/5K/1K/100K free) — no tie-break needed; both cite developers.google.com pricing pages stamped 2026-07"
  ],
  "sources": [
    "https://developers.google.com/maps/billing-and-pricing/pricing",
    "https://developers.google.com/maps/billing-and-pricing/march-2025",
    "https://developers.google.com/maps/billing-and-pricing/faq",
    "https://developers.google.com/maps/billing-and-pricing/manage-costs",
    "https://developers.google.com/maps/billing-and-pricing/subscriptions",
    "https://developers.google.com/maps/billing-and-pricing/pricing-categories",
    "https://developers.google.com/maps/api-security-best-practices",
    "https://mapsplatform.google.com/pricing/",
    "https://cloud.google.com/billing/docs/how-to/budgets",
    "https://www.mapbox.com/pricing (fetched 2026-07-17 to break Search Box tie)",
    "https://docs.mapbox.com/accounts/guides/pricing/",
    "https://docs.mapbox.com/accounts/faq/can-i-set-up-a-cap-for-monthly-spending/",
    "https://docs.mapbox.com/accounts/guides/invoices/",
    "https://docs.mapbox.com/accounts/guides/tokens/",
    "https://docs.mapbox.com/accounts/guides/statistics/"
  ]
}
```

## Engine A — Claude (raw)

# Pricing/Quota Factsheet: Google Maps Platform + Mapbox

**Current as of 2026-07-17. Verified against official pricing/docs pages listed per section.**

---

## GOOGLE MAPS PLATFORM

### Recent change (effective March 1, 2025)
The pooled **$200/month credit was eliminated** and replaced by **per-SKU free monthly call quotas** grouped into three tiers: Essentials / Pro / Enterprise. Free usage **no longer pools across APIs** — each SKU has its own quota. Volume discounts expanded (auto-discounts now scale to 5M+ monthly events, up to ~80% off; previously started at 100K). Places API (old), Directions API, and Distance Matrix API were designated **Legacy** (no new features, cannot be newly enabled since March 1, 2025; discounts capped at the 100K tier). Google says total free usage across all products is worth up to ~$3,250/month if you use everything.
- https://developers.google.com/maps/billing-and-pricing/march-2025
- https://developers.google.com/maps/billing-and-pricing/faq
- https://mapsplatform.google.com/resources/blog/start-building-today-with-up-to-10-000-monthly-free-calls-per-product/

### 1. Metered billing dimensions
Billed per **billable event/request per SKU** (map load, tile request, API call, autocomplete request, route computed). Each SKU meters independently. New customers get a **$300 90-day trial credit** (all Google Cloud).
- https://developers.google.com/maps/billing-and-pricing/overview

### 2. Free tier — exact quotas (per SKU, per month, recurring)
- **Essentials-tier SKUs: 10,000 free calls/SKU/month** — Dynamic Maps, Static Maps, Static Street View, Geocoding, Autocomplete Requests, Place Details Essentials, Compute Routes Essentials, etc.
- **Pro-tier SKUs: 5,000 free calls/SKU/month** — Text Search Pro, Nearby Search Pro, Place Details Pro, Address Validation Pro, Compute Routes Pro, Dynamic Street View, Aerial View, Elevation, etc.
- **Enterprise-tier SKUs: 1,000 free calls/SKU/month** — Text/Nearby Search Enterprise, Place Details Enterprise, Photorealistic 3D Tiles, Compute Routes Enterprise, etc.
- **Exceptions:** Map Tiles API 2D Tiles and Street View Tiles: **100,000 free events/month**; Text Search (IDs Only): **unlimited free**.
- https://developers.google.com/maps/billing-and-pricing/pricing
- https://mapsplatform.google.com/pricing/

### 3. Paid pricing (pay-as-you-go, price per 1,000 calls at 0–100K volume, after free quota)
| SKU | Tier | Free/mo | $/1,000 |
|---|---|---|---|
| Dynamic Maps (JS map load) | Essentials | 10,000 | $7.00 |
| Static Maps | Essentials | 10,000 | $2.00 |
| Static Street View | Essentials | 10,000 | $7.00 |
| Map Tiles API 2D | Essentials | 100,000 | $0.60 |
| Map Tiles API Street View | Essentials | 100,000 | $2.00 |
| Geocoding | Essentials | 10,000 | $5.00 |
| Autocomplete Requests | Essentials | 10,000 | $2.83 |
| Place Details Essentials | Essentials | 10,000 | $5.00 |
| Compute Routes Essentials | Essentials | 10,000 | $5.00 |
| Compute Routes Pro (traffic-aware, waypoints) | Pro | 5,000 | $10.00 |
| Text Search Pro | Pro | 5,000 | $32.00 |
| Nearby Search Pro | Pro | 5,000 | $32.00 |
| Place Details Pro | Pro | 5,000 | $17.00 |
| Address Validation Pro | Pro | 5,000 | $17.00 |
| Dynamic Street View | Pro | 5,000 | $14.00 |
| Text/Nearby Search Enterprise | Enterprise | 1,000 | $35.00 |
| Place Details Enterprise | Enterprise | 1,000 | $20.00 |
| Photorealistic 3D Tiles | Enterprise | 1,000 | $6.00 |

Optional **subscription plans** (fixed monthly, pooled calls): Starter $100/mo (50K calls, Dynamic Maps + Geocoding), Essentials $275/mo (100K calls), Pro $1,200/mo (250K calls), Enterprise custom.
- https://developers.google.com/maps/billing-and-pricing/pricing
- https://mapsplatform.google.com/pricing/

### 4. First quota an indie app blows
- **Places Text Search Pro / Nearby Search Pro: only 5,000 free/mo at $32/1,000.** A "find restaurants near me" app doing ~170 searches/day exceeds it; 50K searches/mo ≈ **$1,440/mo**. This is the classic post-March-2025 shock because the old $200 credit covered ~11K searches pooled.
- Second: **Dynamic Maps 10,000 free loads** ($7/1K) — ~330 page views/day with a map exhausts it (each JS map init = 1 load).
- Note: 20,000 Geocoding calls/mo, which was $0 pre-March-2025 under the credit, now bills $50/mo (Google's own FAQ example).
- https://developers.google.com/maps/billing-and-pricing/faq

### 5. Cost traps for AI-agent-built apps
- **Autocomplete without sessions**: each keystroke = 1 billable request ($2.83/1K). Agents often skip session tokens; a search box can generate 5–10x the billable events.
- **Defaulting to Text Search Pro with full field masks**: requesting fields like `rating`/`openingHours` silently escalates the SKU from Essentials → Pro ($32/1K) → Enterprise ($35/1K). Field mask choice, not endpoint, determines the SKU.
- **Geocoding inside loops** (batch enrichment scripts, retry loops): 10K free evaporates in one run; no cap stops it.
- **Leaked/unrestricted browser API keys**: scraped keys get abused for Places calls; you pay. Restrict every browser key by **HTTP referrer** + **API restrictions** (limit key to only the APIs used) at https://console.cloud.google.com/apis/credentials; server keys by IP. Best practices: https://developers.google.com/maps/api-security-best-practices
- **Re-initializing the JS map on every state change** (common in agent-generated React) = 1 Dynamic Maps load each time.
- **$300 trial credit masks costs** for the first weeks, then billing starts silently.

### 6. Spend caps
- **No hard dollar spend cap exists.** Budgets/budget alerts are **notifications only**: "Setting a budget does not automatically cap Google Cloud or Google Maps Platform usage or spending."
- **Workaround (effective hard cap on volume, not dollars):** set per-API **quota limits** (requests/day) at https://console.cloud.google.com/project/_/google/maps-apis/quotas — when hit, "your service stops responding to requests." **Not set by default** (defaults are very high); must be lowered manually. Quota usage alerts can also be configured there.
- https://developers.google.com/maps/billing-and-pricing/manage-costs
- https://cloud.google.com/billing/docs/how-to/budgets

### 7. Check usage/spend
- Dashboard: https://console.cloud.google.com/google/maps-apis/metrics (per-API metrics), https://console.cloud.google.com/google/maps-apis/quotas (quotas), https://console.cloud.google.com/billing → Reports (group by SKU).
- CLI: `gcloud services list --enabled`, `gcloud billing accounts list`, `gcloud billing projects describe PROJECT_ID`, `gcloud alpha billing budgets list`; metrics via `gcloud monitoring` / Monitoring API (`serviceruntime.googleapis.com/api/request_count`).

### 8. Detection keywords (shell/CLI/deps)
`gcloud`, `gcloud services enable maps`, `googlemaps` (Python/npm client), `@googlemaps/js-api-loader`, `@googlemaps/google-maps-services-js`, `@react-google-maps/api`, `vis.gl/react-google-maps`, `maps.googleapis.com`, `places.googleapis.com`, `routes.googleapis.com`, `GOOGLE_MAPS_API_KEY`.

---

## MAPBOX

### 1. Metered billing dimensions
Pure pay-as-you-go per product: **map loads** (web, GL JS — one per Map object init, session up to 12h, includes unlimited vector/raster tile requests within the session), **monthly active users (MAU)** for mobile SDKs, **API requests** (tiles, static images, geocoding, directions, matrix, isochrone), **sessions** (Search Box). Credit card required at signup; billed monthly in arrears. No subscription plans.
- https://docs.mapbox.com/accounts/guides/pricing/
- https://docs.mapbox.com/mapbox-gl-js/guides/pricing/

### 2–3. Free tier + overage (from https://www.mapbox.com/pricing, verified 2026-07)
| Product | Free/month | Overage ($/1,000) |
|---|---|---|
| Map Loads (GL JS web) | **50,000** | $5.00 (50K–100K), $4.00 (100K–200K), $3.00 (200K–1M), $2.50 (1M–5M) |
| Mobile Maps SDK MAU | **25,000 MAU** | $4.00/1K MAU (25K–125K), $3.20, $2.40 |
| Vector Tiles API | **200,000 req** | $0.25 (to 2M), $0.20, $0.15 |
| Raster Tiles API | **750,000 req** | $0.25 (to 2M), $0.20, $0.15 |
| Static Images API | **50,000 req** | $1.00, $0.80, $0.60 |
| Geocoding (temporary) | **100,000 req** | $0.75, $0.60, $0.45 |
| Directions / Matrix / Isochrone / Map Matching / Optimization | **100,000 req each** | $2.00, $1.60, $1.20 |
| Search Box (sessions) | **500 sessions** | $3.00, $2.75, $2.50 |
| GL JS "Map Seats" | 3 seats | $4.00/seat |

### 4. First quota an indie app blows
- **Search Box API sessions: only 500 free/month** — any app with an address/POI search box blows this almost immediately (~17 searches/day), then $3/1K sessions. Smallest free tier by far.
- For map-only apps: **50,000 map loads** is generous, but each GL JS `new Map()` = 1 load — a React app that remounts the map per route change multiplies loads; a modest 2,000-visitor/day site with map remounts can exceed 50K → $5/1K.

### 5. Cost traps for AI-agent-built apps
- **Re-instantiating `mapboxgl.Map` on re-render** (agent-generated React without memoization): every remount = 1 billable map load.
- **Using Search Box instead of Geocoding API** by default: 500 free vs 100,000 free — a 200x difference agents won't notice.
- **Leaked public tokens (`pk.*`)** committed to repos: tokens are client-visible by design; without URL restrictions they work from anywhere. Add **URL restrictions** (token works only from listed domains, else 403) and minimal scopes at https://account.mapbox.com/access-tokens/; note URL restrictions **don't work for mobile SDKs** or wildcards. Rotate on suspicion. https://docs.mapbox.com/accounts/guides/tokens/
- **Bot/scraper traffic counts as real map loads** — no distinction, no cap.
- **Usage data lags ~24h** in the dashboard, so a runaway loop bills a full day before you can see it.

### 6. Spend caps
- **No spend cap exists, and none can be configured.** Official FAQ "Am I able to set a cap for monthly spending?": Mapbox does not support a spending cap or usage cutoff. Also **no configurable usage alerts** — only one automatic email the first time each product's free tier is exceeded per billing period. Official mitigation: monitor Statistics/invoices and **rotate (deactivate) access tokens** when the invoice hits your limit; optionally prepay credit.
- https://docs.mapbox.com/accounts/faq/can-i-set-up-a-cap-for-monthly-spending/
- https://docs.mapbox.com/accounts/guides/invoices/

### 7. Check usage/spend
- Dashboard: https://account.mapbox.com/ → Statistics (https://console.mapbox.com/account/statistics/, filterable by date, ~24h lag) and Invoices (https://console.mapbox.com/account/settings/billing/).
- No official usage/billing CLI or API; the Mapbox CLI (`mapbox`, mapboxcli) and Tilesets CLI cover uploads/tilesets only. https://docs.mapbox.com/accounts/guides/statistics/

### 8. Detection keywords (shell/CLI/deps)
`mapbox` (mapboxcli), `tilesets` (tilesets-cli), `mapbox-gl` / `mapbox-gl-js`, `react-map-gl`, `@rnmapbox/maps`, `api.mapbox.com`, `MAPBOX_ACCESS_TOKEN`, `pk.eyJ` / `sk.eyJ` (token prefixes in code).

---

## Bottom line on caps
| | Hard spend cap | On by default | Alerts |
|---|---|---|---|
| Google Maps Platform | No dollar cap; **per-API request quotas can act as a hard volume cap** (manual setup, cuts service when hit) | No (default quotas very high) | Budget + quota alerts (opt-in, notify only) |
| Mapbox | **None, not configurable at all** | N/A | One automatic email per product per billing period on first free-tier overage; nothing configurable |

Key sources: https://developers.google.com/maps/billing-and-pricing/pricing • https://developers.google.com/maps/billing-and-pricing/march-2025 • https://developers.google.com/maps/billing-and-pricing/faq • https://developers.google.com/maps/billing-and-pricing/manage-costs • https://mapsplatform.google.com/pricing/ • https://developers.google.com/maps/api-security-best-practices • https://www.mapbox.com/pricing • https://docs.mapbox.com/accounts/guides/pricing/ • https://docs.mapbox.com/accounts/faq/can-i-set-up-a-cap-for-monthly-spending/ • https://docs.mapbox.com/accounts/guides/invoices/ • https://docs.mapbox.com/accounts/guides/tokens/ • https://docs.mapbox.com/accounts/guides/statistics/

## Engine B — grok (raw)

/Users/aaronpang/.zshenv:.:19: no such file or directory: /tmp/codex-cargo/env
I'll pull current official pricing and quota pages for Google Maps/Places and Mapbox and build a July 2026 factsheet from those numbers.Pulling official pricing tables and quota/spend-cap docs next for exact SKU numbers.# Google Maps / Places + Mapbox — Pricing & Quota Factsheet  
**As of July 2026** (official pages last updated ~2026-07-10 UTC)

---

## Recent change (must know)

| Date | Change | Source |
|------|--------|--------|
| **2025-03-01** | Google Maps Platform **replaced the pooled $200/mo credit** with **per-SKU free monthly usage caps** (Essentials / Pro / Enterprise). Expanded automatic volume discounts to **5M+** events (Legacy APIs still stop at 100k+). Some services marked **Legacy**. | [March 2025 changes](https://developers.google.com/maps/billing-and-pricing/march-2025) · [Overview](https://developers.google.com/maps/billing-and-pricing/overview) |

There is **no** remaining “$200 free credit for everything” model for Maps Platform as of this factsheet.

---

# A. Google Maps Platform (Maps / Places / Geocoding)

## 1. Metered billing dimensions

| Dimension | Unit | Notes |
|-----------|------|--------|
| **SKU billable events** | Per request / map load / tile / session (SKU-specific) | Cost is **per 1,000 billable events** (CPM). Aggregated **per billing account** across projects for the calendar month. |
| **Price categories** | Essentials / Pro / Enterprise | Each SKU belongs to one category; free cap and base price differ. |
| **Volume tiers** | Monthly events after free cap | e.g. free → 100k → 500k → 1M → 5M → 5M+ |
| **Optional subscription** | Fixed monthly fee + combined call pool | Overage falls back to PAYG; **not** hard-blocked. |

Sources: [Pricing list](https://developers.google.com/maps/billing-and-pricing/pricing) · [Overview](https://developers.google.com/maps/billing-and-pricing/overview) · [SKU details](https://developers.google.com/maps/billing-and-pricing/sku-details)

**Typical billable units (indie-relevant):**
- **Dynamic Maps** → map loads (Maps JS)
- **Static Maps** → image requests  
- **Geocoding** → requests  
- **Places (New)** → Autocomplete requests/sessions, Place Details / Nearby / Text Search by SKU tier  
- **Map Tiles API** → tiles (2D free cap is higher: 100k)

---

## 2. Free tier — exact quotas (per SKU / month)

Free usage **resets 1st of each month, midnight Pacific**.  
**Not pooled** across SKUs — each SKU has its own free bucket.

| Category | Free billable events / month | Exception |
|----------|------------------------------|-----------|
| **Essentials** | **10,000** | Map Tiles API Essentials: **100,000** |
| **Pro** | **5,000** | — |
| **Enterprise** | **1,000** | — |
| Some SKUs | **Unlimited / $0** | Embed, Maps SDK, Street View Metadata, Place Details Essentials (IDs only), Text Search Essentials (IDs only), Autocomplete Session Usage (session wrapper; details still bill) |

India-eligible accounts get higher free caps (e.g. Essentials **70,000**, Map Tiles India **700,000**, Pro India **35,000**, Enterprise India **7,000**) — only if India pricing rules apply.

Sources: [Pricing categories](https://developers.google.com/maps/billing-and-pricing/pricing-categories) · [Pricing list](https://developers.google.com/maps/billing-and-pricing/pricing) · [March 2025](https://developers.google.com/maps/billing-and-pricing/march-2025)

### High-use SKUs — free cap + first paid tier (USD per 1,000)

| SKU | Free | Cap–100k (or first paid tier) |
|-----|------|-------------------------------|
| Dynamic Maps | 10,000 | **$7.00** |
| Static Maps | 10,000 | **$2.00** |
| Geocoding | 10,000 | **$5.00** |
| Geolocation | 10,000 | **$5.00** |
| Autocomplete Requests | 10,000 | **$2.83** |
| Place Details Essentials | 10,000 | **$5.00** |
| Place Details Pro | 5,000 | **$17.00** |
| Text Search Pro | 5,000 | **$32.00** |
| Nearby Search Pro | 5,000 | **$32.00** |
| Place Details Enterprise | 1,000 | **$20.00** |
| Text/Nearby Search Enterprise | 1,000 | **$35.00** |
| Map Tiles 2D | 100,000 | **$0.60** /1k |
| Photorealistic 3D Tiles | 1,000 | **$6.00** |

Full tier ladder (e.g. Geocoding after free: $5 → $4 → $3 → $1.50 → $0.38) is on the [official price list](https://developers.google.com/maps/billing-and-pricing/pricing).

---

## 3. Paid plans

### A) Pay-as-you-go (default)
- No fixed monthly fee for Maps itself (billing account required).
- After free caps: volume-discounted rates per SKU as above.
- Source: [Pricing](https://developers.google.com/maps/billing-and-pricing/pricing)

### B) Subscriptions (optional fixed fee)
From narrative examples on the official subscriptions page (summary tables on that page appear incomplete; examples are explicit):

| Plan | Monthly fee | Combined included usage (examples) |
|------|-------------|--------------------------------------|
| **Starter** | **$100** | **50,000** calls (Maps-focused SKUs in plan) |
| **Essentials** | **$275** | **100,000** calls |
| **Pro** | **$1,200** | **250,000** calls |

- SKUs **not** in the plan → still PAYG.  
- Over plan limit → **PAYG continues** (service not blocked).  
- Mid-month signup = prorated; usage before signup billed PAYG.

Source: [Subscriptions](https://developers.google.com/maps/billing-and-pricing/subscriptions)

---

## 4. What an indie app blows first (and at what usage)

**Typical web app stack:** Maps JS map + place autocomplete + occasional geocode.

| Rank | Meter | Free until | Rough real-world trigger |
|------|-------|------------|---------------------------|
| **1st (almost always)** | **Dynamic Maps** map loads | **10,000 / mo** | ~**333 map loads/day** · One page load ≈ 1 load if you init `google.maps.Map` once |
| **2nd** | **Autocomplete Requests** or **Geocoding** | **10,000** each | Autocomplete without sessions: each keystroke request can bill; Geocode on every form submit |
| **3rd** | **Place Details Pro / Text Search Pro** | **5,000** | Field masks pull Pro fields → $17–$32/1k after free |
| **Silent trap** | **Nearby/Text Search Enterprise** | **1,000** | AI agent default “search nearby with all fields” |

**Cost after free (order-of-magnitude):**  
- 20k Dynamic Maps loads/mo ≈ 10k free + 10k × $7/1k = **$70**  
- 20k Geocodes ≈ 10k free + 10k × $5/1k = **$50**  
- 10k Text Search Pro ≈ 5k free + 5k × $32/1k = **$160**

Source rates: [Pricing list](https://developers.google.com/maps/billing-and-pricing/pricing)

---

## 5. Cost traps (esp. AI-agent-built apps)

| Trap | Why it burns money |
|------|--------------------|
| **Unrestricted API keys** | You are **financially responsible** for abuse of unrestricted keys. | [Security guidance](https://developers.google.com/maps/api-security-best-practices) |
| **Key in client JS / GitHub** | Scrapers load maps/Places until the bill explodes |
| **No daily quota cap** | Budgets only **alert**; usage continues |
| **React strict mode / remount loops** | Double-init map → 2× Dynamic Maps loads |
| **Autocomplete per keystroke** without sessions | Autocomplete Requests SKU at $2.83/1k after 10k |
| **Over-broad field masks** | Highest SKU in the request wins (Essentials fields + Pro fields → Pro price) | [Manage costs](https://developers.google.com/maps/billing-and-pricing/manage-costs) |
| **Agent loops** | “Geocode every result” / “search nearby every tool call” with no cache |
| **Default enable all Maps APIs** | Unused APIs on project = larger blast radius if key leaks |
| **Legacy Places/Directions** | Still billable; thinner volume discounts if still on Legacy | [March 2025 Legacy](https://developers.google.com/maps/billing-and-pricing/march-2025) |
| **Bots / SEO scrapers** | Public map page → unlimited Dynamic Maps loads |

---

## 6. Spend caps — hard cap?

| Control | Hard cap? | Default? |
|---------|-----------|----------|
| **Cloud Billing budgets** | **No** — **alerts only** (email/Pub/Sub). Does **not** stop Maps usage. | Off until you create one |
| **API quotas (requests/day, etc.)** | **Yes (usage cap)** — service **stops responding** when hit | High/default platform quotas; **you must lower** them |
| **Subscription limit** | **No hard stop** — overage billed PAYG | N/A |
| **Project Spend Caps (Maps)** | Announced as coming / preview for Maps with other services (Next ’26); **not** a universal always-on default as of this research — treat as **not default-on** for indie PAYG | [GCP blog](https://cloud.google.com/blog/topics/cost-management/introducing-spend-caps-ai-cost-visibility-next26) |

Official Maps wording: *“Setting a budget does **not** automatically cap Google Cloud or Google Maps Platform usage or spending.”*  
→ **Hard control for indies = lower Quotas** (or automate disable-billing on budget Pub/Sub).

Sources: [Manage costs](https://developers.google.com/maps/billing-and-pricing/manage-costs) · [Cloud budgets](https://docs.cloud.google.com/billing/docs/how-to/budgets)

---

## 7. How to check usage / spend

| Method | URL / command |
|--------|----------------|
| Maps usage dashboard | `https://console.cloud.google.com/google/maps-apis/metrics` |
| Maps quotas | `https://console.cloud.google.com/google/maps-apis/quotas` |
| Maps credentials / keys | `https://console.cloud.google.com/google/maps-apis/credentials` |
| Billing reports | `https://console.cloud.google.com/billing/reports` |
| Budgets & alerts | `https://console.cloud.google.com/billing/budgets` |
| Subscription usage | `https://console.cloud.google.com/google/maps-apis/billing` |
| Pricing calculator | `https://mapsplatform.google.com/pricing/` |

**CLI keywords (Google):**  
`gcloud` · `billing` · `accounts` · `list` · `budgets` · `projects` · `link` · `quotas` · `info` · `preferences` · `services` · `list` · `enable` · `api-keys` · `create` · `list` · `update` · `beta`

Examples (names only pattern):  
`gcloud billing accounts list` · `gcloud billing budgets list` · `gcloud beta quotas info list` · `gcloud services list` · `gcloud services enable`

---

## 8. Client-side key restriction (Google)

**Required best practice** ([security guidance](https://developers.google.com/maps/api-security-best-practices)):

| App type | Application restriction | API restriction |
|----------|-------------------------|-----------------|
| Browser (Maps JS) | **HTTP referrers** (`https://yourdomain.com/*`) | Only Maps/Places APIs you use |
| Android | Package name + **SHA-1** | Same |
| iOS | **Bundle ID** | Same |
| Server web services | **IP / CIDR** | Same; never put server keys in clients |

Also: separate keys per app · disable unused APIs · optional **Firebase App Check** for Maps JS / Places · digital signatures for Static Maps.

---

# B. Mapbox

## 1. Metered billing dimensions

| Product | Meter | Unit |
|---------|-------|------|
| **Mapbox GL JS** | Map loads | 1 load = `new mapboxgl.Map()` init; **includes unlimited vector/raster tiles for that load** |
| **GL JS Seats** | Monthly active users (seats) | Alternative metering |
| **Maps SDK mobile** | MAUs | Monthly active users |
| **Vector / Static / Raster tiles** | Tile requests | Only if billed outside map-load product (standalone tile use) |
| **Static Images** | Requests | |
| **Temporary Geocoding** | Requests | |
| **Directions / Matrix / etc.** | Requests or matrix elements | |
| **Search Box** | Sessions or requests | Preview vs standard pricing tiers on page |

Source: [mapbox.com/pricing](https://www.mapbox.com/pricing)

---

## 2. Free tier — exact quotas (per billing period)

Free tier resets on the **account billing period** (typically calendar month; first month may be shortened).

| Product | Free amount |
|---------|-------------|
| **Map loads (GL JS)** | **50,000** loads |
| **Vector Tiles API** | **200,000** tile requests |
| **Static Tiles API** | **200,000** tile requests |
| **Raster Tiles API** | **750,000** tile requests |
| **Static Images** | **50,000** requests |
| **Maps SDK mobile** | **25,000** MAUs |
| **Temporary Geocoding** | **100,000** requests |
| **Directions / Map Matching / Optimization / Isochrone** | **100,000** requests each |
| **Matrix** | **100,000** elements |
| **Tilequery** | **100,000** requests |
| **Search Box sessions** | Preview free **500** / Standard free **2,500** (page lists both) |
| **Address Autofill** | **1,000** sessions |
| **Nav SDK metered** | **100** MAUs + **1,000** trips free |

Source: [mapbox.com/pricing](https://www.mapbox.com/pricing)

---

## 3. Paid plans / overage (no “Starter/Pro” product tiers for core maps)

**Model:** Pay-as-you-go after free tier + automatic volume discounts. Optional annual commitment discounts. Optional paid Support.

### Map loads (GL JS) overage — **$ per 1,000 loads**

| Monthly loads | Cost / 1k |
|---------------|-----------|
| 0 – 50,000 | **Free** |
| 50,001 – 100,000 | **$5.00** |
| 100,001 – 200,000 | **$4.00** |
| 200,001 – 1,000,000 | **$3.00** |
| 1,000,001 – 5,000,000 | **$2.50** |
| 5,000,000+ | Contact sales |

### Standalone tiles (if not covered by map loads)

| API | Free | First overage tier |
|-----|------|--------------------|
| Vector tiles | 200k | **$0.25** /1k (to 2M) |
| Static tiles | 200k | **$0.50** /1k |
| Raster tiles | 750k | **$0.25** /1k |

### Temporary Geocoding
- Free 100k · then **$0.75** /1k (to 500k), then $0.60, $0.45…

### Support (optional)
- Individual: **$50/mo** · Business: **10% of spend** (min **$500/mo**) or $6k/yr · Premium: contact

Source: [mapbox.com/pricing](https://www.mapbox.com/pricing)

---

## 4. What an indie app blows first

| Rank | Meter | Free until | Trigger |
|------|-------|------------|---------|
| **1st (web maps)** | **Map loads** | **50,000 / mo** | ~**1,667 loads/day** — each page visit that constructs a Map |
| **If using raw tiles / Leaflet without GL load product** | **Vector tiles** | **200,000** | Heavy pan/zoom can burn tiles; **~12 tiles/view → ~16k free views** (rule of thumb from older tile-only stacks) |
| **Search-heavy apps** | Temporary Geocoding | **100,000** | Still generous vs Google’s 10k |
| **Mobile** | Maps SDK MAUs | **25,000** | Active users with map, not raw requests |

**After free:** first 50k extra map loads ≈ 50 × $5 = **$250** (50k→100k band).

Mapbox free map-loads (**50k**) is **5×** Google’s Dynamic Maps free (**10k**) for a comparable “show a map” metric.

---

## 5. Cost traps (AI-agent apps)

| Trap | Detail |
|------|--------|
| **Default public token unrestricted** | Default `pk` token **cannot** take URL restrictions; create a **new** token | [Tokens](https://docs.mapbox.com/accounts/guides/tokens/) |
| **No URL restrictions** | Token works from any site → tile/load theft |
| **Secret `sk` token in frontend** | Account takeover / uploads / token management |
| **Remount Map on every React render** | Each init = 1 map load |
| **No spend cap** | Usage continues until card fails / deactivation |
| **Search Box “standard” rates** | Sessions can be **$11.50/1k** after free (much higher than Temporary Geocoding $0.75/1k) |
| **Permanent Geocoding** | **No free tier** in the published ladder ($5/1k from first request in listed tiers) |
| **Agent retry loops** on Directions/Geocode | Burns free 100k then $2/1k or $0.75/1k |

---

## 6. Spend caps — hard cap?

| Control | Hard cap? | Default |
|---------|-----------|---------|
| **Spending cap** | **Does not exist** | Official: *“Mapbox accounts do **not** support a spending cap”* |
| **Spending alerts** | Configurable mid-tier alerts **not offered** (only free-tier exceeded email once per period) | Email when free tier first exceeded |
| **Practical stop** | **Rotate/delete tokens** or **prepaid credit + monitor**; card decline → deactivation after retries | Manual |

Source: [Invoices & billing — Spending cap](https://docs.mapbox.com/accounts/guides/invoices/)

---

## 7. How to check usage / spend

| Method | URL |
|--------|-----|
| Statistics / usage | `https://console.mapbox.com/account/statistics/` |
| Invoices | `https://console.mapbox.com/account/invoices/` |
| Billing settings | `https://console.mapbox.com/account/settings/billing` |
| Access tokens | `https://console.mapbox.com/account/access-tokens/` |
| Pricing | `https://www.mapbox.com/pricing` |
| Tokens API | REST under `api.mapbox.com` (Tokens API) |

**CLI / shell keywords (Mapbox):**  
`mapbox` (Tilesets CLI) · `tilesets` · `list` · `publish` · curl against Tokens/Statistics APIs · no first-class `mapbox billing` CLI like `gcloud billing`

---

## 8. Client-side key restriction (Mapbox)

| Control | Behavior |
|---------|----------|
| **Public token (`pk.`)** | Client-safe; scopes: e.g. `styles:read`, `fonts:read`, `styles:tiles` |
| **URL restrictions** | Token only works from listed referrers; else **403**. Up to **100** URLs. **No wildcards, no IP.** Not for mobile SDKs. GL JS ≥ 0.53.1 |
| **Default public token** | Cannot add URL restrictions — **create a new token** |
| **Secret token (`sk.`)** | Server only; never ship to clients |

Sources: [Token management](https://docs.mapbox.com/accounts/guides/tokens/) · [Use Mapbox securely](https://docs.mapbox.com/help/dive-deeper/how-to-use-mapbox-securely/)

---

# Side-by-side (indie web map)

| | **Google Maps** | **Mapbox** |
|--|-----------------|------------|
| Free interactive map meter | **10,000** Dynamic Maps loads/mo | **50,000** map loads/mo |
| First overage (maps) | **$7 / 1k** loads | **$5 / 1k** loads |
| Free geocode | **10,000** @ then **$5/1k** | **100,000** temporary @ then **$0.75/1k** |
| Hard $ spend cap | **No** (budgets = alerts; **quotas** can hard-stop requests) | **No** (token rotation / prepaid only) |
| Client restriction | Referrer / Android / iOS / IP + API allowlist | URL restrictions + public scopes |
| Biggest AI-app landmine | Unrestricted key + Places Pro/Enterprise fields + map remounts | Default unrestricted `pk` token + remounts + Search Box session pricing |

---

## Shell-command keyword cheat sheet (detection only)

**Google Cloud / Maps**  
`gcloud` `billing` `accounts` `budgets` `projects` `link` `unlink` `quotas` `info` `preferences` `services` `enable` `disable` `list` `describe` `api-keys` `beta` `alpha` `logging` `monitoring`

**Mapbox**  
`mapbox` `tilesets` `list` `publish` `upload` (legacy) · Tokens/Statistics via HTTPS APIs (no dedicated spend CLI)

---

### Source index (numbers)

1. https://developers.google.com/maps/billing-and-pricing/pricing  
2. https://developers.google.com/maps/billing-and-pricing/overview  
3. https://developers.google.com/maps/billing-and-pricing/pricing-categories  
4. https://developers.google.com/maps/billing-and-pricing/march-2025  
5. https://developers.google.com/maps/billing-and-pricing/manage-costs  
6. https://developers.google.com/maps/billing-and-pricing/subscriptions  
7. https://developers.google.com/maps/api-security-best-practices  
8. https://www.mapbox.com/pricing  
9. https://docs.mapbox.com/accounts/guides/invoices/  
10. https://docs.mapbox.com/accounts/guides/tokens/  

**Verify before production spend:** open the live price tables above — Google’s global list was last stamped **2026-07-10 UTC**; Mapbox pricing is live on mapbox.com/pricing.
