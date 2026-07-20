package users

import (
	"fmt"
	"regexp"

	openapi "github.com/ucl-arc-tre/portal/internal/openapi/web"
	"github.com/ucl-arc-tre/portal/internal/service/users/strutil"
	"github.com/ucl-arc-tre/portal/internal/types"
)

var (
	chosenNamePattern = regexp.MustCompile(`^[\p{L}\p{M}}\s\-'’]+[\s][\p{L}\p{M}}\s\-\.'’]+$`)
)

func (s *Service) Attributes(user types.User) (types.UserAttributes, error) {
	attrs := types.UserAttributes{}
	result := s.db.Find(&attrs, "user_id = ?", user.ID)
	return attrs, types.NewErrFromGorm(result.Error)
}

func (s *Service) SetUserChosenName(user types.User, chosenName types.ChosenName) (*openapi.ProfileUpdateResponse, error) {
	if isValid := chosenNamePattern.MatchString(string(chosenName)) || chosenName == ""; !isValid {
		return nil, types.NewErrInvalidObject(fmt.Errorf("invalid chosen name [%v]", chosenName))
	}
	attrs := types.UserAttributes{UserID: user.ID}

	findResult := s.db.Where(&attrs).Limit(1).Find(&attrs)
	if err := findResult.Error; err != nil {
		return nil, types.NewErrFromGorm(err, "failed to find user attributes")
	}

	response := openapi.ProfileUpdateResponse{}
	var err error
	if nameChangeRequiresApproval(attrs.ChosenName, chosenName) {
		response.RequiresApproval = true
		attrs.RequestedChosenName = &chosenName
		err = s.db.Model(&attrs).Where("id = ?", attrs.ID).Updates(&attrs).Error
	} else {
		response.RequiresApproval = false
		attrs.ChosenName = chosenName
		err = s.db.Where(&attrs).Assign(types.UserAttributes{ChosenName: chosenName}).FirstOrCreate(&attrs).Error
	}
	return &response, types.NewErrFromGorm(err)
}

func (s *Service) userChosenName(user types.User) (types.ChosenName, error) {
	attrs := types.UserAttributes{}
	result := s.db.Select("chosen_name").Limit(1).Where("user_id = ?", user.ID).Find(&attrs)
	return attrs.ChosenName, types.NewErrFromGorm(result.Error)
}

func nameChangeRequiresApproval(old types.ChosenName, new types.ChosenName) bool {
	if old == "" || new == "old" {
		return false
	}
	return strutil.LevenshteinSimilarity(string(old), string(new)) > 0.5
}
