package openapi

import (
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestGetStudiesParamsValid(t *testing.T) {
	assert.True(t, GetStudiesParams{}.Valid())
	assert.True(t, Approved.Valid())
	assert.True(t, GetStudiesParams{Status: ptr(Approved)}.Valid())
	assert.True(t, GetStudiesParams{Query: ptr("bob")}.Valid())
	assert.False(t, GetStudiesParams{Query: ptr("bob"), OwnerUsername: ptr("bob@example.com")}.Valid())
	assert.False(t, GetStudiesParams{Status: ptr(ApprovalStatus("not-a-valid-status"))}.Valid())
}

func TestIsCaseRefPattern(t *testing.T) {
	assert.False(t, GetStudiesParams{}.QueryIsCaseref())

	invalidCaserefs := []string{"-1", "100000", "0"}
	for _, invalidCaseref := range invalidCaserefs {
		params := GetStudiesParams{Query: ptr(invalidCaseref)}
		assert.False(t, params.QueryIsCaseref())
	}

	validCaserefs := []string{"1", "001", "99999", "1234"}
	for _, validCaseref := range validCaserefs {
		params := GetStudiesParams{Query: ptr(validCaseref)}
		assert.True(t, params.QueryIsCaseref())
	}
}

func TestIsOwnerUsername(t *testing.T) {
	assert.False(t, GetStudiesParams{}.QueryIsOwnerUsername())

	invalidOwnerUsenames := []string{"bob", "123", "a@"}
	for _, invalidUsername := range invalidOwnerUsenames {
		params := GetStudiesParams{Query: ptr(invalidUsername)}
		assert.False(t, params.QueryIsOwnerUsername())
	}

	validOwnerUsernames := []string{"bob@example.com"}
	for _, validUsername := range validOwnerUsernames {
		params := GetStudiesParams{Query: ptr(validUsername)}
		assert.True(t, params.QueryIsOwnerUsername())
	}
}

func ptr[T any](obj T) *T {
	return &obj
}
