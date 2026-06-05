package config

import (
	"testing"
	"time"

	"github.com/stretchr/testify/assert"
)

func TestDaysUntil(t *testing.T) {
	now := time.Now()
	assert.Equal(t, 0, daysUntil(now))

	oneDayFromNow := now.Add(24 * time.Hour).Add(10 * time.Second)
	assert.Equal(t, 1, daysUntil(oneDayFromNow))
}
