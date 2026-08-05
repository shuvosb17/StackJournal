package ingest

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"strings"
	"time"

	"stackjournal/api/internal/domain"
)

const hnTopURL = "https://hacker-news.firebaseio.com/v0/topstories.json"

type HNClient struct {
	client *http.Client
}

func NewHNClient() *HNClient {
	return &HNClient{
		client: &http.Client{Timeout: 20 * time.Second},
	}
}

type hnItem struct {
	ID    int    `json:"id"`
	Title string `json:"title"`
	URL   string `json:"url"`
	Text  string `json:"text"`
	By    string `json:"by"`
	Time  int64  `json:"time"`
	Score int    `json:"score"`
	Type  string `json:"type"`
}

func (c *HNClient) FetchTopStories(ctx context.Context, limit int) ([]domain.IngestItem, error) {
	req, err := http.NewRequestWithContext(ctx, http.MethodGet, hnTopURL, nil)
	if err != nil {
		return nil, err
	}

	res, err := c.client.Do(req)
	if err != nil {
		return nil, fmt.Errorf("fetch hn ids: %w", err)
	}
	defer res.Body.Close()

	var ids []int
	if err := json.NewDecoder(res.Body).Decode(&ids); err != nil {
		return nil, fmt.Errorf("decode hn ids: %w", err)
	}

	if limit > len(ids) {
		limit = len(ids)
	}

	items := make([]domain.IngestItem, 0, limit)
	for _, id := range ids[:limit] {
		item, err := c.fetchItem(ctx, id)
		if err != nil || item == nil {
			continue
		}
		items = append(items, *item)
	}

	return items, nil
}

func (c *HNClient) fetchItem(ctx context.Context, id int) (*domain.IngestItem, error) {
	url := fmt.Sprintf("https://hacker-news.firebaseio.com/v0/item/%d.json", id)
	req, err := http.NewRequestWithContext(ctx, http.MethodGet, url, nil)
	if err != nil {
		return nil, err
	}

	res, err := c.client.Do(req)
	if err != nil {
		return nil, err
	}
	defer res.Body.Close()

	var hn hnItem
	if err := json.NewDecoder(res.Body).Decode(&hn); err != nil {
		return nil, err
	}

	if hn.Type != "story" || hn.Title == "" {
		return nil, nil
	}

	canonical := hn.URL
	if canonical == "" {
		canonical = fmt.Sprintf("https://news.ycombinator.com/item?id=%d", hn.ID)
	}
	canonical = NormalizeURL(canonical)

	contentHTML := ""
	if hn.Text != "" {
		contentHTML = SanitizeHTML("<p>" + hn.Text + "</p>")
	} else {
		contentHTML = fmt.Sprintf(
			`<p>Discussed on Hacker News with score %d. <a href="%s" rel="noopener noreferrer">Read discussion</a>.</p>`,
			hn.Score,
			fmt.Sprintf("https://news.ycombinator.com/item?id=%d", hn.ID),
		)
	}

	contentText := HTMLToText(contentHTML)
	if contentText == "" {
		contentText = hn.Title
	}

	published := time.Unix(hn.Time, 0)

	return &domain.IngestItem{
		Title:              hn.Title,
		Slug:               Slugify(hn.Title),
		Excerpt:            TruncateExcerpt(contentText, 280),
		ContentHTML:        contentHTML,
		ContentText:        contentText,
		Author:             hn.By,
		CanonicalURL:       canonical,
		ReadingTimeMinutes: ReadingTimeMinutes(contentText),
		PublishedAt:        &published,
	}, nil
}

func IsEngineeringStory(title string) bool {
	keywords := []string{
		"go ", "golang", "rust", "python", "kubernetes", "docker", "aws", "cloud",
		"database", "postgres", "redis", "kafka", "api", "system", "linux",
		"security", "open source", "github", "programming", "developer",
		"engineering", "architecture", "distributed", "ml ", "ai ", "typescript",
		"javascript", "react", "linux", "compiler", "performance",
	}
	lower := strings.ToLower(title)
	for _, kw := range keywords {
		if strings.Contains(lower, kw) {
			return true
		}
	}
	return false
}
