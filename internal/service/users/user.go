package users

import (
	"context"
	"fmt"
	"time"

	"github.com/google/uuid"
	openapi "github.com/ucl-arc-tre/portal/internal/openapi/web"
	"github.com/ucl-arc-tre/portal/internal/rbac"
	"github.com/ucl-arc-tre/portal/internal/types"
)

func (s *Service) AllUsers() ([]openapi.UserData, error) {
	usersData := []openapi.UserData{}

	// get all users from db
	users := []types.User{}
	result := s.db.Find(&users)
	if result.Error != nil {
		return usersData, types.NewErrServerError(result.Error)
	}

	return s.usersData(users)
}

func (s *Service) AllApprovedResearcherUsers() ([]openapi.UserData, error) {
	usersData := []openapi.UserData{}

	// get all approved researcher users from db
	userIds, err := rbac.GetUserIdsWithRole(rbac.ApprovedResearcher)
	if err != nil {
		return usersData, err
	}

	users := []types.User{}
	err = s.db.Where("id IN (?)", userIds).Find(&users).Error
	if err != nil {
		return usersData, types.NewErrServerError(err)
	}

	usersData, err = s.usersData(users)
	if err != nil {
		return usersData, err
	}

	return usersData, nil
}

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
// If they do not exist then they will be created with the base role
func (s *Service) PersistedUser(username types.Username) (types.User, error) {
	user := types.User{}
	result := s.db.Where("username = ?", username).
		Attrs(types.User{
			Username: username,
			Model:    types.Model{CreatedAt: time.Now()},
		}).
		FirstOrCreate(&user)
	if result.Error != nil {
		return user, types.NewErrServerError(result.Error)
	}
	userWasCreated := result.RowsAffected > 0
	if userWasCreated {
		if _, err := rbac.AddRole(user, rbac.Base); err != nil {
			return user, fmt.Errorf("failed assign user base role: %v", err)
		}
	}
	return user, nil
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

func (s *Service) findUser(user *types.User) (*types.User, error) {
	result := s.db.Where(user).Limit(1).Find(user)
	if result.RowsAffected == 0 {
		return nil, types.NewNotFoundError("user not found")
	}
	return user, types.NewErrServerError(result.Error)
}
