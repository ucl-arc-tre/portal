package entra

import (
	"bytes"
	"context"
	_ "embed"
	"fmt"
	"html/template"

	graphmodels "github.com/microsoftgraph/msgraph-sdk-go/models"
	graphusers "github.com/microsoftgraph/msgraph-sdk-go/users"
	"github.com/rs/zerolog/log"
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

func newTemplatedEmailContent(params EmailTemplateParams) (*string, error) {
	templateReader := new(bytes.Buffer)
	err := baseMailTemplate.Execute(templateReader, params)
	if err != nil {
		return nil, err
	}
	content := templateReader.String()
	return &content, nil
}

func (c *Controller) sendCustomEmail(ctx context.Context, subject string, emails []string, content string) error {

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

	banner.SetContentBytes([]byte(uclBannerSVGContent))

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

func (c *Controller) SendCustomInviteNotification(ctx context.Context, email string, sponsor types.Sponsor) error {
	// use graph to send email saying so-and-so has invited you to the portal

	content := ""
	if sponsor.ChosenName != "" {
		content = "You have been invited to join the UCL ARC Services Portal by " + string(sponsor.ChosenName) + ". The first thing you need to do is complete your profile."
	} else {
		content = "You have been invited to join the UCL ARC Services Portal by " + string(sponsor.Username) + ". The first thing you need to do is complete your profile."
	}

	return c.sendCustomEmail(ctx, "Notification: You have been invited to the UCL ARC Services Portal", []string{email}, content)
}

func (c *Controller) SendCustomStudyReviewNotification(ctx context.Context, emails []string, review openapi.StudyReview) error {
	// email to notify IAO + IAA when study has been reviewed

	content := "There has been an update to your Study review. Go to the Studies page to view the update."
	subject := "Notification: Something has changed on your Study review"

	switch review.Status {
	case openapi.StudyApprovalStatusApproved:
		subject = "Notification: Your Study has been approved!"
		content = "Your Study has been approved! You will be notified when you have any contracts or assets approaching expiry."
	case openapi.StudyApprovalStatusRejected:
		content = "Your Study has not been approved, please review the feedback and request another review once the comments have been addressed."
		subject = "Notification: Unfortunately, your Study has not been approved"
		if review.Feedback != nil {
			content += " \nFeedback: " + *review.Feedback
			subject = "Notification: Your Study has feedback to address"
		}
	case openapi.StudyApprovalStatusPending:
		content = "Your Study has been reviewed by the Information Governance team. Please review the feedback, make the necessary updates, and then resubmit your Study for review."
		subject = "Notification: Your Study requires updates before approval"
		if review.Feedback != nil {
			content += "\nFeedback:" + *review.Feedback
		}
	}

	return c.sendCustomEmail(ctx, subject, emails, content)
}

func (c *Controller) SendContractExpiryNotification(ctx context.Context, contract types.Contract, study types.Study) error {
	days := config.DaysUntilContractExpiry(contract)
	if days == nil {
		return types.NewErrInvalidObject("cannot send expiry notification with nil days before expiry")
	}
	content := "You have a contract in the Study '" + study.Title + "' that is due to expire "
	if *days < 0 {
		content = "You have a contract in the Study '" + study.Title + "' that has expired. Please sign in to the Portal to update its status or to upload a new contract."
	} else if *days == 0 {
		content += "today. Please sign in to the Portal to update its status or to upload a new contract."
	} else if *days == 1 {
		content += "tomorrow. Please sign in to the Portal to update its status or to upload a new contract."
	} else {
		content += "in " + fmt.Sprintf("%d", *days) + " days. Please sign in to the Portal to update its status or to upload a new contract."
	}

	subject := "Notification: Study contract expiry"
	return c.sendCustomEmail(ctx, subject, study.NotificationRecipients(), content)
}

func (c *Controller) SendTrainingExpiryNotification(ctx context.Context, email string, training types.UserTrainingRecord) error {
	days := config.DaysUntilTrainingExpiry(training)
	content := "You have a training certificate that expires "
	if days < 0 {
		content = "You have a training certificate that has expired. Please sign in to the Portal to upload a new certificate."
	} else if days == 0 {
		content += "today. Please sign in to the Portal to upload a new certificate."
	} else if days == 1 {
		content += "tomorrow. Please sign in to the Portal to upload a new certificate."
	} else {
		content += "in " + fmt.Sprintf("%d", days) + " days. Please sign in to the Portal to upload a new certificate."
	}

	content += "\nPlease note that without valid training, your access to any environments may be revoked."

	subject := "Notification: Your training certificate is due to expire soon"
	return c.sendCustomEmail(ctx, subject, []string{email}, content)
}

func (c *Controller) SendIaaAssignmentNotification(ctx context.Context, email string, studyTitle string) error {

	content := "You have been added as an Information Asset Administrator to the Study '" + studyTitle + "'. Please sign in to the Portal to view the Study details and sign the Administrator's Agreement."

	subject := "Notification: Information Asset Administrator assignment"
	return c.sendCustomEmail(ctx, subject, []string{email}, content)
}

func (c *Controller) SendStudySignoffExpiryNotification(ctx context.Context, email string, study types.Study) error {
	days := config.DaysUntilStudySignoffExpiry(&study)

	content := "You are required to re-affirm details about your Study '" + study.Title + "'. Your current affirmation "
	if days < 0 {
		content += "has expired. "
	} else if days == 0 {
		content += "expires today. "
	} else if days == 1 {
		content += "expires tomorrow. "
	} else {
		content += fmt.Sprintf("expires in %d days. ", days)
	}
	content += "Please login to the ARC Services Portal to re-affirm your Study details."

	subject := "Notification: Study affirmation expiry"
	return c.sendCustomEmail(ctx, subject, []string{email}, content)
}

func (c *Controller) SendAssetExpiryNotification(ctx context.Context, assets []types.Asset, study types.Study) error {
	if len(assets) == 0 {
		return fmt.Errorf("Cannot notify asset expiry with no assets in [%s]", study.Title)
	}

	content := "There are assets in your Study '" + study.Title + "' that are close to expiring or have expired.\n"

	for _, asset := range assets {
		days := config.DaysUntilAssetExpiry(asset)
		if days == nil {
			log.Error().Str("study", study.Title).Msg("Attempted to send asset expiry notification with nil expiry")
			continue
		}
		content += "- '" + asset.Title + "'"
		if *days < 0 {
			content += fmt.Sprintf(" expired %d days ago.\n", -(*days))
		} else {
			content += fmt.Sprintf(" expires in %d days.\n", *days)
		}
	}

	content += "Please take action to extend the asset expiry, or delete the asset and update its status in the Portal to 'Destroyed'."

	subject := "Notification: Asset expiry"
	return c.sendCustomEmail(ctx, subject, study.NotificationRecipients(), content)
}
