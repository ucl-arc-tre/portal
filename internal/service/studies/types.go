package studies

import (
	"context"

	"github.com/ucl-arc-tre/portal/internal/graceful"
	openapi "github.com/ucl-arc-tre/portal/internal/openapi/web"
	"github.com/ucl-arc-tre/portal/internal/types"
	"gorm.io/gorm"
)

type QueryParams struct {
	CaseRef        *int
	ApprovalStatus *openapi.StudyApprovalStatus
	FuzzyTitle     *string
	OwnerUsername  *string
	Limit          int
	Offset         int
}

type ContractObject struct {
	Object types.S3Object
	Meta   types.ContractObjectMetadata
}

type StudyTransaction struct {
	ctx     context.Context
	db      *gorm.DB
	newIAAs []types.User // Newly added administrations that require notifications
}

func (s *StudyTransaction) Rollback() {
	s.db.Rollback()
	s.newIAAs = []types.User{}
}

func (s *StudyTransaction) RollbackOnPanic() {
	graceful.RollbackTransactionOnPanic(s.db)
}
