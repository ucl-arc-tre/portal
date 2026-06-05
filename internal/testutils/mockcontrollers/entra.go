package mockcontrollers

import (
	"context"

	"github.com/stretchr/testify/mock"
	"github.com/ucl-arc-tre/portal/internal/controller/entra"
	openapi "github.com/ucl-arc-tre/portal/internal/openapi/web"
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

func (m *MockEntra) SendInvite(ctx context.Context, email string, sponsor types.Sponsor) (*entra.InvitedUserData, error) {
	panic("not implemented")
}

func (m *MockEntra) AddtoInvitedUserGroup(ctx context.Context, user entra.InvitedUserData) error {
	panic("not implemented")
}

func (m *MockEntra) FindUsernames(ctx context.Context, query string) ([]types.Username, error) {
	args := m.Called(ctx, query)
	return args.Get(0).([]types.Username), args.Error(1)
}

func (m *MockEntra) SendCustomInviteNotification(ctx context.Context, email string, sponsor types.Sponsor) error {
	panic("not implemented")
}

func (m *MockEntra) SendContractExpiryNotification(ctx context.Context, contract types.Contract, study types.Study) error {
	panic("not implemented")
}

func (m *MockEntra) SendTrainingExpiryNotification(ctx context.Context, email string, training types.UserTrainingRecord) error {
	panic("not implemented")
}

func (m *MockEntra) SendCustomStudyReviewNotification(ctx context.Context, emails []string, review openapi.StudyReview) error {
	panic("not implemented")
}

func (m *MockEntra) SendIaaAssignmentNotification(ctx context.Context, email string, studyTitle string) error {
	args := m.Called(ctx, email, studyTitle)
	return args.Error(0)
}

func (m *MockEntra) SendStudySignoffExpiryNotification(ctx context.Context, email string, study types.Study) error {
	panic("not implemented")
}

func (m *MockEntra) SendAssetExpiryNotification(ctx context.Context, assets []types.Asset, study types.Study) error {
	panic("not implemented")
}
