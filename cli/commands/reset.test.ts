import assert from "node:assert/strict";
import { beforeEach, describe, it, mock } from "node:test";

type RunCommand = typeof import("../lib/runner.ts").runCommand;
type UpdateEnvFiles = typeof import("./update-env.ts").updateEnvFiles;

const runCommandMock = mock.fn<RunCommand>(async () => undefined);
const updateEnvFilesMock = mock.fn<UpdateEnvFiles>(async () => undefined);

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

const originalProject = process.env.PROJECT;
process.env.PROJECT = "seds";
delete process.env.MINISTACK_CONTAINER_NAME;
const { reset } = await import("./reset.ts");
if (originalProject === undefined) {
  delete process.env.PROJECT;
} else {
  process.env.PROJECT = originalProject;
}

describe("reset command", () => {
  beforeEach(() => {
    runCommandMock.mock.resetCalls();
    updateEnvFilesMock.mock.resetCalls();
  });

  it("removes the MiniStack container and tears down Colima", async () => {
    await reset.handler();

    assert.equal(updateEnvFilesMock.mock.calls.length, 1);
    assert.deepEqual(
      runCommandMock.mock.calls.map((call) => call.arguments),
      [
        [
          "Stop MiniStack",
          ["docker", "--context", "colima", "rm", "-f", "seds-ministack-local"],
          ".",
        ],
        ["Stop colima", ["colima", "stop"], "."],
        ["Delete colima", ["colima", "delete", "--force"], "."],
      ]
    );
  });

  it("ignores a failed MiniStack stop and still tears down Colima", async () => {
    runCommandMock.mock.mockImplementationOnce(async () => {
      throw new Error("stop failed");
    });

    await reset.handler();

    assert.deepEqual(
      runCommandMock.mock.calls.map((call) => call.arguments[0]),
      ["Stop MiniStack", "Stop colima", "Delete colima"]
    );
  });
});
