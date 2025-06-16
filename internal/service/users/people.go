package users

import (
	"errors"

	openapi "github.com/ucl-arc-tre/portal/internal/openapi/web"
	"github.com/ucl-arc-tre/portal/internal/rbac"
	"github.com/ucl-arc-tre/portal/internal/types"
)

func (s *Service) GetAllPeople() (openapi.People, error) {
	people := openapi.People{}

	// get all users from db
	users := []types.User{}
	result := s.db.Find(&users)
	if result.Error != nil {
		return people, result.Error
	}

	// then loop through each and get their agreements & roles
	for _, user := range users {
		agreements, err := s.ConfirmedAgreements(user)
		if err != nil {
			return people, errors.New("failed to get agreements for user")
		}
		roles, err := rbac.GetRoles(user)
		if err != nil {
			return people, errors.New("failed to get roles for user")
		}
		person := openapi.Person{
			User: openapi.User{
				Id:       user.ID.String(),
				Username: string(user.Username),
			},
			Agreements: openapi.ProfileAgreements{
				ConfirmedAgreements: agreements,
			},
			Roles: roles,
		}
		people = append(people, person)
	}
	return people, nil
}
