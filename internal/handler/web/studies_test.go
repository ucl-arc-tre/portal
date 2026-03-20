package web

import (
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestIsCaseRefPattern(t *testing.T) {
	assert.False(t, queryIsCaseref(nil))

	invalidCaserefs := []string{"-1", "100000", "0"}
	for _, invalidCaseref := range invalidCaserefs {
		assert.False(t, queryIsCaseref(&invalidCaseref))
	}

	validCaserefs := []string{"1", "001", "99999", "1234"}
	for _, validCaseref := range validCaserefs {
		assert.True(t, queryIsCaseref(&validCaseref))
	}
}

func TestIsOwnerUsername(t *testing.T) {
	assert.False(t, queryIsOwnerUsername(nil))

	invalidOwnerUsenames := []string{"bob", "123", "a@"}
	for _, invalidUsernames := range invalidOwnerUsenames {
		assert.False(t, queryIsOwnerUsername(&invalidUsernames))
	}

	validOwnerUsernames := []string{"bob@example.com"}
	for _, validUsername := range validOwnerUsernames {
		assert.True(t, queryIsOwnerUsername(&validUsername))
	}
}
