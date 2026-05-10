package studies

import (
	"context"
	"time"

	"github.com/ucl-arc-tre/portal/internal/graceful"
	openapi "github.com/ucl-arc-tre/portal/internal/openapi/web"
	"github.com/ucl-arc-tre/portal/internal/types"
	"gorm.io/gorm"
)

type QueryParams struct {
	CaseRef        *int
	ApprovalStatus *openapi.ApprovalStatus
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

func (s StudyTransaction) Rollback() {
	s.db.Rollback()
}

func (s StudyTransaction) RollbackOnPanic() {
	graceful.RollbackTransactionOnPanic(s.db)
}

func (s StudyTransaction) Deadline() (deadline time.Time, ok bool) {
	return s.ctx.Deadline()
}

func (s StudyTransaction) Done() <-chan struct{} {
	return s.ctx.Done()
}

func (s StudyTransaction) Err() error {
	return s.ctx.Err()
}

func (s StudyTransaction) Value(key any) any {
	return s.ctx.Value(key)
}
