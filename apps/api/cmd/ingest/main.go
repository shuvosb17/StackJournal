package main

import (
	"context"
	"flag"
	"log"
	"log/slog"
	"os"
	"os/signal"
	"syscall"
	"time"

	"stackjournal/api/internal/config"
	"stackjournal/api/internal/ingest"
	"stackjournal/api/internal/repository"
	"stackjournal/api/internal/service"
)

func main() {
	sourceSlug := flag.String("source", "", "only ingest a single source slug")
	flag.Parse()

	cfg, err := config.Load()
	if err != nil {
		log.Fatalf("load config: %v", err)
	}
	if cfg.DatabaseURL == "" {
		log.Fatal("DATABASE_URL is required")
	}

	logger := slog.New(slog.NewTextHandler(os.Stdout, &slog.HandlerOptions{Level: slog.LevelInfo}))

	ctx, stop := signal.NotifyContext(context.Background(), syscall.SIGINT, syscall.SIGTERM)
	defer stop()

	if err := repository.RunMigrations(ctx, cfg.DatabaseURL); err != nil {
		log.Fatalf("run migrations: %v", err)
	}

	pool, err := repository.NewPool(ctx, cfg.DatabaseURL)
	if err != nil {
		log.Fatalf("connect database: %v", err)
	}
	defer pool.Close()

	sourceRepo := repository.NewSourceRepository(pool)
	ingestRepo := repository.NewIngestRepository(pool)
	parser := ingest.NewParser()
	ingestService := service.NewIngestService(sourceRepo, ingestRepo, parser, logger)

	runCtx, cancel := context.WithTimeout(ctx, 10*time.Minute)
	defer cancel()

	summary, err := ingestService.Run(runCtx, *sourceSlug)
	if err != nil {
		log.Fatalf("ingest failed: %v", err)
	}

	logger.Info("ingest complete",
		"sources_ok", summary.SourcesOK,
		"sources_failed", summary.SourcesFailed,
		"articles_new", summary.ArticlesNew,
		"articles_skipped", summary.ArticlesSkipped,
	)

	if summary.SourcesFailed > 0 {
		os.Exit(1)
	}
}
