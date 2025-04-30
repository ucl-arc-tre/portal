package main

import (
	"fmt"
	"net/http"
	"os"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/ucl-arc-tre/portal/internal/graceful"
	"github.com/ucl-arc-tre/portal/internal/router"
)

func main() {
	router := router.New()
	router.Static("/assets", "./assets")
	router.Static("/_next", "./_next")
	router.StaticFile("favicon.ico", "./favicon.ico")
	serveHTML(router)
	graceful.Serve(router.Handler())
}

func serveHTML(router *gin.Engine) {
	items, err := os.ReadDir(".")
	if err != nil {
		panic(fmt.Sprintf("failed to read dir [%v]", err))
	}
	for _, item := range items {
		if strings.HasSuffix(item.Name(), ".html") {
			serveSingleHTML(router, item.Name())
		}
	}
}

func serveSingleHTML(router *gin.Engine, filename string) {
	path := ""
	if filename != "index.html" {
		path = strings.TrimSuffix(filename, ".html")
	}
	router.LoadHTMLFiles(filename)
	router.GET(path, func(c *gin.Context) {
		c.HTML(http.StatusOK, filename, nil)
	})
}
