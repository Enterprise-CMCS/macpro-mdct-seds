import {
  CloudFormationClient,
  DescribeStacksCommand,
} from "@aws-sdk/client-cloudformation";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { mockClient } from "aws-sdk-client-mock";
import { runCommand } from "./runner.ts";
import { runFrontendLocally } from "./utils.ts";
import { writeLocalUiEnvFile } from "./write-ui-env-file.ts";

const mocks = vi.hoisted(() => ({
  runCommand: vi.fn(),
  writeLocalUiEnvFile: vi.fn(),
}));

vi.mock("./runner.ts", () => ({
  runCommand: mocks.runCommand,
}));

vi.mock("./write-ui-env-file.ts", () => ({
  writeLocalUiEnvFile: mocks.writeLocalUiEnvFile,
}));

const cloudFormationMock = mockClient(CloudFormationClient);
const envKeys = ["PROJECT", "MINISTACK_PORT", "LOCAL_UI_PORT"] as const;
const originalEnv = Object.fromEntries(
  envKeys.map((key) => [key, process.env[key]])
) as Record<(typeof envKeys)[number], string | undefined>;

describe("runFrontendLocally", () => {
  const runCommandMock = vi.mocked(runCommand);
  const writeLocalUiEnvFileMock = vi.mocked(writeLocalUiEnvFile);

  beforeEach(() => {
    vi.clearAllMocks();
    cloudFormationMock.reset();
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
    cloudFormationMock.on(DescribeStacksCommand).resolves({
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
    });

    await runFrontendLocally("ministack");

    expect(
      cloudFormationMock.commandCalls(DescribeStacksCommand, {
        StackName: "seds-ministack",
      })
    ).toHaveLength(1);
    expect(writeLocalUiEnvFileMock).toHaveBeenCalledWith(
      expect.objectContaining({
        API_URL:
          "http://localhost:4567/restapis/api123/ministack/_user_request_",
        COGNITO_IDENTITY_POOL_ID: "",
        COGNITO_USER_POOL_ID: "local-user-pool",
        COGNITO_USER_POOL_CLIENT_ID: "local-client",
        COGNITO_USER_POOL_CLIENT_DOMAIN: "local-domain",
        COGNITO_USER_POOL_ENDPOINT: "http://localhost:4567",
        COGNITO_OAUTH_ENABLED: "false",
      })
    );
    expect(runCommandMock).toHaveBeenCalledWith(
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
      "services/ui-src"
    );
  });
});
