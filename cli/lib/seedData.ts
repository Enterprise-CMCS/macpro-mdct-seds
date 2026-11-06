// This file is managed by macpro-mdct-core so if you'd like to change it let's do it there
import {
  AdminCreateUserCommand,
  AdminSetUserPasswordCommand,
  AdminUpdateUserAttributesCommand,
  CognitoIdentityProviderClient,
} from "@aws-sdk/client-cognito-identity-provider";
import { InvokeCommand, LambdaClient } from "@aws-sdk/client-lambda";
import { readFileSync } from "node:fs";
import path from "node:path";
import { getCloudFormationStackOutputValues } from "./utils.ts";
import { project, region } from "./consts.ts";

type SeedUser = {
  username: string;
  attributes: { Name: string; Value: string }[];
};

const localAwsConfig = () => ({
  region,
  endpoint: process.env.AWS_ENDPOINT_URL,
  credentials: {
    accessKeyId: "test",
    secretAccessKey: "test", // pragma: allowlist secret
  },
});

const invokeLambda = async (
  functionName: string,
  invocationType: "Event" | "RequestResponse"
) => {
  const expectedStatusCode = invocationType === "Event" ? 202 : 200;
  const lambdaClient = new LambdaClient(localAwsConfig());
  const response = await lambdaClient.send(
    new InvokeCommand({
      FunctionName: functionName,
      InvocationType: invocationType,
      Payload: Buffer.from(JSON.stringify({})),
    })
  );

  if (response.FunctionError || response.StatusCode !== expectedStatusCode) {
    throw new Error(`Lambda invoke failed for ${functionName}`);
  }
};

const loadLocalCognitoUsers = (): SeedUser[] => {
  const usersPath = path.resolve("services/ui-auth/libs/users.json");
  return JSON.parse(readFileSync(usersPath, "utf8")) as SeedUser[];
};

/**
 * Seed Cognito directly against the current stack output pool.
 * Invoking the bootstrap Lambda is brittle locally: cdklocal watch often
 * recreates the pool after deploy, leaving the Lambda's pooled ID stale/empty.
 */
export const bootstrapLocalCognitoUsers = async (userPoolId?: string) => {
  const CognitoUserPoolId =
    userPoolId ??
    (await getCloudFormationStackOutputValues(`${project}-ministack`))
      .CognitoUserPoolId;
  if (!CognitoUserPoolId) {
    throw new Error("CognitoUserPoolId missing from ministack stack outputs");
  }

  const password = process.env.LOCAL_COGNITO_PASSWORD; // pragma: allowlist secret
  const cognito = new CognitoIdentityProviderClient(localAwsConfig());
  const users = loadLocalCognitoUsers();

  for (const user of users) {
    try {
      await cognito.send(
        new AdminCreateUserCommand({
          UserPoolId: CognitoUserPoolId,
          Username: user.username,
          MessageAction: "SUPPRESS",
          UserAttributes: user.attributes,
        })
      );
    } catch {
      // User may already exist from a prior local run.
    }

    try {
      await cognito.send(
        new AdminSetUserPasswordCommand({
          UserPoolId: CognitoUserPoolId,
          Username: user.username,
          Password: password,
          Permanent: true,
        })
      );
    } catch (error) {
      throw new Error(
        `Failed to set password for ${user.username} in ${CognitoUserPoolId}`,
        { cause: error }
      );
    }

    try {
      await cognito.send(
        new AdminUpdateUserAttributesCommand({
          UserPoolId: CognitoUserPoolId,
          Username: user.username,
          UserAttributes: user.attributes,
        })
      );
    } catch {
      // Attributes are best-effort if the user already matched seed data.
    }
  }
};

export const seedData = async () => {
  const SeedDataFunctionName = (
    await getCloudFormationStackOutputValues(`${project}-ministack`)
  )["SeedDataFunctionName"];

  if (SeedDataFunctionName) {
    // Event avoids MiniStack sync-invoke "Header overflow" on large seed responses.
    await invokeLambda(SeedDataFunctionName, "Event");
  }
};
