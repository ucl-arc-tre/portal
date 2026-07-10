package entra

import (
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/ucl-arc-tre/portal/internal/config"
)

func TestInviteEmailContent(t *testing.T) {
	err := config.SetforTesting("url", "https://portal@example.com")
	assert.NoError(t, err)

	invite := Invite{Recipient: "a@example.com"}
	assert.Equal(t, "You have been invited to the UCL ARC Services Portal.\nYou can login to the portal at https://portal@example.com.", inviteEmailContent(invite))

	invite.Sponsor.Username = "bob@example.com"
	assert.Equal(t, "You have been invited to the UCL ARC Services Portal by bob@example.com.\nYou can login to the portal at https://portal@example.com.", inviteEmailContent(invite))

	invite.Sponsor.ChosenName = "bob"
	assert.Equal(t, "You have been invited to the UCL ARC Services Portal by bob.\nYou can login to the portal at https://portal@example.com.", inviteEmailContent(invite))

	invite.StudyName = new("example-study")
	assert.Equal(t, "You have been invited to join the study 'example-study' by bob.\nYou can login to the portal at https://portal@example.com.", inviteEmailContent(invite))

	invite.ProjectName = new("example-project")
	assert.Equal(t, "You have been invited to join the project 'example-project' in the study 'example-study' by bob.\nYou can login to the portal at https://portal@example.com.", inviteEmailContent(invite))
}
