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

	router.Static("/_next", "./_next")
	router.StaticFile("/favicon.ico", "./favicon.ico")
	router.StaticFile("/index.txt", "./index.txt")

	registerHTMLRoutes(router)

	// serve fallback 404 page
	router.NoRoute(func(c *gin.Context) {
		c.Status(http.StatusNotFound)
		c.File("./404.html")
	})

	graceful.Serve(router.Handler())
}

// mount every *.html file as its own route
func registerHTMLRoutes(router *gin.Engine) {
	items, err := os.ReadDir(".")

	if err != nil {
		panic(fmt.Sprintf("failed to read dir [%v]", err))
	}

	for _, item := range items {
		if item.IsDir() || !strings.HasSuffix(item.Name(), ".html") {
			continue
		}

		file := item.Name() // e.g. "about.html"
		route := "/" + strings.TrimSuffix(file, ".html")
		if file == "index.html" {
			route = "/"
		}

		filePath := "./" + file
		router.GET(route, func(c *gin.Context) {
			c.File(filePath)
		})
	}
}
