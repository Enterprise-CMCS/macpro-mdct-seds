import {
  CloudFormationClient,
  DescribeStacksCommand,
} from "@aws-sdk/client-cloudformation";
import { writeLocalUiEnvFile } from "./write-ui-env-file";
import { runCommand } from "../lib/runner";
import { region } from "./consts";

export const getCloudFormationStackOutputValues = async (
  stackName: string,
  outputNames: string[]
): Promise<{ [key: string]: string }> => {
  const cloudFormationClient = new CloudFormationClient({ region });
  const command = new DescribeStacksCommand({ StackName: stackName });
  const response = await cloudFormationClient.send(command);

  const outputs = response.Stacks?.[0]?.Outputs!;
  const result: { [key: string]: string } = {};

  for (const outputName of outputNames) {
    result[outputName] = outputs.find(
      (output) => output.OutputKey === outputName
    )?.OutputValue!;
  }

  return result;
};

export const runFrontendLocally = async (stage: string) => {
  if (stage === "localstack") {
    const { ApiUrl } = await getCloudFormationStackOutputValues(
      `seds-${stage}`,
      ["ApiUrl"]
    );
    await writeLocalUiEnvFile({ ApiUrl });
  } else {
    const outputValues = await getCloudFormationStackOutputValues(
      `seds-${stage}`,
      [
        "ApiUrl",
        "CognitoIdentityPoolId",
        "CognitoUserPoolId",
        "CognitoUserPoolClientId",
        "CognitoUserPoolClientDomain",
      ]
    );

    await writeLocalUiEnvFile(outputValues);
  }

  runCommand("ui", ["yarn", "start"], "services/ui-src");
};
