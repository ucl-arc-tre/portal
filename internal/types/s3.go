package types

import "io"

type S3UploadObject struct {
	Content io.ReadCloser
}
