package users

import (
	"fmt"
	"regexp"

	"github.com/rs/zerolog/log"
	openapi "github.com/ucl-arc-tre/portal/internal/openapi/web"
	"github.com/ucl-arc-tre/portal/internal/rbac"
	"github.com/ucl-arc-tre/portal/internal/service/users/strutil"
	"github.com/ucl-arc-tre/portal/internal/types"
)

var (
	chosenNamePattern   = regexp.MustCompile(`^[\p{L}\p{M}}\s\-'’]+[\s][\p{L}\p{M}}\s\-\.'’]+$`)
	chosenNameMaxLength = 256
)

func (s *Service) Attributes(user types.User) (types.UserAttributes, error) {
	attrs := types.UserAttributes{}
	result := s.db.Find(&attrs, "user_id = ?", user.ID)
	return attrs, types.NewErrFromGorm(result.Error)
}

func (s *Service) ProfileUpdate(user types.User, data openapi.ProfileUpdate) (*openapi.ProfileUpdateResponse, error) {
	if len(data.ChosenName) > chosenNameMaxLength {
		return nil, types.NewErrClientInvalidObjectF("chosen name was too long")
	}
	if isValid := chosenNamePattern.MatchString(data.ChosenName) || data.ChosenName == ""; !isValid {
		return nil, types.NewErrInvalidObject(fmt.Errorf("invalid chosen name [%v]", data.ChosenName))
	}
	attrs := types.UserAttributes{UserID: user.ID, User: user}
	if err := s.db.Where(&attrs).Limit(1).Find(&attrs).Error; err != nil {
		return nil, types.NewErrFromGorm(err, "failed to find user attributes")
	}
	requestedChosenName := types.ChosenName(data.ChosenName)

	response := openapi.ProfileUpdateResponse{}
	var err error
	if nameChangeRequiresApproval(attrs.ChosenName, requestedChosenName) {
		response.RequiresApproval = true
		attrs.RequestedChosenName = &requestedChosenName
		err = s.db.Model(&attrs).Where("id = ?", attrs.ID).Updates(&attrs).Error
	} else {
		response.RequiresApproval = false
		attrs.ChosenName = requestedChosenName
		err = s.db.Model(&attrs).Where("user_id = ?", user.ID).Assign(types.UserAttributes{
			ChosenName:          requestedChosenName,
			RequestedChosenName: &requestedChosenName,
		}).FirstOrCreate(&attrs).Error
	}
	if err != nil {
		return &response, types.NewErrFromGorm(err)
	}

	if response.RequiresApproval {
		if err := s.notifyUserNameChange(attrs); err != nil {
			log.Err(err).Msg("Failed to notify user name change") // not fatal
		}
	}
	return &response, nil
}

func (s *Service) SetUserChosenName(user types.User, chosenName types.ChosenName) error {
	if isValid := chosenNamePattern.MatchString(string(chosenName)) || chosenName == ""; !isValid {
		return types.NewErrInvalidObject(fmt.Errorf("invalid chosen name [%v]", chosenName))
	}
	attrs := types.UserAttributes{UserID: user.ID}
	err := s.db.Where(&attrs).Assign(types.UserAttributes{ChosenName: chosenName}).FirstOrCreate(&attrs).Error
	return types.NewErrFromGorm(err, "failed to set chosen name")
}

func (s *Service) notifyUserNameChange(attrs types.UserAttributes) error {
	recipients, err := s.UsersWithConfigRole(rbac.IGOpsStaff)
	if err != nil {
		return err
	}
	return s.notifications.NotifyUserNameChange(attrs, recipients)
}

func (s *Service) userChosenName(user types.User) (types.ChosenName, error) {
	attrs := types.UserAttributes{}
	result := s.db.Select("chosen_name").Limit(1).Where("user_id = ?", user.ID).Find(&attrs)
	return attrs.ChosenName, types.NewErrFromGorm(result.Error)
}

func nameChangeRequiresApproval(old types.ChosenName, new types.ChosenName) bool {
	if old == "" || new == old {
		return false
	}
	return strutil.LevenshteinSimilarity(string(old), string(new)) < 0.5
}
