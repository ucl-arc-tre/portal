package s3

import (
	"fmt"

	"github.com/google/uuid"
)

const (
	ContractKind = ObjectKind("contract")
)

type ObjectKind string

type ObjectMetadata struct {
	Id   uuid.UUID
	Kind ObjectKind
}

func (o ObjectMetadata) Key() string {
	return fmt.Sprintf("%v/%v", o.Kind, o.Id.String())
}
