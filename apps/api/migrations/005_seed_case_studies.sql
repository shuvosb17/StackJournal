-- +goose Up
INSERT INTO case_studies (title, slug, company, overview, problem, requirements, architecture, data_flow, scaling, tradeoffs, lessons, published_at) VALUES
(
    'Uber Dispatch System',
    'uber-dispatch',
    'Uber',
    'How Uber matches riders with drivers in real time across millions of concurrent requests.',
    'Low-latency matching at global scale with unpredictable demand spikes.',
    'Sub-second match, geo-proximity, surge pricing, fault tolerance.',
    'Geospatial indexing (H3/S2), ring-based dispatch, dedicated matching service, async ETA pipeline.',
    'Rider request → geospatial shard lookup → candidate driver ring expansion → offer/accept loop → trip state machine.',
    'Horizontal sharding by city/region, caching hot zones, queue backpressure during peaks.',
    'Consistency vs latency; offer timeouts vs driver experience; central vs edge matching.',
    'Partition by geography early. Treat matching as a state machine, not a one-shot query.',
    NOW() - INTERVAL '30 days'
),
(
    'Netflix Video Streaming',
    'netflix-streaming',
    'Netflix',
    'Architecture behind serving billions of hours of video with personalized recommendations.',
    'Global CDN, encoding ladder, playback on unreliable networks.',
    'High availability, adaptive bitrate, regional compliance, cost efficiency.',
    'Open Connect CDN, microservices (API gateway + domain services), Cassandra/Dynamo-style stores, Kafka event bus.',
    'Client → edge Open Connect → origin fallback → encoding profiles selected by device/network.',
    'Regional caches, active-active regions, chaos testing, auto-scaling stateless APIs.',
    'Cache footprint vs freshness; microservice granularity vs operational overhead.',
    'Invest in observability and failure injection before you need them at peak.',
    NOW() - INTERVAL '25 days'
),
(
    'WhatsApp Messaging at Scale',
    'whatsapp-messaging',
    'WhatsApp',
    'Delivering reliable messaging to hundreds of millions of users with minimal infrastructure.',
    'Message delivery guarantees on mobile networks with intermittent connectivity.',
    'Low server count, end-to-end encryption, offline delivery, group fan-out.',
    'Erlang/FreeBSD stack, offline message store, presence via last-seen, multi-datacenter replication.',
    'Client encrypts → edge accepts → persist → fan-out to online sessions or store for offline.',
    'Vertical scaling per node efficiency, sharded users, careful backpressure on groups.',
    'Simplicity beats feature sprawl; optimize for per-message cost early.',
    'Choose tech that matches concurrency model (Erlang for massive connections).',
    NOW() - INTERVAL '20 days'
),
(
    'Stripe Idempotency Keys',
    'stripe-idempotency',
    'Stripe',
    'Exactly-once semantics for payment APIs over unreliable networks.',
    'Duplicate charges when clients retry failed requests.',
    'Same response for same idempotency key within 24h; detect body mismatch.',
    'Idempotency key store (Redis/DB), request fingerprint, lock on key during processing.',
    'Client sends Idempotency-Key → lookup → return cached OR process + store response.',
    'Key TTL, sharded key store, race handling with unique constraints.',
    'Replay safety vs storage cost; strict body matching vs client bugs.',
    'Make idempotency a first-class API primitive for all mutating endpoints.',
    NOW() - INTERVAL '15 days'
),
(
    'Cloudflare Edge Network',
    'cloudflare-edge',
    'Cloudflare',
    'Anycast routing and edge caching for DDoS mitigation and low-latency delivery.',
    'Absorb volumetric attacks while serving static/dynamic content globally.',
    'Any IP anycast, WAF, TLS termination at edge, cache hierarchy.',
    'PoP mesh, BGP anycast, centralized control plane + distributed data plane, R2/KV at edge.',
    'DNS → nearest PoP → cache hit OR origin fetch → optional Workers compute.',
    'Tiered cache, Argo smart routing, load shedding under attack.',
    'Centralized config push vs edge autonomy; cache poisoning defenses.',
    'Push security and caching as close to the user as possible.',
    NOW() - INTERVAL '10 days'
);

-- +goose Down
DELETE FROM case_studies WHERE slug IN (
    'uber-dispatch', 'netflix-streaming', 'whatsapp-messaging',
    'stripe-idempotency', 'cloudflare-edge'
);
