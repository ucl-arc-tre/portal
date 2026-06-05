package entra

import (
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestReplaceLastUnderscore(t *testing.T) {
	assert.Equal(t, "thing", replaceLastUnderscoreWithAtSymbol("thing"))
	assert.Equal(t, "thing@", replaceLastUnderscoreWithAtSymbol("thing_"))
	assert.Equal(t, "thi_ng@", replaceLastUnderscoreWithAtSymbol("thi_ng_"))
}

func TestUniqueStrings(t *testing.T) {
	assert.Len(t, unique([]string{}), 0)
	assert.Equal(t, []string{"a"}, unique([]string{"a"}))
	assert.Equal(t, []string{"a"}, unique([]string{"a", "a"}))
}
