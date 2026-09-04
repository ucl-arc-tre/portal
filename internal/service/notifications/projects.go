package notifications

import (
	"context"
	"fmt"
	"html/template"

	"github.com/rs/zerolog/log"
	"github.com/ucl-arc-tre/portal/internal/config"
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

func (s *Service) NotifyProjectAccessReviewExpiry(ctx context.Context, project types.Project) error {
	days := config.DaysUntilProjectAccessReviewExpiry(&project)

	path := fmt.Sprintf("/projects/manage?projectId=%s&environment=%s", project.ID.String(), project.Environment.Name)
	href := htmlHref(fmt.Sprintf("'%s'", project.Name), path)
	content := "A review of people access and role assignments is due for Project " + href + ". Your current review "
	if days < 0 {
		content += "has expired. "
	} else if days == 0 {
		content += "expires today. "
	} else if days == 1 {
		content += "expires tomorrow. "
	} else {
		content += template.HTML(fmt.Sprintf("expires in %d days. ", days)) // #nosec G203 -- only int
	}
	content += "Please log in to the ARC Services Portal to review and confirm user access and roles."
	subject := "Notification: Project access review expiry"

	recipients := project.Study.NotificationRecipients()
	if err := s.entra.SendEmail(ctx, subject, emails(recipients...), content); err != nil {
		log.Err(err).Msg("Failed to send project access review expiry notification email")
	}

	notification := types.Notification{
		Title: fmt.Sprintf("Access review for '%s' is due", project.Name),
		Href:  new(path),
		Kind:  new(types.NotificationKindProjectAccessReview),
	}
	if project.LastAccessReview == nil {
		notification.ExpiresAt = new(project.CreatedAt.Add(config.ProjectAccessReviewValidity))
	} else {
		notification.ExpiresAt = new(project.LastAccessReview.Add(config.ProjectAccessReviewValidity))
	}
	return s.createForAll(notification, recipients)
}
