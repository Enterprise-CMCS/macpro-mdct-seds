<!-- This file is managed by macpro-mdct-core so if you'd like to change it let's do it there -->

# Running Locally with Floci

The `./run local` command allows you to run our application locally on your laptop using [Floci](https://floci.io/), simulating the AWS cloud environment except for Cognito authentication, which still uses real AWS values from your local `.env` files.

## Prerequisites

Before running the application locally, ensure the following dependencies are installed and running:

### Required Installations

1. **Colima/Docker** - Floci runs inside a Docker container managed through Colima on macOS.
2. **AWS CLI** - Required for direct inspection of the local AWS emulator.

The `./run local` command will verify Docker and Colima before it starts Floci.

## Deploying and Running Locally

```sh
./run local
```

The script will start or reuse the `floci-local` container automatically.

## Monitoring Floci

```sh
docker logs -f floci-local
```

Health is exposed on the Floci init endpoint:

```sh
curl http://localhost:4566/_floci/init
```

## Accessing Lambda Environment Variables

Per usual env variables are available inside the lambda via `process.env.NAME_OF_VARIABLE`.

If you want to query the environment variables a lambda is receiving, you can inspect them directly with the AWS CLI:

```sh
# example of something you'd pop in as YOUR_FUNCTION_NAME => app-api-floci-getUserById
AWS_ACCESS_KEY_ID=test \
AWS_SECRET_ACCESS_KEY=test \
AWS_DEFAULT_REGION=us-east-1 \
aws --endpoint-url http://localhost:4566 \
  lambda get-function-configuration \
  --function-name YOUR_FUNCTION_NAME \
  --query "Environment.Variables"
```
