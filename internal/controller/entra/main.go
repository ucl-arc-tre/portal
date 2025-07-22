package entra

import (
	"context"
	"fmt"
	"time"

	"github.com/Azure/azure-sdk-for-go/sdk/azidentity"
	"github.com/hashicorp/golang-lru/v2/expirable"
	graph "github.com/microsoftgraph/msgraph-sdk-go"
	graphusers "github.com/microsoftgraph/msgraph-sdk-go/users"

	"github.com/rs/zerolog/log"
	"github.com/ucl-arc-tre/portal/internal/config"
	"github.com/ucl-arc-tre/portal/internal/types"
)

type Controller struct {
	client        *graph.GraphServiceClient
	userDataCache *expirable.LRU[types.Username, UserData]
}

// Create a new entra controller using client credentials
func New(cacheTTL time.Duration) *Controller {
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
	return &Controller{
		client:        graphClient,
		userDataCache: expirable.NewLRU[types.Username, UserData](1000, nil, cacheTTL),
	}
}

func (c *Controller) UserData(ctx context.Context, username types.Username) (*UserData, error) {
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
