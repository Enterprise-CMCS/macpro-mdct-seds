import { Argv } from "yargs";
import { checkIfAuthenticated } from "../lib/sts";
import { runCommand } from "../lib/runner";
import { runFrontendLocally } from "../lib/utils";

export const watch = {
  command: "watch",
  describe: "run cdk watch and react together",
  builder: (yargs: Argv) => {
    return yargs.option("stage", { type: "string", demandOption: true });
  },
  handler: async (options: { stage: string }) => {
    checkIfAuthenticated();

    await Promise.all([
      runCommand(
        "CDK watch",
        [
          "yarn",
          "cdk",
          "watch",
          "--context",
          `stage=${options.stage}`,
          "--no-rollback",
        ],
        "."
      ),
      runFrontendLocally(options.stage),
    ]);
  },
};
