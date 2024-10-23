import path from "path";
import { promises as fs } from "fs";
import { GetParameterCommand, SSMClient } from "@aws-sdk/client-ssm";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const project = "seds";
const region = "us-east-1";

const writeEnvConfig = async (
  envVariables: Record<string, string>,
  outputPath: string
) => {
  const configFilePath = path.resolve(outputPath, "env-config.js");

  await fs.rm(configFilePath, { force: true });
  await fs.writeFile(configFilePath, "", { flag: "w" });

  await fs.appendFile(configFilePath, "window._env_ = {\n");

  for (const [key, value] of Object.entries(envVariables)) {
    await fs.appendFile(configFilePath, `  ${key}: "${value}",\n`);
  }

  await fs.appendFile(configFilePath, "};\n");
};

export async function writeUiEnvFile(stage: string, local = false) {
  const deploymentOutput = JSON.parse(
    (
      await new SSMClient({ region: "us-east-1" }).send(
        new GetParameterCommand({
          Name: `/${project}/${stage}/deployment-output`,
        })
      )
    ).Parameter!.Value!
  );

  const envVariables = {
    LOCAL_LOGIN: "false",
    SKIP_PREFLIGHT_CHECK: "true",
    API_REGION: region,
    API_URL: deploymentOutput.apiGatewayRestApiUrl,
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

  await writeEnvConfig(
    envVariables,
    path.join(__dirname, "../../services/ui-src", "build")
  );
}
