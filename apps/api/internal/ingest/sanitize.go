package ingest

import (
	"github.com/microcosm-cc/bluemonday"
)

var articlePolicy = func() *bluemonday.Policy {
	p := bluemonday.UGCPolicy()
	p.AllowAttrs("class", "id").Globally()
	p.AllowAttrs("href", "title", "target", "rel").OnElements("a")
	p.AllowAttrs("src", "alt", "title", "width", "height").OnElements("img")
	p.AllowAttrs("colspan", "rowspan").OnElements("td", "th")
	p.RequireNoFollowOnLinks(true)
	p.AddTargetBlankToFullyQualifiedLinks(true)
	return p
}()

// SanitizeHTML strips unsafe markup while preserving readable article content.
func SanitizeHTML(raw string) string {
	if raw == "" {
		return ""
	}
	return articlePolicy.Sanitize(raw)
}
