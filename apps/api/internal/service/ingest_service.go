package service

import (
	"context"
	"errors"
	"fmt"
	"log/slog"
	"sync"

	"stackjournal/api/internal/domain"
	"stackjournal/api/internal/ingest"
	"stackjournal/api/internal/repository"

	"github.com/jackc/pgx/v5"
)

const maxConcurrentFeeds = 5

type IngestService struct {
	sources  *repository.SourceRepository
	ingest   *repository.IngestRepository
	parser   *ingest.Parser
	logger   *slog.Logger
}

func NewIngestService(
	sources *repository.SourceRepository,
	ingestRepo *repository.IngestRepository,
	parser *ingest.Parser,
	logger *slog.Logger,
) *IngestService {
	if logger == nil {
		logger = slog.Default()
	}
	return &IngestService{
		sources: sources,
		ingest:  ingestRepo,
		parser:  parser,
		logger:  logger,
	}
}

func (s *IngestService) Run(ctx context.Context, sourceFilter string) (domain.IngestRunSummary, error) {
	runID, err := s.ingest.StartRun(ctx)
	if err != nil {
		return domain.IngestRunSummary{}, err
	}

	sources, err := s.sources.ListRSSFeeds(ctx)
	if err != nil {
		return domain.IngestRunSummary{}, err
	}

	if sourceFilter != "" {
		filtered := make([]domain.FeedSource, 0, 1)
		for _, src := range sources {
			if src.Slug == sourceFilter {
				filtered = append(filtered, src)
				break
			}
		}
		if len(filtered) == 0 {
			return domain.IngestRunSummary{}, fmt.Errorf("source not found: %s", sourceFilter)
		}
		sources = filtered
	}

	s.logger.Info("starting rss ingest", "sources", len(sources))

	var (
		mu       sync.Mutex
		summary  domain.IngestRunSummary
		sem      = make(chan struct{}, maxConcurrentFeeds)
		wg       sync.WaitGroup
	)

	for _, source := range sources {
		wg.Add(1)
		go func(src domain.FeedSource) {
			defer wg.Done()
			sem <- struct{}{}
			defer func() { <-sem }()

			result := s.ingestSource(ctx, src)

			mu.Lock()
			defer mu.Unlock()
			if result.Error != nil {
				summary.SourcesFailed++
				s.logger.Error("feed ingest failed",
					"source", src.Slug,
					"error", result.Error,
				)
				return
			}
			summary.SourcesOK++
			summary.ArticlesNew += result.ArticlesNew
			summary.ArticlesSkipped += result.ArticlesSkipped
			s.logger.Info("feed ingest complete",
				"source", src.Slug,
				"new", result.ArticlesNew,
				"skipped", result.ArticlesSkipped,
			)
		}(source)
	}

	wg.Wait()

	// Hacker News top engineering stories
	if sourceFilter == "" || sourceFilter == "hackernews" {
		hnResult := s.ingestHackerNews(ctx)
		if hnResult.Error != nil {
			summary.SourcesFailed++
			s.logger.Error("hackernews ingest failed", "error", hnResult.Error)
		} else {
			summary.SourcesOK++
			summary.ArticlesNew += hnResult.ArticlesNew
			summary.ArticlesSkipped += hnResult.ArticlesSkipped
		}
	}

	if err := s.ingest.FinishRun(ctx, runID, summary); err != nil {
		return summary, err
	}

	s.logger.Info("rss ingest finished",
		"sources_ok", summary.SourcesOK,
		"sources_failed", summary.SourcesFailed,
		"articles_new", summary.ArticlesNew,
		"articles_skipped", summary.ArticlesSkipped,
	)

	return summary, nil
}

func (s *IngestService) ingestSource(ctx context.Context, source domain.FeedSource) domain.IngestResult {
	result := domain.IngestResult{SourceSlug: source.Slug}

	feed, err := s.parser.FetchFeed(ctx, source.FeedURL)
	if err != nil {
		result.Error = err
		return result
	}

	items := s.parser.ItemsToArticles(feed)

	for _, item := range items {
		categoryID, err := s.resolveCategoryID(ctx, source.Slug, item.Title, item.Excerpt)
		if err != nil {
			result.Error = err
			return result
		}

		inserted, err := s.persistItem(ctx, source.ID, categoryID, item)
		if err != nil {
			result.Error = err
			return result
		}
		if inserted {
			result.ArticlesNew++
		} else {
			result.ArticlesSkipped++
		}
	}

	if err := s.sources.MarkFetched(ctx, source.ID); err != nil {
		result.Error = err
		return result
	}

	return result
}

func (s *IngestService) resolveCategoryID(ctx context.Context, sourceSlug, title, excerpt string) (*string, error) {
	categorySlug := ingest.CategorySlugForArticle(sourceSlug, title, excerpt)
	id, err := s.sources.GetCategoryIDBySlug(ctx, categorySlug)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, nil
		}
		return nil, fmt.Errorf("resolve category %s: %w", categorySlug, err)
	}
	return id, nil
}

func (s *IngestService) persistItem(
	ctx context.Context,
	sourceID string,
	categoryID *string,
	item domain.IngestItem,
) (bool, error) {
	return s.persistItemWithUpgrade(ctx, sourceID, categoryID, item, false)
}

func (s *IngestService) persistItemWithUpgrade(
	ctx context.Context,
	sourceID string,
	categoryID *string,
	item domain.IngestItem,
	upgradeStubs bool,
) (bool, error) {
	exists, err := s.ingest.ArticleExists(ctx, item.CanonicalURL)
	if err != nil {
		return false, err
	}
	if exists {
		if upgradeStubs && ingest.HasSubstantialContent(item.ContentHTML) {
			return s.ingest.UpdateArticleContent(ctx, item.CanonicalURL, item)
		}
		return false, nil
	}

	slug := item.Slug
	taken, err := s.ingest.SlugExists(ctx, slug)
	if err != nil {
		return false, err
	}
	if taken {
		slug = ingest.UniqueSlug(slug, item.CanonicalURL)
	}
	item.Slug = slug

	return s.ingest.InsertArticle(ctx, sourceID, categoryID, item)
}

func (s *IngestService) ingestHackerNews(ctx context.Context) domain.IngestResult {
	result := domain.IngestResult{SourceSlug: "hackernews"}

	source, err := s.sources.GetBySlug(ctx, "hackernews")
	if err != nil {
		result.Error = fmt.Errorf("hackernews source: %w", err)
		return result
	}

	categoryID, err := s.resolveCategoryID(ctx, "hackernews", "", "")
	if err != nil {
		result.Error = err
		return result
	}

	client := ingest.NewHNClient()
	stories, err := client.FetchTopStories(ctx, 30)
	if err != nil {
		result.Error = err
		return result
	}

	for _, item := range stories {
		if !ingest.IsEngineeringStory(item.Title) {
			result.ArticlesSkipped++
			continue
		}

		itemCategoryID, err := s.resolveCategoryID(ctx, "hackernews", item.Title, item.Excerpt)
		if err != nil {
			result.Error = err
			return result
		}
		if itemCategoryID == nil {
			itemCategoryID = categoryID
		}

		changed, err := s.persistItemWithUpgrade(ctx, source.ID, itemCategoryID, item, true)
		if err != nil {
			result.Error = err
			return result
		}
		if changed {
			result.ArticlesNew++
		} else {
			result.ArticlesSkipped++
		}
	}

	_ = s.sources.MarkFetched(ctx, source.ID)
	return result
}
