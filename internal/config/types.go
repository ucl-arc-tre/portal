package config

type Days = int

type EntraCredentialBundle struct {
	TenantID     string
	ClientID     string
	ClientSecret string // #nosec G117 -- Loaded from mounted config
}

type S3CredentialBundle struct {
	AccessKeyId     string
	SecretAccessKey string
}

type MyserviciesCredentialBundle struct {
	Enabled       bool
	URL           string
	TenantID      string
	ClientID      string
	ClientSecret  string // #nosec G117 -- Loaded from mounted config
	APIClientID   string
	SupportDomain string
}
