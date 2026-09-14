package types

import (
	"github.com/google/uuid"
)

type AuditOperation string

const (
	AuditOperationCreate = AuditOperation("create")
	AuditOperationUpdate = AuditOperation("update")
	AuditOperationDelete = AuditOperation("delete")
)

type AuditEventObjectType string

const (
	AuditEventObjectTypeStudy          = AuditEventObjectType("study")
	AuditEventObjectTypeProject        = AuditEventObjectType("project")
	AuditEventObjectTypeTrainingRecord = AuditEventObjectType("training-record")
)

type AuditEventObject struct {
	ID   uuid.UUID
	Name *string
	Type AuditEventObjectType
}

type AuditEvent struct {
	Model
	UserID    uuid.UUID // ID of the user who triggered the action
	Operation AuditOperation
	Object    AuditEventObject `gorm:"serializer:json"`
	Body      string           `gorm:"not null"`

	// Relationships
	User User `gorm:"foreignKey:UserID"`
}
