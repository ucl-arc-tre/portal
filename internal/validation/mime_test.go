package validation

import (
	"io"
	"os"
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/ucl-arc-tre/portal/internal/types"
)

func TestMimeType(t *testing.T) {
	file, err := os.Open("testdata/invalid_pdf.pdf")
	assert.NoError(t, err)
	mimeTypeInvalidPdf, err := MimeType(file)
	assert.NoError(t, err)
	assert.Equal(t, types.MimeType("text/plain; charset=utf-8"), mimeTypeInvalidPdf)

	file, err = os.Open("testdata/valid_pdf.pdf")
	assert.NoError(t, err)
	mimeTypeValidPdf, err := MimeType(file)
	assert.NoError(t, err)
	assert.Equal(t, types.MimeTypePdf, mimeTypeValidPdf)

	currentSeekOffset, err := file.Seek(0, io.SeekCurrent)
	assert.NoError(t, err)
	assert.Equal(t, int64(0), currentSeekOffset)
}
