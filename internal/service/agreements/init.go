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

// Initalise the agreements
func Init() {
	db := graceful.NewDB()
	initApprovedResearcher(db)
}

func initApprovedResearcher(db *gorm.DB) {
	result := db.Where(
		"text = ? AND type = ?",
		approvedResearcherMarkdown,
		ApprovedResearcherType,
	).Attrs(types.Agreement{
		Text:  approvedResearcherMarkdown,
		Type:  ApprovedResearcherType,
		Model: types.Model{CreatedAt: time.Now()},
	}).FirstOrCreate(&types.Agreement{})
	if result.Error != nil {
		panic(result.Error)
	}
}
