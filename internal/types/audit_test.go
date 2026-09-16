package types

import (
	"fmt"
	"testing"
	"time"

	"github.com/google/uuid"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func TestAuditEventMarshal(t *testing.T) {
	name := "Example study"
	emptyName := ""
	tests := []struct {
		name       string
		objectName *string
		objectType AuditEventObjectType
		wantObject string
	}{
		{
			name:       "named study",
			objectName: &name,
			objectType: AuditEventObjectTypeStudy,
			wantObject: `{"ID":"22222222-2222-4222-8222-222222222222","Name":"Example study","Type":"study"}`,
		},
		{
			name:       "training record without a name",
			objectType: AuditEventObjectTypeTrainingRecord,
			wantObject: `{"ID":"22222222-2222-4222-8222-222222222222","Type":"training-record"}`,
		},
		{
			name:       "project with an explicitly empty name",
			objectName: &emptyName,
			objectType: AuditEventObjectTypeProject,
			wantObject: `{"ID":"22222222-2222-4222-8222-222222222222","Name":"","Type":"project"}`,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			event := AuditEvent{
				Model: Model{
					ID:        uuid.MustParse("11111111-1111-4111-8111-111111111111"),
					CreatedAt: time.Date(2026, time.January, 1, 1, 0, 0, 123456789, time.FixedZone("UTC+1", 3600)),
				},
				UserID:    uuid.MustParse("33333333-3333-4333-8333-333333333333"),
				User:      User{Username: "alice@example.com"},
				Operation: AuditOperationUpdate,
				Object: AuditEventObject{
					ID:   uuid.MustParse("22222222-2222-4222-8222-222222222222"),
					Name: tt.objectName,
					Type: tt.objectType,
				},
				Body:     "Changed \"owner\"\nSecond line",
				Uploaded: true,
			}

			data, err := event.Marshal()
			require.NoError(t, err)
			assert.JSONEq(t, fmt.Sprintf(`{
				"ID": "11111111-1111-4111-8111-111111111111",
				"At": 1767225600,
				"Username": "alice@example.com",
				"Operation": "update",
				"Object": %s,
				"Body": "Changed \"owner\"\nSecond line"
			}`, tt.wantObject), string(data))
		})
	}
}
