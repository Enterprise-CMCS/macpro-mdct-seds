# Running Locally with LocalStack

The `./run local` command allows you to run our application locally on your laptop using [LocalStack](https://localstack.cloud/), simulating the AWS cloud environment (except using cognito authentication from the real AWS).

## Prerequisites

Before running the application locally, ensure the following dependencies are installed and running:

### Required Installations

1. **Colima/Docker** - LocalStack runs inside a Colima container that uses docker as it's runtime.

Links:

- Docker - https://www.docker.com/get-started
- Colima - https://github.com/abiosoft/colima

```sh
# Install Docker
brew install docker
# now this should print something out:
docker -v

# Install Colima
brew install colima
# now this should print something out:
colima --version
# this should keep colima running better when you log on and off:
brew services start colima
# start colima with specific vm-type (this prevents crashing which shows up as "socket hang up")
colima start --vm-type=vz
# verify colima is started
colima status
# should now include the phrase "colima is running"
```

Now add this line to the bottom of your bash/zsh rc/profile:
This is probably the file: `~/.zprofile` if you're using the standard mac setup.

```sh
# this tells docker that you're using colima and to look at colima to answer questions like: are any containers running?
export DOCKER_HOST="unix://${HOME}/.colima/default/docker.sock"
```

Close and reopen your terminal.

2. **LocalStack** - Provides a local AWS emulating environment.

   - Sign up for a free account: [LocalStack Cloud](https://app.localstack.cloud/sign-up)
   - Install LocalStack CLI:
     ```sh
     brew install localstack/tap/localstack-cli
     ```

3. **AWS CLI Local** - Required for interacting with LocalStack.

   ```sh
   brew install pipx
   pipx install awscli-local
   ```

4. **AWS CDK Local**
   ```sh
   npm install -g aws-cdk-local aws-cdk
   ```

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

The script will verify that both Docker and Colima and LocalStack are running before proceeding. If either service is unavailable, the script will exit with an error.

## Monitoring LocalStack

You can monitor your LocalStack instance via:

- [LocalStack Cloud Dashboard](https://app.localstack.cloud/inst/default/status)

## Accessing Lambda Environment Variables (:point_up: not included in the dashboard)

Per usual env variables are available inside the lambda via `process.env.NAME_OF_VARIABLE`.

But if you want to query to see what environment variables a lambda is being given, you can always run queries directly at your local aws like this:

```sh
# example of something you'd pop in as YOUR_FUNCTION_NAME => app-api-localstack-getUserById
awslocal lambda get-function-configuration --function-name YOUR_FUNCTION_NAME --query "Environment.Variables"
```
