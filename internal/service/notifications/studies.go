package notifications

import (
	"context"
	"fmt"
	"time"

	"github.com/rs/zerolog/log"
	"github.com/ucl-arc-tre/portal/internal/config"
	"github.com/ucl-arc-tre/portal/internal/types"
)

func (s *Service) NotifyStudyReview(ctx context.Context, study types.Study, igOpsStaff []types.User) error {
	switch study.ApprovalStatus {
	case types.StudyApprovalStatusApproved:
		content := "Your study has been approved! You will be notified when you have any contracts or assets approaching expiry."
		subject := "Notification: Your study has been approved!"
		recipients := study.NotificationRecipients()
		if err := s.entra.SendEmail(ctx, subject, emails(recipients...), content); err != nil {
			log.Err(err).Msg("Failed to sent notify study review notification")
		}
		notification := types.Notification{
			Title: fmt.Sprintf("Study '%s' has been approved", study.Title),
			Href:  new(fmt.Sprintf("/studies/manage?studyId=%s", study.ID.String())),
			Kind:  new(types.NotificationKindStudyReview),
		}
		return s.createForAll(notification, recipients)
	case types.StudyApprovalStatusRejected:
		content := "Your study has not been approved, please review the feedback and request another review once the changes have been addressed."
		subject := "Notification: Unfortunately, your study has not been approved"
		recipients := study.NotificationRecipients()
		if err := s.entra.SendEmail(ctx, subject, emails(recipients...), content); err != nil {
			log.Err(err).Msg("Failed to sent notify study review notification")
		}
		notification := types.Notification{
			Title: fmt.Sprintf("Study '%s' has been rejected", study.Title),
			Href:  new(fmt.Sprintf("/studies/manage?studyId=%s", study.ID.String())),
			Kind:  new(types.NotificationKindStudyReview),
		}
		return s.createForAll(notification, recipients)
	case types.StudyApprovalStatusPending:
		notification := types.Notification{
			Title: fmt.Sprintf("Study '%s' is pending approval", study.Title),
			Href:  new(fmt.Sprintf("/studies/manage?studyId=%s", study.ID.String())),
			Kind:  new(types.NotificationKindStudyReview),
		}
		return s.createForAll(notification, igOpsStaff)
	case types.StudyApprovalStatusIncomplete:
		return nil // no action
	}
	return nil
}

func (s *Service) NotifyOwnerChange(ctx context.Context, study types.Study, igOpsStaff []types.User) error {
	log.Debug().Any("oldOwner", study.Owner.Username).Msg("Notifying study owner change")
	notification := types.Notification{
		Title:     fmt.Sprintf("Study '%s' is awaiting an owner change approval from '%s'", study.Title, study.Owner.Username),
		Href:      new(fmt.Sprintf("/studies/manage?studyId=%s", study.ID.String())),
		Kind:      new(types.NotificationKindStudyOwnerChange),
		ExpiresAt: new(study.UpdatedAt.Add(1 * time.Hour)),
	}
	return s.createForAll(notification, igOpsStaff)
}

func (s *Service) NotifyContractExpiry(ctx context.Context, contract types.Contract, study types.Study) error {
	days := config.DaysUntilContractExpiry(contract)
	if days == nil {
		return types.NewErrInvalidObject("cannot send expiry notification with nil days before expiry")
	}
	content := "You have a contract in the Study '" + study.Title + "' that is due to expire "
	if *days < 0 {
		content = "You have a contract in the Study '" + study.Title + "' that has expired. Please sign in to the Portal to upload a new contract or update its status."
	} else if *days == 0 {
		content += "today. Please sign in to the Portal to upload a new contract or update its status."
	} else if *days == 1 {
		content += "tomorrow. Please sign in to the Portal to upload a new contract or update its status."
	} else {
		content += "in " + fmt.Sprintf("%d", *days) + " days. Please sign in to the Portal to upload a new contract or update its status."
	}
	recipients := study.NotificationRecipients()
	subject := fmt.Sprintf("Notification: Contract in '%s' is expiring", study.Title)
	if err := s.entra.SendEmail(ctx, subject, emails(recipients...), content); err != nil {
		log.Err(err).Msg("Failed to send contract expiry notification email")
	}
	notification := types.Notification{
		Title:     fmt.Sprintf("Contract in '%s' expires in %d days", study.Title, *days),
		Href:      new(fmt.Sprintf("/studies/manage?studyId=%s", study.ID.String())),
		Kind:      new(types.NotificationKindContractExpiry),
		ExpiresAt: new(contract.ExpiryDate.Add(3 * config.Month)),
	}
	return s.createForAll(notification, recipients)
}

func (s *Service) NotifyIaaAssignment(ctx context.Context, iaa types.User, study types.Study) error {
	content := "You have been added as an administrator to the Study '" + study.Title + "'. Please sign in to the Portal to view the study details and any upcoming tasks related to this role."
	subject := "Notification: Study administrator assignment"
	if err := s.entra.SendEmail(ctx, subject, emails(iaa), content); err != nil {
		log.Err(err).Msg("Failed to send contract IAA assignment notification email")
	}
	notification := types.Notification{
		Title: fmt.Sprintf("You have been added as an administrator in '%s'", study.Title),
		Href:  new(fmt.Sprintf("/studies/manage?studyId=%s", study.ID.String())),
		Kind:  new(types.NotificationKindIaaAssignment),
	}
	return s.create(notification, iaa)
}

func (s *Service) NotifyStudySignoffExpiry(ctx context.Context, study types.Study) error {
	days := config.DaysUntilStudySignoffExpiry(&study)
	content := "You are required to reaffirm details about your Study '" + study.Title + "'. Your current affirmation "
	if days < 0 {
		content += "has expired. "
	} else if days == 0 {
		content += "expires today. "
	} else if days == 1 {
		content += "expires tomorrow. "
	} else {
		content += fmt.Sprintf("expires in %d days. ", days)
	}
	content += "Please login to the ARC Services Portal to complete the affirmation."
	subject := "Notification: Study affirmation expiry"
	if err := s.entra.SendEmail(ctx, subject, emails(study.Owner), content); err != nil {
		log.Err(err).Msg("Failed to send study affirmation expiry notification email")
	}
	notification := types.Notification{
		Title: fmt.Sprintf("Your affirmation of the details in '%s' are expiring soon", study.Title),
		Href:  new(fmt.Sprintf("/studies/manage?studyId=%s", study.ID.String())),
		Kind:  new(types.NotificationKindStdyAffirmation),
	}
	if study.LastSignoff == nil {
		notification.ExpiresAt = new(study.CreatedAt.Add(3 * config.Month))
	} else {
		notification.ExpiresAt = new(study.LastSignoff.Add(3 * config.Month))
	}
	return s.create(notification, study.Owner)
}

func (s *Service) NotifyAssetExpiry(ctx context.Context, assets []types.Asset, study types.Study) error {
	if len(assets) == 0 {
		return fmt.Errorf("cannot notify asset expiry with no assets in [%s]", study.Title)
	}

	var earliestExpiringAssetAt *time.Time
	content := "There are assets in your Study '" + study.Title + "' that are close to expiring or have expired.\n"
	for _, asset := range assets {
		if asset.ExpiresAt != nil &&
			(earliestExpiringAssetAt == nil || asset.ExpiresAt.Before(*earliestExpiringAssetAt)) {
			earliestExpiringAssetAt = asset.ExpiresAt
		}
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
	if earliestExpiringAssetAt == nil {
		return types.NewErrInvalidObject("had no asset which expires to notify on")
	}

	content += "Please take action to extend the asset expiry, or delete the asset and update its status in the Portal to 'Destroyed'."

	subject := "Notification: Asset expiry"
	recipients := study.NotificationRecipients()
	if err := s.entra.SendEmail(ctx, subject, emails(recipients...), content); err != nil {
		log.Err(err).Msg("Failed to send asset expiry notification email")
	}
	notification := types.Notification{
		Title:     fmt.Sprintf("An asset in '%s' is expiring soon", study.Title),
		Href:      new(fmt.Sprintf("/studies/manage?studyId=%s", study.ID.String())),
		Kind:      new(types.NotificationKindAssetExpiry),
		ExpiresAt: new(earliestExpiringAssetAt.Add(3 * config.Month)),
	}
	return s.createForAll(notification, recipients)
}

func emails(recipients ...types.User) []string {
	recipientEmails := []string{}
	for _, recipient := range recipients {
		recipientEmails = append(recipientEmails, string(recipient.Username))
	}
	return recipientEmails
}
