package config

import (
	"testing"
	"time"

	"github.com/stretchr/testify/assert"
	"github.com/ucl-arc-tre/portal/internal/types"
)

const (
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

func TestDaysUntilStudySignoffExpiry(t *testing.T) {
	assert.Equal(t, 0, DaysUntilStudySignoffExpiry(nil))

	now := time.Now()
	study := types.Study{LastSignoff: &now}
	assert.Equal(t, 89, DaysUntilStudySignoffExpiry(&study))
}

func TestContractShouldNotify(t *testing.T) {
	c := types.Contract{}
	assert.False(t, ShouldNotifyContractExpiry(c))

	twoMonthsFromNow := time.Now().Add(2 * Month)
	c.ExpiryDate = &twoMonthsFromNow
	assert.False(t, ShouldNotifyContractExpiry(c))

	oneMonthFromNow := time.Now().Add(1 * Month).Add(1 * time.Second)
	c.ExpiryDate = &oneMonthFromNow
	assert.True(t, ShouldNotifyContractExpiry(c))

	today := time.Now()
	c.ExpiryDate = &today
	assert.True(t, ShouldNotifyContractExpiry(c))

	yesterday := time.Now().Add(-1 * day)
	c.ExpiryDate = &yesterday
	assert.True(t, ShouldNotifyContractExpiry(c))
}
