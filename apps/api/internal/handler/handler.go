package handler

import (
	"errors"
	"net/http"
	"strconv"

	"stackjournal/api/internal/service"

	"github.com/gin-gonic/gin"
	"github.com/jackc/pgx/v5"
)

type Handler struct {
	articles    *service.ArticleService
	categories  *service.CategoryService
	search      *service.SearchService
	learning    *service.LearningService
	caseStudies *service.CaseStudyService
}

func New(
	articles *service.ArticleService,
	categories *service.CategoryService,
	search *service.SearchService,
	learning *service.LearningService,
	caseStudies *service.CaseStudyService,
) *Handler {
	return &Handler{
		articles:    articles,
		categories:  categories,
		search:      search,
		learning:    learning,
		caseStudies: caseStudies,
	}
}

func (h *Handler) RegisterRoutes(r *gin.Engine) {
	v1 := r.Group("/v1")
	{
		v1.GET("/health", h.Health)
		v1.GET("/search", h.Search)
		v1.GET("/articles", h.ListArticles)
		v1.GET("/articles/latest", h.LatestArticles)
		v1.GET("/articles/trending", h.TrendingArticles)
		v1.GET("/articles/:slug", h.GetArticle)
		v1.GET("/categories", h.ListCategories)
		v1.GET("/learning/paths", h.ListLearningPaths)
		v1.GET("/learning/paths/:slug", h.GetLearningPath)
		v1.GET("/case-studies", h.ListCaseStudies)
		v1.GET("/case-studies/:slug", h.GetCaseStudy)
	}
}

func (h *Handler) Health(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{
		"status":  "ok",
		"service": "stackjournal-api",
	})
}

func (h *Handler) ListArticles(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "20"))
	category := c.Query("category")

	result, err := h.articles.List(c.Request.Context(), page, limit, category)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to fetch articles"})
		return
	}
	c.JSON(http.StatusOK, result)
}

func (h *Handler) LatestArticles(c *gin.Context) {
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "10"))
	articles, err := h.articles.Latest(c.Request.Context(), limit)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to fetch latest articles"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": articles})
}

func (h *Handler) TrendingArticles(c *gin.Context) {
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "8"))
	articles, err := h.articles.Trending(c.Request.Context(), limit)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to fetch trending articles"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": articles})
}

func (h *Handler) GetArticle(c *gin.Context) {
	slug := c.Param("slug")
	article, err := h.articles.GetBySlug(c.Request.Context(), slug)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			c.JSON(http.StatusNotFound, gin.H{"error": "article not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to fetch article"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": article})
}

func (h *Handler) ListCategories(c *gin.Context) {
	categories, err := h.categories.List(c.Request.Context())
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to fetch categories"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": categories})
}
