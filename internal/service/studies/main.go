package studies

import (
	"context"
	"errors"
	"fmt"
	"regexp"
	"strings"

	"github.com/google/uuid"
	"github.com/ucl-arc-tre/portal/internal/controller/entra"
	"github.com/ucl-arc-tre/portal/internal/graceful"
	openapi "github.com/ucl-arc-tre/portal/internal/openapi/web"
	"github.com/ucl-arc-tre/portal/internal/service/users"
	"github.com/ucl-arc-tre/portal/internal/types"
	"gorm.io/gorm"
)

var (
	titlePattern = regexp.MustCompile(`^\w[\w\s\-]{2,48}\w$`)
)

type Service struct {
	db    *gorm.DB
	entra *entra.Controller
	users *users.Service
}

func New() *Service {
	return &Service{
		db:    graceful.NewDB(),
		entra: entra.New(),
		users: users.New(),
	}
}

func (s *Service) validateAdmins(ctx context.Context, studyData openapi.StudyCreateRequest) (*openapi.StudyCreateValidationError, error) {
	errorMessage := ""
	for _, studyAdminUsername := range studyData.AdditionalStudyAdminUsernames {
		isStaff, err := s.entra.IsStaffMember(ctx, types.Username(studyAdminUsername))

		if errors.Is(err, types.ErrNotFound) {
			errorMessage += fmt.Sprintf("• User '%s' not found in directory\n\n", studyAdminUsername)
		} else if err != nil {
			return nil, types.NewErrServerError(fmt.Errorf("failed to validate employee status for %s: %w", studyAdminUsername, err))
		} else if !isStaff {
			errorMessage += fmt.Sprintf("• User '%s' is not a staff member\n\n", studyAdminUsername)
		}
	}
	if errorMessage == "" {
		return nil, nil
	}
	return &openapi.StudyCreateValidationError{ErrorMessage: errorMessage}, nil
}

func (s *Service) createStudyAdmins(studyData openapi.StudyCreateRequest) ([]types.User, error) {
	admins := []types.User{}

	for _, studyAdminUsername := range studyData.AdditionalStudyAdminUsernames {
		user, _, err := s.users.PersistedUser(types.Username(studyAdminUsername))
		if err != nil {
			return admins, types.NewErrServerError(fmt.Errorf("failed to create/find study admin '%s': %w", studyAdminUsername, err))
		}
		admins = append(admins, user)
	}
	return admins, nil
}

func (s *Service) validateStudyData(ctx context.Context, owner types.User, studyData openapi.StudyCreateRequest) (*openapi.StudyCreateValidationError, error) {
	if !titlePattern.MatchString(studyData.Title) {
		return &openapi.StudyCreateValidationError{ErrorMessage: "study title must be 4-50 characters, start and end with a letter/number, and contain only letters, numbers, spaces, and hyphens"}, nil
	}

	if strings.TrimSpace(studyData.DataControllerOrganisation) == "" {
		return &openapi.StudyCreateValidationError{ErrorMessage: "data_controller_organisation is required"}, nil
	}

	if studyData.Description != nil && len(*studyData.Description) > 255 {
		return &openapi.StudyCreateValidationError{ErrorMessage: "study description must be 255 characters or less"}, nil
	}

	if studyData.IsDataProtectionOfficeRegistered != nil {
		if studyData.DataProtectionNumber == nil || strings.TrimSpace(*studyData.DataProtectionNumber) == "" {
			return &openapi.StudyCreateValidationError{ErrorMessage: "data protection registry ID, registration date, and registration number are required when registered with data protection office"}, nil
		}
	}

	// Check if the study title already exists
	var count int64
	err := s.db.Model(&types.Study{}).Where("title = ?", studyData.Title).Count(&count).Error
	if err != nil {
		return nil, types.NewErrServerError(fmt.Errorf("failed to check for duplicate study title: %w", err))
	}
	if count > 0 {
		return &openapi.StudyCreateValidationError{ErrorMessage: fmt.Sprintf("a study with the title [%v] already exists", studyData.Title)}, nil
	}

	// Check if the study submitter (the owner-user-id) is a valid staff member
	isStaff, err := s.entra.IsStaffMember(ctx, owner.Username)
	if err != nil {
		return nil, types.NewErrServerError(fmt.Errorf("failed to check staff status for user %s: %w", owner.Username, err))
	} else if !isStaff {
		return &openapi.StudyCreateValidationError{ErrorMessage: "owner is not a staff member"}, nil
	}

	validationError, err := s.validateAdmins(ctx, studyData)
	if err != nil {
		return nil, err
	} else if validationError != nil {
		return validationError, nil
	}

	return nil, nil
}

func (s *Service) CreateStudy(ctx context.Context, owner types.User, studyData openapi.StudyCreateRequest) (*openapi.StudyCreateValidationError, error) {
	validationError, err := s.validateStudyData(ctx, owner, studyData)
	if err != nil {
		return nil, err
	} else if validationError != nil {
		return validationError, nil
	}

	studyAdmins, err := s.createStudyAdmins(studyData)
	if err != nil {
		return nil, err
	}

	err = s.createStudy(owner, studyData, studyAdmins)
	if err != nil {
		return nil, err
	}

	return nil, nil
}

// StudiesWithOwner retrieves all studies that the user owns or has access to
func (s *Service) StudiesWithOwner(owner types.User) ([]types.Study, error) {
	studies := []types.Study{}

	// For now, only return studies owned by the user
	// This could be expanded later to include shared studies
	err := s.db.Preload("StudyAdmins.User").Where("owner_user_id = ?", owner.ID).Find(&studies).Error
	return studies, types.NewErrServerError(err)
}

// StudyAssetsWithOwner retrieves all assets for a study,
// ensures that the user owns the study (this might be refactored later to allow shared access)
func (s *Service) StudyAssetsWithOwner(studyID uuid.UUID, owner types.User) ([]types.Asset, error) {
	// verify the user owns the study
	var count int64
	err := s.db.Model(&types.Study{}).Where("id = ? AND owner_user_id = ?", studyID, owner.ID).Count(&count).Error
	if err != nil {
		return nil, types.NewErrServerError(err)
	}
	if count == 0 {
		return nil, types.NewNotFoundError("study not found or access denied")
	}

	// Get all assets for this study with their locations
	var assets []types.Asset
	if err := s.db.Preload("Locations").Where("study_id = ?", studyID).Find(&assets).Error; err != nil {
		return nil, err
	}

	return assets, nil
}

// handles the database transaction for creating a study and its admins
func (s *Service) createStudy(owner types.User, studyData openapi.StudyCreateRequest, studyAdminUsers []types.User) error {
	// Start a transaction
	tx := s.db.Begin()
	defer func() {
		if r := recover(); r != nil {
			tx.Rollback()
		}
	}()

	study := types.Study{
		OwnerUserID:                owner.ID,
		Title:                      studyData.Title,
		DataControllerOrganisation: studyData.DataControllerOrganisation,
		ApprovalStatus:             string(openapi.Incomplete), // Initial status is "Incomplete" until the contract and assets are created
	}

	study.Description = studyData.Description
	study.InvolvesUclSponsorship = studyData.InvolvesUclSponsorship
	study.InvolvesCag = studyData.InvolvesCag
	study.CagReference = studyData.CagReference
	study.InvolvesEthicsApproval = studyData.InvolvesEthicsApproval
	study.InvolvesHraApproval = studyData.InvolvesHraApproval
	study.IrasId = studyData.IrasId
	study.IsNhsAssociated = studyData.IsNhsAssociated
	study.InvolvesNhsEngland = studyData.InvolvesNhsEngland
	study.NhsEnglandReference = studyData.NhsEnglandReference
	study.InvolvesMnca = studyData.InvolvesMnca
	study.RequiresDspt = studyData.RequiresDspt
	study.RequiresDbs = studyData.RequiresDbs
	study.IsDataProtectionOfficeRegistered = studyData.IsDataProtectionOfficeRegistered
	study.DataProtectionNumber = studyData.DataProtectionNumber
	study.InvolvesThirdParty = studyData.InvolvesThirdParty
	study.InvolvesExternalUsers = studyData.InvolvesExternalUsers
	study.InvolvesParticipantConsent = studyData.InvolvesParticipantConsent
	study.InvolvesIndirectDataCollection = studyData.InvolvesIndirectDataCollection
	study.InvolvesDataProcessingOutsideEea = studyData.InvolvesDataProcessingOutsideEea

	// Create the study
	if err := tx.Create(&study).Error; err != nil {
		tx.Rollback()
		return err
	}

	// Create StudyAdmin records for each study admin user
	for _, studyAdminUser := range studyAdminUsers {
		studyAdmin := types.StudyAdmin{
			StudyID: study.ID,
			UserID:  studyAdminUser.ID,
		}
		if err := tx.Create(&studyAdmin).Error; err != nil {
			tx.Rollback()
			return fmt.Errorf("failed to create study admin: %w", err)
		}
	}

	// Commit the transaction
	if err := tx.Commit().Error; err != nil {
		return fmt.Errorf("failed to commit transaction: %w", err)
	}

	return nil
}
