import React from "react";
import { createRoot } from "react-dom/client";
import "./index.scss";
import App from "./components/App/App";
import { BrowserRouter } from "react-router";
import { Amplify, type ResourcesConfig } from "aws-amplify";
import config from "./config/config";

type AuthConfig = NonNullable<ResourcesConfig["Auth"]>;
type CognitoConfig = AuthConfig["Cognito"];

const userPoolConfig = {
  userPoolId: config.cognito.USER_POOL_ID,
  userPoolClientId: config.cognito.APP_CLIENT_ID,
  ...(config.cognito.USER_POOL_ENDPOINT
    ? { userPoolEndpoint: config.cognito.USER_POOL_ENDPOINT }
    : {}),
  ...(config.cognito.OAUTH_ENABLED
    ? {
        loginWith: {
          oauth: {
            domain: config.cognito.APP_CLIENT_DOMAIN,
            redirectSignIn: [config.cognito.REDIRECT_SIGNIN],
            redirectSignOut: [config.cognito.REDIRECT_SIGNOUT],
            scopes: ["email", "openid", "profile"],
            responseType: "token",
          },
        },
      }
    : {}),
} satisfies CognitoConfig;

const authConfig = (
  config.cognito.IDENTITY_POOL_ID
    ? {
        Cognito: {
          ...userPoolConfig,
          identityPoolId: config.cognito.IDENTITY_POOL_ID,
          ...(config.cognito.IDENTITY_POOL_ENDPOINT
            ? { identityPoolEndpoint: config.cognito.IDENTITY_POOL_ENDPOINT }
            : {}),
        },
      }
    : { Cognito: userPoolConfig }
) satisfies AuthConfig;

Amplify.configure(
  {
    Auth: authConfig,
    API: {
      REST: {
        "mdct-seds": {
          endpoint: config.apiGateway.URL,
          region: config.apiGateway.REGION,
        },
      },
    },
  },
  {
    API: {
      REST: {
        // We can re-enable retries for specific endpoints if/when appropriate.
        // See: https://docs.amplify.aws/react/frontend/rest-api/fetch-data/
        retryStrategy: { strategy: "no-retry" },
      },
    },
  }
);

const root = createRoot(document.getElementById("root"));
root.render(
  <BrowserRouter>
    <App />
  </BrowserRouter>
);
