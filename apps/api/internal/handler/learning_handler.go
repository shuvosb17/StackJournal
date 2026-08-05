package handler

import (
	"errors"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/jackc/pgx/v5"
)

func (h *Handler) ListLearningPaths(c *gin.Context) {
	paths, err := h.learning.ListPaths(c.Request.Context())
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to fetch learning paths"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": paths})
}

func (h *Handler) GetLearningPath(c *gin.Context) {
	path, err := h.learning.GetPathBySlug(c.Request.Context(), c.Param("slug"))
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			c.JSON(http.StatusNotFound, gin.H{"error": "learning path not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to fetch learning path"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": path})
}

func (h *Handler) ListCaseStudies(c *gin.Context) {
	items, err := h.caseStudies.List(c.Request.Context())
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to fetch case studies"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": items})
}

func (h *Handler) GetCaseStudy(c *gin.Context) {
	study, err := h.caseStudies.GetBySlug(c.Request.Context(), c.Param("slug"))
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			c.JSON(http.StatusNotFound, gin.H{"error": "case study not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to fetch case study"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": study})
}
