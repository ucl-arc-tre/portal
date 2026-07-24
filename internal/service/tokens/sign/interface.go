package sign

import "github.com/google/uuid"

type VerifyInterface interface {
	Delete(id uuid.UUID)
}
