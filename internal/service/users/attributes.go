package users

import (
	"context"
	"fmt"
	"regexp"
	"time"

	"github.com/rs/zerolog/log"
	"github.com/ucl-arc-tre/portal/internal/types"
)

var (
	chosenNamePattern = regexp.MustCompile(`^[A-Za-z\s\-\p{L}\p{M}]*$`)
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

func (s *Service) CreateChosenNameChangeRequest(ctx context.Context, user types.User, newChosenName types.ChosenName, reason *string) error {
	if isValid := chosenNamePattern.MatchString(string(newChosenName)); !isValid {
		return types.NewErrInvalidObject(fmt.Errorf("invalid chosen name [%v]", newChosenName))
	}

	// Get current chosen name
	currentAttributes, err := s.Attributes(user)
	if err != nil {
		return err
	}

	// Send email notification to ARC TRE team
	recipientEmail := "arc.tre@ucl.ac.uk"
	reasonStr := ""
	if reason != nil {
		reasonStr = *reason
	}

	if err := s.entra.SendChosenNameChangeRequestNotification(
		ctx,
		recipientEmail,
		user.Username,
		currentAttributes.ChosenName,
		newChosenName,
		reasonStr,
	); err != nil {
		log.Error().Err(err).Msg("Failed to send chosen name change request notification")
		return err
	}

	log.Info().
		Str("username", string(user.Username)).
		Str("current_chosen_name", string(currentAttributes.ChosenName)).
		Str("new_chosen_name", string(newChosenName)).
		Str("reason", reasonStr).
		Msg("Chosen name change request submitted successfully")

	// TODO: Store the request in database?

	return nil
}
