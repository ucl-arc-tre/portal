package agreements

import (
	_ "embed"
	"fmt"
	"time"

	"github.com/ucl-arc-tre/portal/internal/graceful"
	"github.com/ucl-arc-tre/portal/internal/types"
	"gorm.io/gorm"
)

//go:embed approved_researcher.md
var approvedResearcherMarkdown string

//go:embed study_owner.md
var studyOwnerMarkdown string

// Initalise the agreements
func Init() {
	db := graceful.NewDB()
	initAgreement(db, approvedResearcherMarkdown, ApprovedResearcherType)
	initAgreement(db, studyOwnerMarkdown, StudyOwnerType)
}

func initAgreement(db *gorm.DB, agreementMarkdown string, agreementType types.AgreementType) {
	result := db.Where(
		"text = ? AND type = ?",
		agreementMarkdown,
		agreementType,
	).Attrs(types.Agreement{
		Text:  agreementMarkdown,
		Type:  agreementType,
		Model: types.Model{CreatedAt: time.Now()},
	}).FirstOrCreate(&types.Agreement{})
	if result.Error != nil {
		panic(fmt.Sprintf("failed to initalise agreement: %v", result.Error))
	}
}
