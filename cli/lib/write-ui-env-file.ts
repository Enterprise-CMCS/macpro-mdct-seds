// This file is managed by macpro-mdct-core so if you'd like to change it let's do it there
import path, { dirname } from "node:path";
import { promises as fs } from "node:fs";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const publicDirPath = path.resolve(
  path.join(__dirname, "../../services/ui-src/public/")
);
const configFilePath = path.resolve(path.join(publicDirPath, "env-config.js"));

type LocalUiEnvFileOptions = {
  devServerPort?: string;
  proxyPort?: string;
};

export const writeLocalUiEnvFile = async (
  envVariables: Record<string, string>,
  options: LocalUiEnvFileOptions = {}
) => {
  await fs.rm(configFilePath, { force: true });

  const envConfigContent = [
    "window._env_ = {",
    ...Object.entries(envVariables).map(
      ([key, value]) => `  ${key}: "${value}",`
    ),
    "};",
    ...localDevServerRedirect(options),
  ].join("\n");

  await fs.writeFile(configFilePath, envConfigContent);
};

const localDevServerRedirect = ({
  devServerPort,
  proxyPort,
}: LocalUiEnvFileOptions) => {
  if (!devServerPort || !proxyPort) {
    return [];
  }

  return [
    "",
    "if (",
    '  ["localhost", "127.0.0.1"].includes(window.location.hostname) &&',
    `  window.location.port === ${JSON.stringify(devServerPort)}`,
    ") {",
    "  const redirectUrl = new URL(window.location.href);",
    `  redirectUrl.port = ${JSON.stringify(proxyPort)};`,
    "  window.location.replace(redirectUrl.href);",
    "}",
  ];
};
