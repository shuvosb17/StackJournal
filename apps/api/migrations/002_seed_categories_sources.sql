-- +goose Up
INSERT INTO categories (name, slug, icon, sort_order, is_learning) VALUES
    ('AI', 'ai', 'brain', 1, false),
    ('Backend', 'backend', 'server', 2, true),
    ('Cloud', 'cloud', 'cloud', 3, false),
    ('System Design', 'system-design', 'layers', 4, true),
    ('Learning', 'learning', 'graduation-cap', 5, true),
    ('Career', 'career', 'briefcase', 6, false),
    ('Hiring', 'hiring', 'users', 7, false),
    ('Security', 'security', 'shield', 8, true),
    ('Linux', 'linux', 'terminal', 9, true),
    ('Open Source', 'open-source', 'git-branch', 10, false),
    ('DevOps', 'devops', 'workflow', 11, false),
    ('Databases', 'databases', 'database', 12, true),
    ('Go', 'go', 'code', 13, false),
    ('Docker', 'docker', 'container', 14, false),
    ('Kubernetes', 'kubernetes', 'boxes', 15, false),
    ('AWS', 'aws', 'cloud-cog', 16, false),
    ('Networking', 'networking', 'network', 17, true),
    ('Distributed Systems', 'distributed-systems', 'share-2', 18, true),
    ('Operating Systems', 'operating-systems', 'cpu', 19, true),
    ('Case Studies', 'case-studies', 'book-open', 20, true);

INSERT INTO sources (name, slug, url, feed_url, source_type) VALUES
    ('Go Blog', 'go-blog', 'https://go.dev/blog/', 'https://go.dev/blog/feed.atom', 'rss'),
    ('AWS Blog', 'aws-blog', 'https://aws.amazon.com/blogs/', 'https://aws.amazon.com/blogs/aws/feed/', 'rss'),
    ('OpenAI', 'openai', 'https://openai.com/news', 'https://openai.com/news/rss.xml', 'rss'),
    ('Anthropic', 'anthropic', 'https://www.anthropic.com/news', NULL, 'rss'),
    ('Cloudflare Blog', 'cloudflare', 'https://blog.cloudflare.com/', 'https://blog.cloudflare.com/rss/', 'rss'),
    ('Stripe Engineering', 'stripe-engineering', 'https://stripe.com/blog/engineering', 'https://stripe.com/blog/feed.rss', 'rss'),
    ('Netflix Tech Blog', 'netflix-tech', 'https://netflixtechblog.com/', 'https://netflixtechblog.com/feed', 'rss'),
    ('ByteByteGo', 'bytebytego', 'https://blog.bytebytego.com/', 'https://blog.bytebytego.com/feed', 'rss'),
    ('Martin Fowler', 'martin-fowler', 'https://martinfowler.com/', 'https://martinfowler.com/feed.atom', 'rss'),
    ('InfoQ', 'infoq', 'https://www.infoq.com/', 'https://feed.infoq.com/', 'rss'),
    ('Google AI', 'google-ai', 'https://blog.google/technology/ai/', NULL, 'rss'),
    ('Microsoft DevBlogs', 'microsoft', 'https://devblogs.microsoft.com/', 'https://devblogs.microsoft.com/landingpage/feed/', 'rss'),
    ('GitHub Blog', 'github-blog', 'https://github.blog/', 'https://github.blog/feed/', 'rss'),
    ('Docker Blog', 'docker', 'https://www.docker.com/blog/', 'https://www.docker.com/blog/feed/', 'rss'),
    ('Kubernetes Blog', 'kubernetes', 'https://kubernetes.io/blog/', 'https://kubernetes.io/feed.xml', 'rss'),
    ('HashiCorp Blog', 'hashicorp', 'https://www.hashicorp.com/blog', 'https://www.hashicorp.com/blog/feed.xml', 'rss'),
    ('CNCF Blog', 'cncf', 'https://www.cncf.io/blog/', 'https://www.cncf.io/blog/feed/', 'rss');

INSERT INTO learning_paths (title, slug, description, sort_order) VALUES
    ('Backend Roadmap', 'backend-roadmap', 'From HTTP fundamentals to cloud-native systems.', 1);

INSERT INTO learning_path_steps (path_id, title, description, sort_order)
SELECT id, step.title, step.description, step.sort_order
FROM learning_paths lp
CROSS JOIN (VALUES
    ('HTTP', 'Request/response cycle, headers, and status codes.', 1),
    ('REST', 'Resource design, idempotency, and API conventions.', 2),
    ('Databases', 'SQL, indexing, transactions, and query planning.', 3),
    ('Caching', 'Cache patterns, eviction, and consistency tradeoffs.', 4),
    ('Message Queues', 'Async processing, delivery guarantees, and backpressure.', 5),
    ('Distributed Systems', 'CAP, consensus, and failure modes.', 6),
    ('Kubernetes', 'Orchestration, scheduling, and service mesh basics.', 7),
    ('Cloud', 'Managed services, cost, and operational excellence.', 8)
) AS step(title, description, sort_order)
WHERE lp.slug = 'backend-roadmap';

-- +goose Down
DELETE FROM learning_path_steps;
DELETE FROM learning_paths;
DELETE FROM sources;
DELETE FROM categories;
