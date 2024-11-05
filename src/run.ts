import yargs from "yargs";
import * as dotenv from "dotenv";
import LabeledProcessRunner from "./runner.js";
import { execSync } from "child_process";
import * as readlineSync from "readline-sync";
import {
  CloudFormationClient,
  DeleteStackCommand,
  waitUntilStackDeleteComplete,
} from "@aws-sdk/client-cloudformation";
import path from "path";
import { writeUiEnvFile } from "./write-ui-env-file.js";
import {
  CloudFrontClient,
  CreateInvalidationCommand,
} from "@aws-sdk/client-cloudfront";
import { GetParameterCommand, SSMClient } from "@aws-sdk/client-ssm";
import { fileURLToPath } from "url";
import { dirname } from "path";
import { InvokeCommand, LambdaClient } from "@aws-sdk/client-lambda";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

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

function confirmDestroyCommand(stack: string) {
  const orange = "\x1b[38;5;208m";
  const reset = "\x1b[0m";

  const confirmation = readlineSync.question(`
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
    execSync("op inject -i .env.tpl -o .env -f", { stdio: "inherit" });
    execSync("sed -i '' -e 's/# pragma: allowlist secret//g' .env");
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
      "-port",
      "8000",
    ],
    "services/database/.dynamodb"
  );
  await new Promise((res) => setTimeout(res, 8 * 1000)); // The above runners need to all finish, not all can be awaited, they block
  await runner.run_command_and_output(
    "db-invoke",
    ["serverless", "invoke", "local", "--function", "seed", "--stage", "local"],
    "services/database"
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

  await runner.run_command_and_output(
    "api synth",
    [
      "cdk",
      "synth",
      // "--no-staging" // TODO: determine if this is helpful
    ],
    "services/app-api"
  );

  runner.run_command_and_output(
    "api",
    [
      "sam",
      "local",
      "start-api",
      // "--template", // TODO: determine if this is helpful
      // "./cdk.out/AppApiStack.template.json", // TODO: determine if this is helpful
      "--port",
      "3030",
      // "--warm-containers", // TODO: determine if this is helpful
      // "EAGER", // TODO: determine if this is helpful
    ],
    "services/app-api"
  );
}

// run_fe_locally runs the frontend and its dependencies locally
// @ts-ignore
async function run_fe_locally(runner: LabeledProcessRunner) {
  await runner.run_command_and_output(
    "ui deps",
    ["yarn", "install"],
    "services/ui-src"
  );

  await writeUiEnvFile("local");

  runner.run_command_and_output("ui", ["npm", "start"], "services/ui-src");
}

// run_all_locally runs all of our services locally
async function run_all_locally() {
  const runner = new LabeledProcessRunner();

  run_db_locally(runner);
  run_api_locally(runner);
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
  const deployCmd = ["cdk", "deploy", "-c", `stage=${stage}`, "--all"];
  await runner.run_command_and_output("CDK deploy", deployCmd, ".");

  await runner.run_command_and_output(
    "build react app",
    ["yarn", "run", "build"],
    "services/ui-src"
  );

  await writeUiEnvFile(options.stage);

  const {
    s3BucketName,
    cloudfrontDistributionId,
    bootstrapUsersFunctionName,
    seedDataFunctionName,
  } = JSON.parse(
    (
      await new SSMClient({ region: "us-east-1" }).send(
        new GetParameterCommand({
          Name: `/${project}/${options.stage}/deployment-output`,
        })
      )
    ).Parameter!.Value!
  );

  if (bootstrapUsersFunctionName) {
    const client = new LambdaClient({ region });
    const command = new InvokeCommand({
      FunctionName: bootstrapUsersFunctionName,
    });
    await client.send(command);
  }

  if (seedDataFunctionName) {
    const client = new LambdaClient({ region });
    const command = new InvokeCommand({
      FunctionName: seedDataFunctionName,
    });
    await client.send(command);
  }

  if (!s3BucketName || !cloudfrontDistributionId) {
    throw new Error("Missing necessary CloudFormation exports");
  }

  console.log(s3BucketName, cloudfrontDistributionId);

  const buildDir = path.join(__dirname, "../../services/ui-src", "build");

  try {
    execSync(`find ${buildDir} -type f -exec touch -t 202001010000 {} +`);
  } catch (error) {
    console.error("Failed to set fixed timestamps:", error);
  }

  // There's a mime type issue when aws s3 syncing files up
  // Empirically, this issue never presents itself if the bucket is cleared just before.
  // Until we have a neat way of ensuring correct mime types, we'll remove all files from the bucket.
  await runner.run_command_and_output(
    "",
    ["aws", "s3", "rm", `s3://${s3BucketName}/`, "--recursive"],
    "."
  );
  await runner.run_command_and_output(
    "copy react app to s3 bucket",
    ["aws", "s3", "sync", buildDir, `s3://${s3BucketName}/`],
    "."
  );

  const cloudfrontClient = new CloudFrontClient({
    region,
  });
  const invalidationParams = {
    DistributionId: cloudfrontDistributionId,
    InvalidationBatch: {
      CallerReference: `${Date.now()}`,
      Paths: {
        Quantity: 1,
        Items: ["/*"],
      },
    },
  };
  await cloudfrontClient.send(
    new CreateInvalidationCommand(invalidationParams)
  );

  console.log(
    `Deployed UI to S3 bucket ${s3BucketName} and invalidated CloudFront distribution ${cloudfrontDistributionId}`
  );
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
  .command("local", "run system locally", {}, () => {
    run_all_locally();
  })
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
