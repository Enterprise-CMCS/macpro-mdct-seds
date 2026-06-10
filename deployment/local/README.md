<!-- This file is managed by macpro-mdct-core so if you'd like to change it let's do it there -->

# Running Locally with MiniStack

The `./run local` command runs SEDS locally by deploying the stack into MiniStack in Docker, while Cognito authentication still comes from the real AWS environment.

## Prerequisites

Before running the application locally, ensure the following dependencies are installed and running:

### Required Installations

1. **Colima/Docker** - MiniStack runs inside a Colima container that uses Docker as its runtime.

_The install is handled by the run script._

Links for the curious:

- Docker - https://www.docker.com/get-started
- Colima - https://github.com/abiosoft/colima

2. **A populated `.env` file** - Use `./run update-env`, or reuse an existing `.env` if you already have one outside this worktree.

## Deploying and Running Locally

```sh
# in a new terminal window
./run local
```

If `4566` or `3000` are already in use on your machine, you can override the emulator and UI ports:

```sh
MINISTACK_PORT=4570 LOCAL_UI_PORT=3002 ./run local
```

The script verifies Docker and Colima, starts a fresh MiniStack container, bootstraps CDK, deploys the local prerequisite stack, deploys the main stack, starts `cdklocal watch`, and starts the UI.

## Monitoring MiniStack

The local runner names the container `seds-ministack-local` by default.

Useful commands:

```sh
docker ps
docker logs seds-ministack-local
curl http://127.0.0.1:${MINISTACK_PORT:-4566}/health
```

## Notes

- Internally, the local CDK stage is named `ministack`. That is why stack names and raw API Gateway paths include `ministack`.
- The generated UI env points at MiniStack's API proxy shape:
  `http://localhost:${MINISTACK_PORT:-4566}/restapis/<apiId>/ministack/_user_request_`
- Use `./run reset` to stop the MiniStack container and tear down Colima.
- The detailed evaluation for `CMDCT-6054` is in [docs/ministack-local-dev-notes.md](../../docs/ministack-local-dev-notes.md).
