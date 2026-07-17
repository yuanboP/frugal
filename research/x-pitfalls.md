# X pitfall-mining corpus (2026-07-17)

272 raw records mined by 14 grok X-search agents (EN+ZH angles), structured by 14 extraction agents, deduped/ranked by a synthesis agent. Internalized into providers.js / SKILL.md after verifying each mechanism against CURRENT billing models — corrections found during verification:

- Vercel image `minimumCacheTTL` default is now 14400s (4h), NOT the old 60s claim; re-billing on cache miss/stale IS real.
- Cloudflare Workflows per-step billing is ADDITIVE to CPU-time billing and starts 2026-08-10 — not a replacement.
- Neon: 8 CU is the DEFAULT autoscale ceiling (16 CU is max available on Launch); 0.25 CU minimum bills while awake, scale-to-zero still exists.
- Vercel WAF-mitigated traffic free since 2026-05; Bot Protection is free but OFF by default.

## Top pitfalls (ranked)

### Google Cloud / Firebase + Gemini: Unrestricted or legacy Firebase browser/Android/Maps API keys retroactively became valid Gemini credentials; scrapers and abusers ran massive GenAI usage on them

- **Mechanism**: Google expanded key scope so any unrestricted project key can call Generative Language/Gemini; Firebase Hosting even serves the apiKey publicly at /__/firebase/init.json; pre-2024 legacy keys were never auto-restricted; ~30h billing lag keeps charges landing after mitigation
- **Magnitude**: €3,167/day to $160,000; median case five figures ($15k-$67k)
- **Frequency**: 7 independent first-person stories
- **Sources**: https://x.com/nicklaunches/status/2044792543590940707 · https://x.com/JChoi1030/status/2049519301590438116 · https://x.com/parthi_logan/status/2043697316297654442 · https://x.com/ulusoyapps/status/2053510488382664814 · https://x.com/DavidGalar87174/status/2038690171118625148 · https://x.com/fagamericano/status/2071233799007220074 · https://x.com/moblizeit/status/2047520707186217338

### Any (OpenAI, Anthropic, Google, Replicate): API keys leaked via git commits, 'private' repos, client bundles, phishing, or fresh agent-tool installs get scraped and metered by abusers within hours

- **Mechanism**: Any exposed key is a bearer credential for pay-per-token/pay-per-request billing; scrapers monitor GitHub and agent configs; no provider-side anomaly hard-stop fires before five figures accrue
- **Magnitude**: $1,700/3 days to $600,000; $55,444 (student Gemini key), $82,314/48h (stolen Gemini key)
- **Frequency**: 8+ independent stories; the recurring pattern behind most 5-6 figure bills
- **Sources**: https://x.com/fekdaoui/status/1900875032781258846 · https://x.com/bonsaixbt/status/2066149484040458472 · https://x.com/airesearche6by9/status/2073071671481888869 · https://x.com/szewailaw_lis/status/2031285160495427643 · https://x.com/CodeByNZ/status/2076993521395871921 · https://x.com/capreal26/status/2067217376895238567 · https://x.com/ItsKirui_CFC/status/2073345970025144821

### GCP / Firebase / AWS: Budget 'alerts' are email-only and billing data lags 24-48h, so runaway spend runs unstopped past any threshold; cancelling the card or trial does not stop metering

- **Mechanism**: GCP/Firebase Blaze and AWS budgets notify but never enforce; alerts fire on day-old data; the only real brakes are quota caps, auto-disable Cloud Functions, or account closure
- **Magnitude**: $120 to $70,000 in a day ($25,672 past a $10 budget; ~$2,700 Bedrock overnight; Rs 51,164 after 'cancelling' a trial)
- **Frequency**: 6+ direct stories; aggravating factor in nearly every GCP/AWS blowup
- **Sources**: https://x.com/adxtyahq/status/2046883857190752584 · https://x.com/tamarajtran/status/1880036092906467841 · https://x.com/dholzric/status/1910176201852805508 · https://x.com/cylentsec/status/2077739176393420967 · https://x.com/iamankitpande/status/2036050862200729710 · https://x.com/lreverchuk/status/2075414877582090581

### Datadog / AWS CloudWatch: Observability meters (log ingest, indexing, Insights queries, APM spans, custom-metric cardinality, per-host high-watermark) silently dwarf the app's own infra cost

- **Mechanism**: Every meter bills volume independent of traffic value: full request/response bodies at ~$0.50/GB ingest, DEBUG left on in prod, unsampled spans on retries/fan-out, id-like metric tags exploding series counts, ephemeral nodes billed as full-month hosts
- **Magnitude**: $18k-$50k/month cases; 12x bill in 2 weeks from added spans; $40k/mo in query costs alone; $83k/yr renewal shock
- **Frequency**: 10+ independent stories, largest recurring-magnitude cluster
- **Sources**: https://x.com/brankopetric00/status/1991922847178956962 · https://x.com/brankopetric00/status/2021317748597678546 · https://x.com/sesigl/status/2057774233686552971 · https://x.com/SairajRaithatha/status/2039239103959752933 · https://x.com/0xlelouch_/status/2046218336699392166 · https://x.com/dhh/status/1828078003579920674 · https://x.com/ccccjjjjeeee/status/2036988970496819234 · https://x.com/terencezliu/status/2068128753058783242

### Twilio (and SMS APIs generally): SMS pumping / toll fraud on unprotected OTP or voice endpoints, amplified by auto-recharge refilling the card automatically

- **Mechanism**: Bots trigger OTP sends or international calls to fraudster-controlled premium routes; per-message/per-minute billing scales instantly; auto-recharge converts fraud into repeated card charges before anyone notices; refunds are partial at best
- **Magnitude**: $2,000-$18,000 in a single day; auto-recharge fired 7x ($3,500+); prepaid balances drained to zero
- **Frequency**: 7 independent stories (recurring for years, still unfixed by vendor)
- **Sources**: https://x.com/isaakdury/status/1694666911752315348 · https://x.com/JeremySParker/status/2074150124620546280 · https://x.com/kidbombay/status/1625514677206745088 · https://x.com/smartnakamoura/status/2040348628284325910 · https://x.com/alnln222/status/1857114996724977684 · https://x.com/neatclaudia/status/2031725863926980721

### Cloudflare (Workers/Queues/KV/Workflows): Recursive/self-triggering serverless loops (queue consumers re-enqueueing, workflows spawning workflows) run unbounded because Cloudflare has NO hard spend cap anywhere

- **Mechanism**: Each loop iteration bills KV writes/reads, DO row writes, queue ops, or workflow steps; nothing halts it — RetainDB's loop generated 3.13B KV writes in a month; same pattern recurs on Firebase (recursive Firestore triggers)
- **Magnitude**: $800 overnight to $36,000/month; folklore ceiling ~$121k (Translation recursion)
- **Frequency**: 5 stories across CF + Firebase; canonical serverless failure mode
- **Sources**: https://x.com/heyandras/status/2050650346868051995 · https://x.com/nikhildp/status/2066876169413435691 · https://x.com/DDoodle234/status/2039334680147738855 · https://x.com/Sibhimanyu/status/2074453653113774298

### GitHub Actions: CI burn from macOS runners (~10x Linux), agent-driven per-push full-CI runs, no timeout-minutes (6h default), per-job minute round-up, and misordered caches

- **Mechanism**: Per-minute hosted-runner billing multiplied by: AI agents writing macos-latest workflows and pushing every small commit, no concurrency/cancel-in-progress, blocking --wait steps billing hung minutes, each job ceil-rounded to whole minutes
- **Magnitude**: Full free quotas gone in days (5 stories); ~$700/mo agent PR loop; 50k Enterprise minutes in 2 weeks; ~$300 cache waste
- **Frequency**: 9-10 independent stories; sharply rising with coding agents
- **Sources**: https://x.com/novoreorx/status/2076694936863531389 · https://x.com/dev_mario/status/2071302714852860128 · https://x.com/DLKFZWilliam2/status/2061277702481756302 · https://x.com/maxschuetz_/status/2077870402798317679 · https://x.com/KeananBrown/status/2065521205382422731 · https://x.com/AlexGallner/status/2075979535447986268 · https://x.com/agstnsnathaniel/status/2064939609675706404 · https://x.com/brachkow/status/2077534578248409213 · https://x.com/birch_js/status/1998045596465377529

### OpenAI / Anthropic (agent loops): Unattended agents (overnight runs, 'keep going until done', sub-agent fan-out) hit silent failures and retry/spawn unboundedly, billing every attempt

- **Mechanism**: Broken exit conditions + no circuit breaker + no per-run budget: 200+ retries of a failing tool call, all-night loops on employer tokens, one prompt spawning N sub-agents multiplying token spend N×, agents draining prepaid credits in seconds
- **Magnitude**: $40 in 10 seconds; $47-$400 overnight typical; $300 employer tokens; ~$8,000 claimed overnight; $130/day verification theater
- **Frequency**: 8+ independent stories, fastest-growing category
- **Sources**: https://x.com/orvi_onethread/status/2059555185064833202 · https://x.com/konnbuilds/status/2061801959212953790 · https://x.com/IceSolst/status/1989685075621847148 · https://x.com/tibo_maker/status/2026325609190748514 · https://x.com/legallybrowned/status/2077409399950241847 · https://x.com/davis7/status/2072414284324475136 · https://x.com/drbarnard/status/2077853657878700252 · https://x.com/akki_khanna/status/2074988036354380201

### Vercel: Viral or attack traffic explodes Fast Data Transfer + Edge Request meters; firewall/bot protection is NOT auto-on and spend caps default to notification-only

- **Mechanism**: Per-request/per-GB metering bills every hit including DDoS and scanner bots; caching does not stop the meters at viral scale; Pro Spend Management is a $200 notification, not a stop
- **Magnitude**: $523 (unnoticed DDoS) to ~$46,000 (450M pageviews); $800 uncapped PAYG surprise
- **Frequency**: 6 independent stories
- **Sources**: https://x.com/rtwlz/status/2020957597810254052 · https://x.com/T_Zahil/status/1808764723103416620 · https://x.com/smokeNotCNFT/status/2077022379663036616 · https://x.com/abhitwt/status/2071190440838394056 · https://x.com/wesbos/status/2021264135229464914

### Google Maps / Places API: Per-request Maps/Places billing multiplied by agents, orphaned automations, auto-refreshing sheets, bots farming client-side keys, and naive batch geocoding — with only alert-only budgets behind it

- **Mechanism**: Every call bills individually; 'stopped' n8n workflows kept firing; sheets re-ran API cells on recalc; photo re-fetch loops made 86k calls for 3.7k photos; the old $200/mo Maps credit ended Mar 2025 so stale assumptions now bill
- **Magnitude**: $200 to $9,000+ ($5k one batch job, $611/12 days, €700 bot-farmed key)
- **Frequency**: 6 independent stories
- **Sources**: https://x.com/Engadgetnerd/status/2054368763210850713 · https://x.com/allaboutvol/status/2075550015750082961 · https://x.com/akiraxtwo/status/2054527112158277996 · https://x.com/ben_mathes/status/2056874527620255903 · https://x.com/Jaiyex44/status/2053012327176249472 · https://x.com/lreverchuk/status/2075414877582090581

### Railway (pattern extends to Heroku/Render): Always-on compute bills RAM/CPU 24/7 regardless of traffic; 'Hobby $5' is a credit not a cap; databases and static sites never sleep; failed deploy loops drain credits

- **Mechanism**: Per-GB-hour memory metering runs at zero traffic; a Next server idling at ~400MB exceeds the $5 credit; provisioned DBs bill continuously; each redeploy iteration spins billable resources
- **Magnitude**: ~$43 pre-launch with no users to $700/mo; ₹500→₹5,000/mo drift; Heroku parallel: $145/mo zombie add-ons
- **Frequency**: 8 Railway stories + 5 Heroku/Render parallels
- **Sources**: https://x.com/TKtamilarasan2/status/2073179783526318168 · https://x.com/elion_shahini/status/2073427621153542344 · https://x.com/dayvsterdev/status/1972957233152729233 · https://x.com/chi_di_ebere/status/2075870475134132499 · https://x.com/cheers_2_life87/status/2076143226638291182 · https://x.com/Alex_li/status/2053216457761435673 · https://x.com/NoobSambit/status/2076282712923767277 · https://x.com/telenardo/status/2062253553515966691

### AWS: Orphaned/hidden resources keep metering after 'leaving': unreleased Elastic IPs/public IPv4 billed under the confusing 'VPC' line, forgotten EC2/RDS/GPU instances, idle NAT gateways, stopped-instance storage/snapshots

- **Mechanism**: Public IPv4 bills $0.005/hr each since Feb 2024 and surfaces under VPC (hiding the cause); NAT ~$32/mo at zero traffic; stopped RDS still bills storage/IPs and auto-restarts after 7 days; free tier is time-boxed and instance-type-specific
- **Magnitude**: Chronic $3-$340/mo leaks up to $1,200 (forgotten GPU box); $204/mo fixed floor on a zero-traffic stack
- **Frequency**: 10+ independent stories (highest raw frequency, small-to-mid magnitude)
- **Sources**: https://x.com/rameerez/status/1912651627091177654 · https://x.com/VicVijayakumar/status/1962888115728650257 · https://x.com/Niraj_Dilshan/status/2061670313897693553 · https://x.com/RahulPaswa61922/status/2053439784883024379 · https://x.com/BenjaminDEKR/status/1853850000322699504 · https://x.com/AvinashDalvi_/status/2062192474630803820 · https://x.com/Ikoh_Sylva/status/2056261648323678310

### Firebase (Firestore/RTDB): Reads scale with code patterns and crawlers, not users: missing useEffect deps, unscoped listeners, full-collection loads on public pages deep-crawled by Googlebot, client-SDK bulk dumps

- **Mechanism**: Per-document-read metering multiplied by re-render counts, listener re-downloads, and bot traffic; 100 users produced 100k reads/hour; a crawler generated 68M reads
- **Magnitude**: $50→$5,000/mo (hook bug); ~$1,200 (Googlebot); 10M reads/hr at 100 users
- **Frequency**: 6 independent stories
- **Sources**: https://x.com/bmustafa97/status/1995796102973739390 · https://x.com/daboigbae/status/2029566690208739421 · https://x.com/math145dropout/status/1979283148207689966 · https://x.com/ItsDaniRika/status/1839785415416390133 · https://x.com/iamukasa/status/2029187981060247867 · https://x.com/ICuvula/status/2077301307715555774

### Mapbox (and uncappable metered SaaS generally): Per-map-load/tile pricing with NO spend cap option turns viral traffic into an unbounded bill; even dev iteration meters

- **Mechanism**: Every map load/tile bills; vendor offers no hard limit, so a viral free page means 'essentially infinite' exposure; premium satellite rasters are worst
- **Magnitude**: $857/mo steady-state; ~$11,000 viral exposure; >$5,000 in 72 hours (unspecified maps stack)
- **Frequency**: 5 independent stories
- **Sources**: https://x.com/levelsio/status/2050343676635922592 · https://x.com/levelsio/status/1833510914777055403 · https://x.com/merterdir/status/2065778980905472024 · https://x.com/retardmode/status/2019481406364094570 · https://x.com/walkmatescom/status/1940376157704122734

### RunPod / Modal / Vast.ai (GPU clouds): GPU pods and warm inference endpoints bill wall-clock hours while idle, crashed, or forgotten overnight; agents have even self-provisioned H100s

- **Mechanism**: Per-GPU-hour metering runs regardless of useful work: forgotten H100 pods, broken scripts burning all night, min_containers>0 endpoints at zero QPS, billed hours on host-side crashes with no auto-refund
- **Magnitude**: $23-$340 per forgotten night; $200/day heavy serverless use; ~$1,800/mo warm endpoints; $500 undisciplined experimentation
- **Frequency**: 7 independent stories
- **Sources**: https://x.com/brsy_10/status/2030042669402181911 · https://x.com/S1TA10/status/2064433058569453878 · https://x.com/0xDezo/status/2061846066769932693 · https://x.com/_chenglou/status/2015290665530528249 · https://x.com/latkins/status/1758668956863266939 · https://x.com/OnlyTerp/status/2067686894520197306 · https://x.com/f4talStrategies/status/2077118483121234028

### Vercel: Function duration architecture traps: client→server refactors billing per-pageview backend work, unclosed streams billing to full maxDuration under attack, scanner bots invoking functions on garbage paths, unscoped middleware on every request

- **Mechanism**: Serverless duration meter bills GB-seconds for whatever keeps the function alive: 20 server-side fetches per view 10x'd a bill; DoS × 300s timeout on never-closed streams; /wp-admin probes hit dynamic routes
- **Magnitude**: $300→$3,550/mo (refactor); >$1,000 + LLM costs (DoS+streams)
- **Frequency**: 4-5 stories plus recurring middleware theme
- **Sources**: https://x.com/_mattwelter/status/1949850488654143932 · https://x.com/TejasKumar_/status/2000998749095821726 · https://x.com/ZaynHao/status/2042187522416242985

### Supabase: Pooled egress meter ($0.09/GB, 5 GB free) maxes out from serving media through Supabase Storage while every other meter looks fine

- **Mechanism**: Egress is combined across all Supabase services and uncached storage egress bills $0.09/GB, so hosting images/video burns the shared quota; free-tier overage triggers enforcement/forced migration
- **Magnitude**: ~$600/month recurring; 150% quota enforcement nearly killed a project; free 5GB cap blown by tiny apps
- **Frequency**: 4-5 independent stories
- **Sources**: https://x.com/qwertyu_alex/status/1939433991028736390 · https://x.com/jackfriks/status/2062870491929489541 · https://x.com/GohilHardy/status/1939774311105241334 · https://x.com/TheNickBigar/status/2067322954292043793

### Cloudflare D1: D1 bills per row SCANNED, not per query — full-table scans, ORDER BY RANDOM(), and hot-path polling multiply billed reads by orders of magnitude

- **Mechanism**: Rows-read meter: an unindexed ORDER BY RANDOM() over 69k rows polled every 10s billed 400B+ reads; 'skills issue' queries and recursion hit similar walls with no hard cap
- **Magnitude**: $700-$3,000 hobby-project bills; 3,000x bill spike
- **Frequency**: 4 stories plus community consensus theme
- **Sources**: https://x.com/FemiSuccess7/status/2058769757868834957 · https://x.com/motatoeshq/status/2077567228980211951 · https://x.com/RaeesBhatti/status/2077841915534578044 · https://x.com/DDoodle234/status/2039334680147738855

### Anthropic / OpenAI (agent CLIs): Dual-rail billing: Claude Code/Codex silently bill pay-per-token API instead of the flat subscription when ANTHROPIC_API_KEY/OPENAI_API_KEY is present in the environment

- **Mechanism**: Agent CLIs prefer a discovered API key over subscription auth with no warning, routing all usage to metered per-token billing at full price
- **Magnitude**: $100 to ~$1,200
- **Frequency**: 3 independent stories in one month; extremely detectable
- **Sources**: https://x.com/parcadei/status/2077102677385732533 · https://x.com/NicholasRuncie/status/2077730434910126543 · https://x.com/elvissun/status/2077061060675420533

### Vercel: Default/adjacent-meter tax: 60s image cache TTL forcing paid re-transforms, Turbo build tier left on, Code Review/v0 toggles billing dormant accounts, preview deployments per push, forgotten crons, Fluid compute costing MORE

- **Mechanism**: Multiple non-traffic meters default on or linger: identical image re-optimized ~500x; every branch push bills a preview build; a dead project's 5-min cron billed for 3 weeks; Fluid 10x'd one workload
- **Magnitude**: $84-$700 per incident; $120→$4/mo after cleanup ('Vercel tax')
- **Frequency**: 7 independent stories
- **Sources**: https://x.com/consolelogwill/status/1953514383650193468 · https://x.com/akki_khanna/status/2076324214965944527 · https://x.com/noahlisk/status/2077164738619003282 · https://x.com/BlakeFolgado/status/2077421208358801666 · https://x.com/MomoXCrypto/status/2051271825716597095 · https://x.com/melvynx/status/1960370679586680841 · https://x.com/michaelaubry/status/2012975842100437009

### Neon: Compute defaults bite both directions: default autoscale ceiling of 8 CU ('toxic default') under spikes, 0.25 CU minimum floor billing near-idle DBs, and network egress reaching 60% of invoices

- **Mechanism**: CU-hour metering: traffic spikes scale to the 8 CU default max (~$20/day); paid computes never bill below 0.25 CU even at <0.02 CU actual; bulk exports/cross-region traffic run the network meter; no per-project invoice breakdown
- **Magnitude**: $19/mo idle floor to $1,400/mo drift (vs $300 elsewhere for same load); $20/day spike
- **Frequency**: 5 independent stories
- **Sources**: https://x.com/qilei/status/2075164191472959712 · https://x.com/shrjamal/status/2069846986753286224 · https://x.com/francisco_m001/status/2041166751715528867 · https://x.com/elitasson/status/2051288053155606693 · https://x.com/davidtsolheim/status/2063651499817984509

### Cloudflare Workflows / Supabase / SendGrid / Cursor: Provider-side pricing model changes land without notice: CF Workflows shifted from CPU-time to per-step + SQLite billing; users waste hours debugging their own code before suspecting the vendor

- **Mechanism**: Unannounced meter/model changes reprice existing workloads overnight; fine-grained wait-heavy workflow designs became expensive; victims assumed they broke something
- **Magnitude**: $450 real (agency); $35→$38,277/mo estimate scare; Supabase compute reprice; Cursor 'unlimited' flip charging $100+
- **Frequency**: 4+ stories across providers
- **Sources**: https://x.com/AjaySohmshetty/status/2077752861719400660 · https://x.com/appfactory/status/2078013680914956375 · https://x.com/bygregorr/status/2071672250709786912 · https://x.com/gabriel__xyz/status/1941011597142765626

### Cloudflare Durable Objects: DOs bill wall-clock duration while awake — hibernation failures, timers/handles keeping objects alive, and using DOs for trivial key-checks all bill continuously

- **Mechanism**: Duration meter runs whenever the object is awake regardless of request volume; a hibernation bug kept chat DOs warm; light idempotency checks cost $46/day vs near-free on KV/D1; unbatched storage.put() calls also bill per row write (12x amplification)
- **Magnitude**: £250-$1,400/mo equivalent; $4,000 DO row-write component of the $36k RetainDB bill
- **Frequency**: 3 independent stories
- **Sources**: https://x.com/mehedih_/status/2075919743555387410 · https://x.com/shiweidu/status/2064354239472959738 · https://x.com/heyandras/status/2050650346868051995

### GitHub (Git LFS): LFS bandwidth (~10GB/mo free) blows through in a day on popular repos, bills the fork owner for downstream forks' downloads, and overage can suspend the whole account

- **Mechanism**: Tiny free bandwidth tier × clone/download volume of binary-heavy repos; fork-chain traffic attributed to your billing; enforcement is account lock, not just a bill
- **Magnitude**: Account suspension (62 repos locked); free tier gone in ~1 day; 'massive' game-asset bills
- **Frequency**: 5 independent stories
- **Sources**: https://x.com/olegataeff/status/2040470992632328389 · https://x.com/ivanfioravanti/status/2030909964122771749 · https://x.com/TheGingerBill/status/2056023681512460378 · https://x.com/theabyssant/status/1944331371414995013 · https://x.com/geoffa/status/2051385889746542755

### Azure / Alibaba / Volcengine (trials and postpaid): Trial/student credits silently convert to paid with expensive defaults (Azure SQL General Purpose, Azure Firewall ~$900/mo idle), and CN postpaid platforms keep serving past zero balance, accruing debt

- **Mechanism**: Credit-cliff conversion with no spending limit + costly default tiers; postpaid billing models treat zero balance as arrears, not a stop; removing the card does not stop metering
- **Magnitude**: $200-$450 per student; ~$450/week idle firewall; repeated arrears incidents
- **Frequency**: 5-6 independent stories
- **Sources**: https://x.com/kevin_day/status/2056400566335770999 · https://x.com/Dylannguyeniuuu/status/2044285726112498134 · https://x.com/ag_singleton/status/2058995641511006494 · https://x.com/livingdevops/status/2022997613541200335 · https://x.com/spcxap/status/2076700357325902256

## Internalization actions (as synthesized)

- **[SKILL.md rules (mirror in AGENTS.md)]** New rule bullet: 'Alerts are not brakes, and billing lags. AWS/GCP/Firebase budgets only email — they never stop spend — and usage data lags 24-48h (Gemini abuse kept billing ~30h after mitigation). Pair every alert with an enforcement: quota caps, auto-disable action, or a provider spend cap that actually pauses service.'
  - Why: 6+ stories ($120 to $70k) where victims had alerts set and still burned; the single most repeated aggravating factor across GCP/AWS blowups
- **[new provider (providers.js)]** New provider entry 'Secret exposure': pattern matching key-shaped literals anywhere in a Bash command (AIza[0-9A-Za-z_-]{35}, sk-[A-Za-z0-9]{20}, sk-ant-, r8_, ghp_, AKIA[0-9A-Z]{16}) or `git add`/`git commit` touching .env → hint: 'API key visible in a shell command/staged file — leaked keys are the #1 cause of 5-6 figure bills ($55k-$600k); keep in untracked .env, rotate now if it left the machine, restrict its scope.'
  - Why: Largest-magnitude cluster in the corpus (8+ stories, $1.7k-$600k); trivially detectable from command text the pretool hook already sees
- **[new provider (providers.js)]** New provider entry 'GenAI enablement': pattern cmd('gcloud\\s+services\\s+enable\\s+\\S*(generativelanguage|aiplatform)') → hint: 'Enabling GenAI makes EVERY existing key in this project — including Firebase browser keys served publicly at /__/firebase/init.json and pre-2024 legacy keys — a billable Gemini credential (€54k/13h reported). Restrict all keys and set a per-day quota BEFORE enabling; budgets only alert.'
  - Why: 7 independent stories, €3.2k-$160k; a single precisely-detectable command is the gate for the whole failure mode
- **[new provider (providers.js)]** New provider entry 'Firebase' (split out of GCP): pattern cmd('firebase') → hint: 'Blaze has NO hard cap. Check onWrite/onUpdate triggers for recursion (writing the collection they listen on), Firestore bills per document READ (crawler/useEffect loops hit $5k/mo at 100 users), and Hosting publicly serves your apiKey — restrict browser keys and set maxInstances.'
  - Why: Currently only `firebase deploy` matches (under GCP) with a Cloud-Run-centric hint; 10+ Firebase-specific stories span reads, recursion, keys, and storage
- **[providers.js (Cloudflare entry)]** Edit Cloudflare hint: append 'NO hard spend cap exists anywhere on CF — add max-attempt/recursion guards to queue consumers and Workflows (a re-enqueue loop billed $36k in a month); Workflows now bills per-step + SQLite (2026 change, verify pricing); new templates default observability ON at ~3x request cost — disable if unused.'
  - Why: 5 recursion stories up to $36k, 2 Workflows-reprice stories, 2 observability-default stories; the current hint covers quotas but not the loop/no-cap/reprice traps
- **[providers.js (Vercel entry)]** Edit Vercel hint: append 'Firewall/bot protection is NOT auto-on: scanner and DDoS traffic bills invocations + bandwidth until enabled (firewall-mitigated traffic is free since 2026-05). Audit default meters: images.minimumCacheTTL (60s default = paid re-transforms), build machine tier (Turbo bills more), enabled add-ons (Code Review/v0), and leftover crons on dead projects.'
  - Why: 13 Vercel stories cluster on exactly these non-obvious defaults ($84-$46k); current hint covers quotas/spend-cap but none of the toggle traps
- **[providers.js (GitHub Actions entries)]** Edit both GitHub Actions entries: add to hints 'macOS runners bill ~10x Linux (agents love writing runs-on: macos), jobs default to a 6h timeout and bill every hung minute — set timeout-minutes, and add concurrency+cancel-in-progress before agent push loops (each push runs full CI).' Optionally extend the git-push `when` predicate to also flag workflows containing runs-on: macos.
  - Why: 9-10 stories; the existing hint covers the minutes quota but not the three multipliers (macOS, no-timeout, per-push agent CI) that actually burned people
- **[new provider (providers.js)]** New provider entry 'Agent CLI dual-rail': patterns cmd('claude') with when: !!process.env.ANTHROPIC_API_KEY, and cmd('codex') with when: !!process.env.OPENAI_API_KEY → hint: '<KEY> is set in this environment: this CLI may bill pay-per-token API instead of your flat subscription (a $1,200 surprise reported). Unset the key or run in an isolated env.'
  - Why: 3 stories in one month, up to $1,200; perfectly detectable via the `when` predicate mechanism providers.js already supports
- **[new provider (providers.js)]** New provider entry 'Twilio/SMS': pattern cmd('twilio') or curl to api.twilio.com → hint: 'SMS pumping turns open OTP endpoints into $18k/day; before shipping: per-IP/per-number rate limits on OTP sends, lock Geo Permissions, and cap or disable auto-recharge (it refilled one victim\'s card 7 times). Refunds are partial at best.'
  - Why: 7 stories, $2k-$18k/day; a years-old recurring fraud pattern frugal has zero coverage for
- **[new provider (providers.js)]** New provider entry 'GPU clouds': pattern cmd('runpodctl|vastai|modal') → hint: 'GPU time bills wall-clock even when idle/crashed: set auto-stop/TTL and a wall-clock timeout before long runs, checkpoint often, and verify zero running pods (runpodctl get pod / fly of the equivalent) before ending the session.'
  - Why: 7 stories ($23/night to $1,800/mo); CLIs are shell-visible and the fix (auto-stop + verify-dead) matches frugal's 'ephemeral things must die' rule
- **[new provider (providers.js)]** New provider entry 'Observability/logs': pattern cmd('datadog-agent') or 'aws logs create-log-group|put-retention-policy' or DD_API_KEY in install one-liners → hint: 'Log/trace ingest bills per GB (CloudWatch ~$0.50/GB; Datadog ingest AND indexing): never ship DEBUG or full request bodies from prod, set retention on every log group, sample success-path logs/spans, keep user_id/request_id out of metric tags (each combo is a billed series).'
  - Why: 10+ stories, $18k-$50k/mo — the largest recurring-magnitude cluster with zero current coverage; agent-written logging code caused two of them
- **[SKILL.md rules (mirror in AGENTS.md)]** New rule bullet: 'Unattended agent runs need brakes: anything backgrounded (nohup/tmux/&/overnight) must have a hard budget, a max-retry circuit breaker on failing calls, and a kill criterion; sub-agent fan-out multiplies token cost N× per prompt — cap concurrency.'
  - Why: 8+ stories ($40/10s to ~$8k overnight); frugal's audience IS the agent, making this a self-governing rule rather than a detection problem
- **[SKILL.md rules (mirror in AGENTS.md)]** New rule bullet: 'Bots bill you: before any metered surface goes public, assume crawlers and scanners will hit every URL — block AI crawlers/scanner paths (/wp-admin, *.php) at the edge, never bind per-request DB reads or function invocations to public pages, and rate-limit OTP/send endpoints.'
  - Why: Cross-provider mechanism in 8+ stories (Vercel scanners, Googlebot×Firestore 68M reads, Meta crawler 8x Render bandwidth, SMS pumping, Maps key farming)
- **[providers.js (Neon entry)]** Edit Neon hint: append 'default autoscale ceiling is 8 CU — a traffic spike bills ~$20/day until you cap max CU; paid computes bill a 0.25 CU minimum even near-idle (~$19/mo for nothing); network egress can be 60% of the invoice — avoid bulk pg_dump/export patterns off-region.'
  - Why: 5 stories; current hint covers CU-hours and spend limits but not the toxic 8-CU default, the 0.25 floor, or the network meter
- **[providers.js (Supabase entry)]** Edit Supabase hint: append 'egress is POOLED across all services at $0.09/GB past quota — media served from Supabase Storage is the #1 burner ($600/mo cases); put files on R2/CDN instead.'
  - Why: 4-5 stories all with the same mechanism; current hint covers pause/projects but not the egress meter that actually generated the dollar stories
- **[providers.js (AWS entry)]** Edit AWS hint: append 'after terminating instances, release Elastic IPs/public IPv4 in EVERY region ($0.005/hr each, hidden under the VPC line item) and delete volumes/snapshots — stopped RDS still bills storage+IPs and auto-restarts after 7 days.'
  - Why: 10+ orphan-resource stories; the IPv4-under-VPC misattribution kept one user paying for a year+ after 'leaving AWS'
- **[SKILL.md rules]** New rule bullet: 'Pricing models change under you: on any unexplained bill jump, check the provider\'s pricing changelog BEFORE debugging your own code (CF Workflows moved to per-step billing unannounced in 2026; SendGrid killed its free tier; Supabase repriced compute).'
  - Why: 4+ stories where victims wasted hours assuming they broke something; cheap one-line rule, not detectable from commands

## Services to research next (burn-ranked)

- Datadog (log ingest/indexing, APM spans, custom-metric cardinality, per-host high-watermark)
- AWS CloudWatch Logs (ingest $/GB, retention defaults, Logs Insights per-GB-scanned, custom metrics)
- Twilio + SMS/OTP providers (SMS pumping, toll fraud, auto-recharge, per-number fees; Termii, Verify)
- Firebase as a distinct provider (Firestore/RTDB read meters, recursive triggers, API-key surface, Storage egress)
- Google Maps/Places APIs (per-request billing, post-2025 credit removal, client-side key farming)
- Mapbox / metered map-tile providers (no spend cap; MapLibre/self-hosted alternatives)
- OpenAI/Anthropic raw API + agent CLIs (dual-rail sub-vs-API billing, Cursor Max Mode, prepaid drain, plan usage units)
- RunPod / Modal / Vast.ai GPU rentals (idle pod-hours, warm endpoints, crash billing)
- Heroku (no free tier since 2022, zombie dynos/add-ons)
- Render (per-service instance stacking, egress overage $30/100GB, AI-crawler bandwidth)
- Git LFS (10GB/mo bandwidth, fork-chain attribution, account-lock enforcement)
- MongoDB Atlas (hourly paid clusters, fast-up/slow-down autoscaling)
- Sentry (per-event billing, noise filtering, spend caps)
- Replicate (per-prediction GPU-seconds, token leak = open wallet)
- Email ESPs: Resend/Mailgun/SendGrid (agent send loops, inbound-mail metering, free-tier erosion)
- Cloudinary (credit-metered bandwidth/transforms on media)
- Pinecone (pod-hours billed at zero QPS)
- TiDB Cloud / RU-metered serverless DBs (per-request-unit billing without object caches)
- Alibaba Cloud / Volcengine (postpaid arrears past zero balance, metered bandwidth defaults)
- BunnyCDN / metered CDNs (attack traffic without default bandwidth caps)