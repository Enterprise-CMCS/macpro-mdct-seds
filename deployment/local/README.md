<!-- This file is managed by macpro-mdct-core so if you'd like to change it let's do it there -->

# Running Locally with LocalEmu

The `./run local` command allows you to run our application completely offline on your laptop using [LocalEmu](https://github.com/localemu/localemu), a free and open-source AWS cloud emulator.

## Prerequisites

Before running the application locally, ensure the following dependencies are installed:

### Required Installations

1. **Python 3.9+** - LocalEmu is a Python package

_The run script will verify Python is installed._

2. **LocalEmu** - Provides local AWS emulation with 132 services.

Install with:

```bash
pip install localemu[runtime]
```

3. **AWS CLI Local** - LocalEmu ships `awsemu` CLI for interacting with local AWS services.

Included with LocalEmu installation - no separate setup needed.

## Deploying and Running Locally

```sh
# Start LocalEmu in detached mode
localemu start -d

# Deploy and run the application
./run local
```

The script will verify that LocalEmu is running before proceeding. If LocalEmu is unavailable, the script will exit with a helpful error.

## Monitoring LocalEmu

LocalEmu includes a built-in web dashboard for monitoring your local AWS environment:

Open: http://localhost:4566/\_localemu/dashboard

The dashboard provides:

- Service overview with resource counts
- Resource drill-down (S3 buckets, DynamoDB tables, Lambda functions, etc.)
- S3 object browser
- DynamoDB item viewer
- CloudTrail event history
- Live API call activity feed

## IAM Policy Enforcement

LocalEmu supports full AWS IAM policy enforcement for testing permissions locally:

```bash
# Start with IAM enforcement enabled
IAM_ENFORCEMENT=1 localemu start -d
```

This enables testing of:

- Identity policies
- Resource policies
- Permission boundaries
- Condition operators
- Policy variables

Catch IAM permission errors locally before they surface in production!

## Accessing Lambda Environment Variables

Per usual env variables are available inside the lambda via `process.env.NAME_OF_VARIABLE`.

To query Lambda environment variables:

```bash
# Using awsemu (included with LocalEmu)
awsemu lambda get-function-configuration --function-name YOUR_FUNCTION_NAME --query "Environment.Variables"

# Example function name: app-api-localemu-getUserById
```

## Persistence

To keep your local resources across restarts:

```bash
PERSISTENCE=1 localemu start -d
```

State is automatically saved on shutdown and restored on startup.
