package repository

import (
	"context"
	"fmt"

	"stackjournal/api/internal/domain"

	"github.com/jackc/pgx/v5/pgxpool"
)

type ArticleRepository struct {
	pool *pgxpool.Pool
}

func NewArticleRepository(pool *pgxpool.Pool) *ArticleRepository {
	return &ArticleRepository{pool: pool}
}

const articleSelect = `
	SELECT
		a.id, a.source_id, a.category_id, a.title, a.slug, a.excerpt,
		a.author, a.canonical_url, a.image_url, a.reading_time_minutes,
		a.published_at, a.is_featured, a.status, a.created_at,
		s.name AS source_name,
		c.name AS category_name,
		c.slug AS category_slug
	FROM articles a
	LEFT JOIN sources s ON s.id = a.source_id
	LEFT JOIN categories c ON c.id = a.category_id
`

func (r *ArticleRepository) List(ctx context.Context, page, limit int, categorySlug string) (*domain.ArticleListResponse, error) {
	if page < 1 {
		page = 1
	}
	if limit < 1 || limit > 50 {
		limit = 20
	}
	offset := (page - 1) * limit

	countQuery := `SELECT COUNT(*) FROM articles a LEFT JOIN categories c ON c.id = a.category_id WHERE a.status = 'published'`
	listQuery := articleSelect + ` WHERE a.status = 'published'`
	args := []any{}
	argIndex := 1

	if categorySlug != "" {
		filter := fmt.Sprintf(` AND c.slug = $%d`, argIndex)
		countQuery += filter
		listQuery += filter
		args = append(args, categorySlug)
		argIndex++
	}

	var total int
	if err := r.pool.QueryRow(ctx, countQuery, args...).Scan(&total); err != nil {
		return nil, fmt.Errorf("count articles: %w", err)
	}

	listQuery += fmt.Sprintf(` ORDER BY a.published_at DESC NULLS LAST, a.created_at DESC LIMIT $%d OFFSET $%d`, argIndex, argIndex+1)
	listArgs := append(args, limit, offset)

	rows, err := r.pool.Query(ctx, listQuery, listArgs...)
	if err != nil {
		return nil, fmt.Errorf("list articles: %w", err)
	}
	defer rows.Close()

	articles, err := scanArticles(rows)
	if err != nil {
		return nil, err
	}

	return &domain.ArticleListResponse{
		Data: articles,
		Meta: domain.ArticleListMeta{
			Page:    page,
			Limit:   limit,
			Total:   total,
			HasMore: offset+len(articles) < total,
		},
	}, nil
}

func (r *ArticleRepository) GetBySlug(ctx context.Context, slug string) (*domain.Article, error) {
	query := `
		SELECT
			a.id, a.source_id, a.category_id, a.title, a.slug, a.excerpt,
			a.content_html,
			a.author, a.canonical_url, a.image_url, a.reading_time_minutes,
			a.published_at, a.is_featured, a.status, a.created_at,
			s.name AS source_name,
			c.name AS category_name,
			c.slug AS category_slug
		FROM articles a
		LEFT JOIN sources s ON s.id = a.source_id
		LEFT JOIN categories c ON c.id = a.category_id
		WHERE a.slug = $1 AND a.status = 'published'
	`

	row := r.pool.QueryRow(ctx, query, slug)
	var a domain.Article
	err := row.Scan(
		&a.ID, &a.SourceID, &a.CategoryID, &a.Title, &a.Slug, &a.Excerpt,
		&a.ContentHTML,
		&a.Author, &a.CanonicalURL, &a.ImageURL, &a.ReadingTimeMinutes,
		&a.PublishedAt, &a.IsFeatured, &a.Status, &a.CreatedAt,
		&a.SourceName, &a.CategoryName, &a.CategorySlug,
	)
	if err != nil {
		return nil, err
	}
	return &a, nil
}

func (r *ArticleRepository) Latest(ctx context.Context, limit int) ([]domain.Article, error) {
	if limit < 1 || limit > 50 {
		limit = 10
	}

	query := articleSelect + `
		WHERE a.status = 'published'
		ORDER BY a.published_at DESC NULLS LAST, a.created_at DESC
		LIMIT $1
	`

	rows, err := r.pool.Query(ctx, query, limit)
	if err != nil {
		return nil, fmt.Errorf("latest articles: %w", err)
	}
	defer rows.Close()

	return scanArticles(rows)
}

func (r *ArticleRepository) Trending(ctx context.Context, limit int) ([]domain.Article, error) {
	if limit < 1 || limit > 50 {
		limit = 8
	}

	query := articleSelect + `
		WHERE a.status = 'published'
		  AND a.published_at >= NOW() - INTERVAL '7 days'
		ORDER BY a.is_featured DESC, a.published_at DESC NULLS LAST
		LIMIT $1
	`

	rows, err := r.pool.Query(ctx, query, limit)
	if err != nil {
		return nil, fmt.Errorf("trending articles: %w", err)
	}
	defer rows.Close()

	return scanArticles(rows)
}

type scannable interface {
	Scan(dest ...any) error
}

func scanArticle(row scannable) (*domain.Article, error) {
	var a domain.Article
	err := row.Scan(
		&a.ID, &a.SourceID, &a.CategoryID, &a.Title, &a.Slug, &a.Excerpt,
		&a.Author, &a.CanonicalURL, &a.ImageURL, &a.ReadingTimeMinutes,
		&a.PublishedAt, &a.IsFeatured, &a.Status, &a.CreatedAt,
		&a.SourceName, &a.CategoryName, &a.CategorySlug,
	)
	if err != nil {
		return nil, err
	}
	return &a, nil
}

type rowScanner interface {
	Next() bool
	Scan(dest ...any) error
	Err() error
}

func scanArticles(rows rowScanner) ([]domain.Article, error) {
	var articles []domain.Article
	for rows.Next() {
		var a domain.Article
		if err := rows.Scan(
			&a.ID, &a.SourceID, &a.CategoryID, &a.Title, &a.Slug, &a.Excerpt,
			&a.Author, &a.CanonicalURL, &a.ImageURL, &a.ReadingTimeMinutes,
			&a.PublishedAt, &a.IsFeatured, &a.Status, &a.CreatedAt,
			&a.SourceName, &a.CategoryName, &a.CategorySlug,
		); err != nil {
			return nil, fmt.Errorf("scan article: %w", err)
		}
		articles = append(articles, a)
	}
	if articles == nil {
		articles = []domain.Article{}
	}
	return articles, rows.Err()
}
