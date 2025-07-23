package studies

import (
	"context"
	"errors"
	"fmt"
	"regexp"
	"strings"
	"time"

	"github.com/google/uuid"
	"github.com/ucl-arc-tre/portal/internal/controller/entra"
	"github.com/ucl-arc-tre/portal/internal/graceful"
	openapi "github.com/ucl-arc-tre/portal/internal/openapi/web"
	"github.com/ucl-arc-tre/portal/internal/types"
	"gorm.io/gorm"
)

type Service struct {
	db    *gorm.DB
	entra *entra.Controller
}

func New() *Service {
	return &Service{
		db:    graceful.NewDB(),
		entra: entra.New(1 * time.Hour),
	}
}

// check if a username exists in Entra and is a valid staff member
func (s *Service) validateUsername(ctx context.Context, username string) error {
	if username == "" {
		return errors.New("username cannot be empty")
	}

	userData, err := s.entra.UserData(ctx, types.Username(username))
	if err != nil {
		return fmt.Errorf("username '%s' not found in directory", username)
	}

	fmt.Println("entra userData:", userData) // Debugging line to check userData

	// if userData.EmployeeType == nil || *userData.EmployeeType == "" {
	// 	return fmt.Errorf("username '%s' does not have an employee type set", username)
	// }

	// if *userData.EmployeeType != "staff" {
	// 	return fmt.Errorf("username '%s' is not a valid staff member", username)
	// }

	return nil
}

// find a user in the database or create one if it doesn't exist
func (s *Service) findOrCreateUser(username string) (*types.User, error) {
	// find existing user
	var user types.User
	err := s.db.Where("username = ?", username).First(&user).Error
	if err == nil {
		return &user, nil
	}
	if !errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, fmt.Errorf("error querying user: %w", err)
	}

	// User doesn't exist, create new one
	user = types.User{
		Username: types.Username(username),
	}
	if err := s.db.Create(&user).Error; err != nil {
		return nil, fmt.Errorf("error creating user: %w", err)
	}

	return &user, nil
}

// validate all study admin usernames and create/find corresponding users
func (s *Service) validateAndCreateStudyAdmins(ctx context.Context, studyAdminUsernames []string) ([]types.User, error) {
	if len(studyAdminUsernames) == 0 {
		return []types.User{}, nil
	}

	// Validate all study admin usernames
	var validationErrors []string
	for _, studyAdminUsername := range studyAdminUsernames {
		if err := s.validateUsername(ctx, studyAdminUsername); err != nil {
			validationErrors = append(validationErrors, err.Error())
		}
	}

	if len(validationErrors) > 0 {
		return nil, fmt.Errorf("validation failed: %s", strings.Join(validationErrors, "; "))
	}

	// All study admin usernames are valid, now find or create users
	var studyAdminUsers []types.User
	for _, studyAdminUsername := range studyAdminUsernames {
		user, err := s.findOrCreateUser(studyAdminUsername)
		if err != nil {
			return nil, err
		}
		studyAdminUsers = append(studyAdminUsers, *user)
	}

	return studyAdminUsers, nil
}

func validateStudyData(studyData openapi.StudyCreateRequest) error {
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

	return nil
}

func (s *Service) CreateStudy(ctx context.Context, userID uuid.UUID, studyData openapi.StudyCreateRequest) (*types.Study, error) {
	if err := validateStudyData(studyData); err != nil {
		return nil, err
	}

	// Validate and create study admin users if any are provided
	studyAdminUsers, err := s.validateAndCreateStudyAdmins(ctx, studyData.AdditionalStudyAdminUsernames)
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
		OwnerUserID:                userID,
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
	if err := s.db.Preload("StudyAdmins.User").Where("owner_user_id = ?", userID).Find(&studies).Error; err != nil {
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
