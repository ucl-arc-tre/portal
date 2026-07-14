//go:build integration

package notifications

import (
	"testing"
	"time"

	"github.com/stretchr/testify/assert"
	openapi "github.com/ucl-arc-tre/portal/internal/openapi/web"
	"github.com/ucl-arc-tre/portal/internal/testutils/mockcontrollers"
	"github.com/ucl-arc-tre/portal/internal/testutils/mockdb"
	"github.com/ucl-arc-tre/portal/internal/types"
	"gorm.io/gorm"
)

func migrate(db *gorm.DB) error {
	err := db.AutoMigrate(
		&types.User{},
		&types.Notification{},
	)
	return err
}

func TestIntegration_CreateAndClearNotifications(t *testing.T) {
	db := mockdb.NewTestDBSchema(t, migrate)

	t.Parallel()

	user := types.User{Username: "alice@example.com"}
	err := db.Where("username = ?", user.Username).
		Attrs(user).
		FirstOrCreate(&user).
		Error
	assert.NoError(t, err)

	svc := &Service{
		db:    db,
		entra: &mockcontrollers.MockEntra{},
	}

	notifs, err := svc.Find(user)
	assert.NoError(t, err)
	assert.Len(t, notifs, 0)

	notif := types.Notification{
		Title: "TestIntegration_CreateAndClearNotifications_1",
	}
	err = svc.create(notif, user)
	assert.NoError(t, err)

	notifs, err = svc.Find(user)
	assert.NoError(t, err)
	assert.Len(t, notifs, 1)

	err = svc.ReadAll(user, openapi.NotificationsReadAll{})
	assert.NoError(t, err)
	time.Sleep(50 * time.Millisecond)
	notifs, err = svc.Find(user)
	assert.NoError(t, err)
	assert.Len(t, notifs, 0)

	notif.Title = "TestIntegration_CreateAndClearNotifications_2"
	err = svc.create(notif, user)
	assert.NoError(t, err)

	notifs, err = svc.Find(user)
	assert.NoError(t, err)
	assert.Len(t, notifs, 1)

	err = svc.Read(notifs[0].ID, user)
	assert.NoError(t, err)
}
