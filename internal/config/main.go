package config

import (
	"fmt"
	"os"
	"time"

	"github.com/knadh/koanf/parsers/yaml"
	"github.com/knadh/koanf/providers/file"
	"github.com/knadh/koanf/v2"
	"github.com/rs/zerolog"
	"github.com/rs/zerolog/log"
	"github.com/ucl-arc-tre/portal/internal/types"
)

const (
	day   = 24 * time.Hour
	month = 30 * day

	BaseWebURL = "/web/api/v0"
	BaseTREURL = "/tre/api/v0"
	BaseDSHURL = "/dsh/api/v0"

	configPath = "/etc/portal/config.yaml"

	TimeFormat     = time.RFC3339
	DateFormat     = "2006-01-02" // YYYY-MM-DD format for dates
	MaxUploadBytes = 1e8          // 100 MB

	TrainingValidityYears = 1
	TrainingValidity      = TrainingValidityYears * 365 * day

	MaxTokenValidForDays = 365
	MaxTokenValidity     = MaxTokenValidForDays * day

	ServerShutdownGraceDuration = 10 * time.Second

	StudySignoffValidity = 3 * month
)

var k = koanf.New(".")

// Initialise the configuration by loading the config file
func Init() {
	if err := k.Load(file.Provider(configPath), yaml.Parser()); err != nil {
		log.Err(err).Msg("error loading config")
	}
	if k.Bool("debug") {
		zerolog.SetGlobalLevel(zerolog.DebugLevel)
	}
	log.Debug().Msg("Initialised config")
}

func ServerAddress() string {
	// loads from env to match with Gin
	return fmt.Sprintf(":%s", env("PORT"))
}

func IsDevDeploy() bool {
	return os.Getenv("IS_DEV_DEPLOY") == "true"
}

func IsTesting() bool {
	return os.Getenv("IS_TESTING") == "true"
}

func DBDataSourceName() string {
	return k.String("db.dsn")
}

func S3Credentials() S3CredentialBundle {
	return S3CredentialBundle{
		AccessKeyId:     k.String("s3.access_key_id"),
		SecretAccessKey: k.String("s3.secret_access_key"),
	}
}

func S3Region() string {
	return k.String("s3.region")
}

func S3BucketName() string {
	return k.String("s3.bucket")
}

func S3DevHost() string {
	return k.String("s3.dev.host")
}

func JWTIssuer() string {
	return PortalUrl()
}

// TREUserAccounts are the username:password pairs used to access the TRE API
func TREUserAccounts() map[string]string {
	return k.StringMap("tre.users")
}

func EntraCredentials() EntraCredentialBundle {
	return EntraCredentialBundle{
		TenantID:     k.String("entra.tenant_id"),
		ClientID:     k.String("entra.client_id"),
		ClientSecret: k.String("entra.client_secret"),
	}
}

func EntraMailCredentials() EntraCredentialBundle {
	return EntraCredentialBundle{
		TenantID:     k.String("entra.mail_tenant_id"),
		ClientID:     k.String("entra.mail_client_id"),
		ClientSecret: k.String("entra.mail_client_secret"),
	}
}

func EntraMailEnabled() bool {
	e := EntraMailCredentials()
	return e.TenantID != "" && e.ClientID != "" && e.ClientSecret != "" && EntraMailUserPrincipal() != ""
}

func EntraMailUserPrincipal() string {
	return k.String("entra.mail_user_principal")
}

func EntraInviteRedirectURL() string {
	return k.String("entra.invite_redirect_url")
}

func EntraTenantPrimaryDomain() string {
	return k.String("entra.primary_domain")
}

func EntraInvitedUserGroup() string {
	return k.String("entra.invited_user_group_id")
}

func SetforTesting(key string, value string) error {
	return k.Set(key, value)
}
func AdminUsernames() []types.Username {
	return usernames("admin_usernames")
}

func TreOpsStaffUsernames() []types.Username {
	return usernames("tre_ops_staff_usernames")
}

func IGOpsStaffUsernames() []types.Username {
	return usernames("ig_ops_staff_usernames")
}

func DSHOpsStaffUsernames() []types.Username {
	return usernames("dsh_ops_staff_usernames")
}

func NotificationsEnabled() bool {
	return k.Bool("entra.notifications_enabled")
}

func Myservicies() MyserviciesCredentialBundle {
	return MyserviciesCredentialBundle{
		Enabled:        k.Bool("myservices.enabled"),
		URL:            k.String("myservices.url"),
		TenantID:       k.String("myservices.entra.tenant_id"),
		ClientID:       k.String("myservices.entra.client_id"),
		ClientSecret:   k.String("myservices.entra.client_secret"),
		APIClientID:    k.String("myservices.entra.api_client_id"),
		SupportDomain:  k.String("myservices.support_domain"),
		RequestorEmail: k.String("myservicies.requestor_email"),
	}
}

// Map of paths to strictly rate limit, so they are 'slow'
func RateLimitSlowPaths() map[string]bool {
	return map[string]bool{
		BaseWebURL + "/users/invite": true,
		BaseWebURL + "/feedback":     true,
	}
}

func usernames(key string) []types.Username {
	usernames := []types.Username{}
	for _, username := range k.Strings(key) {
		usernames = append(usernames, types.Username(username))
	}
	return usernames
}

func env(key string) string {
	if value := os.Getenv(key); value != "" {
		return value
	} else {
		panic(fmt.Errorf("[%v] env var unset", key))
	}
}

func PortalUrl() string {
	return k.String("url")
}

// ProcessIdentity of this process e.g. pod name
func ProcessIdentity() string {
	value := os.Getenv("PROCESS_IDENTITY")
	if value == "" {
		hostname, err := os.Hostname()
		if err != nil {
			return "unknown-host"
		}
		return hostname
	}
	return value
}

func DaysUntilTrainingExpiry(trainingRecord types.UserTrainingRecord) Days {
	expiresAt := trainingRecord.CompletedAt.Add(TrainingValidity)
	return daysUntil(expiresAt)
}

func ShouldNotifyTrainingExpiry(trainingRecord types.UserTrainingRecord) bool {
	if trainingRecord.CompletedAt.IsZero() { // unset value
		return false
	}
	daysUntilExpiry := DaysUntilTrainingExpiry(trainingRecord)
	return shouldNotifyExpiry(daysUntilExpiry)
}

func DaysUntilStudySignoffExpiry(study *types.Study) Days {
	if study == nil || study.LastSignoff == nil {
		log.Warn().Msg("nil study or lastSignoff - no days until expiry")
		return 0
	}
	return daysUntil(study.LastSignoff.Add(StudySignoffValidity))
}

func ShouldNotifyStudySignoffExpiry(study *types.Study) bool {
	if study == nil || study.LastSignoff == nil {
		return false
	}
	daysUntilExpiry := DaysUntilStudySignoffExpiry(study)
	return shouldNotifyExpiry(daysUntilExpiry)
}

func DaysUntilContractExpiry(contract types.Contract) *int {
	if contract.ExpiryDate == nil {
		return nil
	}
	return new(daysUntil(*contract.ExpiryDate))
}

func ShouldNotifyContractExpiry(contract types.Contract) bool {
	if contract.Status == types.ContractStatusClosed {
		return false
	}
	daysUntilExpiry := DaysUntilContractExpiry(contract)
	if daysUntilExpiry == nil {
		return false
	}
	return shouldNotifyExpiry(*daysUntilExpiry)
}

func DaysUntilAssetExpiry(asset types.Asset) *int {
	if asset.ExpiresAt == nil {
		return nil
	}
	return new(daysUntil(*asset.ExpiresAt))
}

func ShouldNotifyAssetExpiry(asset types.Asset) bool {
	if asset.IsDestroyed() {
		return false
	}
	daysUntilExpiry := DaysUntilAssetExpiry(asset)
	if daysUntilExpiry == nil {
		return false
	}
	return shouldNotifyExpiry(*daysUntilExpiry)
}

func shouldNotifyExpiry(daysUntilExpiry Days) bool {
	if daysUntilExpiry < -7 {
		return false // don't notify very expired
	}
	return daysUntilExpiry <= 1 || daysUntilExpiry == 7 || daysUntilExpiry == 14 || daysUntilExpiry == 21 || daysUntilExpiry == 30
}
