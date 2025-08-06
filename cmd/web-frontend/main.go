package main

import (
	"fmt"
	"net/http"
	"os"
	"path/filepath"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/ucl-arc-tre/portal/internal/graceful"
	"github.com/ucl-arc-tre/portal/internal/middleware"
	"github.com/ucl-arc-tre/portal/internal/router"
)

func main() {
	router := router.New()
	router.Use(middleware.NewSecure())

	router.Static("/_next", "./_next")
	registerStaticFiles(router, ".")
	registerHTMLRoutes(router, ".")

	// serve fallback 404 page
	router.NoRoute(func(c *gin.Context) {
		c.Status(http.StatusNotFound)
		c.File("./404.html")
	})

	graceful.Serve(router.Handler())
}

// mount every *.html file as its own route
func registerHTMLRoutes(router *gin.Engine, dir string) {
	for _, item := range mustReadDir(dir) {
		if item.IsDir() {
			registerHTMLRoutes(router, filepath.Join(dir, item.Name()))
			continue
		}
		if !strings.HasSuffix(item.Name(), ".html") || item.Name() == "404.html" {
			continue
		}

		filePath := filepath.Join(dir, item.Name()) // e.g. "./about.html"
		route := "/" + strings.TrimSuffix(filePath, ".html")
		if filePath == "index.html" {
			route = "/"
		}

		router.GET(route, func(c *gin.Context) {
			c.File(filePath)
		})
	}
}

func registerStaticFiles(router *gin.Engine, dir string) {
	extensions := []string{".svg", ".ico"}
	for _, item := range mustReadDir(dir) {
		for _, extension := range extensions {
			if strings.HasSuffix(item.Name(), extension) {
				router.StaticFile("/"+item.Name(), fmt.Sprintf("%v/%v", dir, item.Name()))
			}
		}
	}
}

func mustReadDir(dir string) []os.DirEntry {
	items, err := os.ReadDir(dir)
	if err != nil {
		panic(fmt.Sprintf("failed to read dir [%v]", err))
	}
	return items
}
