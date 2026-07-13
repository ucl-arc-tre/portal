package notifications

import (
	"crypto/md5" // #nosec G501 - not used for sensitive values
	"encoding/hex"
	"errors"
	"fmt"
	"time"

	"github.com/google/uuid"
	"github.com/ucl-arc-tre/portal/internal/config"
	"github.com/ucl-arc-tre/portal/internal/controller/entra"
	"github.com/ucl-arc-tre/portal/internal/graceful"
	openapi "github.com/ucl-arc-tre/portal/internal/openapi/web"
	"github.com/ucl-arc-tre/portal/internal/types"
	"gorm.io/gorm"
)

type Service struct {
	db    *gorm.DB
	entra *entra.Controller
}

func New() *Service {
	return &Service{db: graceful.NewDB(), entra: entra.New()}
}

func (s *Service) Find(user types.User) ([]types.Notification, error) {
	notifications := []types.Notification{}
	err := s.db.Where("recipient_user_id = ? AND read_at IS NULL", user.ID).Find(&notifications).Error
	return notifications, types.NewErrFromGorm(err, "failed to find user notifications")
}

func (s *Service) Read(id uuid.UUID, user types.User) error {
	err := s.db.Model(&types.Notification{}).
		Where("id = ? AND recipient_user_id = ?", id, user.ID).
		Update("read_at", time.Now()).
		Error
	return types.NewErrFromGorm(err, "failed to read notification")
}

func (s *Service) ReadAll(user types.User, data openapi.NotificationsReadAll) error {
	db := s.db.Model(&types.Notification{})
	if data.Kind != nil {
		db = db.Where("recipient_user_id = ? AND kind = ?", user.ID, *data.Kind)
	} else {
		db = db.Where("recipient_user_id = ?", user.ID)
	}
	err := db.Update("read_at", time.Now()).Error
	return types.NewErrFromGorm(err, "failed to read notification")
}

func notificationDedupeKey(notification types.Notification, user types.User) string {
	bodyStr := ""
	if notification.Body != nil {
		bodyStr = *notification.Body
	}
	expiresAtStr := ""
	if notification.ExpiresAt != nil {
		expiresAtStr += notification.ExpiresAt.Format(config.TimeFormat)
	}
	dedupeKey := fmt.Sprintf("%s%s%s%s", user.ID.String(), notification.Title, bodyStr, expiresAtStr)
	hash := md5.Sum([]byte(dedupeKey)) // #nosec G401 -- No sensitivie values hashed
	return hex.EncodeToString(hash[:])
}

func (s *Service) createForAll(notification types.Notification, users []types.User) error {
	errs := []error{}
	for _, user := range users {
		notificationCopy := notification
		errs = append(errs, s.create(notificationCopy, user))
	}
	return errors.Join(errs...)
}

func (s *Service) create(notification types.Notification, user types.User) error {
	if notification.Title == "" {
		return types.NewErrInvalidObject("notification title cannot be empty")
	}
	if user.ID == emptyUUID {
		return types.NewErrInvalidObject("cannot notify with empty user id")
	}
	notification.RecipientUserID = user.ID
	notification.DedupeKey = notificationDedupeKey(notification, user)
	err := s.db.Where("dedupe_key = ?", notification.DedupeKey).FirstOrCreate(&notification).Error
	if err != nil {
		return types.NewErrFromGorm(err, "failed to create complete profile notification")
	}
	return nil
}

var emptyUUID = uuid.UUID{}
