import { beforeEach, describe, expect, it, vi } from "vitest";
import { execFileSync } from "node:child_process";
import { runCommand } from "../lib/runner.ts";
import { reset } from "./reset.ts";
import { updateEnvFiles } from "./update-env.ts";

const mocks = vi.hoisted(() => ({
  execFileSync: vi.fn(),
  runCommand: vi.fn(),
  updateEnvFiles: vi.fn(),
}));

vi.mock("node:child_process", () => ({
  execFileSync: mocks.execFileSync,
}));

vi.mock("../lib/runner.ts", () => ({
  runCommand: mocks.runCommand,
}));

vi.mock("./update-env.ts", () => ({
  updateEnvFiles: mocks.updateEnvFiles,
}));

describe("reset command", () => {
  const runCommandMock = vi.mocked(runCommand);
  const updateEnvFilesMock = vi.mocked(updateEnvFiles);

  beforeEach(() => {
    vi.clearAllMocks();
    runCommandMock.mockResolvedValue(undefined);
    updateEnvFilesMock.mockResolvedValue(undefined);
  });

  it("removes the MiniStack container and tears down Colima", async () => {
    const expectedContainerName =
      process.env.MINISTACK_CONTAINER_NAME ?? "seds-ministack-local";

    await reset.handler();

    expect(updateEnvFilesMock).toHaveBeenCalledTimes(1);
    expect(execFileSync).toHaveBeenCalledWith(
      "docker",
      ["rm", "-f", expectedContainerName],
      { stdio: "ignore" }
    );
    expect(runCommandMock.mock.calls).toEqual([
      ["Stop colima", ["colima", "stop"], "."],
      ["Delete colima", ["colima", "delete", "--force"], "."],
    ]);
  });
});
