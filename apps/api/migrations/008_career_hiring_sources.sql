-- +goose Up
INSERT INTO sources (name, slug, url, feed_url, source_type) VALUES
    ('Pragmatic Engineer', 'pragmatic-engineer', 'https://blog.pragmaticengineer.com/', 'https://blog.pragmaticengineer.com/rss/', 'rss'),
    ('LeadDev', 'leaddev', 'https://leaddev.com/', 'https://leaddev.com/feed/', 'rss')
ON CONFLICT (slug) DO NOTHING;

UPDATE categories SET description = 'Hiring, recruiting, and team growth for engineers.'
WHERE slug = 'hiring';

UPDATE categories SET description = 'Career growth, interviews, and engineering leadership.'
WHERE slug = 'career';

UPDATE articles a
SET category_id = c.id
FROM categories c
WHERE c.slug = 'hiring'
  AND (
    a.title ILIKE '%hiring%'
    OR a.title ILIKE '%open role%'
    OR a.title ILIKE '%job market%'
    OR a.title ILIKE '%recruit%'
    OR a.title ILIKE '%headcount%'
  );

UPDATE articles a
SET category_id = c.id
FROM categories c
WHERE c.slug = 'career'
  AND c.id IS NOT NULL
  AND (
    a.title ILIKE '%career%'
    OR a.title ILIKE '%interview%'
    OR a.title ILIKE '%salary%'
    OR a.title ILIKE '%staff engineer%'
    OR a.title ILIKE '%promotion%'
    OR a.title ILIKE '%layoff%'
    OR a.title ILIKE '%laid off%'
    OR a.title ILIKE '%engineering manager%'
  )
  AND NOT (
    a.title ILIKE '%hiring%'
    OR a.title ILIKE '%open role%'
  );

-- +goose Down
DELETE FROM sources WHERE slug IN ('pragmatic-engineer', 'leaddev');
