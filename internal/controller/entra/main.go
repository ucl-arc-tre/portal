package entra

import (
	"context"
	"fmt"
	"regexp"
	"strings"
	"time"

	"github.com/Azure/azure-sdk-for-go/sdk/azidentity"
	"github.com/hashicorp/golang-lru/v2/expirable"
	abstractions "github.com/microsoft/kiota-abstractions-go"
	graph "github.com/microsoftgraph/msgraph-sdk-go"
	graphmodels "github.com/microsoftgraph/msgraph-sdk-go/models"
	graphusers "github.com/microsoftgraph/msgraph-sdk-go/users"

	"github.com/rs/zerolog/log"
	"github.com/ucl-arc-tre/portal/internal/config"
	"github.com/ucl-arc-tre/portal/internal/types"
)

const (
	cacheTTL = 12 * time.Hour
)

var controller *Controller

type Controller struct {
	client        *graph.GraphServiceClient
	userDataCache *expirable.LRU[types.Username, UserData]
}

// Create or get a new entra controller using client credentials
func New() *Controller {
	if controller != nil {
		return controller
	}
	log.Info().Float64("cacheTTL seconds", cacheTTL.Seconds()).Msg("Creating entra controller")
	credentials := config.EntraCredentials()
	// See: https://learn.microsoft.com/en-us/graph/sdks/choose-authentication-providers?tabs=go#client-credentials-provider
	azCredentials, err := azidentity.NewClientSecretCredential(
		credentials.TenantID,
		credentials.ClientID,
		credentials.ClientSecret,
		nil,
	)
	if err != nil {
		panic(fmt.Errorf("failed to create msgraph client credentials [%v]", err))
	}
	scopes := []string{"https://graph.microsoft.com/.default"}
	graphClient, err := graph.NewGraphServiceClientWithCredentials(azCredentials, scopes)
	if err != nil {
		panic(fmt.Errorf("failed to create msgraph client [%v]", err))
	}
	controller = &Controller{
		client:        graphClient,
		userDataCache: expirable.NewLRU[types.Username, UserData](1000, nil, cacheTTL),
	}
	return controller
}

func entraUsernameForExternalEmail(email string) (string, error) {
	if config.EntraTenantPrimaryDomain() == "" {
		return "", types.NewErrServerError("Entra tenant primary domain is not set")
	}

	parts := strings.Split(email, "@")
	if len(parts) != 2 {
		return email, types.NewErrInvalidObject("invalid email")
	}

	domain := parts[1]

	newEmail := fmt.Sprintf("%s_%s#EXT#@%s", parts[0], domain, config.EntraTenantPrimaryDomain())
	return newEmail, nil
}

// Get the cached user data for a user
func (c *Controller) userData(ctx context.Context, username types.Username) (*UserData, error) {

	if !strings.HasSuffix(string(username), config.EntraTenantPrimaryDomain()) {

		extFormatEmail, err := entraUsernameForExternalEmail(string(username))
		if err != nil {

			return nil, err
		}
		username = types.Username(extFormatEmail)
	}

	if userData, exists := c.userDataCache.Get(username); exists {
		return &userData, nil
	}
	configuration := &graphusers.UserItemRequestBuilderGetRequestConfiguration{
		QueryParameters: &graphusers.UserItemRequestBuilderGetQueryParameters{
			Select: []string{"mail", "employeeType", "id"},
		},
	}
	data, err := c.client.Users().ByUserId(string(username)).Get(ctx, configuration)
	if err != nil {
		return nil, err
	}
	userData := UserData{Email: data.GetMail(), EmployeeType: data.GetEmployeeType(), Id: data.GetId()}
	_ = c.userDataCache.Add(username, userData)

	return &userData, nil
}

// checks if the user (e.g. abc@ucl.ac.uk) is a staff member based on their employee type. Returns a cached response
func (c *Controller) IsStaffMember(ctx context.Context, username types.Username) (bool, error) {
	if username == "" {
		return false, types.NewErrInvalidObject("username cannot be empty")
	}

	userData, err := c.userData(ctx, types.Username(username))
	if err != nil && strings.Contains(err.Error(), "does not exist") {
		return false, types.NewNotFoundError(fmt.Errorf("user [%v] not found in entra directory", username))
	} else if err != nil {
		return false, types.NewErrServerError(fmt.Errorf("unknown entra error: %v", err))
	}

	log.Debug().Any("userData", userData).Any("username", username).Msg("Retrieved user data from Entra")

	if userData.EmployeeType == nil || *userData.EmployeeType == "" {
		return false, types.NewNotFoundError("employee type unset")
	}

	isStaff := strings.ToLower(*userData.EmployeeType) == "staff"

	return isStaff, nil
}

func (c *Controller) SendInvite(ctx context.Context, email string, sponsor types.Sponsor) error {

	// check if user exists in entra, if yes, don't send invite
	user, err := c.userData(ctx, types.Username(email))
	if err != nil {
		return err
	}

	if user != nil {
		log.Debug().Any("user", user).Msg("User already exists in entra")
		return nil
	}

	requestBody := graphmodels.NewInvitation()
	invitedUserEmailAddress := email
	inviteRedirectUrl := config.EntraInviteRedirectURL()
	sendInvitationMessage := true

	requestBody.SetInvitedUserEmailAddress(&invitedUserEmailAddress)
	requestBody.SetInviteRedirectUrl(&inviteRedirectUrl)
	requestBody.SetSendInvitationMessage(&sendInvitationMessage)

	message := ""
	if sponsor.ChosenName != "" {
		message = "You have been invited to join the UCL ARC Portal by " + string(sponsor.ChosenName)
	} else {
		message = "You have been invited to join the UCL ARC Portal by " + string(sponsor.Username)
	}
	messageInfo := graphmodels.NewInvitedUserMessageInfo()

	messageInfo.SetCustomizedMessageBody(&message)
	requestBody.SetInvitedUserMessageInfo(messageInfo)

	_, err = c.client.Invitations().Post(ctx, requestBody, nil)
	if err != nil {
		return types.NewErrServerError(err)
	}
	return nil
}

func (c *Controller) AddtoInvitedUserGroup(ctx context.Context, email string) error {

	user, err := c.userData(ctx, types.Username(email))
	if err != nil {
		return err
	}

	groupId := config.EntraInvitedUserGroup()
	requestBody := graphmodels.NewReferenceCreate()
	odataId := fmt.Sprintf("https://graph.microsoft.com/v1.0/directoryObjects/%s", *user.Id)
	requestBody.SetOdataId(&odataId)

	err = c.client.Groups().ByGroupId(groupId).Members().Ref().Post(ctx, requestBody, nil)
	return err

}

// FindUsernames searches entra for usernames given a query of email, user principal or display name
func (c *Controller) FindUsernames(ctx context.Context, query string) ([]types.Username, error) {
	queryRegex := regexp.MustCompile(`^\w[\w.\s0-9@]+\w$`)
	queryIsValid := queryRegex.MatchString(query)
	if !queryIsValid {
		return nil, types.NewErrInvalidObject("invalid query")
	}

	filterQuery := fmt.Sprintf(
		`startswith(displayName,'%s') or startswith(userPrincipalName,'%s') or startswith(givenName,'%s') or startswith(mail,'%s')`,
		query, query, query, query,
	)
	resultLimit := int32(20) // limits to 20 results or 20 per page if more than 20 results

	headers := abstractions.NewRequestHeaders()

	configuration := &graphusers.UsersRequestBuilderGetRequestConfiguration{
		Headers: headers,
		QueryParameters: &graphusers.UsersRequestBuilderGetQueryParameters{
			Filter: &filterQuery,
			Top:    &resultLimit,
		},
	}

	data, err := c.client.Users().Get(ctx, configuration)
	if err != nil {
		return nil, err
	}

	userMatches := data.GetValue()
	if userMatches == nil {
		return nil, types.NewNotFoundError("no users matching query found in tenant")
	} else {
	}
	usernames := []types.Username{}
	for _, user := range userMatches {
		if user.GetUserPrincipalName() != nil {
			usernames = append(usernames, types.Username(*user.GetUserPrincipalName()))
		}
	}
	return usernames, nil

}
