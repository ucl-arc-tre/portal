package tasks

import (
	"fmt"
	"time"

	gormlock "github.com/go-co-op/gocron-gorm-lock/v2"
	"github.com/go-co-op/gocron/v2"
	"github.com/google/uuid"
	"github.com/rs/zerolog/log"
	"github.com/ucl-arc-tre/portal/internal/config"
	"github.com/ucl-arc-tre/portal/internal/controller/entra"
	"github.com/ucl-arc-tre/portal/internal/graceful"
	"gorm.io/gorm"
)

type Manager struct {
	scheduler gocron.Scheduler
	db        *gorm.DB
	entra     *entra.Controller
}

// Create a task manager instance
func New() *Manager {
	scheduler := newScheduler()
	return &Manager{scheduler: scheduler, db: graceful.NewDB(), entra: entra.New()}
}

// Start the task manager - non blocking
func (m *Manager) Start() {
	m.mustEvery(time.Minute, exampleJob, "exampleJob")
	m.scheduler.Start()
	m.DailyChecks()
}

// Shutdown the task manager. Errors are logged
func (m *Manager) Shutdown() {
	err := m.scheduler.Shutdown()
	if err != nil {
		log.Err(err).Msg("Failed to shutdown gocron scheduler")
	}
}

// Schedule a function to run repeatedly with a delay and unique name
func (m *Manager) mustEvery(delay time.Duration, function func() error, name string) {
	job, err := m.scheduler.NewJob(
		gocron.DurationJob(delay),
		gocron.NewTask(function),
		gocron.WithStartAt(gocron.WithStartDateTime(timeBoundary(delay))),
		gocron.WithName(name),
		gocron.WithSingletonMode(gocron.LimitModeReschedule), // prevent parallel execution
		gocron.WithEventListeners(
			gocron.BeforeJobRuns(logJobBefore),
			gocron.AfterJobRunsWithError(logJobError),
		),
	)
	if err != nil {
		panic(err)
	}
	log.Info().Str("name", job.Name()).Str("id", job.ID().String()).Msg("Scheduled job")
}

func logJobBefore(_ uuid.UUID, jobName string) {
	log.Debug().Str("jobName", jobName).Msg("Running")
}

func logJobError(_ uuid.UUID, jobName string, err error) {
	log.Err(err).Str("jobName", jobName).Msg("Failure in job")
}

func newScheduler() gocron.Scheduler {
	db := graceful.NewDB()
	locker, err := gormlock.NewGormLocker(db, config.ProcessIdentity())
	if err != nil {
		panic(fmt.Errorf("failed to create gocron locker: %w", err))
	}
	scheduler, err := gocron.NewScheduler(gocron.WithDistributedLocker(locker))
	if err != nil {
		panic(fmt.Errorf("failed to create gocron scheduler: %w", err))
	}
	return scheduler
}

// Get the next time boundary for a time. e.g. if the time is
// 10:01 and the delay is 5 minutes then the boundary is 10:05
func timeBoundary(delay time.Duration) time.Time {
	return time.Now().UTC().Add(delay).Truncate(delay)
}
