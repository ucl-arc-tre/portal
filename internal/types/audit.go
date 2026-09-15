package types

import (
	"encoding/json"

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
	Name *string `json:",omitempty"`
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

func (a AuditEvent) Marshal() ([]byte, error) {
	tmp := struct {
		ID        string
		At        int64
		Username  string
		Operation string
		Object    AuditEventObject
		Body      string
	}{
		ID:        a.ID.String(),
		At:        a.CreatedAt.Unix(),
		Username:  string(a.User.Username),
		Operation: string(a.Operation),
		Object:    a.Object,
		Body:      a.Body,
	}
	return json.Marshal(tmp)
}
