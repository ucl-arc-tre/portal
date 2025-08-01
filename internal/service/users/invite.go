package users

import (
	"context"

	"github.com/ucl-arc-tre/portal/internal/types"
)

func (s *Service) InviteUser(ctx context.Context, email string, sponsor types.Sponsor) error {
	return s.entra.SendInvite(ctx, email, sponsor)
}
