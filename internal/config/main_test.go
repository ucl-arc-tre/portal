package config

import (
	"testing"
	"time"

	"github.com/stretchr/testify/assert"
	"github.com/ucl-arc-tre/portal/internal/types"
)

const (
	day  = 24 * time.Hour
	year = 365 * day
)

func TestDaysUntilTrainingExpiry(t *testing.T) {
	record := types.UserTrainingRecord{}
	assert.Less(t, DaysUntilTrainingExpiry(record), 0)
	assert.False(t, ShouldNotifyTrainingExpiry(record))

	record.CompletedAt = time.Now()
	assert.Equal(t, 364, DaysUntilTrainingExpiry(record))
	assert.False(t, ShouldNotifyTrainingExpiry(record))

	record.CompletedAt = time.Now().Add(-(year + day + time.Hour))
	assert.Equal(t, -1, DaysUntilTrainingExpiry(record))
	assert.True(t, ShouldNotifyTrainingExpiry(record))

	record.CompletedAt = time.Now().Add(-(year + 180*day + time.Hour))
	assert.Equal(t, -180, DaysUntilTrainingExpiry(record))
	assert.False(t, ShouldNotifyTrainingExpiry(record))
}
