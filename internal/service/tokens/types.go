package tokens

import (
	"slices"

	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"
)

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
