package types

type EnvironmentName string

type Environment struct {
	ModelAuditable
	Name EnvironmentName `gorm:"uniqueIndex"`
	Tier int             `gorm:"not null"` // Accepts data of <= this sensitivity tier. See: https://isms.arc.ucl.ac.uk/rism06-data_classification_and_environment_tiering_policy/#4-environment-tiers-and-data-classification

}
