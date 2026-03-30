package studies

import (
	openapi "github.com/ucl-arc-tre/portal/internal/openapi/web"
	"github.com/ucl-arc-tre/portal/internal/types"
)

type QueryParams struct {
	CaseRef        *int
	ApprovalStatus *openapi.ApprovalStatus
	FuzzyTitle     *string
	OwnerUsername  *string
	MaxItems       *int
}

type ContractObject struct {
	Object types.S3Object
	Meta   types.ContractObjectMetadata
}
