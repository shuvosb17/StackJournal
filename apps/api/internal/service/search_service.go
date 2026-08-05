package service

import (
	"context"

	"stackjournal/api/internal/domain"
	"stackjournal/api/internal/repository"
)

type SearchService struct {
	search *repository.SearchRepository
}

func NewSearchService(search *repository.SearchRepository) *SearchService {
	return &SearchService{search: search}
}

func (s *SearchService) Search(ctx context.Context, query string, limit int) (*domain.SearchResponse, error) {
	results, err := s.search.Search(ctx, query, limit)
	if err != nil {
		return nil, err
	}

	total := len(results.Articles) + len(results.Categories) +
		len(results.Sources) + len(results.Tags)

	return &domain.SearchResponse{
		Data: *results,
		Meta: domain.SearchMeta{
			Query: query,
			Total: total,
		},
	}, nil
}
