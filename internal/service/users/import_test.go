package users

import (
	"os"
	"testing"
	"time"

	"github.com/stretchr/testify/assert"
	"github.com/ucl-arc-tre/portal/internal/types"
)

func TestApprovedResearcherImportParsingValid(t *testing.T) {
	content, err := os.ReadFile("testdata/approved-researchers-valid.csv")
	assert.NoError(t, err)
	records, err := approvedResearcherImportRecordsFromCSV(content)
	assert.NoError(t, err)
	assert.Len(t, records, 3)
	expectedBobNHSDTrainingCompletedAt := time.Date(2021, time.March, 11, 0, 0, 0, 0, time.UTC)
	assert.Equal(t, records[0], ApprovedResearcherImportRecord{
		Username:                types.Username("bob@example.com"),
		AgreedToAgreement:       true,
		NHSDTrainingCompletedAt: &expectedBobNHSDTrainingCompletedAt,
	})
	assert.Equal(t, records[2], ApprovedResearcherImportRecord{
		Username:          types.Username("john@example.com"),
		AgreedToAgreement: true,
	})
	assert.False(t, records[1].AgreedToAgreement)
}

func TestApprovedResearcherImportParsingInValid(t *testing.T) {
	content, err := os.ReadFile("testdata/approved-researchers-invalid.csv")
	assert.NoError(t, err)
	_, err = approvedResearcherImportRecordsFromCSV(content)
	assert.Error(t, err)
}
