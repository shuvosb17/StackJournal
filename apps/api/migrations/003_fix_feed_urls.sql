-- +goose Up
UPDATE sources SET feed_url = 'https://blog.google/technology/ai/rss/' WHERE slug = 'google-ai' AND feed_url IS NULL;

-- +goose Down
UPDATE sources SET feed_url = NULL WHERE slug = 'google-ai';
