import {
  CloudFormationClient,
  DescribeStacksCommand,
} from "@aws-sdk/client-cloudformation";
import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import path from "node:path";
import {
  writeLocalApiProxyConfig,
  writeLocalUiEnvFile,
} from "./write-ui-env-file.ts";
import { runCommand } from "./runner.ts";
import { region } from "./consts.ts";

const LOCAL_API_PROXY_PATH = "/local-api";

/** Browser-facing URL; Vite proxies this to MiniStack to avoid CORS on OPTIONS. */
const toLocalUiApiUrl = (uiPort: string) =>
  `http://localhost:${uiPort}${LOCAL_API_PROXY_PATH}`;

const toMinistackApiBasePath = (apiUrl: string, stage: string): string => {
  const match = apiUrl.match(/https?:\/\/([^.]+)\.execute-api\./);
  if (!match) {
    throw new Error(
      `Could not parse API Gateway URL for local proxy: ${apiUrl}`
    );
  }

  return `/restapis/${match[1]}/${stage}/_user_request_`;
};

export const getCloudFormationStackOutputValues = async (
  stackName: string
): Promise<Record<string, string>> => {
  const cloudFormationClient = new CloudFormationClient({
    region,
    ...(process.env.AWS_ENDPOINT_URL
      ? { endpoint: process.env.AWS_ENDPOINT_URL }
      : {}),
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
    const miniStackPort = process.env.MINISTACK_PORT ?? "4566";
    return {
      SKIP_PREFLIGHT_CHECK: "true",
      API_REGION: region,
      API_URL: toLocalUiApiUrl(uiPort),
      COGNITO_REGION: region,
      COGNITO_IDENTITY_POOL_ID: process.env.COGNITO_IDENTITY_POOL_ID ?? "",
      COGNITO_USER_POOL_ID: cfnOutputs.CognitoUserPoolId!,
      COGNITO_USER_POOL_CLIENT_ID: cfnOutputs.CognitoUserPoolClientId!,
      COGNITO_USER_POOL_CLIENT_DOMAIN: cfnOutputs.CognitoUserPoolClientDomain!,
      COGNITO_USER_POOL_ENDPOINT: `http://localhost:${miniStackPort}`,
      COGNITO_OAUTH_ENABLED: "false",
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

/** Opt-in MiniStack browser (StackPort) from macpro-mdct-tools. */
export const maybeStartStackPort = () => {
  if (process.env.MDCT_STACKPORT !== "1") return;

  const toolsRoot =
    process.env.MDCT_TOOLS_DIR ??
    path.join(process.env.HOME ?? "", "Projects/macpro-mdct-tools");
  const launcher = path.join(toolsRoot, "scripts/run-stackport.sh");
  if (!existsSync(launcher)) {
    console.warn(
      `MDCT_STACKPORT=1 but StackPort launcher not found at ${launcher}`
    );
    return;
  }

  const port = process.env.STACKPORT_PORT ?? "8080";
  const child = spawn(launcher, [], {
    detached: true,
    stdio: "ignore",
    env: { ...process.env },
  });
  child.unref();
  console.log(`StackPort starting at http://127.0.0.1:${port}`);
};

export const runFrontendLocally = async (stage: string) => {
  const outputs = await getCloudFormationStackOutputValues(
    `${process.env.PROJECT}-${stage}`
  );

  // Seed the same pool ID we write into the UI env. Watch can replace Cognito
  // pools after deploy; seeding here keeps login aligned with the active pool.
  if (stage === "ministack") {
    const { bootstrapLocalCognitoUsers } = await import("./seedData.ts");
    await bootstrapLocalCognitoUsers(outputs.CognitoUserPoolId);
  }

  const envVars = buildUiEnvObject(stage, outputs);
  await writeLocalUiEnvFile(envVars);

  if (stage === "ministack") {
    await writeLocalApiProxyConfig({
      gatewayEndpoint: process.env.AWS_ENDPOINT_URL ?? "http://127.0.0.1:4566",
      apiBasePath: toMinistackApiBasePath(outputs.ApiUrl!, stage),
    });
  }

  const uiPort = process.env.LOCAL_UI_PORT ?? "3000";
  runCommand(
    "ui",
    ["yarn", "start", "--strictPort", "--port", uiPort],
    "services/ui-src"
  );
};
