package web

import (
	"github.com/rs/zerolog/log"
	"github.com/ucl-arc-tre/portal/internal/service/agreements"
	"github.com/ucl-arc-tre/portal/internal/service/users"
)

type Handler struct {
	agreements *agreements.Service
	users      *users.Service
}

func New() *Handler {
	log.Info().Msg("Creating handler")
	return &Handler{
		agreements: agreements.New(),
		users:      users.New(),
	}
}
