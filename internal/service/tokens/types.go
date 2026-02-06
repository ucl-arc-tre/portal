package tokens

import (
	"crypto/ed25519"
	"slices"

	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"
	"github.com/ucl-arc-tre/portal/internal/types"
)

type Ed25519KeyPair struct {
	id         uuid.UUID
	privateKey ed25519.PrivateKey
	publicKey  ed25519.PublicKey
}

func mustMakeEd25519KeyPair() Ed25519KeyPair {
	public, private, err := ed25519.GenerateKey(nil)
	if err != nil {
		panic(err)
	}
	return Ed25519KeyPair{id: uuid.New(), publicKey: public, privateKey: private}
}

func (k Ed25519KeyPair) Kind() types.VerificationKeyKind {
	return types.VerificationKeyKindEd25519
}

type TokenId = uuid.UUID

type Scope = string

type Claims struct {
	Scopes []Scope `json:"scopes"`
	jwt.RegisteredClaims
}

func (c Claims) HasAll(required []Scope) bool {
	for _, scope := range required {
		if !slices.Contains(c.Scopes, scope) {
			return false
		}
	}
	return true
}
