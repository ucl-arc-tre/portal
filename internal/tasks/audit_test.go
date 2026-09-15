//go:build integration

package tasks

import (
	"bytes"
	"errors"
	"io"
	"testing"

	"github.com/google/uuid"
	"github.com/stretchr/testify/mock"
	"github.com/stretchr/testify/require"
	s3audit "github.com/ucl-arc-tre/portal/internal/controller/s3/audit"
	"github.com/ucl-arc-tre/portal/internal/testutils/mockdb"
	"github.com/ucl-arc-tre/portal/internal/types"
	"gorm.io/gorm"
)

type mockS3Audit struct {
	mock.Mock
}

func (m *mockS3Audit) Upload(batch s3audit.AuditBatch) error {
	return m.Called(batch).Error(0)
}

func TestUploadAuditLog(t *testing.T) {
	testCases := []struct {
		name       string
		eventCount int
		failBatch  int
	}{
		{name: "no pending events"},
		{name: "single event", eventCount: 1},
		{name: "multiple batches", eventCount: maxAuditEventBatchSize + 1},
		{name: "first batch fails", eventCount: 1, failBatch: 1},
		{name: "later batch fails", eventCount: maxAuditEventBatchSize + 1, failBatch: 2},
	}

	for _, tc := range testCases {
		t.Run(tc.name, func(t *testing.T) {
			db := mockdb.NewTestDBSchema(t, func(db *gorm.DB) error {
				return db.AutoMigrate(&types.User{}, &types.AuditEvent{})
			})
			user := types.User{Username: "audit-test@example.com"}
			require.NoError(t, db.Create(&user).Error)

			alreadyUploaded := types.AuditEvent{
				UserID:    user.ID,
				Operation: types.AuditOperationCreate,
				Body:      "already uploaded",
				Uploaded:  true,
			}
			require.NoError(t, db.Create(&alreadyUploaded).Error)

			events := make([]types.AuditEvent, tc.eventCount)
			for i := range events {
				events[i] = types.AuditEvent{
					UserID:    user.ID,
					Operation: types.AuditOperationUpdate,
					Object: types.AuditEventObject{
						ID:   uuid.New(),
						Type: types.AuditEventObjectTypeStudy,
					},
					Body: "audit body with a newline\nand \"quotes\"",
				}
			}
			if len(events) > 0 {
				require.NoError(t, db.Create(&events).Error)
			}
			// FindInBatches traverses events in primary-key order.
			require.NoError(t, db.Where("uploaded = false").Order("id").Find(&events).Error)

			controller := &mockS3Audit{}
			controller.Test(t)
			t.Cleanup(func() { controller.AssertExpectations(t) })

			uploadErr := errors.New("audit upload failed")
			for start, batchNumber := 0, 1; start < len(events); start, batchNumber = start+maxAuditEventBatchSize, batchNumber+1 {
				end := min(start+maxAuditEventBatchSize, len(events))
				var expected bytes.Buffer
				for _, event := range events[start:end] {
					// Set the expected user independently to verify the task preloads it.
					event.User = user
					data, err := event.Marshal()
					require.NoError(t, err)
					expected.Write(data)
					expected.WriteByte('\n')
				}
				var result error
				if batchNumber == tc.failBatch {
					result = uploadErr
				}
				controller.On("Upload", mock.MatchedBy(func(batch s3audit.AuditBatch) bool {
					return batch.BatchNumber == batchNumber
				})).Run(func(args mock.Arguments) {
					body, err := io.ReadAll(args.Get(0).(s3audit.AuditBatch).Body)
					require.NoError(t, err)
					require.Equal(t, expected.String(), string(body))
				}).Return(result).Once()
				if result != nil {
					break
				}
			}

			manager := &Manager{db: db, s3Audit: controller}
			err := manager.uploadAuditLog()
			if tc.failBatch > 0 {
				require.ErrorContains(t, err, uploadErr.Error())
			} else {
				require.NoError(t, err)
			}

			var persisted []types.AuditEvent
			require.NoError(t, db.Where("id != ?", alreadyUploaded.ID).Order("id").Find(&persisted).Error)
			require.Len(t, persisted, tc.eventCount)
			for i, event := range persisted {
				wantUploaded := tc.failBatch == 0 || i < (tc.failBatch-1)*maxAuditEventBatchSize
				require.Equal(t, wantUploaded, event.Uploaded, "event %s", event.ID)
			}
			require.NoError(t, db.First(&alreadyUploaded, alreadyUploaded.ID).Error)
			require.True(t, alreadyUploaded.Uploaded)

			if tc.failBatch == 0 {
				// A subsequent run must not upload these events again.
				require.NoError(t, manager.uploadAuditLog())
			}
		})
	}
}
