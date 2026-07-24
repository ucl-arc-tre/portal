package mockcontrollers

import (
	"context"
	"html/template"

	"github.com/stretchr/testify/mock"
	"github.com/ucl-arc-tre/portal/internal/controller/entra"
	"github.com/ucl-arc-tre/portal/internal/types"
)

type MockEntra struct {
	mock.Mock
}

func (m *MockEntra) IsStaffMember(ctx context.Context, username types.Username) (bool, error) {
	args := m.Called(ctx, username)
	return args.Get(0).(bool), args.Error(1)
}

func (m *MockEntra) UserExists(ctx context.Context, username types.Username) (bool, error) {
	args := m.Called(ctx, username)
	return args.Get(0).(bool), args.Error(1)
}

func (m *MockEntra) SendInvite(ctx context.Context, invite entra.Invite) (*entra.InvitedUserData, error) {
	panic("not implemented")
}

func (m *MockEntra) AddtoInvitedUserGroup(ctx context.Context, user entra.InvitedUserData) error {
	panic("not implemented")
}

func (m *MockEntra) FindUsernames(ctx context.Context, query string) ([]types.Username, error) {
	args := m.Called(ctx, query)
	return args.Get(0).([]types.Username), args.Error(1)
}

func (m *MockEntra) SendEmail(ctx context.Context, subject string, emails []string, content template.HTML) error {
	panic("not implemented")
}

func (m *MockEntra) SendCustomInviteNotification(ctx context.Context, invite entra.Invite) error {
	panic("not implemented")
}

func (m *MockEntra) UserEmail(ctx context.Context, username types.Username) (string, error) {
	panic("not implemented")
}
