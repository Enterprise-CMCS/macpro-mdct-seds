import { InvokeCommand, LambdaClient } from "@aws-sdk/client-lambda";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { mockClient } from "aws-sdk-client-mock";
import { bootstrapLocalCognitoUsers } from "./seedData.ts";

const lambdaMock = mockClient(LambdaClient);

describe("bootstrapLocalCognitoUsers", () => {
  beforeEach(() => {
    lambdaMock.reset();
    process.env.AWS_ENDPOINT_URL = "http://127.0.0.1:4566";
  });

  it("invokes the MiniStack bootstrap-users Lambda synchronously", async () => {
    const invoke = vi.fn().mockResolvedValue({ StatusCode: 200 });
    lambdaMock.on(InvokeCommand).callsFake(invoke);

    await bootstrapLocalCognitoUsers();

    expect(invoke).toHaveBeenCalledWith(
      {
        FunctionName: "ui-auth-ministack-bootstrapUsers",
        InvocationType: "RequestResponse",
        Payload: Buffer.from(JSON.stringify({})),
      },
      expect.any(Function)
    );
  });

  it("fails when the synchronous bootstrap invoke reports an error", async () => {
    lambdaMock
      .on(InvokeCommand)
      .resolves({ FunctionError: "Unhandled", StatusCode: 200 });

    await expect(bootstrapLocalCognitoUsers()).rejects.toThrow(
      "Lambda invoke failed for ui-auth-ministack-bootstrapUsers"
    );
  });
});
