package handler

import (
	"github.com/rs/zerolog/log"
	"github.com/ucl-arc-tre/portal/internal/service/agreements"
	"github.com/ucl-arc-tre/portal/internal/service/profile"
	"github.com/ucl-arc-tre/portal/internal/service/training"
)

type Handler struct {
	agreements *agreements.Service
	profile    *profile.Service
	training   *training.Service
}

func New() *Handler {
	log.Info().Msg("Creating handler")
	return &Handler{
		agreements: agreements.New(),
		profile:    profile.New(),
		training:   training.New(),
	}
}
