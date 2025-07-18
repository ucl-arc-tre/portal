package studies

import (
	"errors"
	"strings"

	"github.com/google/uuid"
	"github.com/ucl-arc-tre/portal/internal/graceful"
	openapi "github.com/ucl-arc-tre/portal/internal/openapi/web"
	"github.com/ucl-arc-tre/portal/internal/types"
	"gorm.io/gorm"
)

type Service struct {
	db *gorm.DB
}

func New() *Service {
	return &Service{
		db: graceful.NewDB(),
	}
}

func (s *Service) CreateStudy(userID uuid.UUID, studyData openapi.StudyCreateRequest) (*types.Study, error) {
	if strings.TrimSpace(studyData.Title) == "" {
		return nil, errors.New("study title is required")
	}

	if studyData.DataControllerOrganisation == nil || strings.TrimSpace(string(*studyData.DataControllerOrganisation)) == "" {
		return nil, errors.New("data_controller_organisation is required")
	}

	if *studyData.DataControllerOrganisation != "UCL" && *studyData.DataControllerOrganisation != "Other" {
		return nil, errors.New("data_controller_organisation must be either 'UCL' or 'Other'")
	}

	if *studyData.DataControllerOrganisation == "Other" && (studyData.DataControllerOrganisationOther == nil || strings.TrimSpace(*studyData.DataControllerOrganisationOther) == "") {
		return nil, errors.New("data_controller_organisation_other is required when data_controller_organisation is 'Other'")
	}

	if len(studyData.Title) > 50 {
		return nil, errors.New("study title must be 50 characters or less")
	}

	if studyData.Description != nil && len(*studyData.Description) > 255 {
		return nil, errors.New("study description must be 255 characters or less")
	}

	dbStudy := types.Study{
		OwnerUserID: userID,
		Title:       studyData.Title,
		Controller:  string(*studyData.DataControllerOrganisation),
	}

	dbStudy.Description = studyData.Description
	dbStudy.Admin = studyData.AdminEmail
	dbStudy.ControllerOther = studyData.DataControllerOrganisationOther
	dbStudy.InvolvesUclSponsorship = studyData.InvolvesUclSponsorship
	dbStudy.InvolvesCag = studyData.InvolvesCag
	dbStudy.CagReference = studyData.CagReference
	dbStudy.InvolvesEthicsApproval = studyData.InvolvesEthicsApproval
	dbStudy.InvolvesHraApproval = studyData.InvolvesHraApproval
	dbStudy.IrasId = studyData.IrasId
	dbStudy.IsNhsAssociated = studyData.IsNhsAssociated
	dbStudy.InvolvesNhsEngland = studyData.InvolvesNhsEngland
	dbStudy.NhsEnglandReference = studyData.NhsEnglandReference
	dbStudy.InvolvesMnca = studyData.InvolvesMnca
	dbStudy.RequiresDspt = studyData.RequiresDspt
	dbStudy.RequiresDbs = studyData.RequiresDbs
	dbStudy.IsDataProtectionOfficeRegistered = studyData.IsDataProtectionOfficeRegistered
	dbStudy.DataProtectionPrefix = studyData.DataProtectionPrefix
	dbStudy.DataProtectionDate = studyData.DataProtectionDate
	dbStudy.DataProtectionId = studyData.DataProtectionId
	dbStudy.DataProtectionNumber = studyData.DataProtectionNumber
	dbStudy.InvolvesThirdParty = studyData.InvolvesThirdParty
	dbStudy.InvolvesExternalUsers = studyData.InvolvesExternalUsers
	dbStudy.InvolvesParticipantConsent = studyData.InvolvesParticipantConsent
	dbStudy.InvolvesIndirectDataCollection = studyData.InvolvesIndirectDataCollection
	dbStudy.InvolvesDataProcessingOutsideEea = studyData.InvolvesDataProcessingOutsideEea

	if err := s.db.Create(&dbStudy).Error; err != nil {
		return nil, err
	}

	return &dbStudy, nil
}

// GetStudies retrieves all studies that the user owns or has access to
func (s *Service) GetStudies(userID uuid.UUID) ([]types.Study, error) {
	var studies []types.Study

	// For now, only return studies owned by the user
	// This could be expanded later to include shared studies
	if err := s.db.Where("owner_user_id = ?", userID).Find(&studies).Error; err != nil {
		return nil, err
	}

	return studies, nil
}

// GetStudyAssets retrieves all assets for a study,
// ensures that the user owns the study (this might be refactored later to allow shared access)
func (s *Service) GetStudyAssets(studyID uuid.UUID, userID uuid.UUID) ([]types.Asset, error) {
	// verify the user owns the study
	var study types.Study
	if err := s.db.Where("id = ? AND owner_user_id = ?", studyID, userID).First(&study).Error; err != nil {
		return nil, err
	}

	// Get all assets for this study with their locations
	var assets []types.Asset
	if err := s.db.Preload("Locations").Where("study_id = ?", studyID).Find(&assets).Error; err != nil {
		return nil, err
	}

	return assets, nil
}
