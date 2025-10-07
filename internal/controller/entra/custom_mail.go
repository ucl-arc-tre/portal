package entra

import (
	"context"

	graphmodels "github.com/microsoftgraph/msgraph-sdk-go/models"
	graphusers "github.com/microsoftgraph/msgraph-sdk-go/users"
	"github.com/ucl-arc-tre/portal/internal/config"
	openapi "github.com/ucl-arc-tre/portal/internal/openapi/web"
	"github.com/ucl-arc-tre/portal/internal/types"
)

func (c *Controller) createCustomEmail(ctx context.Context, subject string, emails []string, content string) error {
	// set up the email

	requestBody := graphusers.NewItemSendMailPostRequestBody()
	message := graphmodels.NewMessage()
	message.SetSubject(&subject) // set from args
	body := graphmodels.NewItemBody()
	contentType := graphmodels.HTML_BODYTYPE
	body.SetContentType(&contentType)

	body.SetContent(&content) // set the content from the args
	message.SetBody(body)

	recipients := []graphmodels.Recipientable{}
	for _, email := range emails {
		recipient := graphmodels.NewRecipient()
		emailAddress := graphmodels.NewEmailAddress()
		emailAddress.SetAddress(&email)
		recipient.SetEmailAddress(emailAddress)
		recipients = append(recipients, recipient)
	}
	message.SetToRecipients(recipients)

	// toRecipients := []graphmodels.Recipientable{
	// 	recipient,
	// }
	// message.SetToRecipients(toRecipients)

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

func (c *Controller) SendCustomInviteNotification(ctx context.Context, email string, sponsor types.Sponsor) error {
	// use graph to send email saying so-and-so has invited you to the portal

	content := ""
	if sponsor.ChosenName != "" {
		content = "You have been invited to join the UCL ARC Services Portal by " + string(sponsor.ChosenName)
	} else {
		content = "You have been invited to join the UCL ARC Services Portal by " + string(sponsor.Username)
	}

	return c.createCustomEmail(ctx, "Notification: You have been invited to the UCL ARC Services Portal", []string{email}, content)
}

func (c *Controller) SendCustomStudyReviewNotification(ctx context.Context, email string, review openapi.StudyReview) error {
	// email to notify IAO + IAA when study has been reviewed

	content := ""
	subject := ""
	if review.Status == openapi.Approved {
		subject = "Notification: Your study has been approved!"
		content = "Your study has been approved! You will be notified when you have any contracts or assets approaching expiry."
	} else {
		content = "Your study has not been approved, please review the feedback and request another review once the changes have been addressed. <br><br>Feedback: " + *review.Feedback
		subject = "Notification: Your study has feedback to address"
	}

	return c.createCustomEmail(ctx, subject, []string{email}, content)
}
