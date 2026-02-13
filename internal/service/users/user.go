package users

import (
	"context"
	"fmt"
	"time"

	"github.com/google/uuid"
	"github.com/rs/zerolog/log"
	openapi "github.com/ucl-arc-tre/portal/internal/openapi/web"
	"github.com/ucl-arc-tre/portal/internal/rbac"
	"github.com/ucl-arc-tre/portal/internal/types"
)

func (s *Service) usersData(users []types.User) ([]openapi.UserData, error) {
	usersData := []openapi.UserData{}
	// loops through all users given and get training, roles and agreements for each

	for _, user := range users {
		userData := openapi.UserData{
			User: openapi.User{
				Id:       user.ID.String(),
				Username: string(user.Username),
			},
		}

		attributes, err := s.Attributes(user)
		if err != nil {
			return usersData, fmt.Errorf("failed to get attributes for user: %w", err)
		}
		chosenNameStr := string(attributes.ChosenName)
		userData.ChosenName = &chosenNameStr

		agreements, err := s.ConfirmedAgreements(user)
		if err != nil {
			return usersData, fmt.Errorf("failed to get agreements for user: %w", err)
		}
		userData.Agreements.ConfirmedAgreements = agreements

		roles, err := rbac.Roles(user)
		if err != nil {
			return usersData, fmt.Errorf("failed to get roles for user: %w", err)
		}
		for _, role := range roles {
			userData.Roles = append(userData.Roles, string(role))
		}

		trainingRecords, err := s.TrainingRecords(user)
		if err != nil {
			return usersData, fmt.Errorf("failed to get training for user: %w", err)
		}
		userData.TrainingRecord.TrainingRecords = trainingRecords

		usersData = append(usersData, userData)
	}
	return usersData, nil
}

// Get or create a user for a unique username. Returns the user, whether
// they were created or not and an error
func (s *Service) PersistedUser(username types.Username) (types.User, error) {
	if username == "" {
		return types.User{}, types.NewErrInvalidObject("username unset")
	}

	user := types.User{}
	result := s.db.Where("username = ?", username).
		Attrs(types.User{
			Username: username,
			Model:    types.Model{CreatedAt: time.Now()},
		}).
		FirstOrCreate(&user)
	if result.Error != nil {
		return user, types.NewErrFromGorm(result.Error, "failed to get or create user")
	}
	return user, nil
}

// Get or create an external user that is guested into the IdP (e.g. Entra). They may
// have already been created with a username equal to their email,
// which might not be correct
func (s *Service) PersistedExternalUser(username types.Username, email Email) (types.User, error) {
	if username == "" || email == "" {
		return types.User{}, types.NewErrInvalidObject("username or email unset")
	}

	tx := s.db.Begin()
	user := types.User{}

	findResult := tx.Joins("JOIN user_attributes ON user_attributes.user_id = users.id").
		Where("user_attributes.email = ?", email).
		Find(&user)
	if err := findResult.Error; err != nil {
		tx.Rollback()
		return types.User{}, types.NewErrFromGorm(err, "failed to find existing user")
	}
	userExists := findResult.RowsAffected > 0

	if userExists && string(user.Username) != string(username) {
		log.Info().
			Str("email", email).
			Any("currentUsername", user.Username).
			Any("IdPUsername", username).
			Msg("External user already existed with username == email but their IdP username is different")
		user.Username = username
		if err := tx.Where("id = ?", user.ID).Save(&user).Error; err != nil {
			tx.Rollback()
			return types.User{}, types.NewErrFromGorm(err, "failed to update existing user username")
		}
	} else if userExists && string(user.Username) == string(username) {
		log.Debug().Any("username", user.Username).Msg("User already exists with correct username")
	} else if !userExists {
		createResult := tx.Where("username = ?", username).
			Attrs(types.User{Username: username}).
			FirstOrCreate(&user)
		if err := createResult.Error; err != nil {
			tx.Rollback()
			return types.User{}, types.NewErrFromGorm(err, "failed to create new user")
		}

		attrs := types.UserAttributes{UserID: user.ID}
		attrsResult := tx.Where(&attrs).Assign(types.UserAttributes{Email: email}).FirstOrCreate(&attrs)
		if err := attrsResult.Error; err != nil {
			tx.Rollback()
			return types.User{}, types.NewErrFromGorm(err, "failed to set email for existing user")
		}
		log.Info().Str("email", email).Any("username", username).Msg("External user created")
	}

	err := tx.Commit().Error
	return user, types.NewErrFromGorm(err, "failed to persist external user transaction")
}

func (s *Service) IsStaff(ctx context.Context, user types.User) (bool, error) {
	return s.entra.IsStaffMember(ctx, user.Username)
}

func (s *Service) UserById(id uuid.UUID) (*types.User, error) {
	return s.findUser(&types.User{Model: types.Model{ID: id}})
}

func (s *Service) UserByUsername(username types.Username) (*types.User, error) {
	return s.findUser(&types.User{Username: username})
}

func (s *Service) UserIds(usernames ...types.Username) (map[types.Username]uuid.UUID, error) {
	users := []types.User{}
	result := s.db.Where("username in ?", usernames).Find(&users)
	if result.Error != nil {
		return map[types.Username]uuid.UUID{}, types.NewErrFromGorm(result.Error)
	}
	userIds := map[types.Username]uuid.UUID{}
	for _, user := range users {
		userIds[user.Username] = user.ID
	}
	return userIds, nil
}

func (s *Service) findUser(user *types.User) (*types.User, error) {
	result := s.db.Where(user).First(user)
	return user, types.NewErrFromGorm(result.Error)
}

func (s *Service) SearchEntraForUsersAndMatch(ctx context.Context, query string) ([]openapi.UserData, error) {
	// query entra
	usernames, err := s.entra.FindUsernames(ctx, query)
	if err != nil {
		return nil, err
	}
	// then match to users in our db
	users := []types.User{}

	result := s.db.Where("username IN (?)", usernames).Find(&users)
	if result.Error != nil {
		return nil, types.NewErrFromGorm(result.Error)
	}

	return s.usersData(users)
}
