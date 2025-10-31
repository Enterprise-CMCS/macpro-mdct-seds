// This magic comment extends vite's TS definitions to include vitest's too.
/// <reference types="vitest/config" />
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import viteTsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  base: "/",
  plugins: [react(), viteTsconfigPaths()],
  server: {
    open: true,
    port: 3000
  },
  define: {
    global: "globalThis"
  },
  build: {
    outDir: "./build"
  },
  resolve: {
    alias: [
      {
        // this is required for the SCSS modules
        find: /^~(.*)$/,
        replacement: "$1"
      }
    ]
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
          { projectRoot: "../.." }
        ],
        // Print a table of each file's coverage to the terminal
        ["text"],
        // Print a table of overall coverage to the terminal
        ["text-summary"]
      ]
    }
  }
});
