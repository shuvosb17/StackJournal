package domain

import "time"

type FeedSource struct {
	ID      string
	Name    string
	Slug    string
	FeedURL string
}

type IngestItem struct {
	Title              string
	Slug               string
	Excerpt            string
	ContentHTML        string
	ContentText        string
	Author             string
	CanonicalURL       string
	ImageURL           string
	ReadingTimeMinutes int
	PublishedAt        *time.Time
}

type IngestResult struct {
	SourceSlug     string
	ArticlesNew    int
	ArticlesSkipped int
	Error          error
}

type IngestRunSummary struct {
	SourcesOK      int
	SourcesFailed  int
	ArticlesNew    int
	ArticlesSkipped int
}
