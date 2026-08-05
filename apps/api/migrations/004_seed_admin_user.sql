-- +goose Up
INSERT INTO users (email)
SELECT 'me@stackjournal.local'
WHERE NOT EXISTS (
    SELECT 1 FROM users WHERE email = 'me@stackjournal.local'
);

-- +goose Down
DELETE FROM users WHERE email = 'me@stackjournal.local';
