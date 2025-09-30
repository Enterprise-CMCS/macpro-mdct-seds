import { Argv } from "yargs";
import { checkIfAuthenticated } from "../lib/sts.js";
import {
  CloudFormationClient,
  DescribeStacksCommand,
} from "@aws-sdk/client-cloudformation";
import { project, region } from "../lib/consts.js";
import downloadClamAvLayer from "../lib/clam.js";
import { runCommand } from "../lib/runner.js";
import { existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const uploadsStackPath = join(__dirname, "../../deployment/stacks/uploads.ts");
const shouldDownloadClamAvDefs = existsSync(uploadsStackPath);

const stackExists = async (stackName: string): Promise<boolean> => {
  const client = new CloudFormationClient({ region });
  try {
    await client.send(new DescribeStacksCommand({ StackName: stackName }));
    return true;
  } catch {
    return false;
  }
};

export const deploy = {
  command: "deploy",
  describe: "deploy the app with cdk to the cloud",
  builder: (yargs: Argv) => {
    return yargs.option("stage", { type: "string", demandOption: true });
  },
  handler: async (options: { stage: string }) => {
    await checkIfAuthenticated();

    if (await stackExists(`${project}-prerequisites`)) {
        await downloadClamAvLayer();

      await runCommand(
        "CDK deploy",
        [
          "yarn",
          "cdk",
          "deploy",
          "--context",
          `stage=${options.stage}`,
          "--method=direct",
          "--all",
        ],
        "."
      );
    } else {
      // TODO: FYI, I got this error when my internet connection was down, so we could improve the logic here.

      // TODO: FYI, I got this error when my AWS credentials were expired, so we could improve the logic here.
      console.error(
        "MISSING PREREQUISITE STACK! Must deploy it before attempting to deploy the application."
      );
    }
  },
};
