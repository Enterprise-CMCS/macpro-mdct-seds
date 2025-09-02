import {
  CloudFormationClient,
  DescribeStacksCommand,
} from "@aws-sdk/client-cloudformation";
import { writeLocalUiEnvFile } from "./write-ui-env-file.js";
import { runCommand } from "../lib/runner.js";
import { region } from "./consts.js";

export async function getCloudFormationStackOutputValues(
  stackName: string,
  outputNames: string[]
) {
  const cloudFormationClient = new CloudFormationClient({ region });
  const command = new DescribeStacksCommand({ StackName: stackName });
  const response = await cloudFormationClient.send(command);

  const outputs = response.Stacks?.[0]?.Outputs!;

  const result = {};
  for (const outputName of outputNames) {
    result[outputName] = outputs.find(
      (output) => output.OutputKey === outputName
    )?.OutputValue;
  }

  return result;
}

export async function runFrontendLocally(stage: string) {
  let apiUrl: string;
  if (stage === "localstack") {
    apiUrl = await getCloudFormationStackOutputValues(`seds-${stage}`, [
      "ApiUrl",
    ])["ApiUrl"];
    await writeLocalUiEnvFile(apiUrl);
  } else {
    const outputValues = await getCloudFormationStackOutputValues(
      `seds-${stage}`,
      [
        "ApiUrl",
        "CognitoIdentityPoolId",
        "CognitoUserPoolId",
        "CognitoUserPoolClientId",
        "CognitoUserPoolClientDomain",
        "CloudFrontUrl",
      ]
    );

    await writeLocalUiEnvFile("", outputValues);
  }

  runCommand("yarn", ["start"], "services/ui-src");
}
