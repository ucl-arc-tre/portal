package config

import (
	"fmt"
	"os"
)

func ServerAddress() string {
	return fmt.Sprintf(":%s", env("PORT"))
}

func env(key string) string {
	if value := os.Getenv(key); value != "" {
		return value
	} else {
		panic(fmt.Errorf("[%v] env var unset", key))
	}
}
