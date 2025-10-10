package entra

import (
	"context"

	graphmodels "github.com/microsoftgraph/msgraph-sdk-go/models"
	graphusers "github.com/microsoftgraph/msgraph-sdk-go/users"
	"github.com/ucl-arc-tre/portal/internal/config"
	"github.com/ucl-arc-tre/portal/internal/types"
)

func (c *Controller) SendCustomInviteNotification(ctx context.Context, email string, sponsor types.Sponsor) error {
	// use graph to send email saying so-and-so has invited you to the portal

	requestBody := graphusers.NewItemSendMailPostRequestBody()
	message := graphmodels.NewMessage()
	subject := "Notification: You have been invited to the UCL ARC Services Portal"
	message.SetSubject(&subject)
	body := graphmodels.NewItemBody()
	contentType := graphmodels.HTML_BODYTYPE
	body.SetContentType(&contentType)

	content := ""
	if sponsor.ChosenName != "" {
		content = "You have been invited to join the UCL ARC Services Portal by " + string(sponsor.ChosenName)
	} else {
		content = "You have been invited to join the UCL ARC Services Portal by " + string(sponsor.Username)
	}
	content = content + "<br><br>You can sign into the portal at <a href='https://portal.arc.ucl.ac.uk'>https://portal.arc.ucl.ac.uk</a> <br><br> This is an automated message, but this mailbox is monitored so you can contact us if you need assistance."

	body.SetContent(&content)
	message.SetBody(body)

	recipient := graphmodels.NewRecipient()
	emailAddress := graphmodels.NewEmailAddress()
	emailAddress.SetAddress(&email)
	recipient.SetEmailAddress(emailAddress)

	toRecipients := []graphmodels.Recipientable{
		recipient,
	}
	message.SetToRecipients(toRecipients)

	requestBody.SetMessage(message)
	saveToSentItems := true
	requestBody.SetSaveToSentItems(&saveToSentItems)

	userID := config.EntraMailUserPrincipal()

	// use the mail client to send via the mailbox
	err := c.mailClient.Users().ByUserId(userID).SendMail().Post(ctx, requestBody, nil)
	if err != nil {
		return types.NewErrServerError(err)
	}

	return nil
}

func (c *Controller) SendChosenNameChangeRequestNotification(ctx context.Context, recipientEmail string, username types.Username, currentChosenName types.ChosenName, newChosenName types.ChosenName, reason string) error {
	requestBody := graphusers.NewItemSendMailPostRequestBody()
	message := graphmodels.NewMessage()
	subject := "Chosen Name Change Request"
	message.SetSubject(&subject)
	body := graphmodels.NewItemBody()
	contentType := graphmodels.HTML_BODYTYPE
	body.SetContentType(&contentType)

	content := "<h3>Chosen Name Change Request</h3>"
	content += "<p><strong>User Email:</strong> " + string(username) + "</p>"
	content += "<p><strong>Current Chosen Name:</strong> " + string(currentChosenName) + "</p>"
	content += "<p><strong>Requested New Chosen Name:</strong> " + string(newChosenName) + "</p>"
	if reason != "" {
		content += "<p><strong>Reason:</strong> " + reason + "</p>"
	}
	content += "<br><p>This is an automated notification from the UCL ARC Services Portal.</p>"

	body.SetContent(&content)
	message.SetBody(body)

	recipient := graphmodels.NewRecipient()
	emailAddress := graphmodels.NewEmailAddress()
	emailAddress.SetAddress(&recipientEmail)
	recipient.SetEmailAddress(emailAddress)

	toRecipients := []graphmodels.Recipientable{
		recipient,
	}
	message.SetToRecipients(toRecipients)

	requestBody.SetMessage(message)
	saveToSentItems := true
	requestBody.SetSaveToSentItems(&saveToSentItems)

	userID := config.EntraMailUserPrincipal()

	err := c.mailClient.Users().ByUserId(userID).SendMail().Post(ctx, requestBody, nil)
	if err != nil {
		return types.NewErrServerError(err)
	}

	return nil
}
