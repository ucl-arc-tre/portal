package main

import (
	"github.com/ucl-arc-tre/portal/internal/graceful"
	handler "github.com/ucl-arc-tre/portal/internal/handler/web"
	"github.com/ucl-arc-tre/portal/internal/middleware"
	openapi "github.com/ucl-arc-tre/portal/internal/openapi/web"
	"github.com/ucl-arc-tre/portal/internal/router"
)

func main() {
	_ = graceful.NewDB()
	router := router.New()
	router.Use(middleware.SetUser)
	openapi.RegisterHandlersWithOptions(router, handler.New(), openapi.GinServerOptions{
		BaseURL: "api/v0",
	})
	graceful.Serve(router.Handler())
}
