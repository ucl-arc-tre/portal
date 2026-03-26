package types

const (
	MimeTypePdf  = MimeType("application/pdf")
	MimeTypeDoc  = MimeType("application/msword")
	MimeTypeDocx = MimeType("application/vnd.openxmlformats-officedocument.wordprocessingml.document")
	MimeTypeJpeg = MimeType("image/jpeg")
	MimeTypePNG  = MimeType("image/png")
)

type MimeType string
