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

func (s S3CredentialBundle) IsStatic() bool {
	return s.AccessKeyId != "" && s.SecretAccessKey != ""
}

type MyservicesCredentialBundle struct {
	Enabled        bool
	URL            string
	TenantID       string
	ClientID       string
	ClientSecret   string // #nosec G117 -- Loaded from mounted config
	APIClientID    string
	SupportDomain  string
	RequestorEmail string
}
