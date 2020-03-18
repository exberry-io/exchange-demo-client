#!/bin/bash
CACHE_CONTROL_MAX_AGE=2592000

# install aws cli
pip install --user awscli
export PATH=$PATH:$HOME/.local/bin

echo "Starting AWS operations"
if [ "$TRAVIS_BRANCH" == "master" ]; then
    S3_PATH=s3://$S3_BUCKET/prod
else
    S3_PATH=s3://$S3_BUCKET/dev/$TRAVIS_BRANCH
fi
aws s3 rm $S3_PATH/ --recursive --region $S3_REGION
aws s3 sync ./dist $S3_PATH/ --cache-control "max-age=$CACHE_CONTROL_MAX_AGE"
echo "application was uploaded to s3: " $S3_PATH

aws cloudfront create-invalidation --distribution-id $CF_HighLow_DISTRIBUTION_ID --paths "/*"
echo "cloudfront updated"

CURRENT_BRANCH_NAME=$TRAVIS_BRANCH
S3_URL="$S3_BASE_URL/$CURRENT_BRANCH_NAME"
REPO=$1

aws s3 ls $S3_PATH
COUNT=$(aws s3 ls $S3_PATH/ | wc -l)
echo "$COUNT"

if [ "$COUNT" == "0" ]; then
    sh config/gh.sh $GH_USER $GT_ACCESS_TOKEN $TRAVIS_PULL_REQUEST $S3_URL $REPO $CURRENT_BRANCH_NAME
    echo "comment sent to GH pull request: $CURRENT_BRANCH_NAME PR $TRAVIS_PULL_REQUEST"
else
    echo "comment was skipped not a pull request or comment already created."
fi

echo $GH_USER $TRAVIS_PULL_REQUEST $S3_URL $REPO $CURRENT_BRANCH_NAME
