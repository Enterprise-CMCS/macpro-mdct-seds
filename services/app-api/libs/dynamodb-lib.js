import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  BatchWriteCommand,
  DeleteCommand,
  DynamoDBDocumentClient,
  PutCommand,
  QueryCommand,
  ScanCommand,
  UpdateCommand,
} from "@aws-sdk/lib-dynamodb";
import { logger } from "./debug-lib";

const localConfig = {
  endpoint: process.env.DYNAMODB_URL,
  region: "localhost",
  credentials: {
    accessKeyId: "LOCALFAKEKEY", // pragma: allowlist secret
    secretAccessKey: "LOCALFAKESECRET", // pragma: allowlist secret
  },
  logger,
};

const awsConfig = {
  region: "us-east-1",
  logger,
};

export const getConfig = () => {
  return process.env.DYNAMODB_URL ? localConfig : awsConfig;
};

const client = DynamoDBDocumentClient.from(new DynamoDBClient(getConfig()));

const batchRequestHadAnyFailures = (result) => {
  if (!result.UnprocessedItems) {
    return false;
  }

  return Object.values(result.UnprocessedItems).some(
    (failureList) => failureList.length > 0
  );
};

const buildBatchRequestErrorMessage = (params, result) => {
  let errorMessage = "Some items in the batch request were not processed:";

  for (let [tableName, failedRequests] of Object.entries(
    result.UnprocessedItems
  )) {
    if (failedRequests.length === 0) {
      continue;
    }

    let failedCount = failedRequests.length;
    let attemptedCount = params.RequestItems[tableName].length;

    errorMessage += `\n  ${tableName}: ${failedCount} (of ${attemptedCount}) requests failed`;
  }

  return errorMessage;
};

export default {
  update: async (params) => await client.send(new UpdateCommand(params)),
  delete: async (params) => await client.send(new DeleteCommand(params)),
  query: async (params) => await client.send(new QueryCommand(params)),
  put: async (params) => await client.send(new PutCommand(params)),
  scan: async (params) => {
    let items = [];
    let ExclusiveStartKey;

    do {
      const command = new ScanCommand({ ...params, ExclusiveStartKey });
      const result = await client.send(command);
      items = items.concat(result.Items ?? []);
      ExclusiveStartKey = result.LastEvaluatedKey;
    } while (ExclusiveStartKey);

    return { Items: items, Count: items.length };
  },
  scanMapToSet: async (params, mapFunction) => {
    let itemSet = new Set();
    let ExclusiveStartKey;
    do {
      const command = new ScanCommand({ ...params, ExclusiveStartKey });
      const result = await client.send(command);
      if (!result.Items) continue;

      itemSet = new Set([
        ...itemSet,
        ...result.Items.map((x) => mapFunction(x)),
      ]);

      ExclusiveStartKey = result.LastEvaluatedKey;
    } while (ExclusiveStartKey);
    return itemSet;
  },
  batchWriteItem: async (params) =>
    await client.send(new BatchWriteCommand(params)),
};
