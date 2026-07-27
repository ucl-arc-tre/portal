package verify

import (
	"crypto/ed25519"
	"sync"

	"github.com/rs/zerolog/log"
)

var (
	initOnce sync.Once
)

func init() {
	initOnce.Do(func() {
		cache = &Cache{
			verificationKey: newTokenLRU[ed25519.PublicKey](),
			isRevoked:       newTokenLRU[bool](),
		}
		log.Debug().Msg("Initisalised verify token caches")
	})
}
