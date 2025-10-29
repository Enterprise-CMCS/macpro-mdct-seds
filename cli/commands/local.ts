// This file is managed by macpro-mdct-core so if you'd like to change it let's do it there
import { runCommand } from "../lib/runner.js";
import { execSync } from "child_process";
import { region } from "../lib/consts.js";
import { runFrontendLocally } from "../lib/utils.js";
import downloadClamAvLayer from "../lib/clam.js";
import { seedData } from "../lib/seedData.js";

const isColimaRunning = () => {
  try {
    const output = execSync("colima status 2>&1", {
      encoding: "utf-8",
      stdio: "pipe",
    }).trim();
    return output.includes("running");
  } catch {
    return false;
  }
};

const isLocalStackRunning = () => {
  try {
    return execSync("localstack status", {
      encoding: "utf-8",
      stdio: "pipe",
    }).includes("running");
  } catch {
    return false;
  }
};

export const local = {
  command: "local",
  describe:
    "run our app via cdk deployment to localstack locally and react locally together",
  handler: async () => {
    if (!isColimaRunning()) {
      throw "Colima needs to be running.";
    }

    if (!isLocalStackRunning()) {
      throw "LocalStack needs to be running.";
    }

    process.env.AWS_DEFAULT_REGION = region;
    process.env.AWS_ACCESS_KEY_ID = "localstack";
    process.env.AWS_SECRET_ACCESS_KEY = "localstack"; // pragma: allowlist secret
    process.env.AWS_ENDPOINT_URL = "http://localhost.localstack.cloud:4566";
    process.env.AWS_ENDPOINT_URL_S3 = "http://s3.localhost.localstack.cloud:4566";

    const cdklocalBin = "deployment/node_modules/.bin/cdklocal";

    await runCommand(
      "CDK local bootstrap",
      [
        cdklocalBin,
        "bootstrap",
        `aws://000000000000/${region}`, // LocalStack uses the default dummy account ID 000000000000
        "--context",
        "stage=bootstrap",
      ],
      "."
    );

    await runCommand(
      "CDK local local-prerequisite deploy",
      [
        cdklocalBin,
        "deploy",
        "--app",
        "bun tsx deployment/local/prerequisites.ts",
      ],
      "."
    );

    await runCommand(
      "CDK local prerequisite deploy",
      [
        cdklocalBin,
        "deploy",
        "--app",
        "bun tsx deployment/prerequisites.ts",
      ],
      "."
    );

    await downloadClamAvLayer();

    await runCommand(
      "CDK local deploy",
      [
        cdklocalBin,
        "deploy",
        "--context",
        "stage=localstack",
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
          cdklocalBin,
          "watch",
          "--context",
          "stage=localstack",
          "--no-rollback",
        ],
        "."
      ),
      runFrontendLocally("localstack"),
    ]);
  },
};
