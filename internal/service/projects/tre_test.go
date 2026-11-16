package projects

import (
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestDesktopVolumeSize(t *testing.T) {
	for _, tc := range []struct {
		name      string
		existing  *uint
		requested *int
		want      *uint
		wantErr   bool
	}{
		{name: "unset", want: nil},
		{name: "omitted preserves existing", existing: new(uint(100)), want: new(uint(100))},
		{name: "initial size", requested: new(100), want: new(uint(100))},
		{name: "unchanged", existing: new(uint(100)), requested: new(100), want: new(uint(100))},
		{name: "increase", existing: new(uint(100)), requested: new(200), want: new(uint(200))},
		{name: "reduction", existing: new(uint(100)), requested: new(50), wantErr: true},
		{name: "zero reduction", existing: new(uint(100)), requested: new(0), wantErr: true},
		{name: "negative", requested: new(-1), wantErr: true},
	} {
		t.Run(tc.name, func(t *testing.T) {
			got, err := desktopVolumeSize(tc.existing, tc.requested)
			if tc.wantErr {
				assert.Error(t, err)
			} else {
				assert.NoError(t, err)
			}
			assert.Equal(t, tc.want, got)
		})
	}
}
