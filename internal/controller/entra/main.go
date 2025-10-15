package entra

import (
	"context"
	"errors"
	"fmt"
	"regexp"
	"strings"
	"time"

	"github.com/Azure/azure-sdk-for-go/sdk/azidentity"
	"github.com/google/uuid"
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

var (
	employeeTypeStaffPattern = regexp.MustCompile(`(?i)(?:^|\s|,)staff(?:,|$)`)
)

var controller *Controller

type Controller struct {
	client        *graph.GraphServiceClient
	mailClient    *graph.GraphServiceClient
	userDataCache *expirable.LRU[types.Username, UserData]
}

func newGraphClient(credentials config.EntraCredentialBundle) *graph.GraphServiceClient {
	azCredentials, err := azidentity.NewClientSecretCredential(
		credentials.TenantID,
		credentials.ClientID,
		credentials.ClientSecret,
		nil,
	)
	if err != nil {
		log.Err(err).Msg("Failed to create msgraph client credentials")
		return nil
	}
	scopes := []string{"https://graph.microsoft.com/.default"}
	graphClient, err := graph.NewGraphServiceClientWithCredentials(azCredentials, scopes)
	if err != nil {
		log.Err(err).Msg("Failed to create msgraph client")
		return nil
	}
	return graphClient
}

// Create or get a new entra controller using client credentials
func New() *Controller {
	if controller != nil {
		return controller
	}
	log.Info().Float64("cacheTTL seconds", cacheTTL.Seconds()).Msg("Creating entra controller")
	// See: https://learn.microsoft.com/en-us/graph/sdks/choose-authentication-providers?tabs=go#client-credentials-provider

	graphClient := newGraphClient(config.EntraCredentials())
	mailClient := newGraphClient(config.EntraMailCredentials())

	controller = &Controller{
		client:        graphClient,
		mailClient:    mailClient,
		userDataCache: expirable.NewLRU[types.Username, UserData](1000, nil, cacheTTL),
	}
	return controller
}

func userIdForExternal(username types.Username) (string, error) {
	if config.EntraTenantPrimaryDomain() == "" {
		return "", types.NewErrServerError("Entra tenant primary domain is not set")
	}

	parts := strings.Split(string(username), "@")
	if len(parts) != 2 {
		return "", types.NewErrInvalidObject("invalid email")
	}

	domain := parts[1]

	userId := fmt.Sprintf("%s_%s#EXT#@%s", parts[0], domain, config.EntraTenantPrimaryDomain())
	return userId, nil
}

// Get the cached user data for a user
func (c *Controller) userData(ctx context.Context, username types.Username) (*UserData, error) {
	userId := ""
	if usernameIsExternal(username) {
		externalUserId, err := userIdForExternal(username)
		if err != nil {
			return nil, err
		}
		userId = externalUserId
	} else {
		userId = string(username)
	}

	if userData, exists := c.userDataCache.Get(username); exists {
		return &userData, nil
	}
	configuration := &graphusers.UserItemRequestBuilderGetRequestConfiguration{
		QueryParameters: &graphusers.UserItemRequestBuilderGetQueryParameters{
			Select: []string{"mail", "employeeType", "id"},
		},
	}
	data, err := c.client.Users().ByUserId(userId).Get(ctx, configuration)
	if err != nil && strings.Contains(err.Error(), "does not exist") {
		return nil, types.NewNotFoundError(fmt.Errorf("user [%v] not found in entra directory", username))
	} else if err != nil {
		return nil, types.NewErrServerError(fmt.Errorf("unknown entra error: %v", err))
	} else if data.GetId() == nil {
		return nil, types.NewNotFoundError(fmt.Errorf("user [%v] had no entra id", username))
	}

	userData := UserData{
		Id:           mustParseUserObjectId(data),
		Email:        data.GetMail(),
		EmployeeType: data.GetEmployeeType(),
	}
	_ = c.userDataCache.Add(username, userData)

	return &userData, nil
}

// checks if the user (e.g. abc@ucl.ac.uk) is a staff member based on their employee type. Returns a cached response
func (c *Controller) IsStaffMember(ctx context.Context, username types.Username) (bool, error) {
	if username == "" {
		return false, types.NewErrInvalidObject("username cannot be empty")
	}

	userData, err := c.userData(ctx, types.Username(username))
	if err != nil {
		return false, err
	}

	log.Debug().Any("userData", userData).Any("username", username).Msg("Retrieved user data from Entra")

	if userData.EmployeeType == nil || *userData.EmployeeType == "" {
		return false, types.NewNotFoundError("employee type unset")
	}

	return employeeTypeIsStaff(*userData.EmployeeType), nil
}

func (c *Controller) SendInvite(ctx context.Context, email string, sponsor types.Sponsor) (*InvitedUserData, error) {
	user, err := c.userData(ctx, types.Username(email))
	if err == nil {
		log.Debug().Any("user", user).Msg("User already exists in entra")
		return c.sendInviteExistingEntraUser(ctx, email, sponsor)
	} else if errors.Is(err, types.ErrNotFound) {
		return c.sendInviteNewEntraUser(ctx, email, sponsor)
	} else {
		return nil, err
	}
}

func (c *Controller) sendInviteExistingEntraUser(ctx context.Context, email string, sponsor types.Sponsor) (*InvitedUserData, error) {
	log.Debug().Str("email", email).Msg("Inviting existing entra user to portal")

	user, err := c.userData(ctx, types.Username(email))
	if err != nil {
		return nil, err
	}
	if err := c.SendCustomInviteNotification(ctx, email, sponsor); err != nil {
		return nil, err
	}
	return &InvitedUserData{Id: user.Id}, nil
}

func (c *Controller) sendInviteNewEntraUser(ctx context.Context, email string, sponsor types.Sponsor) (*InvitedUserData, error) {
	log.Debug().Str("email", email).Msg("Inviting new entra user to portal")

	requestBody := graphmodels.NewInvitation()
	invitedUserEmailAddress := email
	inviteRedirectUrl := config.EntraInviteRedirectURL()
	sendInvitationMessage := true

	requestBody.SetInvitedUserEmailAddress(&invitedUserEmailAddress)
	requestBody.SetInviteRedirectUrl(&inviteRedirectUrl)
	requestBody.SetSendInvitationMessage(&sendInvitationMessage)

	message := ""
	if sponsor.ChosenName != "" {
		message = "You have been invited to join the UCL ARC Services Portal by " + string(sponsor.ChosenName)
	} else {
		message = "You have been invited to join the UCL ARC Services Portal by " + string(sponsor.Username)
	}
	messageInfo := graphmodels.NewInvitedUserMessageInfo()
	messageInfo.SetCustomizedMessageBody(&message)
	requestBody.SetInvitedUserMessageInfo(messageInfo)

	sponsorData, err := c.client.Users().ByUserId(string(sponsor.Username)).Get(ctx,
		&graphusers.UserItemRequestBuilderGetRequestConfiguration{
			QueryParameters: &graphusers.UserItemRequestBuilderGetQueryParameters{
				Select: []string{"id"},
			},
		},
	)
	if err != nil {
		return nil, types.NewErrServerError(fmt.Errorf("failed to get sponsor [%v] entra identity", sponsor.Username))
	}

	// NOTE: the below should work but doesn't
	//requestBody.SetInvitedUserSponsors([]graphmodels.DirectoryObjectable{
	//	sponsorData,
	//})
	// so use the raw additional data instead
	requestBody.SetAdditionalData(map[string]any{
		"invitedUserSponsors": []map[string]string{{
			"id": mustParseUserObjectId(sponsorData).String(),
		}},
	})

	response, err := c.client.Invitations().Post(ctx, requestBody, nil)
	if err != nil {
		if strings.Contains(err.Error(), "already exists") {
			// bit of a mystery how this ends up being triggered, will investigate on other deployments
			log.Warn().Any("email", email).Msg("user supposedly didn't exist but invitation thinks otherwise")
			return c.sendInviteExistingEntraUser(ctx, email, sponsor)
		}
		log.Debug().Err(err).Msg("Failed to invite user to entra")
		return nil, types.NewErrServerError(err)
	}
	if response.GetInvitedUser() == nil || response.GetInvitedUser().GetId() == nil {
		return nil, types.NewErrServerError("invite response did not contain id of user")
	}
	return &InvitedUserData{Id: mustParseUserObjectId(response.GetInvitedUser())}, nil
}

func (c *Controller) AddtoInvitedUserGroup(ctx context.Context, user InvitedUserData) error {
	log.Debug().Str("objectId", user.Id.String()).Msg("Adding invited user to invited user group")

	groupId := config.EntraInvitedUserGroup()
	requestBody := graphmodels.NewReferenceCreate()
	odataId := fmt.Sprintf("https://graph.microsoft.com/v1.0/directoryObjects/%v", user.Id.String())
	requestBody.SetOdataId(&odataId)

	err := c.client.Groups().ByGroupId(groupId).Members().Ref().Post(ctx, requestBody, nil)
	return types.NewErrServerError(err)
}

func employeeTypeIsStaff(employeeType string) bool {
	return employeeTypeStaffPattern.MatchString(employeeType)
}

// FindUsernames searches entra for usernames given a query of email, user principal or display name
func (c *Controller) FindUsernames(ctx context.Context, query string) ([]types.Username, error) {
	queryRegex := regexp.MustCompile(`^\w[\w.\s0-9@-]+\w$`)
	queryIsValid := queryRegex.MatchString(query)
	if !queryIsValid {
		return nil, types.NewErrInvalidObject(fmt.Sprintf("invalid query [%v]", query))
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
		return nil, types.NewErrServerError(err)
	}

	usernames := []types.Username{}

	userMatches := data.GetValue()
	for _, user := range userMatches {
		if user.GetUserPrincipalName() != nil {
			usernames = append(usernames, types.Username(*user.GetUserPrincipalName()))
		}
	}
	return usernames, nil
}

func usernameIsExternal(username types.Username) bool {
	return !strings.HasSuffix(string(username), config.EntraTenantPrimaryDomain())
}

func mustParseUserObjectId(model graphmodels.Userable) ObjectId {
	return ObjectId(uuid.MustParse(*model.GetId()))
}
