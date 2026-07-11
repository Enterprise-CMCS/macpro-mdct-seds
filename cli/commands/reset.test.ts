import assert from "node:assert/strict";
import { beforeEach, describe, it, mock } from "node:test";

type RunCommand = typeof import("../lib/runner.ts").runCommand;
type UpdateEnvFiles = typeof import("./update-env.ts").updateEnvFiles;

const execFileSyncMock = mock.fn(
  (_file: string, _args?: readonly string[], _options?: { stdio?: string }) =>
    undefined
);
const runCommandMock = mock.fn<RunCommand>(async () => undefined);
const updateEnvFilesMock = mock.fn<UpdateEnvFiles>(async () => undefined);

mock.module("node:child_process", {
  namedExports: {
    execFileSync: execFileSyncMock,
  },
});

mock.module("../lib/runner.ts", {
  namedExports: {
    runCommand: runCommandMock,
  },
});

mock.module("./update-env.ts", {
  namedExports: {
    updateEnvFiles: updateEnvFilesMock,
  },
});

const { reset } = await import("./reset.ts");

describe("reset command", () => {
  beforeEach(() => {
    execFileSyncMock.mock.resetCalls();
    runCommandMock.mock.resetCalls();
    updateEnvFilesMock.mock.resetCalls();
  });

  it("removes the MiniStack container and tears down Colima", async () => {
    const expectedContainerName =
      process.env.MINISTACK_CONTAINER_NAME ?? "seds-ministack-local";

    await reset.handler();

    assert.equal(updateEnvFilesMock.mock.calls.length, 1);
    assert.deepEqual(execFileSyncMock.mock.calls[0]?.arguments, [
      "docker",
      ["--context", "colima", "rm", "-f", expectedContainerName],
      { stdio: "ignore" },
    ]);
    assert.deepEqual(
      runCommandMock.mock.calls.map((call) => call.arguments),
      [
        ["Stop colima", ["colima", "stop"], "."],
        ["Delete colima", ["colima", "delete", "--force"], "."],
      ]
    );
  });
});
