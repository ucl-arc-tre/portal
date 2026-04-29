package testutil

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

func (f *MockEntra) IsStaffMember(ctx context.Context, username types.Username) (bool, error) {
	panic("not implemented")
}

func (f *MockEntra) UserExists(ctx context.Context, username types.Username) (bool, error) {
	panic("not implemented")
}

func (f *MockEntra) SendInvite(ctx context.Context, email string, sponsor types.Sponsor) (*entra.InvitedUserData, error) {
	panic("not implemented")
}

func (f *MockEntra) AddtoInvitedUserGroup(ctx context.Context, user entra.InvitedUserData) error {
	panic("not implemented")
}

func (f *MockEntra) FindUsernames(ctx context.Context, query string) ([]types.Username, error) {
	args := f.Called(ctx, query)
	return args.Get(0).([]types.Username), args.Error(1)
}

func (f *MockEntra) SendCustomInviteNotification(ctx context.Context, email string, sponsor types.Sponsor) error {
	panic("not implemented")
}

func (f *MockEntra) SendContractExpiryNotification(ctx context.Context, emails []string, contract types.Contract, study types.Study) error {
	panic("not implemented")
}

func (f *MockEntra) SendTrainingExpiryNotification(ctx context.Context, email string, training types.UserTrainingRecord) error {
	panic("not implemented")
}

func (f *MockEntra) SendCustomStudyReviewNotification(ctx context.Context, emails []string, review openapi.StudyReview) error {
	panic("not implemented")
}
