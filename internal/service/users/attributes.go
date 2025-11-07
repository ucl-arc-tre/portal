package users

import (
	"fmt"
	"regexp"
	"time"

	"github.com/rs/zerolog/log"
	"github.com/ucl-arc-tre/portal/internal/types"
)

var (
	chosenNamePattern = regexp.MustCompile(`^[A-Za-z\s\-'’\p{L}\p{M}]*$`)
)

func (s *Service) Attributes(user types.User) (types.UserAttributes, error) {
	attrs := types.UserAttributes{}
	result := s.db.Find(&attrs, "user_id = ?", user.ID)
	return attrs, types.NewErrFromGorm(result.Error)
}

func (s *Service) SetUserChosenName(user types.User, chosenName types.ChosenName) error {
	if isValid := chosenNamePattern.MatchString(string(chosenName)); !isValid {
		return types.NewErrInvalidObject(fmt.Errorf("invalid chosen name [%v]", chosenName))
	}
	attrs := types.UserAttributes{UserID: user.ID}

	result := s.db.Where(&attrs).Assign(types.UserAttributes{
		Model:      types.Model{CreatedAt: time.Now()},
		ChosenName: chosenName,
	}).FirstOrCreate(&attrs)

	if chosenName == "" { // assign does not clear the value
		log.Debug().Any("user", user.Username).Msg("Clearing the chosen name user attribute")
		result := s.db.Model(&attrs).Where(&attrs).Update("chosen_name", "")
		return types.NewErrFromGorm(result.Error)
	}
	return types.NewErrFromGorm(result.Error)
}

func (s *Service) userChosenName(user types.User) (types.ChosenName, error) {
	attrs := types.UserAttributes{}
	result := s.db.Select("chosen_name").Limit(1).Where("user_id = ?", user.ID).Find(&attrs)
	return attrs.ChosenName, types.NewErrFromGorm(result.Error)
}
