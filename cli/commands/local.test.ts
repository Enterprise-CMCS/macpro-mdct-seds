import assert from "node:assert/strict";
import { beforeEach, describe, it, mock } from "node:test";

type RunCommand = typeof import("../lib/runner.ts").runCommand;
type BootstrapLocalCognitoUsers =
  typeof import("../lib/localCognito.ts").bootstrapLocalCognitoUsers;
type SeedData = typeof import("../lib/seedData.ts").seedData;
type RunFrontendLocally = typeof import("../lib/utils.ts").runFrontendLocally;

const healthyContainer = () => ({
  State: { Running: true, Health: { Status: "healthy" } },
  HostConfig: {
    PortBindings: { "4566/tcp": [{ HostIp: "", HostPort: "4566" }] },
  },
  Config: {
    Env: [
      "FLOCI_HOSTNAME=host.docker.internal",
      "FLOCI_SERVICES_ECR_REGISTRY_BASE_PORT=5200",
      "FLOCI_SERVICES_ECR_REGISTRY_MAX_PORT=5299",
    ],
  },
});

const events: string[] = [];
const commandCalls: { name: string; cmd: string[]; cwd: string }[] = [];
const execFileSyncMock = mock.fn(
  (
    file: string,
    _args?: readonly string[],
    _options?: { encoding?: string; stdio?: string }
  ) => {
    if (file === "docker") {
      return JSON.stringify([healthyContainer()]);
    }
    return "{}";
  }
);
const execSyncMock = mock.fn(
  (_command: string, _options?: { encoding?: string; stdio?: string }) =>
    "colima is running"
);
const runCommandMock = mock.fn<RunCommand>(async (name, cmd, cwd) => {
  commandCalls.push({ name, cmd: cmd as string[], cwd: cwd as string });
  events.push(name);
});
const bootstrapLocalCognitoUsersMock = mock.fn<BootstrapLocalCognitoUsers>(
  async () => {
    events.push("bootstrapLocalCognitoUsers");
  }
);
const seedDataMock = mock.fn<SeedData>(async () => {
  events.push("seedData");
});
const runFrontendLocallyMock = mock.fn<RunFrontendLocally>(async (stage) => {
  events.push(`runFrontendLocally:${stage}`);
});

mock.module("node:child_process", {
  namedExports: {
    execFileSync: execFileSyncMock,
    execSync: execSyncMock,
  },
});

mock.module("../lib/runner.ts", {
  namedExports: {
    runCommand: runCommandMock,
  },
});

mock.module("../lib/seedData.ts", {
  namedExports: {
    seedData: seedDataMock,
  },
});

mock.module("../lib/localCognito.ts", {
  namedExports: {
    bootstrapLocalCognitoUsers: bootstrapLocalCognitoUsersMock,
  },
});

mock.module("../lib/utils.ts", {
  namedExports: {
    runFrontendLocally: runFrontendLocallyMock,
  },
});

const originalProject = process.env.PROJECT;
process.env.PROJECT = "seds";
delete process.env.FLOCI_CONTAINER_NAME;
const { local, assertFlociContainerMatchesConfig } = await import("./local.ts");
if (originalProject === undefined) {
  delete process.env.PROJECT;
} else {
  process.env.PROJECT = originalProject;
}

describe("local command", () => {
  beforeEach(() => {
    events.length = 0;
    commandCalls.length = 0;
    execFileSyncMock.mock.resetCalls();
    execSyncMock.mock.resetCalls();
    runCommandMock.mock.resetCalls();
    bootstrapLocalCognitoUsersMock.mock.resetCalls();
    seedDataMock.mock.resetCalls();
    runFrontendLocallyMock.mock.resetCalls();
    process.env.PROJECT = "seds";
    delete process.env.FLOCI_PORT;
    delete process.env.FLOCI_SERVICES_ECR_REGISTRY_BASE_PORT;
    delete process.env.FLOCI_SERVICES_ECR_REGISTRY_MAX_PORT;
  });

  it("deploys Floci and bootstraps local Cognito users before watch starts", async () => {
    await local.handler();

    assert.equal(process.env.AWS_DEFAULT_REGION, "us-east-1");
    assert.equal(process.env.AWS_ACCESS_KEY_ID, "test");
    assert.equal(process.env.AWS_SECRET_ACCESS_KEY, "test");
    assert.equal(process.env.AWS_ENDPOINT_URL, "http://localhost:4566");
    assert.equal(
      process.env.AWS_ENDPOINT_URL_S3,
      "http://s3.localhost.floci.io:4566"
    );

    assert.deepEqual(execFileSyncMock.mock.calls[0]?.arguments.slice(0, 2), [
      "docker",
      ["--context", "colima", "inspect", "seds-floci-local"],
    ]);
    assert.deepEqual(
      execFileSyncMock.mock.calls.map((call) => call.arguments[0]),
      ["docker", "docker", "aws", "aws"]
    );

    assert.deepEqual(commandCalls, [
      { name: "Clean .cdk", cmd: ["rm", "-rf", ".cdk"], cwd: "." },
      {
        name: "CDK local bootstrap",
        cmd: [
          "yarn",
          "cdklocal",
          "bootstrap",
          "aws://000000000000/us-east-1",
          "--context",
          "stage=bootstrap",
          "--require-approval",
          "never",
        ],
        cwd: ".",
      },
      {
        name: "CDK local local-prerequisite deploy",
        cmd: [
          "yarn",
          "cdklocal",
          "deploy",
          "--app",
          "./deployment/local/prerequisites.ts",
          "--require-approval",
          "never",
        ],
        cwd: ".",
      },
      {
        name: "CDK local prerequisite deploy",
        cmd: [
          "yarn",
          "cdklocal",
          "deploy",
          "--app",
          "./deployment/prerequisites.ts",
          "--require-approval",
          "never",
        ],
        cwd: ".",
      },
      {
        name: "CDK local deploy",
        cmd: [
          "yarn",
          "cdklocal",
          "deploy",
          "--context",
          "stage=floci",
          "--all",
          "--no-rollback",
          "--require-approval",
          "never",
        ],
        cwd: ".",
      },
      {
        name: "CDK local watch",
        cmd: [
          "yarn",
          "cdklocal",
          "watch",
          "--context",
          "stage=floci",
          "--no-rollback",
        ],
        cwd: ".",
      },
    ]);

    assert.equal(bootstrapLocalCognitoUsersMock.mock.calls.length, 1);
    assert.equal(seedDataMock.mock.calls.length, 1);
    assert.deepEqual(runFrontendLocallyMock.mock.calls[0]?.arguments, [
      "floci",
    ]);
    assert.deepEqual(events, [
      "Clean .cdk",
      "CDK local bootstrap",
      "CDK local local-prerequisite deploy",
      "CDK local prerequisite deploy",
      "CDK local deploy",
      "bootstrapLocalCognitoUsers",
      "seedData",
      "CDK local watch",
      "runFrontendLocally:floci",
    ]);
  });
});

describe("assertFlociContainerMatchesConfig", () => {
  it("passes when the container matches the requested ports", () => {
    assert.doesNotThrow(() =>
      assertFlociContainerMatchesConfig(
        healthyContainer(),
        "4566",
        "5200",
        "5299"
      )
    );
  });

  it("throws when the published FLOCI_PORT differs", () => {
    assert.throws(
      () =>
        assertFlociContainerMatchesConfig(
          healthyContainer(),
          "4567",
          "5200",
          "5299"
        ),
      /published port 4566 \(requested 4567\)/
    );
  });

  it("throws when the ECR registry ports differ", () => {
    assert.throws(
      () =>
        assertFlociContainerMatchesConfig(
          healthyContainer(),
          "4566",
          "6000",
          "6099"
        ),
      /ECR base port 5200 \(requested 6000\)/
    );
  });
});
