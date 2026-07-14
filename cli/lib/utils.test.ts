import { test } from "node:test";
import assert from "node:assert/strict";
import {
  buildUiEnvObject,
  buildUiStartCommand,
  getFlociApiUrl,
} from "./utils.ts";

const withEnv = (key: string, value: string | undefined, fn: () => void) => {
  const original = process.env[key];
  if (value === undefined) {
    delete process.env[key];
  } else {
    process.env[key] = value;
  }
  try {
    fn();
  } finally {
    if (original === undefined) {
      delete process.env[key];
    } else {
      process.env[key] = original;
    }
  }
};

const withEnvs = (env: Record<string, string | undefined>, fn: () => void) => {
  const originals = Object.fromEntries(
    Object.keys(env).map((key) => [key, process.env[key]])
  );
  try {
    for (const [key, value] of Object.entries(env)) {
      if (value === undefined) {
        delete process.env[key];
      } else {
        process.env[key] = value;
      }
    }
    fn();
  } finally {
    for (const [key, value] of Object.entries(originals)) {
      if (value === undefined) {
        delete process.env[key];
      } else {
        process.env[key] = value;
      }
    }
  }
};

const flociOutputs = {
  ApiUrl: "https://abc123.execute-api.us-east-1.amazonaws.com/floci",
  CognitoUserPoolId: "us-east-1_local000",
  CognitoUserPoolClientId: "localclientid",
  CognitoUserPoolClientDomain: "",
};

test("getFlociApiUrl returns a same-origin path for the Vite /_floci-api proxy", () => {
  assert.equal(
    getFlociApiUrl(flociOutputs.ApiUrl, "floci"),
    "/_floci-api/restapis/abc123/floci/_user_request_"
  );
});

test("floci UI env routes API through the same-origin proxy", () => {
  withEnvs({ FLOCI_PORT: "4570" }, () => {
    const env = buildUiEnvObject("floci", flociOutputs);

    assert.ok(
      env.API_URL.startsWith("/_floci-api/"),
      `expected relative API_URL, got ${env.API_URL}`
    );
    assert.equal(env.COGNITO_IDENTITY_POOL_ID, "");
    assert.equal(env.COGNITO_USER_POOL_ID, flociOutputs.CognitoUserPoolId);
    assert.equal(
      env.COGNITO_USER_POOL_CLIENT_ID,
      flociOutputs.CognitoUserPoolClientId
    );
    assert.equal(
      env.COGNITO_USER_POOL_ENDPOINT,
      "http://localhost:3000/_floci-cognito"
    );
  });
});

test("deployed UI env keeps an absolute API_URL", () => {
  const env = buildUiEnvObject("dev", {
    ApiUrl: "https://abc123.execute-api.us-east-1.amazonaws.com/dev",
    CognitoIdentityPoolId: "us-east-1:pool-id",
    CognitoUserPoolId: "us-east-1_dev000",
    CognitoUserPoolClientId: "devclientid",
    CognitoUserPoolClientDomain: "dev-domain",
    CloudFrontUrl: "https://d123.cloudfront.net",
  });

  assert.equal(
    env.API_URL,
    "https://abc123.execute-api.us-east-1.amazonaws.com/dev"
  );
});

test("buildUiStartCommand spawns vite on the loopback host and default LOCAL_UI_PORT", () => {
  withEnv("LOCAL_UI_PORT", undefined, () => {
    const { prefix, cmd, cwd } = buildUiStartCommand();

    assert.equal(prefix, "ui");
    assert.equal(cwd, "services/ui-src");
    assert.deepEqual(cmd, [
      "yarn",
      "start",
      "--host",
      "127.0.0.1",
      "--strictPort",
      "--port",
      "3000",
      "--no-open",
    ]);
  });
});

test("buildUiStartCommand binds LOCAL_UI_PORT when it is set", () => {
  withEnv("LOCAL_UI_PORT", "3456", () => {
    assert.deepEqual(buildUiStartCommand().cmd, [
      "yarn",
      "start",
      "--host",
      "127.0.0.1",
      "--strictPort",
      "--port",
      "3456",
      "--no-open",
    ]);
  });
});

test("floci UI serves on the same port baked into the Cognito redirects", () => {
  withEnv("LOCAL_UI_PORT", "3456", () => {
    const { cmd } = buildUiStartCommand();
    const uiPort = cmd[cmd.indexOf("--port") + 1];
    const env = buildUiEnvObject("floci", flociOutputs);

    assert.equal(env.COGNITO_REDIRECT_SIGNIN, `http://localhost:${uiPort}/`);
    assert.equal(env.COGNITO_REDIRECT_SIGNOUT, `http://localhost:${uiPort}/`);
    assert.equal(
      env.COGNITO_USER_POOL_ENDPOINT,
      `http://localhost:${uiPort}/_floci-cognito`
    );
  });
});
