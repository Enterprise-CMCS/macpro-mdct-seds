import path, { dirname } from "path";
import { promises as fs } from "fs";
import { fileURLToPath } from "url";
import { region } from "./consts";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const configFilePath = path.resolve(
  path.join(__dirname, "../../services/ui-src/public/env-config.js")
);

export const writeLocalUiEnvFile = async (values: {
  [key: string]: string;
}) => {
  const apiUrl = values["ApiUrl"];
  if (!apiUrl) throw new Error("ApiUrl is required");

  const hasFullOutputs = [
    "CognitoIdentityPoolId",
    "CognitoUserPoolId",
    "CognitoUserPoolClientId",
    "CognitoUserPoolClientDomain",
  ].every((k) => Boolean(values[k]));

  const envVariables = hasFullOutputs
    ? {
        SKIP_PREFLIGHT_CHECK: "true",
        API_REGION: region,
        API_URL: values["ApiUrl"],
        COGNITO_REGION: region,
        COGNITO_IDENTITY_POOL_ID: values["CognitoIdentityPoolId"],
        COGNITO_USER_POOL_ID: values["CognitoUserPoolId"],
        COGNITO_USER_POOL_CLIENT_ID: values["CognitoUserPoolClientId"],
        COGNITO_USER_POOL_CLIENT_DOMAIN: `${values["CognitoUserPoolClientDomain"]}.auth.${region}.amazoncognito.com`,
        COGNITO_REDIRECT_SIGNIN: "http://localhost:3000/",
        COGNITO_REDIRECT_SIGNOUT: "http://localhost:3000/",
      }
    : {
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

  await fs.rm(configFilePath, { force: true });

  const envConfigContent = [
    "window._env_ = {",
    ...Object.entries(envVariables).map(
      ([key, value]) => `  ${key}: "${value}",`
    ),
    "};",
  ].join("\n");

  await fs.writeFile(configFilePath, envConfigContent);
};
