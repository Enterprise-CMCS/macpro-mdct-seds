import path from "path";
import { promises as fs } from "fs";
import { GetParameterCommand, SSMClient } from "@aws-sdk/client-ssm";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const outputPath = path.join(__dirname, "../../services/ui-src", "public");
const configFilePath = path.resolve(outputPath, "env-config.js");

const project = "seds";
const region = "us-east-1";

export async function writeLocalUiEnvFile(stage: string) {
  const ssmClient = new SSMClient({ region });
  const parameterName = `/${project}/${stage}/deployment-output`;

  let Parameter;
  try {
    Parameter = (
      await ssmClient.send(new GetParameterCommand({ Name: parameterName }))
    ).Parameter;
  } catch {
    throw Error(`Cannot find SSM parameter ${parameterName}`);
  }
  const deploymentOutput = JSON.parse(Parameter!.Value!);

  const envVariables = {
    LOCAL_LOGIN: "false",
    SKIP_PREFLIGHT_CHECK: "true",
    API_REGION: region,
    API_URL: deploymentOutput.apiGatewayRestApiUrl
      .replace(".cloud", ".cloud:4566")
      .replace("https", "http"),
    COGNITO_REGION: process.env.COGNITO_REGION,
    COGNITO_IDENTITY_POOL_ID: process.env.COGNITO_IDENTITY_POOL_ID,
    COGNITO_USER_POOL_ID: process.env.COGNITO_USER_POOL_ID,
    COGNITO_USER_POOL_CLIENT_ID: process.env.COGNITO_USER_POOL_CLIENT_ID,
    COGNITO_USER_POOL_CLIENT_DOMAIN:
      process.env.COGNITO_USER_POOL_CLIENT_DOMAIN,
    COGNITO_REDIRECT_SIGNIN: "http://localhost:3000/",
    COGNITO_REDIRECT_SIGNOUT: "http://localhost:3000/",
    STAGE: stage,
  };

  await fs.rm(configFilePath, { force: true });

  const envConfigContent = [
    "window._env_ = {",
    ...Object.entries(envVariables).map(
      ([key, value]) => `  ${key}: "${value}",`
    ),
    "};",
  ].join("\n");

  await fs.writeFile(configFilePath, envConfigContent);
}
