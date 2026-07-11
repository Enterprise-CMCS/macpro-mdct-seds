import { type Stack } from "@aws-sdk/client-cloudformation";
import assert from "node:assert/strict";
import { afterEach, beforeEach, describe, it, mock } from "node:test";

type RunCommand = typeof import("./runner.ts").runCommand;
type WriteLocalUiEnvFile =
  typeof import("./write-ui-env-file.ts").writeLocalUiEnvFile;

type DescribeStacksResponse = {
  Stacks?: Stack[];
};

class DescribeStacksCommand {
  readonly input: { StackName: string };

  constructor(input: { StackName: string }) {
    this.input = input;
  }
}

class CloudFormationClient {
  constructor(_config: { region: string }) {}

  async send(command: DescribeStacksCommand): Promise<DescribeStacksResponse> {
    describeStacksCalls.push(command);
    return describeStacksResponse;
  }
}

const describeStacksCalls: DescribeStacksCommand[] = [];
let describeStacksResponse: DescribeStacksResponse = {};
const runCommandMock = mock.fn<RunCommand>(async () => undefined);
const writeLocalUiEnvFileMock = mock.fn<WriteLocalUiEnvFile>(
  async () => undefined
);

mock.module("@aws-sdk/client-cloudformation", {
  namedExports: {
    CloudFormationClient,
    DescribeStacksCommand,
  },
});

mock.module("./runner.ts", {
  namedExports: {
    runCommand: runCommandMock,
  },
});

mock.module("./write-ui-env-file.ts", {
  namedExports: {
    writeLocalUiEnvFile: writeLocalUiEnvFileMock,
  },
});

const { runFrontendLocally } = await import("./utils.ts");
const envKeys = ["PROJECT", "MINISTACK_PORT", "LOCAL_UI_PORT"] as const;
const originalEnv = Object.fromEntries(
  envKeys.map((key) => [key, process.env[key]])
) as Record<(typeof envKeys)[number], string | undefined>;

describe("runFrontendLocally", () => {
  beforeEach(() => {
    describeStacksCalls.length = 0;
    runCommandMock.mock.resetCalls();
    writeLocalUiEnvFileMock.mock.resetCalls();
    process.env.PROJECT = "seds";
    process.env.MINISTACK_PORT = "4567";
    process.env.LOCAL_UI_PORT = "3333";
  });

  afterEach(() => {
    for (const key of envKeys) {
      const originalValue = originalEnv[key];
      if (originalValue === undefined) {
        delete process.env[key];
      } else {
        process.env[key] = originalValue;
      }
    }
  });

  it("writes the MiniStack Cognito UI env from stack outputs", async () => {
    describeStacksResponse = {
      Stacks: [
        {
          StackName: "seds-ministack",
          CreationTime: new Date(0),
          StackStatus: "CREATE_COMPLETE",
          Outputs: [
            {
              OutputKey: "ApiUrl",
              OutputValue:
                "https://api123.execute-api.us-east-1.amazonaws.com/ministack",
            },
            {
              OutputKey: "CognitoUserPoolId",
              OutputValue: "local-user-pool",
            },
            {
              OutputKey: "CognitoUserPoolClientId",
              OutputValue: "local-client",
            },
            {
              OutputKey: "CognitoUserPoolClientDomain",
              OutputValue: "local-domain",
            },
          ],
        },
      ],
    };

    await runFrontendLocally("ministack");

    assert.deepEqual(
      describeStacksCalls.map((command) => command.input),
      [{ StackName: "seds-ministack" }]
    );
    assert.deepEqual(writeLocalUiEnvFileMock.mock.calls[0]?.arguments[0], {
      SKIP_PREFLIGHT_CHECK: "true",
      API_REGION: "us-east-1",
      API_URL: "http://localhost:4567/restapis/api123/ministack/_user_request_",
      COGNITO_REGION: "us-east-1",
      COGNITO_IDENTITY_POOL_ID: "",
      COGNITO_USER_POOL_ID: "local-user-pool",
      COGNITO_USER_POOL_CLIENT_ID: "local-client",
      COGNITO_USER_POOL_CLIENT_DOMAIN: "local-domain",
      COGNITO_USER_POOL_ENDPOINT: "http://localhost:4567",
      COGNITO_IDENTITY_POOL_ENDPOINT: "",
      COGNITO_OAUTH_ENABLED: "false",
      COGNITO_REDIRECT_SIGNIN: "http://localhost:3333/",
      COGNITO_REDIRECT_SIGNOUT: "http://localhost:3333/",
    });
    assert.deepEqual(runCommandMock.mock.calls[0]?.arguments, [
      "ui",
      [
        "yarn",
        "start",
        "--host",
        "127.0.0.1",
        "--strictPort",
        "--port",
        "3333",
        "--open",
        "false",
      ],
      "services/ui-src",
    ]);
  });
});
