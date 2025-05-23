package training

import (
	"strings"
	"time"
)

type TrainingCertificate struct {
	IsValid   bool
	FirstName string
	LastName  string
	IssuedAt  time.Time
}

func (t *TrainingCertificate) FirstNameMatches(value string) bool {
	return t != nil && strings.EqualFold(t.FirstName, value) // case insensitive match
}

func (t *TrainingCertificate) LastNameMatches(value string) bool {
	return t != nil && strings.EqualFold(t.LastName, value) // case insensitive match
}
