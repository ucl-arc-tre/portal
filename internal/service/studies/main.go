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

// validate all study admin usernames and create/find corresponding users
func (s *Service) validateAndCreateStudyAdmins(ctx context.Context, studyData openapi.StudyCreateRequest) ([]types.User, *openapi.StudyCreateValidationError, error) {
	if len(studyData.AdditionalStudyAdminUsernames) == 0 {
		return []types.User{}, nil, nil
	}

	var validationErrorMessage []string
	studyAdminUsers := []types.User{}

	// Validate all study admin usernames (they must be staff members)
	for _, studyAdminUsername := range studyData.AdditionalStudyAdminUsernames {
		isStaff, err := s.entra.IsStaffMember(ctx, types.Username(studyAdminUsername))

		if err != nil {
			return nil, nil, types.NewErrServerError(fmt.Errorf("failed to validate employee status for %s: %w", studyAdminUsername, err))
		}

		if !isStaff {
			validationErrorMessage = append(validationErrorMessage, fmt.Sprintf("user %s is not a staff member", studyAdminUsername))
			continue
		}

		// All study admin usernames are valid, now find or create users
		user, _, err := s.users.PersistedUser(types.Username(studyAdminUsername))
		if err != nil {
			return nil, nil, types.NewErrServerError(fmt.Errorf("failed to create/find study admin '%s': %w", studyAdminUsername, err))
		}
		studyAdminUsers = append(studyAdminUsers, user)
	}

	if len(validationErrorMessage) > 0 {
		message := ""
		for _, msg := range validationErrorMessage {
			message += fmt.Sprintf("• %s\n\n", msg)
		}
		return nil, &openapi.StudyCreateValidationError{ErrorMessage: message}, nil
	}

	return studyAdminUsers, nil, nil
}

func (s *Service) validateStudyData(ctx context.Context, username types.Username, studyData openapi.StudyCreateRequest) (*openapi.StudyCreateValidationError, error) {
	titlePattern := regexp.MustCompile(`^\w[\w\s\-]{2,48}\w$`)
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
	isStaff, err := s.entra.IsStaffMember(ctx, username)
	if err != nil {
		return nil, types.NewErrServerError(fmt.Errorf("failed to check staff status for user %s: %w", username, err))
	}
	if !isStaff {
		return &openapi.StudyCreateValidationError{ErrorMessage: "user is not a staff member"}, nil
	}

	return nil, nil
}

func (s *Service) CreateStudy(ctx context.Context, user types.User, studyData openapi.StudyCreateRequest) (*openapi.StudyCreateValidationError, error) {
	studyFormValidationError, err := s.validateStudyData(ctx, user.Username, studyData)
	if err != nil {
		return nil, err
	}
	if studyFormValidationError != nil {
		return studyFormValidationError, nil
	}

	// Validate and create study admin users if any are provided
	studyAdminUsers, studyAdminValidationError, err := s.validateAndCreateStudyAdmins(ctx, studyData)
	if err != nil {
		return nil, err
	}
	if studyAdminValidationError != nil {
		return studyAdminValidationError, nil
	}

	err = s.createStudy(user, studyData, studyAdminUsers)
	if err != nil {
		return nil, err
	}

	return nil, nil
}

// GetStudies retrieves all studies that the user owns or has access to
func (s *Service) GetStudies(userID uuid.UUID) ([]types.Study, error) {
	var studies []types.Study

	// For now, only return studies owned by the user
	// This could be expanded later to include shared studies
	err := s.db.Preload("StudyAdmins.User").Where("owner_user_id = ?", userID).Find(&studies).Error
	return studies, types.NewErrServerError(err)
}

// GetStudyAssets retrieves all assets for a study,
// ensures that the user owns the study (this might be refactored later to allow shared access)
func (s *Service) GetStudyAssets(studyID uuid.UUID, userID uuid.UUID) ([]types.Asset, error) {
	// verify the user owns the study
	var count int64
	err := s.db.Model(&types.Study{}).Where("id = ? AND owner_user_id = ?", studyID, userID).Count(&count).Error
	if err != nil {
		return nil, types.NewErrServerError(err)
	}
	if count == 0 {
		return nil, types.NewNotFoundError(errors.New("study not found or access denied"))
	}

	// Get all assets for this study with their locations
	var assets []types.Asset
	if err := s.db.Preload("Locations").Where("study_id = ?", studyID).Find(&assets).Error; err != nil {
		return nil, err
	}

	return assets, nil
}

// handles the database transaction for creating a study and its admins
func (s *Service) createStudy(user types.User, studyData openapi.StudyCreateRequest, studyAdminUsers []types.User) error {
	// Start a transaction
	tx := s.db.Begin()
	defer func() {
		if r := recover(); r != nil {
			tx.Rollback()
		}
	}()

	dbStudy := types.Study{
		OwnerUserID:                user.ID,
		Title:                      studyData.Title,
		DataControllerOrganisation: studyData.DataControllerOrganisation,
		ApprovalStatus:             string(openapi.Incomplete), // Initial status is "Incomplete" until the contract and assets are created
	}

	dbStudy.Description = studyData.Description
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
	dbStudy.DataProtectionNumber = studyData.DataProtectionNumber
	dbStudy.InvolvesThirdParty = studyData.InvolvesThirdParty
	dbStudy.InvolvesExternalUsers = studyData.InvolvesExternalUsers
	dbStudy.InvolvesParticipantConsent = studyData.InvolvesParticipantConsent
	dbStudy.InvolvesIndirectDataCollection = studyData.InvolvesIndirectDataCollection
	dbStudy.InvolvesDataProcessingOutsideEea = studyData.InvolvesDataProcessingOutsideEea

	// Create the study
	if err := tx.Create(&dbStudy).Error; err != nil {
		tx.Rollback()
		return err
	}

	// Create StudyAdmin records for each study admin user
	for _, studyAdminUser := range studyAdminUsers {
		studyAdmin := types.StudyAdmin{
			StudyID: dbStudy.ID,
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
