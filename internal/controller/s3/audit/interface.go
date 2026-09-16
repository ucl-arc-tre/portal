package s3audit

type Interface interface {
	Upload(batch AuditBatch) error
}
