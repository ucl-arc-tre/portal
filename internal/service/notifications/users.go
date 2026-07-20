package notifications

import (
	"fmt"

	"github.com/rs/zerolog/log"
	"github.com/ucl-arc-tre/portal/internal/types"
)

func (s *Service) NotifyUserNameChange(attrs types.UserAttributes, igOpsStaff []types.User) error {
	if attrs.User.CreatedAt.IsZero() {
		return types.NewErrInvalidObject("user was nil valued - cannot notify")
	}

	log.Debug().Any("username", attrs.User.Username).Msg("Notifying user name change")
	notification := types.Notification{
		Title: fmt.Sprintf("'%s' requested a name change", attrs.ChosenName),
		Href:  new(fmt.Sprintf("/people/manage?userId=%s", attrs.User.ID.String())),
		Kind:  new(types.NotificationKindStudyOwnerChange),
	}
	return s.createForAll(notification, igOpsStaff)
}
