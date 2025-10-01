package graceful

import (
	"net/http"
	"time"

	"github.com/ucl-arc-tre/portal/internal/config"
	xgraceful "github.com/ucl-arc-tre/x/pkg/graceful"
)

// Serve a http handler with graceful shutdown of connections
func Serve(handler http.Handler) {
	server := &http.Server{
		Addr:              config.ServerAddress(),
		Handler:           handler,
		ReadHeaderTimeout: 10 * time.Second,
	}
	xgraceful.Serve(server, config.ServerShutdownGraceDuration)
}
