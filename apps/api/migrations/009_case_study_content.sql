-- +goose Up
ALTER TABLE case_studies ADD COLUMN IF NOT EXISTS content_html TEXT;

UPDATE case_studies SET content_html = $$<h2>Overview</h2>
<p>WhatsApp delivers encrypted messaging to over two billion users while famously operating with a tiny engineering team relative to its scale. The system prioritizes <strong>reliability on unreliable mobile networks</strong>, <strong>end-to-end encryption</strong>, and <strong>extreme efficiency per message</strong> over feature breadth.</p>
<p>Early architectural bets — Erlang for massive concurrency, FreeBSD for network performance, and a deliberately simple service topology — let WhatsApp handle connection storms and offline delivery without the operational complexity of a sprawling microservice mesh.</p>

<h2>The problem</h2>
<p>Mobile networks drop, devices sleep, and users expect messages to arrive eventually even when the recipient is offline for days. A chat backend must guarantee delivery semantics, maintain presence without draining batteries, and fan out group messages without melting servers.</p>
<p>Encryption adds another constraint: the server cannot read message bodies for routing logic beyond metadata, so storage, retry, and multi-device sync must work with ciphertext and minimal server-side state.</p>

<h2>Requirements</h2>
<ul>
<li><strong>Delivery guarantees</strong> — at-least-once with client-side deduplication; offline queue until ACK</li>
<li><strong>Low operational footprint</strong> — fewer moving parts than hyperscale social graphs</li>
<li><strong>End-to-end encryption</strong> — server stores and forwards ciphertext only</li>
<li><strong>Massive connection count</strong> — millions of long-lived TCP sessions per node</li>
<li><strong>Group fan-out</strong> — bounded latency for large groups without head-of-line blocking</li>
<li><strong>Multi-device</strong> — consistent session state across phone, web, and tablet</li>
</ul>

<h2>Architecture</h2>
<p>WhatsApp's backend is built around <strong>Erlang/OTP</strong> processes — lightweight actors that map naturally to one session or one conversation shard. BEAM's preemptive scheduling and "let it crash" supervision trees isolate failures so a poison message does not take down a whole host.</p>
<p>Core components include connection gateways, an offline message store, presence (last-seen) services, and multi-datacenter replication for disaster recovery. Push notifications wake sleeping clients; the in-app socket handles active sessions.</p>
<h3>Key components</h3>
<ul>
<li><strong>Connection layer</strong> — persistent sockets, heartbeats, backoff on flaky networks</li>
<li><strong>Message store</strong> — durable queue per recipient for offline delivery</li>
<li><strong>Presence</strong> — last-seen timestamps instead of constant online polling</li>
<li><strong>Group service</strong> — membership cache + controlled fan-out with backpressure</li>
<li><strong>Replication</strong> — cross-DC sync for availability, not active-active writes everywhere</li>
</ul>

<h2>Data flow</h2>
<p>When Alice sends a message, the client encrypts on-device. The server accepts metadata + ciphertext, persists for durability, then routes to online sessions or queues for offline recipients.</p>
<div class="cs-flow">
<div class="cs-flow-step"><span class="cs-flow-num">1</span><div><strong>Client encrypts</strong><p>Plaintext never leaves the device unencrypted; keys are negotiated out of band (Signal protocol).</p></div></div>
<div class="cs-flow-step"><span class="cs-flow-num">2</span><div><strong>Edge accepts</strong><p>Gateway validates session, assigns a server-side message ID, writes to durable storage.</p></div></div>
<div class="cs-flow-step"><span class="cs-flow-num">3</span><div><strong>Route or queue</strong><p>If recipient socket is live, push frame immediately; else store in offline inbox.</p></div></div>
<div class="cs-flow-step"><span class="cs-flow-num">4</span><div><strong>Group fan-out</strong><p>For groups, expand membership list and enqueue per member with rate limits.</p></div></div>
<div class="cs-flow-step"><span class="cs-flow-num">5</span><div><strong>Client ACK</strong><p>Recipient ACK triggers deletion from offline store; retries on timeout.</p></div></div>
<div class="cs-flow-step"><span class="cs-flow-num">6</span><div><strong>Push fallback</strong><p>APNs/FCM wakes app when socket is down; client pulls pending messages.</p></div></div>
</div>

<h2>Scaling</h2>
<p>WhatsApp scaled by making each node extremely efficient rather than adding endless service types. Erlang's per-connection memory footprint and BEAM scheduling let a single machine handle huge numbers of concurrent sessions.</p>
<p>User sharding partitions conversations and inboxes. Group messages apply backpressure — large groups batch fan-out and cap burst rates so one viral message cannot exhaust worker pools. Vertical scaling per node remained viable longer than in typical CRUD web stacks because the workload is I/O-bound and connection-heavy, not CPU-heavy per request.</p>

<h2>Tradeoffs</h2>
<div class="cs-table-wrap"><table class="cs-table"><thead><tr><th>Choice</th><th>Benefit</th><th>Cost</th></tr></thead><tbody>
<tr><td>Erlang monolith-style clusters</td><td>Massive concurrency, simple mental model</td><td>Smaller hiring pool; harder polyglot integration</td></tr>
<tr><td>Offline store per user</td><td>Reliable delivery on bad networks</td><td>Storage growth; retention policies required</td></tr>
<tr><td>Last-seen presence</td><td>Battery-friendly, low chatter</td><td>Less real-time than always-on presence</td></tr>
<tr><td>E2E encryption</td><td>User trust, reduced compliance surface</td><td>No server-side search/mod AI on message body</td></tr>
<tr><td>Minimal feature surface</td><td>Operational stability at scale</td><td>Product velocity capped by simplicity ethos</td></tr>
</tbody></table></div>

<h2>Lessons</h2>
<ul>
<li>Match your runtime to the dominant workload — connections and message passing favor Erlang/BEAM.</li>
<li>Design for offline-first mobile: assume the network lies.</li>
<li>Keep the server dumb about content when E2E is a requirement — push complexity to clients.</li>
<li>Fan-out is the hidden killer in group chat; rate-limit and batch early.</li>
<li>Simplicity in architecture beats feature sprawl when reliability is the product.</li>
</ul>

<div class="cs-related"><strong>Further reading in StackJournal</strong><ul>
<li><a href="/categories/distributed-systems">Distributed Systems articles</a></li>
<li><a href="/categories/operating-systems">Operating Systems articles</a></li>
<li><a href="/categories/networking">Networking articles</a></li>
</ul></div>$$
WHERE slug = 'whatsapp-messaging';

UPDATE case_studies SET content_html = $$<h2>Overview</h2>
<p>Uber's dispatch system matches riders and drivers in real time across hundreds of cities. At peak, millions of concurrent location updates and match requests must resolve in sub-second latency while respecting supply constraints, surge pricing, and driver fairness.</p>
<p>The architecture treats matching as a <strong>continuous geo-spatial search problem</strong> backed by ring expansion, dedicated matching services, and an async pipeline for ETAs and trip state — not a single database query.</p>

<h2>The problem</h2>
<p>Demand spikes unpredictably (events, weather, rush hour). Drivers and riders move constantly, so any stale index produces bad matches. The system must balance rider wait time, driver utilization, and pricing signals without centralized bottlenecks per city.</p>
<p>Failures are routine: driver apps go offline mid-offer, GPS jitters, and partition events split regional clusters. Matching must degrade gracefully rather than double-book drivers.</p>

<h2>Requirements</h2>
<ul>
<li><strong>Sub-second match</strong> — p99 rider wait for first offer under load</li>
<li><strong>Geo-proximity</strong> — nearest feasible driver, not Euclidean distance only</li>
<li><strong>Surge pricing</strong> — dynamic supply/demand pricing per hex/zone</li>
<li><strong>Fault tolerance</strong> — offer timeouts, automatic re-offer, no ghost trips</li>
<li><strong>Global scale</strong> — partition by city/region; no single worldwide lock</li>
<li><strong>Fairness</strong> — avoid starving drivers or hammering the same pool</li>
</ul>

<h2>Architecture</h2>
<p>Uber partitions the world into geospatial cells (H3/S2-style hierarchies). Live driver locations stream into regional indexes. A matching service queries expanding rings around the rider until it finds eligible drivers, then runs an offer/accept loop with timeouts.</p>
<p>Trip lifecycle is a state machine: requested → offered → accepted → in-progress → completed. ETAs and routing run asynchronously so the hot path stays lean. Surge multipliers are computed per zone from supply/demand ratios cached at the edge.</p>
<h3>Key components</h3>
<ul>
<li><strong>Location pipeline</strong> — high-throughput ingest of GPS pings, filtered for accuracy</li>
<li><strong>Geospatial index</strong> — hex cells mapping drivers to shards</li>
<li><strong>Matching service</strong> — ring expansion, scoring (ETA, rating, direction)</li>
<li><strong>Dispatch state machine</strong> — offers, timeouts, re-dispatch rules</li>
<li><strong>Pricing service</strong> — surge surfaces to riders before request confirmation</li>
<li><strong>Trip store</strong> — authoritative trip record + event log for downstream analytics</li>
</ul>

<h2>Data flow</h2>
<div class="cs-flow">
<div class="cs-flow-step"><span class="cs-flow-num">1</span><div><strong>Rider request</strong><p>App sends pickup, dropoff, and payment method; pricing shown with current surge.</p></div></div>
<div class="cs-flow-step"><span class="cs-flow-num">2</span><div><strong>Shard lookup</strong><p>Request routed to city/region shard owning the pickup cell.</p></div></div>
<div class="cs-flow-step"><span class="cs-flow-num">3</span><div><strong>Ring expansion</strong><p>Search outward in geospatial rings for available drivers passing filters.</p></div></div>
<div class="cs-flow-step"><span class="cs-flow-num">4</span><div><strong>Offer loop</strong><p>Top candidates receive timed offers; first accept wins, others released.</p></div></div>
<div class="cs-flow-step"><span class="cs-flow-num">5</span><div><strong>Trip activation</strong><p>State machine transitions to en-route; rider and driver streams subscribe to updates.</p></div></div>
<div class="cs-flow-step"><span class="cs-flow-num">6</span><div><strong>Async ETA</strong><p>Routing service refreshes ETA as traffic and positions change.</p></div></div>
</div>

<h2>Scaling</h2>
<p>Horizontal sharding by geography is the primary lever — each region owns its index and matching pool. Hot zones (airports, stadiums) get dedicated capacity and tighter backpressure rules. Caching supply/demand ratios avoids recomputing surge on every ping.</p>
<p>During peaks, queue backpressure sheds non-critical work (analytics enrichment) while preserving the offer path. Chaos testing and regional failover ensure one AZ loss does not blank a city.</p>

<h2>Tradeoffs</h2>
<div class="cs-table-wrap"><table class="cs-table"><thead><tr><th>Choice</th><th>Benefit</th><th>Cost</th></tr></thead><tbody>
<tr><td>Regional sharding</td><td>Low latency, blast-radius containment</td><td>Cross-region trips need handoff logic</td></tr>
<tr><td>Ring expansion vs global optimal</td><td>Fast, predictable queries</td><td>Not mathematically optimal match</td></tr>
<tr><td>Offer timeouts</td><td>Prevents stuck trips</td><td>Rider experience suffers if too aggressive</td></tr>
<tr><td>Surge pricing</td><td>Balances supply/demand</td><td>User backlash; requires transparency</td></tr>
<tr><td>Central trip state machine</td><td>Correct lifecycle</td><td>Hot shard risk for mega-events</td></tr>
</tbody></table></div>

<h2>Lessons</h2>
<ul>
<li>Partition by geography early — global matching does not scale linearly.</li>
<li>Treat dispatch as a state machine with explicit timeouts, not fire-and-forget RPC.</li>
<li>Separate the hot matching path from ETA/routing compute.</li>
<li>Invest in geospatial indexing primitives (H3/S2) instead of ad-hoc lat/lon queries.</li>
<li>Load-test stadium-scale events before they happen on New Year's Eve.</li>
</ul>

<div class="cs-related"><strong>Further reading in StackJournal</strong><ul>
<li><a href="/categories/system-design">System Design articles</a></li>
<li><a href="/categories/distributed-systems">Distributed Systems articles</a></li>
<li><a href="/categories/backend">Backend articles</a></li>
</ul></div>$$
WHERE slug = 'uber-dispatch';

UPDATE case_studies SET content_html = $$<h2>Overview</h2>
<p>Netflix streams billions of hours of video monthly to a global audience on devices ranging from phones to smart TVs. The platform combines a <strong>microservice control plane</strong>, a <strong>custom CDN (Open Connect)</strong>, and deep personalization to deliver reliable playback on unreliable last-mile networks.</p>
<p>Engineering culture emphasizes <strong>chaos engineering</strong>, regional isolation, and encoding ladders tuned per device — availability is a feature, not an afterthought.</p>

<h2>The problem</h2>
<p>Video is bulky; origin-serving every stream from a central cloud would be cost-prohibitive and latency-heavy. Clients buffer on variable Wi‑Fi and cellular links. Rights and compliance differ by country, so content availability and encryption requirements vary regionally.</p>
<p>Personalization (thumbnails, rankings, autoplay decisions) must happen at scale without coupling the playback path to recommendation experiments.</p>

<h2>Requirements</h2>
<ul>
<li><strong>High availability</strong> — playback survives regional failures and partial outages</li>
<li><strong>Adaptive bitrate</strong> — switch quality layers as bandwidth fluctuates</li>
<li><strong>Global CDN</strong> — cache hot titles near users via Open Connect appliances</li>
<li><strong>Cost efficiency</strong> — offload bits to ISP-embedded caches where possible</li>
<li><strong>Regional compliance</strong> — geo-fenced catalogs and DRM</li>
<li><strong>Experimentation</strong> — A/B tests without risking the streaming hot path</li>
</ul>

<h2>Architecture</h2>
<p>Client apps talk to an API gateway fronting domain microservices (membership, billing, playback authorization, recommendations). Video bytes flow through Open Connect — Netflix-operated caches inside ISP networks and regional PoPs — falling back to origin only on cache miss.</p>
<p>Content is encoded into multiple bitrate/resolution profiles (the encoding ladder). Player logic selects segments based on throughput estimates. Event-driven pipelines (Kafka-style buses) propagate viewing events, encoding jobs, and personalization features.</p>
<h3>Key components</h3>
<ul>
<li><strong>Open Connect</strong> — CDN appliances, proactive title placement</li>
<li><strong>Encoding pipeline</strong> — per-title/per-scene ladders, codec evolution (AV1, HEVC)</li>
<li><strong>Playback API</strong> — signed URLs, DRM license exchange</li>
<li><strong>Recommendation services</strong> — batch + online features, isolated from playback SLA</li>
<li><strong>Chaos tooling</strong> — Simian Army style failure injection in production</li>
<li><strong>Regional stacks</strong> — active-active where feasible, controlled failover otherwise</li>
</ul>

<h2>Data flow</h2>
<div class="cs-flow">
<div class="cs-flow-step"><span class="cs-flow-num">1</span><div><strong>Play request</strong><p>Client asks playback service for manifest + DRM tokens after auth.</p></div></div>
<div class="cs-flow-step"><span class="cs-flow-num">2</span><div><strong>Manifest delivery</strong><p>DASH/HLS manifest lists segment URLs on nearest Open Connect node.</p></div></div>
<div class="cs-flow-step"><span class="cs-flow-num">3</span><div><strong>Segment fetch</strong><p>Player downloads chunks; ABR algorithm switches rungs on buffer health.</p></div></div>
<div class="cs-flow-step"><span class="cs-flow-num">4</span><div><strong>Cache miss path</strong><p>Edge appliance fills from regional origin or peer cache.</p></div></div>
<div class="cs-flow-step"><span class="cs-flow-num">5</span><div><strong>Telemetry</strong><p>QoE metrics (rebuffer, bitrate) stream to analytics for capacity planning.</p></div></div>
</div>

<h2>Scaling</h2>
<p>Netflix scales by pushing bytes closer to users — ISP partnerships embed caches that serve a large fraction of primetime traffic. Stateless API tiers auto-scale horizontally; state lives in Cassandra/Dynamo-style stores partitioned by customer/region.</p>
<p>Proactive caching places new releases on appliances before launch hour. Multi-region active-active reduces blast radius; chaos exercises validate that failover paths actually work under load.</p>

<h2>Tradeoffs</h2>
<div class="cs-table-wrap"><table class="cs-table"><thead><tr><th>Choice</th><th>Benefit</th><th>Cost</th></tr></thead><tbody>
<tr><td>Owned CDN vs third-party</td><td>Cost control, tailored placement</td><td>Capital + ops for appliances</td></tr>
<tr><td>Microservices</td><td>Team autonomy, independent deploys</td><td>Operational overhead, distributed tracing needs</td></tr>
<tr><td>Aggressive ABR</td><td>Smooth playback on bad links</td><td>Quality swings visible to users</td></tr>
<tr><td>Chaos in production</td><td>Proven resilience</td><td>Requires mature culture and guardrails</td></tr>
</tbody></table></div>

<h2>Lessons</h2>
<ul>
<li>Build or partner for CDN capacity — origin egress does not scale for video.</li>
<li>Invest in observability and failure injection before peak traffic finds your gaps.</li>
<li>Decouple personalization from playback — different SLAs, different failure modes.</li>
<li>Encoding ladders are a product decision as much as an engineering one.</li>
</ul>

<div class="cs-related"><strong>Further reading in StackJournal</strong><ul>
<li><a href="/categories/cloud">Cloud articles</a></li>
<li><a href="/categories/distributed-systems">Distributed Systems articles</a></li>
<li><a href="/categories/system-design">System Design articles</a></li>
</ul></div>$$
WHERE slug = 'netflix-streaming';

UPDATE case_studies SET content_html = $$<h2>Overview</h2>
<p>Stripe's public APIs power payments for millions of businesses. Clients on unreliable networks retry failed POST requests — without guardrails, those retries create <strong>duplicate charges</strong>. Idempotency keys give callers exactly-once <em>semantics</em> while the implementation remains at-least-once under the hood.</p>
<p>This pattern is now industry standard for mutating APIs, but Stripe's version includes strict body fingerprinting, TTL windows, and concurrency locks that are worth studying in detail.</p>

<h2>The problem</h2>
<p>HTTP POST is not naturally idempotent. Mobile clients, proxies, and user double-taps cause duplicate submissions with the same intent. Payment operations are especially dangerous: a duplicated charge erodes trust and triggers expensive support workflows.</p>
<p>The server must recognize "same logical request" vs "same key, different payload" and respond consistently within a defined time window.</p>

<h2>Requirements</h2>
<ul>
<li><strong>Same key → same response</strong> for 24 hours (Stripe's window)</li>
<li><strong>Body mismatch detection</strong> — reject reuse of a key with altered parameters</li>
<li><strong>Concurrent safety</strong> — parallel retries must not double-process</li>
<li><strong>Low latency overhead</strong> — lookup on every mutating request</li>
<li><strong>Storage TTL</strong> — keys expire automatically to bound storage</li>
</ul>

<h2>Architecture</h2>
<p>Clients send an <code>Idempotency-Key</code> header (UUID recommended). The API layer performs a fast lookup in a durable store (Redis + DB backing). If a completed response exists, return it immediately. If in-flight, wait or return conflict. If new, acquire a lock, process, persist response, release.</p>
<h3>Key components</h3>
<ul>
<li><strong>Idempotency middleware</strong> — intercepts POST/PUT/PATCH on supported routes</li>
<li><strong>Key store</strong> — maps (account, key) → request hash + response body + status</li>
<li><strong>Processing lock</strong> — prevents duplicate side effects during first execution</li>
<li><strong>Request fingerprint</strong> — hash of method, path, and canonical body</li>
</ul>

<h2>Data flow</h2>
<div class="cs-flow">
<div class="cs-flow-step"><span class="cs-flow-num">1</span><div><strong>Client sends key</strong><p>UUID in <code>Idempotency-Key</code> header with payment payload.</p></div></div>
<div class="cs-flow-step"><span class="cs-flow-num">2</span><div><strong>Lookup</strong><p>Store hit with matching fingerprint → replay stored HTTP response.</p></div></div>
<div class="cs-flow-step"><span class="cs-flow-num">3</span><div><strong>Fingerprint mismatch</strong><p>Same key, different body → 400 class error; never silent corruption.</p></div></div>
<div class="cs-flow-step"><span class="cs-flow-num">4</span><div><strong>Lock &amp; process</strong><p>First request acquires lock, executes charge, saves response envelope.</p></div></div>
<div class="cs-flow-step"><span class="cs-flow-num">5</span><div><strong>Retry arrives</strong><p>Parallel retry sees in-flight or completed record; returns same result.</p></div></div>
<div class="cs-flow-step"><span class="cs-flow-num">6</span><div><strong>TTL expiry</strong><p>After 24h, key slot frees; new request with same key treated as new.</p></div></div>
</div>

<h2>Scaling</h2>
<p>The key store is sharded by merchant/account ID to avoid hot keys at large sellers. Redis gives sub-millisecond lookups; PostgreSQL or Dynamo provides durability if Redis evicts. Unique constraints on (account_id, idempotency_key) catch races at the database layer.</p>
<p>Response bodies are stored compressed; only mutating routes participate — reads skip the path entirely.</p>

<h2>Tradeoffs</h2>
<div class="cs-table-wrap"><table class="cs-table"><thead><tr><th>Choice</th><th>Benefit</th><th>Cost</th></tr></thead><tbody>
<tr><td>24h TTL</td><td>Bounds storage; matches retry windows</td><td>Keys reusable after expiry — document clearly</td></tr>
<tr><td>Strict body matching</td><td>Prevents accidental key reuse bugs</td><td>Client must generate fresh keys for new intents</td></tr>
<tr><td>Stored response replay</td><td>True semantic replay including errors</td><td>Storage + schema versioning for API changes</td></tr>
<tr><td>Global lock per key</td><td>Correctness under concurrency</td><td>Latency tail if processing slow</td></tr>
</tbody></table></div>

<h2>Lessons</h2>
<ul>
<li>Make idempotency a first-class API primitive, not a footnote in docs.</li>
<li>Always fingerprint the body — keys alone are insufficient.</li>
<li>Replay error responses too; clients depend on consistent outcomes.</li>
<li>Document TTL and key generation rules prominently in SDKs.</li>
</ul>

<div class="cs-related"><strong>Further reading in StackJournal</strong><ul>
<li><a href="/categories/backend">Backend articles</a></li>
<li><a href="/categories/databases">Databases articles</a></li>
<li><a href="/categories/distributed-systems">Distributed Systems articles</a></li>
</ul></div>$$
WHERE slug = 'stripe-idempotency';

UPDATE case_studies SET content_html = $$<h2>Overview</h2>
<p>Cloudflare operates one of the largest edge networks on the internet — anycasted PoPs worldwide terminate TLS, filter attacks, cache content, and run Workers close to users. The design goal is simple: <strong>push security and performance to the edge</strong> so origin datacenters see less traffic and fewer threats.</p>
<p>Underneath sits a split between a centralized control plane (config, DNS, certificates) and a distributed data plane (HTTP handling, caching, WAF) that must survive partition and volumetric DDoS events.</p>

<h2>The problem</h2>
<p>Modern sites face constant background attacks plus occasional multi-Tbps floods. Routing all traffic through a single origin exposes both capacity and security weaknesses. TLS termination, HTTP/2 prioritization, and cache validation need to happen geographically close to users without stale or poisoned cache entries.</p>
<p>Configuration changes (new WAF rule, DNS update) must propagate globally in seconds without dropping in-flight connections.</p>

<h2>Requirements</h2>
<ul>
<li><strong>Anycast routing</strong> — users hit the nearest healthy PoP automatically</li>
<li><strong>DDoS absorption</strong> — scale horizontally across edge; shed attack traffic</li>
<li><strong>TLS at edge</strong> — certificate lifecycle, OCSP stapling, HTTP/3</li>
<li><strong>Cache hierarchy</strong> — tiered caches, origin shield, cache key discipline</li>
<li><strong>Programmability</strong> — Workers/Lua at edge for custom logic</li>
<li><strong>Fast config propagation</strong> — global consistency with local autonomy</li>
</ul>

<h2>Architecture</h2>
<p>DNS resolves to Cloudflare anycast IPs. BGP advertises the same prefix from every PoP; routing pulls users to a nearby node. Each PoP runs proxies, cache disks, WAF engines, and optional Workers isolates. A central control plane pushes versioned config bundles; PoPs apply atomically.</p>
<p>R2/KV provide edge-adjacent storage for low-latency reads. Argo-style smart routing picks optimal paths between PoPs and origins on cache miss.</p>
<h3>Key components</h3>
<ul>
<li><strong>AnyCast + BGP</strong> — global load distribution, automatic failover</li>
<li><strong>Reverse proxy</strong> — HTTP/S termination, HTTP/2 and HTTP/3 support</li>
<li><strong>WAF / Bot management</strong> — rule engine, ML signals, rate limits</li>
<li><strong>Cache tiers</strong> — memory → SSD → regional tier → origin</li>
<li><strong>Workers runtime</strong> — V8 isolates for edge compute</li>
<li><strong>Control plane API</strong> — authoritative DNS, SSL, firewall rules</li>
</ul>

<h2>Data flow</h2>
<div class="cs-flow">
<div class="cs-flow-step"><span class="cs-flow-num">1</span><div><strong>DNS resolution</strong><p>Client resolves hostname to Cloudflare anycast address.</p></div></div>
<div class="cs-flow-step"><span class="cs-flow-num">2</span><div><strong>PoP selection</strong><p>BGP steers to nearest PoP; unhealthy nodes withdraw routes.</p></div></div>
<div class="cs-flow-step"><span class="cs-flow-num">3</span><div><strong>TLS + WAF</strong><p>Terminate HTTPS, evaluate firewall and bot scores.</p></div></div>
<div class="cs-flow-step"><span class="cs-flow-num">4</span><div><strong>Cache lookup</strong><p>Hit → respond from disk/RAM; miss → fetch from tier or origin.</p></div></div>
<div class="cs-flow-step"><span class="cs-flow-num">5</span><div><strong>Workers optional</strong><p>Edge script modifies request/response (headers, A/B, auth).</p></div></div>
<div class="cs-flow-step"><span class="cs-flow-num">6</span><div><strong>Origin fetch</strong><p>Shield PoP collapses origin connections; cache fill for subsequent hits.</p></div></div>
</div>

<h2>Scaling</h2>
<p>Edge scale is horizontal — add PoPs and bandwidth. Under attack, load shedding and challenge pages filter junk while keeping legitimate traffic. Tiered caching reduces origin load by serving stale-while-revalidate where configured.</p>
<p>Config snapshots versioned per customer allow rollback; canary PoPs test new proxy builds before fleet-wide rollout.</p>

<h2>Tradeoffs</h2>
<div class="cs-table-wrap"><table class="cs-table"><thead><tr><th>Choice</th><th>Benefit</th><th>Cost</th></tr></thead><tbody>
<tr><td>Centralized control plane</td><td>Single API for customers</td><td>Blast radius if misconfigured globally</td></tr>
<tr><td>Aggressive caching</td><td>Speed + origin protection</td><td>Invalidation complexity; dynamic content harder</td></tr>
<tr><td>Edge compute (Workers)</td><td>Latency + flexibility</td><td>CPU limits; debugging distributed logic</td></tr>
<tr><td>Anycast</td><td>Automatic geo routing</td><td>Debugging path issues is non-obvious</td></tr>
</tbody></table></div>

<h2>Lessons</h2>
<ul>
<li>Push TLS, caching, and security as close to the user as economically possible.</li>
<li>Treat config propagation as a distributed systems problem — version, diff, rollback.</li>
<li>Design cache keys deliberately; poisoned cache entries are production incidents.</li>
<li>Plan for Tbps attacks as normal operations, not edge cases.</li>
</ul>

<div class="cs-related"><strong>Further reading in StackJournal</strong><ul>
<li><a href="/categories/networking">Networking articles</a></li>
<li><a href="/categories/cloud">Cloud articles</a></li>
<li><a href="/categories/security">Security articles</a></li>
</ul></div>$$
WHERE slug = 'cloudflare-edge';

-- +goose Down
ALTER TABLE case_studies DROP COLUMN IF EXISTS content_html;
