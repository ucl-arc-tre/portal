package users

import (
	"context"
)

func (s *Service) InviteUser(ctx context.Context, email string) error {
	return s.entra.SendInvite(ctx, email)
}
