package certificate

import (
	"time"
)

type TrainingCertificate struct {
	IsValid  bool
	Name     string
	IssuedAt time.Time
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
