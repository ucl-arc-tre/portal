package studies

import (
	"context"
	"fmt"
	"strings"
	"time"

	"github.com/google/uuid"
	"github.com/rs/zerolog/log"
	"github.com/ucl-arc-tre/portal/internal/config"
	"github.com/ucl-arc-tre/portal/internal/controller/s3"
	openapi "github.com/ucl-arc-tre/portal/internal/openapi/web"
	"github.com/ucl-arc-tre/portal/internal/types"
	"github.com/ucl-arc-tre/portal/internal/validation"
)

func (s *Service) ValidateContractMetadata(contractData openapi.ContractUploadObject, filename string) *openapi.ValidationError {
	if !strings.HasSuffix(strings.ToLower(filename), ".pdf") {
		return &openapi.ValidationError{
			ErrorMessage: "Only PDF files are allowed",
		}
	}

	if !validation.ContractNamePattern.MatchString(contractData.OrganisationSignatory) {
		return &openapi.ValidationError{
			ErrorMessage: "Organisation signatory must be between 2 and 100 characters",
		}
	}

	if !validation.ContractNamePattern.MatchString(contractData.ThirdPartyName) {
		return &openapi.ValidationError{
			ErrorMessage: "Third party name must be between 2 and 100 characters",
		}
	}

	if openapi.ContractStatus(contractData.Status) != openapi.ContractStatusProposed &&
		openapi.ContractStatus(contractData.Status) != openapi.ContractStatusActive &&
		openapi.ContractStatus(contractData.Status) != openapi.ContractStatusExpired {
		return &openapi.ValidationError{
			ErrorMessage: "Status must be proposed, active, or expired",
		}
	}

	if contractData.StartDate == "" {
		return &openapi.ValidationError{
			ErrorMessage: "Start date is required",
		}
	}

	// Parse start date
	startDate, err := time.Parse(config.DateFormat, contractData.StartDate)
	if err != nil {
		return &openapi.ValidationError{
			ErrorMessage: "Invalid start date format",
		}
	}

	if contractData.ExpiryDate == "" {
		return &openapi.ValidationError{
			ErrorMessage: "Expiry date is required",
		}
	}

	// Parse expiry date
	expiryDate, err := time.Parse(config.DateFormat, contractData.ExpiryDate)
	if err != nil {
		return &openapi.ValidationError{
			ErrorMessage: "Invalid expiry date format",
		}
	}

	// Validate that start date is before expiry date
	if !startDate.Before(expiryDate) {
		return &openapi.ValidationError{
			ErrorMessage: "Start date must be before expiry date",
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
	metadata := s3.ObjectMetadata{
		Id:   contractMetadata.ID,
		Kind: s3.ContractKind,
	}
	if err := s.s3.StoreObject(ctx, metadata, pdfContractObj); err != nil {
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

	metadata := s3.ObjectMetadata{
		Id:   contractId,
		Kind: s3.ContractKind,
	}
	return s.s3.GetObject(ctx, metadata)
}
