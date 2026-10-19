// This magic comment extends vite's TS definitions to include vitest's too.
/// <reference types="vitest/config" />
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const uiSrcDir = path.dirname(fileURLToPath(import.meta.url));
const localApiProxyConfigPath = path.join(uiSrcDir, "local-api-proxy.json");

const buildLocalApiProxy = () => {
  if (!existsSync(localApiProxyConfigPath)) {
    return {};
  }

  const { gatewayEndpoint, apiBasePath } = JSON.parse(
    readFileSync(localApiProxyConfigPath, "utf8")
  ) as { gatewayEndpoint: string; apiBasePath: string };

  return {
    "/local-api": {
      target: gatewayEndpoint,
      changeOrigin: true,
      rewrite: (requestPath: string) =>
        requestPath.replace(/^\/local-api/, apiBasePath),
    },
  };
};

export default defineConfig({
  base: "/",
  plugins: [react()],
  server: {
    open: true,
    port: 3000,
    proxy: buildLocalApiProxy(),
  },
  define: {
    global: "globalThis",
  },
  build: {
    outDir: "./build",
  },
  resolve: {
    tsconfigPaths: true,
    alias: [
      {
        // this is required for the SCSS modules
        find: /^~(.*)$/,
        replacement: "$1",
      },
    ],
  },
  test: {
    root: "src",
    setupFiles: "setupTests.js",
    environment: "jsdom",
    coverage: {
      exclude: ["provider-mocks/*"],
      /*
       * The default coverage directory is "<root>/coverage",
       * but we want to output to ui-src/coverage instead.
       */
      reportsDirectory: "../coverage",
      reporter: [
        [
          // Generate machine-readable coverage files for Code Climate
          "lcov",
          // filepaths in the lcov report should start with services/ui-src
          { projectRoot: "../.." },
        ],
        // Print a table of each file's coverage to the terminal
        ["text"],
        // Print a table of overall coverage to the terminal
        ["text-summary"],
      ],
    },
  },
});
