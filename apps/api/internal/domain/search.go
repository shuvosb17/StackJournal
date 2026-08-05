package domain

type SearchTag struct {
	ID   string `json:"id"`
	Name string `json:"name"`
	Slug string `json:"slug"`
}

type SearchSource struct {
	ID   string `json:"id"`
	Name string `json:"name"`
	Slug string `json:"slug"`
	URL  string `json:"url"`
}

type SearchCategory struct {
	ID   string `json:"id"`
	Name string `json:"name"`
	Slug string `json:"slug"`
}

type SearchArticleHit struct {
	ID                 string  `json:"id"`
	Title              string  `json:"title"`
	Slug               string  `json:"slug"`
	Excerpt            *string `json:"excerpt,omitempty"`
	SourceName         *string `json:"sourceName,omitempty"`
	CategoryName       *string `json:"categoryName,omitempty"`
	ReadingTimeMinutes *int    `json:"readingTimeMinutes,omitempty"`
}

type SearchResults struct {
	Articles   []SearchArticleHit `json:"articles"`
	Categories []SearchCategory   `json:"categories"`
	Sources    []SearchSource     `json:"sources"`
	Tags       []SearchTag        `json:"tags"`
}

type SearchResponse struct {
	Data SearchResults `json:"data"`
	Meta SearchMeta    `json:"meta"`
}

type SearchMeta struct {
	Query string `json:"query"`
	Total int    `json:"total"`
}
