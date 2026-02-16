package tokens

import (
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestHasAllScopes(t *testing.T) {
	assert.True(t, Claims{}.HasAll([]Scope{}))
	assert.True(t, Claims{Scopes: []Scope{"a"}}.HasAll([]Scope{}))

	assert.False(t, Claims{Scopes: []Scope{}}.HasAll([]Scope{"a"}))
	assert.False(t, Claims{Scopes: []Scope{"a"}}.HasAll([]Scope{"a", "b"}))
	assert.False(t, Claims{Scopes: []Scope{"a", "c"}}.HasAll([]Scope{"a", "b", "c"}))
}
