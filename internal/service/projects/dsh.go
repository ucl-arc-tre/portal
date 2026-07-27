package projects

import (
	"bytes"
	"context"
	"encoding/csv"
	"io"
	"strconv"
	"strings"
	"time"

	"github.com/google/uuid"
	"github.com/rs/zerolog/log"
	"github.com/ucl-arc-tre/portal/internal/config"
	"github.com/ucl-arc-tre/portal/internal/rbac"
	"github.com/ucl-arc-tre/portal/internal/types"
)

func (s *Service) ProjectDSHById(projectId uuid.UUID) (*types.ProjectDSH, error) {
	var projectDSH types.ProjectDSH
	err := s.db.
		Preload("Project").
		Preload("Project.Study").
		Preload("RoleBindings.User").
		Where("project_id = ?", projectId).
		First(&projectDSH).Error
	return &projectDSH, types.NewErrFromGorm(err, "failed to retrieve project DSH data")
}

func (s *Service) ImportDSHShareMembers(csvContent []byte) error {
	records, err := dshMemberCSVRecords(csvContent)
	if err != nil {
		return err
	}
	dsh, err := s.environments.DSH()
	if err != nil {
		return err
	}

	studyCache := map[int]types.Study{} // caseref -> study

	tx := s.db.Begin()
	for _, record := range records {
		if record.IsExternal() {
			// NOTE: External members must be invited as approved researchers
			log.Warn().Str("email", record.MemEmailAddress).Msg("Skipping importing external in DSH share member")
			continue
		}
		ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
		defer cancel()

		var user *types.User
		likelyUsername := types.Username(record.Member + "@" + config.EntraTenantPrimaryDomain())
		if !likelyUsername.IsValid() {
			usernames, err := s.entra.FindUsernames(ctx, record.MemEmailAddress)
			if err != nil {
				tx.Rollback()
				return err
			} else if len(usernames) != 1 {
				return types.NewErrInvalidObject("failed to find user")
			}
			if persistedUser, err := s.users.PersistedUser(usernames[0]); err != nil {
				return err
			} else {
				user = &persistedUser
			}
		} else {
			user, err = s.users.UserByUsername(likelyUsername)
			if err != nil {
				return err
			}
		}

		study, inCache := studyCache[record.Caseref]
		if !inCache {
			dbStudy := types.Study{}
			// NOTE: should use service here, but will be deleted after import so going quick and dirty
			err := s.db.Where("caseref = ?", record.Caseref).First(&dbStudy).Error
			if err != nil {
				tx.Rollback()
				return types.NewErrFromGorm(err, "failed to find study")
			}
			studyCache[record.Caseref] = dbStudy
			study = dbStudy
		}

		// TODO - what happens when a share is deleted?
		project := types.Project{
			Name:          record.ShareName,
			CreatorUserID: study.OwnerUserID, // have to guess here
			StudyID:       study.ID,
			EnvironmentID: dsh.ID,
		}
		err := tx.Where("name = ?", record.ShareName).FirstOrCreate(&project).Error
		if err != nil {
			tx.Rollback()
			return types.NewErrFromGorm(err, "failed to create project")
		}
		projectDSH := types.ProjectDSH{
			ProjectID: project.ID,
			Status:    types.ProjectDSHStatusActive,
		}
		err = tx.Where("project_id = ?", project.ID).FirstOrCreate(&projectDSH).Error
		if err != nil {
			tx.Rollback()
			return types.NewErrFromGorm(err, "failed to create dshproject")
		}
		err = tx.Where("project_dsh_id = ? AND user_id = ?", projectDSH.ID, user.ID).
			Delete(&types.ProjectDSHRoleBinding{}).
			Error
		if err != nil {
			tx.Rollback()
			return types.NewErrFromGorm(err, "failed to clear dshproject role bindings")
		}

		if record.MemAccountEnabled && !record.MemAllDisabled {
			// TODO - set write permissions?
			readRoleBinding := types.ProjectDSHRoleBinding{
				ProjectDSHID: projectDSH.ID,
				UserID:       user.ID,
				Role:         types.ProjectDSHRoleNameRead,
			}
			if err := tx.Where(&readRoleBinding).FirstOrCreate(&readRoleBinding).Error; err != nil {
				tx.Rollback()
				return types.NewErrFromGorm(err, "failed to add dshproject role binding")
			}
			if record.MemOutboundRights {
				outboundRoleBinding := types.ProjectDSHRoleBinding{
					ProjectDSHID: projectDSH.ID,
					UserID:       user.ID,
					Role:         types.ProjectDSHRoleNameOutbound,
				}
				if err := tx.Where(&outboundRoleBinding).FirstOrCreate(&outboundRoleBinding).Error; err != nil {
					tx.Rollback()
					return types.NewErrFromGorm(err, "failed to add dshproject role bindings")
				}
			}
		}

		if _, err := rbac.AddProjectDshOwnerRole(study.ID, project.ID); err != nil {
			return err

		}
	}

	return types.NewErrFromGorm(tx.Commit().Error, "failed to commit project import tx")
}

func dshMemberCSVRecords(csvContent []byte) ([]DSHMemberImportRecord, error) {
	reader := csv.NewReader(bytes.NewReader(csvContent))
	records := []DSHMemberImportRecord{}
	raw, err := reader.Read()
	if err != nil {
		return records, types.NewErrServerError(err)
	}
	log.Debug().Any("header", raw).Msg("dshMemberCSVRecords")
	for {
		raw, err := reader.Read()
		if err == io.EOF {
			break
		} else if err != nil {
			return records, types.NewErrServerError(err)
		} else if len(raw) != 9 {
			return records, types.NewErrInvalidObjectF("failed to parse csv line %d != 9: %v", len(raw), raw)
		}
		// ShareName": Name of the 'share' == project
		// "Owner": DSH username of the share owner
		// "CaseRef": Caseref study identifier
		// "Member": DSH username of the user associated to the // project
		// "MemEmailAddress": Email address of the user, linkable // to the IdP for internal and external users
		// "MemAccountEnabled":
		// "MemAccountCreated": Date in DD/MM/YYYY format
		// "MemAllDisabled":
		// "MemOutboundRights":
		record := DSHMemberImportRecord{
			ShareName:       raw[0],
			Owner:           raw[1],
			Member:          raw[3],
			MemEmailAddress: raw[4],
		}
		if caseref, err := strconv.Atoi(raw[2]); err != nil {
			return records, types.NewErrInvalidObject(err)
		} else {
			record.Caseref = caseref
		}
		switch strings.ToLower(raw[5]) {
		case "true":
			record.MemAccountEnabled = true
		case "false":
			record.MemAccountEnabled = false
		default:
			return records, types.NewErrInvalidObjectF("MemAccountEnabled invalid on: %v", raw)
		}
		// raw[6] : MemAccountCreated
		switch strings.ToLower(raw[7]) {
		case "true":
			record.MemAllDisabled = true
		case "false":
			record.MemAllDisabled = false
		default:
			return records, types.NewErrInvalidObjectF("MemAllDisabled invalid on: %v", raw)
		}
		switch strings.ToLower(raw[8]) {
		case "true":
			record.MemOutboundRights = true
		case "false":
			record.MemOutboundRights = false
		default:
			return records, types.NewErrInvalidObjectF("MemOutboundRights invalid on: %v", raw)
		}
		records = append(records, record)
	}
	return records, nil
}
