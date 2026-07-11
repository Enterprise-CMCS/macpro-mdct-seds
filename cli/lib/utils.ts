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

const getLocalUiPort = () => process.env.LOCAL_UI_PORT ?? "3000";

// Path-relative REST endpoint. Amplify's resolveApiUrl resolves a relative
// endpoint against location.origin, so requests flow through the same-origin
// Vite `/_floci-api` proxy to the Floci container instead of hitting its port
// cross-origin.
export const getFlociApiUrl = (apiUrl: string, stage: string) => {
  const restApiId = new URL(apiUrl).hostname.split(".")[0];
  return `/_floci-api/restapis/${restApiId}/${stage}/_user_request_`;
};

export const buildUiEnvObject = (
  stage: string,
  cfnOutputs: Record<string, string | undefined>
): Record<string, string> => {
  if (stage === "floci") {
    const uiPort = getLocalUiPort();

    return {
      SKIP_PREFLIGHT_CHECK: "true",
      API_REGION: region,
      API_URL: getFlociApiUrl(cfnOutputs.ApiUrl!, stage),
      COGNITO_REGION: region,
      COGNITO_IDENTITY_POOL_ID: "",
      COGNITO_USER_POOL_ID: cfnOutputs.CognitoUserPoolId!,
      COGNITO_USER_POOL_CLIENT_ID: cfnOutputs.CognitoUserPoolClientId!,
      COGNITO_USER_POOL_CLIENT_DOMAIN:
        cfnOutputs.CognitoUserPoolClientDomain ?? "",
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

export const buildUiStartCommand = (): {
  prefix: string;
  cmd: string[];
  cwd: string;
} => ({
  prefix: "ui",
  cmd: [
    "yarn",
    "start",
    "--host",
    "127.0.0.1",
    "--strictPort",
    "--port",
    getLocalUiPort(),
    "--no-open",
  ],
  cwd: "services/ui-src",
});

export const runFrontendLocally = async (stage: string) => {
  const outputs = await getCloudFormationStackOutputValues(
    `${process.env.PROJECT}-${stage}`
  );
  const envVars = buildUiEnvObject(stage, outputs);
  await writeLocalUiEnvFile(envVars);

  const { prefix, cmd, cwd } = buildUiStartCommand();
  return runCommand(prefix, cmd, cwd);
};
