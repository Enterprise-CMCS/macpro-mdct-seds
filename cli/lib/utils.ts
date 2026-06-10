import {
  CloudFormationClient,
  DescribeStacksCommand,
} from "@aws-sdk/client-cloudformation";
import { writeLocalUiEnvFile } from "./write-ui-env-file.ts";
import { runCommand } from "../lib/runner.ts";
import { region } from "./consts.ts";

export const getCloudFormationStackOutputValues = async (
  stackName: string
): Promise<Record<string, string>> => {
  const cloudFormationClient = new CloudFormationClient({
    region,
  });
  const command = new DescribeStacksCommand({ StackName: stackName });
  const response = await cloudFormationClient.send(command);

  const outputs = response.Stacks?.[0]?.Outputs ?? [];
  return Object.fromEntries(
    outputs
      .map(
        (o) => [o.OutputKey ?? (o as any).OutputName, o.OutputValue] as const
      )
      .filter(([k]) => Boolean(k)) as [string, string][]
  );
};

const buildUiEnvObject = (
  stage: string,
  cfnOutputs: Record<string, string | undefined>
): Record<string, string> => {
  const uiPort = process.env.LOCAL_UI_PORT ?? "3000";

  if (stage === "ministack") {
    const apiId = new URL(cfnOutputs.ApiUrl!).hostname.split(".")[0];
    const miniStackPort = process.env.MINISTACK_PORT ?? "4566";

    return {
      SKIP_PREFLIGHT_CHECK: "true",
      API_REGION: region,
      API_URL: `http://localhost:${miniStackPort}/restapis/${apiId}/${stage}/_user_request_`,
      COGNITO_REGION: region,
      COGNITO_IDENTITY_POOL_ID: process.env.COGNITO_IDENTITY_POOL_ID!,
      COGNITO_USER_POOL_ID: process.env.COGNITO_USER_POOL_ID!,
      COGNITO_USER_POOL_CLIENT_ID: process.env.COGNITO_USER_POOL_CLIENT_ID!,
      COGNITO_USER_POOL_CLIENT_DOMAIN:
        process.env.COGNITO_USER_POOL_CLIENT_DOMAIN!,
      COGNITO_REDIRECT_SIGNIN: `http://localhost:${uiPort}/`,
      COGNITO_REDIRECT_SIGNOUT: `http://localhost:${uiPort}/`,
    };
  }

  return {
    SKIP_PREFLIGHT_CHECK: "true",
    API_REGION: region,
    API_URL: cfnOutputs.ApiUrl!,
    COGNITO_REGION: region,
    COGNITO_IDENTITY_POOL_ID: cfnOutputs.CognitoIdentityPoolId!,
    COGNITO_USER_POOL_ID: cfnOutputs.CognitoUserPoolId!,
    COGNITO_USER_POOL_CLIENT_ID: cfnOutputs.CognitoUserPoolClientId!,
    COGNITO_USER_POOL_CLIENT_DOMAIN: `${cfnOutputs.CognitoUserPoolClientDomain}.auth.${region}.amazoncognito.com`,
    COGNITO_REDIRECT_SIGNIN: cfnOutputs.CloudFrontUrl!,
    COGNITO_REDIRECT_SIGNOUT: cfnOutputs.CloudFrontUrl!,
  };
};

export const runFrontendLocally = async (stage: string) => {
  const outputs = await getCloudFormationStackOutputValues(
    `${process.env.PROJECT}-${stage}`
  );
  const envVars = buildUiEnvObject(stage, outputs);
  await writeLocalUiEnvFile(envVars);

  const uiPort = process.env.LOCAL_UI_PORT ?? "3000";
  runCommand(
    "ui",
    [
      "yarn",
      "start",
      "--host",
      "127.0.0.1",
      "--strictPort",
      "--port",
      uiPort,
      "--open",
      "false",
    ],
    "services/ui-src"
  );
};
