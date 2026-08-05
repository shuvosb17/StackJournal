package ingest

import (
	"crypto/sha256"
	"encoding/hex"
	"regexp"
	"strings"
	"unicode"
)

var (
	nonSlugChars = regexp.MustCompile(`[^a-z0-9]+`)
	multiDash    = regexp.MustCompile(`-+`)
)

// Slugify converts a title into a URL-safe slug.
func Slugify(title string) string {
	s := strings.ToLower(strings.TrimSpace(title))
	s = nonSlugChars.ReplaceAllString(s, "-")
	s = multiDash.ReplaceAllString(s, "-")
	s = strings.Trim(s, "-")

	if s == "" {
		return "article"
	}
	if len(s) > 120 {
		s = strings.Trim(s[:120], "-")
	}
	return s
}

// UniqueSlug appends a short hash suffix when the base slug is already taken.
func UniqueSlug(base, canonicalURL string) string {
	if base == "" {
		base = "article"
	}
	hash := sha256.Sum256([]byte(canonicalURL))
	suffix := hex.EncodeToString(hash[:])[:8]
	return base + "-" + suffix
}

// TruncateExcerpt limits plain text to a readable excerpt length.
func TruncateExcerpt(text string, maxLen int) string {
	text = strings.Join(strings.Fields(text), " ")
	if len(text) <= maxLen {
		return text
	}
	truncated := text[:maxLen]
	if idx := strings.LastIndex(truncated, " "); idx > maxLen/2 {
		truncated = truncated[:idx]
	}
	return truncated + "…"
}

// ReadingTimeMinutes estimates reading time at ~220 words per minute.
func ReadingTimeMinutes(text string) int {
	words := len(strings.Fields(text))
	minutes := words / 220
	if minutes < 1 {
		return 1
	}
	return minutes
}

// NormalizeURL trims and validates a canonical article URL.
func NormalizeURL(raw string) string {
	raw = strings.TrimSpace(raw)
	raw = strings.TrimRight(raw, "/")
	return raw
}

// IsPrintableTitle rejects empty or junk titles.
func IsPrintableTitle(title string) bool {
	title = strings.TrimSpace(title)
	if len(title) < 4 {
		return false
	}
	for _, r := range title {
		if unicode.IsLetter(r) || unicode.IsDigit(r) {
			return true
		}
	}
	return false
}
