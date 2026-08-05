package repository

import (
	"context"
	"fmt"

	"stackjournal/api/internal/domain"

	"github.com/jackc/pgx/v5/pgxpool"
)

type CategoryRepository struct {
	pool *pgxpool.Pool
}

func NewCategoryRepository(pool *pgxpool.Pool) *CategoryRepository {
	return &CategoryRepository{pool: pool}
}

func (r *CategoryRepository) List(ctx context.Context) ([]domain.Category, error) {
	query := `
		SELECT id, name, slug, description, icon, sort_order, is_learning, created_at
		FROM categories
		ORDER BY sort_order ASC, name ASC
	`

	rows, err := r.pool.Query(ctx, query)
	if err != nil {
		return nil, fmt.Errorf("list categories: %w", err)
	}
	defer rows.Close()

	var categories []domain.Category
	for rows.Next() {
		var c domain.Category
		if err := rows.Scan(
			&c.ID, &c.Name, &c.Slug, &c.Description, &c.Icon,
			&c.SortOrder, &c.IsLearning, &c.CreatedAt,
		); err != nil {
			return nil, fmt.Errorf("scan category: %w", err)
		}
		categories = append(categories, c)
	}
	if categories == nil {
		categories = []domain.Category{}
	}
	return categories, rows.Err()
}
