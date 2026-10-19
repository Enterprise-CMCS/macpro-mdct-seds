import assert from "node:assert/strict";
import { beforeEach, describe, it, mock } from "node:test";

type RunCommand = typeof import("../lib/runner.ts").runCommand;
type SeedData = typeof import("../lib/seedData.ts").seedData;
type RunFrontendLocally = typeof import("../lib/utils.ts").runFrontendLocally;

const events: string[] = [];
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
const runCommandMock = mock.fn<RunCommand>(async (name) => {
  events.push(name);
});
const seedDataMock = mock.fn<SeedData>(async () => {
  events.push("seedData");
});
const runFrontendLocallyMock = mock.fn<RunFrontendLocally>(async (stage) => {
  events.push(`frontend:${stage}`);
});
const maybeStartStackPortMock = mock.fn(() => {
  events.push("maybeStartStackPort");
});
const recoverFailedLocalStacksMock = mock.fn(async () => {
  events.push("recoverFailedLocalStacks");
});
const cloudFormationSendMock = mock.fn(async () => {
  throw new Error("Stack does not exist");
});

mock.module("node:child_process", {
  namedExports: {
    execFileSync: execFileSyncMock,
    execSync: execSyncMock,
  },
});

mock.module("@aws-sdk/client-cloudformation", {
  namedExports: {
    CloudFormationClient: class {
      send = cloudFormationSendMock;
    },
    CreateStackCommand: class {
      input: unknown;
      constructor(input: unknown) {
        this.input = input;
      }
    },
    DescribeStacksCommand: class {
      input: unknown;
      constructor(input: unknown) {
        this.input = input;
      }
    },
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

mock.module("../lib/utils.ts", {
  namedExports: {
    runFrontendLocally: runFrontendLocallyMock,
    maybeStartStackPort: maybeStartStackPortMock,
  },
});

mock.module("../lib/localStacks.ts", {
  namedExports: {
    recoverFailedLocalStacks: recoverFailedLocalStacksMock,
  },
});

const { local } = await import("./local.ts");

describe("local command", () => {
  beforeEach(() => {
    events.length = 0;
    execFileSyncMock.mock.resetCalls();
    execSyncMock.mock.resetCalls();
    runCommandMock.mock.resetCalls();
    seedDataMock.mock.resetCalls();
    recoverFailedLocalStacksMock.mock.resetCalls();
    runFrontendLocallyMock.mock.resetCalls();
    maybeStartStackPortMock.mock.resetCalls();
    cloudFormationSendMock.mock.resetCalls();
    cloudFormationSendMock.mock.mockImplementation(async () => {
      throw new Error("Stack does not exist");
    });
    globalThis.fetch = async () =>
      ({
        ok: true,
        json: async () => ({ ready_scripts: { status: "completed" } }),
      }) as Response;
  });

  it("deploys MiniStack, seeds data, then starts watch and the frontend", async () => {
    const expectedContainerName =
      process.env.MINISTACK_CONTAINER_NAME ?? "seds-ministack-local";

    await local.handler();

    assert.deepEqual(execFileSyncMock.mock.calls[0]?.arguments, [
      "docker",
      ["--context", "colima", "inspect", expectedContainerName],
      { encoding: "utf8", stdio: "pipe" },
    ]);
    assert.deepEqual(
      runCommandMock.mock.calls.map((call) => call.arguments[0]),
      [
        "Clean .cdk",
        "CDK MiniStack bootstrap",
        "CDK MiniStack local-prerequisite deploy",
        "CDK MiniStack prerequisite deploy",
        "CDK MiniStack deploy",
        "CDK MiniStack watch",
      ]
    );
    assert.equal(recoverFailedLocalStacksMock.mock.calls.length, 1);
    assert.deepEqual(runCommandMock.mock.calls[2]?.arguments[1], [
      "yarn",
      "cdklocal",
      "deploy",
      "--app",
      "./deployment/local/prerequisites.ts",
      "--method",
      "direct",
      "--require-approval",
      "never",
    ]);
    assert.deepEqual(runCommandMock.mock.calls[3]?.arguments[1], [
      "yarn",
      "cdklocal",
      "deploy",
      "--app",
      "./deployment/prerequisites.ts",
      "--method",
      "direct",
      "--context",
      "stage=ministack",
      "--require-approval",
      "never",
    ]);
    assert.deepEqual(runCommandMock.mock.calls[4]?.arguments[1], [
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
    ]);
    assert.equal(seedDataMock.mock.calls.length, 1);
    assert.deepEqual(runFrontendLocallyMock.mock.calls[0]?.arguments, [
      "ministack",
    ]);
    assert.equal(maybeStartStackPortMock.mock.calls.length, 1);
    assert.deepEqual(events, [
      "recoverFailedLocalStacks",
      "Clean .cdk",
      "CDK MiniStack bootstrap",
      "CDK MiniStack local-prerequisite deploy",
      "CDK MiniStack prerequisite deploy",
      "CDK MiniStack deploy",
      "seedData",
      "maybeStartStackPort",
      "CDK MiniStack watch",
      "frontend:ministack",
    ]);
  });
});
