package users

import (
	"context"
	"time"

	"github.com/ucl-arc-tre/portal/internal/controller/entra"
	"github.com/ucl-arc-tre/portal/internal/types"
)

// Invite an external user to the portal. Idempotent
func (s *Service) InviteUser(ctx context.Context, invite entra.Invite) (types.User, error) {
	username := types.Username(invite.Recipient)
	if !username.IsValid() {
		return types.User{}, types.NewErrInvalidObjectF("[%s] was not a valid username", invite.Recipient)
	}
	if entra.IsExternalUsername(username) {
		return s.inviteExternalUser(ctx, invite)
	}
	return s.inviteInternalUser(ctx, invite)
}

func (s *Service) inviteInternalUser(ctx context.Context, invite entra.Invite) (types.User, error) {
	username := types.Username(invite.Recipient)
	if entra.IsExternalUsername(username) {
		return types.User{}, types.NewErrInvalidObjectF("[%s] was an external username", invite.Recipient)
	}

	invitedUser, err := s.PersistedUser(username)
	if err != nil {
		return types.User{}, err
	}
	if _, err = s.entra.SendInvite(ctx, invite); err != nil {
		return invitedUser, err
	}
	return invitedUser, nil
}

func (s *Service) inviteExternalUser(ctx context.Context, invite entra.Invite) (types.User, error) {
	username := types.Username(invite.Recipient)
	if !entra.IsExternalUsername(username) {
		return types.User{}, types.NewErrInvalidObjectF("[%s] was not an external username", invite.Recipient)
	}

	// An external user may have a different username to their email when they
	// login to the portal e.g. email: "alice@example.com" and
	// username: "xyz@example.comm" and we don't yet know it
	assumedUsername := types.Username(invite.Recipient)
	invitedUser, err := s.PersistedExternalUser(assumedUsername, invite.Recipient)
	if err != nil {
		return types.User{}, err
	}

	if _, err := s.createUserSponsorship(invitedUser, invite.Sponsor); err != nil {
		return types.User{}, err
	}

	entraUser, err := s.entra.SendInvite(ctx, invite)
	if err != nil {
		return types.User{}, err
	}

	if err := s.entra.AddtoInvitedUserGroup(ctx, *entraUser); err != nil {
		return types.User{}, err
	}

	return invitedUser, nil
}

func (s *Service) createUserSponsorship(user types.User, sponsor types.Sponsor) (types.UserSponsorship, error) {
	userSponsorship := types.UserSponsorship{
		UserID:    user.ID,
		SponsorID: sponsor.ID,
	}

	result := s.db.Where(&userSponsorship).Assign(types.UserSponsorship{
		Model: types.Model{CreatedAt: time.Now()},
	}).FirstOrCreate(&userSponsorship)

	return userSponsorship, types.NewErrFromGorm(result.Error, "failed to create user sponsorship")
}
