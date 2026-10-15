import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import path from "node:path";

export const stackport = {
  command: "stackport",
  describe:
    "open StackPort against local MiniStack (requires macpro-mdct-tools)",
  handler: async () => {
    const toolsRoot =
      process.env.MDCT_TOOLS_DIR ??
      path.join(process.env.HOME ?? "", "Projects/macpro-mdct-tools");
    const launcher = path.join(toolsRoot, "scripts/run-stackport.sh");
    if (!existsSync(launcher)) {
      throw new Error(
        `StackPort launcher not found at ${launcher}. Ensure macpro-mdct-tools/apps/stackport is present.`
      );
    }

    await new Promise<void>((resolve, reject) => {
      const child = spawn(launcher, [], {
        stdio: "inherit",
        env: { ...process.env },
      });
      child.on("error", reject);
      child.on("exit", (code) => {
        if (code === 0 || code === null) resolve();
        else reject(new Error(`StackPort exited with code ${code}`));
      });
    });
  },
};
