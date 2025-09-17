package s3

import (
	"context"

	"github.com/aws/aws-sdk-go-v2/aws"
	awsConfig "github.com/aws/aws-sdk-go-v2/config"
	awsCredentials "github.com/aws/aws-sdk-go-v2/credentials"
	awsS3Manager "github.com/aws/aws-sdk-go-v2/feature/s3/manager"
	awsS3 "github.com/aws/aws-sdk-go-v2/service/s3"
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
		log.Err(err).Msg("Failed to load AWS config. Returning a nil controller")
		return nil
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

func (c *Controller) StoreObject(ctx context.Context, metadata ObjectMetadata, obj types.S3Object) error {
	log.Debug().Any("metadata", metadata).Msg("Uploading S3 object")
	_, err := c.uploader.Upload(ctx, &awsS3.PutObjectInput{
		Bucket: aws.String(config.S3BucketName()),
		Key:    aws.String(metadata.Key()),
		Body:   obj.Content,
	})
	return types.NewErrServerError(err)
}

func (c *Controller) GetObject(ctx context.Context, metadata ObjectMetadata) (types.S3Object, error) {
	log.Debug().Any("metadata", metadata).Msg("Downloading S3 object")
	output, err := c.client.GetObject(ctx, &awsS3.GetObjectInput{
		Bucket: aws.String(config.S3BucketName()),
		Key:    aws.String(metadata.Key()),
	})
	if err != nil {
		return types.S3Object{}, types.NewErrServerError(err)
	}
	object := types.S3Object{
		Content:  output.Body,
		NumBytes: output.ContentLength,
	}
	return object, nil
}

func makeResolver() awsS3.EndpointResolverV2 {
	s3DevHostIsSet := config.S3DevHost() != ""
	if s3DevHostIsSet && (!config.IsDevDeploy() && !config.IsTesting()) {
		panic("S3DevHost must be unset unless is dev or test")
	}
	if s3DevHostIsSet {
		log.Warn().Msg("S3DevHost is set - using dev resolver for s3")
		return DevResolver{}
	}
	return awsS3.NewDefaultEndpointResolverV2()
}
