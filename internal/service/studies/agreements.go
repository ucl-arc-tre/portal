package studies

import (
	"github.com/google/uuid"
	"github.com/ucl-arc-tre/portal/internal/types"
)

// creates a signature record for a user confirming an agreement for a specific study
func (s *Service) ConfirmStudyAgreement(user types.User, studyID uuid.UUID, agreementID uuid.UUID) error {
	signature := types.StudyAgreementSignature{
		UserID:      user.ID,
		StudyID:     studyID,
		AgreementID: agreementID,
	}
	err := s.db.Where(&signature).FirstOrCreate(&signature).Error
	return types.NewErrFromGorm(err)
}

// returns all agreement signatures for a specific study and user
func (s *Service) GetStudyAgreementSignatureUsernames(studyID uuid.UUID) ([]types.Username, error) {
	studySignatures := []types.StudyAgreementSignature{}
	result := s.db.Preload("User").Where("study_id = ?", studyID).Find(&studySignatures)

	if result.Error != nil {
		return nil, types.NewErrFromGorm(result.Error)
	}

	usernames := []types.Username{}
	for _, signature := range studySignatures {
		usernames = append(usernames, signature.User.Username)
	}

	return usernames, nil
}
