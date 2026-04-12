package users

import (
	"context"
	"fmt"
	"time"

	"github.com/google/uuid"
	"github.com/rs/zerolog/log"
	openapi "github.com/ucl-arc-tre/portal/internal/openapi/web"
	"github.com/ucl-arc-tre/portal/internal/rbac"
	"github.com/ucl-arc-tre/portal/internal/service/agreements"
	"github.com/ucl-arc-tre/portal/internal/types"
	"github.com/ucl-arc-tre/portal/internal/validation"
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
	if !username.IsValid() {
		return types.User{}, types.NewErrInvalidObject("username invalid")
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

func (s *Service) UserExistsWithEmailOrUsername(ctx context.Context, value string) (bool, error) {
	var count int64
	result := s.db.Model(&types.User{}).
		Joins("LEFT JOIN user_attributes ON user_attributes.user_id = users.id").
		Where("user_attributes.email = ? OR username = ?", value, value).
		Count(&count)
	if err := result.Error; err != nil {
		return false, types.NewErrFromGorm(err, "failed to get user")
	}
	if count == 0 {
		return false, nil
	}
	exists, err := s.entra.UserExists(ctx, types.Username(value))
	return exists, err
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

// Find a user by a search query, which may be the start of an username, email address
// or chosen name. If no results are found then falls back to querying entra and
// matching on usernames
func (s *Service) Find(ctx context.Context, query string) ([]openapi.UserData, error) {
	if !validation.UsersSearchQueryPattern.MatchString(query) {
		return []openapi.UserData{}, types.NewErrInvalidObject("invalid users query")
	}

	portalUsers := []types.User{}

	dbLikeQuery := "%" + query + "%"
	result := s.db.Model(&types.User{}).
		Joins("LEFT JOIN user_attributes ON user_attributes.user_id = users.id").
		Where("username ILIKE ? OR user_attributes.email ILIKE ? OR user_attributes.chosen_name ILIKE ?", dbLikeQuery, dbLikeQuery, dbLikeQuery).
		Limit(100).
		Scan(&portalUsers)

	if result.Error != nil {
		return []openapi.UserData{}, types.NewErrFromGorm(result.Error, "failed to query users")
	}
	portalUserIds := []uuid.UUID{}
	for _, portalUser := range portalUsers {
		portalUserIds = append(portalUserIds, portalUser.ID)
	}

	usernames, err := s.entra.FindUsernames(ctx, query)
	if err != nil {
		log.Err(err).Msg("Failed to query entra for additional users")
	}
	entraUsers := []types.User{}
	if len(portalUserIds) > 0 {
		result = s.db.Where("username IN (?) AND id NOT IN (?)", usernames, portalUserIds).Find(&entraUsers)
	} else {
		result = s.db.Where("username IN (?)", usernames).Find(&entraUsers)
	}
	if result.Error != nil {
		return []openapi.UserData{}, types.NewErrFromGorm(result.Error)
	}

	return s.usersData(append(portalUsers, entraUsers...))
}

func (s *Service) AllApprovedResearchers() ([]ApprovedResearcherExportRecord, error) {
	records := []ApprovedResearcherExportRecord{}

	result := s.db.Model(&types.User{}).
		Joins("INNER JOIN user_agreement_confirmations ON users.id = user_id").
		Joins("INNER JOIN agreements ON user_agreement_confirmations.agreement_id = agreements.id").
		Joins("INNER JOIN user_training_records ON users.id = user_training_records.user_id").
		Where("agreements.type = ? AND user_training_records.kind = ?", agreements.ApprovedResearcherType, types.TrainingKindNHSD).
		Select(
			"users.username, " +
				"MAX(user_training_records.completed_at) as training_complete_at, " +
				"MAX(user_agreement_confirmations.created_at) as agreed_at",
		).
		Group("users.username").
		Scan(&records)
	if result.Error != nil {
		return nil, types.NewErrFromGorm(result.Error, "failed to count approved researchers")
	}
	return records, nil
}
