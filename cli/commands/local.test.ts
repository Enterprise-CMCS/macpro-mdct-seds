import assert from "node:assert/strict";
import { beforeEach, describe, it, mock } from "node:test";

type RunCommand = typeof import("../lib/runner.ts").runCommand;
type BootstrapLocalCognitoUsers =
  typeof import("../lib/seedData.ts").bootstrapLocalCognitoUsers;
type RunFrontendLocally = typeof import("../lib/utils.ts").runFrontendLocally;

const events: string[] = [];
const execFileSyncMock = mock.fn(
  (_file: string, _args?: readonly string[], _options?: { stdio?: string }) =>
    undefined
);
const execSyncMock = mock.fn(
  (_command: string, _options?: { encoding?: string; stdio?: string }) =>
    "colima is running"
);
const runCommandMock = mock.fn<RunCommand>(async (name) => {
  events.push(name);
});
const bootstrapLocalCognitoUsersMock = mock.fn<BootstrapLocalCognitoUsers>(
  async () => {
    events.push("bootstrap");
  }
);
const runFrontendLocallyMock = mock.fn<RunFrontendLocally>(async (stage) => {
  events.push(`frontend:${stage}`);
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
    bootstrapLocalCognitoUsers: bootstrapLocalCognitoUsersMock,
  },
});

mock.module("../lib/utils.ts", {
  namedExports: {
    runFrontendLocally: runFrontendLocallyMock,
  },
});

const { local } = await import("./local.ts");

describe("local command", () => {
  beforeEach(() => {
    events.length = 0;
    execFileSyncMock.mock.resetCalls();
    execSyncMock.mock.resetCalls();
    runCommandMock.mock.resetCalls();
    bootstrapLocalCognitoUsersMock.mock.resetCalls();
    runFrontendLocallyMock.mock.resetCalls();
    globalThis.fetch = async () =>
      ({
        ok: true,
        json: async () => ({ ready_scripts: { status: "completed" } }),
      }) as Response;
  });

  it("deploys MiniStack and bootstraps local Cognito users before watch starts", async () => {
    const expectedContainerName =
      process.env.MINISTACK_CONTAINER_NAME ?? "seds-ministack-local";

    await local.handler();

    assert.deepEqual(execFileSyncMock.mock.calls[0]?.arguments, [
      "docker",
      ["rm", "-f", expectedContainerName],
      { stdio: "ignore" },
    ]);
    assert.deepEqual(
      runCommandMock.mock.calls.map((call) => call.arguments[0]),
      [
        "Start MiniStack",
        "Clean .cdk",
        "CDK MiniStack bootstrap",
        "CDK MiniStack local-prerequisite deploy",
        "CDK MiniStack prerequisite deploy",
        "CDK MiniStack deploy",
        "CDK MiniStack watch",
      ]
    );
    assert.equal(bootstrapLocalCognitoUsersMock.mock.calls.length, 1);
    assert.deepEqual(runFrontendLocallyMock.mock.calls[0]?.arguments, [
      "ministack",
    ]);
    assert.deepEqual(events, [
      "Start MiniStack",
      "Clean .cdk",
      "CDK MiniStack bootstrap",
      "CDK MiniStack local-prerequisite deploy",
      "CDK MiniStack prerequisite deploy",
      "CDK MiniStack deploy",
      "bootstrap",
      "CDK MiniStack watch",
      "frontend:ministack",
    ]);
  });
});
