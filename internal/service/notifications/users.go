package notifications

import (
	"fmt"

	"github.com/rs/zerolog/log"
	"github.com/ucl-arc-tre/portal/internal/types"
)

func (s *Service) NotifyUserNameChangeRequest(attrs types.UserAttributes, recipients []types.User) error {
	if attrs.User.CreatedAt.IsZero() {
		return types.NewErrInvalidObject("user was nil valued - cannot notify")
	}

	log.Debug().Any("username", attrs.User.Username).Msg("Notifying user name change request")
	notification := types.Notification{
		// attrs.ChosenName is the old name??
		// what if new name is null? is that possible?
		// do these strings need escaping? I suppose they've already been sanitised quite heavily...
		Title: fmt.Sprintf("'%s' requested a name change to '%s'", attrs.ChosenName, *attrs.RequestedChosenName),
		Href:  new(fmt.Sprintf("/people/manage?userId=%s", attrs.User.ID.String())),
		Kind:  new(types.NotificationKindUserNameChangeRequest),
	}
	return s.createForAll(notification, recipients)
}

func (s *Service) NotifyUserNameChangeOccurred(subject types.User, chosenName types.ChosenName) error {
	// is this check good for anything?
	if subject.CreatedAt.IsZero() {
		return types.NewErrInvalidObject("user was nil valued - cannot notify")
	}

	log.Debug().Any("username", subject.Username).Msg("Notifying user name change")
	notification := types.Notification{
		Title: fmt.Sprintf("Your name has been changed to '%s'", chosenName),
		Href:  new("/profile"),
		Kind:  new(types.NotificationKindUserNameChangeOccurred),
	}
	return s.create(notification, subject)
}
