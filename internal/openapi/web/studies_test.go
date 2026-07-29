package openapi

import (
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestGetStudiesParamsValid(t *testing.T) {
	assert.True(t, GetStudiesParams{}.Valid())
	assert.True(t, StudyApprovalStatusApproved.Valid())
	assert.True(t, GetStudiesParams{Status: new(StudyApprovalStatusApproved)}.Valid())
	assert.True(t, GetStudiesParams{Query: new("bob")}.Valid())
	assert.False(t, GetStudiesParams{Query: new("bob"), Owner: new("bob@example.com")}.Valid())
	assert.False(t, GetStudiesParams{Status: new(StudyApprovalStatus("not-a-valid-status"))}.Valid())
}

func TestIsCaseRefPattern(t *testing.T) {
	assert.False(t, GetStudiesParams{}.QueryIsCaseref())

	invalidCaserefs := []string{"-1", "100000", "0"}
	for _, invalidCaseref := range invalidCaserefs {
		params := GetStudiesParams{Query: new(invalidCaseref)}
		assert.False(t, params.QueryIsCaseref())
	}

	validCaserefs := []string{"1", "001", "99999", "1234"}
	for _, validCaseref := range validCaserefs {
		params := GetStudiesParams{Query: new(validCaseref)}
		assert.True(t, params.QueryIsCaseref())
	}
}

func TestIsOwnerUsername(t *testing.T) {
	assert.False(t, GetStudiesParams{}.QueryIsOwnerUsername())

	invalidOwnerUsenames := []string{"bob", "123", "a@"}
	for _, invalidUsername := range invalidOwnerUsenames {
		params := GetStudiesParams{Query: new(invalidUsername)}
		assert.False(t, params.QueryIsOwnerUsername())
	}

	validOwnerUsernames := []string{"bob@example.com"}
	for _, validUsername := range validOwnerUsernames {
		params := GetStudiesParams{Query: new(validUsername)}
		assert.True(t, params.QueryIsOwnerUsername())
	}
}
