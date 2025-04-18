import { defineConfig, configDefaults } from "vitest/config";

export default defineConfig({
  test: {
    setupFiles: "setupTests.js",
    exclude: [
      ...configDefaults.exclude, // Ignore tests found in node_modules, etc
      ".build/**", // Also ignore the .js files generated by Typescript
    ],
    coverage: {
      reporter: [
        [
          // Generate machine-readable coverage files for Code Climate
          "lcov",
          // filepaths in the lcov report should start with services/app-api
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
