package pdf

import (
	"encoding/base64"
	"os"
	"testing"
	"time"

	"github.com/stretchr/testify/assert"
)

func TestValidNHSDCertificateParse(t *testing.T) {
	contentBase64 := mustBase64Encode(t, "testdata/valid.pdf")
	certificate, err := ParseNHSDCertificate(contentBase64)
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
	contentBase64 := mustBase64Encode(t, "testdata/invalid.pdf")
	certificate, err := ParseNHSDCertificate(contentBase64)
	assert.NoError(t, err)
	assert.NotNil(t, certificate)
	assert.False(t, certificate.IsValid)
}

func mustBase64Encode(t *testing.T, filepath string) string {
	content, err := os.ReadFile(filepath)
	assert.NoError(t, err)
	return base64.StdEncoding.EncodeToString(content)
}
