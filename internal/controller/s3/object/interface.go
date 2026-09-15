package s3

import (
	"context"

	"github.com/ucl-arc-tre/portal/internal/types"
)

type Interface interface {
	StoreObject(ctx context.Context, metadata ObjectMetadata, obj types.S3Object) error
	GetObject(ctx context.Context, metadata ObjectMetadata) (types.S3Object, error)
	DeleteObject(metadata ObjectMetadata) error
}
