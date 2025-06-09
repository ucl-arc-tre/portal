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

type UserWithAgreements struct {
	User       types.User
	Agreements []openapi.ConfirmedAgreement
	Roles      []string
}

func (s *Service) GetAllPeople() ([]UserWithAgreements, error) {
	var usersWithAgreements []UserWithAgreements

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

		usersWithAgreements = append(usersWithAgreements, UserWithAgreements{
			User:       user,
			Agreements: agreements,
			Roles:      roles,
		})
	}
	return usersWithAgreements, nil
}
