<!-- This file is managed by macpro-mdct-core so if you'd like to change it let's do it there -->

# Running Locally with Floci

The `./run local` command allows you to run our application locally on your laptop using Floci, simulating the AWS cloud environment including Cognito user pools, app clients, and seeded users.

## Prerequisites

Before running the application locally, ensure the following dependencies are installed:

### Required Installations

1. **Colima** - Floci runs inside a Colima-managed container on macOS.
2. **AWS CLI** - Used by the local runner to bootstrap the default secret and for direct inspection of the local AWS emulator.
   The run script starts Colima when needed and pulls the Floci container image.

## Deploying and Running Locally

```sh
./run local
```

The script will start or reuse the `seds-floci-local` container automatically.

If `4566` or `3000` are already in use on your machine, you can override the emulator and UI ports:

```sh
FLOCI_PORT=4570 LOCAL_UI_PORT=3002 ./run local
```

Local login uses users from `services/ui-auth/libs/users.json`. The seeded password defaults to `Password123!` and can be overridden with `LOCAL_COGNITO_PASSWORD`.

## Monitoring Floci

```sh
docker --context colima logs -f seds-floci-local
```

Health is exposed on the Floci init endpoint:

```sh
curl http://127.0.0.1:${FLOCI_PORT:-4566}/_floci/init
```

## Notes

- Internally, the local CDK stage is named `floci`. That is why stack names and raw API Gateway paths include `floci`.
- The generated UI env points at the same-origin local API proxy path:
  `/_local-api/restapis/<apiId>/floci/_user_request_`
- Use `./run reset` to remove the Floci container and tear down Colima.

## Accessing Lambda Environment Variables

Per usual env variables are available inside the lambda via `process.env.NAME_OF_VARIABLE`.

If you want to query the environment variables a lambda is receiving, you can inspect them directly:

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
