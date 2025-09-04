import { runCommand } from "../lib/runner.js";

const directories = [
  "./tests/cypress",
  "./nightwatch",
  "./services/app-api",
  "./services/ui",
  "./services/database",
  "./services/stream-functions",
  "./services/ui-auth",
  "./services/ui-src",
  "./services/ui-waf-log-assoc",
  "./services/ui-waflog-s3-bucket",
];

export const install = {
  command: "install",
  describe: "install all project dependencies",
  handler: async () => {
    await runCommand(
      "yarn install root",
      ["yarn", "install", "--frozen-lockfile"],
      "."
    );

    for (const dir of directories) {
      await runCommand(
        `yarn install ${dir}`,
        ["yarn", "install", "--frozen-lockfile"],
        dir
      );
    }
  },
};
