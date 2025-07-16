package studies

import (
	"github.com/google/uuid"
	"github.com/ucl-arc-tre/portal/internal/graceful"
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

func (s *Service) CreateStudy(userID uuid.UUID, studyData types.Study) (*types.Study, error) {
	studyData.OwnerUserID = userID

	if err := s.db.Create(&studyData).Error; err != nil {
		return nil, err
	}

	return &studyData, nil
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
