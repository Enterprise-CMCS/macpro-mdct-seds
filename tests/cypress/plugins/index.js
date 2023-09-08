module.exports = (on, config) => {
  config.baseUrl = process.env.APPLICATION_ENDPOINT || "http://localhost:3000";

  return config;
};

const preprocessor = require("@badeball/cypress-cucumber-preprocessor");
const browserify = require("@badeball/cypress-cucumber-preprocessor/browserify");

module.exports = async (on, config) => {
  await preprocessor.addCucumberPreprocessorPlugin(on, config);
  on("file:preprocessor", browserify.default(config));
};
