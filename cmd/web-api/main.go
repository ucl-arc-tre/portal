package main

import (
	"net/http"
	"time"

	"github.com/ucl-arc-tre/portal/internal/config"
	"github.com/ucl-arc-tre/portal/internal/graceful"
	handler "github.com/ucl-arc-tre/portal/internal/handler/web"
	openapi "github.com/ucl-arc-tre/portal/internal/openapi/web"
	"github.com/ucl-arc-tre/portal/internal/router"
)

func main() {
	router := router.New()
	openapi.RegisterHandlersWithOptions(router, handler.New(), openapi.GinServerOptions{
		BaseURL: "api/v0",
	})
	server := &http.Server{
		Addr:              config.ServerAddress(),
		Handler:           router.Handler(),
		ReadHeaderTimeout: 10 * time.Second,
	}
	graceful.Serve(server)
}
