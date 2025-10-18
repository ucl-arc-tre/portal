package environments

import (
	_ "embed"
	"fmt"

	"github.com/ucl-arc-tre/portal/internal/graceful"
	"github.com/ucl-arc-tre/portal/internal/types"
)

const (
	TRE = types.EnvironmentName("ARC Trusted Research Environment")
	DSH = types.EnvironmentName("Data Safe Haven")
)

// Initalise the environments
func Init() {
	environments := []types.Environment{
		{Name: TRE, Tier: 3},
		{Name: DSH, Tier: 3},
	}

	db := graceful.NewDB()
	for _, environment := range environments {
		result := db.Where(
			"name = ?",
			environment.Name,
		).Attrs(types.Environment{
			Name: environment.Name,
		}).Assign(types.Environment{
			Tier: environment.Tier,
		}).FirstOrCreate(&types.Environment{})

		if result.Error != nil {
			panic(fmt.Sprintf("failed to initalise agreement: %v", result.Error))
		}
	}
}
