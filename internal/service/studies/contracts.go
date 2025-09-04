package studies

import (
	"context"

	"github.com/google/uuid"
	"github.com/rs/zerolog/log"
	"github.com/ucl-arc-tre/portal/internal/types"
)

func (s *Service) StoreContract(
	ctx context.Context,
	studyId uuid.UUID,
	assetId uuid.UUID,
	contractId uuid.UUID,
	obj types.S3Object,
) error {
	log.Debug().Any("contractId", contractId).Msg("Storing contract")

	err := s.s3.StoreObject(ctx, contractId, obj)
	// todo: save metadata inc. filename
	return err
}

func (s *Service) GetContract(ctx context.Context,
	studyId uuid.UUID,
	assetId uuid.UUID,
	contractId uuid.UUID,
) (types.S3Object, error) {
	log.Debug().Any("contractId", contractId).Msg("Getting contract")

	// todo: add metadata from database
	return s.s3.GetObject(ctx, contractId)
}
