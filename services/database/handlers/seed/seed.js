const { PutCommand } = require("@aws-sdk/lib-dynamodb");
const { buildDynamoClient } = require("../../utils/dynamodb.js");

/**
 * Custom handler for seeding deployed environments with required data.
 * Simple functionality to add required section base templates to each branch
 */
async function myHandler(_event, _context, _callback) {
  if (process.env.seedData !== "true") {
    console.log("Seed data not enabled for environment, skipping.");
    return;
  }
  console.log("Seeding Tables...");

  const { tables } = require("./tables");

  for (const table of tables) {
    await runSeed(table);
  }

  console.log("Seed Finished");
}

/**
 * @param {{
 *  filenames: string[];
 *  tableNameSuffix: string;
 * }} seedInstructions
 */
const runSeed = async (seedInstructions) => {
  const { filenames, tableNameSuffix } = seedInstructions;
  const dynamoClient = buildDynamoClient();
  for (const filename of filenames) {
    const TableName = `${process.env.dynamoPrefix}-${tableNameSuffix}`;
    if (!filenames || filenames <= 0) continue;
    const items = require(filename);
    if (!items || items.length <= 0) continue;

    try {
      for (const Item of items) {
        await dynamoClient.send(new PutCommand({ TableName, Item }));
      }
    } catch (e) {
      console.log(` -- ERROR UPLOADING ${TableName}\n`, e);
    }
  }
};

exports.handler = myHandler;
