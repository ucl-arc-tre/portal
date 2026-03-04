package tasks

import "github.com/rs/zerolog/log"

func exampleJob() error {
	log.Debug().Msg("Test job")
	return nil
}
