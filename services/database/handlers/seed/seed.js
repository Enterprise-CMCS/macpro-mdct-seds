/**
 * Custom handler for seeding deployed environments with required data.
 * Simple functionality to add required section base templates to each branch
 *
 * @param {*} event
 * @param {*} context
 * @param {*} callback
 */

// eslint-disable-next-line no-unused-vars
async function myHandler(event, context, callback) {
  if (process.env.seedData !== "true") {
    // eslint-disable-next-line no-console
    console.log("Seed data not enabled for environemt, skipping.");
    return;
  }
  // eslint-disable-next-line no-console
  console.log("Seeding Tables");

  const buildRunner = require("./services/seedRunner");
  const seedRunner = buildRunner();
  const { tables } = require("./tables/index");

  for (const table of tables) {
    await seedRunner.executeSeed(table);
  }

  // eslint-disable-next-line no-console
  console.log("Seed Finished");
}

exports.handler = myHandler;
