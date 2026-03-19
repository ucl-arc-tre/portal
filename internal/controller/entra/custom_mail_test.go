package entra

import (
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestCustomMailContent(t *testing.T) {
	content, err := newTemplatedEmailContent(EmailTemplateParams{
		Content:   "hello world",
		PortalUrl: "https://portal.example.com",
	})
	assert.NoError(t, err)
	expected := "<!DOCTYPE html>\n<html>\n\t<head>\n\t\t<meta charset=\"utf-8\" />\n\t\t<style>\n\t\t\thtml {\n\t\t\t\tfont-family: \"Helvetica Neue\", Helvetica, Arial, sans-serif;\n\t\t\t}\n\t\t\tbody,\n\t\t\tfooter {\n\t\t\t\tmax-width: 700px;\n\t\t\t}\n\n\t\t\t.content {\n\t\t\t\tfont-size: 18px;\n\t\t\t\tpadding-top: 2rem;\n\t\t\t}\n\n\t\t\thr {\n\t\t\t\tmargin-top: 2rem;\n\t\t\t}\n\n\t\t\tfooter {\n\t\t\t\tfont-size: 14px;\n\t\t\t}\n\t\t</style>\n\t</head>\n\t<header>\n\t\t<img src=\"cid:uclBanner\" alt=\"UCL banner\" height=\"100\" />\n\t</header>\n\t<body>\n\t\t<div class=\"content\">hello world</div>\n\n\t\t<hr />\n\t\t<footer>\n\t\t\t<p>\n\t\t\t\tYou can sign into the portal at\n\t\t\t\t<a href=\"https://portal.example.com\">https://portal.example.com</a>.\n\t\t\t</p>\n\t\t\t<p>\n\t\t\t\t<em>\n\t\t\t\t\tThis is an automated message. This mailbox is monitored so you can\n\t\t\t\t\treply to this email if you need assistance.</em\n\t\t\t\t>\n\t\t\t</p>\n\t\t</footer>\n\t</body>\n</html>\n"
	assert.Equal(t, expected, *content)
}
