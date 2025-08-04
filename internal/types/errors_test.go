package types

import (
	"fmt"
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestNewErrors(t *testing.T) {
	assert.Nil(t, NewNotFoundError(nil))
	assert.Nil(t, NewErrInvalidObject(nil))
	assert.Nil(t, NewErrServerError(nil))
	assert.Equal(t, "invalid object: custom error", NewErrInvalidObject("custom error").Error())
	assert.Equal(t, "server error: custom error", NewErrServerError(fmt.Errorf("custom error")).Error())
}
