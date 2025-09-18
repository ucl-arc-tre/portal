package studies

import (
	"context"
	"fmt"
	"time"

	"github.com/google/uuid"
	"github.com/rs/zerolog/log"
	openapi "github.com/ucl-arc-tre/portal/internal/openapi/web"
	"github.com/ucl-arc-tre/portal/internal/types"
	"github.com/ucl-arc-tre/portal/internal/validation"
)

func (s *Service) ValidateContractMetadata(organisationSignatory string, thirdPartyName string, status string, expiryDateStr string) *openapi.ValidationError {
	if !validation.ContractNamePattern.MatchString(organisationSignatory) {
		return &openapi.ValidationError{
			ErrorMessage: "Organisation signatory must be between 2 and 100 characters",
		}
	}

	if !validation.ContractNamePattern.MatchString(thirdPartyName) {
		return &openapi.ValidationError{
			ErrorMessage: "Third party name must be between 2 and 100 characters",
		}
	}

	if status != "proposed" && status != "active" && status != "expired" {
		return &openapi.ValidationError{
			ErrorMessage: "Status must be proposed, active, or expired",
		}
	}

	if expiryDateStr == "" {
		return &openapi.ValidationError{
			ErrorMessage: "Expiry date is required",
		}
	}

	// Parse expiry date
	_, err := time.Parse(validation.DateFormat, expiryDateStr)
	if err != nil {
		return &openapi.ValidationError{
			ErrorMessage: "Invalid expiry date format",
		}
	}

	return nil
}

func (s *Service) StoreContract(
	ctx context.Context,
	pdfContractObj types.S3Object,
	contractMetadata types.Contract,
) error {
	log.Debug().Str("filename", contractMetadata.Filename).Msg("Storing contract")

	// Start a database transaction
	tx := s.db.Begin()
	defer func() {
		if r := recover(); r != nil {
			tx.Rollback()
		}
	}()

	// Store the contract metadata in the database first to generate an ID
	if err := tx.Create(&contractMetadata).Error; err != nil {
		tx.Rollback()
		return types.NewErrServerError(fmt.Errorf("failed to save contract metadata: %w", err))
	}

	log.Debug().Any("contractId", contractMetadata.ID).Msg("Contract metadata saved, proceeding with S3 storage")

	// Store the PDF file in S3 using the generated primary key ID from the database
	if err := s.s3.StoreObject(ctx, contractMetadata.ID, pdfContractObj); err != nil {
		tx.Rollback()
		return types.NewErrServerError(fmt.Errorf("failed to store contract file: %w", err))
	}

	// Commit the transaction
	if err := tx.Commit().Error; err != nil {
		return types.NewErrServerError(fmt.Errorf("failed to commit contract transaction: %w", err))
	}

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
