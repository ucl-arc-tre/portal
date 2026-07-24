package entra

import (
	"html/template"

	"github.com/ucl-arc-tre/portal/internal/config"
)

func inviteEmailContent(invite Invite) template.HTML {
	content := "You have been invited"
	if invite.StudyName != nil {
		if invite.ProjectName != nil {
			content += " to join the project '" + template.HTMLEscapeString(*invite.ProjectName) + "' in the study '" + template.HTMLEscapeString(*invite.StudyName) + "'"
		} else {
			content += " to join the study '" + template.HTMLEscapeString(*invite.StudyName) + "'"
		}
	} else {
		content += " to the UCL ARC Services Portal"
	}

	if invite.Sponsor.ChosenName != "" {
		content += " by " + template.HTMLEscapeString(string(invite.Sponsor.ChosenName))
	} else if invite.Sponsor.Username != "" {
		content += " by " + template.HTMLEscapeString(string(invite.Sponsor.Username))
	}
	content += ".\nYou can login to the portal at " + config.PortalUrl() + ". The first thing you need to do is complete your profile."
	return template.HTML(content) // #nosec G203 -- untrusted is escaped
}
