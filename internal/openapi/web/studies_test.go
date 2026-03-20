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

func ptr[T any](obj T) *T {
	return &obj
}
