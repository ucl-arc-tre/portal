package studies

import (
	"context"
	"errors"
	"fmt"
	"regexp"
	"slices"
	"strings"

	"github.com/google/uuid"
	"github.com/rs/zerolog/log"
	"github.com/ucl-arc-tre/portal/internal/controller/entra"
	"github.com/ucl-arc-tre/portal/internal/controller/s3"
	"github.com/ucl-arc-tre/portal/internal/graceful"
	openapi "github.com/ucl-arc-tre/portal/internal/openapi/web"
	"github.com/ucl-arc-tre/portal/internal/rbac"
	"github.com/ucl-arc-tre/portal/internal/service/users"
	"github.com/ucl-arc-tre/portal/internal/types"
	"gorm.io/gorm"
)

const (
	maxNumberStudyAdmins = 5
)

var (
	titlePattern                = regexp.MustCompile(`^\w[\w\s\-]{2,48}\w$`)
	dataProtectionNumberPattern = regexp.MustCompile(`^\w+\/\d{4}\/\d{2}\/(?:(?:0[1-9])|(?:[1-9]\d{1,2}))$`)
	cagPattern                  = regexp.MustCompile(`^\d{2}/CAG/\d{4}$`)
	nhsePattern                 = regexp.MustCompile(`^DARS-NIC-\d{6}-\d{5}-\d{2}$`)
)

type Service struct {
	db    *gorm.DB
	entra *entra.Controller
	s3    *s3.Controller
	users *users.Service
}

func New() *Service {
	return &Service{
		db:    graceful.NewDB(),
		s3:    s3.New(),
		entra: entra.New(),
		users: users.New(),
	}
}

func (s *Service) validateAdmins(ctx context.Context, studyData openapi.StudyRequest) (*openapi.ValidationError, error) {
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
	return &openapi.ValidationError{ErrorMessage: errorMessage}, nil
}

func (s *Service) createStudyAdminUsers(studyData openapi.StudyRequest) ([]types.User, error) {
	admins := []types.User{}

	for _, studyAdminUsername := range studyData.AdditionalStudyAdminUsernames {
		user, err := s.users.PersistedUser(types.Username(studyAdminUsername))
		if err != nil {
			log.Err(err).Any("username", studyAdminUsername).Msg("Failed to get persisted user. Cannot create study admin")
			return admins, err
		}
		if !slices.Contains(admins, user) {
			admins = append(admins, user)
		}
	}
	return admins, nil
}

func (s *Service) ValidateStudyData(ctx context.Context, studyData openapi.StudyRequest, isUpdate bool) (*openapi.ValidationError, error) {
	if !titlePattern.MatchString(studyData.Title) {
		return &openapi.ValidationError{ErrorMessage: "study title must be 4-50 characters, start and end with a letter/number, and contain only letters, numbers, spaces, and hyphens"}, nil
	}

	if strings.TrimSpace(studyData.DataControllerOrganisation) == "" {
		return &openapi.ValidationError{ErrorMessage: "data_controller_organisation is required"}, nil
	}

	if studyData.Description != nil && len(*studyData.Description) > 255 {
		return &openapi.ValidationError{ErrorMessage: "study description must be 255 characters or less"}, nil
	}

	if studyData.IsDataProtectionOfficeRegistered != nil && *studyData.IsDataProtectionOfficeRegistered {
		if studyData.DataProtectionNumber == nil {
			return &openapi.ValidationError{ErrorMessage: "data protection registry ID, registration date, and registration number are required when registered with data protection office"}, nil
		}
		if !dataProtectionNumberPattern.MatchString(*studyData.DataProtectionNumber) {
			return &openapi.ValidationError{ErrorMessage: "data protection ID invalid format"}, nil
		}
	}

	if studyData.CagReference != nil && !cagPattern.MatchString(*studyData.CagReference) {
		return &openapi.ValidationError{ErrorMessage: "please adhere to the CAG Reference format"}, nil

	}

	if studyData.NhsEnglandReference != nil && !nhsePattern.MatchString(*studyData.NhsEnglandReference) {
		return &openapi.ValidationError{ErrorMessage: "please adhere to the CAG Reference format"}, nil
	}

	if len(studyData.AdditionalStudyAdminUsernames) > maxNumberStudyAdmins {
		return &openapi.ValidationError{ErrorMessage: fmt.Sprintf("must have fewer than %d study admins", maxNumberStudyAdmins)}, nil
	}

	maxExpectedStudies := 0
	if isUpdate {
		maxExpectedStudies = 1
	}

	// Check if the study title already exists
	var count int64
	err := s.db.Model(&types.Study{}).Where("LOWER(title) = LOWER(?)", studyData.Title).Count(&count).Error
	if err != nil {
		return nil, types.NewErrFromGorm(err, "failed to check for duplicate study title")
	}
	if count > int64(maxExpectedStudies) {
		return &openapi.ValidationError{ErrorMessage: fmt.Sprintf("a study with the title [%v] already exists", studyData.Title)}, nil
	}

	validationError, err := s.validateAdmins(ctx, studyData)
	if err != nil {
		return nil, err
	} else if validationError != nil {
		return validationError, nil
	}

	return nil, nil
}

func (s *Service) CreateStudy(ctx context.Context, owner types.User, studyData openapi.StudyRequest) (*openapi.ValidationError, error) {
	validationError, err := s.ValidateStudyData(ctx, studyData, false)
	if err != nil || validationError != nil {
		return validationError, err
	}

	studyAdminUsers, err := s.createStudyAdminUsers(studyData)
	if err != nil {
		return nil, err
	}

	if err := s.createStudy(owner, studyData, studyAdminUsers); err != nil {
		return nil, err
	}

	return nil, nil
}

// gets all studies (for admin access)
func (s *Service) AllStudies() ([]types.Study, error) {
	studies := []types.Study{}
	err := s.db.Preload("StudyAdmins.User").Preload("Owner").Find(&studies).Error
	return studies, types.NewErrFromGorm(err)
}

func (s *Service) PendingStudies() ([]types.Study, error) {
	studies := []types.Study{}
	err := s.db.Preload("StudyAdmins.User").Preload("Owner").Where("approval_status = ?", openapi.Pending).Find(&studies).Error

	return studies, types.NewErrFromGorm(err)
}

// StudiesById retrieves all studies that are in a list of ids
func (s *Service) StudiesById(ids ...uuid.UUID) ([]types.Study, error) {
	studies := []types.Study{}
	err := s.db.Preload("StudyAdmins.User").Preload("Owner").Where("id IN (?)", ids).Find(&studies).Error
	return studies, types.NewErrFromGorm(err)
}

// given a study and data from a request, line up the values
func setStudyFromStudyData(study *types.Study, studyData openapi.StudyRequest) {
	if studyData.Title != "" {
		study.Title = studyData.Title
	}
	study.Description = studyData.Description
	study.DataControllerOrganisation = studyData.DataControllerOrganisation
	study.InvolvesUclSponsorship = studyData.InvolvesUclSponsorship
	study.InvolvesCag = studyData.InvolvesCag
	if studyData.InvolvesCag != nil && !*studyData.InvolvesCag {
		study.CagReference = nil
	} else {
		study.CagReference = studyData.CagReference
	}
	study.InvolvesEthicsApproval = studyData.InvolvesEthicsApproval
	study.InvolvesHraApproval = studyData.InvolvesHraApproval
	if studyData.InvolvesHraApproval != nil && !*studyData.InvolvesHraApproval {
		study.IrasId = nil
	} else {
		study.IrasId = studyData.IrasId
	}
	study.IsNhsAssociated = studyData.IsNhsAssociated
	study.InvolvesNhsEngland = studyData.InvolvesNhsEngland
	if studyData.InvolvesNhsEngland != nil && !*studyData.InvolvesNhsEngland {
		study.NhsEnglandReference = nil
	} else {
		study.NhsEnglandReference = studyData.NhsEnglandReference
	}
	study.InvolvesMnca = studyData.InvolvesMnca
	study.RequiresDspt = studyData.RequiresDspt
	study.RequiresDbs = studyData.RequiresDbs
	study.IsDataProtectionOfficeRegistered = studyData.IsDataProtectionOfficeRegistered
	if studyData.IsDataProtectionOfficeRegistered != nil && !*studyData.IsDataProtectionOfficeRegistered {
		study.DataProtectionNumber = nil
	} else {
		study.DataProtectionNumber = studyData.DataProtectionNumber
	}
	study.InvolvesThirdParty = studyData.InvolvesThirdParty
	study.InvolvesExternalUsers = studyData.InvolvesExternalUsers
	study.InvolvesParticipantConsent = studyData.InvolvesParticipantConsent
	study.InvolvesIndirectDataCollection = studyData.InvolvesIndirectDataCollection
	study.InvolvesDataProcessingOutsideEea = studyData.InvolvesDataProcessingOutsideEea

}

func createStudyAdmins(users []types.User, tx *gorm.DB, study *types.Study) error {
	existingStudyAdmins := []types.StudyAdmin{}
	if err := tx.Unscoped().Preload("User").Where("study_id = ?", study.ID).Find(&existingStudyAdmins).Error; err != nil {
		return types.NewErrFromGorm(err, "failed to list study admins")
	}

	userIds := []uuid.UUID{}
	for _, user := range users {
		userIds = append(userIds, user.ID)
	}

	studyAdminRole := rbac.StudyRole{StudyID: study.ID, Name: rbac.StudyOwner}
	for _, studyAdmin := range existingStudyAdmins {
		studyAdminInRequested := slices.Contains(userIds, studyAdmin.UserID)
		if !studyAdminInRequested {
			log.Debug().Any("username", studyAdmin.User.Username).Msg("Deleting study admin")
			if err := tx.Delete(&studyAdmin).Error; err != nil {
				return types.NewErrFromGorm(err, "failed to delete study admin")
			}
			if _, err := rbac.RemoveRole(studyAdmin.User, studyAdminRole.RoleName()); err != nil {
				return err
			}
		}
		if studyAdminInRequested && studyAdmin.DeletedAt.Valid { // is currently deleted
			log.Debug().Any("username", studyAdmin.User.Username).Msg("Un-deleting study admin")
			if err := tx.Unscoped().Model(&studyAdmin).Update("deleted_at", nil).Error; err != nil {
				return types.NewErrFromGorm(err, "failed to undelete study admin")
			}
		}
	}

	for _, user := range users {
		studyAdmin := types.StudyAdmin{
			StudyID: study.ID,
			UserID:  user.ID,
		}
		if err := tx.Unscoped().Where("study_id = ? AND user_id = ?", study.ID, user.ID).FirstOrCreate(&studyAdmin).Error; err != nil {
			return types.NewErrFromGorm(err, "failed to create study admin")
		}
		if _, err := rbac.AddRole(user, studyAdminRole.RoleName()); err != nil {
			return err
		}
	}
	return nil
}

// handles the database transaction for creating a study and its admins
func (s *Service) createStudy(owner types.User, studyData openapi.StudyRequest, studyAdminUsers []types.User) error {
	// Start a transaction
	tx := s.db.Begin()
	defer graceful.RollbackTransactionOnPanic(tx)

	study := types.Study{
		OwnerUserID:    owner.ID,
		ApprovalStatus: string(openapi.Incomplete), // Initial status is "Incomplete" until the contract and assets are created
	}

	setStudyFromStudyData(&study, studyData)

	// Create the study
	if err := tx.Create(&study).Error; err != nil {
		tx.Rollback()
		return types.NewErrFromGorm(err)
	}

	if _, err := rbac.AddStudyOwnerRole(owner, study.ID); err != nil {
		tx.Rollback()
		return err
	}

	// Create StudyAdmin records for each study admin user
	if err := createStudyAdmins(studyAdminUsers, tx, &study); err != nil {
		tx.Rollback()
		return err
	}

	// Commit the transaction
	if err := tx.Commit().Error; err != nil {
		return types.NewErrFromGorm(err, "failed to commit create study transaction")
	}

	return nil
}

func (s *Service) UpdateStudyReview(id uuid.UUID, review openapi.StudyReview) error {
	result := s.db.Model(&types.Study{}).Where("id = ?", id).
		Update("approval_status", review.Status).
		Update("feedback", review.Feedback)
	return types.NewErrFromGorm(result.Error, "failed to update study review")
}

func (s *Service) UpdateStudy(id uuid.UUID, studyData openapi.StudyRequest) error {

	tx := s.db.Begin()
	defer graceful.RollbackTransactionOnPanic(tx)

	studies, err := s.StudiesById(id)
	if err != nil {
		return err
	} else if len(studies) == 0 {
		return types.NewNotFoundError("study not found")
	}
	study := studies[0]
	setStudyFromStudyData(&study, studyData)

	studyAdminUsers, err := s.createStudyAdminUsers(studyData)
	if err != nil {
		return err
	}

	if err := createStudyAdmins(studyAdminUsers, tx, &study); err != nil {
		return err
	}

	// .Select("*") allows setting values to nil
	if err := tx.Model(&study).Where("id = ?", id).Select("*").Updates(&study).Error; err != nil {
		tx.Rollback()
		return types.NewErrFromGorm(err, "failed to update study")
	}

	if err := tx.Commit().Error; err != nil {
		return types.NewErrFromGorm(err, "failed to commit update study transaction")
	}

	return nil
}

func (s *Service) SendReviewEmailNotification(ctx context.Context, studyUUID uuid.UUID, review openapi.StudyReview) error {

	studies, err := s.StudiesById(studyUUID)
	if err != nil {
		return err
	}

	// IAO + IAAs should be recipients
	recipients := []string{string(studies[0].Owner.Username)}
	for _, studyAdmin := range studies[0].StudyAdmins {
		recipients = append(recipients, string(studyAdmin.User.Username))
	}

	err = s.entra.SendCustomStudyReviewNotification(ctx, recipients, review)
	if err != nil {
		return err
	}
	return nil
}
