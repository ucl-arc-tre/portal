package environments

import (
	"github.com/ucl-arc-tre/portal/internal/graceful"
	"github.com/ucl-arc-tre/portal/internal/types"
)

func GetAll() ([]types.Environment, error) {
	db := graceful.NewDB()

	var environments []types.Environment
	if err := db.Find(&environments).Error; err != nil {
		return nil, types.NewErrFromGorm(err)
	}

	return environments, nil
}
