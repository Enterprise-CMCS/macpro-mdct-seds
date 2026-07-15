import assert from "node:assert/strict";
import { beforeEach, describe, it, mock } from "node:test";

type LambdaResponse = {
  FunctionError?: string;
  StatusCode?: number;
};

class InvokeCommand {
  readonly input: unknown;

  constructor(input: unknown) {
    this.input = input;
  }
}

class LambdaClient {
  constructor(config: unknown) {
    lambdaClients.push(config);
  }

  async send(command: InvokeCommand): Promise<LambdaResponse> {
    lambdaCalls.push(command);
    return lambdaResponse;
  }
}

const lambdaClients: unknown[] = [];
const lambdaCalls: InvokeCommand[] = [];
const stackOutputCalls: string[] = [];
let lambdaResponse: LambdaResponse = { StatusCode: 200 };
let stackOutputs: Record<string, string> = {
  SeedDataFunctionName: "data-floci-seedData",
};

mock.module("@aws-sdk/client-lambda", {
  namedExports: {
    InvokeCommand,
    LambdaClient,
  },
});

mock.module("./utils.ts", {
  namedExports: {
    getCloudFormationStackOutputValues: async (stackName: string) => {
      stackOutputCalls.push(stackName);
      return stackOutputs;
    },
  },
});

const { bootstrapLocalCognitoUsers, seedData } = await import("./seedData.ts");

describe("bootstrapLocalCognitoUsers", () => {
  beforeEach(() => {
    lambdaClients.length = 0;
    lambdaCalls.length = 0;
    lambdaResponse = { StatusCode: 200 };
    process.env.AWS_ENDPOINT_URL = "http://127.0.0.1:4566";
  });

  it("invokes the Floci bootstrap-users Lambda synchronously", async () => {
    await bootstrapLocalCognitoUsers();

    assert.deepEqual(lambdaClients, [
      { endpoint: "http://127.0.0.1:4566", region: "us-east-1" },
    ]);
    assert.deepEqual(lambdaCalls[0]?.input, {
      FunctionName: "ui-auth-floci-bootstrapUsers",
      InvocationType: "RequestResponse",
      Payload: Buffer.from(JSON.stringify({})),
    });
  });

  it("fails when the synchronous bootstrap invoke reports an error", async () => {
    lambdaResponse = { FunctionError: "Unhandled", StatusCode: 200 };

    await assert.rejects(
      bootstrapLocalCognitoUsers(),
      /Lambda invoke failed for ui-auth-floci-bootstrapUsers/
    );
  });
});

describe("seedData", () => {
  beforeEach(() => {
    lambdaClients.length = 0;
    lambdaCalls.length = 0;
    stackOutputCalls.length = 0;
    lambdaResponse = { StatusCode: 202 };
    stackOutputs = { SeedDataFunctionName: "data-floci-seedData" };
    process.env.AWS_ENDPOINT_URL = "http://127.0.0.1:4566";
    process.env.PROJECT = "seds";
  });

  it("invokes the Floci seed-data Lambda asynchronously", async () => {
    await seedData();

    assert.deepEqual(stackOutputCalls, ["seds-floci"]);
    assert.deepEqual(lambdaCalls[0]?.input, {
      FunctionName: "data-floci-seedData",
      InvocationType: "Event",
      Payload: Buffer.from(JSON.stringify({})),
    });
  });

  it("fails when the asynchronous seed-data invoke reports an error", async () => {
    lambdaResponse = { FunctionError: "Unhandled", StatusCode: 202 };

    await assert.rejects(
      seedData(),
      /Lambda invoke failed for data-floci-seedData/
    );
  });
});
