package entra

import (
	"context"
	"errors"
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/ucl-arc-tre/portal/internal/types"
)

func TestCustomMailContent(t *testing.T) {
	content, err := newTemplatedEmailContent(EmailTemplateParams{
		Content:   "hello world",
		PortalUrl: "https://portal.example.com",
	})
	assert.NoError(t, err)
	expected := "<!DOCTYPE html>\n<html><head><meta http-equiv=\"Content-Type\" content=\"text/html; charset=utf-8\">\n<style>\n\t\t\thtml {\n\t\t\t\tfont-family: \"Helvetica Neue\", Helvetica, Arial, sans-serif;\n\t\t\t\tfont-size: 14px;\n\t\t\t\tbackground-color: #fafafa;\n\t\t\t}\n\n\t\t\t.header {\n\t\t\t  margin-top: 2rem;\n\t\t\t}\n\n\t\t\t.content {\n\t\t\t\tpadding-top: 1rem;\n\t\t\t}\n\n\t\t\t.footer {\n\t\t\t  font-size: 12px;\n\t\t\t}\n\n\t\t\thr {\n\t\t\t\tmargin-top: 2rem;\n\t\t\t}\n\t\t</style>\n</head>\n<body>\n\n<table border=\"0\" cellpadding=\"0\" cellspacing=\"0\" width=\"100%\" style=\"table-layout: fixed;\">\n  <tr>\n    <td align=\"center\" style=\"padding: 0;\">\n      <table border=\"0\" cellpadding=\"0\" cellspacing=\"0\" width=\"600\" style=\"width: 650px; margin: 0 auto;\">\n        <tr>\n          <td align=\"left\" style=\"padding: 20px;\">\n            <div class=\"header\">\n              <img alt=\"UCL Logo\" height=\"60\" src=\"https://cdn.ucl.ac.uk/logos/ucl/ucl-logo--primary.svg\">\n            </div>\n            <h2>ARC Services Portal Notification</h2>\n            <div class=\"content\">hello world</div>\n            <hr>\n            <div class=\"footer\">\n              <p>\n                You can sign into the portal at \t\t\t\t<a href=\"https://portal.example.com\">https://portal.example.com</a>.\n              </p>\n              <p><em>This is an automated message. This mailbox is monitored so you can reply to this email if you need assistance.</em>\n              </p>\n            </div>\n          </td>\n        </tr>\n      </table>\n    </td>\n  </tr>\n</table>\n</body>\n</html>\n"
	assert.Equal(t, expected, *content)
}

func TestCannotSendCustomEmail(t *testing.T) {
	controller := Controller{}
	err := controller.SendEmail(context.Background(), "subject", []string{}, "content")
	assert.True(t, errors.Is(err, types.ErrInvalidObject))
}
