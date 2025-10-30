package environments

import (
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestNames(t *testing.T) {
	assert.Equal(t, "ARC Trusted Research Environment", string(TRE), "name is immutable")
	assert.Equal(t, "Data Safe Haven", string(DSH), "name is immutable")
}
