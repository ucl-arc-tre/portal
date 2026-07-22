package notifications

import (
	"fmt"

	"github.com/rs/zerolog/log"
	"github.com/ucl-arc-tre/portal/internal/types"
)

func (s *Service) NotifyProjectDeployed(project types.Project, user types.User) error {
	log.Debug().Any("username", user.Username).Msg("Notifying project deployed")
	notification := types.Notification{
		Title: fmt.Sprintf("'%s' has been deployed", project.Name),
		Kind:  new(types.NotificationKindProjectDeployed),
	}
	return s.create(notification, user)
}
