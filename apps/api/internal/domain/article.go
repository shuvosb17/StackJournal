package domain

import "time"

type Article struct {
	ID                 string     `json:"id"`
	SourceID           *string    `json:"sourceId,omitempty"`
	CategoryID         *string    `json:"categoryId,omitempty"`
	Title              string     `json:"title"`
	Slug               string     `json:"slug"`
	Excerpt            *string    `json:"excerpt,omitempty"`
	ContentHTML        *string    `json:"contentHtml,omitempty"`
	Author             *string    `json:"author,omitempty"`
	CanonicalURL       string     `json:"canonicalUrl"`
	ImageURL           *string    `json:"imageUrl,omitempty"`
	ReadingTimeMinutes *int       `json:"readingTimeMinutes,omitempty"`
	PublishedAt        *time.Time `json:"publishedAt,omitempty"`
	IsFeatured         bool       `json:"isFeatured"`
	Status             string     `json:"status"`
	SourceName         *string    `json:"sourceName,omitempty"`
	CategoryName       *string    `json:"categoryName,omitempty"`
	CategorySlug       *string    `json:"categorySlug,omitempty"`
	CreatedAt          time.Time  `json:"createdAt"`
}

type ArticleListMeta struct {
	Page    int  `json:"page"`
	Limit   int  `json:"limit"`
	Total   int  `json:"total"`
	HasMore bool `json:"hasMore"`
}

type ArticleListResponse struct {
	Data []Article       `json:"data"`
	Meta ArticleListMeta `json:"meta"`
}
