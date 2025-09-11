package config

type EntraCredentialBundle struct {
	TenantID     string
	ClientID     string
	ClientSecret string
}

type S3CredentialBundle struct {
	AccessKeyId     string
	SecretAccessKey string
}
