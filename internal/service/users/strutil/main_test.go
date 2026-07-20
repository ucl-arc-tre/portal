package strutil

import (
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestLevenshteinSimilarity(t *testing.T) {
	actual := LevenshteinSimilarity("rollbook", "back")
	assert.InDelta(t, 0.25, actual, 0.0001)
}
