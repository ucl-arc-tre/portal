package studies

import (
	"context"
	"fmt"
	"strings"

	"github.com/google/uuid"
	"github.com/rs/zerolog/log"
	"github.com/ucl-arc-tre/portal/internal/types"
)

func (s *Service) ValidateContractMetadata(user types.User, formData types.Contract) error {
	if strings.TrimSpace(formData.UCLSignatory) == "" {
		return types.NewErrServerError("UCL signatory is required")
	}

	if strings.TrimSpace(formData.ThirdPartyName) == "" {
		return types.NewErrServerError("third party name is required")
	}

	if strings.TrimSpace(formData.Status) == "" {
		return types.NewErrServerError("contract status is required")
	}

	if formData.Status != "proposed" && formData.Status != "active" && formData.Status != "expired" {
		return types.NewErrServerError("status must be proposed, active, or expired")
	}

	return nil
}

func (s *Service) StoreContract(
	ctx context.Context,
	pdfContractObj types.S3Object,
	contractMetadata types.Contract,
) error {
	log.Debug().Any("contractId", contractMetadata.ContractID).Msg("Storing contract")
	log.Debug().Any("pdf obj", pdfContractObj).Msg("pdf obj")

	// Start a database transaction
	tx := s.db.Begin()
	defer func() {
		if r := recover(); r != nil {
			tx.Rollback()
		}
	}()

	// Store the contract metadata in the database
	if err := tx.Create(&contractMetadata).Error; err != nil {
		tx.Rollback()
		return types.NewErrServerError(fmt.Errorf("failed to save contract metadata: %w", err))
	}

	// Store the PDF file in S3
	if err := s.s3.StoreObject(ctx, contractMetadata.ContractID, pdfContractObj); err != nil {
		tx.Rollback()
		return types.NewErrServerError(fmt.Errorf("failed to store contract file: %w", err))
	}

	// Commit the transaction
	if err := tx.Commit().Error; err != nil {
		return types.NewErrServerError(fmt.Errorf("failed to commit contract transaction: %w", err))
	}

	log.Debug().
		Str("filename", contractMetadata.Filename).
		Str("ucl_signatory", contractMetadata.UCLSignatory).
		Str("third_party", contractMetadata.ThirdPartyName).
		Str("status", contractMetadata.Status).
		Msg("Contract stored successfully")

	return nil
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
