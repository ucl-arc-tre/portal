package middleware

import (
	"fmt"
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestExtractTokenFromHeader(t *testing.T) {
	invalidHeaders := []string{
		"",
		"Basic aGVsbG8gd29ybGQK",
		"Bearer a b",
		"Bearer ",
	}
	for _, tc := range invalidHeaders {
		t.Run(fmt.Sprintf("invalid [%s]", tc), func(t *testing.T) {
			_, err := extractTokenFromHeader(tc)
			assert.Error(t, err)
		})
	}

	value, err := extractTokenFromHeader("Bearer hello")
	assert.NoError(t, err)
	assert.Equal(t, "hello", value)
}
