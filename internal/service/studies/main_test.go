///go:build !integration

package studies

import (
	"testing"
	"time"

	"github.com/google/uuid"
	"github.com/stretchr/testify/assert"
	openapi "github.com/ucl-arc-tre/portal/internal/openapi/web"
	"github.com/ucl-arc-tre/portal/internal/types"
	"gorm.io/gorm"
)

func TestContainsStudyAdminUser(t *testing.T) {
	studyAdmins := []types.StudyAdmin{}

	assert.False(t, containsStudyAdminUser(studyAdmins, types.User{}))
	assert.False(t, containsStudyAdminUser(studyAdmins, types.User{Model: types.Model{ID: uuid.New()}}))

	userId1 := uuid.New()
	studyAdmins = append(studyAdmins, types.StudyAdmin{UserID: userId1})
	assert.True(t, containsStudyAdminUser(studyAdmins, types.User{Model: types.Model{ID: userId1}}))
	assert.False(t, containsStudyAdminUser(studyAdmins, types.User{}))

	studyAdmins = []types.StudyAdmin{
		{UserID: userId1,
			ModelAuditable: types.ModelAuditable{
				DeletedAt: gorm.DeletedAt{Time: time.Now(), Valid: true},
			},
		},
	}
	assert.True(t, studyAdmins[0].IsDeleted())
	assert.False(t, containsStudyAdminUser(studyAdmins, types.User{Model: types.Model{ID: userId1}}))
}

func TestApprovalStateEquality(t *testing.T) {
	assert.Equal(t, types.StudyApprovalStatusApproved, string(openapi.StudyApprovalStatusApproved))
	assert.Equal(t, types.StudyApprovalStatusIncomplete, string(openapi.StudyApprovalStatusIncomplete))
	assert.Equal(t, types.StudyApprovalStatusPending, string(openapi.StudyApprovalStatusPending))
	assert.Equal(t, types.StudyApprovalStatusRejected, string(openapi.StudyApprovalStatusRejected))
}
