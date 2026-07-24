package notifications

import (
	"html/template"
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/ucl-arc-tre/portal/internal/config"
)

func TestHtmlHref(t *testing.T) {
	err := config.SetforTesting("url", "https://example.com")
	assert.NoError(t, err)
	assert.Equal(t, template.HTML(`<a href="https://example.com/profile">foo</a>`), htmlHref("foo", "/profile"))
}
