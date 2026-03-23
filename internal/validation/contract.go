package validation

import (
	"path/filepath"
	"slices"
	"strings"

	"github.com/ucl-arc-tre/portal/internal/types"
)

var (
	validContractFileExtensions = []string{".pdf", ".doc", ".docx", ".jpg", ".jpeg", ".png"}
	validContractMimeTypes      = []types.MimeType{
		types.MimeTypePdf,
		types.MimeTypeDoc,
		types.MimeTypeDocx,
		types.MimeTypeJpeg,
		types.MimeTypePNG,
	}
)

func IsValidContractFilename(filename string) bool {
	filenameHasSuffix := func(s string) bool {
		return strings.HasSuffix(filename, s)
	}
	isLocalPath := filepath.IsLocal(filename)
	hasValidExtension := slices.ContainsFunc(validContractFileExtensions, filenameHasSuffix)
	return len(filename) > 4 && isLocalPath && hasValidExtension
}

func IsValidContractMimeType(mimeType types.MimeType) bool {
	return slices.Contains(validContractMimeTypes, mimeType)
}
