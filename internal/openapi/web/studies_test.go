package openapi

import (
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestGetStudiesParamsValid(t *testing.T) {
	assert.True(t, GetStudiesParams{}.IsValid())
	assert.True(t, Approved.Valid())
	assert.True(t, GetStudiesParams{Status: ptr(Approved)}.IsValid())
	assert.True(t, GetStudiesParams{Query: ptr("bob")}.IsValid())
	assert.False(t, GetStudiesParams{Query: ptr("bob"), OwnerUsername: ptr("bob@example.com")}.IsValid())
	assert.False(t, GetStudiesParams{Status: ptr(ApprovalStatus("not-a-valid-status"))}.IsValid())
}

func ptr[T any](obj T) *T {
	return &obj
}
