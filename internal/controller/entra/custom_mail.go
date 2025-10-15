package entra

import (
	"bytes"
	"context"
	"html/template"

	"os"

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

	t, err := template.ParseFiles("internal/controller/entra/base_mail_template.html")
	if err != nil {
		return err
	}

	templateReader := new(bytes.Buffer)
	err = t.Execute(templateReader, struct {
		Content string
	}{
		Content: content, // set the content from the args
	})
	if err != nil {
		return err
	}
	htmlContent := templateReader.String()

	body.SetContent(&htmlContent)

	// has attachments to allow banner to work
	hasAttachments := true
	message.SetHasAttachments(&hasAttachments)
	banner := graphmodels.NewFileAttachment()
	oDataType := "#microsoft.graph.fileAttachment"
	banner.SetOdataType(&oDataType)
	svgType := "image/svg+xml"
	banner.SetContentType(&svgType)
	svgName := "ucl-banner.svg"
	banner.SetName(&svgName)
	svgId := "uclBanner"
	banner.SetContentId(&svgId)
	banner.SetIsInline(&hasAttachments)

	// read the file into bytes
	svgFile, err := os.ReadFile("internal/controller/entra/ucl-banner.svg")
	if err != nil {
		return err
	}
	banner.SetContentBytes(svgFile)

	message.SetAttachments([]graphmodels.Attachmentable{banner})
	message.SetBody(body)

	// set up the recipients
	recipients := []graphmodels.Recipientable{}
	for _, email := range emails {
		recipient := graphmodels.NewRecipient()
		emailAddress := graphmodels.NewEmailAddress()
		emailAddress.SetAddress(&email)
		recipient.SetEmailAddress(emailAddress)
		recipients = append(recipients, recipient)
	}
	message.SetToRecipients(recipients)

	requestBody.SetMessage(message)
	saveToSentItems := true
	requestBody.SetSaveToSentItems(&saveToSentItems)

	userID := config.EntraMailUserPrincipal()

	// use the mail client to send via the mailbox
	err = c.mailClient.Users().ByUserId(userID).SendMail().Post(ctx, requestBody, nil)
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
	// todo: set up usage of this

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
