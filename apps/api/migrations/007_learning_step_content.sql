-- +goose Up
ALTER TABLE learning_path_steps
    ADD COLUMN IF NOT EXISTS content_html TEXT,
    ADD COLUMN IF NOT EXISTS category_slug TEXT;

UPDATE learning_path_steps SET
    category_slug = 'backend',
    content_html = $$<h2>HTTP fundamentals</h2>
<p>HTTP is the contract between clients and servers. Every backend engineer should be fluent in methods, headers, status codes, and how caching interacts with requests.</p>
<h3>Core concepts</h3>
<ul>
<li><strong>Methods</strong> — GET (safe/read), POST (create), PUT/PATCH (update), DELETE (remove)</li>
<li><strong>Status codes</strong> — 2xx success, 4xx client error, 5xx server error</li>
<li><strong>Headers</strong> — Content-Type, Authorization, Cache-Control, ETag</li>
<li><strong>Statelessness</strong> — each request carries enough context; the server does not remember prior requests</li>
</ul>
<p>Practice by reading raw requests with curl and tracing them through a reverse proxy.</p>$$
WHERE title = 'HTTP';

UPDATE learning_path_steps SET
    category_slug = 'backend',
    content_html = $$<h2>REST API design</h2>
<p>REST organizes APIs around resources (nouns), not actions (verbs). Good REST makes APIs predictable and easy to evolve.</p>
<h3>Design rules</h3>
<ul>
<li>Use plural resource names: <code>/articles</code>, <code>/users/{id}</code></li>
<li>Map operations to HTTP methods instead of custom action URLs</li>
<li>Return consistent error shapes with machine-readable codes</li>
<li>Make mutating operations <strong>idempotent</strong> where possible (PUT, DELETE)</li>
</ul>
<p>Study public APIs (Stripe, GitHub) to see versioning, pagination, and rate-limit patterns in production.</p>$$
WHERE title = 'REST';

UPDATE learning_path_steps SET
    category_slug = 'databases',
    content_html = $$<h2>Relational databases</h2>
<p>Databases are the source of truth for most backend systems. Understanding storage, indexing, and transactions prevents outages at scale.</p>
<h3>What to master</h3>
<ul>
<li>Schema design and normalization tradeoffs</li>
<li>Indexes — B-tree basics, composite indexes, when indexes hurt writes</li>
<li>Transactions — ACID, isolation levels, deadlocks</li>
<li>Query planning — EXPLAIN, N+1 problems, connection pooling</li>
</ul>
<p>Postgres is an excellent default: rich SQL, JSON support, and strong ecosystem tooling.</p>$$
WHERE title = 'Databases';

UPDATE learning_path_steps SET
    category_slug = 'backend',
    content_html = $$<h2>Caching strategies</h2>
<p>Caches move data closer to readers and protect databases from hot keys. Every cache introduces consistency tradeoffs you must design for.</p>
<h3>Common patterns</h3>
<ul>
<li><strong>Cache-aside</strong> — app reads cache first, loads DB on miss, writes back</li>
<li><strong>Write-through</strong> — writes go to cache and DB together</li>
<li><strong>TTL + eviction</strong> — LRU, LFU, or time-based expiry</li>
<li><strong>Invalidation</strong> — the hard part; prefer explicit keys over wild guesses</li>
</ul>
<p>Redis is the usual choice for session, rate-limit, and hot-object caching.</p>$$
WHERE title = 'Caching';

UPDATE learning_path_steps SET
    category_slug = 'distributed-systems',
    content_html = $$<h2>Message queues</h2>
<p>Queues decouple producers and consumers so spikes, retries, and background work do not take down the request path.</p>
<h3>Key ideas</h3>
<ul>
<li>At-least-once vs at-most-once vs exactly-once delivery</li>
<li>Backpressure — slow consumers should not crash producers</li>
<li>Dead-letter queues for poison messages</li>
<li>Idempotent consumers — required when retries happen</li>
</ul>
<p>Kafka, SQS, and NATS each optimize for different throughput and ordering guarantees.</p>$$
WHERE title = 'Message Queues';

UPDATE learning_path_steps SET
    category_slug = 'distributed-systems',
    content_html = $$<h2>Distributed systems</h2>
<p>Once you have multiple nodes, failures become normal. Distributed systems engineering is about designing for partial failure.</p>
<h3>Foundational topics</h3>
<ul>
<li>CAP theorem and practical PACELC thinking</li>
<li>Replication — leader/follower, quorum reads/writes</li>
<li>Consensus — Raft/Paxos at a conceptual level</li>
<li>Clocks, ordering, and eventual consistency</li>
</ul>
<p>Read real postmortems to see split-brain, cascading failure, and retry storms in the wild.</p>$$
WHERE title = 'Distributed Systems';

UPDATE learning_path_steps SET
    category_slug = 'kubernetes',
    content_html = $$<h2>Kubernetes basics</h2>
<p>Kubernetes orchestrates containers: scheduling, networking, scaling, and rolling updates across a cluster.</p>
<h3>Objects to know</h3>
<ul>
<li><strong>Pod</strong> — smallest deployable unit</li>
<li><strong>Deployment</strong> — declarative rollouts and rollbacks</li>
<li><strong>Service</strong> — stable network endpoint for pods</li>
<li><strong>Ingress</strong> — HTTP routing into the cluster</li>
</ul>
<p>Start with minikube or kind, deploy a small API, and practice kubectl debugging workflows.</p>$$
WHERE title = 'Kubernetes';

UPDATE learning_path_steps SET
    category_slug = 'cloud',
    content_html = $$<h2>Cloud operations</h2>
<p>Cloud platforms trade capital expense for operational flexibility. The job is picking managed services wisely and controlling cost.</p>
<h3>Operational focus</h3>
<ul>
<li>Managed vs self-hosted tradeoffs (RDS, S3, Lambda, etc.)</li>
<li>Observability — metrics, logs, traces as first-class requirements</li>
<li>IAM least privilege and secret management</li>
<li>Cost visibility — tags, budgets, right-sizing</li>
</ul>
<p>AWS, GCP, and Azure differ in ergonomics, but the architectural patterns repeat across all three.</p>$$
WHERE title = 'Cloud';

-- +goose Down
ALTER TABLE learning_path_steps
    DROP COLUMN IF EXISTS content_html,
    DROP COLUMN IF EXISTS category_slug;
