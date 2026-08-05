package repository

import (
	"context"
	"fmt"

	"stackjournal/api/internal/domain"

	"github.com/jackc/pgx/v5/pgxpool"
)

type SourceRepository struct {
	pool *pgxpool.Pool
}

func NewSourceRepository(pool *pgxpool.Pool) *SourceRepository {
	return &SourceRepository{pool: pool}
}

func (r *SourceRepository) ListRSSFeeds(ctx context.Context) ([]domain.FeedSource, error) {
	query := `
		SELECT id, name, slug, feed_url
		FROM sources
		WHERE source_type = 'rss'
		  AND feed_url IS NOT NULL
		  AND feed_url <> ''
		  AND is_trusted = TRUE
		ORDER BY name ASC
	`

	rows, err := r.pool.Query(ctx, query)
	if err != nil {
		return nil, fmt.Errorf("list rss feeds: %w", err)
	}
	defer rows.Close()

	var sources []domain.FeedSource
	for rows.Next() {
		var s domain.FeedSource
		if err := rows.Scan(&s.ID, &s.Name, &s.Slug, &s.FeedURL); err != nil {
			return nil, fmt.Errorf("scan feed source: %w", err)
		}
		sources = append(sources, s)
	}
	if sources == nil {
		sources = []domain.FeedSource{}
	}
	return sources, rows.Err()
}

func (r *SourceRepository) MarkFetched(ctx context.Context, sourceID string) error {
	_, err := r.pool.Exec(ctx, `
		UPDATE sources SET last_fetched_at = NOW() WHERE id = $1
	`, sourceID)
	if err != nil {
		return fmt.Errorf("mark source fetched: %w", err)
	}
	return nil
}

func (r *SourceRepository) GetBySlug(ctx context.Context, slug string) (*domain.FeedSource, error) {
	var s domain.FeedSource
	err := r.pool.QueryRow(ctx, `
		SELECT id, name, slug, COALESCE(feed_url, url)
		FROM sources WHERE slug = $1
	`, slug).Scan(&s.ID, &s.Name, &s.Slug, &s.FeedURL)
	if err != nil {
		return nil, err
	}
	return &s, nil
}

func (r *SourceRepository) GetCategoryIDBySlug(ctx context.Context, slug string) (*string, error) {
	var id string
	err := r.pool.QueryRow(ctx, `SELECT id FROM categories WHERE slug = $1`, slug).Scan(&id)
	if err != nil {
		return nil, err
	}
	return &id, nil
}
