// This file is managed by macpro-mdct-core so if you'd like to change it let's do it there
import {
  CloudFormationClient,
  CreateStackCommand,
  DescribeStacksCommand,
} from "@aws-sdk/client-cloudformation";
import { readFileSync } from "node:fs";
import path from "node:path";
import { runCommand } from "../lib/runner.ts";
import { execFileSync, execSync } from "node:child_process";
import { region } from "../lib/consts.ts";
import { maybeStartStackPort, runFrontendLocally } from "../lib/utils.ts";
import { seedData } from "../lib/seedData.ts";
import { recoverFailedLocalStacks } from "../lib/localStacks.ts";
import { waitForMiniStack } from "../lib/ministack.ts";

const LOCAL_ACCOUNT = "000000000000";
const CDK_TOOLKIT_STACK = "CDKToolkit";

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

const localCloudFormationClient = (endpoint: string) =>
  new CloudFormationClient({
    region,
    endpoint,
    credentials: {
      accessKeyId: "mdct",
      secretAccessKey: "mdct", // pragma: allowlist secret
    },
  });

const isCdkBootstrapped = async (endpoint: string) => {
  const cfn = localCloudFormationClient(endpoint);
  try {
    const result = await cfn.send(
      new DescribeStacksCommand({ StackName: CDK_TOOLKIT_STACK })
    );
    const status = result.Stacks?.[0]?.StackStatus;
    return status === "CREATE_COMPLETE" || status === "UPDATE_COMPLETE";
  } catch {
    return false;
  }
};

const waitForCdkToolkit = async (endpoint: string, maxWaitMs = 300_000) => {
  const deadline = Date.now() + maxWaitMs;

  while (Date.now() < deadline) {
    if (await isCdkBootstrapped(endpoint)) {
      return;
    }
    await new Promise((resolve) => setTimeout(resolve, 2_000));
  }

  throw `${CDK_TOOLKIT_STACK} did not reach CREATE_COMPLETE within ${maxWaitMs / 1000}s.`;
};

const seedCdkToolkitViaCloudFormation = async (endpoint: string) => {
  const templatePath = path.resolve("deployment/bootstrap-template.yaml");
  const templateBody = readFileSync(templatePath, "utf8");
  const cfn = localCloudFormationClient(endpoint);

  console.log(
    `Seeding ${CDK_TOOLKIT_STACK} via CloudFormation (cdklocal bootstrap is unreliable on MiniStack)...`
  );

  await cfn.send(
    new CreateStackCommand({
      StackName: CDK_TOOLKIT_STACK,
      TemplateBody: templateBody,
      Capabilities: ["CAPABILITY_NAMED_IAM"],
    })
  );

  await waitForCdkToolkit(endpoint);
};

const ensureCdkBootstrapped = async (endpoint: string) => {
  if (await isCdkBootstrapped(endpoint)) {
    console.log(`${CDK_TOOLKIT_STACK} already exists; skipping bootstrap.`);
    return;
  }

  try {
    await runCommand(
      "CDK MiniStack bootstrap",
      [
        "yarn",
        "cdklocal",
        "bootstrap",
        `aws://${LOCAL_ACCOUNT}/${region}`,
        "--context",
        "stage=bootstrap",
        "--require-approval",
        "never",
      ],
      "."
    );
  } catch {
    if (await isCdkBootstrapped(endpoint)) {
      return;
    }
    await seedCdkToolkitViaCloudFormation(endpoint);
  }
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
    process.env.CDK_DEFAULT_ACCOUNT = LOCAL_ACCOUNT;
    process.env.MINISTACK_PORT = miniStackPort;

    await recoverFailedLocalStacks({
      endpoint: miniStackEndpoint,
      port: miniStackPort,
      containerName: miniStackContainerName,
    });

    await runCommand("Clean .cdk", ["rm", "-rf", ".cdk"], ".");
    await ensureCdkBootstrapped(miniStackEndpoint);

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

    await seedData();

    maybeStartStackPort();

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
