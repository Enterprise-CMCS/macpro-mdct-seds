import assert from "node:assert/strict";
import { beforeEach, describe, it, mock } from "node:test";

type RunCommand = typeof import("../lib/runner.ts").runCommand;
type BootstrapLocalCognitoUsers =
  typeof import("../lib/localCognito.ts").bootstrapLocalCognitoUsers;
type SeedData = typeof import("../lib/seedData.ts").seedData;
type RunFrontendLocally = typeof import("../lib/utils.ts").runFrontendLocally;

const events: string[] = [];
const commandCalls: { name: string; cmd: string[]; cwd: string }[] = [];
const execFileSyncMock = mock.fn(
  (
    _file: string,
    _args?: readonly string[],
    _options?: { encoding?: string; stdio?: string }
  ) => JSON.stringify([{ State: { Running: true } }])
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
delete process.env.MINISTACK_CONTAINER_NAME;
const { local } = await import("./local.ts");
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
    delete process.env.MINISTACK_PORT;
    globalThis.fetch = async () =>
      ({
        ok: true,
        json: async () => ({ ready_scripts: { status: "completed" } }),
      }) as Response;
  });

  it("deploys MiniStack and bootstraps local Cognito users before watch starts", async () => {
    await local.handler();

    assert.equal(process.env.AWS_DEFAULT_REGION, "us-east-1");
    assert.equal(process.env.AWS_ACCESS_KEY_ID, "test");
    assert.equal(process.env.AWS_SECRET_ACCESS_KEY, "test");
    assert.equal(process.env.AWS_ENDPOINT_URL, "http://127.0.0.1:4566");
    assert.equal(process.env.AWS_ENDPOINT_URL_S3, "http://127.0.0.1:4566");

    assert.deepEqual(execFileSyncMock.mock.calls[0]?.arguments.slice(0, 2), [
      "docker",
      ["--context", "colima", "inspect", "seds-ministack-local"],
    ]);

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
          "--method",
          "direct",
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
          "--method",
          "direct",
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
          "--method",
          "direct",
          "--context",
          "stage=ministack",
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
          "stage=ministack",
          "--no-rollback",
        ],
        cwd: ".",
      },
    ]);

    assert.equal(bootstrapLocalCognitoUsersMock.mock.calls.length, 1);
    assert.equal(seedDataMock.mock.calls.length, 1);
    assert.deepEqual(runFrontendLocallyMock.mock.calls[0]?.arguments, [
      "ministack",
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
      "runFrontendLocally:ministack",
    ]);
  });
});
