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
	ClientReadableReason string
}

func (e ErrClientInvalidObject) Error() string {
	return fmt.Sprintf("invalid object: %s", e.ClientReadableReason)
}

// New invalid object error with a reason that will be client readable can be formatted
// e.g. NewErrClientInvalidObjectF("mime type was [%v] not valid", mimeType)
func NewErrClientInvalidObjectF(format string, objs ...any) *ErrClientInvalidObject {
	return &ErrClientInvalidObject{ClientReadableReason: fmt.Sprintf(format, objs...)}
}

// New invalid object error wrapping an internal error
// e.g. NewErrInvalidObject(err)
func NewErrInvalidObject(err any) error {
	return newErrorWithType(err, ErrInvalidObject)
}

// New invalid object error wrapping an internal error that can be formatted
// e.g. NewErrInvalidObjectF("mime type was [%v] not valid", mimeType)
func NewErrInvalidObjectF(format string, objs ...any) error {
	return newErrorWithType(fmt.Errorf(format, objs...), ErrInvalidObject)
}

// New server error wrapping an internal error
// e.g. NewErrServerError(err)
func NewErrServerError(err any) error {
	return newErrorWithType(err, ErrServerError)
}

// New not found error wrapping an internal error
// e.g. NewNotFoundError(err)
func NewNotFoundError(err any) error {
	return newErrorWithType(err, ErrNotFound)
}

// New error from a gorm error see: https://gorm.io/docs/error_handling.html
// e.g. NewErrFromGorm(result.Error)
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
