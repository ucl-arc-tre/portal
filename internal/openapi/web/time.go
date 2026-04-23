package openapi

import (
	"time"

	"github.com/ucl-arc-tre/portal/internal/config"
)

func FormatTime(t time.Time) string {
	return t.Format(config.TimeFormat)
}

func FormatOptionalTime(t *time.Time) *string {
	if t == nil {
		return nil
	}
	formattedTime := FormatTime(*t)
	return &formattedTime
}

func FormatOptionalDate(t *time.Time) *string {
	if t == nil {
		return nil
	}
	formattedDate := t.Format(config.DateFormat)
	return &formattedDate
}
