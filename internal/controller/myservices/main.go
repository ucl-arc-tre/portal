package myservices

import (
	"context"
	"fmt"
	"net/http"

	"github.com/Azure/azure-sdk-for-go/sdk/azcore/policy"
	"github.com/Azure/azure-sdk-for-go/sdk/azidentity"
	"github.com/rs/zerolog/log"
	"github.com/ucl-arc-tre/portal/internal/config"
)

type Controller struct {
	client *ClientWithResponses
}

func New() *Controller {
	cfg := config.Myservicies()

	if !cfg.Enabled {
		log.Warn().Msg("Myservices integration disabled - nil controller")
		return nil
	}

	azCredentials, err := azidentity.NewClientSecretCredential(
		cfg.TenantID,
		cfg.ClientID,
		cfg.ClientSecret,
		nil,
	)
	if err != nil {
		panic(fmt.Errorf("failed to create az credentials: %v", err))
	}

	addAuth := func(ctx context.Context, req *http.Request) error {
		token, err := azCredentials.GetToken(ctx, policy.TokenRequestOptions{})
		if err != nil {
			log.Err(err).Msg("Failed to get token for request")
		} else {
			req.Header.Set("Authorization", fmt.Sprintf("Bearer %s", token.Token))
		}
		return nil
	}
	opts := func(c *Client) error {
		c.RequestEditors = append(c.RequestEditors, addAuth)
		return nil
	}
	client, err := NewClientWithResponses(cfg.URL, opts)
	if err != nil {
		panic(fmt.Errorf("failed to initialise myservicies client [%v]", err))
	}

	return &Controller{client: client}
}
