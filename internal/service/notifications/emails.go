package notifications

import (
	"html/template"
	"strings"

	"github.com/ucl-arc-tre/portal/internal/config"
)

// Get a HTML a tagged content with a href link to a portal URL
//
//	htmlHref("foo", "/profile") -> "<a href="https://example.com/profile">foo</a>"
func htmlHref(label string, relPath string) template.HTML {
	if !strings.HasPrefix(relPath, "/") ||
		strings.HasPrefix(relPath, "//") {
		panic("invalid portal-relative URL")
	}

	href := strings.TrimSuffix(config.PortalUrl(), "/") + relPath

	return template.HTML(
		`<a href="` + template.HTMLEscapeString(href) + `">` +
			template.HTMLEscapeString(label) +
			`</a>`,
	)
}
