package handler

import (
	"fmt"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/ucl-arc-tre/portal/internal/config"
	"github.com/ucl-arc-tre/portal/internal/middleware"
	openapi "github.com/ucl-arc-tre/portal/internal/openapi/web"
	"github.com/ucl-arc-tre/portal/internal/service/users"
)

func (h *Handler) UpdateUserTrainingDate(ctx *gin.Context, userId string, trainingKind openapi.TrainingKind) {
	var updatedDate openapi.TrainingValidFromDate
	if err := ctx.ShouldBindJSON(&updatedDate); err != nil {
		setInvalid(ctx, err, "Invalid JSON object")
		return
	}

	parsedTrainingDate, err := time.Parse(config.TimeFormat, updatedDate.TrainingValidFromDate)
	if err != nil {
		setInvalid(ctx, err, fmt.Sprintf("Failed to parse date [%v]", updatedDate.TrainingValidFromDate))
		return
	}

	user, err := h.users.GetUser(userId)
	if err != nil {
		setServerError(ctx, err, "Failed to get user")
		return
	}

	switch trainingKind {
	case openapi.TrainingKindNhsd:
		if err := h.users.CreateNHSDTrainingRecord(user, parsedTrainingDate); err != nil {
			setServerError(ctx, err, "Failed to update training validity")
			return
		}
	default:
		panic("unsupported training kind")
	}

	ctx.JSON(http.StatusOK, openapi.TrainingRecord{
		Kind:        trainingKind,
		CompletedAt: &updatedDate.TrainingValidFromDate,
		IsValid:     users.NHSDTrainingIsValid(parsedTrainingDate),
	})
}

// GetProfileTraining retrieves the training status of the user.
func (h *Handler) GetProfileTraining(ctx *gin.Context) {
	user := middleware.GetUser(ctx)
	status, err := h.users.GetTrainingStatus(user)
	if err != nil {
		setServerError(ctx, err, "Failed to get training status")
		return
	}
	ctx.JSON(http.StatusOK, status)
}

// PostProfileTraining updates the user's training status.
func (h *Handler) PostProfileTraining(ctx *gin.Context) {
	user := middleware.GetUser(ctx)
	data := openapi.ProfileTrainingUpdate{}
	if err := ctx.ShouldBindJSON(&data); err != nil {
		setInvalid(ctx, err, "Invalid JSON object")
		return
	}
	result, err := h.users.UpdateTraining(user, data)
	if err != nil {
		setServerError(ctx, err, "Failed to update users training")
		return
	}
	ctx.JSON(http.StatusOK, result)
}
