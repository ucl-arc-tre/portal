package entra

import (
	"bytes"
	"context"
	_ "embed"
	"fmt"
	"html/template"

	graphmodels "github.com/microsoftgraph/msgraph-sdk-go/models"
	graphusers "github.com/microsoftgraph/msgraph-sdk-go/users"
	"github.com/ucl-arc-tre/portal/internal/config"
	openapi "github.com/ucl-arc-tre/portal/internal/openapi/web"
	"github.com/ucl-arc-tre/portal/internal/types"
)

//go:embed ucl-banner.svg
var uclBannerSVGContent string

//go:embed base_mail_template.html
var baseMailTemplateContent string

var (
	baseMailTemplate = template.Must(template.New("baseMailTemplate").Parse(baseMailTemplateContent))
)

func (c *Controller) createCustomEmail(ctx context.Context, subject string, emails []string, content string) error {

	requestBody := graphusers.NewItemSendMailPostRequestBody()
	message := graphmodels.NewMessage()
	message.SetSubject(&subject) // set from args
	body := graphmodels.NewItemBody()
	contentType := graphmodels.HTML_BODYTYPE
	body.SetContentType(&contentType)

	emailContent, err := newTemplatedEmailContent(EmailTemplateParams{
		Content:   content, // set the content from the args
		PortalUrl: config.PortalUrl(),
	})
	if err != nil {
		return err
	}
	body.SetContent(emailContent)

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

	banner.SetContentBytes([]byte(uclBannerSVGContent))

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

func (c *Controller) SendCustomStudyReviewNotification(ctx context.Context, emails []string, review openapi.StudyReview) error {
	// email to notify IAO + IAA when study has been reviewed

	content := "There has been an update to your study request, please log into the portal to view the changes."
	subject := "Notification: Something has changed in your study request"

	switch review.Status {
	case openapi.Approved:
		subject = "Notification: Your study has been approved!"
		content = "Your study has been approved! You will be notified when you have any contracts or assets approaching expiry."
	case openapi.Rejected:
		content = "Your study has not been approved, please review the feedback and request another review once the changes have been addressed."
		subject = "Notification: Unfortunately, your study has not been approved"
		if review.Feedback != nil {
			content += " <br><br>Feedback: " + *review.Feedback
			subject = "Notification: Your study has feedback to address"
		}
	}

	return c.createCustomEmail(ctx, subject, emails, content)
}

func newTemplatedEmailContent(params EmailTemplateParams) (*string, error) {
	templateReader := new(bytes.Buffer)
	err := baseMailTemplate.Execute(templateReader, params)
	if err != nil {
		return nil, err
	}
	content := templateReader.String()
	return &content, nil
}

func (c *Controller) SendContractExpiryNotification(ctx context.Context, emails []string, contract types.Contract, study types.Study) error {
	days := contract.DaysUntilExpiry()
	content := "You have a contract in the Study" + study.Title + " that is due to expire within"
	if days != 1 && days > 0 {
		content += fmt.Sprintf("%d", days) + " days. Please sign in to the Portal to upload a new contract. "
	} else if days == 1 {
		content += " the next 24 hours. Please sign in to the Portal to upload a new contract."
	} else {
		content = "You have a contract in the Study" + study.Title + " that has expired. Please sign in to the Portal to upload a new contract."
	}

	notificationMsg := "Notification: Your contract in" + study.Title + " is due to expire soon"
	return c.createCustomEmail(ctx, notificationMsg, emails, content)
}

func (c *Controller) SendTrainingExpiryNotification(ctx context.Context, emails []string, training types.UserTrainingRecord) error {
	days := training.DaysUntilExpiry()
	content := "You have a training certificate that is due to expire within"
	if days != 1 && days > 0 {
		if days == 21 || days == 14 || days == 7 {
			content += fmt.Sprintf("%d", days) + " days. Please sign in to the Portal to upload a new certificate. "
		}
	} else if days == 1 {
		content += " the next 24 hours. Please sign in to the Portal to upload a new certificate."
	} else if days < 0 {
		content = "You have a training certificate that has expired. Please sign in to the Portal to upload a new certificate."
	} else {
		// don't send a notification outside of those specific timeframes
		return nil
	}

	notificationMsg := "Notification: Your training certificate is due to expire soon"
	return c.createCustomEmail(ctx, notificationMsg, emails, content)
}
