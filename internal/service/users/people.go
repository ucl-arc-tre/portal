package users

import (
	"errors"
	"fmt"
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

		training, err := s.GetPersonTrainingRecords(user)
		if err != nil {
			fmt.Println("err", err)
			return people, errors.New("failed to get training for user")
		}
		fmt.Println("training", training)

		person := openapi.Person{
			User: openapi.User{
				Id:       user.ID.String(),
				Username: string(user.Username),
			},
			Agreements: openapi.ProfileAgreements{
				ConfirmedAgreements: agreements,
			},
			// TrainingRecord: training,
			Roles: roles,
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

func (s *Service) GetPersonTrainingRecords(user types.User) ([]openapi.PersonTrainingRecords, error) {
	// get the user training records, extract the relevant data and put it in a TrainingRecord format (only date and kind) and put it in a PersonTrainingRecords slice
	record := types.UserTrainingRecord{
		UserID: user.ID,
	}
	var fetchedTrainingRecords []types.UserTrainingRecord
	result := s.db.Where(&record).Find(&fetchedTrainingRecords)
	if result.Error != nil {
		return nil, result.Error
	}

	training_records := []openapi.PersonTrainingRecords{}

	for _, tr := range fetchedTrainingRecords {
		trainingKind := openapi.TrainingKind(tr.Kind)

		var formattedTime *string
		if !tr.CompletedAt.IsZero() {
			formatted := tr.CompletedAt.Format(time.RFC3339)
			formattedTime = &formatted
		}

		apiTrainingRecord := &openapi.PersonTrainingRecords{
			Training: &[]openapi.TrainingRecord{
				{TrainingKind: &trainingKind,
					CompletedAt: formattedTime},
			},
		}
		training_records = append(training_records, *apiTrainingRecord)
	}
	return training_records, nil
}

func (s *Service) SetTrainingValidity(user types.User, trainingkind types.TrainingKind, date string) error {

	confirmation_time, err := time.Parse(time.RFC3339, date)
	if err != nil {
		return err
	}
	fmt.Println("setting training validity", confirmation_time, trainingkind, types.TrainingKind(openapi.TrainingKindNhsd))
	switch trainingkind {
	case types.TrainingKind(openapi.TrainingKindNhsd):

		response := s.createNHSDTrainingRecord(user, confirmation_time)
		fmt.Println("response", response)

		return response
	}

	return err
}
