package entra

import (
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/ucl-arc-tre/portal/internal/config"
)

func TestInviteEmailContent(t *testing.T) {
	err := config.SetforTesting("url", "https://portal@example.com")
	assert.NoError(t, err)

	content := func(i Invite) string {
		return string(inviteEmailContent(i))
	}

	invite := Invite{Recipient: "a@example.com"}
	assert.Equal(t, "You have been invited to the UCL ARC Services Portal.\nYou can login to the portal at https://portal@example.com. The first thing you need to do is complete your profile.", content(invite))

	invite.Sponsor.Username = "bob@example.com"
	assert.Equal(t, "You have been invited to the UCL ARC Services Portal by bob@example.com.\nYou can login to the portal at https://portal@example.com. The first thing you need to do is complete your profile.", content(invite))

	invite.Sponsor.ChosenName = "bob"
	assert.Equal(t, "You have been invited to the UCL ARC Services Portal by bob.\nYou can login to the portal at https://portal@example.com. The first thing you need to do is complete your profile.", content(invite))

	invite.StudyName = new("example-study")
	assert.Equal(t, "You have been invited to join the study 'example-study' by bob.\nYou can login to the portal at https://portal@example.com. The first thing you need to do is complete your profile.", content(invite))

	invite.ProjectName = new("example-project")
	assert.Equal(t, "You have been invited to join the project 'example-project' in the study 'example-study' by bob.\nYou can login to the portal at https://portal@example.com. The first thing you need to do is complete your profile.", content(invite))
}
