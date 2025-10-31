package validation

import (
	"fmt"
	"io"
	"net/http"

	"github.com/ucl-arc-tre/portal/internal/types"
)

// Determine the MIME type of a stream of data by peeking at the first 512 bytes
// See: https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/MIME_types/Common_types
func MimeType(stream io.ReadSeeker) (types.MimeType, error) {
	buff := make([]byte, 512)

	if _, err := stream.Seek(0, io.SeekStart); err != nil {
		return "", types.NewErrServerError(fmt.Errorf("failed seek to start [%v]", err))
	}

	nBytesRead, err := stream.Read(buff)
	if err != nil && err != io.EOF {
		return "", types.NewErrServerError(fmt.Errorf("failed read buffer [%v]", err))
	}

	if _, err := stream.Seek(0, io.SeekStart); err != nil {
		return "", types.NewErrServerError(fmt.Errorf("failed reset seek to start [%v]", err))
	}

	buff = buff[:nBytesRead] // fill remaining bytes with zeros
	return types.MimeType(http.DetectContentType(buff)), nil
}
