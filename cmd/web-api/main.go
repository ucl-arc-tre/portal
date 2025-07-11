package main

import (
	"github.com/ucl-arc-tre/portal/internal/config"
	"github.com/ucl-arc-tre/portal/internal/graceful"
	handler "github.com/ucl-arc-tre/portal/internal/handler/web"
	"github.com/ucl-arc-tre/portal/internal/middleware"
	openapi "github.com/ucl-arc-tre/portal/internal/openapi/web"
	"github.com/ucl-arc-tre/portal/internal/rbac"
	"github.com/ucl-arc-tre/portal/internal/router"
	"github.com/ucl-arc-tre/portal/internal/service/agreements"
)

func main() {
	config.Init()
	graceful.InitDB()
	rbac.Init()
	agreements.Init()
	router := router.New()
	router.Use(middleware.NewSetUser(), middleware.NewAuthz())
	openapi.RegisterHandlersWithOptions(router, handler.New(), openapi.GinServerOptions{
		BaseURL: config.BaseURL,
	})
	graceful.Serve(router.Handler())
}
