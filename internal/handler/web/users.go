package web

import (
	"io"
	"net/http"
	"slices"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/rs/zerolog/log"
	"github.com/ucl-arc-tre/portal/internal/config"
	"github.com/ucl-arc-tre/portal/internal/middleware"
	openapi "github.com/ucl-arc-tre/portal/internal/openapi/web"
	"github.com/ucl-arc-tre/portal/internal/service/users"
	"github.com/ucl-arc-tre/portal/internal/types"

	"github.com/ucl-arc-tre/portal/internal/rbac"
)

func (h *Handler) GetUsers(ctx *gin.Context, _ openapi.GetUsersParams) {
	// for search, check entra then find matches in our db, based on user principal
	user := middleware.GetUser(ctx)
	isAdmin, err := rbac.HasRole(user, rbac.Admin)
	if err != nil {
		setError(ctx, err, "Failed to get roles for user")
		return
	}
	isTreOpsStaff, err := rbac.HasRole(user, rbac.TreOpsStaff)
	if err != nil {
		setError(ctx, err, "Failed to get roles for user")
		return
	}

	query := ctx.Query("find")
	log.Debug().Any("query", query).Msg("Searching for user")

	if isAdmin {
		// retrieve auth + agreements + training info
		if query != "" {
			people, err := h.users.SearchEntraForUsersAndMatch(ctx, query)
			if err != nil {
				setError(ctx, err, "Failed to get people")
				return
			}
			ctx.JSON(http.StatusOK, people)

		} else {
			people, err := h.users.AllUsers()
			if err != nil {
				setError(ctx, err, "Failed to get people")
				return
			}
			ctx.JSON(http.StatusOK, people)
		}

	} else if isTreOpsStaff {
		if query != "" {
			users, err := h.users.SearchEntraForUsersAndMatch(ctx, query)
			if err != nil {
				setError(ctx, err, "Failed to get people")
				return
			}

			people := []openapi.UserData{}

			for _, userData := range users {
				// only carry over users with approved researcher role
				if slices.Contains(userData.Roles, "approved_researcher") {
					people = append(people, userData)
				}
			}
			ctx.JSON(http.StatusOK, people)

		} else {
			// retrieve auth + agreements + training info
			people, err := h.users.AllApprovedResearcherUsers()
			if err != nil {
				setError(ctx, err, "Failed to get people")
				return
			}
			ctx.JSON(http.StatusOK, people)
		}

	} else {
		ctx.JSON(http.StatusInternalServerError, "Not implemented")
	}
}

func (h *Handler) PostUsersUserIdTraining(ctx *gin.Context, userId string) {
	var update openapi.UserTrainingUpdate
	if err := bindJSONOrSetError(ctx, &update); err != nil {
		return
	}

	trainingDate, err := time.Parse(config.TimeFormat, update.TrainingDate)
	if err != nil {
		setError(ctx, types.NewErrInvalidObject(err), "Failed to parse date")
		return
	}

	uid, err := uuid.Parse(userId)
	if err != nil {
		setError(ctx, types.NewErrInvalidObject(err), "Invalid uuid")
		return
	}
	user, err := h.users.UserById(uid)
	if err != nil {
		setError(ctx, err, "Failed to get person")
		return
	}

	switch update.TrainingKind {
	case openapi.TrainingKindNhsd:
		if err := h.users.CreateNHSDTrainingRecord(*user, trainingDate); err != nil {
			setError(ctx, err, "Failed to update training validity")
			return
		}
	default:
		panic("unsupported training kind")
	}

	ctx.JSON(http.StatusOK, openapi.TrainingRecord{
		Kind:        update.TrainingKind,
		CompletedAt: &update.TrainingDate,
		IsValid:     users.NHSDTrainingIsValid(trainingDate),
	})
}

func (h *Handler) PostUsersApprovedResearchersImportCsv(ctx *gin.Context) {
	content, err := io.ReadAll(ctx.Request.Body)
	if err != nil {
		setError(ctx, types.NewErrServerError(err), "Failed to read body")
		return
	}
	agreement, err := h.agreements.LatestApprovedResearcher()
	if err != nil {
		setError(ctx, err, "Failed to get approved researcher agreement")
		return
	}
	if err := h.users.ImportApprovedResearchersCSV(content, *agreement); err != nil {
		setError(ctx, err, "Failed to import")
		return
	}
	ctx.Status(http.StatusNoContent)
}

func (h *Handler) PostUsersInvite(ctx *gin.Context) {
	var invite openapi.PostUsersInviteJSONRequestBody
	if err := bindJSONOrSetError(ctx, &invite); err != nil {
		return
	}

	user := middleware.GetUser(ctx)
	attributes, err := h.users.Attributes(user)
	if err != nil {
		setError(ctx, err, "Failed to get user attributes")
		return
	}

	sponsor := types.Sponsor{
		Username:   user.Username,
		ChosenName: attributes.ChosenName,
	}

	invitedUser, err := h.users.PersistedUser(types.Username(invite.Email))
	if err != nil {
		setError(ctx, err, "Failed to get or create invitee")
		return
	}

	if _, err := h.users.CreateUserSponsorship(invitedUser.ID, user.ID); err != nil {
		setError(ctx, err, "Failed to connect sponsorship")
		return
	}

	if err := h.users.InviteUser(ctx, invite.Email, sponsor); err != nil {
		setError(ctx, err, "Failed to send invite")
		return
	}

	ctx.Status(http.StatusNoContent)
}
