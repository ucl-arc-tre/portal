package certificate

import (
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestNameMatches(t *testing.T) {
	assert.True(t, newCertificateWithName("bob Smith").NameMatches("Bob Smith"))
	assert.True(t, newCertificateWithName("alice smith-Jones").NameMatches("Alice Smith Jones"))
	assert.True(t, newCertificateWithName("alice smith Jones").NameMatches("Alice Smith Jones"))
	assert.True(t, newCertificateWithName("alice Renée").NameMatches("Alice Renee"))
}

func newCertificateWithName(name string) *TrainingCertificate {
	return &TrainingCertificate{Name: name}
}
