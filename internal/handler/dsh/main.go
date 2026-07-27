package dsh

import (
	"bytes"
	"fmt"
	"io"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/rs/zerolog/log"
	"github.com/ucl-arc-tre/portal/internal/config"
	openapi "github.com/ucl-arc-tre/portal/internal/openapi/dsh"
	"github.com/ucl-arc-tre/portal/internal/service/projects"
	"github.com/ucl-arc-tre/portal/internal/service/studies"
	"github.com/ucl-arc-tre/portal/internal/service/users"
	"github.com/ucl-arc-tre/portal/internal/types"
)

type Handler struct {
	users    *users.Service
	studies  *studies.Service
	projects *projects.Service
}

func New() *Handler {
	log.Info().Msg("Creating DSH handler")
	return &Handler{users: users.New(), studies: studies.New(), projects: projects.New()}
}

func (h *Handler) GetPing(ctx *gin.Context) {
	ctx.JSON(http.StatusOK, openapi.Ping{Message: "pong"})
}

func (h *Handler) GetApprovedResearchers(ctx *gin.Context) {
	approvedResearchers, err := h.users.AllApprovedResearchers()
	if err != nil {
		setError(ctx, err, "Failed to get approved researchers")
		return
	}

	var b bytes.Buffer
	b.WriteString("username,agreed_at,training_expires\n")
	for _, r := range approvedResearchers {
		trainingExpires := r.NHSDTrainingCompletedAt.Add(config.TrainingValidity)
		fmt.Fprintf(&b, "%v,%v,%v\n",
			r.Username,
			marshalTime(r.AgreedToAgreementAt),
			marshalTime(trainingExpires),
		)
	}

	ctx.Data(http.StatusOK, "text/csv", b.Bytes())
}

func (h *Handler) GetApprovedStudies(ctx *gin.Context) {
	approvedStudies, err := h.studies.ApprovedStudies()
	if err != nil {
		setError(ctx, err, "Failed to get approved studies")
		return
	}

	var b bytes.Buffer
	b.WriteString("caseref,study_owner_username,study_admin_usernames\n")
	for _, study := range approvedStudies {
		fmt.Fprintf(&b, "%v,%v,%v\n",
			study.Caseref,
			study.OwnerUsername,
			study.AdminUsernames,
		)
	}

	ctx.Data(http.StatusOK, "text/csv", b.Bytes())
}

func (h *Handler) PostImportShareMembers(ctx *gin.Context) {
	content, err := io.ReadAll(ctx.Request.Body)
	if err != nil {
		setError(ctx, types.NewErrInvalidObject(err), "Failed to read body")
		return
	}

	if err := h.projects.ImportDSHShareMembers(content); err != nil {
		setError(ctx, err, "failed to import DSH members")
		return
	}

	ctx.Status(http.StatusNoContent)
}

func marshalTime(t time.Time) string {
	return t.Format(time.DateOnly) // e.g. "2006-01-02"
}
