package main

import (
	"crypto/sha256"
	"encoding/base64"
	"fmt"
	"net/http"
	"os"
	"path/filepath"
	"strings"

	"golang.org/x/net/html"

	"github.com/gin-gonic/gin"
	"github.com/rs/zerolog/log"
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
		c.Header("cache-control", "max-age=0, private, must-revalidate")
		c.Header("content-security-policy", middleware.DefaultCSPHeader+inlineScriptCSP("./404.html"))
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
			c.Header("cache-control", "max-age=0, private, must-revalidate")
			c.Header("content-security-policy", middleware.DefaultCSPHeader+inlineScriptCSP(filePath))
			c.File(filePath)
		})
		log.Info().Str("route", route).Msg("Registered route")
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

func inlineScriptCSP(filePath string) string {
	file, err := os.OpenInRoot(".", filePath)
	if err != nil {
		panic(fmt.Sprintf("failed to open HTML [%v]: %v", filePath, err))
	}
	defer func() {
		if err := file.Close(); err != nil {
			log.Err(err).Msg("Failed to close file")
		}
	}()

	doc, err := html.Parse(file)
	if err != nil {
		panic(fmt.Sprintf("failed to parse HTML [%v]: %v", filePath, err))
	}

	sources := []string{"'self'"}
	seen := make(map[string]bool)
	var parseNode func(*html.Node)
	parseNode = func(node *html.Node) {
		if node.Type == html.ElementNode && node.Data == "script" {
			for _, attr := range node.Attr {
				if attr.Key == "src" {
					return
				}
			}
			var script strings.Builder
			for child := node.FirstChild; child != nil; child = child.NextSibling {
				if child.Type == html.TextNode {
					script.WriteString(child.Data)
				}
			}
			hash := sha256.Sum256([]byte(script.String()))
			scriptHash := "'sha256-" + base64.StdEncoding.EncodeToString(hash[:]) + "'"
			if !seen[scriptHash] {
				sources = append(sources, scriptHash)
				seen[scriptHash] = true
			}
			return
		}
		for child := node.FirstChild; child != nil; child = child.NextSibling {
			parseNode(child)
		}
	}
	parseNode(doc)
	return " script-src " + strings.Join(sources, " ") + ";"
}
