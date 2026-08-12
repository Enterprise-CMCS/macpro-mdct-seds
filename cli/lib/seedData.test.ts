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

class AdminCreateUserCommand {
  input: unknown;
  constructor(input: unknown) {
    this.input = input;
  }
}
class AdminSetUserPasswordCommand {
  input: unknown;
  constructor(input: unknown) {
    this.input = input;
  }
}
class AdminUpdateUserAttributesCommand {
  input: unknown;
  constructor(input: unknown) {
    this.input = input;
  }
}

const cognitoCommands: unknown[] = [];

class CognitoIdentityProviderClient {
  constructor(_config: unknown) {}

  async send(command: unknown) {
    cognitoCommands.push(command);
  }
}

const lambdaCalls: InvokeCommand[] = [];
let lambdaResponse: LambdaResponse = { StatusCode: 202 };
let stackOutputs: Record<string, string> = {
  CognitoUserPoolId: "us-east-1_testpool",
  SeedDataFunctionName: "data-ministack-seedData",
};

mock.module("@aws-sdk/client-lambda", {
  namedExports: {
    InvokeCommand,
    LambdaClient,
  },
});

mock.module("@aws-sdk/client-cognito-identity-provider", {
  namedExports: {
    CognitoIdentityProviderClient,
    AdminCreateUserCommand,
    AdminSetUserPasswordCommand,
    AdminUpdateUserAttributesCommand,
  },
});

mock.module("./utils.ts", {
  namedExports: {
    getCloudFormationStackOutputValues: async () => ({ ...stackOutputs }),
  },
});

mock.module("node:fs", {
  namedExports: {
    readFileSync: () =>
      JSON.stringify([
        {
          username: "adminuser@test.com",
          attributes: [{ Name: "email", Value: "adminuser@test.com" }],
        },
      ]),
  },
});

const { bootstrapLocalCognitoUsers, seedData } = await import("./seedData.ts");

describe("bootstrapLocalCognitoUsers", () => {
  beforeEach(() => {
    cognitoCommands.length = 0;
    process.env.AWS_ENDPOINT_URL = "http://127.0.0.1:4566";
    process.env.LOCAL_COGNITO_PASSWORD = "Password123!"; // pragma: allowlist secret
    stackOutputs = {
      CognitoUserPoolId: "us-east-1_testpool",
      SeedDataFunctionName: "data-ministack-seedData",
    };
  });

  it("seeds users directly into the current Cognito user pool", async () => {
    await bootstrapLocalCognitoUsers();

    assert.equal(cognitoCommands.length, 3);
    assert.ok(cognitoCommands[0] instanceof AdminCreateUserCommand);
    assert.ok(cognitoCommands[1] instanceof AdminSetUserPasswordCommand);
    assert.ok(cognitoCommands[2] instanceof AdminUpdateUserAttributesCommand);
    assert.deepEqual((cognitoCommands[0] as AdminCreateUserCommand).input, {
      UserPoolId: "us-east-1_testpool",
      Username: "adminuser@test.com",
      MessageAction: "SUPPRESS",
      UserAttributes: [{ Name: "email", Value: "adminuser@test.com" }],
    });
  });

  it("fails when CognitoUserPoolId is missing", async () => {
    stackOutputs = {};
    await assert.rejects(
      bootstrapLocalCognitoUsers(),
      /CognitoUserPoolId missing/
    );
  });
});

describe("seedData", () => {
  beforeEach(() => {
    lambdaCalls.length = 0;
    lambdaResponse = { StatusCode: 202 };
    stackOutputs = {
      CognitoUserPoolId: "us-east-1_testpool",
      SeedDataFunctionName: "data-ministack-seedData",
    };
    process.env.AWS_ENDPOINT_URL = "http://127.0.0.1:4566";
  });

  it("invokes the MiniStack seed Lambda asynchronously", async () => {
    await seedData();

    assert.equal(lambdaCalls.length, 1);
    assert.deepEqual(lambdaCalls[0]?.input, {
      FunctionName: "data-ministack-seedData",
      InvocationType: "Event",
      Payload: Buffer.from(JSON.stringify({})),
    });
  });

  it("skips invoke when SeedDataFunctionName is missing", async () => {
    stackOutputs = { CognitoUserPoolId: "us-east-1_testpool" };
    await seedData();
    assert.equal(lambdaCalls.length, 0);
  });
});
