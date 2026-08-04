// This file is managed by macpro-mdct-core so if you'd like to change it let's do it there
import { InvokeCommand, LambdaClient } from "@aws-sdk/client-lambda";
import { region } from "./consts.ts";

export const invokeLambda = async (
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
    const payload = response.Payload
      ? new TextDecoder().decode(response.Payload)
      : "";
    throw new Error(`Lambda invoke failed for ${functionName}: ${payload}`);
  }
};
