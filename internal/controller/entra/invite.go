package entra

import "github.com/ucl-arc-tre/portal/internal/config"

func inviteEmailContent(invite Invite) string {
	content := "You have been invited"
	if invite.StudyName != nil {
		if invite.ProjectName != nil {
			content += " to join the project '" + *invite.ProjectName + "' in the study '" + *invite.StudyName + "'"
		} else {
			content += " to join the study '" + *invite.StudyName + "'"
		}
	} else {
		content += " to the UCL ARC Services Portal"
	}

	if invite.Sponsor.ChosenName != "" {
		content += " by " + string(invite.Sponsor.ChosenName)
	} else if invite.Sponsor.Username != "" {
		content += " by " + string(invite.Sponsor.Username)
	}
	content += ".\nYou can login to the portal at " + config.PortalUrl() + ". The first thing you need to do is complete your profile."
	return content
}
