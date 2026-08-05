package ingest

import (
	"testing"
)

func TestSlugify(t *testing.T) {
	tests := []struct {
		in   string
		want string
	}{
		{"Designing Idempotent APIs", "designing-idempotent-apis"},
		{"  Go 1.23: Range Over Function Types  ", "go-1-23-range-over-function-types"},
		{"!!!", "article"},
	}

	for _, tt := range tests {
		got := Slugify(tt.in)
		if got != tt.want {
			t.Errorf("Slugify(%q) = %q, want %q", tt.in, got, tt.want)
		}
	}
}

func TestReadingTimeMinutes(t *testing.T) {
	text := "one two three four five six seven eight nine ten"
	if got := ReadingTimeMinutes(text); got != 1 {
		t.Fatalf("ReadingTimeMinutes() = %d, want 1", got)
	}
}

func TestHTMLToText(t *testing.T) {
	got := HTMLToText("<p>Hello <strong>world</strong></p>")
	if got != "Hello world" {
		t.Fatalf("HTMLToText() = %q, want %q", got, "Hello world")
	}
}

func TestIsPrintableTitle(t *testing.T) {
	if !IsPrintableTitle("Valid Article Title") {
		t.Fatal("expected printable title")
	}
	if IsPrintableTitle("!!!") {
		t.Fatal("expected non-printable title")
	}
}
