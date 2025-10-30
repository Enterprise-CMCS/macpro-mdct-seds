/* eslint-disable no-console */
const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const {
  DynamoDBDocumentClient,
  paginateScan,
  PutCommand,
} = require("@aws-sdk/lib-dynamodb");

/*
 * ENVIRONMENT VARIABLES TO SET:
 * AuthUserTable: the name of the table in Dynamo
 */
const { AuthUserTable } = process.env;

const logger = {
  debug: () => {},
  info: console.info,
  warn: console.warn,
  error: console.error,
};

const awsConfig = {
  region: "us-east-1",
  logger,
};

const client = DynamoDBDocumentClient.from(new DynamoDBClient(awsConfig));

(async function () {
  let scannedCount = 0;
  let updatedCount = 0;
  console.log("Scanning...");
  for await (let page of paginateScan(
    { client },
    { TableName: AuthUserTable }
  )) {
    if (!page.Items) continue;
    for (let user of page.Items) {
      scannedCount += 1;
      if (!("isActive" in user)) continue;

      delete user.isActive;
      await client.send(
        new PutCommand({
          TableName: AuthUserTable,
          Item: user,
        })
      );

      updatedCount += 1;
    }
  }
  console.log(`Scanned ${scannedCount} total users`);
  console.log(`Found ${updatedCount} users in need of update`);
  console.log("All updates successful");
})();
