package web

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/ucl-arc-tre/portal/internal/middleware"
	openapi "github.com/ucl-arc-tre/portal/internal/openapi/web"
)

func (h *Handler) GetNotifications(ctx *gin.Context) {
	user := middleware.GetUser(ctx)
	notifications, err := h.notifications.Find(user)
	if err != nil {
		setError(ctx, err, "Failed to get notifications")
		return
	}
	data := []openapi.Notification{}
	for _, notification := range notifications {
		var kind *openapi.NotificationKind
		if notification.Kind != nil {
			kind = new(openapi.NotificationKind(*notification.Kind))
		}
		data = append(data, openapi.Notification{
			Id:    notification.ID.String(),
			Title: notification.Title,
			Body:  notification.Body,
			Href:  notification.Href,
			Kind:  kind,
		})
	}
	ctx.JSON(http.StatusOK, data)
}

func (h *Handler) PostNotificationsNotificationIdRead(ctx *gin.Context, notificationId string) {
	id, err := parseUUIDOrSetError(ctx, notificationId)
	if err != nil {
		return
	}
	user := middleware.GetUser(ctx)
	if err := h.notifications.Read(id, user); err != nil {
		setError(ctx, err, "Failed to read notification")
		return
	}
	ctx.Status(http.StatusNoContent)
}

func (h *Handler) PostNotificationsRead(ctx *gin.Context) {
	data := openapi.NotificationsReadAll{}
	if err := bindJSONOrSetError(ctx, &data); err != nil {
		return
	}
	user := middleware.GetUser(ctx)
	if err := h.notifications.ReadAll(user, data); err != nil {
		setError(ctx, err, "Failed to read notification")
		return
	}
	ctx.Status(http.StatusNoContent)
}
