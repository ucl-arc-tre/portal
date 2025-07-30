package types

import (
	"errors"
	"fmt"
)

var (
	ErrInvalidObject = errors.New("invalid object")
	ErrServerError   = errors.New("server error")
	ErrNotFound      = errors.New("not found")
	ErrConflict      = errors.New("conflict")
)

func NewErrInvalidObject(err error) error {
	return newErrorWithType(err, ErrInvalidObject)
}

func NewErrServerError(err error) error {
	return newErrorWithType(err, ErrServerError)
}

func NewNotFoundError(err error) error {
	return newErrorWithType(err, ErrNotFound)
}

func NewErrConflict(err error) error {
	return newErrorWithType(err, ErrConflict)
}

func newErrorWithType(err error, errorType error) error {
	if err == nil {
		return nil
	}
	return fmt.Errorf("%w: %w", errorType, err)
}
