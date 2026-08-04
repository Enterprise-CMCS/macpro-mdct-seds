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

const ministackContainerName =
  process.env.MINISTACK_CONTAINER_NAME ??
  `${process.env.PROJECT ?? "seds"}-ministack-local`;

const isMiniStackRunning = () => {
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
          ministackContainerName,
        ],
        { encoding: "utf8", stdio: "pipe" }
      ).trim() === "true"
    );
  } catch {
    return false;
  }
};

const waitForMiniStack = async (port: string) => {
  for (let i = 0; i < 60; i++) {
    try {
      const response = await fetch(`http://127.0.0.1:${port}/health`);
      if (!response.ok) {
        throw new Error(`Unexpected status: ${response.status}`);
      }

      const health = (await response.json()) as {
        ready_scripts?: { status?: string };
      };
      if (health.ready_scripts?.status === "completed") {
        return;
      }
    } catch {
      // Keep polling until MiniStack is ready.
    }

    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  throw new Error("MiniStack did not become healthy within 60 seconds.");
};

export const local = {
  command: "local",
  describe:
    "run our app via cdk deployment to ministack locally and react locally together",
  handler: async () => {
    if (!isColimaRunning()) {
      throw "Colima needs to be running.";
    }

    const ministackPort = process.env.MINISTACK_PORT ?? "4566";
    const ministackEndpoint = `http://127.0.0.1:${ministackPort}`;

    if (!isMiniStackRunning()) {
      throw "MiniStack needs to be running.";
    }

    await waitForMiniStack(ministackPort);

    process.env.AWS_DEFAULT_REGION = region;
    process.env.AWS_ACCESS_KEY_ID = "test";
    process.env.AWS_SECRET_ACCESS_KEY = "test"; // pragma: allowlist secret
    process.env.AWS_ENDPOINT_URL = ministackEndpoint;
    process.env.AWS_ENDPOINT_URL_S3 = ministackEndpoint;
    process.env.MINISTACK_PORT = ministackPort;

    await runCommand("Clean .cdk", ["rm", "-rf", ".cdk"], ".");
    await runCommand(
      "CDK local bootstrap",
      [
        "yarn",
        "cdklocal",
        "bootstrap",
        `aws://000000000000/${region}`, // MiniStack uses the default dummy account ID 000000000000
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
        "--method",
        "direct",
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
        "--method",
        "direct",
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
        "--method",
        "direct",
        "--context",
        "stage=ministack",
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
          "stage=ministack",
          "--no-rollback",
        ],
        "."
      ),
      runFrontendLocally("ministack"),
    ]);
  },
};
