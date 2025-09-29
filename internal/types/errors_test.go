package types

import (
	"errors"
	"fmt"
	"testing"

	"github.com/stretchr/testify/assert"
	"gorm.io/gorm"
)

func TestNewErrors(t *testing.T) {
	assert.Nil(t, NewNotFoundError(nil))
	assert.Nil(t, NewErrInvalidObject(nil))
	assert.Nil(t, NewErrServerError(nil))
	assert.Equal(t, "invalid object: custom error", NewErrInvalidObject("custom error").Error())
	assert.Equal(t, "server error: custom error", NewErrServerError(fmt.Errorf("custom error")).Error())
}

func TestErrFromGorm(t *testing.T) {
	assert.Nil(t, NewErrFromGorm(nil))
	assert.Nil(t, NewErrFromGorm(nil, "a message"))

	assert.True(t, errors.Is(NewErrFromGorm(gorm.ErrRecordNotFound), ErrNotFound))
	assert.True(t, errors.Is(NewErrFromGorm(gorm.ErrRecordNotFound, "some message"), ErrNotFound))

	assert.True(t, errors.Is(NewErrFromGorm(gorm.ErrDuplicatedKey), ErrServerError))
	assert.True(t, errors.Is(NewErrFromGorm(gorm.ErrDuplicatedKey, "some message"), ErrServerError))
}
