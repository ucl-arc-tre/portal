package users

import (
	"bytes"
	"encoding/csv"
	"fmt"
	"io"
	"time"

	"github.com/rs/zerolog/log"
	"github.com/ucl-arc-tre/portal/internal/types"
)

// Import a CSV file containing usernames, agreement confirmation, nhsd training completed at dates
func (s *Service) ImportApprovedResearchersCSV(csvContent []byte, agreement types.Agreement) error {
	records, err := approvedResearcherImportRecordsFromCSV(csvContent)
	if err != nil {
		return err
	}
	for _, record := range records {
		user, err := s.persistedUser(record.Username)
		if err != nil {
			return err
		}
		if err := s.ConfirmAgreement(user, agreement.ID); err != nil {
			return err
		}
		if err := s.createNHSDTrainingRecord(user, record.NHSDTrainingCompletedAt); err != nil {
			return err
		}
		log.Debug().Any("user", user).Msg("Inserted approved researcher")
	}
	return nil
}

// Get or create a user for a unique username
func (s *Service) persistedUser(username types.Username) (types.User, error) {
	user := types.User{}
	result := s.db.Where("username = ?", username).
		Attrs(types.User{
			Username: username,
			Model:    types.Model{CreatedAt: time.Now()},
		}).
		FirstOrCreate(&user)
	return user, result.Error
}

func approvedResearcherImportRecordsFromCSV(csvContent []byte) ([]ApprovedResearcherImportRecord, error) {
	reader := csv.NewReader(bytes.NewReader(csvContent))
	records := []ApprovedResearcherImportRecord{}
	for {
		raw, err := reader.Read()
		if err == io.EOF {
			break
		} else if err != nil {
			return records, err
		} else if len(raw) != 3 {
			return records, fmt.Errorf("failed to parse csv line: %v", raw)
		}
		nhsdTrainingCompletedAt, err := time.Parse("2006-01-02", raw[2])
		if err != nil {
			return records, err
		}
		record := ApprovedResearcherImportRecord{
			Username:                types.Username(raw[0]),
			AgreedToAgreement:       raw[1] == "true",
			NHSDTrainingCompletedAt: nhsdTrainingCompletedAt,
		}
		records = append(records, record)
	}
	return records, nil
}
