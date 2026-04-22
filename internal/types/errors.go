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

type ErrClientInvalidObject struct {
	ClientReadableReason string // Client readable
}

func (e ErrClientInvalidObject) Error() string {
	return fmt.Sprintf("invalid object: %s", e.ClientReadableReason)
}

// New invalid object error with a reason that will be client readable
func NewErrClientInvalidObjectF(format string, objs ...any) *ErrClientInvalidObject {
	return &ErrClientInvalidObject{ClientReadableReason: fmt.Sprintf(format, objs...)}
}

func NewErrInvalidObject(err any) error {
	return newErrorWithType(err, ErrInvalidObject)
}

func NewErrInvalidObjectF(format string, objs ...any) error {
	return newErrorWithType(fmt.Errorf(format, objs...), ErrInvalidObject)
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
