package audit

import "time"

func marshalTime(t time.Time) string {
	return t.Format(time.RFC3339)
}
