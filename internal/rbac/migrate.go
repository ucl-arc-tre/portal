package rbac

import (
	"github.com/google/uuid"
	"github.com/rs/zerolog/log"
	"github.com/ucl-arc-tre/portal/internal/graceful"
	"github.com/ucl-arc-tre/portal/internal/types"
	"gorm.io/gorm"
)

func runMigrations() {
	db := graceful.NewDB()
	migrateStudyAdmins(db)
	log.Debug().Msg("Migrated RBAC")
	// todo - create issue to remove rbac migrations
}

func migrateStudyAdmins(db *gorm.DB) {
	studyIds := []uuid.UUID{}
	if err := db.Model(&types.Study{}).Select("id").Find(&studyIds).Error; err != nil {
		panic(err)
	}
	log.Debug().Int("number", len(studyIds)).Msg("Found studies for study admin migration")

	for _, studyId := range studyIds {
		studyAdmins := []types.StudyAdmin{}
		if err := db.Preload("User").Where("study_id = ?", studyId).Find(&studyAdmins).Error; err != nil {
			panic(err)
		}
		log.Debug().Int("number", len(studyAdmins)).Str("studyId", studyId.String()).Msg("Found study admins for study admin migration")

		studyAdminRole := StudyRole{StudyID: studyId, Name: StudyOwner}
		for _, studyAdmin := range studyAdmins {
			if addedRole, err := AddRole(studyAdmin.User, studyAdminRole.RoleName()); err != nil {
				panic(err)
			} else if addedRole {
				log.Debug().Any("userId", studyAdmin.User).Msg("Added study owner role")
			}
		}
	}
}
