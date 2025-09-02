import { execSync } from "child_process";

function updateEnvFiles() {
  try {
    execSync("op inject --in-file .env.tpl --out-file .env --force", {
      stdio: "inherit",
    });
    execSync("sed -i '' -e 's/# pragma: allowlist secret//g' .env");
  } catch {
    console.error("Failed to update .env files using 1Password CLI.");
    process.exit(1);
  }
}

export const updateEnv = {
  command: "update-env",
  describe: "update environment variables using 1Password",
  handler: async () => updateEnvFiles(),
};
