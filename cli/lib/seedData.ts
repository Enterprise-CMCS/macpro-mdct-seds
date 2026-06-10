// This file is managed by macpro-mdct-core so if you'd like to change it let's do it there
import { InvokeCommand, LambdaClient } from "@aws-sdk/client-lambda";
import { getCloudFormationStackOutputValues } from "./utils.ts";
import { project, region } from "./consts.ts";

const invokeLambda = async (
  functionName: string,
  invocationType: "Event" | "RequestResponse"
) => {
  const expectedStatusCode = invocationType === "Event" ? 202 : 200;
  const lambdaClient = new LambdaClient({
    region,
    endpoint: process.env.AWS_ENDPOINT_URL,
  });
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

export const bootstrapLocalCognitoUsers = async () => {
  await invokeLambda("ui-auth-ministack-bootstrapUsers", "RequestResponse");
};

export const seedData = async () => {
  const SeedDataFunctionName = (
    await getCloudFormationStackOutputValues(`${project}-ministack`)
  )["SeedDataFunctionName"];

  if (SeedDataFunctionName) {
    await invokeLambda(SeedDataFunctionName, "Event");
  }
};
