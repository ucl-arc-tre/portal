package agreements

import (
	_ "embed"
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
	initApprovedResearcher(db)
	initStudyOwner(db)
}

func initApprovedResearcher(db *gorm.DB) {
	result := db.Where(
		"text = ? AND type = ?",
		approvedResearcherMarkdown,
		ApprovedResearcherType,
	).Attrs(types.Agreement{
		Text: approvedResearcherMarkdown,
		Type: ApprovedResearcherType,
	}).FirstOrCreate(&types.Agreement{})
	if result.Error != nil {
		panic(result.Error)
	}
}

func initStudyOwner(db *gorm.DB) {
	result := db.Where(
		"text = ? AND type = ?",
		studyOwnerMarkdown,
		StudyOwnerType,
	).Attrs(types.Agreement{
		Text:  studyOwnerMarkdown,
		Type:  StudyOwnerType,
		Model: types.Model{CreatedAt: time.Now()},
	}).FirstOrCreate(&types.Agreement{})
	if result.Error != nil {
		panic(result.Error)
	}
}
