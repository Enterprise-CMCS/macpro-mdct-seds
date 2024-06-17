#!/bin/bash

set -e

stage=${1:-dev}

services=(
  'database'
  'data-deployment'
  'uploads'
  'app-api'
  'stream-functions'
  'ui-waflog-s3-bucket'
  'ui'
  'ui-auth'
  'ui-waf-log-assoc'
  'ui-src'
)

install_deps() {
  if [ "$CI" == "true" ]; then # If we're in a CI system
    if [ ! -d "node_modules" ]; then # If we don't have any node_modules (CircleCI cache miss scenario), run yarn install --frozen-lockfile.  Otherwise, we're all set, do nothing.
      yarn install --frozen-lockfile
    fi
  else # We're not in a CI system, let's yarn install
    yarn install
  fi
}

prepare_service() {
  service=$1
  pushd services/$service
  install_deps
  popd
}

install_deps
export PATH=$(pwd)/node_modules/.bin/:$PATH

for i in "${services[@]}"

do
  if [[ "$i" == "data-deployment" ]] && [[ "$SEED_DATABASE" == 'true' ]]; then
    seedservice='data-deployment'
    prepare_service $seedservice
    pushd services/$seedservice
    serverless deploy --stage $stage
    popd
  fi
	prepare_service $i
done

serverless deploy --stage $stage

pushd services
echo """
------------------------------------------------------------------------------------------------
------------------------------------------------------------------------------------------------
Application endpoint:  `./output.sh ui CloudFrontEndpointUrl $stage`
------------------------------------------------------------------------------------------------
"""
popd
