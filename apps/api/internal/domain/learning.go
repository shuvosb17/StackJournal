package domain

import "time"

type LearningPathStep struct {
	ID           string  `json:"id"`
	Title        string  `json:"title"`
	Description  *string `json:"description,omitempty"`
	ContentHTML  *string `json:"contentHtml,omitempty"`
	CategorySlug *string `json:"categorySlug,omitempty"`
	SortOrder    int     `json:"sortOrder"`
	ArticleID    *string `json:"articleId,omitempty"`
	ArticleSlug  *string `json:"articleSlug,omitempty"`
	ArticleTitle *string `json:"articleTitle,omitempty"`
}

type LearningPath struct {
	ID          string             `json:"id"`
	Title       string             `json:"title"`
	Slug        string             `json:"slug"`
	Description *string            `json:"description,omitempty"`
	SortOrder   int                `json:"sortOrder"`
	Steps       []LearningPathStep `json:"steps"`
	CreatedAt   time.Time          `json:"createdAt"`
}

type CaseStudy struct {
	ID           string     `json:"id"`
	Title        string     `json:"title"`
	Slug         string     `json:"slug"`
	Company      *string    `json:"company,omitempty"`
	Overview     *string    `json:"overview,omitempty"`
	Problem      *string    `json:"problem,omitempty"`
	Requirements *string    `json:"requirements,omitempty"`
	Architecture *string    `json:"architecture,omitempty"`
	DataFlow     *string    `json:"dataFlow,omitempty"`
	Scaling      *string    `json:"scaling,omitempty"`
	Tradeoffs    *string    `json:"tradeoffs,omitempty"`
	Lessons      *string    `json:"lessons,omitempty"`
	HeroImage    *string    `json:"heroImage,omitempty"`
	PublishedAt  *time.Time `json:"publishedAt,omitempty"`
	CreatedAt    time.Time  `json:"createdAt"`
}

type CaseStudyListItem struct {
	ID          string     `json:"id"`
	Title       string     `json:"title"`
	Slug        string     `json:"slug"`
	Company     *string    `json:"company,omitempty"`
	Overview    *string    `json:"overview,omitempty"`
	PublishedAt *time.Time `json:"publishedAt,omitempty"`
}

type ContinueReading struct {
	Article     Article `json:"article"`
	ProgressPct float64 `json:"progressPct"`
	LastReadAt  string  `json:"lastReadAt"`
}

type UserProfile struct {
	ID    string `json:"id"`
	Email string `json:"email"`
}
