package notifications

import (
	"testing"

	"github.com/google/uuid"
	"github.com/stretchr/testify/assert"
	"github.com/ucl-arc-tre/portal/internal/types"
)

func TestInvalidCreate(t *testing.T) {
	svc := &Service{}
	err := svc.create(types.Notification{Title: "blah"}, types.User{})
	assert.ErrorIs(t, err, types.ErrInvalidObject)

	err = svc.create(types.Notification{}, types.User{Model: types.Model{ID: uuid.New()}})
	assert.ErrorIs(t, err, types.ErrInvalidObject)
}
