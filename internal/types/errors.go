package types

import (
	"errors"
	"fmt"

	"gorm.io/gorm"
)

var (
	ErrInvalidObject = errors.New("invalid object")
	ErrServerError   = errors.New("server error")
	ErrNotFound      = errors.New("not found")
)

func NewErrInvalidObject(err any) error {
	return newErrorWithType(err, ErrInvalidObject)
}

func NewErrServerError(err any) error {
	return newErrorWithType(err, ErrServerError)
}

func NewNotFoundError(err any) error {
	return newErrorWithType(err, ErrNotFound)
}

func NewErrFromGorm(err error, messages ...string) error {
	if err == nil {
		return nil
	} else if errors.Is(err, gorm.ErrRecordNotFound) {
		return NewNotFoundError(fmt.Errorf("%v %v", err, messages))
	}
	return NewErrServerError(fmt.Errorf("%v %v", err, messages))
}

func newErrorWithType(err any, errorType error) error {
	if err == nil {
		return nil
	}
	return fmt.Errorf("%w: %v", errorType, err)
}
