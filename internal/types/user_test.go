package types

import (
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestUserNameValidity(t *testing.T) {
	assert.True(t, Username("bob@example.com").IsValid())
	assert.False(t, Username("bobexample.com").IsValid())
	assert.False(t, Username("bob@examplecom").IsValid())
	assert.False(t, Username("foo").IsValid())
}
