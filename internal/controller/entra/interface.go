package entra

import (
	"context"

	openapi "github.com/ucl-arc-tre/portal/internal/openapi/web"
	"github.com/ucl-arc-tre/portal/internal/types"
)

type Interface interface {
	IsStaffMember(ctx context.Context, username types.Username) (bool, error)
	UserExists(ctx context.Context, username types.Username) (bool, error)
	SendInvite(ctx context.Context, email string, sponsor types.Sponsor, studyName *string, projectName *string) (*InvitedUserData, error)
	AddtoInvitedUserGroup(ctx context.Context, user InvitedUserData) error
	FindUsernames(ctx context.Context, query string) ([]types.Username, error)
	SendCustomInviteNotification(ctx context.Context, email string, sponsor types.Sponsor, studyName *string, projectName *string) error
	SendContractExpiryNotification(ctx context.Context, contract types.Contract, study types.Study) error
	SendTrainingExpiryNotification(ctx context.Context, email string, training types.UserTrainingRecord) error
	SendCustomStudyReviewNotification(ctx context.Context, emails []string, review openapi.StudyReview) error
	SendIaaAssignmentNotification(ctx context.Context, email string, studyTitle string) error
	SendStudySignoffExpiryNotification(ctx context.Context, email string, study types.Study) error
	SendAssetExpiryNotification(ctx context.Context, assets []types.Asset, study types.Study) error
}
