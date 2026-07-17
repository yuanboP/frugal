# Research archive (round 2): gpu

Raw dual-engine research (2026-07-17). Engine A = Claude web search; Engine B = grok CLI. Merged factsheet cross-checks both.

## Merged factsheet

```json
{
  "provider": "RunPod + Modal + Vast.ai (GPU clouds, merged factsheet, verified 2026-07-17)",
  "billing_dimensions": [
    "RunPod: pod GPU per-second while Running; serverless per-second from worker start to full stop (init + exec + idle timeout, rounded UP to nearest sec); container disk $0.10/GB/mo; volume disk $0.10/GB/mo running, $0.20/GB/mo stopped (2x); network volume $0.07/GB/mo <1TB, $0.05/GB/mo >1TB, high-perf $0.14/GB/mo [VERIFIED runpod.io/pricing]. $0 egress claimed by Report B only — not shown on pricing page fetch, treat as unverified",
    "Modal: GPU per-second (no minimum increment); CPU $0.0000131/physical-core-sec (min 0.125 cores); memory $0.00000222/GiB-sec; Sandboxes/Notebooks ~3x: CPU $0.00003942/core-sec, mem $0.00000667/GiB-sec; Volumes $0.09/GiB/mo (first 1 TiB/mo free); region selection 1.5-1.75x multiplier; non-preemptible 3x multiplier [ALL VERIFIED modal.com/pricing]. Default scale-to-zero = no idle charge unless warm capacity requested",
    "Vast.ai: GPU per-second while active/connected; storage per GB-hour in ALL states except host-offline (stopped != free, verbatim: 'Stopping an instance does not avoid storage costs'); bandwidth per byte sent OR received regardless of state [ALL VERIFIED docs.vast.ai/billing]. No static price list — marketplace, host-set rates"
  ],
  "free_tier": "Modal Starter: $0/mo + $30/month recurring free compute credits; payment method REQUIRED (verified on pricing page — Report A's \"no card\" scenario is wrong); limits: 100 concurrent containers, 10 concurrent GPUs, 3 seats, 200 deployed apps, 5 cron jobs, 1-day log retention. RunPod: NONE — prepaid credit model, no free credits on pricing page (referral promos and startup program exist but are not a free tier). Vast.ai: NONE — prepaid; $5 minimum deposit cited by both reports but NOT confirmed in official billing docs.",
  "plans": [
    {
      "name": "RunPod Pods on-demand (Secure/Community, per GPU-hr)",
      "price": "prepaid balance, per-second billing",
      "included": "Secure: RTX4090 $0.69 | RTX3090 $0.46 | L4 $0.39 | A40 $0.44 | L40S $0.99 | RTX6000Ada $0.77 | A100 PCIe $1.39 / SXM $1.49 | H100 PCIe $2.89 / SXM $2.99 / NVL $3.19 | H200 $4.39 | B200 $5.89 | B300 $7.39. Community: RTX4090 $0.34 | A100 PCIe $1.19 / SXM $1.39 | H100 PCIe $1.99 / SXM $2.69 / NVL $2.59 | H200 $3.59 | B200 $5.89 | B300 $6.94 (all verified 2026-07-17)",
      "overage": "n/a (prepaid); storage billed separately; savings plans 3/6-mo prepaid non-refundable"
    },
    {
      "name": "RunPod Serverless flex (per hr display, billed per-sec)",
      "price": "usage only",
      "included": "H200 $5.93 | H100 $4.55 | A100 $2.72 | L40S $1.75 | RTX4090 $1.10 | L4 $0.69 (verified); active/always-on workers discounted via sales",
      "overage": "idle-timeout time (default 5s) is billed; no default execution timeout"
    },
    {
      "name": "Modal Starter",
      "price": "$0/mo (card required)",
      "included": "$30/mo credits, 100 containers, 10 GPUs, 3 seats, 200 apps, 5 crons, 1-day logs",
      "overage": "usage rates: T4 $0.000164/s (~$0.59/hr) | L4 $0.000222 (~$0.80) | A10 $0.000306 (~$1.10) | A100-40 $0.000583 (~$2.10) | A100-80 $0.000694 (~$2.50) | L40S $0.000542 (~$1.95) | H100 $0.001097 (~$3.95) | H200 $0.001261 (~$4.54) | B200 $0.001736 (~$6.25) | B300 $0.001972 (~$7.10) — all verified; no RTX 4090 on Modal"
    },
    {
      "name": "Modal Team",
      "price": "$250/mo + usage",
      "included": "$100/mo credits, 1,000 containers, 50 GPUs, unlimited seats, 30-day logs, modal billing CLI/API",
      "overage": "same unit rates"
    },
    {
      "name": "Modal Enterprise",
      "price": "custom",
      "included": "custom limits, SSO/HIPAA",
      "overage": "custom"
    },
    {
      "name": "Vast.ai marketplace (no plans)",
      "price": "host-set, per-second; prepaid balance",
      "included": "On-Demand (full-price, guaranteed) | Interruptible (~50%+ cheaper, preemptible bid) | Reserved (up to ~50% off, 1/3/6-mo commit). NO official static rates — reports' H100 figures ($0.90-1.90 vs ~$2/hr) are third-party indicative only; live truth = vastai search offers / vast.ai/pricing grid",
      "overage": "storage $/GB/hr in every state until destroy; bandwidth $/TB both directions"
    }
  ],
  "first_quota_blown": "Modal: the $30 Starter credit via warm pools — one min_containers=1 H100 (~$3.95/hr) kills it in ~7.6h (A100-80GB ~12h), then the card bills ~$1,800-2,844/mo; 10-GPU concurrency sometimes hits first on agent fan-out. RunPod: prepaid balance via a forgotten pod (H100 SXM $2.99/hr ≈ $72/day, RTX4090 ≈ $16.56/day); sneaky #2 = stopped-pod volume disk at 2x ($0.20/GB/mo → 500GB stopped = $100/mo); pods need >=1hr of credit to launch and stop near $0 balance (terminated + data loss if no network volume). Vast: balance drained by GPU-sec, then silently by storage on stopped-not-destroyed instances until $0 → grace period → instance deletion (data loss).",
  "spend_cap": "RunPod: de facto HARD cap via prepaid balance (pods stop/terminate at $0) + default $80/hour spend-rate limit across all resources; auto-pay top-up (opt-in) removes the hard cap. Modal: real budgets exist — Workspace monthly budget is documented as \"the hard outer cap\", Environment budgets (alpha) nest under it — but they are OFF until an Owner/Manager sets them under Usage & Billing (docs verified; enforcement wording is thin); card is required on Starter so credits alone are not a hard stop. Vast.ai: no budget feature at all — prepaid balance is the only hard stop (grace period may go negative), low-balance email alerts recommended at ~75% of top-up threshold; enabling autobilling (\"credit card will be periodically and automatically charged\") removes the hard stop.",
  "traps": [
    "Idle compute is trap #1 on all three: RunPod pods have NO auto-stop/TTL (DIY: nohup sleep 2h; runpodctl stop pod $RUNPOD_POD_ID); Modal min_containers/keep_warm/buffer_containers/long scaledown_window (2s-20min) bill 24/7 despite 'never pay for idle' branding; Vast running instances bill until stopped",
    "Stopped != free: RunPod stopped pods bill volume disk at 2x running rate ($0.20/GB/mo); Vast stopped instances bill storage per GB-hour forever — only destroy ends charges (verified verbatim in docs)",
    "Modal card required on Starter: exhausting $30 credit does NOT halt compute — it bills the card. Budgets are opt-in; set a Workspace budget immediately",
    "Auto-top-up converts prepaid hard caps into unbounded spend on both RunPod (auto-pay) and Vast (autobilling) — leaked API key + auto-top-up = open-ended bill (RunPod default rate limit $80/hr ≈ $1,900/day ceiling)",
    "RunPod serverless: idle timeout (default 5s) is billed per request burst; no default execution timeout — docs say set one to prevent runaway jobs; agent loops keep flex workers alive at up to $4.55/hr each x max_workers",
    "modal deploy persists forever until modal app stop; cron functions and .map() fan-out multiply GPU cost; Sandboxes bill ~3x CPU/mem; region pinning 1.5-1.75x, non-preemptible 3x",
    "Vast bandwidth billed per byte both directions in every state — dataset/checkpoint sync loops surprise-bill; interruptible instances outbid to 'inactive' still bill storage",
    "Marketplace numbers rot in days: never trust a written-down Vast price; re-query vastai search offers"
  ],
  "usage_check": "RunPod: runpodctl pod list (and pod list --all for stopped-but-storing), runpodctl billing; console.runpod.io/user/billing; serverless endpoints only visible in console; GraphQL api.runpod.io/graphql. Modal: modal app list + modal container list (then modal app stop <id>); modal billing CLI / modal.billing API (Team+ only); dashboard modal.com/settings -> Usage & Billing. Vast: vastai show instances (ANY listed row, even stopped, is accruing storage — must be destroyed), vastai show user (balance), vastai show invoices; cloud.vast.ai/billing/. Zero-burn assertion: runpodctl pod list empty + modal app/container list empty + vastai show instances empty.",
  "keywords": [
    "runpodctl",
    "runpodctl pod list",
    "runpodctl pod stop",
    "runpodctl pod delete",
    "runpodctl billing",
    "RUNPOD_API_KEY",
    "RUNPOD_POD_ID",
    "runpod (python SDK)",
    "modal",
    "modal deploy",
    "modal run",
    "modal serve",
    "modal app list",
    "modal app stop",
    "modal container list",
    "modal billing",
    "min_containers",
    "keep_warm",
    "buffer_containers",
    "scaledown_window",
    "modal.Sandbox",
    "MODAL_TOKEN_ID",
    "MODAL_TOKEN_SECRET",
    "vastai",
    "vastai search offers",
    "vastai create instance",
    "vastai show instances",
    "vastai stop instance",
    "vastai destroy instance",
    "vastai show user",
    "VAST_API_KEY",
    "CONTAINER_API_KEY"
  ],
  "hint": "Modal $30/mo free (card req), 10-GPU cap, budgets OFF by default. RunPod/Vast prepaid=hard cap until auto-top-up; RunPod +$80/hr rate limit. #1 trap: idle bills (min_containers, stopped disk 2x, Vast stop≠destroy). Check: modal app list|runpodctl pod list|vastai show instances",
  "conflicts": [
    "Modal Starter card requirement: Report A claimed no-card credit exhaustion = hard stop; Report B said payment method required. RESOLVED for B — modal.com/pricing verified 'Payment method: Required', so Starter overage bills the card",
    "Modal budget semantics: B's 'hard outer cap' wording CONFIRMED verbatim in modal.com/docs/guide/budgets; both reports correct that budgets are unset/off until configured; docs do not spell out enforcement action at limit",
    "Modal Starter extras (200 apps, 5 crons, 1-day logs) in B only: CONFIRMED on official pricing page — A was incomplete, not wrong",
    "Modal region 1.5-1.75x and non-preemptible 3x multipliers (B only) and Sandbox ~3x rates (A only): BOTH confirmed on pricing page — complementary omissions",
    "RunPod Community rates (B only: 4090 $0.34, H100 PCIe $1.99, SXM $2.69, NVL $2.59) and H200 $4.39 / B200 $5.89 / B300 $7.39 (A only): ALL confirmed on runpod.io/pricing; also verified Community H200 $3.59, B200 $5.89 (same as Secure), B300 $6.94. Oddity: page shows L4 Community $0.44 > Secure $0.39",
    "RunPod $0 egress (B only): NOT shown on the pricing page fetch — left unverified, do not rely on it",
    "RunPod min deposit ~$10 and referral $5-500 promos (B only): plausible from billing docs but not re-verified; A's core claim 'no free tier' confirmed (pricing page lists no free credits)",
    "Vast H100 rate: A ~$0.90-1.90/hr vs B ~$2/hr — UNRESOLVABLE by design: marketplace has no official static prices; both figures are third-party indicative; only vastai search offers / live grid is authoritative",
    "Vast $5 minimum deposit (both reports): NOT found in official docs.vast.ai/billing — treat as unofficial",
    "Vast stop!=free, per-byte bandwidth in all states, autobilling removing the hard stop, low-balance alerts (~75% threshold): all CONFIRMED verbatim against docs.vast.ai/billing"
  ],
  "sources": [
    "https://www.runpod.io/pricing (fetched 2026-07-17, Secure+Community+serverless+storage verified)",
    "https://docs.runpod.io/pods/pricing",
    "https://docs.runpod.io/serverless/pricing",
    "https://docs.runpod.io/accounts-billing/billing",
    "https://modal.com/pricing (fetched 2026-07-17, plans+GPU rates+multipliers+sandbox rates verified)",
    "https://modal.com/docs/guide/budgets (fetched 2026-07-17, 'hard outer cap' verified)",
    "https://modal.com/docs/guide/billing",
    "https://modal.com/docs/guide/cold-start",
    "https://docs.vast.ai/billing (fetched 2026-07-17, stop/storage/bandwidth/autobilling verified)",
    "https://vast.ai/pricing (live marketplace grid — only authoritative Vast price source)",
    "https://docs.vast.ai/cli/commands",
    "Indicative-only (not authoritative): gpus.io, computeprices.com Vast snapshots"
  ]
}
```

## Engine A — Claude (raw)

GPU CLOUD PRICING/QUOTA FACTSHEET — RunPod / Modal / Vast.ai
Current as of 2026-07-17. All numbers verified against official pricing/docs pages on this date unless marked otherwise.

=====================================================
RUNPOD
=====================================================

1. METERED BILLING DIMENSIONS
- Pod GPU compute: per-second billing while pod is Running (https://docs.runpod.io/pods/pricing)
- Serverless workers: per-second, "billed from when a worker starts until it fully stops, rounded up to the nearest second" — includes container init, request processing, AND idle-timeout time (https://docs.runpod.io/serverless/pricing)
- Storage: container disk $0.10/GB/mo; volume disk $0.10/GB/mo running, $0.20/GB/mo while pod is STOPPED; network volume $0.07/GB/mo (<1TB) or $0.05/GB/mo (>1TB), billed hourly; high-performance network storage $0.14/GB/mo (https://www.runpod.io/pricing, https://docs.runpod.io/pods/pricing)

2. FREE TIER
- NONE. No free credits, no free tier. Prepaid credit balance required (https://www.runpod.io/pricing — no free credits listed; https://docs.runpod.io/pods/pricing).

3. PAID PLANS / PRICES (Secure Cloud, on-demand pods, per GPU-hour)
- H100 SXM $2.99 | H100 PCIe $2.89 | H100 NVL $3.19
- A100 SXM $1.49 | A100 PCIe $1.39
- RTX 4090 $0.69 | RTX 3090 $0.46 | L40S $0.99 | L4 $0.39 | A40 $0.44 | RTX 6000 Ada $0.77
- High end: H200 $4.39, B200 $5.89, B300 $7.39
- Serverless (flex): H200 $5.93/hr, H100 $4.55/hr, A100 $2.72/hr, L40S $1.75/hr, RTX 4090 $1.10/hr, L4 $0.69/hr (active/always-on workers get discounted rates via sales)
- Savings plans: 3 or 6 months upfront, discounted, NON-REFUNDABLE with fixed expiry
Source: https://www.runpod.io/pricing, https://docs.runpod.io/pods/pricing, https://docs.runpod.io/serverless/pricing

4. FIRST METER AN INDIE DEV BLOWS
- The GPU-hour meter on a pod left running: a forgotten RTX 4090 pod = $16.56/day; an H100 SXM = $71.76/day (~$500/week). Second most common: volume-disk storage on STOPPED pods — 500 GB stopped = $100/mo at the $0.20/GB/mo idle rate. "Stopped" is not "free."

5. COST TRAPS FOR AI-AGENT-BUILT APPS
- Pods have NO built-in idle auto-stop or TTL. An exited container still bills until you stop the pod. Official workaround is a manual timer: `bash -c "nohup sleep 2h; runpodctl stop pod $RUNPOD_POD_ID" &` (https://www.runpod.io/blog and https://docs.runpod.io/pods/manage-pods)
- Serverless: idle timeout (default 5 s) is billed time; no default execution timeout — docs explicitly warn to set execution timeouts to "prevent runaway jobs" (https://docs.runpod.io/serverless/pricing). An agent loop hammering an endpoint keeps flex workers alive at up to $4.55/hr each, multiplied by max-worker count.
- Leaked API key = attacker can spin pods up to your $80/hour default spend rate limit (~$1,900/day).
- Stopped pods still bill disk at DOUBLE the running volume rate ($0.20/GB/mo).

6. SPEND CAPS
- Effectively a HARD cap via prepaid model: pods auto-stop when balance hits $0 (pods without network volumes are TERMINATED with unrecoverable data loss; also pods stop when ~10 min of runtime remains at your balance). (https://docs.runpod.io/pods/pricing)
- Default spend RATE limit: $80/hour across all resources (changeable via support). (https://docs.runpod.io/serverless/pricing)
- BUT: auto-pay/auto-top-up, if enabled, removes the hard cap — it keeps refilling the balance.

7. CHECK USAGE/SPEND
- CLI: `runpodctl billing` (billing history), `runpodctl user` / `runpodctl me` (account), `runpodctl pod list` (https://docs.runpod.io/runpodctl/reference/runpodctl)
- Dashboard: https://console.runpod.io/user/billing
- API: GraphQL at https://api.runpod.io/graphql

8. DETECTION KEYWORDS (shell)
- `runpodctl`, `runpodctl pod list`, `runpodctl pod stop`, `runpodctl pod delete`, `runpodctl billing`, `runpodctl user`; env var `RUNPOD_POD_ID`, `RUNPOD_API_KEY`; python `runpod` SDK
- Verify nothing running: `runpodctl pod list` (kill with `runpodctl pod stop <id>` then `runpodctl pod delete <id>` — stop alone still bills disk); check serverless endpoints in console.

=====================================================
MODAL
=====================================================

1. METERED BILLING DIMENSIONS (all per-second, no minimum increments)
- GPU: per GPU-second while a container holds the GPU
- CPU: $0.0000131 per physical core/sec (min 0.125 cores/container); Memory: $0.00000222 per GiB/sec
- Sandboxes/Notebooks bill higher: $0.00003942/core/sec, $0.00000667/GiB/sec
- Volumes: $0.09/GiB/mo (first 1 TiB free)
Source: https://modal.com/pricing, https://modal.com/docs/guide/billing

2. FREE TIER — EXACT QUOTAS
- Starter plan: $0/mo, $30/month in free compute credits (recurring monthly), limits of 100 concurrent containers and 10 concurrent GPUs, 3 workspace seats. (https://modal.com/pricing)

3. PAID PLANS
- Starter: $0/mo + usage beyond $30 monthly credit
- Team: $250/mo, includes $100/mo credits, 1,000 containers, 50 concurrent GPUs, unlimited seats
- Enterprise: custom
- GPU unit prices (per second → per hour): B300 $0.001972 (~$7.10/hr), B200 $0.001736 (~$6.25/hr), H200 $0.001261 (~$4.54/hr), H100 $0.001097 (~$3.95/hr), A100-80GB $0.000694 (~$2.50/hr), A100-40GB $0.000583 (~$2.10/hr), L40S $0.000542 (~$1.95/hr), L4 $0.000222 (~$0.80/hr), T4 $0.000164 (~$0.59/hr)
Source: https://modal.com/pricing

4. FIRST METER AN INDIE DEV BLOWS
- The $30 Starter credit, via GPU-seconds from warm pools: ONE `min_containers=1` on an A100-80GB burns the entire $30 monthly credit in ~12 hours (~$2.50/hr) and then bills the card ~$1,800/mo if left. Even a T4 kept warm 24/7 is ~$425/mo.

5. COST TRAPS FOR AI-AGENT-BUILT APPS
- `min_containers` (ex-keep_warm): containers never scale to zero and "you will be billed for any resources used while the container is idle (e.g., GPU reservation or residual memory occupancy)" (https://modal.com/docs/guide/cold-start). Agents add this to "fix cold starts" and create a 24/7 GPU bill.
- `scaledown_window`: default 60 s, configurable 2 s–20 min — setting it to 20 min means every burst pays up to 20 min of idle GPU tail. `buffer_containers` similarly bills extra warm capacity. (https://modal.com/docs/guide/cold-start)
- `modal deploy` leaves apps deployed forever (deployed apps + warm pools persist until `modal app stop`).
- Sandboxes bill ~3x normal CPU/mem rates — agent frameworks that spawn Modal Sandboxes per task multiply cost.
- Leaked token: attacker limited by 10-GPU concurrency on Starter, but that's still ~$950/day on 10 H100s.

6. SPEND CAPS
- YES, real caps exist but are OFF by default: Workspace-level monthly spend budget and Environment-level compute budgets ("a monthly cap for total Workspace spend"), configurable by Owners/Managers under Usage & Billing. Environment budget cannot exceed workspace cap. (https://modal.com/docs/guide/budgets)
- On Starter with no card, exhausting credits blocks further compute — de facto hard cap.

7. CHECK USAGE/SPEND
- CLI: `modal billing` (tabular spend reports); `modal app list` (running/deployed apps), `modal app stop <app>`, `modal container list` / `modal container stop`
- API: `modal.billing` module (programmatic export, Team/Enterprise only)
- Dashboard: https://modal.com/settings → Usage & Billing
Source: https://modal.com/docs/guide/billing, https://modal.com/docs/reference/cli/app

8. DETECTION KEYWORDS (shell)
- `modal`, `modal deploy`, `modal run`, `modal serve`, `modal app list`, `modal app stop`, `modal container list`, `modal billing`, `modal token`; code markers: `min_containers`, `keep_warm`, `scaledown_window`, `buffer_containers`, `modal.Sandbox`
- Verify nothing running: `modal app list` (stop everything deployed: `modal app stop <id>`), then `modal container list` to confirm no live containers.

=====================================================
VAST.AI
=====================================================

1. METERED BILLING DIMENSIONS
- GPU rental: per-second, "charged the base active rental cost for every second your instance is in the active/connected state" (https://docs.vast.ai/billing)
- Storage: per GB per hour, billed in ALL instance states except host-offline — "stopping an instance does not avoid storage costs; stopped instances continue to accrue storage charges" (https://docs.vast.ai/billing)
- Bandwidth: per TB, charged "for every byte sent or received... regardless of what state it is in" (https://docs.vast.ai/billing)

2. FREE TIER
- NONE documented. Prepaid credits required for all rentals; reviews cite a $5 minimum deposit to start. No trial credits in official docs. (https://docs.vast.ai/billing)

3. PAID PLANS / PRICES
- No plans; it's a MARKETPLACE — "prices are set by the market, not by Vast" and fluctuate continuously. Three modes: On-Demand (full uptime), Interruptible ("50%+ cheaper", preemptible bid pricing), Reserved (up to 50% off, 1/3/6-month commitment). (https://vast.ai/pricing)
- Typical July-2026 market ranges (live listings only source of truth at https://vast.ai/pricing / https://cloud.vast.ai): H100 from ~$0.90/hr advertised (unverified hosts) to ~$1.50–1.90/hr on verified datacenter hosts; A100 80GB from ~$1.09/hr; RTX 4090 ~$0.16–0.59/hr. Expect 30–50% swings with demand. (marketplace ranges: https://vast.ai/pricing, third-party trackers https://gpus.io/en/providers/vast-ai, https://computeprices.com/providers/vast — treat as indicative)

4. FIRST METER AN INDIE DEV BLOWS
- Prepaid credit balance drained by GPU-seconds on a forgotten instance (H100 ~$40/day), then — the sneaky one — STORAGE on stopped instances: 200 GB allocated and "paused for the weekend" still bills disk hourly, silently draining the balance to $0, after which instances are stopped and eventually DELETED (data loss).

5. COST TRAPS FOR AI-AGENT-BUILT APPS
- "Stop" ≠ free: storage bills per GB-hour in stopped state; only `destroy` ends charges. No native idle auto-stop/TTL — self-destruct pattern is calling `vastai destroy instance $CONTAINER_ID`/API from inside the instance or a timer.
- Bandwidth billed in every state — an agent syncing datasets/checkpoints in a loop pays per byte both directions.
- Interruptible instances that get outbid go to "inactive" but STILL bill storage.
- Auto-top-up ("autobilling") keeps charging the card to keep balance positive — converts prepaid safety into unbounded spend. (https://docs.vast.ai/billing)
- Leaked key on an account with auto-top-up = open-ended marketplace rentals.

6. SPEND CAPS
- No explicit spend-limit feature. Prepaid balance is the de facto HARD cap: instances stop when balance hits $0 (with grace periods based on historical spend), then get deleted. Low-balance EMAIL alerts exist. Enabling auto-top-up removes the hard cap. (https://docs.vast.ai/billing)

7. CHECK USAGE/SPEND
- CLI: `vastai show user` (returns user ID, email, BALANCE, SSH key); `vastai show instances` (all running); `vastai show invoices` for billing history
- Dashboard: https://cloud.vast.ai/billing/ (credits panel updates every few seconds)
Source: https://docs.vast.ai/billing, https://docs.vast.ai/cli/commands

8. DETECTION KEYWORDS (shell)
- `vastai`, `vast` (pypi `vastai` CLI), `vastai show instances`, `vastai show user`, `vastai create instance`, `vastai stop instance`, `vastai destroy instance`, `vastai search offers`; env `VAST_API_KEY`, `CONTAINER_API_KEY`
- Verify nothing running/billing: `vastai show instances` — anything listed (even "stopped"/"inactive") is still accruing STORAGE; `vastai destroy instance <id>` to fully end charges; `vastai show user` to confirm balance stops draining.

=====================================================
CROSS-SERVICE SUMMARY
=====================================================
- Granularity: all three bill per-second (RunPod serverless rounds up to nearest second; RunPod network volumes bill hourly; Vast storage is per-GB-hour).
- Idle billing: Modal is the only one that never bills scaled-to-zero compute — UNLESS min_containers/buffer_containers pin warm containers (billed). RunPod and Vast both bill storage on stopped instances (RunPod at 2x the running volume rate).
- Hard caps: RunPod and Vast = prepaid balance (hard until auto-pay/auto-top-up is enabled, which unravels it); RunPod adds an $80/hr default rate limit. Modal = opt-in workspace/environment monthly budgets, off by default; Starter credit exhaustion halts compute if no card.
- Free credits: Modal $30/mo recurring (Starter). RunPod: none. Vast: none.
- "Is anything still running?" one-liners: `runpodctl pod list` | `modal app list && modal container list` | `vastai show instances`

Sources: https://www.runpod.io/pricing | https://docs.runpod.io/pods/pricing | https://docs.runpod.io/serverless/pricing | https://docs.runpod.io/pods/manage-pods | https://docs.runpod.io/runpodctl/reference/runpodctl | https://modal.com/pricing | https://modal.com/docs/guide/billing | https://modal.com/docs/guide/budgets | https://modal.com/docs/guide/cold-start | https://modal.com/docs/reference/cli/app | https://vast.ai/pricing | https://docs.vast.ai/billing | https://docs.vast.ai/cli/commands | indicative Vast market rates: https://gpus.io/en/providers/vast-ai, https://computeprices.com/providers/vast, https://gpuhosted.com/en/vast-ai-review/

## Engine B — grok (raw)

I'll pull official pricing and billing docs for RunPod, Modal, and Vast.ai and assemble a July 2026 factsheet from those sources.Fetching official pricing and billing pages for exact numbers and CLI details.# GPU cloud pricing/quota factsheet  
**Service group:** RunPod · Modal · Vast.ai  
**As of:** 2026-07-17 (verified against official pricing/docs pages)

---

## At-a-glance GPU rates (indie-relevant)

| GPU | RunPod Pods (Secure / Community) | Modal (always per-sec) | Vast.ai (marketplace) |
|-----|----------------------------------|------------------------|------------------------|
| **RTX 4090** | **$0.69 / $0.34** /hr | *Not listed on Modal pricing* | **Live host-set** (often ~$0.3–0.6/hr; verify search) |
| **A100 80GB** | **$1.39 PCIe / $1.49 SXM** Secure; Community **$1.19 / $1.39** | **$0.000694/s ≈ $2.50/hr** | Live host-set (ref listings ~$1–2/hr) |
| **H100** | **$2.89 PCIe / $2.99 SXM** Secure; Community **$1.99 / $2.69** | **$0.001097/s ≈ $3.95/hr** | Live host-set (ref ~$2/hr on-demand) |

Sources: [runpod.io/pricing](https://www.runpod.io/pricing) (schema.org + page rates), [modal.com/pricing](https://modal.com/pricing), [vast.ai/pricing](https://vast.ai/pricing) + [docs.vast.ai pricing](https://docs.vast.ai/guides/instances/pricing).

**Granularity:** All three claim **per-second** compute billing (no full-hour rounding for active GPU time).

---

# 1. RunPod

### 1) Metered billing dimensions
| Meter | Unit | Notes |
|-------|------|--------|
| Pod GPU compute | $/sec while running | On-demand or savings plans |
| Serverless GPU workers | $/sec while worker runs | Flex (scale-to-0) + Active (always-on, sales discount) |
| Container disk | ~$0.10/GB/mo | Running only; cleared on stop |
| Volume disk | $0.10/GB/mo running; **$0.20/GB/mo stopped** | Persists until pod deleted |
| Network volume | $0.07/GB/mo (&lt;1TB); $0.05/GB/mo (&gt;1TB); HP $0.14/GB/mo | Continues while volume exists |
| Data transfer | **$0** ingress/egress | Official |

Sources: [docs.runpod.io/pods/pricing](https://docs.runpod.io/pods/pricing), [docs.runpod.io/accounts-billing/billing](https://docs.runpod.io/accounts-billing/billing), [docs.runpod.io/serverless/pricing](https://docs.runpod.io/serverless/pricing).

### 2) Free tier
**No always-on free tier with fixed GPU hours.**  
- Prepaid credit model; start deposits as low as **~$10** mentioned in billing docs.  
- Promos/referrals: random **$5–$500** credit after referral spends **$10** (not guaranteed free GPU).  
- Startup program: e.g. **$25k bonus** on **$50k** commit (not indie free tier).

Sources: [docs.runpod.io/accounts-billing/billing](https://docs.runpod.io/accounts-billing/billing), [runpod.io/referral-and-affiliate-program](https://www.runpod.io/referral-and-affiliate-program), [runpod.io/startup-program](https://www.runpod.io/startup-program).

### 3) Paid plans
| Product | Price model | Included | Overage / unit |
|---------|-------------|---------|----------------|
| **Pods on-demand** | Prepaid balance | None | Per-GPU rates below |
| **Savings plans** | 3- or 6-month prepaid discount | Discounted compute only | Storage still full rate |
| **Serverless flex** | Per-second | Scale to 0 | List rates on pricing page |
| **Serverless active workers** | Per-second, always on | Sales discounts | Idle bill 24/7 |
| **Clusters / reserved** | Contact sales | Capacity | Custom |

**Secure Cloud Pod rates (list, 2026-07-17):**  
4090 **$0.69/hr** · A100 PCIe **$1.39** · A100 SXM **$1.49** · H100 PCIe **$2.89** · H100 SXM **$2.99** · H100 NVL **$3.19**  

**Community Cloud (cheaper, host-variable):**  
4090 **$0.34** · A100 PCIe **$1.19** · A100 SXM **$1.39** · H100 PCIe **$1.99** · H100 SXM **$2.69** · H100 NVL **$2.59**  

**Serverless list (flex-style hourly display):** H100 **$4.55/hr** · A100 **$2.72/hr** · 4090 **$1.10/hr**

Source: [runpod.io/pricing](https://www.runpod.io/pricing).

### 4) Quota indie apps blow first
1. **Prepaid balance → $0** (hard stop on pods; data risk if no network volume).  
2. **Default $80/hour spend rate limit** across all resources (blocks runaway multi-pod spin-ups).  
3. Deploy gate: need **≥1 hour of credits** for selected config to start a pod.

At usage: one forgotten Secure **H100 @ $2.99/hr** ≈ **$72/day**; two H100s approach the **$80/hr** rate cap quickly.

### 5) Cost traps (AI-agent apps)
- **Forgot-to-stop pods** — bill while idle at full GPU rate.  
- **Stopped pods still bill volume disk at 2×** ($0.20 vs $0.10/GB/mo).  
- **Serverless active workers** and long **idle timeout** (default idle wait **5s** after request; start + load + idle all billed).  
- **Agent loops** creating pods / endpoints without delete.  
- **Leaked `RUNPOD_API_KEY`** → public agents create pods.  
- **No auto-stop on idle** for pods; only DIY TTL (`sleep …; runpodctl pod stop`).  
- Balance **$0** terminates pods **without** network volume (data loss).

### 6) Spend caps
| Control | Hard? | Default |
|---------|-------|---------|
| **$80/hr** account spend limit | **Yes (rate cap)** | **On by default**; raises with history / support |
| Balance **$0** stop | **Yes (balance)** | Always (prepaid) |
| Monthly $ hard ceiling | **No** if auto-pay + card reloads | Auto-pay **opt-in** |
| Low-balance email | Alert only | Opt-in |

Sources: [docs.runpod.io/accounts-billing/billing](https://docs.runpod.io/accounts-billing/billing), [docs.runpod.io/pods/pricing](https://docs.runpod.io/pods/pricing).

### 7) Check usage / spend
- Dashboard: [console.runpod.io/user/billing](https://www.console.runpod.io/user/billing)  
- Pods: [console.runpod.io/pods](https://www.console.runpod.io/pods)  
- REST: `https://rest.runpod.io/v1/pods/...`  
- CLI (install `runpodctl`): list/stop/delete pods

### 8) CLI keywords (detection / cleanup)
```
runpodctl
runpodctl pod list
runpodctl pod list --all
runpodctl pod get
runpodctl pod stop
runpodctl pod delete
runpodctl pod start
runpodctl serverless
runpodctl doctor
runpodctl gpu list
```

**“Nothing running?”**  
`runpodctl pod list` (running) + `runpodctl pod list --all` (stopped still storing) + console Serverless endpoints (active workers ≠ 0).

---

# 2. Modal

### 1) Metered billing dimensions
| Meter | Unit | Notes |
|-------|------|--------|
| GPU time | $/GPU-second | Only while container has the GPU |
| CPU | $/physical-core-second (min 0.125 cores) | |
| Memory | $/GiB-second | |
| Volumes | **$0.09/GiB/mo** | **1 TiB/mo free** included |
| Plan fee | Monthly | Team $250, etc. |
| Region selection | **1.5–1.75×** base | Optional |
| Non-preemptible | **3×** base | Optional |

**Default = scale to zero** (no charge when no containers).  
**Exception:** `min_containers` / warm pool / `buffer_containers` / long `scaledown_window` **request capacity and bill continuously** at GPU+CPU+RAM rates while those containers stay up.

Sources: [modal.com/pricing](https://modal.com/pricing), [modal.com/docs/guide/billing](https://modal.com/docs/guide/billing), [modal.com/docs/guide/scale](https://modal.com/docs/guide/scale).

### 2) Free tier (exact)
| Item | Starter (free plan) |
|------|---------------------|
| Plan fee | **$0/mo** |
| Compute credits | **$30/month free** |
| Seats | **3** |
| Containers concurrency | **100** |
| GPU concurrency | **10** |
| Deployed apps | **200** |
| Cron jobs | **5** deployed |
| Log retention | **1 day** |
| Payment method | Required to use platform (docs) |

Academics: up to **$10k** free credits (application). Startups: separate grant program.

Source: [modal.com/pricing](https://modal.com/pricing).

### 3) Paid plans
| Plan | Price | Included compute | Concurrency | Other |
|------|-------|------------------|-------------|--------|
| **Starter** | $0 + usage | **$30/mo** credits | 100 containers / 10 GPU | 3 seats, 200 apps |
| **Team** | **$250/mo** + usage | **$100/mo** credits | 1000 containers / 50 GPU | Unlimited seats, custom domains, static IP, rollbacks |
| **Enterprise** | Custom | Custom | Custom | SSO, HIPAA, private Slack, volume discounts |

**GPU unit prices (per second → ≈/hr):**  
| GPU | $/sec | ≈$/hr |
|-----|-------|-------|
| T4 | $0.000164 | **$0.59** |
| L4 | $0.000222 | **$0.80** |
| A10 | $0.000306 | **$1.10** |
| A100 40GB | $0.000583 | **$2.10** |
| A100 80GB | $0.000694 | **$2.50** |
| L40S | $0.000542 | **$1.95** |
| H100 | $0.001097 | **$3.95** |
| H200 | $0.001261 | **$4.54** |
| B200 | $0.001736 | **$6.25** |
| B300 | $0.001972 | **$7.10** |

No RTX 4090 on official GPU list as of this check.  
Billing: **per second, no minimum increment**; monthly invoice + mid-cycle incremental charges after thresholds.

Source: [modal.com/pricing](https://modal.com/pricing), [modal.com/docs/guide/billing](https://modal.com/docs/guide/billing).

### 4) Quota indie apps blow first
1. **$30 Starter credits** (then card).  
   - 1× H100 always warm (`min_containers=1`): ~$3.95 × 24 × 30 ≈ **$2,844/mo** → credits gone in **~7.6 hours**.  
   - Burst inference without warm pool: credits last much longer (true scale-to-zero).  
2. **GPU concurrency = 10** (Starter) — parallel agent fan-out hits this before money sometimes.  
3. **Container concurrency = 100**.  
4. **Workspace budget** (if set) as hard outer monthly cap.

### 5) Cost traps (AI-agent apps)
- **`min_containers > 0` on GPUs** — 24/7 warm pool; pricing slogan “never pay for idle” does **not** apply to requested warm capacity.  
- **`buffer_containers`**, long **`scaledown_window`**.  
- **Cron / scheduled functions** spinning heavy GPU jobs every minute.  
- **`.map()` fan-out** × large batches × H100s (25k total input limit, but cost explodes first).  
- **Region multiplier 1.5–1.75×**, **non-preemptible 3×**.  
- **Leaked `MODAL_TOKEN_ID` / `MODAL_TOKEN_SECRET`**.  
- Agent deploys apps and never `modal app stop` / undeploy; warm configs remain.  
- Team plan **$250** base even if compute is small.

### 6) Spend caps
| Control | Hard? | Default |
|---------|-------|---------|
| **Workspace budget** | **Yes — documented hard outer cap** | **Off until you set it** (Usage & Billing) |
| **Environment budget** | Cap on compute (alpha); not full invoice | Off until set |
| Free **$30** credits | Soft until card charges | On Starter |
| Alerts alone | N/A as sole protection | Set budget yourself |

Source: [modal.com/docs/guide/budgets](https://modal.com/docs/guide/budgets) (“hard outer cap”).

### 7) Check usage / spend
- Dashboard: [modal.com/settings/usage](https://modal.com/settings/usage)  
- Apps: [modal.com/apps](https://modal.com/apps)  
- CLI/API: `modal billing` (Team/Enterprise granular reports), `modal.billing` SDK  

### 8) CLI keywords
```
modal
modal app list
modal app stop
modal app history
modal container list
modal container stop
modal volume
modal billing
modal deploy
modal run
```

**“Nothing running?”**  
`modal app list` + `modal container list` (empty active containers) + check deployed apps for `min_containers`.

---

# 3. Vast.ai

### 1) Metered billing dimensions
| Meter | Unit | Notes |
|-------|------|--------|
| GPU rental (active/connected) | $/sec (shown as $/hr) | Host-set; on-demand / interruptible / reserved |
| Storage | $/GB/hr | **Continues while instance exists** (stopped ≠ free) |
| Bandwidth | $/TB (per host) | In + out |
| Serverless workers | Same instance rates | Ready/Loading: GPU+storage; Creating: storage only; Destroyed: stop all |

**No static public price list** — marketplace. Live grid: [vast.ai/pricing](https://vast.ai/pricing), search: [cloud.vast.ai/create](https://cloud.vast.ai/create/).

Sources: [docs.vast.ai/guides/instances/pricing](https://docs.vast.ai/guides/instances/pricing), [docs.vast.ai/guides/reference/billing](https://docs.vast.ai/guides/reference/billing), [docs.vast.ai/guides/serverless/pricing](https://docs.vast.ai/guides/serverless/pricing).

### 2) Free tier
**None for general signup.**  
- Minimum credit purchase **$5**.  
- Startup programs (e.g. matching / **~$2,500** grants) are application-based, not automatic.  
- Referral earns **referrer** 3% of referee spend — not free compute for you.

Sources: [docs.vast.ai quickstart](https://docs.vast.ai/guides/get-started/quickstart), [vast.ai/startup](https://vast.ai/startup), [docs.vast.ai referral](https://docs.vast.ai/guides/reference/referral-program).

### 3) Paid plans
| Type | Pricing | Included | Notes |
|------|---------|----------|--------|
| **On-demand** | Host $/hr, per-second | None | Guaranteed while rented |
| **Interruptible** | Often **50%+ cheaper** | None | Preemptible |
| **Reserved** | Up to **~50% off** with term | Prepaid commitment | 1/3/6 mo |
| **Serverless** | Same GPU market rates + storage/BW | Autoscales workers | No separate markup tier |

**Approximate market refs (not guarantees; re-check live):** third-party snapshots often show H100 ~$2/hr, 4090 ~$0.3–0.55/hr — **always re-query** `vastai search offers`.

### 4) Quota indie apps blow first
1. **Credit balance → $0** → instances **auto-stopped**; storage still accrues; without card, deletion risk after grace.  
2. **Storage on “stopped but not destroyed”** instances — silent drain.  
3. **Rental end date / contract lifetime** — instance stops when offer lifetime expires (not a spend cap; a TTL).  
4. Autobilling + card → **no soft free stop** (card tops up).

### 5) Cost traps (AI-agent apps)
- **Stop ≠ destroy**: storage billing continues forever until **destroy**.  
- **Autobilling** refills card when balance low → runaway rentals charge card.  
- **Bandwidth** not in the big $/hr number; data-heavy agents surprise-bill.  
- **Interruptible** preemption mid-job without checkpoints.  
- **Serverless Loading/Ready** states both bill GPU.  
- **Leaked Vast API key** → create-instance scripts.  
- Agent leaves many stopped disks.  
- Host reliability variance (marketplace).

### 6) Spend caps
| Control | Hard? | Default |
|---------|-------|---------|
| Balance **$0** stop GPU | **Yes** | Always (prepaid) |
| Card + **autobilling** | **Removes hard stop** (recharges) | Opt-in |
| Monthly $ hard cap product | **Not documented as first-class** | Rely on balance / disable autobill |
| Low-balance email | Alert | Configurable |
| Contract **end date** | Auto-stop GPU | Per offer |

Source: [docs.vast.ai/guides/reference/billing](https://docs.vast.ai/guides/reference/billing).

### 7) Check usage / spend
- Billing: [cloud.vast.ai/billing](https://cloud.vast.ai/billing/)  
- Instances: [cloud.vast.ai/instances](https://cloud.vast.ai/instances)  
- CLI: `vastai show instances`, charges in console **Charges** tab  

### 8) CLI keywords
```
vastai
vastai search offers
vastai create instance
vastai show instances
vastai stop instance
vastai destroy instance
vastai start instance
vastai execute
```

**“Nothing running / billing?”**  
`vastai show instances` → every row should be **destroyed** (not merely stopped) if you want **zero** storage burn.

---

# Cross-service comparison (indie-critical)

| Topic | RunPod | Modal | Vast.ai |
|-------|--------|-------|---------|
| **Billing grain** | Per-second | Per-second | Per-second |
| **Idle GPU (default)** | **Billed** if pod/worker up | **Free** (scale 0) | **Billed** if instance running |
| **Warm pool** | Active workers / idle timeout | **`min_containers` bills full rate** | Keep workers Ready |
| **Stopped disk** | Volume **2×**; network continues | Volumes monthly | **Storage continues until destroy** |
| **Free credits** | No fixed free tier | **$30/mo Starter** | **None** (min $5) |
| **Hard spend stop** | **$80/hr** + balance $0 | **Budget** if set; else card | Balance $0 (unless autobill) |
| **4090 range** | **$0.34–0.69/hr** | N/A on list | Market (often cheapest) |
| **A100 range** | **~$1.19–1.49/hr** pods | **~$2.10–2.50/hr** | Market |
| **H100 range** | **~$1.99–3.19/hr** pods; serverless higher | **~$3.95/hr** | Market (~$2 ref) |
| **Best for** | Cheap dedicated pods / mixed | Spiky serverless + free $30 | Lowest sticky rates if you ops carefully |

---

# Universal “is anything still burning money?” checklist

| Provider | CLI check | Still costs if… |
|----------|-----------|------------------|
| RunPod | `runpodctl pod list --all` + serverless console | Stopped pods with volume/network disk; active workers |
| Modal | `modal container list` + `modal app list` | `min_containers`, deployed warm functions |
| Vast | `vastai show instances` | Any non-destroyed instance (storage); running = GPU |

**Shell keywords only (for grepping scripts / agent allowlists):**  
`runpodctl`, `pod list`, `pod stop`, `pod delete`, `serverless` · `modal`, `app list`, `app stop`, `container list`, `container stop`, `billing` · `vastai`, `show instances`, `stop instance`, `destroy instance`, `search offers`

---

# Recent notes / verify-before-buy (July 2026)

1. **RunPod Community vs Secure** still a large gap (e.g. 4090 **$0.34 vs $0.69**, H100 PCIe **$1.99 vs $2.89**) — page dual-lists; schema.org on pricing page confirms both.  
2. **Modal** free credit on Starter remains **$30/mo** (homepage sometimes says “$30 free compute”); Team is **$250 + $100 credits**.  
3. **Vast** still marketplace-only for headline rates — treat any blog number as stale within days.  
4. All three: **per-second GPU math is real**; the real bill is **idle + storage + warm pools + autobilling**.

---

### Primary source URLs (bookmark)

| Service | Pricing | Billing / quotas | CLI |
|---------|---------|------------------|-----|
| RunPod | https://www.runpod.io/pricing | https://docs.runpod.io/accounts-billing/billing · https://docs.runpod.io/pods/pricing · https://docs.runpod.io/serverless/pricing | https://docs.runpod.io/runpodctl/overview |
| Modal | https://modal.com/pricing | https://modal.com/docs/guide/billing · https://modal.com/docs/guide/budgets · https://modal.com/docs/guide/scale | https://modal.com/docs/cli/latest/app |
| Vast.ai | https://vast.ai/pricing | https://docs.vast.ai/guides/reference/billing · https://docs.vast.ai/guides/instances/pricing | https://docs.vast.ai/cli/hello-world |

**Re-verify live before purchase:** GPU list prices and Vast offers change continuously; this sheet is current as of **2026-07-17** from the pages above.
