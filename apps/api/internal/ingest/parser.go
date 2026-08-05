package ingest

import (
	"context"
	"fmt"
	"net/http"
	"strings"
	"time"

	"stackjournal/api/internal/domain"

	"github.com/mmcdole/gofeed"
)

const (
	maxItemsPerFeed = 40
	fetchTimeout    = 25 * time.Second
)

type Parser struct {
	client *http.Client
	parser *gofeed.Parser
}

func NewParser() *Parser {
	return &Parser{
		client: &http.Client{Timeout: fetchTimeout},
		parser: gofeed.NewParser(),
	}
}

func (p *Parser) FetchFeed(ctx context.Context, feedURL string) (*gofeed.Feed, error) {
	req, err := http.NewRequestWithContext(ctx, http.MethodGet, feedURL, nil)
	if err != nil {
		return nil, fmt.Errorf("create request: %w", err)
	}
	req.Header.Set("User-Agent", "StackJournal/1.0 (+https://github.com/stackjournal)")
	req.Header.Set("Accept", "application/rss+xml, application/atom+xml, application/xml, text/xml, */*")

	resp, err := p.client.Do(req)
	if err != nil {
		return nil, fmt.Errorf("fetch feed: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("fetch feed: unexpected status %d", resp.StatusCode)
	}

	feed, err := p.parser.Parse(resp.Body)
	if err != nil {
		return nil, fmt.Errorf("parse feed: %w", err)
	}
	return feed, nil
}

func (p *Parser) ItemsToArticles(feed *gofeed.Feed) []domain.IngestItem {
	if len(feed.Items) == 0 {
		return []domain.IngestItem{}
	}

	limit := maxItemsPerFeed
	if len(feed.Items) < limit {
		limit = len(feed.Items)
	}

	items := make([]domain.IngestItem, 0, limit)
	seenURLs := make(map[string]struct{}, limit)

	for _, item := range feed.Items[:limit] {
		article, ok := mapFeedItem(item)
		if !ok {
			continue
		}
		if _, dup := seenURLs[article.CanonicalURL]; dup {
			continue
		}
		seenURLs[article.CanonicalURL] = struct{}{}
		items = append(items, article)
	}

	return items
}

func mapFeedItem(item *gofeed.Item) (domain.IngestItem, bool) {
	canonicalURL := canonicalURL(item)
	if canonicalURL == "" {
		return domain.IngestItem{}, false
	}

	title := strings.TrimSpace(item.Title)
	if !IsPrintableTitle(title) {
		return domain.IngestItem{}, false
	}

	rawHTML := pickHTMLContent(item)
	contentHTML := SanitizeHTML(rawHTML)
	contentText := HTMLToText(contentHTML)
	if contentText == "" {
		contentText = HTMLToText(SanitizeHTML(item.Description))
	}

	excerpt := TruncateExcerpt(contentText, 280)
	if excerpt == "" && item.Description != "" {
		excerpt = TruncateExcerpt(HTMLToText(SanitizeHTML(item.Description)), 280)
	}

	author := pickAuthor(item)
	imageURL := pickImage(item)
	publishedAt := item.PublishedParsed
	if publishedAt == nil {
		publishedAt = item.UpdatedParsed
	}

	baseSlug := Slugify(title)
	slug := baseSlug

	return domain.IngestItem{
		Title:              title,
		Slug:               slug,
		Excerpt:            excerpt,
		ContentHTML:        contentHTML,
		ContentText:        contentText,
		Author:             author,
		CanonicalURL:       canonicalURL,
		ImageURL:           imageURL,
		ReadingTimeMinutes: ReadingTimeMinutes(contentText),
		PublishedAt:        publishedAt,
	}, true
}

func canonicalURL(item *gofeed.Item) string {
	if item.Link != "" {
		return NormalizeURL(item.Link)
	}
	if item.GUID != "" && strings.HasPrefix(item.GUID, "http") {
		return NormalizeURL(item.GUID)
	}
	return ""
}

func pickHTMLContent(item *gofeed.Item) string {
	if item.Content != "" {
		return item.Content
	}
	if item.Description != "" && strings.Contains(item.Description, "<") {
		return item.Description
	}
	if item.Description != "" {
		return "<p>" + item.Description + "</p>"
	}
	return ""
}

func pickAuthor(item *gofeed.Item) string {
	if item.Author != nil && item.Author.Name != "" {
		return strings.TrimSpace(item.Author.Name)
	}
	if len(item.Authors) > 0 && item.Authors[0].Name != "" {
		return strings.TrimSpace(item.Authors[0].Name)
	}
	return ""
}

func pickImage(item *gofeed.Item) string {
	if item.Image != nil && item.Image.URL != "" {
		return item.Image.URL
	}
	for _, enc := range item.Enclosures {
		if strings.HasPrefix(enc.Type, "image/") && enc.URL != "" {
			return enc.URL
		}
	}
	return ""
}
