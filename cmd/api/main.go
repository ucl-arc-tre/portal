package main

import (
	"github.com/gin-gonic/gin"
	"github.com/ucl-arc-tre/portal/internal/config"
	"github.com/ucl-arc-tre/portal/internal/graceful"
	"github.com/ucl-arc-tre/portal/internal/handler/tre"
	"github.com/ucl-arc-tre/portal/internal/handler/web"
	"github.com/ucl-arc-tre/portal/internal/middleware"
	apitre "github.com/ucl-arc-tre/portal/internal/openapi/tre"
	apiweb "github.com/ucl-arc-tre/portal/internal/openapi/web"
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
	addWeb(router.Group("/web/api/v0/"))
	addTRE(router.Group("/tre/api/v0/"))
	graceful.Serve(router.Handler())
}

func addWeb(router gin.IRouter) {
	router.Use(middleware.NewSecure(), middleware.NewSetUser(), middleware.NewAuthz())
	apiweb.RegisterHandlers(router, web.New())
}

func addTRE(router gin.IRouter) {
	apitre.RegisterHandlers(router, tre.New())
}
