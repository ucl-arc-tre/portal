package graceful

import (
	"time"

	"github.com/rs/zerolog/log"
	"github.com/ucl-arc-tre/portal/internal/config"
	"github.com/ucl-arc-tre/portal/internal/types"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

const (
	initConnectRetryDelay = 1 * time.Second
)

// Initalise the database with the required types
func InitDB() {
	db := NewDB()
	db.Exec(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp";`)
	err := db.AutoMigrate(&types.User{})
	if err != nil {
		panic(err)
	}
}

// Create a new gorm DB, blocking until a connection is made
func NewDB() *gorm.DB {
	connectRetryDelay := initConnectRetryDelay
	for {
		db, err := gorm.Open(postgres.New(postgres.Config{
			DSN:                  config.DBDataSourceName(),
			PreferSimpleProtocol: true,
		}), &gorm.Config{})
		if err == nil {
			return db
		} else {
			log.Debug().Msg("Waiting for DB connection...")
			time.Sleep(connectRetryDelay)
			connectRetryDelay *= 2
		}
	}
}
