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
