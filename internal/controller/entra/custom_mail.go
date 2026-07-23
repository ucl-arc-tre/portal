package entra

import (
	"bytes"
	"context"
	_ "embed"
	"html/template"

	graphmodels "github.com/microsoftgraph/msgraph-sdk-go/models"
	graphusers "github.com/microsoftgraph/msgraph-sdk-go/users"
	"github.com/rs/zerolog/log"
	"github.com/ucl-arc-tre/portal/internal/config"
	"github.com/ucl-arc-tre/portal/internal/types"
)

//go:embed base_mail_template.html
var baseMailTemplateContent string

var (
	baseMailTemplate = template.Must(template.New("baseMailTemplate").Parse(baseMailTemplateContent))
)

func newTemplatedEmailContent(params EmailTemplateParams) (*string, error) {
	templateReader := new(bytes.Buffer)
	err := baseMailTemplate.Execute(templateReader, params)
	if err != nil {
		return nil, err
	}
	content := templateReader.String()
	return &content, nil
}

func (c *Controller) SendEmail(ctx context.Context, subject string, emails []Email, content string) error {

	if len(emails) == 0 {
		return types.NewErrInvalidObjectF("cannot send email to no recipients")
	}

	if !config.EntraMailEnabled() {
		log.Warn().Msg("Entra mail is not enabled – not sending email")
		return nil
	}

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

	message.SetAttachments([]graphmodels.Attachmentable{banner})
	message.SetBody(body)

	// set up the recipients
	recipients := []graphmodels.Recipientable{}
	for _, email := range unique(emails) {
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

func (c *Controller) SendCustomInviteNotification(ctx context.Context, invite Invite) error {
	// use graph to send email saying so-and-so has invited you to the portal
	subject := "Notification: You have been invited to the UCL ARC Services Portal"
	return c.SendEmail(ctx, subject, []string{invite.Recipient}, inviteEmailContent(invite))
}
