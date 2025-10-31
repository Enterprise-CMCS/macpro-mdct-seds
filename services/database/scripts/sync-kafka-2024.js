/* eslint-disable no-console */
/*
 *
 * Local:
 * DYNAMODB_URL="http://localhost:8000" dynamoPrefix="local" node services/database/scripts/sync-kafka-2024.js
 * Branch:
 * dynamoPrefix="YOUR BRANCH NAME" node services/database/scripts/sync-kafka-2024.js
 *
 * THE LOCAL OPTION IS NOW MORE COMPLICATED IT YOU NEED TO RUN THIS SCRIPT IN A LOCAL CONTEXT HERE'S A SPOT TO LOOK FOR SUGGESTIONS:
 * https://stackoverflow.com/questions/73294767/how-do-i-execute-a-shell-script-against-my-localstack-docker-container-after-it
 */

const { buildDynamoClient, scan, update } = require("./utils/dynamodb.js");

const isLocal = !!process.env.DYNAMODB_URL;
const stageName = isLocal ? "local" : process.env.dynamoPrefix;
const lastModifiedField = "last_modified";

const tables = ["-form-answers", "-form-questions", "-state-forms"];
const syncTime = new Date().toISOString();

async function handler() {
  try {
    console.log("Searching for 2024 modifications");

    buildDynamoClient();

    for (const table of tables) {
      const tableName = stageName + table;
      console.log(`Processing table ${tableName}`);
      const existingItems = await scan({
        TableName: tableName,
      });
      const filteredItems = filter(existingItems);
      const transformedItems = await transform(filteredItems);
      await update(tableName, transformedItems);
    }
    console.debug("Data fix complete");

    return {
      statusCode: 200,
      body: "All done!",
    };
  } catch (err) {
    console.error(err);
    return {
      statusCode: 500,
      body: err.message,
    };
  }
}

function filter(items) {
  return items.filter(
    (item) => new Date(item[lastModifiedField]).getFullYear() === 2024
  );
}

async function transform(items) {
  // Touch sync field only
  const transformed = items.map((item) => {
    const corrected = { ...item, ...{ lastSynced: syncTime } };
    return corrected;
  });

  return transformed;
}

handler();
