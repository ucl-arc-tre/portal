package entra

import (
	"context"

	openapi "github.com/ucl-arc-tre/portal/internal/openapi/web"
	"github.com/ucl-arc-tre/portal/internal/types"
)

type Interface interface {
	IsStaffMember(ctx context.Context, username types.Username) (bool, error)
	UserExists(ctx context.Context, username types.Username) (bool, error)
	SendInvite(ctx context.Context, email string, sponsor types.Sponsor) (*InvitedUserData, error)
	AddtoInvitedUserGroup(ctx context.Context, user InvitedUserData) error
	FindUsernames(ctx context.Context, query string) ([]types.Username, error)
	SendCustomInviteNotification(ctx context.Context, email string, sponsor types.Sponsor) error
	SendContractExpiryNotification(ctx context.Context, emails []string, contract types.Contract, study types.Study) error
	SendTrainingExpiryNotification(ctx context.Context, email string, training types.UserTrainingRecord) error
	SendCustomStudyReviewNotification(ctx context.Context, emails []string, review openapi.StudyReview) error
	SendIaaAssignmentNotification(ctx context.Context, emails []string, studyTitle string) error
}
