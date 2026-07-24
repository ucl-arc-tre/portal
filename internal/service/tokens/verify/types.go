package verify

import (
	"crypto/ed25519"

	"github.com/hashicorp/golang-lru/v2/expirable"
	"github.com/ucl-arc-tre/portal/internal/service/tokens"
)

type Cache struct {
	verificationKey *expirable.LRU[tokens.TokenId, ed25519.PublicKey]
	isRevoked       *expirable.LRU[tokens.TokenId, bool]
}
