import yargs from "yargs";
import * as dotenv from "dotenv";
import LabeledProcessRunner from "./runner.js";
import { execSync } from "child_process";
import readline from "node:readline";
import {
  CloudFormationClient,
  DeleteStackCommand,
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
    execSync(
      "sed --in-place='' --expression='s/# pragma: allowlist secret//g' .env"
    );
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Failed to update .env files using 1Password CLI.");
    process.exit(1);
  }
}

// run_db_locally runs the local db
// @ts-ignore
async function run_db_locally(runner: LabeledProcessRunner) {
  await runner.run_command_and_output(
    "db yarn",
    ["yarn", "install"],
    "services/database"
  );
  await runner.run_command_and_output(
    "db svls",
    ["serverless", "dynamodb", "install", "--stage=local"],
    "services/database"
  );
  runner.run_command_and_output(
    "db",
    [
      "java",
      "-Djava.library.path=./DynamoDBLocal_lib",
      "-jar",
      "DynamoDBLocal.jar",
      "-sharedDb",
      "-inMemory",
      "-port",
      "8000",
    ],
    "services/database/.dynamodb"
  );
  await new Promise((res) => setTimeout(res, 10 * 1000)); // The above runners need to all finish, not all can be awaited, they block

  const synthOutput = await runner.run_command_and_output(
    "db synth",
    ["cdk", "synth", "--no-staging", "--context", "stage=local"],
    "."
  );

  const snythedDatabaseTemplate = (yaml.load(synthOutput) as any)["Resources"][
    "databaseNestedStackdatabaseNestedStackResourceF5AAE956"
  ]["Metadata"]["aws:asset:path"];

  runner.run_command_and_output(
    "db seed",
    [
      "sam",
      "local",
      "invoke",
      "seedData88C4E515",
      "--template",
      `./.cdk/cdk.out/${snythedDatabaseTemplate}`,
    ],
    "."
  );
}

// run_api_locally uses AWS SAM Local to run the API lambdas locally
// @ts-ignore
async function run_api_locally(runner: LabeledProcessRunner) {
  await runner.run_command_and_output(
    "api deps",
    ["yarn", "install"],
    "services/app-api"
  );

  const synthOutput = await runner.run_command_and_output(
    "api synth",
    ["cdk", "synth", "--no-staging", "--context", "stage=master"],
    "."
  );

  const snythedApiTemplate = (yaml.load(synthOutput) as any)["Resources"][
    "apiNestedStackapiNestedStackResourceDFDE5E1E"
  ]["Metadata"]["aws:asset:path"];

  runner.run_command_and_output(
    "api",
    [
      "sam",
      "local",
      "start-api",
      "--template",
      `./.cdk/cdk.out/${snythedApiTemplate}`,
      "--port",
      "3030",
      // "--warm-containers", // TODO: determine if this is helpful
      // "EAGER", // TODO: determine if this is helpful
    ],
    "."
  );
}

// run_fe_locally runs the frontend and its dependencies locally
// @ts-ignore
async function run_fe_locally(runner: LabeledProcessRunner) {
  await writeUiEnvFile("master", true);

  runner.run_command_and_output("ui", ["npm", "start"], "services/ui-src");
}

async function run_cdk_watch(options: { stage: string }) {
  const stage = options.stage;
  const runner = new LabeledProcessRunner();
  await prepare_services(runner);
  const watchCmd = [
    "cdk",
    "watch",
    "--context",
    `stage=${stage}`,
    "--no-rollback",
  ];
  await runner.run_command_and_output("CDK watch", watchCmd, ".");
}

async function run_local(options: { stage: string }) {
  run_cdk_watch(options);

  const runner = new LabeledProcessRunner();
  run_fe_locally(runner);
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

async function deploy(options: { stage: string }) {
  const stage = options.stage;
  const runner = new LabeledProcessRunner();
  await prepare_services(runner);
  const deployCmd = ["cdk", "deploy", "--context", `stage=${stage}`, "--all"];
  await runner.run_command_and_output("CDK deploy", deployCmd, ".");
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
    "run cdk watch",
    {
      stage: { type: "string", demandOption: true },
    },
    run_cdk_watch
  )
  .command(
    "local",
    "run cdk watch and react together",
    {
      stage: { type: "string", demandOption: true },
    },
    run_local
  )
  .command(
    "test",
    "run all tests",
    () => {},
    () => {
      console.log("Testing 1. 2. 3.");
    }
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
