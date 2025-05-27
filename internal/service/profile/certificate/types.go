package certificate

import (
	"fmt"
	"strings"
	"time"

	"github.com/ucl-arc-tre/portal/internal/types"
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

func (t *TrainingCertificate) NameMatches(value types.ChosenName) bool {
	return t != nil && strings.EqualFold(t.Name(), string(value)) // case insensitive match
}

func (t *TrainingCertificate) HasIssuedAt() bool {
	defaultTime := time.Time{}
	return t.IssuedAt != defaultTime
}
