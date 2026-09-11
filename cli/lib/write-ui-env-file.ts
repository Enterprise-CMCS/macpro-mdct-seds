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
const uiSrcDirPath = path.resolve(
  path.join(__dirname, "../../services/ui-src")
);
const proxyConfigFilePath = path.resolve(
  path.join(uiSrcDirPath, "local-api-proxy.json")
);

export interface LocalApiProxyConfig {
  gatewayEndpoint: string;
  apiBasePath: string;
}

export const writeLocalApiProxyConfig = async (config: LocalApiProxyConfig) => {
  await fs.writeFile(proxyConfigFilePath, JSON.stringify(config, null, 2));
};

export const writeLocalUiEnvFile = async (
  envVariables: Record<string, string>
) => {
  await fs.rm(configFilePath, { force: true });

  const envConfigContent = [
    "window._env_ = {",
    ...Object.entries(envVariables).map(
      ([key, value]) => `  ${key}: "${value}",`
    ),
    "};",
  ].join("\n");

  await fs.writeFile(configFilePath, envConfigContent);
};
