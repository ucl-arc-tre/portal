package certificate

import (
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestNameMatches(t *testing.T) {
	assert.True(t, newCertificateWithName("bob", "Smith").NameMatches("Bob Smith"))
	assert.True(t, newCertificateWithName("alice", "smith-Jones").NameMatches("Alice Smith Jones"))
}

func newCertificateWithName(firstName string, lastName string) *TrainingCertificate {
	return &TrainingCertificate{FirstName: firstName, LastName: lastName}
}
