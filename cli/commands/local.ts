// This file is managed by macpro-mdct-core so if you'd like to change it let's do it there
import { runCommand } from "../lib/runner.ts";
import { execFileSync, execSync } from "node:child_process";
import { project, region } from "../lib/consts.ts";
import { runFrontendLocally } from "../lib/utils.ts";
import { seedData } from "../lib/seedData.ts";

const flociContainerName = "floci-local";
const flociReadyUrl = "http://localhost:4566/_floci/init";
const flociDefaultSecret = JSON.stringify({
  vpcName: "floci-dev",
  brokerString: "floci",
  kafkaAuthorizedSubnetIds: "subnet-default-a",
});

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

const getFlociContainer = () => {
  try {
    return JSON.parse(
      execSync(`docker inspect ${flociContainerName}`, {
        encoding: "utf8",
        stdio: "pipe",
      })
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

const waitForFloci = async () => {
  for (let i = 0; i < 60; i++) {
    try {
      const response = await fetch(flociReadyUrl);
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

const startFloci = async () => {
  if (isFlociRunning()) {
    return;
  }

  if (getFlociContainer()) {
    await runCommand(
      "Start floci",
      ["docker", "start", flociContainerName],
      "."
    );
  } else {
    await runCommand(
      "Start floci",
      [
        "docker",
        "run",
        "-d",
        "--rm",
        "--name",
        flociContainerName,
        "-u",
        "root",
        "-p",
        "4566:4566",
        "-e",
        "FLOCI_HOSTNAME=host.docker.internal",
        "-v",
        "/var/run/docker.sock:/var/run/docker.sock",
        "floci/floci:latest-compat",
      ],
      "."
    );
  }

  await waitForFloci();
};

const upsertFlociDefaultSecret = () => {
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

    await startFloci();

    process.env.AWS_DEFAULT_REGION = region;
    process.env.AWS_ACCESS_KEY_ID = "test";
    process.env.AWS_SECRET_ACCESS_KEY = "test"; // pragma: allowlist secret
    process.env.AWS_ENDPOINT_URL = "http://localhost:4566";
    process.env.AWS_ENDPOINT_URL_S3 = "http://s3.localhost.floci.io:4566";
    upsertFlociDefaultSecret();
    await runCommand(
      "CDK local bootstrap",
      [
        "yarn",
        "cdklocal",
        "bootstrap",
        `aws://000000000000/${region}`, // Floci uses the default dummy account ID 000000000000
        "--context",
        "stage=bootstrap",
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
      ],
      "."
    );

    await runCommand(
      "CDK local prerequisite deploy",
      ["yarn", "cdklocal", "deploy", "--app", "./deployment/prerequisites.ts"],
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
      ],
      "."
    );

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
