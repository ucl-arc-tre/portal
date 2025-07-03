package users

import (
	"errors"
	"time"

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

		training, err := s.GetTrainingStatus(user)
		if err != nil {
			return people, errors.New("failed to get training for user")
		}

		person := openapi.Person{
			User: openapi.User{
				Id:       user.ID.String(),
				Username: string(user.Username),
			},
			Agreements: openapi.ProfileAgreements{
				ConfirmedAgreements: agreements,
			},
			TrainingRecord: training,
			Roles:          roles,
		}

		if err := s.updateApprovedResearcherStatus(user); err != nil {
			return people, err
		}

		people = append(people, person)
	}
	return people, nil
}

func (s *Service) GetPerson(id string) (types.User, error) {
	person := types.User{}
	result := s.db.Where("id = ?", id).
		First(&person)
	if result.Error != nil {
		return person, result.Error
	}
	return person, nil
}

func (s *Service) SetNhsdTrainingValidity(user types.User, date string) error {

	confirmationTime, err := time.Parse(time.RFC3339, date)
	if err != nil {
		return err
	}

	response := s.createNHSDTrainingRecord(user, confirmationTime)

	return response

}
