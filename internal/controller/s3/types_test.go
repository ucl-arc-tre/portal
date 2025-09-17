package s3

import (
	"testing"

	"github.com/google/uuid"
	"github.com/stretchr/testify/assert"
)

func TestObjectKey(t *testing.T) {
	id := "a14accc8-ec35-43a1-8291-139dff5a3e33"
	meta := ObjectMetadata{
		Id:   uuid.MustParse(id),
		Kind: ContractKind,
	}
	assert.Equal(t, "contract/"+id, meta.Key())
}
