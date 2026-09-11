package tasks

import (
	"fmt"

	gormlock "github.com/go-co-op/gocron-gorm-lock/v2"
	"github.com/go-co-op/gocron/v2"
	"github.com/google/uuid"
	"github.com/rs/zerolog/log"
	"github.com/ucl-arc-tre/portal/internal/config"
	"github.com/ucl-arc-tre/portal/internal/graceful"
	"github.com/ucl-arc-tre/portal/internal/service/notifications"
	"github.com/ucl-arc-tre/portal/internal/service/users"
	"gorm.io/gorm"
)

type Manager struct {
	scheduler     gocron.Scheduler
	db            *gorm.DB
	notifications notifications.Interface
	users         *users.Service
}

// Create a task manager instance
func New() *Manager {
	manager := Manager{
		scheduler:     newScheduler(),
		db:            graceful.NewDB(),
		notifications: notifications.New(),
		users:         users.New(),
	}
	return &manager
}

// Start the task manager - non blocking
func (m *Manager) Start() {
	// NOTE: Scheduled tasks are offset to minimise concurrent database load
	m.scheduleDailyAt(gocron.NewAtTime(3, 0, 0), m.checkAssetsExpiry, "checkAssetsExpiry")
	m.scheduleDailyAt(gocron.NewAtTime(3, 0, 2), m.checkContractsExpiry, "checkContractsExpiry")
	m.scheduleDailyAt(gocron.NewAtTime(3, 0, 4), m.checkTrainingCertificatesExpiry, "checkTrainingCertificatesExpiry")
	m.scheduleDailyAt(gocron.NewAtTime(3, 0, 6), m.checkStudiesSignoffExpiry, "checkStudySignoffExpiry")
	if config.ProjectAccessReviewEnabled() {
		m.scheduleDailyAt(gocron.NewAtTime(3, 0, 8), m.checkProjectsAccessReviewExpiry, "checkProjectAccessReviewExpiry")
	}
	m.scheduleDailyAt(gocron.NewAtTime(3, 1, 0), m.updateUserEmails, "updateUserEmails")

	m.scheduler.Start()
}

// Shutdown the task manager. Errors are logged
func (m *Manager) Shutdown() {
	err := m.scheduler.Shutdown()
	if err != nil {
		log.Err(err).Msg("Failed to shutdown gocron scheduler")
	}
}

// Schedule a function to run repeatedly with a delay and unique name
func (m *Manager) scheduleDailyAt(
	at gocron.AtTime,
	function func() error,
	name string,
) {
	job, err := m.scheduler.NewJob(
		gocron.DailyJob(1, gocron.NewAtTimes(at)),
		gocron.NewTask(function),
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
