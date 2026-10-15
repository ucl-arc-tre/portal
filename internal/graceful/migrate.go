package graceful

import (
	"fmt"

	"github.com/ucl-arc-tre/portal/internal/types"
	"gorm.io/gorm"
)

func migrateTREProject(db *gorm.DB) {
	migrator := db.Migrator()
	if migrator.HasColumn(&types.ProjectTRE{}, "environment_id") {
		if err := migrator.DropColumn(&types.ProjectTRE{}, "environment_id"); err != nil {
			panic(fmt.Errorf("failed to drop environment_id from TRE project: %w", err))
		}
	}
}
