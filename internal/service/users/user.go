package users

import (
	"errors"

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
		return usersData, result.Error
	}

	// then loop through each and get their agreements & roles
	for _, user := range users {
		agreements, err := s.ConfirmedAgreements(user)
		if err != nil {
			return usersData, errors.New("failed to get agreements for user")
		}

		roles, err := rbac.GetRoles(user)
		if err != nil {
			return usersData, errors.New("failed to get roles for user")
		}

		training, err := s.GetTrainingRecord(user)
		if err != nil {
			return usersData, errors.New("failed to get training for user")
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
	person := types.User{}
	result := s.db.Where("id = ?", id).
		First(&person)
	return person, result.Error
}

// Get an persisted user. Optional
func (s *Service) GetUserByUsername(username types.Username) (*types.User, error) {
	user := types.User{}
	result := s.db.Where("username = ?", username).First(&user)
	if errors.Is(result.Error, gorm.ErrRecordNotFound) {
		return nil, nil
	}
	return &user, result.Error
}
