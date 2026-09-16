package tasks

import (
	"testing"
	"time"

	"github.com/go-co-op/gocron/v2"
	"github.com/stretchr/testify/assert"
)

func TestTaskManager(t *testing.T) {
	scheduler, err := gocron.NewScheduler()
	assert.NoError(t, err)

	calledFuncInManager := false
	setCalled := func() error {
		calledFuncInManager = true
		return nil
	}

	manager := Manager{scheduler: scheduler}
	at := time.Now().Add(1 * time.Second)
	manager.scheduleDailyAt(
		gocron.NewAtTime(uint(at.Hour()), uint(at.Minute()), uint(at.Second())),
		setCalled,
		"test",
	)
	manager.scheduler.Start()
	time.Sleep(1050 * time.Millisecond)

	manager.Shutdown()

	assert.True(t, calledFuncInManager)
}
