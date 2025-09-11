#!/bin/sh

# See https://github.com/seaweedfs/seaweedfs/issues/6542
weed server \
  -s3 \
  -master.volumeSizeLimitMB=100 \
  -master.electionTimeout=1s \
  -master.volumePreallocate=false &

until echo "" | weed shell | grep -v "error"; do
  echo "waiting for weed startup..." && sleep 1
done

# Bucket must be created non-lazily. Name must match s3.bucket in the api config.yaml
echo "s3.bucket.create -name bucket-name" | weed shell

sleep infinity
