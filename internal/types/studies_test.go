package types

import (
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestAssetDestroyed(t *testing.T) {
	assert.False(t, Asset{}.IsDestroyed())
	assert.False(t, Asset{Status: AssetStatusActive}.IsDestroyed())
	assert.True(t, Asset{Status: "destroyed"}.IsDestroyed())
}
