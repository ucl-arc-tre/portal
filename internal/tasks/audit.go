package tasks

import (
	"io"

	"github.com/rs/zerolog/log"
	s3audit "github.com/ucl-arc-tre/portal/internal/controller/s3/audit"
	"github.com/ucl-arc-tre/portal/internal/types"
	"gorm.io/gorm"
)

const (
	maxAuditEventBatchSize = 10_000 // assume 1KB per event, so max is ~10,000 rows = 10 MB
)

func (m *Manager) uploadAuditLog() error {
	var auditEventCount int64
	if err := m.db.Model(&types.AuditEvent{}).Count(&auditEventCount).Error; err != nil {
		return types.NewErrFromGorm(err, "failed to count audit events")
	}

	events := []types.AuditEvent{}
	result := m.db.Preload("User").FindInBatches(&events, maxAuditEventBatchSize, func(_ *gorm.DB, batchNumber int) error {
		errChan := make(chan error, 1)
		pipeReader, pipeWriter := io.Pipe()
		defer func() {
			if err := pipeReader.Close(); err != nil {
				log.Err(err).Msg("Failed to close pipe reader")
			}
		}()
		batch := s3audit.AuditBatch{
			BatchNumber: batchNumber,
			Body:        pipeReader,
		}

		go func() { // async add events to data stream
			defer func() {
				if err := pipeWriter.Close(); err != nil {
					log.Err(err).Msg("Failed to close pipe writer")
				}
			}()

			for _, event := range events {
				eventData, err := event.Marshal()
				if err != nil {
					errChan <- err
					return
				}
				eventData = append(eventData, '\n')
				if _, err = pipeWriter.Write(eventData); err != nil {
					errChan <- err
					return
				}
			}
			errChan <- nil
		}()
		if err := m.s3Audit.Upload(batch); err != nil {
			return err
		}
		return <-errChan
	})

	return types.NewErrFromGorm(result.Error, "failed to find audit events in batches")
}
