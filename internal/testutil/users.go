package testutil

import (
	"context"
	"time"

	"github.com/google/uuid"
	openapi "github.com/ucl-arc-tre/portal/internal/openapi/web"
	"github.com/ucl-arc-tre/portal/internal/service/users"
	"github.com/ucl-arc-tre/portal/internal/types"

	"github.com/stretchr/testify/mock"
)

type MockUsers struct {
	mock.Mock
}

func (m *MockUsers) ConfirmAgreement(user types.User, agreementId uuid.UUID) error {
	panic("not implemented")
}

func (m *MockUsers) ConfirmedAgreements(user types.User) ([]openapi.ConfirmedAgreement, error) {
	panic("not implemented")
}

func (m *MockUsers) Attributes(user types.User) (types.UserAttributes, error) {
	panic("not implemented")
}

func (m *MockUsers) SetUserChosenName(user types.User, chosenName types.ChosenName) error {
	panic("not implemented")
}

func (m *MockUsers) ImportApprovedResearchersCSV(
	ctx context.Context,
	importer types.User,
	csvContent []byte,
	agreement types.Agreement,
) error {
	panic("not implemented")
}

func (m *MockUsers) InviteExternalUser(ctx context.Context, email string, inviter types.User) (types.User, error) {
	panic("not implemented")
}

func (m *MockUsers) CreateUserSponsorship(user types.User, sponsor types.User) (types.UserSponsorship, error) {
	panic("not implemented")
}

func (m *MockUsers) Metrics() (*openapi.UserMetrics, error) {
	panic("not implemented")
}

func (m *MockUsers) UpdateTraining(user types.User, data openapi.ProfileTrainingUpdate) (openapi.ProfileTrainingResponse, error) {
	panic("not implemented")
}

func (m *MockUsers) CreateNHSDTrainingRecord(user types.User, completedAt time.Time) error {
	panic("not implemented")
}

func (m *MockUsers) TrainingRecords(user types.User) ([]openapi.TrainingRecord, error) {
	panic("not implemented")
}

func (m *MockUsers) NHSDTrainingExpiresAt(user types.User) (*time.Time, error) {
	panic("not implemented")
}

func (m *MockUsers) PersistedUser(username types.Username) (types.User, error) {
	args := m.Called(username)
	return args.Get(0).(types.User), args.Error(1)
}

func (m *MockUsers) PersistedExternalUser(username types.Username, email users.Email) (types.User, error) {
	panic("not implemented")
}

func (m *MockUsers) UserExistsWithEmailOrUsername(ctx context.Context, value string) (bool, error) {
	panic("not implemented")
}

func (m *MockUsers) IsStaff(ctx context.Context, user types.User) (bool, error) {
	panic("not implemented")
}

func (m *MockUsers) UserById(id uuid.UUID) (*types.User, error) {
	panic("not implemented")
}

func (m *MockUsers) UserByUsername(username types.Username) (*types.User, error) {
	panic("not implemented")
}

func (m *MockUsers) UserIds(usernames ...types.Username) (map[types.Username]uuid.UUID, error) {
	panic("not implemented")
}

func (m *MockUsers) Find(ctx context.Context, query string) ([]openapi.UserData, error) {
	panic("not implemented")
}

func (m *MockUsers) AllApprovedResearchers() ([]users.ApprovedResearcherExportRecord, error) {
	panic("not implemented")
}
