package openapi

import "github.com/ucl-arc-tre/portal/internal/types"

func (u UserTrainingUpdate) TypesTrainingKind() types.TrainingKind {
	switch u.TrainingKind {
	case TrainingKindNhsd:
		return types.TrainingKindNHSD
	case TrainingKindUclhIg:
		return types.TrainingKindUCLHIg
	}
	return ""
}
