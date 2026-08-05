package repository

import (
	"context"
	"fmt"

	"stackjournal/api/internal/domain"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

type IngestRepository struct {
	pool *pgxpool.Pool
}

func NewIngestRepository(pool *pgxpool.Pool) *IngestRepository {
	return &IngestRepository{pool: pool}
}

func (r *IngestRepository) StartRun(ctx context.Context) (string, error) {
	var id string
	err := r.pool.QueryRow(ctx, `
		INSERT INTO ingest_runs (started_at) VALUES (NOW()) RETURNING id
	`).Scan(&id)
	if err != nil {
		return "", fmt.Errorf("start ingest run: %w", err)
	}
	return id, nil
}

func (r *IngestRepository) FinishRun(ctx context.Context, runID string, summary domain.IngestRunSummary) error {
	_, err := r.pool.Exec(ctx, `
		UPDATE ingest_runs
		SET finished_at = NOW(),
		    sources_ok = $2,
		    sources_failed = $3,
		    articles_new = $4,
		    articles_skipped = $5
		WHERE id = $1
	`, runID, summary.SourcesOK, summary.SourcesFailed, summary.ArticlesNew, summary.ArticlesSkipped)
	if err != nil {
		return fmt.Errorf("finish ingest run: %w", err)
	}
	return nil
}

func (r *IngestRepository) ArticleExists(ctx context.Context, canonicalURL string) (bool, error) {
	var exists bool
	err := r.pool.QueryRow(ctx, `
		SELECT EXISTS(SELECT 1 FROM articles WHERE canonical_url = $1)
	`, canonicalURL).Scan(&exists)
	if err != nil {
		return false, fmt.Errorf("check article exists: %w", err)
	}
	return exists, nil
}

func (r *IngestRepository) SlugExists(ctx context.Context, slug string) (bool, error) {
	var exists bool
	err := r.pool.QueryRow(ctx, `
		SELECT EXISTS(SELECT 1 FROM articles WHERE slug = $1)
	`, slug).Scan(&exists)
	if err != nil {
		return false, fmt.Errorf("check slug exists: %w", err)
	}
	return exists, nil
}

func (r *IngestRepository) InsertArticle(
	ctx context.Context,
	sourceID string,
	categoryID *string,
	item domain.IngestItem,
) (bool, error) {
	var inserted bool
	err := r.pool.QueryRow(ctx, `
		INSERT INTO articles (
			source_id, category_id, title, slug, excerpt,
			content_html, content_text, author, canonical_url,
			image_url, reading_time_minutes, published_at, fetched_at
		) VALUES (
			$1, $2, $3, $4, $5,
			$6, $7, NULLIF($8, ''), $9,
			NULLIF($10, ''), $11, $12, NOW()
		)
		ON CONFLICT (canonical_url) DO NOTHING
		RETURNING TRUE
	`,
		sourceID,
		categoryID,
		item.Title,
		item.Slug,
		nullIfEmpty(item.Excerpt),
		nullIfEmpty(item.ContentHTML),
		nullIfEmpty(item.ContentText),
		item.Author,
		item.CanonicalURL,
		item.ImageURL,
		item.ReadingTimeMinutes,
		item.PublishedAt,
	).Scan(&inserted)

	if err == pgx.ErrNoRows {
		return false, nil
	}
	if err != nil {
		return false, fmt.Errorf("insert article: %w", err)
	}
	return inserted, nil
}

func (r *IngestRepository) UpdateArticleContent(
	ctx context.Context,
	canonicalURL string,
	item domain.IngestItem,
) (bool, error) {
	tag, err := r.pool.Exec(ctx, `
		UPDATE articles
		SET
			content_html = $2,
			content_text = $3,
			excerpt = COALESCE(NULLIF($4, ''), excerpt),
			reading_time_minutes = $5,
			fetched_at = NOW()
		WHERE canonical_url = $1
		  AND (
		    content_html IS NULL
		    OR content_html LIKE '%Discussed on Hacker News%'
		    OR length(content_html) < 200
		  )
	`,
		canonicalURL,
		nullIfEmpty(item.ContentHTML),
		nullIfEmpty(item.ContentText),
		nullIfEmpty(item.Excerpt),
		item.ReadingTimeMinutes,
	)
	if err != nil {
		return false, fmt.Errorf("update article content: %w", err)
	}
	return tag.RowsAffected() > 0, nil
}

func nullIfEmpty(s string) *string {
	if s == "" {
		return nil
	}
	return &s
}
