package certificate

import (
	"fmt"
	"time"
)

type TrainingCertificate struct {
	IsValid   bool
	FirstName string
	LastName  string
	IssuedAt  time.Time
}

func (t *TrainingCertificate) Name() string {
	if t == nil {
		return ""
	} else {
		return fmt.Sprintf("%s %s", t.FirstName, t.LastName)
	}
}

func (t *TrainingCertificate) NameMatches(value string) bool {
	if t == nil {
		return false
	}
	return caseInsensitiveMatch(stripHyphens(t.Name()), stripHyphens(value))
}

func (t *TrainingCertificate) HasIssuedAt() bool {
	defaultTime := time.Time{}
	return t.IssuedAt != defaultTime
}
