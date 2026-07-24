package tasks

import (
	"context"
	"errors"
	"time"

	"github.com/ucl-arc-tre/portal/internal/types"
)

const (
	entraLookupDelay = 100 * time.Millisecond
)

func (m *Manager) updateUserEmails() error {
	users, err := m.users.All() // NOTE: need pagination if there is _many_ users
	if err != nil {
		return err
	}

	errs := []error{}
	for _, user := range users {
		ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
		defer cancel()

		if err := m.users.AssignEmailAddress(ctx, user); err != nil {
			errs = append(errs, err)
		}
		select {
		case <-ctx.Done():
			return types.NewErrServerError("timed out waiting for entra email lookup")
		default:
			time.Sleep(entraLookupDelay) // prevent entra rate limiting
		}
	}
	return errors.Join(errs...)
}
