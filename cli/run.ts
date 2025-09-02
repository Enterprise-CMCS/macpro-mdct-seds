import yargs from "yargs";
import * as dotenv from "dotenv";
import { deploy } from "./commands/deploy.js";
import { deployPrerequisites } from "./commands/deploy-prerequisites.js";
import { destroy } from "./commands/destroy.js";
import { install } from "./commands/install.js";
import { local } from "./commands/local.js";
import { updateEnv } from "./commands/update-env.js";
import { watch } from "./commands/watch.js";

// load .env
dotenv.config();

yargs(process.argv.slice(2))
  .command(deploy)
  .command(deployPrerequisites)
  .command(destroy)
  .command(install)
  .command(local)
  .command(updateEnv)
  .command(watch)
  .strict()
  .scriptName("run")
  .demandCommand(1, "") // TODO: should this be this .demandCommand(1, "").argv;
  .parse(); // TODO: is this parse command necessary?
