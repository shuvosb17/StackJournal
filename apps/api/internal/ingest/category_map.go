package ingest

// DefaultCategoryForSource maps trusted source slugs to category slugs.
var DefaultCategoryForSource = map[string]string{
	"go-blog":           "go",
	"aws-blog":          "aws",
	"openai":            "ai",
	"anthropic":         "ai",
	"cloudflare":        "networking",
	"stripe-engineering": "backend",
	"netflix-tech":      "case-studies",
	"bytebytego":        "system-design",
	"martin-fowler":     "backend",
	"infoq":             "backend",
	"google-ai":         "ai",
	"microsoft":         "backend",
	"github-blog":       "open-source",
	"docker":            "docker",
	"kubernetes":        "kubernetes",
	"hashicorp":         "devops",
	"cncf":              "cloud",
	"hackernews":        "learning",
}

func CategorySlugForSource(sourceSlug string) string {
	if slug, ok := DefaultCategoryForSource[sourceSlug]; ok {
		return slug
	}
	return "learning"
}
