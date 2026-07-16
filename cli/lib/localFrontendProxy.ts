import {
  AdminGetUserCommand,
  CognitoIdentityProviderClient,
} from "@aws-sdk/client-cognito-identity-provider";
import { spawn } from "node:child_process";
import {
  createServer,
  type IncomingMessage,
  type ServerResponse,
} from "node:http";
import { connect } from "node:net";
import type { Duplex } from "node:stream";
import path from "node:path";
import { region } from "./consts.ts";

const uiPort = parsePort(process.env.LOCAL_UI_PORT ?? "3000", "LOCAL_UI_PORT");
const vitePort = parsePort(
  process.env.LOCAL_VITE_PORT ?? String(uiPort + 1),
  "LOCAL_VITE_PORT"
);
const localEmuOrigin = new URL(requiredEnv("AWS_ENDPOINT_URL"));
const cognitoProxyPath =
  process.env.LOCAL_COGNITO_PROXY_PATH ?? "/_local-cognito";
const apiProxyPath = process.env.LOCAL_API_PROXY_PATH ?? "/_local-api";
const cognitoHost = `cognito-idp.${region}.amazonaws.com`;
const viteOrigin = new URL(`http://127.0.0.1:${vitePort}`);
const cognitoClient = new CognitoIdentityProviderClient({
  region,
  endpoint: localEmuOrigin.href,
});
let shuttingDown = false;

if (vitePort === uiPort) {
  throw new Error("LOCAL_VITE_PORT must be different from LOCAL_UI_PORT");
}

const vite = spawn(
  "yarn",
  [
    "start",
    "--host",
    "127.0.0.1",
    "--strictPort",
    "--port",
    String(vitePort),
    "--no-open",
  ],
  { cwd: path.resolve("services/ui-src") }
);

pipe(vite.stdout, "vite");
pipe(vite.stderr, "vite");

const server = createServer((req, res) => {
  handleRequest(req, res).catch((error: unknown) => {
    res.statusCode = 502;
    res.end(error instanceof Error ? error.message : String(error));
  });
});

vite.on("close", (code) => {
  if (!shuttingDown) {
    server.close();
    process.exitCode = code || 1;
  }
});

server.on("upgrade", (req, socket, head) => {
  const target = connect(vitePort, "127.0.0.1", () => {
    const lines = [`${req.method} ${req.url} HTTP/${req.httpVersion}`];
    for (let i = 0; i < req.rawHeaders.length; i += 2) {
      lines.push(`${req.rawHeaders[i]}: ${req.rawHeaders[i + 1]}`);
    }
    target.write(`${lines.join("\r\n")}\r\n\r\n`);
    target.write(head);
    socket.pipe(target);
    target.pipe(socket);
  });
  closeTogether(socket, target);
});

function closeTogether(a: Duplex, b: Duplex) {
  a.on("error", () => b.destroy());
  b.on("error", () => a.destroy());
  a.on("close", () => b.destroy());
  b.on("close", () => a.destroy());
}

server.on("error", (error) => {
  shuttingDown = true;
  vite.kill("SIGTERM");
  throw error;
});

server.listen(uiPort, "127.0.0.1", () => {
  process.stdout.write(
    `local frontend proxy listening on http://127.0.0.1:${uiPort}\n`
  );
});

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

async function handleRequest(req: IncomingMessage, res: ServerResponse) {
  const requestUrl = new URL(req.url ?? "/", `http://127.0.0.1:${uiPort}`);

  if (isProxyPath(requestUrl.pathname, cognitoProxyPath)) {
    await proxy(
      req,
      res,
      localEmuOrigin,
      stripPrefix(requestUrl, cognitoProxyPath),
      {
        dropBrowserOriginHeaders: true,
        transform: addLocalCognitoClaims,
      }
    );
    return;
  }

  if (isProxyPath(requestUrl.pathname, apiProxyPath)) {
    await proxy(
      req,
      res,
      localEmuOrigin,
      stripPrefix(requestUrl, apiProxyPath),
      {
        dropBrowserOriginHeaders: true,
      }
    );
    return;
  }

  await proxy(req, res, viteOrigin, requestUrl, {
    transform: injectLocalEmuFetchProxy,
  });
}

async function proxy(
  req: IncomingMessage,
  res: ServerResponse,
  origin: URL,
  requestUrl: URL,
  options: {
    dropBrowserOriginHeaders?: boolean;
    transform?: (
      response: Response,
      requestBody: Buffer | undefined
    ) => Promise<Response>;
  } = {}
) {
  const target = new URL(origin);
  target.pathname = requestUrl.pathname;
  target.search = requestUrl.search;
  const body = hasBody(req) ? await readBody(req) : undefined;
  const headers = requestHeaders(
    req,
    options.dropBrowserOriginHeaders ?? false
  );
  const response = await fetch(target, {
    method: req.method,
    headers,
    body,
    redirect: "manual",
  });
  const outgoing = options.transform
    ? await options.transform(response, body)
    : response;

  res.writeHead(outgoing.status, Object.fromEntries(outgoing.headers));
  if (req.method === "HEAD") {
    res.end();
    return;
  }

  const responseBody = Buffer.from(await outgoing.arrayBuffer());
  res.end(responseBody);
}

async function addLocalCognitoClaims(
  response: Response,
  requestBody: Buffer | undefined
) {
  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("application/x-amz-json-1.1")) {
    return response;
  }

  const responseBody = await response.json();
  const idToken = responseBody.AuthenticationResult?.IdToken;
  if (typeof idToken !== "string") {
    return jsonResponse(response, responseBody);
  }

  const payload = decodeJwtPayload(idToken);
  const username = payload.email ?? usernameFromRequest(requestBody);
  if (!username) {
    throw new Error("Local Cognito auth response did not include a username");
  }

  const userPoolId = userPoolIdFromIssuer(payload.iss);
  const user = await cognitoClient.send(
    new AdminGetUserCommand({ UserPoolId: userPoolId, Username: username })
  );
  const attributes = Object.fromEntries(
    (user.UserAttributes ?? [])
      .filter((attribute) => attribute.Name && attribute.Value)
      .map((attribute) => [attribute.Name!, attribute.Value!])
  );

  responseBody.AuthenticationResult.IdToken = encodeJwtPayload(idToken, {
    ...payload,
    email: attributes.email ?? payload.email,
    given_name: attributes.given_name,
    family_name: attributes.family_name,
    "custom:ismemberof": attributes["custom:ismemberof"],
  });

  return jsonResponse(response, responseBody);
}

function jsonResponse(response: Response, body: unknown) {
  const headers = new Headers(response.headers);
  headers.delete("content-length");
  return Response.json(body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

function decodeJwtPayload(token: string) {
  const payload = token.split(".")[1];
  if (!payload) {
    throw new Error("Local Cognito ID token is not a JWT");
  }
  return JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as {
    email?: string;
    iss?: string;
    [claim: string]: unknown;
  };
}

function encodeJwtPayload(token: string, payload: Record<string, unknown>) {
  const parts = token.split(".");
  if (parts.length !== 3) {
    throw new Error("Local Cognito ID token is not a JWT");
  }
  parts[1] = Buffer.from(JSON.stringify(payload)).toString("base64url");
  return parts.join(".");
}

function usernameFromRequest(requestBody: Buffer | undefined) {
  if (!requestBody) {
    return undefined;
  }

  const body = JSON.parse(requestBody.toString("utf8")) as {
    AuthParameters?: { USERNAME?: string };
  };
  return body.AuthParameters?.USERNAME;
}

function userPoolIdFromIssuer(issuer: unknown) {
  if (typeof issuer !== "string") {
    throw new TypeError("Local Cognito ID token issuer is missing");
  }

  const userPoolId = issuer.split("/").at(-1);
  if (!userPoolId) {
    throw new Error("Local Cognito ID token issuer does not include a pool ID");
  }
  return userPoolId;
}

async function injectLocalEmuFetchProxy(response: Response) {
  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("text/html")) {
    return response;
  }

  const headers = new Headers(response.headers);
  headers.delete("content-length");
  const html = await response.text();
  return new Response(
    html.replace(
      "</head>",
      `<script>${localEmuFetchProxyScript}</script></head>`
    ),
    { status: response.status, statusText: response.statusText, headers }
  );
}

function requestHeaders(
  req: IncomingMessage,
  dropBrowserOriginHeaders: boolean
) {
  const headers = new Headers();
  for (const [name, value] of Object.entries(req.headers)) {
    const lowerName = name.toLowerCase();
    if (
      lowerName === "connection" ||
      lowerName === "content-length" ||
      lowerName === "host" ||
      lowerName === "keep-alive" ||
      lowerName === "proxy-authenticate" ||
      lowerName === "proxy-authorization" ||
      lowerName === "te" ||
      lowerName === "trailer" ||
      lowerName === "transfer-encoding" ||
      lowerName === "upgrade"
    ) {
      continue;
    }

    if (
      dropBrowserOriginHeaders &&
      (lowerName === "origin" || lowerName === "referer")
    ) {
      continue;
    }

    if (Array.isArray(value)) {
      for (const item of value) {
        headers.append(name, item);
      }
    } else if (value !== undefined) {
      headers.set(name, value);
    }
  }
  return headers;
}

async function readBody(req: IncomingMessage) {
  const chunks: Buffer[] = [];
  for await (const chunk of req) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }
  return Buffer.concat(chunks);
}

function hasBody(req: IncomingMessage) {
  return req.method !== "GET" && req.method !== "HEAD";
}

function isProxyPath(pathname: string, prefix: string) {
  return pathname === prefix || pathname.startsWith(`${prefix}/`);
}

function stripPrefix(requestUrl: URL, prefix: string) {
  const nextUrl = new URL(requestUrl);
  const nextPath = nextUrl.pathname.slice(prefix.length);
  nextUrl.pathname = nextPath === "" ? "/" : nextPath;
  return nextUrl;
}

function parsePort(value: string, name: string) {
  const port = Number(value);
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error(`${name} must be a TCP port number`);
  }
  return port;
}

function requiredEnv(name: string) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`${name} is required but not set`);
  }
  return value;
}

function pipe(stream: NodeJS.ReadableStream, prefix: string) {
  stream.on("data", (data: Buffer) => {
    for (const line of data.toString().split("\n")) {
      if (line) {
        process.stdout.write(`${prefix}| ${line}\n`);
      }
    }
  });
}

function shutdown() {
  shuttingDown = true;
  process.exitCode = 0;
  server.close();
  vite.kill("SIGTERM");
}

const localEmuFetchProxyScript = `(() => {
  const originalFetch = window.fetch.bind(window);
  window.fetch = async (input, init) => {
    const requestUrl =
      typeof input === "string" || input instanceof URL
        ? String(input)
        : input.url;
    const url = new URL(requestUrl, window.location.href);

    if (url.hostname !== "${cognitoHost}") {
      return originalFetch(input, init);
    }

    if (input instanceof Request) {
      const request = new Request(input, init);
      const body =
        request.method === "GET" || request.method === "HEAD"
          ? undefined
          : await request.clone().arrayBuffer();

      return originalFetch("${cognitoProxyPath}", {
        method: request.method,
        headers: request.headers,
        body,
        credentials: "same-origin",
      });
    }

    return originalFetch("${cognitoProxyPath}", init);
  };
})();`;
