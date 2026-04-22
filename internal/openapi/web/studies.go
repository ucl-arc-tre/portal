package openapi

import (
	"regexp"
	"strings"

	"github.com/ucl-arc-tre/portal/internal/types"
)

var (
	caserefQueryPattern = regexp.MustCompile(`^[0-9]{1,5}$`)
)

func (s GetStudiesParams) Valid() bool {
	if s.Query != nil && (s.Caseref != nil || s.FuzzyTitle != nil || s.OwnerUsername != nil) {
		return false
	}
	if s.Status != nil && !s.Status.Valid() {
		return false
	}
	return true
}

func (s GetStudiesParams) QueryIsCaseref() bool {
	if s.Query == nil {
		return false
	} else if len(*s.Query) > 5 {
		return false
	}
	return caserefQueryPattern.MatchString(strings.TrimLeft(*s.Query, "0"))
}

func (s GetStudiesParams) QueryIsOwnerUsername() bool {
	if s.Query == nil {
		return false
	}
	return types.Username(*s.Query).IsValid()
}
