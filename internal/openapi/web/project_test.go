package openapi

import (
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestGetProjectsParamsValid(t *testing.T) {
	assert.True(t, GetProjectsParams{}.Valid())
	assert.True(t, GetProjectsParams{Query: new("bob")}.Valid())
	assert.True(t, GetProjectsParams{Owner: new("bob@example.com")}.Valid())
	assert.False(t, GetProjectsParams{Query: new("bob"), Owner: new("bob@example.com")}.Valid())
}

func TestGetProjectsParamsQueryIsOwnerUsername(t *testing.T) {
	assert.False(t, GetProjectsParams{}.QueryIsOwnerUsername())

	invalidOwnerUsenames := []string{"bob", "123", "a@"}
	for _, invalidUsername := range invalidOwnerUsenames {
		params := GetProjectsParams{Query: new(invalidUsername)}
		assert.False(t, params.QueryIsOwnerUsername())
	}

	validOwnerUsernames := []string{"bob@example.com"}
	for _, validUsername := range validOwnerUsernames {
		params := GetProjectsParams{Query: new(validUsername)}
		assert.True(t, params.QueryIsOwnerUsername())
	}
}
