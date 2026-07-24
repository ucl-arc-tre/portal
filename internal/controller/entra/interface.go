package entra

import (
	"context"
	"html/template"

	"github.com/ucl-arc-tre/portal/internal/types"
)

type Interface interface {
	IsStaffMember(ctx context.Context, username types.Username) (bool, error)
	UserExists(ctx context.Context, username types.Username) (bool, error)
	UserEmail(ctx context.Context, username types.Username) (Email, error)
	SendInvite(ctx context.Context, invite Invite) (*InvitedUserData, error)
	AddtoInvitedUserGroup(ctx context.Context, user InvitedUserData) error
	FindUsernames(ctx context.Context, query string) ([]types.Username, error)
	SendCustomInviteNotification(ctx context.Context, invite Invite) error
	SendEmail(ctx context.Context, subject string, emails []Email, content template.HTML) error
}
