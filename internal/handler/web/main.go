package web

import (
	"net/http"
	"net/url"

	"github.com/gin-gonic/gin"
	"github.com/rs/zerolog/log"
	"github.com/ucl-arc-tre/portal/internal/config"
	"github.com/ucl-arc-tre/portal/internal/service/agreements"
	"github.com/ucl-arc-tre/portal/internal/service/auth"
	"github.com/ucl-arc-tre/portal/internal/service/environments"
	"github.com/ucl-arc-tre/portal/internal/service/projects"
	"github.com/ucl-arc-tre/portal/internal/service/studies"
	"github.com/ucl-arc-tre/portal/internal/service/users"
)

type Handler struct {
	agreements   *agreements.Service
	users        *users.Service
	studies      *studies.Service
	auth         *auth.Service
	environments *environments.Service
	projects     *projects.Service
}

func New() *Handler {
	log.Info().Msg("Creating web handler")
	return &Handler{
		agreements:   agreements.New(),
		users:        users.New(),
		studies:      studies.New(),
		auth:         auth.New(),
		environments: environments.New(),
		projects:     projects.New(),
	}
}

func (h *Handler) GetLogout(ctx *gin.Context) {

	redirectQuery := url.QueryEscape(
		"https://login.microsoftonline.com/" +
			config.EntraCredentials().TenantID +
			"/oauth2/v2.0/logout?post_logout_redirect_uri=" +
			config.EntraInviteRedirectURL(),
	)
	ctx.Redirect(http.StatusFound, "/oauth2/sign_out?rd="+redirectQuery)
}
