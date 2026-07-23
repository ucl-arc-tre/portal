package notifications

import (
	"context"
	"fmt"
	"html/template"
	"time"

	"github.com/rs/zerolog/log"
	"github.com/ucl-arc-tre/portal/internal/config"
	"github.com/ucl-arc-tre/portal/internal/types"
)

func (s *Service) NotifyToCompleteProfile(user types.User) error {
	notification := types.Notification{
		Title: "Complete your profile",
		Kind:  new(types.NotificationKindCompleteProfile),
		Href:  new("/profile"),
	}
	return s.create(notification, user)
}

func (s *Service) NotifyTrainingExpiry(ctx context.Context, training types.UserTrainingRecord) error {
	log.Debug().Any("username", training.User.Username).Msg("Notifying training expiry")

	days := config.DaysUntilTrainingExpiry(training)
	content := template.HTML("You have a training certificate that expires ")
	if days < 0 {
		content = "You have a training certificate that has expired. "
	} else if days == 0 {
		content += "today. "
	} else if days == 1 {
		content += "tomorrow. "
	} else {
		content += template.HTML("in " + fmt.Sprintf("%d", days) + " days. ")
	}
	content += "Please " + htmlHref("sign in", "/profile") + " to the Portal to upload a new certificate."

	content += "\nPlease note that without valid training, your access to any environments may be revoked."
	subject := "Notification: Your training certificate is due to expire soon"
	if err := s.entra.SendEmail(ctx, subject, emails(training.User), content); err != nil {
		return err
	}
	notification := types.Notification{
		Title:     "Your training is expiring soon",
		Body:      new("Please update your training soon"),
		Href:      new("/profile"),
		Kind:      new(types.NotificationKindTrainingExpiry),
		ExpiresAt: new(time.Now().Add(config.TrainingValidity / 2)),
	}
	return s.create(notification, training.User)
}
