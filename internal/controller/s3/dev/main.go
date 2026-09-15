package dev

import (
	"context"
	"net/url"

	awsS3 "github.com/aws/aws-sdk-go-v2/service/s3"
	awsEndpoints "github.com/aws/smithy-go/endpoints"

	"github.com/ucl-arc-tre/portal/internal/config"
)

type DevResolver struct {
	Bucket string
}

func (r DevResolver) ResolveEndpoint(ctx context.Context, params awsS3.EndpointParameters) (
	awsEndpoints.Endpoint, error,
) {
	uri := url.URL{
		Scheme: "http",
		Host:   config.S3DevHost(),
		Path:   r.Bucket,
	}
	return awsEndpoints.Endpoint{URI: uri}, nil
}
