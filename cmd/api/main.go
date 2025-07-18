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
	initialise()
	router := router.New()
	addWeb(router.Group(config.BaseWebURL))
	addTRE(router.Group(config.BaseTREURL))
	graceful.Serve(router.Handler())
}

func initialise() {
	config.Init()
	graceful.InitDB()
	rbac.Init()
	agreements.Init()
}

// Add the web API defined by its OpenAPI spec with suitable middleware
func addWeb(router gin.IRouter) {
	router.Use(middleware.NewSecure(), middleware.NewSetUser(), middleware.NewAuthz())
	apiweb.RegisterHandlers(router, web.New())
}

// Add the TRE API defined by its OpenAPI spec with suitable middleware
func addTRE(router gin.IRouter) {
	router.Use(gin.BasicAuth(config.TREUserAccounts()))
	apitre.RegisterHandlers(router, tre.New())
}
