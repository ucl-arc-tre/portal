package profile

import (
	"github.com/rs/zerolog/log"
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
	if hasTraining, err := s.hasValidNHSDTrainingRecord(user); err != nil {
		return err
	} else if !hasTraining {
		log.Debug().Any("username", user.Username).Msg("Not yet completed NHSD training")
		return nil
	}
	_, err := rbac.AddRole(user, rbac.ApprovedResearcher)
	if err != nil {
		return err
	}
	log.Info().Any("username", user.Username).Msg("Assigned approved researcher")
	return nil
}
