package people

import (
	"errors"

	"github.com/ucl-arc-tre/portal/internal/graceful"
	openapi "github.com/ucl-arc-tre/portal/internal/openapi/web"
	"github.com/ucl-arc-tre/portal/internal/rbac"
	"github.com/ucl-arc-tre/portal/internal/service/profile"
	"github.com/ucl-arc-tre/portal/internal/types"
	"gorm.io/gorm"
)

type Service struct {
	db      *gorm.DB
	profile *profile.Service
}

func New() *Service {
	return &Service{db: graceful.NewDB(), profile: profile.New()}
}

func (s *Service) GetAllPeople() ([]openapi.Person, error) {
	var usersWithAgreements []openapi.Person

	// get all users from db
	var users []types.User
	result := s.db.Find(&users)
	if result.Error != nil {
		return nil, result.Error
	}

	// then loop through each and get their agreements & roles
	for _, user := range users {
		agreements, err := s.profile.ConfirmedAgreements(user)
		if err != nil {
			return nil, errors.New("failed to get agreements for user")
		}
		roles, err := rbac.GetRoles(user)
		if err != nil {
			return nil, errors.New("failed to get roles for user")
		}

		userID := user.UserID.String()
		userName := string(user.Username)

		usersWithAgreements = append(usersWithAgreements, openapi.Person{
			User: openapi.User{
				Id:       &userID,
				Username: &userName,
			},
			Agreements: openapi.ProfileAgreements{
				ConfirmedAgreements: agreements,
			},
			Roles: roles,
		})
	}
	return usersWithAgreements, nil
}
