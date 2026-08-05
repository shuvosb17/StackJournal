package ingest

import "strings"

// DefaultCategoryForSource maps trusted source slugs to category slugs.
var DefaultCategoryForSource = map[string]string{
	"go-blog":            "go",
	"aws-blog":           "aws",
	"openai":             "ai",
	"anthropic":          "ai",
	"cloudflare":         "networking",
	"stripe-engineering": "backend",
	"netflix-tech":       "case-studies",
	"bytebytego":         "system-design",
	"martin-fowler":      "backend",
	"infoq":              "backend",
	"google-ai":          "ai",
	"microsoft":          "backend",
	"github-blog":        "open-source",
	"docker":             "docker",
	"kubernetes":         "kubernetes",
	"hashicorp":          "devops",
	"cncf":               "cloud",
	"hackernews":         "learning",
	"pragmatic-engineer": "career",
	"leaddev":            "career",
}

var hiringKeywords = []string{
	"hiring", "we're hiring", "we are hiring", "open role", "open roles",
	"job market", "recruiting", "recruitment", "talent", "headcount",
}

var careerKeywords = []string{
	"career", "promotion", "staff engineer", "principal engineer",
	"engineering manager", "ic path", "performance review", "compensation",
	"salary", "interview", "resume", "job search", "layoff", "laid off",
}

func CategorySlugForSource(sourceSlug string) string {
	if slug, ok := DefaultCategoryForSource[sourceSlug]; ok {
		return slug
	}
	return "learning"
}

func CategorySlugForArticle(sourceSlug, title, excerpt string) string {
	lower := strings.ToLower(title + " " + excerpt)
	if containsKeyword(lower, hiringKeywords) {
		return "hiring"
	}
	if containsKeyword(lower, careerKeywords) {
		return "career"
	}
	return CategorySlugForSource(sourceSlug)
}

func containsKeyword(text string, keywords []string) bool {
	for _, kw := range keywords {
		if strings.Contains(text, kw) {
			return true
		}
	}
	return false
}
