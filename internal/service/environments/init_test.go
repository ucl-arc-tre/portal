package environments

import (
	"testing"

	"github.com/stretchr/testify/assert"
	openapi "github.com/ucl-arc-tre/portal/internal/openapi/web"
)

func TestNames(t *testing.T) {
	assert.Equal(t, "ARC Trusted Research Environment", string(TRE), "name is immutable")
	assert.Equal(t, "Data Safe Haven", string(DSH), "name is immutable")
}

func TestNameEqualityOpenaopi(t *testing.T) {
	assert.Equal(t, string(TRE), openapi.ARCTrustedResearchEnvironment)
	assert.Equal(t, string(DSH), openapi.DataSafeHaven)
}
