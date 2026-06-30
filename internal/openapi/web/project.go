package openapi

import (
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

func (p ProjectTRERequest) Base() ProjectTREBase {
	return ProjectTREBase{
		ExternalEncryptionEnabled:  p.ExternalEncryptionEnabled,
		NumRequiredEgressApprovals: p.NumRequiredEgressApprovals,
		AssetIds:                   p.AssetIds,
		Members:                    p.Members,
	}
}

func parseManyUUID(values []string) ([]uuid.UUID, error) {
	uuids := []uuid.UUID{}
	for _, value := range values {
		assetUUID, err := uuid.Parse(value)
		if err != nil {
			return uuids, types.NewErrInvalidObjectF("invalid ID format: %s", value)
		}
		uuids = append(uuids, assetUUID)
	}
	return uuids, nil
}
