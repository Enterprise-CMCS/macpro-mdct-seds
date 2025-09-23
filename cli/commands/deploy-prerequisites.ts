import { runCommand } from "../lib/runner";
import { checkIfAuthenticated } from "../lib/sts";

export const deployPrerequisites = {
  command: "deploy-prerequisites",
  describe: "deploy the app's AWS account prerequisites with cdk to the cloud",
  handler: async () => {
    await checkIfAuthenticated();
    await runCommand(
      "CDK prerequisite deploy",
      [
        "yarn",
        "cdk",
        "deploy",
        "--app",
        '"npx tsx deployment/prerequisites.ts"',
      ],
      "."
    );
  },
};
