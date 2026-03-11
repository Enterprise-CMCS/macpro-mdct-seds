const webpack = require("@cypress/webpack-preprocessor");
const preprocessor = require("@badeball/cypress-cucumber-preprocessor");

// oxlint-disable-next-line no-anonymous-default-export
module.exports = async (on, config) => {
  await preprocessor.addCucumberPreprocessorPlugin(on, config);

  on("before:browser:launch", (browser = {}, launchOptions) => {
    if (browser.name === "chrome" && browser.isHeadless) {
      launchOptions.args.push("--headless=old");
    }
    return launchOptions;
  });

  on(
    "file:preprocessor",
    webpack({
      webpackOptions: {
        resolve: {
          extensions: [".ts", ".js"],
        },
        module: {
          rules: [
            {
              test: /\.feature$/,
              use: [
                {
                  loader: "@badeball/cypress-cucumber-preprocessor/webpack",
                  options: config,
                },
              ],
            },
          ],
        },
      },
    })
  );
  return config;
};
