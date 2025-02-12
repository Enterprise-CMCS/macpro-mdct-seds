import yargs from "yargs";
import * as dotenv from "dotenv";
import LabeledProcessRunner from "./runner.js";
import { execSync } from "child_process";
import readline from "node:readline";
import {
  CloudFormationClient,
  DeleteStackCommand,
  DescribeStacksCommand,
  waitUntilStackDeleteComplete,
} from "@aws-sdk/client-cloudformation";
import { writeUiEnvFile } from "./write-ui-env-file.js";

// load .env
dotenv.config();

const deployedServices = [
  "database",
  "app-api",
  "stream-functions",
  "ui-waflog-s3-bucket",
  "ui",
  "ui-auth",
  "ui-waf-log-assoc",
  "ui-src",
];

const project = process.env.PROJECT;
const region = process.env.REGION_A;

async function confirmDestroyCommand(stack: string) {
  const orange = "\x1b[38;5;208m";
  const reset = "\x1b[0m";

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  const question = async (message: string) => {
    return new Promise((resolve) => {
      rl.question(message, (answer) => {
        resolve(answer);
        rl.close();
      });
    });
  };

  const confirmation = await question(`
${orange}********************************* STOP *******************************
You've requested a destroy for:

    ${stack}

Continuing will irreversibly delete all data and infrastructure
associated with ${stack} and its nested stacks.

Do you really want to destroy it?
Re-enter the stack name (${stack}) to continue:
**********************************************************************${reset}
`);

  if (confirmation !== stack) {
    throw new Error(`
${orange}**********************************************************************
The destroy operation has been aborted.
**********************************************************************${reset}
`);
  }
}

// Function to update .env files using 1Password CLI
function updateEnvFiles() {
  try {
    execSync("op inject --in-file .env.tpl --out-file .env --force", {
      stdio: "inherit",
    });
    execSync("sed -i '' -e 's/# pragma: allowlist secret//g' .env");
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Failed to update .env files using 1Password CLI.");
    process.exit(1);
  }
}

// run_fe_locally runs the frontend and its dependencies locally
// @ts-ignore
async function run_fe_locally(runner: LabeledProcessRunner) {
  await writeUiEnvFile("jon-cdk", true);

  runner.run_command_and_output("ui", ["npm", "start"], "services/ui-src");
}

async function run_cdk_watch(
  runner: LabeledProcessRunner,
  options: { stage: string }
) {
  const stage = options.stage;
  const watchCmd = [
    "cdk",
    "watch",
    "--context",
    `stage=${stage}`,
    "--no-rollback",
  ];
  await runner.run_command_and_output("CDK watch", watchCmd, ".");
}

function isDockerRunning() {
  try {
    execSync("docker info", { stdio: "ignore" });
    return true;
  } catch {
    return false;
  }
}

function isLocalStackRunning() {
  try {
    const output = execSync("localstack status", {
      encoding: "utf-8",
      stdio: "pipe",
    }).trim();
    return output.includes("running");
  } catch {
    return false;
  }
}

async function run_watch(options: { stage: string }) {
  const runner = new LabeledProcessRunner();
  await prepare_services(runner);

  run_cdk_watch(runner, options);
  run_fe_locally(runner);
}

async function run_local() {
  const runner = new LabeledProcessRunner();
  await prepare_services(runner);

  if (!isDockerRunning()) {
    throw "Docker needs to be running.";
  }

  if (!isLocalStackRunning()) {
    throw "LocalStack needs to be running.";
  }
  process.env.AWS_DEFAULT_REGION = "us-east-1";
  process.env.AWS_ACCESS_KEY_ID = "localstack";
  process.env.AWS_SECRET_ACCESS_KEY = "localstack";
  process.env.AWS_ENDPOINT_URL = "http://localhost:4566";

  const cdklocalBootstrapCmd = [
    "cdklocal",
    "bootstrap",
    "aws://000000000000/us-east-1",
    "--context",
    "stage=jon-cdk",
  ];
  await runner.run_command_and_output(
    "CDK local bootstrap",
    cdklocalBootstrapCmd,
    "."
  );

  // TODO:

  const deployLocalPrequisitesCmd = [
    "cdklocal",
    "deploy",
    "--app",
    '"npx tsx deployment/local/prerequisites.ts"',
  ];
  await runner.run_command_and_output(
    "CDK local prerequisite deploy",
    deployLocalPrequisitesCmd,
    "."
  );

  // ./run localdeploy-prerequisites

  // (It seems like the command above may need to be run twice as it fails the first time)

  // ./run localdeploy --stage jon-cdk

  // Update src/write-ui-env-file.ts with the API gateway URL output from the above deployment without the / at the AWS_ENDPOINT_URL

  // code src/write-ui-env-file.ts

  // Run:

  // ./run local

  // and it login does not work!

  // Useful URL to monitor local localstack instance: https://app.localstack.cloud/inst/default/status

  // TODO: put the below back after figuring out localstack
  // run_fe_locally(runner);
}

async function install_deps(runner: LabeledProcessRunner, service: string) {
  await runner.run_command_and_output(
    "Installing dependencies",
    ["yarn", "install", "--frozen-lockfile"],
    `services/${service}`
  );
}

async function prepare_services(runner: LabeledProcessRunner) {
  for (const service of deployedServices) {
    await install_deps(runner, service);
  }
}

async function deploy_prerequisites() {
  const runner = new LabeledProcessRunner();
  await prepare_services(runner);
  const deployPrequisitesCmd = [
    "cdk",
    "deploy",
    "--app",
    '"npx tsx deployment/prerequisites.ts"',
  ];
  await runner.run_command_and_output(
    "CDK prerequisite deploy",
    deployPrequisitesCmd,
    "."
  );
}

const stackExists = async (stackName: string): Promise<boolean> => {
  const client = new CloudFormationClient({ region });
  try {
    await client.send(new DescribeStacksCommand({ StackName: stackName }));
    return true;
  } catch (error: any) {
    return false;
  }
};

async function deploy(options: { stage: string }) {
  const stage = options.stage;
  const runner = new LabeledProcessRunner();
  await prepare_services(runner);
  if (await stackExists("seds-prerequisites")) {
    const deployCmd = [
      "cdk",
      "deploy",
      "--context",
      `stage=${stage}`,
      "--method=direct",
      "--all",
    ];
    await runner.run_command_and_output("CDK deploy", deployCmd, ".");
  } else {
    console.error(
      "MISSING PREREQUISITE STACK! Must deploy it before attempting to deploy the application."
    );
  }
}

const waitForStackDeleteComplete = async (
  client: CloudFormationClient,
  stackName: string
) => {
  return waitUntilStackDeleteComplete(
    { client, maxWaitTime: 3600 },
    { StackName: stackName }
  );
};

async function destroy({
  stage,
  wait,
  verify,
}: {
  stage: string;
  wait: boolean;
  verify: boolean;
}) {
  const stackName = `${project}-${stage}`;

  if (/prod/i.test(stage)) {
    console.log("Error: Destruction of production stages is not allowed.");
    process.exit(1);
  }

  if (verify) await confirmDestroyCommand(stackName);

  const client = new CloudFormationClient({ region });
  await client.send(new DeleteStackCommand({ StackName: stackName }));
  console.log(`Stack ${stackName} delete initiated.`);

  if (wait) {
    console.log(`Waiting for stack ${stackName} to be deleted...`);
    const result = await waitForStackDeleteComplete(client, stackName);
    console.log(
      result.state === "SUCCESS"
        ? `Stack ${stackName} deleted successfully.`
        : `Error: Stack ${stackName} deletion failed.`
    );
  } else {
    console.log(
      `Stack ${stackName} delete initiated. Not waiting for completion as --wait is set to false.`
    );
  }
}

// The command definitons in yargs
// All valid arguments to dev should be enumerated here, this is the entrypoint to the script
yargs(process.argv.slice(2))
  .command(
    "watch",
    "run cdk watch and react together",
    { stage: { type: "string", demandOption: true } },
    run_watch
  )
  .command(
    "local",
    "run our app via cdk deployment to localstack locally and react locally together",
    {},
    run_local
  )
  .command(
    "deploy-prerequisites",
    "deploy the app's AWS account prerequisites with cdk to the cloud",
    () => {},
    deploy_prerequisites
  )
  .command(
    "deploy",
    "deploy the app with cdk to the cloud",
    {
      stage: { type: "string", demandOption: true },
    },
    deploy
  )
  .command(
    "destroy",
    "destroy a cdk stage in AWS",
    {
      stage: { type: "string", demandOption: true },
      service: { type: "string", demandOption: false },
      wait: { type: "boolean", demandOption: false, default: true },
      verify: { type: "boolean", demandOption: false, default: true },
    },
    destroy
  )
  .command(
    "update-env",
    "update environment variables using 1Password",
    () => {},
    () => {
      updateEnvFiles();
    }
  )
  .scriptName("run")
  .strict()
  .demandCommand(1, "").argv; // this prints out the help if you don't call a subcommand
