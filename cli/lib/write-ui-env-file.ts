import path, { dirname } from "path";
import { promises as fs } from "fs";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const outputPath = path.join(__dirname, "../../../services/ui-src", "public");
const configFilePath = path.resolve(outputPath, "env-config.js");

const region = "us-east-1";

export async function writeLocalUiEnvFile(
  apiUrl?: string,
  outputValues?: { [key: string]: string }
) {
  if (!apiUrl && !outputValues) {
    throw new Error("Either apiUrl or outputValues must be provided");
  }

  let envVariables = {};
  if (apiUrl) {
    envVariables = {
      SKIP_PREFLIGHT_CHECK: "true",
      API_REGION: region,
      API_URL: apiUrl.replace("https", "http"),
      COGNITO_REGION: region,
      COGNITO_IDENTITY_POOL_ID: process.env.COGNITO_IDENTITY_POOL_ID,
      COGNITO_USER_POOL_ID: process.env.COGNITO_USER_POOL_ID,
      COGNITO_USER_POOL_CLIENT_ID: process.env.COGNITO_USER_POOL_CLIENT_ID,
      COGNITO_USER_POOL_CLIENT_DOMAIN:
        process.env.COGNITO_USER_POOL_CLIENT_DOMAIN,
      COGNITO_REDIRECT_SIGNIN: "http://localhost:3000/",
      COGNITO_REDIRECT_SIGNOUT: "http://localhost:3000/",
    };
  } else if (outputValues) {
    envVariables = {
      SKIP_PREFLIGHT_CHECK: "true",
      API_REGION: region,
      API_URL: outputValues["ApiUrl"],
      COGNITO_REGION: region,
      COGNITO_IDENTITY_POOL_ID: outputValues["CognitoIdentityPoolId"],
      COGNITO_USER_POOL_ID: outputValues["CognitoUserPoolId"],
      COGNITO_USER_POOL_CLIENT_ID: outputValues["CognitoUserPoolClientId"],
      COGNITO_USER_POOL_CLIENT_DOMAIN: `${outputValues["CognitoUserPoolClientDomain"]}.auth.us-east-1.amazoncognito.com`,
      COGNITO_REDIRECT_SIGNIN: outputValues["CloudFrontUrl"],
      COGNITO_REDIRECT_SIGNOUT: outputValues["CloudFrontUrl"],
    };
  }

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
