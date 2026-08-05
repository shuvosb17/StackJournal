-- +goose Up
INSERT INTO sources (name, slug, url, source_type) VALUES
    ('Hacker News', 'hackernews', 'https://news.ycombinator.com/', 'hackernews')
ON CONFLICT (slug) DO NOTHING;

-- +goose Down
DELETE FROM sources WHERE slug = 'hackernews';
