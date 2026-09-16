package s3audit

import "io"

type AuditBatch struct {
	BatchNumber int
	Body        io.Reader
}
