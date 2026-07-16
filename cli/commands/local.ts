// This file is managed by macpro-mdct-core so if you'd like to change it let's do it there
import { runCommand } from "../lib/runner.ts";
import { execFileSync, execSync } from "node:child_process";
import { region } from "../lib/consts.ts";
import { runFrontendLocally } from "../lib/utils.ts";
import { bootstrapLocalCognitoUsers } from "../lib/localCognito.ts";
import { seedData } from "../lib/seedData.ts";

const isColimaRunning = () => {
  try {
    const output = execSync("colima status 2>&1", {
      encoding: "utf8",
      stdio: "pipe",
    }).trim();
    return output.includes("running");
  } catch {
    return false;
  }
};

const flociContainerName =
  process.env.FLOCI_CONTAINER_NAME ??
  `${process.env.PROJECT ?? "seds"}-floci-local`;
const flociDefaultSecret = JSON.stringify({
  vpcName: "floci-dev",
  brokerString: "localstack",
  kafkaAuthorizedSubnetIds: "subnet-default-a",
});

const getFlociContainer = () => {
  try {
    return JSON.parse(
      execFileSync(
        "docker",
        ["--context", "colima", "inspect", flociContainerName],
        {
          encoding: "utf8",
          stdio: "pipe",
        }
      )
    )[0];
  } catch {
    return null;
  }
};

const isFlociRunning = () => {
  const container = getFlociContainer();
  return (
    container?.State?.Running === true &&
    container?.State?.Health?.Status === "healthy"
  );
};

const waitForFloci = async (port: string) => {
  for (let i = 0; i < 60; i++) {
    try {
      const response = await fetch(`http://localhost:${port}/_floci/init`);
      if (!response.ok) {
        throw new Error(`Unexpected status: ${response.status}`);
      }

      const body = (await response.json()) as {
        completed?: { ready?: boolean };
      };
      if (body.completed?.ready) {
        return;
      }
    } catch {
      // Keep polling until Floci is ready.
    }

    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  throw new Error("Floci did not become healthy within 60 seconds.");
};

const getContainerPublishedPort = (container: any): string | undefined =>
  container?.HostConfig?.PortBindings?.["4566/tcp"]?.[0]?.HostPort;

const getContainerEnvValue = (
  container: any,
  key: string
): string | undefined => {
  const prefix = `${key}=`;
  return (container?.Config?.Env ?? [])
    .find((entry: string) => entry.startsWith(prefix))
    ?.slice(prefix.length);
};

export const assertFlociContainerMatchesConfig = (
  container: any,
  flociPort: string,
  ecrRegistryBasePort: string,
  ecrRegistryMaxPort: string
) => {
  const mismatches: string[] = [];

  const actualPort = getContainerPublishedPort(container);
  if (actualPort !== flociPort) {
    mismatches.push(
      `published port ${actualPort ?? "unknown"} (requested ${flociPort})`
    );
  }

  const actualBasePort = getContainerEnvValue(
    container,
    "FLOCI_SERVICES_ECR_REGISTRY_BASE_PORT"
  );
  if (actualBasePort !== ecrRegistryBasePort) {
    mismatches.push(
      `ECR base port ${actualBasePort ?? "unknown"} (requested ${ecrRegistryBasePort})`
    );
  }

  const actualMaxPort = getContainerEnvValue(
    container,
    "FLOCI_SERVICES_ECR_REGISTRY_MAX_PORT"
  );
  if (actualMaxPort !== ecrRegistryMaxPort) {
    mismatches.push(
      `ECR max port ${actualMaxPort ?? "unknown"} (requested ${ecrRegistryMaxPort})`
    );
  }

  if (mismatches.length > 0) {
    throw new Error(
      `The existing "${flociContainerName}" container does not match the requested ` +
        `configuration: ${mismatches.join(", ")}. Remove it with ` +
        `"docker --context colima rm -f ${flociContainerName}" and re-run to recreate it with the ` +
        `requested configuration.`
    );
  }
};

const startFloci = async (
  flociPort: string,
  ecrRegistryBasePort: string,
  ecrRegistryMaxPort: string
) => {
  const existingContainer = getFlociContainer();
  if (existingContainer) {
    assertFlociContainerMatchesConfig(
      existingContainer,
      flociPort,
      ecrRegistryBasePort,
      ecrRegistryMaxPort
    );
  }

  if (isFlociRunning()) {
    return;
  }

  if (existingContainer) {
    await runCommand(
      "Start floci",
      ["docker", "--context", "colima", "start", flociContainerName],
      "."
    );
  } else {
    await runCommand(
      "Start floci",
      [
        "docker",
        "--context",
        "colima",
        "run",
        "-d",
        "--rm",
        "--name",
        flociContainerName,
        "-u",
        "root",
        "-p",
        `${flociPort}:4566`,
        "-e",
        "FLOCI_HOSTNAME=host.docker.internal",
        "-e",
        `FLOCI_SERVICES_ECR_REGISTRY_BASE_PORT=${ecrRegistryBasePort}`,
        "-e",
        `FLOCI_SERVICES_ECR_REGISTRY_MAX_PORT=${ecrRegistryMaxPort}`,
        "-v",
        "/var/run/docker.sock:/var/run/docker.sock",
        "floci/floci:latest-compat",
      ],
      "."
    );
  }

  await waitForFloci(flociPort);
};

const upsertFlociDefaultSecret = () => {
  const project = process.env.PROJECT;
  if (!project || !process.env.AWS_ENDPOINT_URL) {
    throw new Error("PROJECT and AWS endpoint configuration are required.");
  }

  const secretId = `${project}-default`;
  const commonArgs = [
    "--endpoint-url",
    process.env.AWS_ENDPOINT_URL,
    "secretsmanager",
  ];

  try {
    execFileSync(
      "aws",
      [...commonArgs, "describe-secret", "--secret-id", secretId],
      {
        encoding: "utf8",
        stdio: "pipe",
      }
    );

    execFileSync(
      "aws",
      [
        ...commonArgs,
        "update-secret",
        "--secret-id",
        secretId,
        "--secret-string",
        flociDefaultSecret,
      ],
      {
        encoding: "utf8",
        stdio: "pipe",
      }
    );
  } catch {
    execFileSync(
      "aws",
      [
        ...commonArgs,
        "create-secret",
        "--name",
        secretId,
        "--secret-string",
        flociDefaultSecret,
      ],
      {
        encoding: "utf8",
        stdio: "pipe",
      }
    );
  }
};

export const local = {
  command: "local",
  describe:
    "run our app via cdk deployment to floci locally and react locally together",
  handler: async () => {
    if (!isColimaRunning()) {
      throw "Colima needs to be running.";
    }

    const flociPort = process.env.FLOCI_PORT ?? "4566";
    const ecrRegistryBasePort =
      process.env.FLOCI_SERVICES_ECR_REGISTRY_BASE_PORT ?? "5200";
    const ecrRegistryMaxPort =
      process.env.FLOCI_SERVICES_ECR_REGISTRY_MAX_PORT ?? "5299";

    await startFloci(flociPort, ecrRegistryBasePort, ecrRegistryMaxPort);

    process.env.AWS_DEFAULT_REGION = region;
    process.env.AWS_ACCESS_KEY_ID = "test";
    process.env.AWS_SECRET_ACCESS_KEY = "test"; // pragma: allowlist secret
    process.env.AWS_ENDPOINT_URL = `http://localhost:${flociPort}`;
    process.env.AWS_ENDPOINT_URL_S3 = `http://s3.localhost.floci.io:${flociPort}`;
    process.env.FLOCI_PORT = flociPort;
    upsertFlociDefaultSecret();
    await runCommand("Clean .cdk", ["rm", "-rf", ".cdk"], ".");
    await runCommand(
      "CDK local bootstrap",
      [
        "yarn",
        "cdklocal",
        "bootstrap",
        `aws://000000000000/${region}`, // Floci uses the default dummy account ID 000000000000
        "--context",
        "stage=bootstrap",
        "--require-approval",
        "never",
      ],
      "."
    );

    await runCommand(
      "CDK local local-prerequisite deploy",
      [
        "yarn",
        "cdklocal",
        "deploy",
        "--app",
        "./deployment/local/prerequisites.ts",
        "--require-approval",
        "never",
      ],
      "."
    );

    await runCommand(
      "CDK local prerequisite deploy",
      [
        "yarn",
        "cdklocal",
        "deploy",
        "--app",
        "./deployment/prerequisites.ts",
        "--require-approval",
        "never",
      ],
      "."
    );

    await runCommand(
      "CDK local deploy",
      [
        "yarn",
        "cdklocal",
        "deploy",
        "--context",
        "stage=floci",
        "--all",
        "--no-rollback",
        "--require-approval",
        "never",
      ],
      "."
    );

    await bootstrapLocalCognitoUsers();
    await seedData();

    await Promise.all([
      runCommand(
        "CDK local watch",
        [
          "yarn",
          "cdklocal",
          "watch",
          "--context",
          "stage=floci",
          "--no-rollback",
        ],
        "."
      ),
      runFrontendLocally("floci"),
    ]);
  },
};
