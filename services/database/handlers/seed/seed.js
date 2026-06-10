const fs = require("node:fs");
const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { BatchWriteCommand } = require("@aws-sdk/lib-dynamodb");
const { DynamoDBDocumentClient } = require("@aws-sdk/lib-dynamodb");
const path = require("node:path");

/**
 * Custom handler for seeding deployed environments with required data.
 * Simple functionality to add required section base templates to each branch
 */
async function myHandler() {
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
  const dynamoClient = DynamoDBDocumentClient.from(
    new DynamoDBClient({ region: "us-east-1" })
  );
  for (const filename of filenames) {
    const TableName = `${process.env.dynamoPrefix}-${tableNameSuffix}`;
    if (!filenames || filenames <= 0) continue;
    const items = JSON.parse(
      fs.readFileSync(path.join(__dirname, filename), "utf8")
    );
    if (!items || items.length <= 0) continue;

    try {
      for (let i = 0; i < items.length; i += 25) {
        const response = await dynamoClient.send(
          new BatchWriteCommand({
            RequestItems: {
              [TableName]: items
                .slice(i, i + 25)
                .map((Item) => ({ PutRequest: { Item } })),
            },
          })
        );
        if (response.UnprocessedItems?.[TableName]?.length > 0) {
          throw new Error("Failed to process some items - see logs");
        }
      }
    } catch (error) {
      console.log(` -- ERROR UPLOADING ${TableName}\n`, error);
    }
  }
};

exports.handler = myHandler;
