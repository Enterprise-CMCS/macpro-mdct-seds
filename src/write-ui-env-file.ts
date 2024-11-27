import path from "path";
import { promises as fs } from "fs";
import { GetParameterCommand, SSMClient } from "@aws-sdk/client-ssm";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const outputPath = path.join(__dirname, "../../services/ui-src", "build");
const configFilePath = path.resolve(outputPath, "env-config.js");

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
  // TODO: below is for reference when removing dependency on deployment output ssm parameter
  // const deploymentOutput = {
  //   apiGatewayRestApiUrl:
  //     "https://g2mg8fv8k1.execute-api.us-east-1.amazonaws.com/jon-cdk2/",
  //   applicationEndpointUrl: "https://d3m12fopymge82.cloudfront.net/",
  //   s3BucketName:
  //     "seds-jon-cdk2-uinestedstackuinest-s3bucket07682993-mb9i8dvcubw5",
  //   cloudfrontDistributionId: "EGZ02V3J516SJ",
  //   identityPoolId: "us-east-1:9b430ef4-1bee-4ed7-a94d-7854848335d1",
  //   userPoolId: "us-east-1_1IfwcFGuo",
  //   userPoolClientId: "6lebne58mma8qgasbhj763on18",
  //   userPoolClientDomain:
  //     "jon-cdk2-login-user-pool-client.auth.us-east-1.amazoncognito.com",
  //   bootstrapUsersFunctionName:
  //     "seds-jon-cdk2-uiauthNestedS-bootstrapUsers9AF96131-2j29wPIx60Mb",
  //   seedDataFunctionName:
  //     "seds-jon-cdk2-databaseNestedStack-seedData88C4E515-4usR7jNnsDrs",
  // };

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
