import yargs from "yargs";
import "dotenv/config";
import { deploy } from "./commands/deploy";
import { deployPrerequisites } from "./commands/deploy-prerequisites";
import { destroy } from "./commands/destroy";
import { install, installDeps } from "./commands/install";
import { local } from "./commands/local";
import { updateEnv } from "./commands/update-env";
import { watch } from "./commands/watch";

await yargs(process.argv.slice(2))
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
  .command(watch)
  .strict()
  .scriptName("run")
  .demandCommand(1, "")
  .parse();
