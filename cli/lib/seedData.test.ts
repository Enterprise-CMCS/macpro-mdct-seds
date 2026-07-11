import type { InvokeCommandInput } from "@aws-sdk/client-lambda";
import assert from "node:assert/strict";
import { beforeEach, describe, it, mock } from "node:test";

type LambdaResponse = {
  FunctionError?: string;
  StatusCode?: number;
};

class InvokeCommand {
  readonly input: InvokeCommandInput;

  constructor(input: InvokeCommandInput) {
    this.input = input;
  }
}

class LambdaClient {
  constructor(_config: { endpoint?: string; region: string }) {}

  async send(command: InvokeCommand): Promise<LambdaResponse> {
    lambdaCalls.push(command);
    return lambdaResponse;
  }
}

const lambdaCalls: InvokeCommand[] = [];
let lambdaResponse: LambdaResponse = { StatusCode: 200 };

mock.module("@aws-sdk/client-lambda", {
  namedExports: {
    InvokeCommand,
    LambdaClient,
  },
});

const { bootstrapLocalCognitoUsers } = await import("./seedData.ts");

describe("bootstrapLocalCognitoUsers", () => {
  beforeEach(() => {
    lambdaCalls.length = 0;
    lambdaResponse = { StatusCode: 200 };
    process.env.AWS_ENDPOINT_URL = "http://127.0.0.1:4566";
  });

  it("invokes the MiniStack bootstrap-users Lambda synchronously", async () => {
    await bootstrapLocalCognitoUsers();

    assert.equal(lambdaCalls.length, 1);
    assert.deepEqual(lambdaCalls[0]?.input, {
      FunctionName: "ui-auth-ministack-bootstrapUsers",
      InvocationType: "RequestResponse",
      Payload: Buffer.from(JSON.stringify({})),
    });
  });

  it("fails when the synchronous bootstrap invoke reports an error", async () => {
    lambdaResponse = { FunctionError: "Unhandled", StatusCode: 200 };

    await assert.rejects(
      bootstrapLocalCognitoUsers(),
      /Lambda invoke failed for ui-auth-ministack-bootstrapUsers/
    );
  });
});
