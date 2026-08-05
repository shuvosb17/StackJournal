package service

import (
	"context"

	"stackjournal/api/internal/domain"
	"stackjournal/api/internal/repository"
)

type ArticleService struct {
	articles *repository.ArticleRepository
}

func NewArticleService(articles *repository.ArticleRepository) *ArticleService {
	return &ArticleService{articles: articles}
}

func (s *ArticleService) List(ctx context.Context, page, limit int, categorySlug string) (*domain.ArticleListResponse, error) {
	return s.articles.List(ctx, page, limit, categorySlug)
}

func (s *ArticleService) GetBySlug(ctx context.Context, slug string) (*domain.Article, error) {
	return s.articles.GetBySlug(ctx, slug)
}

func (s *ArticleService) Latest(ctx context.Context, limit int) ([]domain.Article, error) {
	return s.articles.Latest(ctx, limit)
}

func (s *ArticleService) Trending(ctx context.Context, limit int) ([]domain.Article, error) {
	return s.articles.Trending(ctx, limit)
}

type CategoryService struct {
	categories *repository.CategoryRepository
}

func NewCategoryService(categories *repository.CategoryRepository) *CategoryService {
	return &CategoryService{categories: categories}
}

func (s *CategoryService) List(ctx context.Context) ([]domain.Category, error) {
	return s.categories.List(ctx)
}
