package users

import (
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

	// then loop through each and get their agreements & roles
	for _, user := range users {
		agreements, err := s.ConfirmedAgreements(user)
		if err != nil {
			return usersData, fmt.Errorf("failed to get agreements for user: %w", err)
		}

		roles, err := rbac.Roles(user)
		if err != nil {
			return usersData, fmt.Errorf("failed to get roles for user: %w", err)
		}

		trainingRecords, err := s.TrainingRecords(user)
		if err != nil {
			return usersData, fmt.Errorf("failed to get training for user: %w", err)
		}

		userData := openapi.UserData{
			User: openapi.User{
				Id:       user.ID.String(),
				Username: string(user.Username),
			},
			Agreements: openapi.UserAgreements{
				ConfirmedAgreements: agreements,
			},
			TrainingRecord: openapi.ProfileTraining{
				TrainingRecords: trainingRecords,
			},
			Roles: roles,
		}
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
	if _, err := rbac.AddRole(user, rbac.Base); err != nil {
		return user, fmt.Errorf("failed assign user base role: %v", err)
	}
	return user, nil
}

func (s *Service) UserById(id string) (*types.User, error) {
	uid, err := uuid.Parse(id)
	if err != nil {
		return nil, types.NewErrInvalidObject("invalid uuid")
	}
	return s.findUser(&types.User{Model: types.Model{ID: uid}})
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
