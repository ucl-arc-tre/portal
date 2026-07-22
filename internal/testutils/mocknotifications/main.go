package mocknotifications

import (
	"context"

	"github.com/google/uuid"
	"github.com/stretchr/testify/mock"
	"github.com/ucl-arc-tre/portal/internal/types"
)

type MockNotifications struct {
	mock.Mock
}

func (s *MockNotifications) Find(user types.User) ([]types.Notification, error) {
	panic("not-implemented")
}

func (s *MockNotifications) Read(id uuid.UUID, user types.User) error {
	panic("not-implemented")
}

func (s *MockNotifications) NotifyToCompleteProfile(user types.User) error {
	return nil
}

func (s *MockNotifications) NotifyContractExpiry(ctx context.Context, contract types.Contract, study types.Study) error {
	panic("not-implemented")
}

func (s *MockNotifications) NotifyTrainingExpiry(ctx context.Context, training types.UserTrainingRecord) error {
	panic("not-implemented")
}

func (s *MockNotifications) NotifyStudyReview(ctx context.Context, study types.Study, igOpsStaff []types.User) error {
	panic("not-implemented")
}

func (s *MockNotifications) NotifyIaaAssignment(ctx context.Context, iaa types.User, study types.Study) error {
	return nil
}

func (s *MockNotifications) NotifyStudySignoffExpiry(ctx context.Context, study types.Study) error {
	panic("not-implemented")
}

func (s *MockNotifications) NotifyAssetExpiry(ctx context.Context, assets []types.Asset, study types.Study) error {
	panic("not-implemented")
}

func (s *MockNotifications) NotifyOwnerChange(ctx context.Context, study types.Study, igOpsStaff []types.User) error {
	panic("not-implemented")
}

func (s *MockNotifications) NotifyUserNameChange(attrs types.UserAttributes, igOpsStaff []types.User) error {
	panic("not-implemented")
}

func (s *MockNotifications) NotifyProjectDeployed(project types.Project, user types.User) error {
	panic("not-implemented")
}
