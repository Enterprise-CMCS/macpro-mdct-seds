import yargs from "yargs";
import "dotenv/config";
import { deploy } from "./commands/deploy";
import { deployPrerequisites } from "./commands/deploy-prerequisites";
import { destroy } from "./commands/destroy";
import { install, installDeps } from "./commands/install";
import { local } from "./commands/local";
import { updateEnv } from "./commands/update-env";
import { watch } from "./commands/watch";
import { deleteTopics } from "./commands/delete-topics";
import { listTopics } from "./commands/list-topics";
import { existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const topicsStackPath = join(__dirname, "../deployment/stacks/topics.ts");
const shouldIncludeTopicCommands = existsSync(topicsStackPath);

let yargsInstance = yargs(process.argv.slice(2))
  .middleware(async (argv) => {
    if (argv._.length > 0) {
      await installDeps();
    }
  })
  .command(deploy)
  .command(deployPrerequisites)
  .command(destroy)
  .command(install)
  .command(local)
  .command(updateEnv)
  .command(watch);

if (shouldIncludeTopicCommands) {
  yargsInstance = yargsInstance.command(deleteTopics).command(listTopics);
}

await yargsInstance.strict().scriptName("run").demandCommand(1, "").parse();
