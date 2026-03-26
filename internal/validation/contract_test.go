package validation

import (
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestIsValidContractFilename(t *testing.T) {
	invalidFilenames := []string{"/a.pdf", "../a.pdf", "bob", "", "./../a.pdf"}
	for _, invalidFilename := range invalidFilenames {
		assert.False(t, IsValidContractFilename(invalidFilename))
	}

	assert.True(t, IsValidContractFilename("a.pdf"))
}
