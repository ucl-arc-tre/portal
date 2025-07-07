package users

import (
	"testing"
	"time"

	"github.com/stretchr/testify/assert"
	"github.com/ucl-arc-tre/portal/internal/config"
)

func TestNHSDTrainingIsValid(t *testing.T) {
	now := time.Now()
	assert.True(t, NHSDTrainingIsValid(now))
	assert.False(t, NHSDTrainingIsValid(now.Add(-config.TrainingValidity).Add(-1*time.Second)))
}
