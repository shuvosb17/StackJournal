package main

import (
	"context"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"stackjournal/api/internal/config"
	"stackjournal/api/internal/handler"
	"stackjournal/api/internal/middleware"
	"stackjournal/api/internal/repository"
	"stackjournal/api/internal/service"

	"github.com/gin-gonic/gin"
)

func main() {
	cfg, err := config.Load()
	if err != nil {
		log.Fatalf("load config: %v", err)
	}

	if cfg.Environment == "production" {
		gin.SetMode(gin.ReleaseMode)
	}

	ctx := context.Background()

	if cfg.DatabaseURL != "" {
		if err := repository.RunMigrations(ctx, cfg.DatabaseURL); err != nil {
			log.Fatalf("run migrations: %v", err)
		}
	}

	pool, err := repository.NewPool(ctx, cfg.DatabaseURL)
	if err != nil {
		log.Fatalf("connect database: %v", err)
	}
	defer pool.Close()

	articleRepo := repository.NewArticleRepository(pool)
	categoryRepo := repository.NewCategoryRepository(pool)
	searchRepo := repository.NewSearchRepository(pool)
	learningRepo := repository.NewLearningRepository(pool)
	caseStudyRepo := repository.NewCaseStudyRepository(pool)

	articleService := service.NewArticleService(articleRepo)
	categoryService := service.NewCategoryService(categoryRepo)
	searchService := service.NewSearchService(searchRepo)
	learningService := service.NewLearningService(learningRepo)
	caseStudyService := service.NewCaseStudyService(caseStudyRepo)

	h := handler.New(articleService, categoryService, searchService, learningService, caseStudyService)

	router := gin.New()
	router.Use(gin.Recovery())
	router.Use(middleware.CORS(cfg.CORSOrigin))
	router.Use(middleware.RequestLogger())

	h.RegisterRoutes(router)

	srv := &http.Server{
		Addr:              ":" + cfg.Port,
		Handler:           router,
		ReadHeaderTimeout: 10 * time.Second,
	}

	go func() {
		log.Printf("StackJournal API listening on :%s", cfg.Port)
		if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatalf("server error: %v", err)
		}
	}()

	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit

	shutdownCtx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	if err := srv.Shutdown(shutdownCtx); err != nil {
		log.Fatalf("shutdown error: %v", err)
	}
}
