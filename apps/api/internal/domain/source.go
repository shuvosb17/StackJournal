package domain

import "time"

type Source struct {
	ID          string     `json:"id"`
	Name        string     `json:"name"`
	Slug        string     `json:"slug"`
	URL         string     `json:"url"`
	FeedURL     *string    `json:"feedUrl,omitempty"`
	SourceType  string     `json:"sourceType"`
	LogoURL     *string    `json:"logoUrl,omitempty"`
	IsTrusted   bool       `json:"isTrusted"`
	LastFetched *time.Time `json:"lastFetchedAt,omitempty"`
	CreatedAt   time.Time  `json:"createdAt"`
}
