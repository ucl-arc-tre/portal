package openapi

import (
	"fmt"

	"github.com/google/uuid"
	"github.com/ucl-arc-tre/portal/internal/types"
)

type ProjectWithAssets interface {
	AssetUUIDs() ([]uuid.UUID, error)
}

func (p ProjectTRERequest) AssetUUIDs() ([]uuid.UUID, error) {
	return parseManyUUID(p.AssetIds)
}

func (p ProjectTREUpdate) AssetUUIDs() ([]uuid.UUID, error) {
	return parseManyUUID(p.AssetIds)
}

func parseManyUUID(values []string) ([]uuid.UUID, error) {
	uuids := []uuid.UUID{}
	for _, value := range values {
		assetUUID, err := uuid.Parse(value)
		if err != nil {
			return uuids, types.NewErrInvalidObject(fmt.Errorf("invalid ID format: %s", value))
		}
		uuids = append(uuids, assetUUID)
	}
	return uuids, nil
}
