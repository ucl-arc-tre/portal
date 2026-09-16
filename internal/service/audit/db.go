package audit

import (
	"github.com/ucl-arc-tre/portal/internal/types"
	"gorm.io/gorm"
)

func createOrError(tx *gorm.DB, event *types.AuditEvent, message string) error {
	return types.NewErrFromGorm(tx.Create(event).Error, message)
}
