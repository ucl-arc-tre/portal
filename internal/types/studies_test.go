package types

import (
	"testing"
	"time"

	"github.com/stretchr/testify/assert"
)

const (
	day   = 24 * time.Hour
	month = 30 * day
)

func TestContractShouldNotify(t *testing.T) {
	c := Contract{}
	assert.False(t, c.ShouldNotifyExpiry())

	twoMonthsFromNow := time.Now().Add(2 * month)
	c.ExpiryDate = &twoMonthsFromNow
	assert.False(t, c.ShouldNotifyExpiry())

	oneMonthFromNow := time.Now().Add(1 * month).Add(1 * time.Second)
	c.ExpiryDate = &oneMonthFromNow
	assert.True(t, c.ShouldNotifyExpiry())

	today := time.Now()
	c.ExpiryDate = &today
	assert.True(t, c.ShouldNotifyExpiry())

	yesterday := time.Now().Add(-1 * day)
	c.ExpiryDate = &yesterday
	assert.True(t, c.ShouldNotifyExpiry())
}
