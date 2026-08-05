package domain

import "time"

type Category struct {
	ID          string    `json:"id"`
	Name        string    `json:"name"`
	Slug        string    `json:"slug"`
	Description *string   `json:"description,omitempty"`
	Icon        *string   `json:"icon,omitempty"`
	SortOrder   int       `json:"sortOrder"`
	IsLearning  bool      `json:"isLearning"`
	CreatedAt   time.Time `json:"createdAt"`
}
