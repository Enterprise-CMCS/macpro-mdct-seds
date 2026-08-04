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

const isFlociRunning = () => {
  try {
    return (
      execFileSync(
        "docker",
        [
          "--context",
          "colima",
          "inspect",
          "-f",
          "{{.State.Running}}",
          flociContainerName,
        ],
        { encoding: "utf8", stdio: "pipe" }
      ).trim() === "true"
    );
  } catch {
    return false;
  }
};

const sleep = (milliseconds: number) =>
  new Promise((resolve) => setTimeout(resolve, milliseconds));

const startFloci = async (flociPort: string) => {
  await runCommand(
    "Start Floci",
    [
      "docker",
      "--context",
      "colima",
      "run",
      "--rm",
      "-d",
      "--name",
      flociContainerName,
      "-u",
      "root",
      "-p",
      `${flociPort}:4566`,
      "-e",
      "FLOCI_HOSTNAME=host.docker.internal",
      "-e",
      `FLOCI_SERVICES_ECR_REGISTRY_BASE_PORT=${
        process.env.FLOCI_SERVICES_ECR_REGISTRY_BASE_PORT ?? "5200"
      }`,
      "-e",
      `FLOCI_SERVICES_ECR_REGISTRY_MAX_PORT=${
        process.env.FLOCI_SERVICES_ECR_REGISTRY_MAX_PORT ?? "5299"
      }`,
      "-v",
      "/var/run/docker.sock:/var/run/docker.sock",
      "floci/floci:latest-compat",
    ],
    "."
  );
};

const getFlociStackStatus = () => {
  try {
    return execFileSync(
      "aws",
      [
        "cloudformation",
        "describe-stacks",
        "--stack-name",
        `${process.env.PROJECT}-floci`,
        "--query",
        "Stacks[0].StackStatus",
        "--output",
        "text",
      ],
      {
        encoding: "utf8",
        stdio: ["ignore", "pipe", "pipe"],
      }
    ).trim();
  } catch (error) {
    if (error && typeof error === "object" && "stderr" in error) {
      const stderr = (error as { stderr?: Buffer | string }).stderr?.toString();
      if (stderr?.includes("does not exist")) {
        return null;
      }
    }

    throw error;
  }
};

const hasFlociStackOutputs = () => {
  try {
    const outputs = JSON.parse(
      execFileSync(
        "aws",
        [
          "cloudformation",
          "describe-stacks",
          "--stack-name",
          `${process.env.PROJECT}-floci`,
          "--query",
          "Stacks[0].Outputs[].OutputKey",
          "--output",
          "json",
        ],
        {
          encoding: "utf8",
          stdio: ["ignore", "pipe", "pipe"],
        }
      )
    ) as string[] | null;

    return outputs?.includes("CognitoUserPoolId") === true;
  } catch (error) {
    if (error && typeof error === "object" && "stderr" in error) {
      const stderr = (error as { stderr?: Buffer | string }).stderr?.toString();
      if (stderr?.includes("does not exist")) {
        return true;
      }
    }

    throw error;
  }
};

const hasCdkToolkitStackOutputs = () => {
  try {
    const outputs = JSON.parse(
      execFileSync(
        "aws",
        [
          "cloudformation",
          "describe-stacks",
          "--stack-name",
          "CDKToolkit",
          "--query",
          "Stacks[0].Outputs[].OutputKey",
          "--output",
          "json",
        ],
        {
          encoding: "utf8",
          stdio: ["ignore", "pipe", "pipe"],
        }
      )
    ) as string[] | null;

    return (
      outputs?.includes("BucketName") === true &&
      outputs.includes("ImageRepositoryName")
    );
  } catch (error) {
    if (error && typeof error === "object" && "stderr" in error) {
      const stderr = (error as { stderr?: Buffer | string }).stderr?.toString();
      if (stderr?.includes("does not exist")) {
        return false;
      }
    }

    throw error;
  }
};

const hasLocalDefaultSecret = () => {
  try {
    execFileSync(
      "aws",
      [
        "secretsmanager",
        "describe-secret",
        "--secret-id",
        `${process.env.PROJECT}-default`,
      ],
      {
        stdio: ["ignore", "ignore", "pipe"],
      }
    );
    return true;
  } catch (error) {
    if (error && typeof error === "object" && "stderr" in error) {
      const stderr = (error as { stderr?: Buffer | string }).stderr?.toString();
      if (stderr?.includes("can't find") || stderr?.includes("not found")) {
        return false;
      }
    }

    throw error;
  }
};

const resetFailedFlociStack = async (flociPort: string) => {
  const status = getFlociStackStatus();
  if (
    ![
      "CREATE_FAILED",
      "ROLLBACK_COMPLETE",
      "UPDATE_ROLLBACK_COMPLETE",
    ].includes(status ?? "") &&
    hasFlociStackOutputs()
  ) {
    return;
  }

  await runCommand(
    "Remove failed Floci local container",
    ["docker", "--context", "colima", "rm", "-f", "-v", flociContainerName],
    "."
  );
  await startFloci(flociPort);
  await waitForFloci();
};

const waitForFloci = async () => {
  let stableChecks = 0;

  for (let i = 0; i < 60; i++) {
    try {
      execFileSync(
        "aws",
        ["cloudformation", "list-stacks", "--max-items", "1"],
        {
          stdio: ["ignore", "ignore", "pipe"],
        }
      );
      execFileSync("aws", ["s3api", "list-buckets"], {
        stdio: ["ignore", "ignore", "pipe"],
      });
      execFileSync("aws", ["iam", "list-roles", "--max-items", "1"], {
        stdio: ["ignore", "ignore", "pipe"],
      });
      stableChecks++;
      if (stableChecks >= 10) {
        return;
      }
    } catch {
      stableChecks = 0;
    }

    await sleep(1000);
  }

  throw new Error("Floci did not become healthy within 60 seconds.");
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

    if (!isFlociRunning()) {
      throw "Floci needs to be running.";
    }

    process.env.AWS_DEFAULT_REGION = region;
    process.env.AWS_ACCESS_KEY_ID = "test";
    process.env.AWS_SECRET_ACCESS_KEY = "test"; // pragma: allowlist secret
    process.env.AWS_PAGER = "";
    process.env.AWS_RETRY_MODE = "standard";
    process.env.AWS_MAX_ATTEMPTS = "10";
    process.env.AWS_ENDPOINT_URL = `http://localhost:${flociPort}`;
    process.env.AWS_ENDPOINT_URL_S3 = `http://s3.localhost.floci.io:${flociPort}`;
    process.env.FLOCI_PORT = flociPort;

    await waitForFloci();
    await resetFailedFlociStack(flociPort);
    await runCommand("Clean .cdk", ["rm", "-rf", ".cdk"], ".");
    if (!hasCdkToolkitStackOutputs()) {
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
    }

    if (!hasLocalDefaultSecret()) {
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
    }

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
      "CDK local synth",
      [
        "yarn",
        "cdklocal",
        "synth",
        "--context",
        "stage=floci",
        "--all",
        "--quiet",
      ],
      "."
    );

    await runCommand(
      "Sync Floci local CDK assets",
      [
        "node",
        "./deployment/local/sync-floci-cdk-assets.ts",
        ".cdk/cdk.out/seds-floci.assets.json",
      ],
      "."
    );

    await runCommand(
      "CDK local deploy",
      [
        "yarn",
        "cdklocal",
        "deploy",
        "--app",
        ".cdk/cdk.out",
        `${process.env.PROJECT}-floci`,
        "--no-rollback",
        "--no-asset-parallelism",
        "--method",
        "direct",
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
