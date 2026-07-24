package config

import "time"

func daysUntil(t time.Time) Days {
	return Days(time.Until(t).Hours() / Day.Hours())
}
