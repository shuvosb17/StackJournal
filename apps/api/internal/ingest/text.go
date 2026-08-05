package ingest

import (
	"strings"

	"golang.org/x/net/html"
)

// HTMLToText extracts plain text from HTML for search indexing and excerpts.
func HTMLToText(raw string) string {
	if raw == "" {
		return ""
	}

	doc, err := html.Parse(strings.NewReader(raw))
	if err != nil {
		return strings.Join(strings.Fields(raw), " ")
	}

	var b strings.Builder
	var walk func(*html.Node)
	walk = func(n *html.Node) {
		if n.Type == html.TextNode {
			text := strings.TrimSpace(n.Data)
			if text != "" {
				if b.Len() > 0 {
					b.WriteByte(' ')
				}
				b.WriteString(text)
			}
		}
		for c := n.FirstChild; c != nil; c = c.NextSibling {
			walk(c)
		}
	}
	walk(doc)

	return strings.Join(strings.Fields(b.String()), " ")
}
