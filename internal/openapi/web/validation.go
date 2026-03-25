package openapi

func NewValidationError(message string) *ValidationError {
	return &ValidationError{ErrorMessage: message}
}
