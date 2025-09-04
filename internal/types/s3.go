package types

import "io"

type S3Object struct {
	Content  io.ReadCloser
	NumBytes *int64
}
