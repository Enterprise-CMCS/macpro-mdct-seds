import assert from "node:assert/strict";
import { beforeEach, describe, it, mock } from "node:test";

type DescribeStacksCommandInput = { StackName?: string };
type DeleteStackCommandInput = { StackName?: string };

const describeStacksCalls: DescribeStacksCommandInput[] = [];
const deleteStackCalls: DeleteStackCommandInput[] = [];
let describeStacksResponses: Record<
  string,
  { Stacks?: Array<{ StackStatus?: string }> }
> = {};
let waitResults: Record<string, "SUCCESS" | "TIMEOUT"> = {};
const restartMiniStackContainerMock = mock.fn(() => {});
const waitForMiniStackMock = mock.fn(async () => {});

class DescribeStacksCommand {
  input: DescribeStacksCommandInput;

  constructor(input: DescribeStacksCommandInput) {
    this.input = input;
    describeStacksCalls.push(input);
  }
}

class DeleteStackCommand {
  input: DeleteStackCommandInput;

  constructor(input: DeleteStackCommandInput) {
    this.input = input;
    deleteStackCalls.push(input);
  }
}

class CloudFormationClient {
  async send(command: DescribeStacksCommand | DeleteStackCommand) {
    if (command instanceof DescribeStacksCommand) {
      const stackName = command.input.StackName!;
      const response = describeStacksResponses[stackName];
      if (!response) {
        const error = new Error(
          `Stack with id ${stackName} does not exist`
        ) as Error & { name: string };
        error.name = "ValidationError";
        throw error;
      }
      return response;
    }

    return {};
  }
}

const waitUntilStackDeleteComplete = async (
  _options: { client: CloudFormationClient; maxWaitTime: number },
  input: DeleteStackCommandInput
) => ({
  state: waitResults[input.StackName!] ?? "SUCCESS",
});

mock.module("@aws-sdk/client-cloudformation", {
  namedExports: {
    CloudFormationClient,
    DescribeStacksCommand,
    DeleteStackCommand,
    waitUntilStackDeleteComplete,
  },
});

mock.module("./ministack.ts", {
  namedExports: {
    restartMiniStackContainer: restartMiniStackContainerMock,
    waitForMiniStack: waitForMiniStackMock,
  },
});

// PROJECT is snapshotted when consts.ts loads; set it before importing the SUT.
process.env.PROJECT = "mdct";

const { recoverFailedLocalStacks } = await import("./localStacks.ts");

const recoverOptions = {
  endpoint: "http://127.0.0.1:4566",
  port: "4566",
  containerName: "mdct-ministack-local",
};

describe("recoverFailedLocalStacks", () => {
  beforeEach(() => {
    describeStacksCalls.length = 0;
    deleteStackCalls.length = 0;
    describeStacksResponses = {};
    waitResults = {};
    restartMiniStackContainerMock.mock.resetCalls();
    waitForMiniStackMock.mock.resetCalls();
  });

  it("deletes local stacks stuck in CREATE_FAILED before redeploy", async () => {
    describeStacksResponses = {
      "mdct-ministack": {
        Stacks: [{ StackStatus: "CREATE_FAILED" }],
      },
      "mdct-prerequisites": {
        Stacks: [{ StackStatus: "CREATE_COMPLETE" }],
      },
    };

    await recoverFailedLocalStacks(recoverOptions);

    assert.deepEqual(
      describeStacksCalls.map((call) => call.StackName),
      ["mdct-ministack", "mdct-prerequisites", "mdct-local-prerequisites"]
    );
    assert.deepEqual(deleteStackCalls, [{ StackName: "mdct-ministack" }]);
    assert.equal(restartMiniStackContainerMock.mock.calls.length, 1);
    assert.equal(waitForMiniStackMock.mock.calls.length, 1);
  });

  it("deletes local stacks stuck in UPDATE_FAILED before redeploy", async () => {
    describeStacksResponses = {
      "mdct-ministack": {
        Stacks: [{ StackStatus: "UPDATE_FAILED" }],
      },
    };

    await recoverFailedLocalStacks(recoverOptions);

    assert.deepEqual(deleteStackCalls, [{ StackName: "mdct-ministack" }]);
    assert.equal(restartMiniStackContainerMock.mock.calls.length, 1);
  });

  it("restarts MiniStack when stacks are left in DELETE_COMPLETE", async () => {
    describeStacksResponses = {
      "mdct-ministack": {
        Stacks: [{ StackStatus: "DELETE_COMPLETE" }],
      },
    };

    await recoverFailedLocalStacks(recoverOptions);

    assert.equal(deleteStackCalls.length, 0);
    assert.deepEqual(restartMiniStackContainerMock.mock.calls[0]?.arguments, [
      "mdct-ministack-local",
    ]);
    assert.deepEqual(waitForMiniStackMock.mock.calls[0]?.arguments, ["4566"]);
  });

  it("ignores stacks that do not exist", async () => {
    await recoverFailedLocalStacks(recoverOptions);

    assert.equal(deleteStackCalls.length, 0);
    assert.equal(restartMiniStackContainerMock.mock.calls.length, 0);
  });
});
