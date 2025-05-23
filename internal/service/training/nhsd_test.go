package training

import (
	"os"
	"testing"
	"time"

	"github.com/stretchr/testify/assert"
)

func TestValidNHSDCertificateParse(t *testing.T) {
	content, err := os.ReadFile("testdata/valid.pdf")
	assert.NoError(t, err)
	certificate, err := ParseNHSDCertificate(content)
	assert.NoError(t, err)
	assert.NotNil(t, certificate)
	assert.True(t, certificate.IsValid)
	assert.Equal(t, "Tom", certificate.FirstName)
	assert.Equal(t, "Young", certificate.LastName)
	expectedExpiry, err := time.Parse("2006-01-02", "2024-10-23")
	assert.NoError(t, err)
	assert.Equal(t, expectedExpiry, certificate.IssuedAt)
}

func TestInvalidNHSDCertificateParse(t *testing.T) {
	content, err := os.ReadFile("testdata/invalid.pdf")
	assert.NoError(t, err)
	certificate, err := ParseNHSDCertificate(content)
	assert.NoError(t, err)
	assert.NotNil(t, certificate)
	assert.False(t, certificate.IsValid)
}
