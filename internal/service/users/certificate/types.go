package certificate

import (
	"regexp"
	"time"

	"github.com/ucl-arc-tre/portal/internal/types"
)

type MatchConfig struct {
	isValid           *regexp.Regexp
	issuedAt          *regexp.Regexp
	name              *regexp.Regexp
	dateFormatOptions []string
}

type TrainingCertificate struct {
	IsValid  bool
	Name     string
	IssuedAt time.Time
	Kind     types.TrainingKind
}

func (t *TrainingCertificate) NameMatches(value string) bool {
	if t == nil {
		return false
	}
	return caseInsensitiveMatch(stripHyphens(t.Name), stripHyphens(value))
}

func (t *TrainingCertificate) HasIssuedAt() bool {
	defaultTime := time.Time{}
	return t.IssuedAt != defaultTime
}
