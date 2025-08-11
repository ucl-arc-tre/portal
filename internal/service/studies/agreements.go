package studies

import (
	"github.com/google/uuid"
	"github.com/ucl-arc-tre/portal/internal/config"
	openapi "github.com/ucl-arc-tre/portal/internal/openapi/web"
	"github.com/ucl-arc-tre/portal/internal/types"
)

// creates a signature record for a user confirming an agreement for a specific study
func (s *Service) ConfirmStudyAgreement(user types.User, studyID uuid.UUID, agreementID uuid.UUID) error {
	// Verify the study exists and the user has access to it
	_, err := s.StudyWithOwner(studyID, user)
	if err != nil {
		return err
	}

	signature := types.StudyAgreementSignature{
		UserID:      user.ID,
		StudyID:     studyID,
		AgreementID: agreementID,
	}

	result := s.db.Where(&signature).FirstOrCreate(&signature)
	if result.Error != nil {
		return types.NewErrServerError(result.Error)
	}

	return nil
}

// returns all agreement signatures for a specific study and user
func (s *Service) GetStudyAgreementSignatures(user types.User, studyID uuid.UUID) ([]openapi.ConfirmedAgreement, error) {
	// Verify the study exists and the user has access to it
	_, err := s.StudyWithOwner(studyID, user)
	if err != nil {
		return nil, err
	}

	var studySignatures []types.StudyAgreementSignature
	result := s.db.Where("user_id = ? AND study_id = ?", user.ID, studyID).
		Find(&studySignatures)

	if result.Error != nil {
		return nil, types.NewErrServerError(result.Error)
	}

	signatures := []openapi.ConfirmedAgreement{}
	for _, signature := range studySignatures {
		signatures = append(signatures, openapi.ConfirmedAgreement{
			AgreementType: openapi.AgreementTypeStudyOwner,
			ConfirmedAt:   signature.CreatedAt.Format(config.TimeFormat),
		})
	}

	return signatures, nil
}
