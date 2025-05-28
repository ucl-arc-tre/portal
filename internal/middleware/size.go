package middleware

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/ucl-arc-tre/portal/internal/config"
)

// Limit the body size of a request to mitigate OOM
func LimitBodySize(ctx *gin.Context) {
	ctx.Request.Body = http.MaxBytesReader(ctx.Writer, ctx.Request.Body, config.MaxUploadBytes)
}
