#!/bin/sh

# See https://github.com/seaweedfs/seaweedfs/issues/6542
weed server \
  -s3 \
  -master.volumeSizeLimitMB=100 \
  -master.volumePreallocate=false \
  -master.raftHashicorp &

until echo "" | weed shell | grep -v "error"; do
  echo "waiting for weed startup..." && sleep 1
done

# Bucket must be created non-lazily
echo "s3.bucket.create -name bucket-name" | weed shell

sleep infinity
