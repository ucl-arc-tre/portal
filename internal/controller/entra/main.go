package entra

import (
	"context"
	"fmt"
	"strings"
	"time"

	"github.com/Azure/azure-sdk-for-go/sdk/azidentity"
	"github.com/hashicorp/golang-lru/v2/expirable"
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

// Get the cached user data for a user
func (c *Controller) userData(ctx context.Context, username types.Username) (*UserData, error) {
	if userData, exists := c.userDataCache.Get(username); exists {
		return &userData, nil
	}
	configuration := &graphusers.UserItemRequestBuilderGetRequestConfiguration{
		QueryParameters: &graphusers.UserItemRequestBuilderGetQueryParameters{
			Select: []string{"mail", "employeeType"},
		},
	}
	data, err := c.client.Users().ByUserId(string(username)).Get(ctx, configuration)
	if err != nil {
		return nil, err
	}
	userData := UserData{Email: data.GetMail(), EmployeeType: data.GetEmployeeType()}
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
		return false, types.NewNotFoundError("user not found in entra directory")
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

	_, err := c.client.Invitations().Post(ctx, requestBody, nil)
	if err != nil {
		return types.NewErrServerError(err)
	}
	return nil
}
