// This file is managed by macpro-mdct-core so if you'd like to change it let's do it there
import { execFileSync } from "node:child_process";

export const waitForMiniStack = async (port: string) => {
  for (let i = 0; i < 60; i++) {
    try {
      const response = await fetch(`http://127.0.0.1:${port}/health`);
      if (!response.ok) {
        throw new Error(`MiniStack health returned ${response.status}`);
      }

      const health = (await response.json()) as {
        ready_scripts?: { status?: string };
      };
      if (health.ready_scripts?.status === "completed") {
        return;
      }
    } catch {
      // MiniStack can reject health requests while it is still starting.
    }

    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  throw "MiniStack needs to be running.";
};

export const restartMiniStackContainer = (containerName: string) => {
  console.log(
    `Restarting MiniStack container ${containerName} to clear stale CloudFormation stacks...`
  );
  execFileSync("docker", ["--context", "colima", "restart", containerName], {
    stdio: "inherit",
  });
};
