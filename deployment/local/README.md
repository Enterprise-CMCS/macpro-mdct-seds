# Running Locally with LocalStack

The `./run local` command allows you to run our application locally on your laptop using [LocalStack](https://localstack.cloud/), simulating the AWS cloud environment (except using cognito authentication from the real AWS).

## Prerequisites

Before running the application locally, ensure the following dependencies are installed and running:

### Required Installations

1. **Docker** - LocalStack runs inside a Docker container.

   - Install Docker from [Docker's official website](https://www.docker.com/get-started).

2. **LocalStack** - Provides a local AWS emulating environment.

   - Sign up for a free account: [LocalStack Cloud](https://app.localstack.cloud/sign-up)
   - Install LocalStack CLI:
     ```sh
     brew install localstack/tap/localstack-cli
     ```

3. **AWS CLI Local** - Required for interacting with LocalStack.

   ```sh
   pip install awscli-local
   ```

4. **AWS CDK Local**
   ```sh
   npm install -g aws-cdk-local aws-cdk
   ```

## Open Docker

On your macbook open the Docker Desktop application.

## Running LocalStack

Start the LocalStack service before deploying the application:

```sh
localstack start
```

## Deploying Locally

Once LocalStack is running, deploy the application with:

```sh
./run local
```

The script will verify that both Docker and LocalStack are running before proceeding. If either service is unavailable, the script will exit with an error.

## Monitoring LocalStack

You can monitor your LocalStack instance via:

- [LocalStack Cloud Dashboard](https://app.localstack.cloud/inst/default/status)
