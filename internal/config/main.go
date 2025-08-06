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
	BaseWebURL = "/web/api/v0"
	BaseTREURL = "/tre/api/v0"

	configPath = "/etc/portal/config.yaml"

	TimeFormat     = time.RFC3339
	MaxUploadBytes = 1e7 // 10 MB

	TrainingValidityYears = 1
	TrainingValidity      = TrainingValidityYears * 365 * 24 * time.Hour
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
	usernames := []types.Username{}
	for _, username := range k.Strings("admin_usernames") {
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
