package entra

import (
	"context"

	"github.com/ucl-arc-tre/portal/internal/types"
)

func (c *Controller) CustomInviteNotification(ctx context.Context, email string, sponsor types.Sponsor) error {
	// use graph to send email saying so-and-so has invited you to the portal

	return nil
}
