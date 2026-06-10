import { beforeEach, describe, expect, it, vi } from "vitest";
import { execFileSync } from "node:child_process";
import { runCommand } from "../lib/runner.ts";
import { bootstrapLocalCognitoUsers } from "../lib/seedData.ts";
import { runFrontendLocally } from "../lib/utils.ts";
import { local } from "./local.ts";

const mocks = vi.hoisted(() => ({
  execFileSync: vi.fn(),
  execSync: vi.fn(() => "colima is running"),
  runCommand: vi.fn(),
  bootstrapLocalCognitoUsers: vi.fn(),
  runFrontendLocally: vi.fn(),
}));

vi.mock("node:child_process", () => ({
  execFileSync: mocks.execFileSync,
  execSync: mocks.execSync,
}));

vi.mock("../lib/runner.ts", () => ({
  runCommand: mocks.runCommand,
}));

vi.mock("../lib/seedData.ts", () => ({
  bootstrapLocalCognitoUsers: mocks.bootstrapLocalCognitoUsers,
}));

vi.mock("../lib/utils.ts", () => ({
  runFrontendLocally: mocks.runFrontendLocally,
}));

describe("local command", () => {
  const runCommandMock = vi.mocked(runCommand);
  const bootstrapLocalCognitoUsersMock = vi.mocked(bootstrapLocalCognitoUsers);
  const runFrontendLocallyMock = vi.mocked(runFrontendLocally);

  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => ({
        ok: true,
        json: async () => ({ ready_scripts: { status: "completed" } }),
      }))
    );
    runCommandMock.mockResolvedValue(undefined);
    bootstrapLocalCognitoUsersMock.mockResolvedValue(undefined);
    runFrontendLocallyMock.mockResolvedValue(undefined);
  });

  it("deploys MiniStack and bootstraps local Cognito users before watch starts", async () => {
    const expectedContainerName =
      process.env.MINISTACK_CONTAINER_NAME ?? "seds-ministack-local";

    await local.handler();

    expect(execFileSync).toHaveBeenCalledWith(
      "docker",
      ["rm", "-f", expectedContainerName],
      { stdio: "ignore" }
    );
    expect(runCommandMock.mock.calls.map(([name]) => name)).toEqual([
      "Start MiniStack",
      "Clean .cdk",
      "CDK MiniStack bootstrap",
      "CDK MiniStack local-prerequisite deploy",
      "CDK MiniStack prerequisite deploy",
      "CDK MiniStack deploy",
      "CDK MiniStack watch",
    ]);
    expect(bootstrapLocalCognitoUsersMock).toHaveBeenCalledTimes(1);
    expect(runFrontendLocallyMock).toHaveBeenCalledWith("ministack");

    const deployOrder = runCommandMock.mock.invocationCallOrder[5];
    const watchOrder = runCommandMock.mock.invocationCallOrder[6];
    const bootstrapOrder =
      bootstrapLocalCognitoUsersMock.mock.invocationCallOrder[0];
    expect(bootstrapOrder).toBeGreaterThan(deployOrder);
    expect(bootstrapOrder).toBeLessThan(watchOrder);
  });
});
