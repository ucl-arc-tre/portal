package graceful

import (
	"context"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/rs/zerolog/log"
	"github.com/ucl-arc-tre/portal/internal/config"
)

const (
	serverShutdownGraceDuration = 10 * time.Second
)

// Serve a http handler with graceful shutdown of connections
func Serve(handler http.Handler) {
	server := &http.Server{
		Addr:              config.ServerAddress(),
		Handler:           handler,
		ReadHeaderTimeout: 10 * time.Second,
	}

	go listenAndServe(server)
	log.Info().Msg("Started HTTP server")

	signalChan := make(chan os.Signal, 1)
	signal.Notify(signalChan, syscall.SIGINT, syscall.SIGTERM)
	<-signalChan
	log.Info().Msg("Recieved termination signal")

	ctx, cancel := context.WithTimeout(context.Background(), serverShutdownGraceDuration)
	defer cancel()
	log.Info().Msg("Closing server")
	if err := server.Shutdown(ctx); err != nil {
		log.Err(err).Msg("Server failed to shutdown")
	}
	log.Info().Msg("Server exited")
}

func listenAndServe(server *http.Server) {
	if err := server.ListenAndServe(); err != nil && err != http.ErrServerClosed {
		log.Err(err).Msg("Failed to serve")
	}
}
