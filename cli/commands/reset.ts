// This file is managed by macpro-mdct-core so if you'd like to change it let's do it there
import { runCommand } from "../lib/runner.ts";
import { updateEnvFiles } from "./update-env.ts";

const miniStackContainerName =
  process.env.MINISTACK_CONTAINER_NAME ??
  `${process.env.PROJECT ?? "seds"}-ministack-local`;

export const reset = {
  command: "reset",
  describe:
    "Reset the local development environment by cleaning up CDK resources and preparing MiniStack for a fresh start",
  handler: async () => {
    await updateEnvFiles();

    try {
      await runCommand(
        "Stop MiniStack",
        ["docker", "--context", "colima", "rm", "-f", miniStackContainerName],
        "."
      );
    } catch {
      // if MiniStack is already stopped, don't throw
    }
    await runCommand("Stop colima", ["colima", "stop"], ".");
    await runCommand("Delete colima", ["colima", "delete", "--force"], ".");
  },
};
