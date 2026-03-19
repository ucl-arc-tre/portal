package openapi

func (s GetStudiesParams) IsValid() bool {
	if s.Query != nil && (s.Caseref != nil || s.Name != nil || s.OwnerUsername != nil || s.Status != nil) {
		return false
	}
	if s.Status != nil && !s.Status.Valid() {
		return false
	}
	return true
}
