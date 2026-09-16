package tasks

import (
	"io"

	"github.com/rs/zerolog/log"
	s3audit "github.com/ucl-arc-tre/portal/internal/controller/s3/audit"
	"github.com/ucl-arc-tre/portal/internal/types"
	"gorm.io/gorm"
)

const (
	maxAuditEventBatchSize = 1_000 // assume 1KB per event, so max is ~1,000 rows = 1 MB
)

func (m *Manager) uploadAuditLog() error {
	events := []types.AuditEvent{}
	result := m.db.Preload("User").
		Where("uploaded = false").
		FindInBatches(&events, maxAuditEventBatchSize, func(tx *gorm.DB, batchNumber int) error {
			if err := m.uploadAuditLogBatch(events, batchNumber); err != nil {
				return err
			}
			for i, event := range events {
				event.Uploaded = true
				events[i] = event
			}
			return types.NewErrFromGorm(tx.Save(&events).Error, "failed to save")
		})
	if err := result.Error; err != nil {
		return types.NewErrFromGorm(result.Error, "failed to find audit events in batches")
	}
	return nil
}

func (m *Manager) uploadAuditLogBatch(events []types.AuditEvent, batchNumber int) error {
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
}
