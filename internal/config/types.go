package config

type EntraCredentialBundle struct {
	TenantID     string
	ClientID     string
	ClientSecret string // #nosec G117
}

type S3CredentialBundle struct {
	AccessKeyId     string
	SecretAccessKey string
}
