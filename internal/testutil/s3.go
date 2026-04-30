package testutil

import (
	"bytes"
	"context"
	"io"

	"github.com/stretchr/testify/mock"
	"github.com/ucl-arc-tre/portal/internal/controller/s3"
	"github.com/ucl-arc-tre/portal/internal/types"
)

type MockS3 struct {
	mock.Mock
}

func (m *MockS3) StoreObject(ctx context.Context, metadata s3.ObjectMetadata, obj types.S3Object) error {
	args := m.Called(ctx, metadata, obj)
	return args.Error(0)
}

func (m *MockS3) GetObject(ctx context.Context, metadata s3.ObjectMetadata) (types.S3Object, error) {
	panic("not implemented")
}

func (m *MockS3) DeleteObject(metadata s3.ObjectMetadata) error {
	panic("not implemented")
}

func MockS3Object(data string) types.S3Object {
	reader := io.NopCloser(bytes.NewBufferString(data))
	size := int64(len(data))

	return types.S3Object{
		Content:  reader,
		NumBytes: &size,
	}
}
