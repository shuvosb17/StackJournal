package repository

import (
	"context"
	"fmt"

	"stackjournal/api/internal/domain"

	"github.com/jackc/pgx/v5/pgxpool"
)

type LearningRepository struct {
	pool *pgxpool.Pool
}

func NewLearningRepository(pool *pgxpool.Pool) *LearningRepository {
	return &LearningRepository{pool: pool}
}

func (r *LearningRepository) ListPaths(ctx context.Context) ([]domain.LearningPath, error) {
	rows, err := r.pool.Query(ctx, `
		SELECT id, title, slug, description, sort_order, created_at
		FROM learning_paths
		ORDER BY sort_order ASC, title ASC
	`)
	if err != nil {
		return nil, fmt.Errorf("list learning paths: %w", err)
	}
	defer rows.Close()

	var paths []domain.LearningPath
	for rows.Next() {
		var p domain.LearningPath
		if err := rows.Scan(&p.ID, &p.Title, &p.Slug, &p.Description, &p.SortOrder, &p.CreatedAt); err != nil {
			return nil, err
		}
		p.Steps = []domain.LearningPathStep{}
		paths = append(paths, p)
	}
	if paths == nil {
		paths = []domain.LearningPath{}
	}
	return paths, rows.Err()
}

func (r *LearningRepository) GetPathBySlug(ctx context.Context, slug string) (*domain.LearningPath, error) {
	var p domain.LearningPath
	err := r.pool.QueryRow(ctx, `
		SELECT id, title, slug, description, sort_order, created_at
		FROM learning_paths WHERE slug = $1
	`, slug).Scan(&p.ID, &p.Title, &p.Slug, &p.Description, &p.SortOrder, &p.CreatedAt)
	if err != nil {
		return nil, err
	}

	rows, err := r.pool.Query(ctx, `
		SELECT
			lps.id, lps.title, lps.description, lps.content_html, lps.category_slug,
			lps.sort_order, lps.article_id, a.slug, a.title
		FROM learning_path_steps lps
		LEFT JOIN articles a ON a.id = lps.article_id
		WHERE lps.path_id = $1
		ORDER BY lps.sort_order ASC
	`, p.ID)
	if err != nil {
		return nil, fmt.Errorf("list steps: %w", err)
	}
	defer rows.Close()

	for rows.Next() {
		var s domain.LearningPathStep
		if err := rows.Scan(
			&s.ID, &s.Title, &s.Description, &s.ContentHTML, &s.CategorySlug,
			&s.SortOrder, &s.ArticleID, &s.ArticleSlug, &s.ArticleTitle,
		); err != nil {
			return nil, err
		}
		p.Steps = append(p.Steps, s)
	}
	if p.Steps == nil {
		p.Steps = []domain.LearningPathStep{}
	}
	return &p, rows.Err()
}

type CaseStudyRepository struct {
	pool *pgxpool.Pool
}

func NewCaseStudyRepository(pool *pgxpool.Pool) *CaseStudyRepository {
	return &CaseStudyRepository{pool: pool}
}

func (r *CaseStudyRepository) List(ctx context.Context) ([]domain.CaseStudyListItem, error) {
	rows, err := r.pool.Query(ctx, `
		SELECT id, title, slug, company, overview, published_at
		FROM case_studies
		ORDER BY published_at DESC NULLS LAST, title ASC
	`)
	if err != nil {
		return nil, fmt.Errorf("list case studies: %w", err)
	}
	defer rows.Close()

	var items []domain.CaseStudyListItem
	for rows.Next() {
		var c domain.CaseStudyListItem
		if err := rows.Scan(&c.ID, &c.Title, &c.Slug, &c.Company, &c.Overview, &c.PublishedAt); err != nil {
			return nil, err
		}
		items = append(items, c)
	}
	if items == nil {
		items = []domain.CaseStudyListItem{}
	}
	return items, rows.Err()
}

func (r *CaseStudyRepository) GetBySlug(ctx context.Context, slug string) (*domain.CaseStudy, error) {
	var c domain.CaseStudy
	err := r.pool.QueryRow(ctx, `
		SELECT
			id, title, slug, company, overview, problem, requirements,
			architecture, data_flow, scaling, tradeoffs, lessons,
			hero_image, published_at, created_at
		FROM case_studies WHERE slug = $1
	`, slug).Scan(
		&c.ID, &c.Title, &c.Slug, &c.Company, &c.Overview, &c.Problem, &c.Requirements,
		&c.Architecture, &c.DataFlow, &c.Scaling, &c.Tradeoffs, &c.Lessons,
		&c.HeroImage, &c.PublishedAt, &c.CreatedAt,
	)
	if err != nil {
		return nil, err
	}
	return &c, nil
}
