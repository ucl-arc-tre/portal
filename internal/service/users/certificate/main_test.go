package certificate

import (
	"encoding/base64"
	"os"
	"testing"

	"github.com/stretchr/testify/assert"
	openapi "github.com/ucl-arc-tre/portal/internal/openapi/web"
)

func TestKind(t *testing.T) {
	content, err := os.ReadFile("testdata/valid_nhsd.pdf")
	assert.NoError(t, err)
	kind, err := Kind(base64.StdEncoding.EncodeToString(content))
	assert.NoError(t, err)
	assert.Equal(t, openapi.TrainingKindNhsd, kind)
}
