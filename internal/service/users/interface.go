package users

import (
	"context"
	"time"

	"github.com/google/uuid"
	openapi "github.com/ucl-arc-tre/portal/internal/openapi/web"
	"github.com/ucl-arc-tre/portal/internal/types"
)

type Interface interface {
	ConfirmAgreement(user types.User, agreementId uuid.UUID) error
	ConfirmedAgreements(user types.User) ([]openapi.ConfirmedAgreement, error)
	Attributes(user types.User) (types.UserAttributes, error)
	SetUserChosenName(user types.User, chosenName types.ChosenName) error
	ImportApprovedResearchersCSV(
		ctx context.Context,
		importer types.User,
		csvContent []byte,
		agreement types.Agreement,
	) error
	InviteExternalUser(ctx context.Context, email string, inviter types.User) (types.User, error)
	CreateUserSponsorship(user types.User, sponsor types.User) (types.UserSponsorship, error)
	Metrics() (*openapi.UserMetrics, error)
	UpdateTraining(user types.User, data openapi.ProfileTrainingUpdate) (openapi.ProfileTrainingResponse, error)
	CreateNHSDTrainingRecord(user types.User, completedAt time.Time) error
	TrainingRecords(user types.User) ([]openapi.TrainingRecord, error)
	NHSDTrainingExpiresAt(user types.User) (*time.Time, error)
	PersistedUser(username types.Username) (types.User, error)
	PersistedExternalUser(username types.Username, email Email) (types.User, error)
	UserExistsWithEmailOrUsername(ctx context.Context, value string) (bool, error)
	IsStaff(ctx context.Context, user types.User) (bool, error)
	UserById(id uuid.UUID) (*types.User, error)
	UserByUsername(username types.Username) (*types.User, error)
	UserIds(usernames ...types.Username) (map[types.Username]uuid.UUID, error)
	Find(ctx context.Context, query string) ([]openapi.UserData, error)
	AllApprovedResearchers() ([]ApprovedResearcherExportRecord, error)
}
