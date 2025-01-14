import yargs from "yargs";
import * as dotenv from "dotenv";
import LabeledProcessRunner from "./runner.js";
import { ServerlessStageDestroyer } from "@stratiformdigital/serverless-stage-destroyer";
import {
  getAllStacksForStage,
  getCloudFormationTemplatesForStage,
} from "./getCloudFormationTemplatesForStage.js";
import { execSync } from "child_process";

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
  await runner.run_command_and_output(
    "db svls doc",
    ["serverless", "doctor"],
    "services/database"
  );
  runner.run_command_and_output(
    "db",
    [
      "serverless",
      "offline",
      "start",
      "--stage",
      "local",
      "--lambdaPort",
      "3003",
    ],
    "services/database"
  );
  runner.run_command_and_output(
    "db",
    ["serverless", "dynamodb", "start", "--stage=local"],
    "services/database"
  );
  await new Promise((res) => setTimeout(res, 10 * 1000)); // The above runners need to all finish, not all can be awaited, they block
  await runner.run_command_and_output(
    "db",
    [
      "aws",
      "lambda",
      "invoke",
      "/dev/null",
      "--endpoint-url",
      "http://localhost:3003",
      "--function-name",
      "database-local-seed",
    ],
    "services/database"
  );
}

// run_api_locally uses the serverless-offline plugin to run the api lambdas locally
// @ts-ignore
async function run_api_locally(runner: LabeledProcessRunner) {
  await runner.run_command_and_output(
    "api deps",
    ["yarn", "install"],
    "services/app-api"
  );
  await runner.run_command_and_output(
    "api svls doc",
    ["serverless", "doctor"],
    "services/app-api"
  );
  runner.run_command_and_output(
    "api",
    [
      "serverless",
      "offline",
      "start",
      "--stage",
      "local",
      "--region",
      "us-east-1",
      "--httpPort",
      "3030",
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
  await runner.run_command_and_output(
    "ui svls doc",
    ["serverless", "doctor"],
    "services/ui-src"
  );
  await runner.run_command_and_output(
    "ui conf",
    ["./env.sh", "local"],
    "services/ui-src"
  );

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
  const deployCmd = ["sls", "deploy", "--stage", stage];
  await runner.run_command_and_output("Serverless deploy", deployCmd, ".");
}

async function destroy_stage(options: {
  stage: string;
  service: string | undefined;
  wait: boolean;
  verify: boolean;
}) {
  let destroyer = new ServerlessStageDestroyer();
  let filters = [
    {
      Key: "PROJECT",
      Value: `${process.env.PROJECT}`,
    },
  ];
  if (options.service) {
    filters.push({
      Key: "SERVICE",
      Value: `${options.service}`,
    });
  }

  const stacks = await getAllStacksForStage(
    `${process.env.REGION_A}`,
    options.stage,
    filters
  );

  const protectedStacks = stacks
    .filter((i) => i.EnableTerminationProtection)
    .map((i) => i.StackName);

  if (protectedStacks.length > 0) {
    console.log(
      `We cannot proceed with the destroy because the following stacks have termination protection enabled:\n${protectedStacks.join(
        "\n"
      )}`
    );
  } else {
    console.log(
      "No stacks have termination protection enabled. Proceeding with the destroy."
    );
  }

  const templates = await getCloudFormationTemplatesForStage(
    `${process.env.REGION_A}`,
    options.stage,
    filters
  );

  const resourcesToCheck = [
    {
      templateKey: `database-${options.stage}`,
      resourceKey: "FormAnswersTable",
    },
    {
      templateKey: `database-${options.stage}`,
      resourceKey: "FormQuestionsTable",
    },
    {
      templateKey: `database-${options.stage}`,
      resourceKey: "FormTemplatesTable",
    },
    { templateKey: `database-${options.stage}`, resourceKey: "FormsTable" },
    {
      templateKey: `database-${options.stage}`,
      resourceKey: "StateFormsTable",
    },
    { templateKey: `database-${options.stage}`, resourceKey: "StatesTable" },
    { templateKey: `database-${options.stage}`, resourceKey: "AuthUserTable" },
    {
      templateKey: `ui-${options.stage}`,
      resourceKey: "CloudFrontDistribution",
    },
    { templateKey: `ui-auth-${options.stage}`, resourceKey: "CognitoUserPool" },
  ];

  const notRetained = resourcesToCheck.filter(
    ({ templateKey, resourceKey }) => {
      const policy =
        templates?.[templateKey]?.Resources?.[resourceKey]?.DeletionPolicy;
      return policy !== "Retain";
    }
  );

  if (
    ["master", "val", "production"].includes(options.stage) &&
    notRetained.length > 0
  ) {
    console.log(
      "Will not destroy the stage because its an important stage and some important resources are not yet set to be retained:"
    );
    notRetained.forEach(({ templateKey, resourceKey }) =>
      console.log(` - ${templateKey}/${resourceKey}`)
    );
    return;
  }

  await destroyer.destroy(`${process.env.REGION_A}`, options.stage, {
    wait: options.wait,
    filters: filters,
    verify: options.verify,
  });
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
    "deploy the app with serverless compose to the cloud",
    {
      stage: { type: "string", demandOption: true },
    },
    deploy
  )
  .command(
    "destroy",
    "destroy serverless stage",
    {
      stage: { type: "string", demandOption: true },
      service: { type: "string", demandOption: false },
      wait: { type: "boolean", demandOption: false, default: true },
      verify: { type: "boolean", demandOption: false, default: true },
    },
    destroy_stage
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
