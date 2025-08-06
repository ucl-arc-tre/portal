package types

import (
	"errors"
	"fmt"
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

func newErrorWithType(err any, errorType error) error {
	if err == nil {
		return nil
	}
	return fmt.Errorf("%w: %v", errorType, err)
}
