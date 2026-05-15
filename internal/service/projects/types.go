package projects

import (
	"time"

	"github.com/google/uuid"
	"github.com/ucl-arc-tre/portal/internal/types"
	"gorm.io/gorm"
)

type GenericProject struct {
	ID              uuid.UUID
	StudyId         uuid.UUID
	CreatedAt       time.Time
	UpdatedAt       time.Time
	DeletedAt       gorm.DeletedAt
	Name            string
	CreatorUsername types.Username
	Status          string
	EnvironmentName string
}
