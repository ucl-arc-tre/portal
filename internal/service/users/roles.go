package users

import (
	"context"
	"errors"

	"github.com/rs/zerolog/log"
	"github.com/ucl-arc-tre/portal/internal/config"
	"github.com/ucl-arc-tre/portal/internal/rbac"
	"github.com/ucl-arc-tre/portal/internal/types"
)

func (s *Service) updateApprovedResearcherStatus(user types.User) error {
	if isApprovedResearcher, err := rbac.HasRole(user, rbac.ApprovedResearcher); err != nil {
		return err
	} else if isApprovedResearcher {
		log.Debug().Any("username", user.Username).Msg("Already an approved researcher - not updating")
		return nil
	}
	if hasAgreed, err := s.hasAgreedToApprovedResarcherAgreement(user); err != nil {
		return err
	} else if !hasAgreed {
		log.Debug().Any("username", user.Username).Msg("Not yet agreed to approved resarcher agreement")
		return nil
	}
	if hasTraining, err := s.hasValidApprovedResearcherTrainingRecord(user); err != nil {
		return err
	} else if !hasTraining {
		log.Debug().Any("username", user.Username).Msg("Not yet completed NHSD training")
		return nil
	}
	if _, err := rbac.AddRole(user, rbac.ApprovedResearcher); err != nil {
		return err
	}
	if isStaff, err := s.IsStaff(context.Background(), user); errors.Is(err, types.ErrNotFound) {
		log.Warn().Err(err).Msg("failed to check staff status")
	} else if err != nil {
		return err
	} else if isStaff {
		if _, err := rbac.AddRole(user, rbac.ApprovedStaffResearcher); err != nil {
			return err
		}
	}
	log.Info().Any("username", user.Username).Msg("Assigned approved researcher")
	return nil
}

func (s *Service) UsersWithConfigRole(role rbac.ConfigRolename) ([]types.User, error) {
	if users, exists := s.roleCache.Get(role); exists {
		return users, nil
	}
	var usernames []types.Username
	switch role {
	case rbac.Admin:
		usernames = config.AdminUsernames()
	case rbac.IGOpsStaff:
		usernames = config.IGOpsStaffUsernames()
	case rbac.DSHOpsStaff:
		usernames = config.DSHOpsStaffUsernames()
	case rbac.TreOpsStaff:
		usernames = config.TreOpsStaffUsernames()
	default:
		return []types.User{}, types.NewErrInvalidObjectF("[%v] is not a config set role name", role)
	}
	users := []types.User{}
	for _, username := range usernames {
		user, err := s.PersistedUser(username)
		if err != nil {
			return users, err
		}
		users = append(users, user)
	}
	s.roleCache.Add(role, users)
	return users, nil
}
