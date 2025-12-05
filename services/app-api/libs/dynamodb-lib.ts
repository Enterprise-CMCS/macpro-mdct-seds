import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  BatchWriteCommand,
  DeleteCommand,
  DynamoDBDocumentClient,
  GetCommand,
  PutCommand,
  QueryCommand,
  ScanCommand,
  UpdateCommand,
} from "@aws-sdk/lib-dynamodb";
import { logger } from "./debug-lib.ts";

const awsConfig = {
  region: "us-east-1",
  logger,
  endpoint: process.env.AWS_ENDPOINT_URL,
};

const client = DynamoDBDocumentClient.from(new DynamoDBClient(awsConfig));

export default {
  get: async (params) => await client.send(new GetCommand(params)),
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
  /**
   * Attempt to insert all of the given items into the given table,
   * breaking up into multiple requests as necessary.
   *
   * If any item fails, an exception is thrown; this function does not retry.
   * DynamoDB is so reliable that any failure is likely to be on our end,
   * rather than some transient failure that retry logic could paper over.
   * @param {string} tableName
   * @param {Object[]} items
   * @param {Function} keySelector - Given an item, select its identifier.
   *   Used for exception logging purposes.
   */
  putMultiple: async (tableName, items, keySelector) => {
    /** DynamoDB only allows this many items in a single BatchWriteCommand */
    const MAX_BATCH_SIZE = 25;
    for (let i = 0; i < items.length; i += MAX_BATCH_SIZE) {
      const batch = items.slice(i, i + MAX_BATCH_SIZE);
      const command = new BatchWriteCommand({
        RequestItems: {
          [tableName]: batch.map(item => ({
            PutRequest: {
              Item: item
            }
          }))
        }
      });
      const response = await client.send(command);
      if (response.UnprocessedItems?.[tableName]?.length > 0) {
        const unprocessedIds = response.UnprocessedItems[tableName]
          .map(req => keySelector(req.PutRequest.Item))
          .join(", ");
        throw new Error(`Failed to insert item(s): [${unprocessedIds}]`);
      }
    }
  },
};
