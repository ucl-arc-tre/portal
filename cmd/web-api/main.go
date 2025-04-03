package main

import (
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
	graceful.Serve(router.Handler())
}
