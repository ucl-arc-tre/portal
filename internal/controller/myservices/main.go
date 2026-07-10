package myservices

import (
	"context"
	"fmt"
	"net/http"

	"github.com/Azure/azure-sdk-for-go/sdk/azcore/policy"
	"github.com/Azure/azure-sdk-for-go/sdk/azidentity"
	"github.com/rs/zerolog/log"
	"github.com/ucl-arc-tre/portal/internal/config"
	"github.com/ucl-arc-tre/portal/internal/types"
)

const (
	sourceIdentity  = "arc-portal"
	serviceInstance = "ARC Services Portal"
)

type Controller struct {
	client         *ClientWithResponses
	supportDomain  string
	requestorEmail string
}

func New() *Controller {
	cfg := config.Myservicies()

	if !cfg.Enabled {
		log.Warn().Msg("Myservices integration disabled - nil controller")
		return &Controller{}
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

	scopes := []string{
		fmt.Sprintf("%s/.default", cfg.APIClientID),
	}
	addAuth := func(ctx context.Context, req *http.Request) error {
		token, err := azCredentials.GetToken(ctx, policy.TokenRequestOptions{Scopes: scopes})
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

	return &Controller{client: client, supportDomain: cfg.SupportDomain, requestorEmail: cfg.RequestorEmail}
}

func (c *Controller) SubmitFeedback(ctx context.Context, user types.User, message string) error {
	if c.client == nil {
		return types.NewErrServerError("no client")
	}

	fields := map[string]any{
		"request_description": fmt.Sprintf(
			"%s has provided the following feedback from the portal:\n\n%s",
			user.Username,
			message,
		),
	}
	data := PostRequestsJSONRequestBody{
		RequestedByEmail:  &c.requestorEmail,
		RequestedForEmail: &c.requestorEmail,
		SourceId:          new(sourceIdentity),
		Subject:           new("Feedback"),
		CustomFields:      &fields,
		SupportDomain:     c.supportDomain,
		ServiceInstance:   new(serviceInstance),
		TemplateName:      "arc_services_portal_help_or_advice", // ask Roy Thompson for these values. const
	}
	resp, err := c.client.PostRequestsWithResponse(ctx, data)
	if err != nil {
		return types.NewErrServerError(err)
	} else if resp.JSON400 != nil {
		return types.NewErrInvalidObjectF("myservices API request error: %s", marshalError(resp.JSON400))
	} else if resp.JSON500 != nil {
		return types.NewErrServerErrorF("myservices API request error: %s", marshalError(resp.JSON500))
	} else if resp.StatusCode() >= 300 {
		return types.NewErrServerErrorF("myservices API request failed with code: %d. body: %s", resp.StatusCode(), string(resp.Body))
	}
	log.Debug().Any("response", resp.JSON200).Msg("Submitted feedback request")
	return nil
}

func marshalError(e *Error) string {
	if e == nil {
		return ""
	} else if e.Message == nil {
		return "no message"
	}
	return *e.Message
}
