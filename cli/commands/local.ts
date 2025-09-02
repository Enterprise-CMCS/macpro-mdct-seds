// import { runCommand } from "../lib/runner.js";
import { runCommand } from "../lib/oldRunner.js";
import { execSync } from "child_process";
import { InvokeCommand, LambdaClient } from "@aws-sdk/client-lambda";
import { region } from "../lib/consts.js";
import {
  getCloudFormationStackOutputValues,
  runFrontendLocally,
} from "../lib/utils.js";

function isColimaRunning() {
  try {
    const output = execSync("colima status 2>&1", {
      encoding: "utf-8",
      stdio: "pipe",
    }).trim();
    return output.includes("running");
  } catch {
    return false;
  }
}

function isLocalStackRunning() {
  try {
    return execSync("localstack status", {
      encoding: "utf-8",
      stdio: "pipe",
    }).includes("running");
  } catch {
    return false;
  }
}

export const local = {
  command: "local",
  describe:
    "run our app via cdk deployment to localstack locally and react locally together",
  handler: async () => {
    // const runner = new LabeledProcessRunner();

    if (!isColimaRunning()) {
      throw "Colima needs to be running.";
    }

    if (!isLocalStackRunning()) {
      throw "LocalStack needs to be running.";
    }

    process.env.AWS_DEFAULT_REGION = "us-east-1";
    process.env.AWS_ACCESS_KEY_ID = "localstack";
    process.env.AWS_SECRET_ACCESS_KEY = "localstack"; // pragma: allowlist secret
    process.env.AWS_ENDPOINT_URL = "https://localhost.localstack.cloud:4566";

    await runCommand(
      "yarn",
      [
        "cdklocal",
        "bootstrap",
        "aws://000000000000/us-east-1",
        "--context",
        "stage=bootstrap",
      ],
      "."
    );

    await runCommand(
      "yarn",
      [
        "cdklocal",
        "deploy",
        "--context",
        "stage=prerequisites",
        "--app",
        '"npx tsx deployment/local/prerequisites.ts"',
      ],
      "."
    );

    await runCommand(
      "yarn",
      [
        "cdklocal",
        "deploy",
        "--context",
        "stage=prerequisites",
        "--app",
        '"npx tsx deployment/prerequisites.ts"',
      ],
      "."
    );

    await runCommand(
      "yarn",
      [
        "cdklocal",
        "deploy",
        "--context",
        "stage=localstack",
        "--all",
        "--no-rollback",
      ],
      "."
    );

    const SeedDataFunctionName = await getCloudFormationStackOutputValues(
      "seds-localstack",
      ["SeedDataFunctionName"]
    )["SeedDataFunctionName"];

    const lambdaClient = new LambdaClient({ region });
    const lambdaCommand = new InvokeCommand({
      FunctionName: SeedDataFunctionName,
      InvocationType: "Event",
      Payload: Buffer.from(JSON.stringify({})),
    });
    await lambdaClient.send(lambdaCommand);

    runCommand(
      "yarn",
      ["cdklocal", "watch", "--context", "stage=localstack", "--no-rollback"],
      "."
    );

    runFrontendLocally("localstack");
  },
};
