#!/bin/bash
CURRENT_BRANCH_NAME=$TRAVIS_PULL_REQUEST_BRANCH
S3_PATH=s3://$S3_BUCKET
IS_PULL_REQUEST="true"
CF_HighLow_DISTRIBUTION_ID=$CF_HighLow_STAGING_ID

# install aws cli
pip install --user awscli
export PATH=$PATH:$HOME/.local/bin


CACHE_CONTROL_MAX_AGE=2592000
CURRENT_BRANCH_NAME="demo"
mv HighLow/src/env.demo.js HighLow/src/env.js
cd HighLow && npm run build && cd ..
aws s3 rm $S3_PATH/dist --recursive --region $S3_REGION
#copy separated folders
aws s3 cp $BUILD_FOLDER $S3_PATH/dist --cache-control "max-age=$CACHE_CONTROL_MAX_AGE" --recursive

aws cloudfront create-invalidation --distribution-id $CF_HighLow_DISTRIBUTION_ID --paths "/*"

echo "application was uploaded to s3"
