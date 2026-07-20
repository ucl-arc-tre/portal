package notifications

import (
	"context"

	"github.com/google/uuid"
	"github.com/ucl-arc-tre/portal/internal/types"
)

type Interface interface {
	Find(user types.User) ([]types.Notification, error)
	Read(id uuid.UUID, user types.User) error

	NotifyToCompleteProfile(user types.User) error
	NotifyContractExpiry(ctx context.Context, contract types.Contract, study types.Study) error
	NotifyTrainingExpiry(ctx context.Context, training types.UserTrainingRecord) error
	NotifyStudyReview(ctx context.Context, study types.Study, igOpsStaff []types.User) error
	NotifyIaaAssignment(ctx context.Context, iaa types.User, study types.Study) error
	NotifyStudySignoffExpiry(ctx context.Context, study types.Study) error
	NotifyAssetExpiry(ctx context.Context, assets []types.Asset, study types.Study) error
	NotifyOwnerChange(ctx context.Context, study types.Study, igOpsStaff []types.User) error
}
