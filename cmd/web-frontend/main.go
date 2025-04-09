package main

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/ucl-arc-tre/portal/internal/graceful"
	"github.com/ucl-arc-tre/portal/internal/router"
)

func main() {
	router := router.New()
	router.LoadHTMLFiles("./index.html")
	router.Static("/assets", "./assets")
	router.StaticFile("favicon.ico", "./favicon.ico")
	router.GET("", func(c *gin.Context) {
		c.HTML(http.StatusOK, "index.html", nil)
	})
	graceful.Serve(router.Handler())
}
