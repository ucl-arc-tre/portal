package studies

import openapi "github.com/ucl-arc-tre/portal/internal/openapi/web"

type QueryParams struct {
	CaseRef        *int
	ApprovalStatus *openapi.ApprovalStatus
	FuzzyName      *string
}
