package openapi

func (s GetStudiesParams) Valid() bool {
	if s.Query != nil && (s.Caseref != nil || s.FuzzyTitle != nil || s.OwnerUsername != nil) {
		return false
	}
	if s.Status != nil && !s.Status.Valid() {
		return false
	}
	return true
}
