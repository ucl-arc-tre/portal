package testutil

import (
	"context"

	"github.com/ucl-arc-tre/portal/internal/controller/entra"
	openapi "github.com/ucl-arc-tre/portal/internal/openapi/web"
	"github.com/ucl-arc-tre/portal/internal/types"
)

type FakeEntra struct {
}

func (f *FakeEntra) IsStaffMember(ctx context.Context, username types.Username) (bool, error) {
	panic("not implemented")
}

func (f *FakeEntra) UserExists(ctx context.Context, username types.Username) (bool, error) {
	panic("not implemented")
}

func (f *FakeEntra) SendInvite(ctx context.Context, email string, sponsor types.Sponsor) (*entra.InvitedUserData, error) {
	panic("not implemented")
}

func (f *FakeEntra) AddtoInvitedUserGroup(ctx context.Context, user entra.InvitedUserData) error {
	panic("not implemented")
}

func (f *FakeEntra) FindUsernames(ctx context.Context, query string) ([]types.Username, error) {
	panic("not implemented")
}

func (f *FakeEntra) SendCustomInviteNotification(ctx context.Context, email string, sponsor types.Sponsor) error {
	panic("not implemented")
}

func (f *FakeEntra) SendExpiryNotification(ctx context.Context, emails []string, contract types.Contract, study types.Study) error {
	panic("not implemented")
}

func (f *FakeEntra) SendCustomStudyReviewNotification(ctx context.Context, emails []string, review openapi.StudyReview) error {
	panic("not implemented")
}
