package handler

import (
	"github.com/rs/zerolog/log"
	"github.com/ucl-arc-tre/portal/internal/service/agreements"
)

type Handler struct {
	agreements *agreements.Service
}

func New() *Handler {
	log.Info().Msg("Creating handler")
	return &Handler{agreements: agreements.New()}
}
