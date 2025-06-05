package handler

import (
	"github.com/rs/zerolog/log"
	"github.com/ucl-arc-tre/portal/internal/service/agreements"
	"github.com/ucl-arc-tre/portal/internal/service/people"
	"github.com/ucl-arc-tre/portal/internal/service/profile"
)

type Handler struct {
	agreements *agreements.Service
	profile    *profile.Service
	people     *people.Service
}

func New() *Handler {
	log.Info().Msg("Creating handler")
	return &Handler{
		agreements: agreements.New(),
		profile:    profile.New(),
		people:     people.New(),
	}
}
