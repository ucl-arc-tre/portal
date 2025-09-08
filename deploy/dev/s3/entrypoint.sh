#!/bin/sh

# See https://github.com/seaweedfs/seaweedfs/issues/6542
weed server \
  -s3 \
  -filer.saveToFilerLimit=0 \
  -master.volumeSizeLimitMB=100 \
  -master.volumePreallocate=false \
  -volume.max=1 \
  -master.raftHashicorp &

# Bucket must be created non-lazily
sleep 1
echo "s3.bucket.create -name bucket-name" | weed shell

sleep infinity
