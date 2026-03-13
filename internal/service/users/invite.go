package users

import (
	"context"
	"fmt"
	"time"

	"github.com/ucl-arc-tre/portal/internal/types"
)

func (s *Service) InviteUser(ctx context.Context, email string, inviter types.User) (types.User, error) {
	if !types.Username(email).IsValid() {
		return types.User{}, types.NewErrInvalidObject(fmt.Errorf("[%s] was not a valid username", email))
	}

	attributes, err := s.Attributes(inviter)
	if err != nil {
		return types.User{}, err
	}

	sponsor := types.Sponsor{
		Username:   inviter.Username,
		ChosenName: attributes.ChosenName,
	}

	// An external user may have a different username to their email when they
	// login to the portal e.g. email: "alice@example.com" and
	// username: "xyz@example.comm" and we don't yet know it
	assumedUsername := types.Username(email)
	invitedUser, err := s.PersistedExternalUser(assumedUsername, email)
	if err != nil {
		return types.User{}, err
	}

	if _, err := s.CreateUserSponsorship(invitedUser, inviter); err != nil {
		return types.User{}, err
	}

	entraUser, err := s.entra.SendInvite(ctx, email, sponsor)
	if err != nil {
		return types.User{}, err
	}

	if err := s.entra.AddtoInvitedUserGroup(ctx, *entraUser); err != nil {
		return types.User{}, err
	}

	return invitedUser, nil
}

func (s *Service) CreateUserSponsorship(user types.User, sponsor types.User) (types.UserSponsorship, error) {
	userSponsorship := types.UserSponsorship{
		UserID:    user.ID,
		SponsorID: sponsor.ID,
	}

	result := s.db.Where(&userSponsorship).Assign(types.UserSponsorship{
		Model: types.Model{CreatedAt: time.Now()},
	}).FirstOrCreate(&userSponsorship)

	return userSponsorship, types.NewErrFromGorm(result.Error, "failed to create user sponsorship")
}
