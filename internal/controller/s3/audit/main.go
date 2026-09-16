package s3audit

import (
	"context"
	"fmt"
	"time"

	"github.com/aws/aws-sdk-go-v2/aws"
	awsConfig "github.com/aws/aws-sdk-go-v2/config"
	awsCredentials "github.com/aws/aws-sdk-go-v2/credentials"
	awsS3Manager "github.com/aws/aws-sdk-go-v2/feature/s3/manager"
	awsS3 "github.com/aws/aws-sdk-go-v2/service/s3"
	"github.com/google/uuid"
	"github.com/rs/zerolog/log"

	"github.com/ucl-arc-tre/portal/internal/config"
	"github.com/ucl-arc-tre/portal/internal/controller/s3/dev"
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
	credentials := config.S3AuditCredentials()
	config, err := awsConfig.LoadDefaultConfig(
		context.Background(),
		awsConfig.WithCredentialsProvider(awsCredentials.StaticCredentialsProvider{
			Value: aws.Credentials{
				AccessKeyID:     credentials.AccessKeyId,
				SecretAccessKey: credentials.SecretAccessKey,
			},
		}),

		awsConfig.WithRegion(config.S3AuditRegion()),
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

func (c *Controller) Upload(batch AuditBatch) error {
	date := time.Now().Format(time.DateOnly) // e.g. 2026-02-01
	key := fmt.Sprintf("audit/%s/%s.jsonl", date, uuid.NewString())
	log.Debug().Any("key", key).Msg("Uploading S3 audit batch")

	_, err := c.uploader.Upload(context.Background(), &awsS3.PutObjectInput{
		Bucket: aws.String(config.S3AuditBucketName()),
		Key:    aws.String(key),
		Body:   batch.Body,
	})
	return types.NewErrServerError(err)
}

func makeResolver() awsS3.EndpointResolverV2 {
	s3DevHostIsSet := config.S3DevHost() != ""
	if s3DevHostIsSet && (!config.IsDevDeploy() && !config.IsTesting()) {
		panic("S3DevHost must be unset unless is dev or test")
	}
	if s3DevHostIsSet {
		log.Warn().Msg("S3DevHost is set - using dev resolver for s3")
		return dev.DevResolver{Bucket: config.S3AuditBucketName()}
	}
	return awsS3.NewDefaultEndpointResolverV2()
}
