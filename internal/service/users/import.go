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

// Import a CSV file containing usernames,agreement conformation,nhsd training completed at dates
func (s *Service) ImportApprovedResearchersCSV(csvContent []byte) error {
	records, err := approvedResearcherImportRecordsFromCSV(csvContent)
	if err != nil {
		return err
	}
	for _, record := range records {
		if err := s.insertApprovedResearcher(record); err != nil {
			return err
		}
		log.Debug().Any("username", record.Username).Msg("Inserted approved researcher")
	}
	return nil
}

func (s *Service) insertApprovedResearcher(record ApprovedResearcherImportRecord) error {
	return nil
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
