package users

import (
	"context"
	"time"

	"github.com/google/uuid"
	"github.com/ucl-arc-tre/portal/internal/types"
)

func (s *Service) InviteUser(ctx context.Context, email string, sponsor types.Sponsor) error {

	user, err := s.entra.SendInvite(ctx, email, sponsor)
	if err != nil {
		return err
	}

	if err := s.entra.AddtoInvitedUserGroup(ctx, *user); err != nil {
		return err
	}

	return nil
}

func (s *Service) CreateUserSponsorship(userId uuid.UUID, sponsorId uuid.UUID) (types.UserSponsorship, error) {
	userSponsorship := types.UserSponsorship{
		UserID:    userId,
		SponsorID: sponsorId,
	}

	result := s.db.Where(&userSponsorship).Assign(types.UserSponsorship{
		Model: types.Model{CreatedAt: time.Now()},
	}).FirstOrCreate(&userSponsorship)

	return userSponsorship, types.NewErrFromGorm(result.Error, "failed to create user sponsorship")
}
