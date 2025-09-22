#!/bin/sh

BUCKET_NAME="bucket-name" # Must match s3.bucket in the api config.yaml

# See https://github.com/seaweedfs/seaweedfs/issues/6542
weed server \
  -s3 \
  -master.volumeSizeLimitMB=100 \
  -master.electionTimeout=1s \
  -master.volumePreallocate=false &

# Bucket must be created non-lazily, so loop until it is
until echo "s3.bucket.list" | weed shell | grep "$BUCKET_NAME"; do
  sleep 1 && echo "s3.bucket.create -name $BUCKET_NAME" | weed shell
done
echo "✅ bucket created"

sleep infinity
