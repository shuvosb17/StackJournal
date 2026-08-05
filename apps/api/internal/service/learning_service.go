package service

import (
	"context"

	"stackjournal/api/internal/domain"
	"stackjournal/api/internal/repository"
)

type LearningService struct {
	repo *repository.LearningRepository
}

func NewLearningService(repo *repository.LearningRepository) *LearningService {
	return &LearningService{repo: repo}
}

func (s *LearningService) ListPaths(ctx context.Context) ([]domain.LearningPath, error) {
	return s.repo.ListPaths(ctx)
}

func (s *LearningService) GetPathBySlug(ctx context.Context, slug string) (*domain.LearningPath, error) {
	return s.repo.GetPathBySlug(ctx, slug)
}

type CaseStudyService struct {
	repo *repository.CaseStudyRepository
}

func NewCaseStudyService(repo *repository.CaseStudyRepository) *CaseStudyService {
	return &CaseStudyService{repo: repo}
}

func (s *CaseStudyService) List(ctx context.Context) ([]domain.CaseStudyListItem, error) {
	return s.repo.List(ctx)
}

func (s *CaseStudyService) GetBySlug(ctx context.Context, slug string) (*domain.CaseStudy, error) {
	return s.repo.GetBySlug(ctx, slug)
}
