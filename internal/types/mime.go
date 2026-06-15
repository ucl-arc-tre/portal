package types

const (
	MimeTypePdf         = MimeType("application/pdf")
	MimeTypeDoc         = MimeType("application/msword")
	MimeTypeOctetStream = MimeType("application/octet-stream") //sometimes used for doc files
	MimeTypeDocx        = MimeType("application/vnd.openxmlformats-officedocument.wordprocessingml.document")
	MimeTypeJpeg        = MimeType("image/jpeg")
	MimeTypePNG         = MimeType("image/png")
)

type MimeType string
