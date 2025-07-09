package config

import (
	"fmt"
	"os"
	"time"

	"github.com/knadh/koanf/parsers/yaml"
	"github.com/knadh/koanf/providers/file"
	"github.com/knadh/koanf/v2"
	"github.com/rs/zerolog"
	"github.com/ucl-arc-tre/portal/internal/types"
)

const (
	webConfigPath = "/etc/portal/config.web.yaml"

	BaseURL        = "/api/v0"
	TimeFormat     = time.RFC3339
	MaxUploadBytes = 1e7 // 10 MB

	TrainingValidityYears = 1
	TrainingValidity      = TrainingValidityYears * 365 * 24 * time.Hour
)

var k = koanf.New(".")

func Init() {
	if err := k.Load(file.Provider(webConfigPath), yaml.Parser()); err != nil {
		panic(fmt.Errorf("error loading config: %v", err))
	}
	if k.Bool("debug") {
		zerolog.SetGlobalLevel(zerolog.DebugLevel)
	}
}

func ServerAddress() string {
	// loads from env to match with Gin
	return fmt.Sprintf(":%s", env("PORT"))
}

func IsDevDeploy() bool {
	return k.Bool("is_dev_deploy")
}

func IsTesting() bool {
	return k.Bool("is_testing")
}

func DBDataSourceName() string {
	return k.String("db.dsn")
}

func AdminUsernames() []types.Username {
	usernames := []types.Username{}
	for _, username := range k.Strings("admin_usernames") {
		if username != "" {
			usernames = append(usernames, types.Username(username))
		}
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
