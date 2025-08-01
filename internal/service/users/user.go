package users

import (
	"errors"
	"fmt"

	openapi "github.com/ucl-arc-tre/portal/internal/openapi/web"
	"github.com/ucl-arc-tre/portal/internal/rbac"
	"github.com/ucl-arc-tre/portal/internal/types"
	"gorm.io/gorm"
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

		roles, err := rbac.GetRoles(user)
		if err != nil {
			return usersData, fmt.Errorf("failed to get roles for user: %w", err)
		}

		training, err := s.GetTrainingRecord(user)
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
			TrainingRecord: training,
			Roles:          roles,
		}
		usersData = append(usersData, userData)
	}
	return usersData, nil
}

func (s *Service) GetUser(id string) (types.User, error) {
	user := types.User{}
	result := s.db.Where("id = ?", id).
		First(&user)
	return user, types.NewErrServerError(result.Error)
}

// Get an persisted user. Optional
func (s *Service) GetUserByUsername(username types.Username) (*types.User, error) {
	user := types.User{}
	result := s.db.Where("username = ?", username).First(&user)
	if errors.Is(result.Error, gorm.ErrRecordNotFound) {
		return nil, nil
	}
	return &user, types.NewErrServerError(result.Error)
}

func (s *Service) CreateUserSponsorship(username types.Username, sponsor types.Username) (types.UserSponsorship, error) {

	result := s.db.Create(&types.UserSponsorship{
		Username: username,
		Sponsor:  sponsor,
	})

	return types.UserSponsorship{}, types.NewErrServerError(result.Error)

}
