package config

import (
	"fmt"
	"os"
	"strings"
)

const (
	BaseURL = "/api/v0"
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

func AdminUsernames() []string {
	adminUsernames := os.Getenv("ADMIN_USERNAMES")
	return strings.Split(adminUsernames, ",")
}

func env(key string) string {
	if value := os.Getenv(key); value != "" {
		return value
	} else {
		panic(fmt.Errorf("[%v] env var unset", key))
	}
}
