package web

import (
	"fmt"
	"net/http"
	"regexp"
	"strconv"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/ucl-arc-tre/portal/internal/config"
	"github.com/ucl-arc-tre/portal/internal/middleware"
	openapi "github.com/ucl-arc-tre/portal/internal/openapi/web"
	"github.com/ucl-arc-tre/portal/internal/rbac"
	"github.com/ucl-arc-tre/portal/internal/service/agreements"
	"github.com/ucl-arc-tre/portal/internal/service/studies"
	"github.com/ucl-arc-tre/portal/internal/types"
)

var (
	caserefPattern = regexp.MustCompile(`^[0-9]{1,5}$`)
)

func studyToOpenApiStudy(study types.Study) openapi.Study {
	ownerUserIDStr := study.OwnerUserID.String()
	ownerUsernameStr := string(study.Owner.Username)

	var lastSignoff *string
	if study.LastSignoff != nil {
		formatted := study.LastSignoff.Format(config.TimeFormat)
		lastSignoff = &formatted
	}

	return openapi.Study{
		Id:                               study.ID.String(),
		Title:                            study.Title,
		Description:                      study.Description,
		OwnerUserId:                      &ownerUserIDStr,
		OwnerUsername:                    &ownerUsernameStr,
		ApprovalStatus:                   openapi.ApprovalStatus(study.ApprovalStatus),
		AdditionalStudyAdminUsernames:    study.AdminUsernames(),
		DataControllerOrganisation:       study.DataControllerOrganisation,
		InvolvesUclSponsorship:           study.InvolvesUclSponsorship,
		InvolvesCag:                      study.InvolvesCag,
		CagReference:                     study.CagReference,
		InvolvesEthicsApproval:           study.InvolvesEthicsApproval,
		InvolvesHraApproval:              study.InvolvesHraApproval,
		IrasId:                           study.IrasId,
		IsNhsAssociated:                  study.IsNhsAssociated,
		InvolvesNhsEngland:               study.InvolvesNhsEngland,
		NhsEnglandReference:              study.NhsEnglandReference,
		InvolvesMnca:                     study.InvolvesMnca,
		RequiresDspt:                     study.RequiresDspt,
		RequiresDbs:                      study.RequiresDbs,
		IsDataProtectionOfficeRegistered: study.IsDataProtectionOfficeRegistered,
		DataProtectionNumber:             study.DataProtectionNumber,
		InvolvesThirdParty:               study.InvolvesThirdParty,
		InvolvesExternalUsers:            study.InvolvesExternalUsers,
		InvolvesParticipantConsent:       study.InvolvesParticipantConsent,
		InvolvesIndirectDataCollection:   study.InvolvesIndirectDataCollection,
		InvolvesDataProcessingOutsideEea: study.InvolvesDataProcessingOutsideEea,
		Feedback:                         study.Feedback,
		CreatedAt:                        study.CreatedAt.Format(config.TimeFormat),
		UpdatedAt:                        study.UpdatedAt.Format(config.TimeFormat),
		LastSignoff:                      lastSignoff,
		Caseref:                          study.Caseref,
	}
}

func (h *Handler) studiesAll(params openapi.GetStudiesParams) ([]types.Study, error) {
	if !params.Valid() {
		return []types.Study{}, types.NewErrInvalidObject("invalid query param")
	}
	if params.MaxItems != nil && *params.MaxItems > 50 {
		return []types.Study{}, types.NewErrInvalidObject("maxItems cannot be greater than 50")
	} else if params.MaxItems == nil {
		*params.MaxItems = 50
	}
	queryParams := studies.QueryParams{
		ApprovalStatus: params.Status,
		CaseRef:        params.Caseref,
		FuzzyTitle:     params.FuzzyTitle,
		OwnerUsername:  params.OwnerUsername,
		MaxItems:       *params.MaxItems,
	}
	if queryIsCaseref(params.Query) {
		caseref, err := strconv.Atoi(*params.Query)
		if err != nil {
			return []types.Study{}, types.NewErrInvalidObject("caseref was not int")
		}
		queryParams.CaseRef = &caseref
	} else if queryIsOwnerUsername(params.Query) {
		queryParams.OwnerUsername = params.Query
	} else if params.Query != nil {
		queryParams.FuzzyTitle = params.Query
	} 
queryParams := studies.QueryParams{
	ApprovalStatus: params.Status,
	CaseRef:        params.Caseref,
	FuzzyTitle:     params.FuzzyTitle,
	OwnerUsername:  params.OwnerUsername,
	MaxItems:       50,
}
if queryIsCaseref(params.Query) {
	caseref, err := strconv.Atoi(*params.Query)
if err != nil {
	return []types.Study{}, types.NewErrInvalidObject("caseref was not int")
}
	queryParams.CaseRef = &caseref
} else if queryIsOwnerUsername(params.Query) {
	queryParams.OwnerUsername = params.Query
} else if params.Query != nil {
	queryParams.FuzzyTitle = params.Query
}
if params.MaxItems != nil {
	queryParams.MaxItems = *params.MaxItems
}
	return h.studies.AllStudies(queryParams)
}

func queryIsCaseref(query *string) bool {
	if query == nil {
		return false
	} else if len(*query) > 5 {
		return false
	}
	return caserefPattern.MatchString(strings.TrimLeft(*query, "0"))
}

func queryIsOwnerUsername(query *string) bool {
	if query == nil {
		return false
	}
	return types.Username(*query).IsValid()
}

func (h *Handler) studiesStudyOwner(user types.User) ([]types.Study, error) {
	// Non-admin users can only see studies they own

	studyIds, err := rbac.StudyIDsWithRole(user, rbac.StudyOwner)
	if err != nil {
		return []types.Study{}, err
	}

	studies, err := h.studies.StudiesById(studyIds...)
	if err != nil {
		return []types.Study{}, err
	}

	return studies, nil
}

func (h *Handler) GetStudies(ctx *gin.Context, params openapi.GetStudiesParams) {
	user := middleware.GetUser(ctx)

	isAdminOrIGOps, err := rbac.HasAnyListedRole(user, rbac.Admin, rbac.IGOpsStaff)
	if err != nil {
		setError(ctx, err, "Failed to check user roles")
		return
	}

	var studies []types.Study
	if isAdminOrIGOps {
		studies, err = h.studiesAll(params)
	} else {
		studies, err = h.studiesStudyOwner(user)
	}
	if err != nil {
		setError(ctx, err, "Failed to get studies")
		return
	}

	response := []openapi.Study{}
	for _, study := range studies {
		response = append(response, studyToOpenApiStudy(study))
	}

	ctx.JSON(http.StatusOK, response)
}

func (h *Handler) GetStudiesStudyId(ctx *gin.Context, studyId string) {
	studyUUID, err := parseUUIDOrSetError(ctx, studyId)
	if err != nil {
		return
	}

	studies, err := h.studies.StudiesById(studyUUID)
	if err != nil {
		setError(ctx, err, "Failed to retrieve study")
		return
	}
	if len(studies) == 0 {
		setError(ctx, types.NewNotFoundError(fmt.Errorf("study [%v] not found", studyUUID)), "Not found")
		return
	}

	ctx.JSON(http.StatusOK, studyToOpenApiStudy(studies[0]))
}

func (h *Handler) PostStudies(ctx *gin.Context) {
	studyData := openapi.StudyRequest{}
	if err := bindJSONOrSetError(ctx, &studyData); err != nil {
		return
	}

	user := middleware.GetUser(ctx)
	validationError, err := h.studies.CreateStudy(ctx, user, studyData)
	if err != nil {
		setError(ctx, err, "Failed to create study")
		return
	} else if validationError != nil {
		ctx.JSON(http.StatusBadRequest, *validationError)
		return
	}

	ctx.Status(http.StatusCreated)
}

// confirms a study agreement for the study ID and user
func (h *Handler) PostStudiesStudyIdAgreements(ctx *gin.Context, studyId string) {
	studyUUID, err := parseUUIDOrSetError(ctx, studyId)
	if err != nil {
		return
	}

	confirmation := openapi.AgreementConfirmation{}
	if err := bindJSONOrSetError(ctx, &confirmation); err != nil {
		return
	}

	agreementId, err := parseUUIDOrSetError(ctx, confirmation.AgreementId)
	if err != nil {
		return
	}

	user := middleware.GetUser(ctx)
	if err := h.studies.ConfirmStudyAgreement(user, studyUUID, agreementId); err != nil {
		setError(ctx, err, "Failed to confirm study agreement")
		return
	}

	agreementType, err := h.agreements.AgreementTypeById(agreementId)
	if err != nil {
		setError(ctx, err, "Failed to get agreement type")
		return
	}
	switch *agreementType {
	case agreements.StudyOwnerType:
		if _, err := rbac.AddRole(user, rbac.InformationAssetOwner); err != nil {
			setError(ctx, err, "Failed to assign IAO role")
			return
		}
	}

	ctx.Status(http.StatusOK)
}

func (h *Handler) GetStudiesStudyIdAgreements(ctx *gin.Context, studyId string) {
	studyUUID, err := parseUUIDOrSetError(ctx, studyId)
	if err != nil {
		return
	}

	usernames, err := h.studies.GetStudyAgreementSignatureUsernames(studyUUID)
	if err != nil {
		setError(ctx, err, "Failed to get study agreements")
		return
	}
	studyAgreements := openapi.StudyAgreements{Usernames: []string{}}
	for _, username := range usernames {
		studyAgreements.Usernames = append(studyAgreements.Usernames, string(username))
	}

	ctx.JSON(http.StatusOK, studyAgreements)
}

func (h *Handler) PostStudiesAdminStudyIdReview(ctx *gin.Context, studyId string) {
	review := openapi.StudyReview{}
	if err := bindJSONOrSetError(ctx, &review); err != nil {
		return
	}

	studyUUID, err := parseUUIDOrSetError(ctx, studyId)
	if err != nil {
		return
	}

	err = h.studies.UpdateStudyReview(studyUUID, review)
	if err != nil {
		setError(ctx, err, "Failed to update study feedback")
		return
	}

	err = h.studies.SendReviewEmailNotification(ctx, studyUUID, review)
	if err != nil {
		setError(ctx, err, "Failed to send study notification")
		return
	}

	ctx.Status(http.StatusOK)
}

func (h *Handler) PatchStudiesStudyIdPending(ctx *gin.Context, studyId string) {
	review := openapi.StudyReview{
		Status: openapi.Pending,
	}

	studyUUID, err := parseUUIDOrSetError(ctx, studyId)
	if err != nil {
		return
	}

	err = h.studies.UpdateStudyReview(studyUUID, review)
	if err != nil {
		setError(ctx, err, "Failed to update study feedback")
		return
	}

	err = h.studies.SendReviewEmailNotification(ctx, studyUUID, review)
	if err != nil {
		setError(ctx, err, "Failed to send study notification")
		return
	}

	ctx.Status(http.StatusOK)
}

func (h *Handler) PutStudiesStudyId(ctx *gin.Context, studyId string) {
	studyUUID, err := parseUUIDOrSetError(ctx, studyId)
	if err != nil {
		return
	}
	studyData := openapi.StudyRequest{}
	if err := bindJSONOrSetError(ctx, &studyData); err != nil {
		return
	}
	validationError, err := h.studies.ValidateStudyData(ctx, studyData, true)
	if err != nil {
		setError(ctx, err, "Failed to validate study data")
		return
	} else if validationError != nil {
		ctx.JSON(http.StatusBadRequest, *validationError)
		return
	}
	err = h.studies.UpdateStudy(studyUUID, studyData)
	if err != nil {
		setError(ctx, err, "Failed to update study")
		return
	}

	ctx.Status(http.StatusOK)
}
