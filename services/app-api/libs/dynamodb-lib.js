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
import { logger } from "./debug-lib.js";

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
  batchWriteItem: async (params) =>
    await client.send(new BatchWriteCommand(params)),
};
