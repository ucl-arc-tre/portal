package studies

import (
	"context"
	"errors"
	"fmt"
	"regexp"
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

var (
	titlePattern = regexp.MustCompile(`^\w[\w\s\-]{2,48}\w$`)
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

func (s *Service) createStudyAdmins(studyData openapi.StudyRequest) ([]types.User, error) {
	admins := []types.User{}

	for _, studyAdminUsername := range studyData.AdditionalStudyAdminUsernames {
		user, err := s.users.PersistedUser(types.Username(studyAdminUsername))
		if err != nil {
			log.Err(err).Any("username", studyAdminUsername).Msg("Failed to get persisted user. Cannot create study admin")
			return admins, err
		}
		found := false
		for _, admin := range admins {
			if admin == user {
				found = true
				break // User is already an admin, no need to add
			}
		}

		if !found {
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

	if studyData.IsDataProtectionOfficeRegistered != nil {
		if studyData.DataProtectionNumber == nil || strings.TrimSpace(*studyData.DataProtectionNumber) == "" {
			return &openapi.ValidationError{ErrorMessage: "data protection registry ID, registration date, and registration number are required when registered with data protection office"}, nil
		}
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

	studyAdmins, err := s.createStudyAdmins(studyData)
	if err != nil {
		return nil, err
	}

	study, err := s.createStudy(owner, studyData, studyAdmins)
	if err != nil {
		return nil, err
	}
	if _, err := rbac.AddStudyOwnerRole(owner, study.ID); err != nil {
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
	study.DataControllerOrganisation = studyData.DataControllerOrganisation
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

}

// handles the database transaction for creating a study and its admins
func (s *Service) createStudy(owner types.User, studyData openapi.StudyRequest, studyAdminUsers []types.User) (*types.Study, error) {
	// Start a transaction
	tx := s.db.Begin()
	defer func() {
		if r := recover(); r != nil {
			tx.Rollback()
		}
	}()

	study := types.Study{
		OwnerUserID:    owner.ID,
		ApprovalStatus: string(openapi.Incomplete), // Initial status is "Incomplete" until the contract and assets are created
	}

	setStudyFromStudyData(&study, studyData)

	// Create the study
	if err := tx.Create(&study).Error; err != nil {
		tx.Rollback()
		return nil, types.NewErrFromGorm(err)
	}

	// Create StudyAdmin records for each study admin user
	for _, studyAdminUser := range studyAdminUsers {
		studyAdmin := types.StudyAdmin{
			StudyID: study.ID,
			UserID:  studyAdminUser.ID,
		}
		if err := tx.Where("study_id = ? AND user_id = ?", study.ID, studyAdminUser.ID).FirstOrCreate(&studyAdmin).Error; err != nil {
			tx.Rollback()
			return nil, types.NewErrFromGorm(err, "failed to create study admin")
		}
	}

	// Commit the transaction
	if err := tx.Commit().Error; err != nil {
		return nil, types.NewErrFromGorm(err, "failed to commit create study transaction")
	}

	return &study, nil
}

func (s *Service) UpdateStudyReview(id uuid.UUID, review openapi.StudyReview) error {
	study := types.Study{}
	feedback := review.Feedback
	status := review.Status

	result := s.db.Model(&study).Where("id = ?", id).Update("approval_status", status).Update("feedback", feedback)
	return types.NewErrFromGorm(result.Error, "failed to update study review")
}

func (s *Service) UpdateStudy(id uuid.UUID, studyData openapi.StudyRequest) error {
	studies, err := s.StudiesById(id)
	if err != nil {
		return err
	} else if len(studies) == 0 {
		return types.NewNotFoundError("study not found")
	}
	study := studies[0]
	setStudyFromStudyData(&study, studyData)

	studyAdmins, err := s.createStudyAdmins(studyData)
	if err != nil {
		return err
	}

	for _, studyAdminUser := range studyAdmins {
		studyAdmin := types.StudyAdmin{
			StudyID: study.ID,
			UserID:  studyAdminUser.ID,
		}
		if err := s.db.Where("study_id = ? AND user_id = ?", study.ID, studyAdminUser.ID).FirstOrCreate(&studyAdmin).Error; err != nil {
			return types.NewErrFromGorm(err, "failed to create study admin")
		}
	}

	result := s.db.Model(&study).Where("id = ?", id).Updates(&study)

	return types.NewErrFromGorm(result.Error)
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
	emails := strings.Join(recipients, ",")

	err = s.entra.SendCustomStudyReviewNotification(ctx, emails, review)
	if err != nil {
		return err
	}
	return nil
}
