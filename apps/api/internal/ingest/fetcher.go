package ingest

import (
	"bytes"
	"context"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"strings"
	"time"

	"golang.org/x/net/html"
)

const maxArticleBytes = 2 << 20 // 2 MiB

var articleFetchClient = &http.Client{Timeout: 20 * time.Second}

// FetchArticleContent downloads an external page and extracts readable HTML.
func FetchArticleContent(ctx context.Context, pageURL string) (string, error) {
	parsed, err := url.Parse(pageURL)
	if err != nil || parsed.Scheme == "" || parsed.Host == "" {
		return "", fmt.Errorf("invalid url")
	}
	if strings.Contains(parsed.Host, "news.ycombinator.com") {
		return "", fmt.Errorf("skip hn discussion url")
	}

	req, err := http.NewRequestWithContext(ctx, http.MethodGet, pageURL, nil)
	if err != nil {
		return "", err
	}
	req.Header.Set("User-Agent", "StackJournal/1.0 (+https://github.com/shuvosb17/StackJournal)")
	req.Header.Set("Accept", "text/html,application/xhtml+xml")

	res, err := articleFetchClient.Do(req)
	if err != nil {
		return "", err
	}
	defer res.Body.Close()

	if res.StatusCode != http.StatusOK {
		return "", fmt.Errorf("unexpected status %d", res.StatusCode)
	}

	body, err := io.ReadAll(io.LimitReader(res.Body, maxArticleBytes))
	if err != nil {
		return "", err
	}

	content := extractReadableHTML(body)
	if len(HTMLToText(content)) < 120 {
		return "", fmt.Errorf("insufficient extracted content")
	}
	return SanitizeHTML(content), nil
}

func extractReadableHTML(body []byte) string {
	doc, err := html.Parse(bytes.NewReader(body))
	if err != nil {
		return ""
	}

	for _, sel := range []string{"article", "main"} {
		if node := findFirstTag(doc, sel); node != nil {
			if html := renderNodeHTML(node); len(HTMLToText(html)) >= 120 {
				return html
			}
		}
	}

	if node := findByAttr(doc, "role", "main"); node != nil {
		if html := renderNodeHTML(node); len(HTMLToText(html)) >= 120 {
			return html
		}
	}

	for _, class := range []string{"markdown-body", "post-content", "entry-content", "article-content", "blog-post"} {
		if node := findByClassContains(doc, class); node != nil {
			if html := renderNodeHTML(node); len(HTMLToText(html)) >= 120 {
				return html
			}
		}
	}

	if best := findBestContentBlock(doc); best != nil {
		return renderNodeHTML(best)
	}

	return ""
}

func findFirstTag(n *html.Node, tag string) *html.Node {
	if n.Type == html.ElementNode && n.Data == tag {
		return n
	}
	for c := n.FirstChild; c != nil; c = c.NextSibling {
		if found := findFirstTag(c, tag); found != nil {
			return found
		}
	}
	return nil
}

func findByAttr(n *html.Node, key, value string) *html.Node {
	if n.Type == html.ElementNode {
		for _, attr := range n.Attr {
			if attr.Key == key && attr.Val == value {
				return n
			}
		}
	}
	for c := n.FirstChild; c != nil; c = c.NextSibling {
		if found := findByAttr(c, key, value); found != nil {
			return found
		}
	}
	return nil
}

func findByClassContains(n *html.Node, fragment string) *html.Node {
	if n.Type == html.ElementNode {
		for _, attr := range n.Attr {
			if attr.Key == "class" && strings.Contains(attr.Val, fragment) {
				return n
			}
		}
	}
	for c := n.FirstChild; c != nil; c = c.NextSibling {
		if found := findByClassContains(c, fragment); found != nil {
			return found
		}
	}
	return nil
}

func findBestContentBlock(n *html.Node) *html.Node {
	var best *html.Node
	bestScore := 0

	var walk func(*html.Node)
	walk = func(node *html.Node) {
		if node.Type == html.ElementNode {
			score := scoreContentNode(node)
			if score > bestScore {
				bestScore = score
				best = node
			}
		}
		for c := node.FirstChild; c != nil; c = c.NextSibling {
			walk(c)
		}
	}
	walk(n)

	if bestScore < 120 {
		return nil
	}
	return best
}

func scoreContentNode(n *html.Node) int {
	if n.Type != html.ElementNode {
		return 0
	}
	if skipTags[n.Data] {
		return 0
	}

	score := 0
	var walk func(*html.Node)
	walk = func(node *html.Node) {
		if node.Type == html.ElementNode {
			switch node.Data {
			case "p":
				score += 20
			case "h2", "h3":
				score += 10
			case "li":
				score += 5
			case "pre", "code":
				score += 8
			}
		}
		if node.Type == html.TextNode {
			score += len(strings.Fields(strings.TrimSpace(node.Data)))
		}
		for c := node.FirstChild; c != nil; c = c.NextSibling {
			walk(c)
		}
	}
	walk(n)
	return score
}

var skipTags = map[string]bool{
	"nav": true, "header": true, "footer": true, "aside": true,
	"script": true, "style": true, "noscript": true, "form": true,
}

func renderNodeHTML(n *html.Node) string {
	var buf bytes.Buffer
	for c := n.FirstChild; c != nil; c = c.NextSibling {
		_ = html.Render(&buf, c)
	}
	return buf.String()
}

func IsStubContent(html string) bool {
	return strings.Contains(html, "Discussed on Hacker News")
}

func HasSubstantialContent(html string) bool {
	return len(HTMLToText(html)) >= 120 && !IsStubContent(html)
}
