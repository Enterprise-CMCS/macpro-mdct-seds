import path from "path";
import { promises as fs } from "fs";
import { GetParameterCommand, SSMClient } from "@aws-sdk/client-ssm";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const project = "seds";
const region = "us-east-1";

export async function writeUiEnvFile(stage: string, local = false) {
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
    API_URL: deploymentOutput.apiGatewayRestApiUrl.slice(0, -1),
    COGNITO_REGION: region,
    COGNITO_IDENTITY_POOL_ID: deploymentOutput.identityPoolId,
    COGNITO_USER_POOL_ID: deploymentOutput.userPoolId,
    COGNITO_USER_POOL_CLIENT_ID: deploymentOutput.userPoolClientId,
    COGNITO_USER_POOL_CLIENT_DOMAIN: deploymentOutput.userPoolClientDomain,
    COGNITO_REDIRECT_SIGNIN: local
      ? "http://localhost:5000/"
      : deploymentOutput.applicationEndpointUrl,
    COGNITO_REDIRECT_SIGNOUT: local
      ? "http://localhost:5000/"
      : deploymentOutput.applicationEndpointUrl,
    STAGE: stage,
  };

  const outputPath = path.join(__dirname, "../../services/ui-src", "build");
  const configFilePath = path.resolve(outputPath, "env-config.js");

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
