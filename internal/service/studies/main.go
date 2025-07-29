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
func (s *Service) validateAndCreateStudyAdmins(ctx context.Context, studyAdminUsernames []types.Username) ([]types.User, error) {
	if len(studyAdminUsernames) == 0 {
		return []types.User{}, nil
	}

	validationErrors := []error{}
	studyAdminUsers := []types.User{}

	// Validate all study admin usernames (they must be staff members)
	for _, studyAdminUsername := range studyAdminUsernames {
		isStaff, err := s.entra.IsStaffMember(ctx, studyAdminUsername)

		if err != nil {
			validationErrors = append(validationErrors, fmt.Errorf("failed to validate employee status for %s: %w", studyAdminUsername, err))
			continue
		}
		if !isStaff {
			validationErrors = append(validationErrors, fmt.Errorf("user %s is not a staff member", studyAdminUsername))
			continue
		}

		// All study admin usernames are valid, now find or create users
		user, err := s.users.PersistedUser(types.Username(studyAdminUsername))
		if err != nil {
			return nil, fmt.Errorf("failed to create/find study admin '%s': %w", studyAdminUsername, err)
		}
		studyAdminUsers = append(studyAdminUsers, user)

	}

	if len(validationErrors) > 0 {
		return nil, types.NewErrInvalidObject(errors.Join(validationErrors...))
	}

	return studyAdminUsers, nil
}

func (s *Service) validateStudyData(ctx context.Context, username types.Username, studyData openapi.StudyCreateRequest) error {
	titlePattern := regexp.MustCompile(`^\w[\w\s\-]{2,48}\w$`)
	if !titlePattern.MatchString(studyData.Title) {
		return errors.New("study title must be 4-50 characters, start and end with a letter/number, and contain only letters, numbers, spaces, and hyphens")
	}

	if strings.TrimSpace(studyData.DataControllerOrganisation) == "" {
		return errors.New("data_controller_organisation is required")
	}

	if studyData.Description != nil && len(*studyData.Description) > 255 {
		return errors.New("study description must be 255 characters or less")
	}

	if studyData.IsDataProtectionOfficeRegistered != nil {
		if studyData.DataProtectionNumber == nil || strings.TrimSpace(*studyData.DataProtectionNumber) == "" {
			return errors.New("data protection registry ID, registration date, and registration number are required when registered with data protection office")
		}
	}

	// Check if the study submitter (the owner-user-id) is a valid staff member
	isStaff, err := s.entra.IsStaffMember(ctx, username)
	if err != nil {
		return fmt.Errorf("failed to check staff status for user %s: %w", username, err)
	}
	if !isStaff {
		return fmt.Errorf("user is not a staff member")
	}

	return nil
}

func (s *Service) CreateStudy(ctx context.Context, user types.User, studyData openapi.StudyCreateRequest) (*types.Study, error) {
	if err := s.validateStudyData(ctx, user.Username, studyData); err != nil {
		return nil, types.NewErrInvalidObject(err)
	}
	additionalStudyAdminUsernames := []types.Username{}
	for _, username := range studyData.AdditionalStudyAdminUsernames {
		additionalStudyAdminUsernames = append(additionalStudyAdminUsernames, types.Username(username))
	}

	// Validate and create study admin users if any are provided
	studyAdminUsers, err := s.validateAndCreateStudyAdmins(ctx, additionalStudyAdminUsernames)
	if err != nil {
		return nil, err
	}

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
		return nil, err
	}

	// Create StudyAdmin records for each study admin user
	for _, studyAdminUser := range studyAdminUsers {
		studyAdmin := types.StudyAdmin{
			StudyID: dbStudy.ID,
			UserID:  studyAdminUser.ID,
		}
		if err := tx.Create(&studyAdmin).Error; err != nil {
			tx.Rollback()
			return nil, fmt.Errorf("failed to create study admin: %w", err)
		}
	}

	// Commit the transaction
	if err := tx.Commit().Error; err != nil {
		return nil, fmt.Errorf("failed to commit transaction: %w", err)
	}

	// Reload the study with StudyAdmins populated
	var studyWithAdmins types.Study
	if err := s.db.Preload("StudyAdmins.User").First(&studyWithAdmins, dbStudy.ID).Error; err != nil {
		return nil, fmt.Errorf("failed to reload study with admins: %w", err)
	}

	return &studyWithAdmins, nil
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
	var study types.Study
	err := s.db.Where("id = ? AND owner_user_id = ?", studyID, userID).First(&study).Error
	if errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, types.NewNotFoundError(err)
	} else if err != nil {
		return nil, types.NewErrServerError(err)
	}

	// Get all assets for this study with their locations
	var assets []types.Asset
	if err := s.db.Preload("Locations").Where("study_id = ?", studyID).Find(&assets).Error; err != nil {
		return nil, err
	}

	return assets, nil
}
