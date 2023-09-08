module.exports = (on, config) => {
  config.baseUrl = process.env.APPLICATION_ENDPOINT || "http://localhost:3000";

  return config;
};

const preprocessor = require("@badeball/cypress-cucumber-preprocessor");

module.exports = async (on, config) => {
  await preprocessor.addCucumberPreprocessorPlugin(on, config);
};
