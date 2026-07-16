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

const miniStackContainerName =
  process.env.MINISTACK_CONTAINER_NAME ??
  `${process.env.PROJECT ?? "seds"}-ministack-local`;

const isMiniStackRunning = () => {
  try {
    return (
      JSON.parse(
        execFileSync(
          "docker",
          ["--context", "colima", "inspect", miniStackContainerName],
          {
            encoding: "utf8",
            stdio: "pipe",
          }
        )
      )[0]?.State?.Running === true
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
        throw new Error(`MiniStack health returned ${response.status}`);
      }

      const health = (await response.json()) as {
        ready_scripts?: { status?: string };
      };
      if (health.ready_scripts?.status === "completed") {
        return;
      }
    } catch {
      // MiniStack can reject health requests while it is still starting.
    }

    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  throw "MiniStack needs to be running.";
};

export const local = {
  command: "local",
  describe:
    "run our app via cdk deployment to ministack locally and react locally together",
  handler: async () => {
    if (!isColimaRunning()) {
      throw "Colima needs to be running.";
    }

    const miniStackPort = process.env.MINISTACK_PORT ?? "4566";
    const miniStackEndpoint = `http://127.0.0.1:${miniStackPort}`;

    if (!isMiniStackRunning()) {
      throw "MiniStack needs to be running.";
    }

    await waitForMiniStack(miniStackPort);

    process.env.AWS_DEFAULT_REGION = region;
    process.env.AWS_ACCESS_KEY_ID = "test";
    process.env.AWS_SECRET_ACCESS_KEY = "test"; // pragma: allowlist secret
    process.env.AWS_ENDPOINT_URL = miniStackEndpoint;
    process.env.AWS_ENDPOINT_URL_S3 = miniStackEndpoint;
    process.env.MINISTACK_PORT = miniStackPort;

    await runCommand("Clean .cdk", ["rm", "-rf", ".cdk"], ".");
    await runCommand(
      "CDK MiniStack bootstrap",
      [
        "yarn",
        "cdklocal",
        "bootstrap",
        `aws://000000000000/${region}`,
        "--context",
        "stage=bootstrap",
        "--require-approval",
        "never",
      ],
      "."
    );

    await runCommand(
      "CDK MiniStack local-prerequisite deploy",
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
      "CDK MiniStack prerequisite deploy",
      [
        "yarn",
        "cdklocal",
        "deploy",
        "--app",
        "./deployment/prerequisites.ts",
        "--method",
        "direct",
        "--context",
        "stage=ministack",
        "--require-approval",
        "never",
      ],
      "."
    );

    await runCommand(
      "CDK MiniStack deploy",
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
        "CDK MiniStack watch",
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
