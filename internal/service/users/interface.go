package users

import (
	"context"
	"time"

	"github.com/google/uuid"
	"github.com/ucl-arc-tre/portal/internal/controller/entra"
	openapi "github.com/ucl-arc-tre/portal/internal/openapi/web"
	"github.com/ucl-arc-tre/portal/internal/rbac"
	"github.com/ucl-arc-tre/portal/internal/types"
)

type Interface interface {
	ConfirmAgreement(user types.User, agreementId uuid.UUID) error
	ConfirmedAgreements(user types.User) ([]openapi.ConfirmedAgreement, error)
	Attributes(user types.User) (types.UserAttributes, error)
	SetUserChosenName(user types.User, chosenName types.ChosenName) (*openapi.ProfileUpdateResponse, error)
	ImportApprovedResearchersCSV(
		ctx context.Context,
		importer types.User,
		csvContent []byte,
		agreement types.Agreement,
	) error
	InviteUser(ctx context.Context, invite entra.Invite) (types.User, error)
	Metrics() (*openapi.UserMetrics, error)
	UpdateTraining(user types.User, data openapi.ProfileTrainingUpdate) (openapi.ProfileTrainingResponse, error)
	CreateTrainingRecord(user types.User, kind types.TrainingKind, completedAt time.Time) error
	TrainingRecords(user types.User) ([]openapi.TrainingRecord, error)
	TrainingExpiresAt(user types.User, kind types.TrainingKind) (*time.Time, error)
	PersistedUser(username types.Username) (types.User, error)
	PersistedExternalUser(username types.Username, email Email) (types.User, error)
	UserExistsWithEmailOrUsername(ctx context.Context, value string) (bool, error)
	IsStaff(ctx context.Context, user types.User) (bool, error)
	UserById(id uuid.UUID) (*types.User, error)
	UserByUsername(username types.Username) (*types.User, error)
	UserIds(usernames ...types.Username) (map[types.Username]uuid.UUID, error)
	Find(ctx context.Context, query string) ([]openapi.UserData, error)
	AllApprovedResearchers() ([]ApprovedResearcherExportRecord, error)
	UsersWithConfigRole(role rbac.ConfigRolename) ([]types.User, error)
}
