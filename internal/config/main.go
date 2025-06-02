package config

import (
	"fmt"
	"os"
	"strings"
	"time"

	"github.com/ucl-arc-tre/portal/internal/types"
)

const (
	BaseURL        = "/api/v0"
	TimeFormat     = time.RFC3339
	MaxUploadBytes = 1e7 // 10 MB

	TrainingValidityYears = 1
	TrainingValidity      = TrainingValidityYears * 365 * 24 * time.Hour
)

func ServerAddress() string {
	return fmt.Sprintf(":%s", env("PORT"))
}

func IsDevDeploy() bool {
	return os.Getenv("IS_DEV_DEPLOY") == "true"
}

func IsTesting() bool {
	return os.Getenv("IS_TESTING") == "true"
}

func DBDataSourceName() string {
	return env("DATABASE_DSN")
}

func AdminUsernames() []types.Username {
	usernames := []types.Username{}
	for username := range strings.SplitSeq(os.Getenv("ADMIN_USERNAMES"), ",") {
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
