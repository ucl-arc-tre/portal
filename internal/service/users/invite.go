package users

import (
	"context"
	"strings"
	"time"

	"github.com/google/uuid"
	"github.com/rs/zerolog/log"
	"github.com/ucl-arc-tre/portal/internal/types"
)

func (s *Service) InviteUser(ctx context.Context, email string, sponsor types.Sponsor) error {

	if err := s.entra.SendInvite(ctx, email, sponsor); err != nil {
		return err
	}

	if err := s.entra.AddtoInvitedUserGroup(ctx, email); err != nil {
		if strings.Contains(err.Error(), "One or more added object references already exist for the following modified properties") {
			log.Warn().Msg("User is already in group")
			return nil
		}

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
