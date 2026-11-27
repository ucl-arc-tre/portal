package notifications

import (
	"context"
	"fmt"
	"html/template"

	"github.com/rs/zerolog/log"
	"github.com/ucl-arc-tre/portal/internal/types"
)

func (s *Service) NotifyUserNameChangeRequest(attrs types.UserAttributes, recipients []types.User) error {
	if attrs.User.CreatedAt.IsZero() {
		return types.NewErrInvalidObject("user was nil valued - cannot notify")
	}

	log.Debug().Any("username", attrs.User.Username).Msg("Notifying user name change request")
	if attrs.RequestedChosenName == nil {
		return types.NewErrInvalidObject("nil requested name when requesting name change")
	}
	notification := types.Notification{
		Title: fmt.Sprintf("'%s' requested a name change to '%s'", attrs.ChosenName, *attrs.RequestedChosenName),
		Href:  new(fmt.Sprintf("/people/manage?userId=%s", attrs.User.ID.String())),
		Kind:  new(types.NotificationKindUserNameChangeRequest),
	}
	return s.createForAll(notification, recipients)
}

func (s *Service) NotifyUserNameChangeOccurred(ctx context.Context, subject types.User, chosenName types.ChosenName) error {
	log.Debug().Any("username", subject.Username).Msg("Notifying user name change within webapp")
	notification := types.Notification{
		Title: fmt.Sprintf("Your name has been changed to '%s'", chosenName),
		Href:  new("/profile"),
		Kind:  new(types.NotificationKindUserNameChangeOccurred),
	}
	if err := s.create(notification, subject); err != nil {
		return err
	}

	log.Debug().Any("username", subject.Username).Msg("Notifying user name change by email")
	// and send by email
	content := template.HTML(fmt.Sprintf("Your name has been changed to '%s'", template.HTMLEscapeString(string(chosenName)))) // #nosec G203 -- untrusted is escaped
	subjectLine := "Notification: Your name has been changed"

	return s.entra.SendEmail(ctx, subjectLine, emails(subject), content)
}
