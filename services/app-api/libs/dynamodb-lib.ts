import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  BatchWriteCommand,
  DeleteCommand,
  DeleteCommandInput,
  DynamoDBDocumentClient,
  GetCommand,
  GetCommandInput,
  paginateQuery,
  PutCommand,
  PutCommandInput,
  QueryCommandInput,
  ScanCommand,
  ScanCommandInput,
  UpdateCommand,
  UpdateCommandInput,
} from "@aws-sdk/lib-dynamodb";
import { logger } from "./debug-lib.ts";

const awsConfig = {
  region: "us-east-1",
  logger,
  endpoint: process.env.AWS_ENDPOINT_URL,
};

const client = DynamoDBDocumentClient.from(new DynamoDBClient(awsConfig));

export default {
  get: async (params: GetCommandInput) =>
    await client.send(new GetCommand(params)),
  update: async (params: UpdateCommandInput) =>
    await client.send(new UpdateCommand(params)),
  delete: async (params: DeleteCommandInput) =>
    await client.send(new DeleteCommand(params)),
  query: async (params: Omit<QueryCommandInput, "ExclusiveStartKey">) => {
    let items: Record<string, any>[] = [];
    for await (let page of paginateQuery({ client }, params)) {
      items = items.concat(page.Items ?? []);
    }
    return { Items: items, Count: items.length };
  },
  put: async (params: PutCommandInput) =>
    await client.send(new PutCommand(params)),
  scan: async (params: Omit<ScanCommandInput, "ExclusiveStartKey">) => {
    let items: Record<string, any>[] = [];
    let ExclusiveStartKey;

    do {
      const command: ScanCommand = new ScanCommand({
        ...params,
        ExclusiveStartKey,
      });
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
   * @param keySelector - Given an item, select its identifier.
   *                      Used for exception logging purposes.
   */
  putMultiple: async <T extends object>(
    tableName: string,
    items: T[],
    keySelector: (item: T) => string
  ) => {
    /** DynamoDB only allows this many items in a single BatchWriteCommand */
    const MAX_BATCH_SIZE = 25;
    for (let i = 0; i < items.length; i += MAX_BATCH_SIZE) {
      const batch = items.slice(i, i + MAX_BATCH_SIZE);
      const command = new BatchWriteCommand({
        RequestItems: {
          [tableName]: batch.map((item) => ({
            PutRequest: {
              Item: item,
            },
          })),
        },
      });
      const response = await client.send(command);
      if (response.UnprocessedItems?.[tableName]?.length) {
        const unprocessedIds = response.UnprocessedItems[tableName]
          .map((req) => keySelector(req.PutRequest!.Item as T))
          .join(", ");
        throw new Error(`Failed to insert item(s): [${unprocessedIds}]`);
      }
    }
  },
};
