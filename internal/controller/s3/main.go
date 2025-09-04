package s3

import (
	"context"
	"fmt"
	"net/url"

	"github.com/aws/aws-sdk-go-v2/aws"
	awsConfig "github.com/aws/aws-sdk-go-v2/config"
	awsCredentials "github.com/aws/aws-sdk-go-v2/credentials"
	awsS3Manager "github.com/aws/aws-sdk-go-v2/feature/s3/manager"
	awsS3 "github.com/aws/aws-sdk-go-v2/service/s3"
	awsEndpoints "github.com/aws/smithy-go/endpoints"
	"github.com/google/uuid"
	"github.com/rs/zerolog/log"

	"github.com/ucl-arc-tre/portal/internal/config"
	"github.com/ucl-arc-tre/portal/internal/types"
)

type ClientInterface interface {
	GetObject(
		ctx context.Context,
		input *awsS3.GetObjectInput,
		optFns ...func(*awsS3.Options),
	) (*awsS3.GetObjectOutput, error)
}

type Controller struct {
	client   ClientInterface
	uploader *awsS3Manager.Uploader
}

func New() *Controller {
	credentials := config.S3Credentials()
	log.Debug().Any("accessKeyId", credentials.AccessKeyId).Msg("Creating S3 controller")
	config, err := awsConfig.LoadDefaultConfig(
		context.Background(),
		awsConfig.WithCredentialsProvider(awsCredentials.StaticCredentialsProvider{
			Value: aws.Credentials{
				AccessKeyID:     credentials.AccessKeyId,
				SecretAccessKey: credentials.SecretAccessKey,
			},
		}),
		awsConfig.WithRegion(config.S3Region()),
	)
	if err != nil {
		panic(fmt.Errorf("unable to load AWS SDK config, %v", err))
	}
	client := awsS3.NewFromConfig(
		config,
		awsS3.WithEndpointResolverV2(makeResolver()),
	)
	controller := Controller{
		client:   client,
		uploader: awsS3Manager.NewUploader(client),
	}
	return &controller
}

func (c *Controller) StoreObject(ctx context.Context, id uuid.UUID, obj types.S3UploadObject) error {
	bucketName := aws.String(config.S3BucketName())
	key := aws.String(id.String())
	log.Debug().Any("id", id).Msg("Uploading")
	_, err := c.uploader.Upload(ctx, &awsS3.PutObjectInput{
		Bucket: bucketName,
		Key:    key,
		Body:   obj.Content,
	})
	return err
}

func makeResolver() awsS3.EndpointResolverV2 {
	if config.IsDevDeploy() || config.IsTesting() {
		return DevResolver{}
	}
	return awsS3.NewDefaultEndpointResolverV2()
}

type DevResolver struct{}

func (r DevResolver) ResolveEndpoint(ctx context.Context, params awsS3.EndpointParameters) (
	awsEndpoints.Endpoint, error,
) {
	uri := url.URL{
		Scheme: "http",
		Host:   config.S3Host(),
		Path:   config.S3BucketName(),
	}
	return awsEndpoints.Endpoint{URI: uri}, nil
}
