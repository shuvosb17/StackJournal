package repository

import (
	"context"
	"fmt"
	"strings"

	"stackjournal/api/internal/domain"

	"github.com/jackc/pgx/v5/pgxpool"
)

type SearchRepository struct {
	pool *pgxpool.Pool
}

func NewSearchRepository(pool *pgxpool.Pool) *SearchRepository {
	return &SearchRepository{pool: pool}
}

func (r *SearchRepository) Search(ctx context.Context, query string, limit int) (*domain.SearchResults, error) {
	query = strings.TrimSpace(query)
	if query == "" {
		return emptySearchResults(), nil
	}
	if limit < 1 || limit > 20 {
		limit = 8
	}

	pattern := "%" + query + "%"

	articles, err := r.searchArticles(ctx, query, pattern, limit)
	if err != nil {
		return nil, err
	}
	categories, err := r.searchCategories(ctx, pattern, 6)
	if err != nil {
		return nil, err
	}
	sources, err := r.searchSources(ctx, pattern, 5)
	if err != nil {
		return nil, err
	}
	tags, err := r.searchTags(ctx, pattern, 5)
	if err != nil {
		return nil, err
	}

	return &domain.SearchResults{
		Articles:   articles,
		Categories: categories,
		Sources:    sources,
		Tags:       tags,
	}, nil
}

func emptySearchResults() *domain.SearchResults {
	return &domain.SearchResults{
		Articles:   []domain.SearchArticleHit{},
		Categories: []domain.SearchCategory{},
		Sources:    []domain.SearchSource{},
		Tags:       []domain.SearchTag{},
	}
}

func (r *SearchRepository) searchArticles(
	ctx context.Context,
	query, pattern string,
	limit int,
) ([]domain.SearchArticleHit, error) {
	rows, err := r.pool.Query(ctx, `
		SELECT
			a.id, a.title, a.slug, a.excerpt,
			s.name AS source_name,
			c.name AS category_name,
			a.reading_time_minutes,
			ts_rank(a.search_vector, plainto_tsquery('english', $1)) AS rank
		FROM articles a
		LEFT JOIN sources s ON s.id = a.source_id
		LEFT JOIN categories c ON c.id = a.category_id
		WHERE a.status = 'published'
		  AND (
		    a.search_vector @@ plainto_tsquery('english', $1)
		    OR a.title ILIKE $2
		    OR a.excerpt ILIKE $2
		    OR a.content_text ILIKE $2
		  )
		ORDER BY rank DESC, a.published_at DESC NULLS LAST
		LIMIT $3
	`, query, pattern, limit)
	if err != nil {
		return nil, fmt.Errorf("search articles: %w", err)
	}
	defer rows.Close()

	var hits []domain.SearchArticleHit
	for rows.Next() {
		var hit domain.SearchArticleHit
		var rank float32
		if err := rows.Scan(
			&hit.ID, &hit.Title, &hit.Slug, &hit.Excerpt,
			&hit.SourceName, &hit.CategoryName, &hit.ReadingTimeMinutes,
			&rank,
		); err != nil {
			return nil, fmt.Errorf("scan search article: %w", err)
		}
		hits = append(hits, hit)
	}
	if hits == nil {
		hits = []domain.SearchArticleHit{}
	}
	return hits, rows.Err()
}

func (r *SearchRepository) searchCategories(
	ctx context.Context,
	pattern string,
	limit int,
) ([]domain.SearchCategory, error) {
	rows, err := r.pool.Query(ctx, `
		SELECT id, name, slug
		FROM categories
		WHERE name ILIKE $1 OR slug ILIKE $1
		ORDER BY sort_order ASC
		LIMIT $2
	`, pattern, limit)
	if err != nil {
		return nil, fmt.Errorf("search categories: %w", err)
	}
	defer rows.Close()

	return scanSearchCategories(rows)
}

func (r *SearchRepository) searchSources(
	ctx context.Context,
	pattern string,
	limit int,
) ([]domain.SearchSource, error) {
	rows, err := r.pool.Query(ctx, `
		SELECT id, name, slug, url
		FROM sources
		WHERE is_trusted = TRUE
		  AND (name ILIKE $1 OR slug ILIKE $1)
		ORDER BY name ASC
		LIMIT $2
	`, pattern, limit)
	if err != nil {
		return nil, fmt.Errorf("search sources: %w", err)
	}
	defer rows.Close()

	var sources []domain.SearchSource
	for rows.Next() {
		var s domain.SearchSource
		if err := rows.Scan(&s.ID, &s.Name, &s.Slug, &s.URL); err != nil {
			return nil, fmt.Errorf("scan search source: %w", err)
		}
		sources = append(sources, s)
	}
	if sources == nil {
		sources = []domain.SearchSource{}
	}
	return sources, rows.Err()
}

func (r *SearchRepository) searchTags(
	ctx context.Context,
	pattern string,
	limit int,
) ([]domain.SearchTag, error) {
	rows, err := r.pool.Query(ctx, `
		SELECT id, name, slug
		FROM tags
		WHERE name ILIKE $1 OR slug ILIKE $1
		ORDER BY name ASC
		LIMIT $2
	`, pattern, limit)
	if err != nil {
		return nil, fmt.Errorf("search tags: %w", err)
	}
	defer rows.Close()

	var tags []domain.SearchTag
	for rows.Next() {
		var t domain.SearchTag
		if err := rows.Scan(&t.ID, &t.Name, &t.Slug); err != nil {
			return nil, fmt.Errorf("scan search tag: %w", err)
		}
		tags = append(tags, t)
	}
	if tags == nil {
		tags = []domain.SearchTag{}
	}
	return tags, rows.Err()
}

type categoryScanner interface {
	Next() bool
	Scan(dest ...any) error
	Err() error
}

func scanSearchCategories(rows categoryScanner) ([]domain.SearchCategory, error) {
	var categories []domain.SearchCategory
	for rows.Next() {
		var c domain.SearchCategory
		if err := rows.Scan(&c.ID, &c.Name, &c.Slug); err != nil {
			return nil, fmt.Errorf("scan search category: %w", err)
		}
		categories = append(categories, c)
	}
	if categories == nil {
		categories = []domain.SearchCategory{}
	}
	return categories, rows.Err()
}
