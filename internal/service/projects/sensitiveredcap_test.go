package projects

import (
	"testing"

	"github.com/google/uuid"
	"github.com/stretchr/testify/require"
	"github.com/ucl-arc-tre/portal/internal/service/environments"
)

func TestValidateRedcapLinkIDs(t *testing.T) {
	tre, dsh, inaccessible := uuid.New(), uuid.New(), uuid.New()
	accessible := []GenericProject{
		{ID: tre, EnvironmentName: string(environments.TRE)},
		{ID: dsh, EnvironmentName: string(environments.DSH)},
	}
	for _, tc := range []struct {
		name    string
		ids     []string
		want    []uuid.UUID
		wantErr bool
	}{
		{name: "empty", want: nil},
		{name: "accessible", ids: []string{tre.String()}, want: []uuid.UUID{tre}},
		{name: "duplicate", ids: []string{tre.String(), tre.String()}, want: []uuid.UUID{tre}},
		{name: "wrong environment", ids: []string{dsh.String()}, wantErr: true},
		{name: "inaccessible", ids: []string{inaccessible.String()}, wantErr: true},
		{name: "malformed", ids: []string{"invalid"}, wantErr: true},
		{name: "mixed access", ids: []string{tre.String(), inaccessible.String()}, wantErr: true},
	} {
		t.Run(tc.name, func(t *testing.T) {
			got, err := validateRedcapLinkIDs(tc.ids, accessible, environments.TRE)
			if tc.wantErr {
				require.Error(t, err)
				require.Nil(t, got)
				return
			}
			require.NoError(t, err)
			require.Equal(t, tc.want, got)
		})
	}
	got, err := validateRedcapLinkIDs([]string{dsh.String()}, accessible, environments.DSH)
	require.NoError(t, err)
	require.Equal(t, []uuid.UUID{dsh}, got)
}
